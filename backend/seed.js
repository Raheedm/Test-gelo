const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://minerbitcoin003:AD2OScP3FIZQLSCH@cluster0.la4l4mq.mongodb.net/findpeople?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas for seeding');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

// Mock user data with coordinates near a central location (San Francisco as example)
const mockUsers = [
    {
        username: 'raheed_muz',
        password: 'password123',
        name: 'Raheed Muzawar',
        contact: '+91 7020 322320',
        bio: 'Software developer who loves hiking and coffee',
        location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.001, // Within ~50m
            longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date()
        },
        isOnline: true
    },
    {
        username: 'sarah_wilson',
        password: 'password123',
        name: 'Sarah Wilson',
        contact: '+1-555-0102',
        bio: 'Designer and photographer exploring the city',
        location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date()
        },
        isOnline: true
    },
    {
        username: 'mike_chen',
        password: 'password123',
        name: 'Mike Chen',
        contact: '+1-555-0103',
        bio: 'Foodie and travel enthusiast',
        location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date()
        },
        isOnline: true
    },
    {
        username: 'emma_davis',
        password: 'password123',
        name: 'Emma Davis',
        contact: '+1-555-0104',
        bio: 'Yoga instructor and wellness coach',
        location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date()
        },
        isOnline: true
    },
    {
        username: 'alex_rodriguez',
        password: 'password123',
        name: 'Alex Rodriguez',
        contact: '+1-555-0105',
        bio: 'Musician and music producer',
        location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date()
        },
        isOnline: true
    },
    {
        username: 'lisa_park',
        password: 'password123',
        name: 'Lisa Park',
        contact: '+1-555-0106',
        bio: 'Marketing professional and book lover',
        location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date()
        },
        isOnline: true
    },
    {
        username: 'david_kim',
        password: 'password123',
        name: 'David Kim',
        contact: '+1-555-0107',
        bio: 'Startup founder and tech enthusiast',
        location: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
            lastUpdated: new Date()
        },
        isOnline: true
    }
];

async function seedDatabase() {
    try {
        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Insert mock users one by one to trigger password hashing
        const users = [];
        for (const userData of mockUsers) {
            const user = new User(userData);
            await user.save();
            users.push(user);
        }
        console.log(`Created ${users.length} mock users:`);

        users.forEach(user => {
            console.log(`- ${user.name} (@${user.username}) at ${user.location.latitude.toFixed(6)}, ${user.location.longitude.toFixed(6)}`);
        });

        console.log('\nDatabase seeded successfully!');
        console.log('You can now login with any of these credentials:');
        console.log('Username: raheed_muz, Password: password123');
        console.log('Username: sarah_wilson, Password: password123');
        console.log('etc...');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();