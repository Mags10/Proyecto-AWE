const mongoose = require('mongoose');

const connectDB = async () => {
  const connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/monorepo';

  try {
    await mongoose.connect(connectionString);
    console.log('Database connected');
  } catch (err) {
    console.log('Database connection error:');
    console.log(err);
    throw err;
  }
};

module.exports = connectDB;
