// Test the notification categorization logic
const testTypes = ['negotiation_offer', 'negotiation_response', 'message', 'other'];

console.log('🧪 Testing frontend categorization logic:');
testTypes.forEach(type => {
  const category = type.includes('negotiation') ? 'offers' : 'messages';
  console.log(`   "${type}" -> "${category}"`);
});

// Test the filtering logic
const testItems = [
  { title: 'Test Offer', category: 'offers', type: 'notification' },
  { title: 'Test Message', category: 'messages', type: 'message' }
];

console.log('\n🧪 Testing filtering logic:');
['all', 'offers', 'messages'].forEach(activeCategory => {
  const filtered = testItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );
  console.log(`   Active category: "${activeCategory}" -> ${filtered.length} items`);
  filtered.forEach(item => console.log(`     - ${item.title} (${item.category})`));
});
