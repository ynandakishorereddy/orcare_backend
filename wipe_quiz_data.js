require('dotenv').config();
const mongoose = require('mongoose');

const wipeData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/My_APP');
    console.log('Connected to MongoDB to wipe data.');
    
    // Drop the quizzes collection if it exists
    await mongoose.connection.db.dropCollection('quizzes').catch(e => console.log('Quizzes collection already empty or missing.'));
    
    console.log('Quiz scores wiped from database.');
    process.exit();
  } catch (error) {
    console.error('Error wiping data:', error);
    process.exit(1);
  }
};

wipeData();
