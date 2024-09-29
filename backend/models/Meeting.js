const mongoose= require('mongoose');

const MeetingSchema = new mongoose.Schema({
    title: { type: String },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  roomId: { type: String , required: true },
  
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  
  chatHistory: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      username: String,
      timestamp: Date
    }
  ],
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed'], // Define the status types
  },
  startDate: {
    type: String,
  },
  startTime: {
    type: String,
  },
}, { timestamps: true });

const Meeting= mongoose.model('Meeting', MeetingSchema);
module.exports = Meeting;
