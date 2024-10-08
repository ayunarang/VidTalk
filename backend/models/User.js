const mongoose= require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },  
  meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }], 

  notes: [{ 
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }, 
    note: { type: String }, 
    timestamp: { type: Date, default: Date.now }
  }], 
}, { timestamps: true });

const User= mongoose.model('User', UserSchema);
module.exports = User;
