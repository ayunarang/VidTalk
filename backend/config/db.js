
const mongoose = require('mongoose');
require('dotenv').config();


const mongoDb=async()=>{
    try {
        await mongoose.connect(process.env.DB_URL);
        // console.log('Database working successfully');
       
      } catch (error) {
        console.error('Error connecting to the database:', error.message);
      }
}

module.exports= mongoDb;