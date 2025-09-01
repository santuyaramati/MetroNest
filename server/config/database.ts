import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/metronest';

export const connectDatabase = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', MONGODB_URI);

    const connection = await mongoose.connect(MONGODB_URI);

    console.log(`MongoDB Connected: ${connection.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    return connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('MongoDB connection failed - running in fallback mode');
    console.log('To use MongoDB, please:');
    console.log('1. Install MongoDB locally or use MongoDB Atlas');
    console.log('2. Set MONGODB_URI environment variable');
    console.log('3. Restart the server');

    // Don't exit the process, just continue without MongoDB
    return null;
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};
