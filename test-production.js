const axios = require('axios');

// Test production deployment
async function testProduction() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  
  console.log(`🧪 Testing production deployment at: ${baseUrl}`);
  
  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${baseUrl}/`);
    console.log('✅ Server is running:', healthResponse.data.message);
    
    // Test 2: Registration
    console.log('\n2️⃣ Testing user registration...');
    const testUser = {
      username: 'prodtest_' + Date.now(),
      password: 'TestPass123!',
      name: 'Production Test User',
      contact: '+1-555-PROD',
      bio: 'Testing production deployment'
    };
    
    const registerResponse = await axios.post(`${baseUrl}/api/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.user.username);
    const token = registerResponse.data.token;
    
    // Test 3: Login
    console.log('\n3️⃣ Testing login...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.user.name);
    
    // Test 4: Protected route (profile)
    console.log('\n4️⃣ Testing protected route...');
    const profileResponse = await axios.get(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile access successful:', profileResponse.data.name);
    
    // Test 5: Location update
    console.log('\n5️⃣ Testing location update...');
    const locationResponse = await axios.post(`${baseUrl}/api/location/update`, {
      latitude: 37.7749,
      longitude: -122.4194
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Location update successful');
    
    // Test 6: Nearby users
    console.log('\n6️⃣ Testing nearby users...');
    const nearbyResponse = await axios.get(`${baseUrl}/api/users/nearby`, {
      params: { latitude: 37.7749, longitude: -122.4194, radius: 50 },
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${nearbyResponse.data.length} nearby users`);
    
    console.log('\n🎉 All tests passed! Production deployment is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    process.exit(1);
  }
}

// Usage: node test-production.js [base-url]
// Example: node test-production.js https://your-domain.com
testProduction();