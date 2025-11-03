const FinancialTransaction = require('../models/FinancialTransaction');

/**
 * Finance Integration Service
 * Automatically creates financial transactions from various payment sources
 */

class FinanceIntegrationService {
  /**
   * Record membership payment as income
   * @param {Object} membership - Membership object with payment details
   * @param {Object} user - User who made the payment
   * @returns {Promise<Object>} Created financial transaction
   */
  static async recordMembershipPayment(membership, user) {
    try {
      const transaction = new FinancialTransaction({
        type: 'income',
        category: 'Membership Dues',
        description: `Membership payment - ${membership.tier?.name || 'N/A'} tier for ${user.username || user.email}`,
        amount: membership.totalAmount || membership.amount || 0,
        date: membership.paymentDate || membership.startDate || new Date(),
        paymentMethod: membership.paymentMethod || 'credit_card',
        status: membership.paymentStatus === 'paid' ? 'completed' : 'pending',
        referenceNumber: membership.transactionId || membership._id.toString(),
        payer: user.username || user.email,
        notes: `Automated entry from membership system. Membership ID: ${membership._id}`,
        createdBy: user._id
      });

      await transaction.save();
      console.log(`✅ Recorded membership payment: $${transaction.amount} from ${transaction.payer}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording membership payment:', error);
      throw error;
    }
  }

  /**
   * Record application fee as income
   * @param {Object} application - Application object with fee details
   * @param {Object} applicant - User/applicant who paid
   * @param {Number} feeAmount - Application fee amount
   * @returns {Promise<Object>} Created financial transaction
   */
  static async recordApplicationFee(application, applicant, feeAmount) {
    try {
      const transaction = new FinancialTransaction({
        type: 'income',
        category: 'Registration Fees',
        description: `Application fee - ${application.role || 'Unknown'} application from ${applicant.name || applicant.email}`,
        amount: feeAmount,
        date: application.paymentDate || application.submittedAt || new Date(),
        paymentMethod: application.paymentMethod || 'credit_card',
        status: application.paymentStatus === 'paid' ? 'completed' : 'pending',
        referenceNumber: application.transactionId || application._id.toString(),
        payer: applicant.name || applicant.email,
        notes: `Automated entry from application system. Application ID: ${application._id}`,
        createdBy: applicant._id || application.userId
      });

      await transaction.save();
      console.log(`✅ Recorded application fee: $${transaction.amount} from ${transaction.payer}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording application fee:', error);
      throw error;
    }
  }

  /**
   * Record registration fee as income
   * @param {Object} registration - Registration object with fee details
   * @param {Object} user - User who registered
   * @param {Number} feeAmount - Registration fee amount
   * @returns {Promise<Object>} Created financial transaction
   */
  static async recordRegistrationFee(registration, user, feeAmount) {
    try {
      const transaction = new FinancialTransaction({
        type: 'income',
        category: 'Registration Fees',
        description: `Registration fee for ${user.username || user.email}`,
        amount: feeAmount,
        date: registration.registrationDate || new Date(),
        paymentMethod: registration.paymentMethod || 'credit_card',
        status: registration.paymentStatus === 'paid' ? 'completed' : 'pending',
        referenceNumber: registration.transactionId || registration._id.toString(),
        payer: user.username || user.email,
        notes: `Automated entry from registration system. Registration ID: ${registration._id}`,
        createdBy: user._id
      });

      await transaction.save();
      console.log(`✅ Recorded registration fee: $${transaction.amount} from ${transaction.payer}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording registration fee:', error);
      throw error;
    }
  }

  /**
   * Record sponsorship payment as income
   * @param {Object} sponsor - Sponsor object
   * @param {String} paymentMethod - Payment method used
   * @returns {Promise<Object>} Created financial transaction
   */
  static async recordSponsorshipPayment(sponsor, paymentMethod = 'bank_transfer') {
    try {
      const transaction = new FinancialTransaction({
        type: 'income',
        category: 'Sponsorships',
        description: `Sponsorship payment from ${sponsor.companyName} - ${sponsor.tier} tier`,
        amount: sponsor.amount || 0,
        date: new Date(),
        paymentMethod: paymentMethod,
        status: sponsor.status === 'Active' ? 'completed' : 'pending',
        referenceNumber: sponsor._id.toString(),
        payer: sponsor.companyName,
        notes: `Automated entry from sponsorship system. ${sponsor.paymentFrequency} payment. Contract: ${sponsor.contractStart ? new Date(sponsor.contractStart).toLocaleDateString() : 'N/A'} - ${sponsor.contractEnd ? new Date(sponsor.contractEnd).toLocaleDateString() : 'N/A'}`,
        createdBy: sponsor.createdBy
      });

      await transaction.save();
      console.log(`✅ Recorded sponsorship payment: $${transaction.amount} from ${transaction.payer}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording sponsorship payment:', error);
      throw error;
    }
  }

  /**
   * Record tournament/event fee as income
   * @param {Object} event - Event object
   * @param {Object} participant - Participant who paid
   * @param {Number} feeAmount - Fee amount
   * @returns {Promise<Object>} Created financial transaction
   */
  static async recordEventFee(event, participant, feeAmount) {
    try {
      const transaction = new FinancialTransaction({
        type: 'income',
        category: 'Tournament Fees',
        description: `${event.title || 'Event'} registration fee from ${participant.name || participant.email}`,
        amount: feeAmount,
        date: participant.registrationDate || new Date(),
        paymentMethod: participant.paymentMethod || 'credit_card',
        status: participant.paymentStatus === 'paid' ? 'completed' : 'pending',
        referenceNumber: participant.transactionId || participant._id.toString(),
        payer: participant.name || participant.email,
        notes: `Automated entry from event registration. Event: ${event.title}, Date: ${event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}`,
        createdBy: participant.userId || event.createdBy
      });

      await transaction.save();
      console.log(`✅ Recorded event fee: $${transaction.amount} from ${transaction.payer}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording event fee:', error);
      throw error;
    }
  }

  /**
   * Record donation as income
   * @param {Object} donation - Donation object
   * @returns {Promise<Object>} Created financial transaction
   */
  static async recordDonation(donation) {
    try {
      const transaction = new FinancialTransaction({
        type: 'income',
        category: 'Donations',
        description: `Donation from ${donation.donorName || donation.donorEmail}${donation.message ? ' - ' + donation.message.substring(0, 50) : ''}`,
        amount: donation.amount || 0,
        date: donation.donationDate || new Date(),
        paymentMethod: donation.paymentMethod || 'credit_card',
        status: donation.status === 'completed' ? 'completed' : 'pending',
        referenceNumber: donation.transactionId || donation._id.toString(),
        payer: donation.donorName || donation.donorEmail,
        notes: `Automated entry from donation system. ${donation.isAnonymous ? 'Anonymous donation' : ''}`,
        createdBy: donation.userId
      });

      await transaction.save();
      console.log(`✅ Recorded donation: $${transaction.amount} from ${transaction.payer}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording donation:', error);
      throw error;
    }
  }

  /**
   * Record invoice payment as income
   * @param {Object} invoice - Invoice object with payment details
   * @param {Object} payment - Payment details
   * @returns {Promise<Object>} Created financial transaction
   */
  static async recordInvoicePayment(invoice, payment) {
    try {
      const transaction = new FinancialTransaction({
        type: 'income',
        category: invoice.category || 'Other Income',
        description: `Invoice #${invoice.invoiceNumber} payment from ${invoice.clientName}`,
        amount: payment.amount || invoice.total || 0,
        date: payment.paymentDate || new Date(),
        paymentMethod: payment.method || 'bank_transfer',
        status: 'completed',
        referenceNumber: payment.transactionId || invoice.invoiceNumber,
        payer: invoice.clientName,
        notes: `Automated entry from invoicing system. Invoice ID: ${invoice._id}`,
        createdBy: invoice.createdBy
      });

      await transaction.save();
      console.log(`✅ Recorded invoice payment: $${transaction.amount} from ${transaction.payer}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording invoice payment:', error);
      throw error;
    }
  }

  /**
   * Record merchandise/equipment sale as income
   * @param {Object} order - Order object
   * @param {Object} customer - Customer who made purchase
   * @returns {Promise<Object>} Created financial transaction
   */
  static async recordMerchandiseSale(order, customer) {
    try {
      const transaction = new FinancialTransaction({
        type: 'income',
        category: 'Merchandise Sales',
        description: `Merchandise order #${order.orderNumber || order._id} from ${customer.name || customer.email}`,
        amount: order.total || 0,
        date: order.orderDate || new Date(),
        paymentMethod: order.paymentMethod || 'credit_card',
        status: order.paymentStatus === 'paid' ? 'completed' : 'pending',
        referenceNumber: order.transactionId || order.orderNumber || order._id.toString(),
        payer: customer.name || customer.email,
        notes: `Automated entry from merchandise system. ${order.items?.length || 0} items.`,
        createdBy: customer._id
      });

      await transaction.save();
      console.log(`✅ Recorded merchandise sale: $${transaction.amount} from ${transaction.payer}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording merchandise sale:', error);
      throw error;
    }
  }

  /**
   * Record refund as expense
   * @param {Object} originalTransaction - Original income transaction being refunded
   * @param {Object} refundDetails - Refund details
   * @returns {Promise<Object>} Created financial transaction for refund
   */
  static async recordRefund(originalTransaction, refundDetails) {
    try {
      const transaction = new FinancialTransaction({
        type: 'expense',
        category: 'Refunds',
        description: `Refund for: ${originalTransaction.description}`,
        amount: refundDetails.amount || originalTransaction.amount,
        date: refundDetails.refundDate || new Date(),
        paymentMethod: originalTransaction.paymentMethod,
        status: 'completed',
        referenceNumber: refundDetails.refundId || `REFUND-${originalTransaction.referenceNumber}`,
        payee: originalTransaction.payer,
        notes: `Automated refund entry. Original transaction: ${originalTransaction.referenceNumber}. Reason: ${refundDetails.reason || 'Not specified'}`,
        createdBy: refundDetails.processedBy
      });

      await transaction.save();
      
      // Update original transaction status
      if (originalTransaction._id) {
        await FinancialTransaction.findByIdAndUpdate(originalTransaction._id, {
          status: 'refunded',
          notes: `${originalTransaction.notes || ''}\nRefunded on ${new Date().toLocaleDateString()}. Refund transaction: ${transaction._id}`
        });
      }

      console.log(`✅ Recorded refund: $${transaction.amount} to ${transaction.payee}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error recording refund:', error);
      throw error;
    }
  }

  /**
   * Get automated transaction statistics
   * @returns {Promise<Object>} Statistics about automated transactions
   */
  static async getAutomatedTransactionStats() {
    try {
      const automatedTransactions = await FinancialTransaction.find({
        notes: { $regex: /Automated entry/i }
      });

      const stats = {
        total: automatedTransactions.length,
        totalAmount: automatedTransactions.reduce((sum, t) => {
          return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0),
        byCategory: {},
        recent: automatedTransactions.slice(0, 10)
      };

      automatedTransactions.forEach(t => {
        if (!stats.byCategory[t.category]) {
          stats.byCategory[t.category] = { count: 0, amount: 0 };
        }
        stats.byCategory[t.category].count++;
        stats.byCategory[t.category].amount += t.amount;
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting automated transaction stats:', error);
      throw error;
    }
  }
}

module.exports = FinanceIntegrationService;

