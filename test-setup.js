#!/usr/bin/env node

const http = require('http');
const mongoose = require('mongoose');

console.log('🧪 Testing Find People Near You Setup...\n');

// Test MongoDB connection
async function testMongoDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/findpeople', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connection: SUCCESS');
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ MongoDB connection: FAILED');
    console.log('   Make sure MongoDB is running:');
    console.log('   brew services start mongodb/brew/mongodb-community');
    return false;
  }
  return true;
}

// Test backend server
function testBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      console.log('✅ Backend server: RUNNING');
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Backend server: NOT RUNNING');
      console.log('   Start with: cd backend && npm run dev');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('❌ Backend server: TIMEOUT');
      resolve(false);
    });
  });
}

// Test frontend server
function testFrontend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:4200', (res) => {
      console.log('✅ Frontend server: RUNNING');
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Frontend server: NOT RUNNING');
      console.log('   Start with: cd frontend && npm start');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('❌ Frontend server: TIMEOUT');
      resolve(false);
    });
  });
}

async function runTests() {
  const mongoOk = await testMongoDB();
  const backendOk = await testBackend();
  const frontendOk = await testFrontend();
  
  console.log('\n📊 Test Results:');
  console.log(`MongoDB: ${mongoOk ? '✅' : '❌'}`);
  console.log(`Backend: ${backendOk ? '✅' : '❌'}`);
  console.log(`Frontend: ${frontendOk ? '✅' : '❌'}`);
  
  if (mongoOk && backendOk && frontendOk) {
    console.log('\n🎉 All systems ready! Visit http://localhost:4200');
    console.log('👤 Login with: raheed_muz / password123');
  } else {
    console.log('\n⚠️  Some services need attention. Check the messages above.');
  }
}

runTests();