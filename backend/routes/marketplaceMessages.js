const express = require('express');
const router = express.Router();
const { auth: authenticateToken } = require('./auth');
const MarketplaceMessage = require('../models/MarketplaceMessage');
const MarketplaceItem = require('../models/MarketplaceItem');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all conversations for the current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await MarketplaceMessage.getUserConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all marketplace messages for the current user
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const messages = await MarketplaceMessage.find({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    })
    .populate('sender', 'username name email')
    .populate('recipient', 'username name email')
    .populate('item', 'title price images')
    .sort({ createdAt: -1 })
    .limit(50); // Limit to recent 50 messages

    res.json(messages);
  } catch (error) {
    console.error('Error fetching user marketplace messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { itemId, recipientId, messageType, content, offerAmount } = req.body;
    
    if (!itemId || !recipientId || !messageType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Content is optional for offers (can be empty string)
    const messageContent = content || (messageType === 'offer' ? 'No message provided' : '');
    
    // Prevent sending message to self - compare as strings
    const senderId = String(req.user.id || req.user._id);
    const recipientIdStr = String(recipientId);
    
    console.log('🔍 Sender check:', {
      senderId: senderId,
      recipientId: recipientIdStr,
      isSame: senderId === recipientIdStr
    });
    
    if (senderId === recipientIdStr) {
      console.error('❌ Attempted to send message to self');
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    
    const item = await MarketplaceItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if this is a counter offer (seller responding to a buyer's offer)
    let actualMessageType = messageType;
    let notificationType = 'negotiation_offer';
    let notificationTitle = 'New Offer Received';
    let notificationMessage = '';
    let originalOfferId = null;
    
    if (messageType === 'offer' && offerAmount) {
      // Check if there are existing offers from the sender to the recipient for this item
      // This detects when someone is responding to an existing offer
      const existingOffer = await MarketplaceMessage.findOne({
        item: itemId,
        sender: req.user.id,
        recipient: recipientId,
        messageType: { $in: ['offer', 'counter_offer'] },
        status: 'pending'
      }).sort({ createdAt: -1 });
      
      // Also check if there are offers from recipient to sender (original offer)
      const originalOffer = await MarketplaceMessage.findOne({
        item: itemId,
        sender: recipientId,
        recipient: req.user.id,
        messageType: { $in: ['offer', 'counter_offer'] },
        status: 'pending'
      }).sort({ createdAt: -1 });
      
      console.log('🔍 Counter offer detection:', {
        itemId,
        sender: req.user.id,
        recipient: recipientId,
        messageType,
        offerAmount,
        existingOffer: existingOffer ? {
          id: existingOffer._id,
          amount: existingOffer.offerAmount,
          createdAt: existingOffer.createdAt
        } : null,
        originalOffer: originalOffer ? {
          id: originalOffer._id,
          amount: originalOffer.offerAmount,
          createdAt: originalOffer.createdAt
        } : null
      });
      
      if (originalOffer) {
        // This is a counter offer - there's an original offer from recipient to sender
        actualMessageType = 'counter_offer';
        notificationType = 'negotiation_counter_offer';
        notificationTitle = 'Counter Offer Received';
        originalOfferId = originalOffer.originalOfferId || originalOffer._id;
        console.log('✅ Detected as counter offer!');
      } else {
        console.log('❌ Not detected as counter offer - no original offer found');
      }
    }
    
    const message = new MarketplaceMessage({
      item: itemId,
      sender: req.user.id,
      recipient: recipientId,
      messageType: actualMessageType,
      content: messageContent,
      offerAmount: offerAmount || null,
      originalOfferId: originalOfferId
    });
    
    await message.save();
    await message.populate('sender', 'username');
    await message.populate('recipient', 'username');
    await message.populate('item', 'title price');
    
    // Create notification for the recipient
    if (actualMessageType === 'offer' || actualMessageType === 'counter_offer') {
      const sender = await User.findById(req.user.id);
      const recipient = await User.findById(recipientId);
      
      if (actualMessageType === 'counter_offer') {
        notificationMessage = `${sender.username} made a counter offer of $${offerAmount} on your item "${item.title}"`;
      } else {
        notificationMessage = `${sender.username} made an offer of $${offerAmount} on your item "${item.title}"`;
      }
      
      await Notification.createNotification(
        recipientId,
        req.user.id,
        notificationType,
        notificationTitle,
        notificationMessage,
        itemId,
        null,
        {
          offerAmount: offerAmount,
          senderName: sender.username,
          message: messageContent,
          itemTitle: item.title,
          itemPrice: item.price
        }
      );
    }
    
    console.log('📤 Response:', {
      actualMessageType,
      notificationType,
      notificationTitle,
      messageId: message._id
    });
    
    res.status(201).json({ 
      message: 'Message sent successfully', 
      data: message,
      debug: {
        actualMessageType,
        notificationType,
        notificationTitle
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await MarketplaceMessage.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single message by ID
router.get('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await MarketplaceMessage.findById(messageId)
      .populate('item', 'title price images')
      .populate('sender', 'name username email')
      .populate('recipient', 'name username email');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is either sender or recipient
    if (message.sender._id.toString() !== req.user.id && message.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation between users for an item
router.get('/conversation/:itemId/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const { itemId, otherUserId } = req.params;
    const conversation = await MarketplaceMessage.getConversation(itemId, req.user.id, otherUserId);
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active offers for an item (by simpleId or ObjectId)
router.get('/offers/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find item by simpleId or ObjectId
    let item;
    if (itemId.length === 7 && /^[A-Z0-9]+$/.test(itemId)) {
      item = await MarketplaceItem.findOne({ simpleId: itemId });
    } else {
      item = await MarketplaceItem.findById(itemId);
    }
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const offers = await MarketplaceMessage.getActiveOffers(item._id);
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all offers for an item (including accepted/rejected for history)
router.get('/offers/:itemId/all', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find item by simpleId or ObjectId
    let item;
    if (itemId.length === 7 && /^[A-Z0-9]+$/.test(itemId)) {
      item = await MarketplaceItem.findOne({ simpleId: itemId });
    } else {
      item = await MarketplaceItem.findById(itemId);
    }
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const allOffers = await MarketplaceMessage.find({
      item: item._id,
      messageType: { $in: ['offer', 'counter_offer'] }
    })
    .populate('sender', 'username firstName lastName simpleId')
    .populate('recipient', 'username firstName lastName simpleId')
    .populate('item', 'title price images simpleId')
    .sort({ createdAt: -1 });
    
    res.json(allOffers);
  } catch (error) {
    console.error('Error fetching all offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all offers made by the current user across all items
router.get('/my-offers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const myOffers = await MarketplaceMessage.find({
      sender: userId,
      messageType: { $in: ['offer', 'counter_offer'] }
    })
    .populate('sender', 'username firstName lastName simpleId')
    .populate('recipient', 'username firstName lastName simpleId')
    .populate('item', 'title price images simpleId seller')
    .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${myOffers.length} offers for user ${userId}`);
    res.json(myOffers);
  } catch (error) {
    console.error('Error fetching user offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all purchases (accepted offers) for the current user
router.get('/my-purchases', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const purchases = await MarketplaceMessage.find({
      sender: userId,
      messageType: { $in: ['offer', 'counter_offer'] },
      status: 'accepted'
    })
    .populate('sender', 'username firstName lastName simpleId')
    .populate('recipient', 'username firstName lastName simpleId')
    .populate('item', 'title price images simpleId seller')
    .sort({ updatedAt: -1 });
    
    console.log(`🛍️ Found ${purchases.length} purchases for user ${userId}`);
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all completed sales (where I'm the seller and buyer marked as received)
router.get('/my-sales', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const sales = await MarketplaceMessage.find({
      recipient: userId,
      messageType: { $in: ['offer', 'counter_offer'] },
      status: 'accepted',
      markedAsReceived: true
    })
    .populate('sender', 'username firstName lastName simpleId')
    .populate('recipient', 'username firstName lastName simpleId')
    .populate('item', 'title price images simpleId')
    .sort({ receivedAt: -1 });
    
    console.log(`💰 Found ${sales.length} completed sales for seller ${userId}`);
    res.json(sales);
  } catch (error) {
    console.error('Error fetching seller sales:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get negotiation chain for an offer
router.get('/negotiation-chain/:offerId', authenticateToken, async (req, res) => {
  try {
    const { offerId } = req.params;
    const chain = await MarketplaceMessage.getNegotiationChain(offerId);
    res.json(chain);
  } catch (error) {
    console.error('Error fetching negotiation chain:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept an offer
router.post('/accept/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await MarketplaceMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Check if user is the recipient (seller) - compare as strings
    const recipientId = String(message.recipient);
    const userId = String(req.user.id || req.user._id);
    
    console.log('🔐 [Accept] Authorization check:', {
      recipientId: recipientId,
      userId: userId,
      isAuthorized: recipientId === userId
    });
    
    if (recipientId !== userId) {
      console.error('❌ [Accept] Not authorized - user is not the recipient');
      return res.status(403).json({ message: 'Not authorized to accept this offer' });
    }
    
    // Check if offer is still pending
    if (message.status !== 'pending') {
      return res.status(400).json({ message: 'Offer is no longer pending' });
    }
    
    await message.acceptOffer();
    
    // Create notification for the buyer
    const buyer = await User.findById(message.sender);
    const seller = await User.findById(req.user.id);
    const item = await MarketplaceItem.findById(message.item);
    
    await Notification.createNotification(
      message.sender,
      req.user.id,
      'offer_accepted',
      'Offer Accepted!',
      `${seller.username} accepted your offer of $${message.offerAmount} for "${item.title}"`,
      message.item,
      null,
      {
        offerAmount: message.offerAmount,
        sellerName: seller.username,
        itemTitle: item.title,
        itemPrice: item.price
      }
    );
    
    res.json({ message: 'Offer accepted successfully' });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject an offer
router.post('/reject/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;
    
    const message = await MarketplaceMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Check if user is the recipient (seller) - compare as strings
    const recipientId = String(message.recipient);
    const userId = String(req.user.id || req.user._id);
    
    console.log('🔐 [Reject] Authorization check:', {
      recipientId: recipientId,
      userId: userId,
      isAuthorized: recipientId === userId
    });
    
    if (recipientId !== userId) {
      console.error('❌ [Reject] Not authorized - user is not the recipient');
      return res.status(403).json({ message: 'Not authorized to reject this offer' });
    }
    
    // Check if offer is still pending
    if (message.status !== 'pending') {
      return res.status(400).json({ message: 'Offer is no longer pending' });
    }
    
    await message.rejectOffer();
    
    // Create notification for the buyer
    const buyer = await User.findById(message.sender);
    const seller = await User.findById(req.user.id);
    const item = await MarketplaceItem.findById(message.item);
    
    await Notification.createNotification(
      message.sender,
      req.user.id,
      'offer_rejected',
      'Offer Declined',
      `${seller.username} declined your offer of $${message.offerAmount} for "${item.title}"${reason ? `: ${reason}` : ''}`,
      message.item,
      null,
      {
        offerAmount: message.offerAmount,
        sellerName: seller.username,
        itemTitle: item.title,
        reason: reason || 'No reason provided'
      }
    );
    
    res.json({ message: 'Offer rejected successfully' });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark offer as received (buyer confirms they got the item)
router.post('/mark-received/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await MarketplaceMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Check if user is the sender (buyer)
    const senderId = String(message.sender);
    const userId = String(req.user.id || req.user._id);
    
    if (senderId !== userId) {
      return res.status(403).json({ message: 'Only the buyer can mark item as received' });
    }
    
    // Check if offer was accepted
    if (message.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only mark accepted offers as received' });
    }
    
    message.markedAsReceived = true;
    message.receivedAt = new Date();
    await message.save();
    
    // Create notification for the seller
    const buyer = await User.findById(req.user.id);
    const seller = await User.findById(message.recipient);
    const item = await MarketplaceItem.findById(message.item);
    
    await Notification.createNotification(
      message.recipient,
      req.user.id,
      'transaction_completed',
      'Transaction Completed',
      `${buyer.username} confirmed they received "${item.title}". You can now rate each other!`,
      message.item,
      null,
      {
        offerAmount: message.offerAmount,
        buyerName: buyer.username,
        buyerId: message.sender,
        itemTitle: item.title,
        offerId: message._id
      }
    );
    
    res.json({ message: 'Item marked as received successfully' });
  } catch (error) {
    console.error('Error marking as received:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw an offer
router.post('/withdraw/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await MarketplaceMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Check if user is the sender (buyer)
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to withdraw this offer' });
    }
    
    // Check if offer is still pending
    if (message.status !== 'pending') {
      return res.status(400).json({ message: 'Offer is no longer pending' });
    }
    
    message.status = 'withdrawn';
    message.isActive = false;
    await message.save();
    
    // Create notification for the seller
    const buyer = await User.findById(req.user.id);
    const seller = await User.findById(message.recipient);
    const item = await MarketplaceItem.findById(message.item);
    
    await Notification.createNotification(
      message.recipient,
      req.user.id,
      'offer_withdrawn',
      'Offer Withdrawn',
      `${buyer.username} withdrew their offer of $${message.offerAmount} for "${item.title}"`,
      message.item,
      null,
      {
        offerAmount: message.offerAmount,
        buyerName: buyer.username,
        itemTitle: item.title
      }
    );
    
    res.json({ message: 'Offer withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a counter offer
router.put('/:messageId/accept', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await MarketplaceMessage.findById(messageId)
      .populate('item', 'title price seller')
      .populate('sender', 'name username email')
      .populate('recipient', 'name username email');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the recipient of the counter offer
    if (message.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if this is a counter offer
    if (message.messageType !== 'counter_offer') {
      return res.status(400).json({ message: 'This is not a counter offer' });
    }
    
    // Update message status to accepted
    message.status = 'accepted';
    message.read = true;
    message.readAt = new Date();
    await message.save();
    
    // Create a new message to confirm acceptance
    const acceptanceMessage = new MarketplaceMessage({
      item: message.item._id,
      sender: req.user.id,
      recipient: message.sender._id,
      messageType: 'accept',
      content: `I accept your counter offer of $${message.offerAmount}. Let's proceed with the purchase.`,
      offerAmount: message.offerAmount,
      status: 'accepted'
    });
    
    await acceptanceMessage.save();
    
    // Create notification for the seller
    const Notification = require('../models/Notification');
    await Notification.createNotification(
      message.sender._id,
      req.user.id,
      'offer_accepted',
      'Counter Offer Accepted!',
      `${req.user.username || req.user.name} accepted your counter offer of $${message.offerAmount} for "${message.item.title}"`,
      message.item._id,
      null,
      {
        offerAmount: message.offerAmount,
        messageId: acceptanceMessage._id
      }
    );
    
    console.log(`✅ Counter offer accepted: ${messageId}`);
    res.json({ 
      message: 'Counter offer accepted successfully',
      acceptanceMessage 
    });
    
  } catch (error) {
    console.error('Error accepting counter offer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to a counter offer with another counter offer
router.post('/:messageId/counter', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { offerAmount, content } = req.body;
    
    if (!offerAmount || offerAmount <= 0) {
      return res.status(400).json({ message: 'Valid offer amount is required' });
    }
    
    const originalMessage = await MarketplaceMessage.findById(messageId)
      .populate('item', 'title price seller')
      .populate('sender', 'name username email')
      .populate('recipient', 'name username email');
    
    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }
    
    // Check if user is the recipient of the counter offer
    if (originalMessage.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if this is a counter offer
    if (originalMessage.messageType !== 'counter_offer') {
      return res.status(400).json({ message: 'This is not a counter offer' });
    }
    
    // Mark original message as read
    originalMessage.read = true;
    originalMessage.readAt = new Date();
    await originalMessage.save();
    
    // Create a new counter offer message
    const counterMessage = new MarketplaceMessage({
      item: originalMessage.item._id,
      sender: req.user.id,
      recipient: originalMessage.sender._id,
      messageType: 'counter_offer',
      content: content || `Counter offer: $${offerAmount}`,
      offerAmount: offerAmount,
      status: 'pending',
      originalOfferId: originalMessage._id
    });
    
    await counterMessage.save();
    
    // Create notification for the seller
    const Notification = require('../models/Notification');
    await Notification.createNotification(
      originalMessage.sender._id,
      req.user.id,
      'negotiation_counter_offer',
      'Counter Offer Received',
      `${req.user.username || req.user.name} made a counter offer of $${offerAmount} on your item "${originalMessage.item.title}"`,
      originalMessage.item._id,
      null,
      {
        offerAmount: offerAmount,
        messageId: counterMessage._id,
        originalOfferAmount: originalMessage.offerAmount
      }
    );
    
    console.log(`✅ Counter offer response sent: ${counterMessage._id}`);
    res.json({ 
      message: 'Counter offer sent successfully',
      counterMessage 
    });
    
  } catch (error) {
    console.error('Error sending counter offer response:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
