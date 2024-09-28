import connectToDatabase from '@/pages/utils/db'; 
import User from '@/pages/models/User';
import Meeting from '@/pages/models/Meeting'; 
export default async function handler(req, res) {
  await connectToDatabase();
  const { userId } = req.query;

  try {
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const meetings = await Meeting.find({
      $or: [
        { host: userId },
        { participants: userId }
      ]
    })
    .populate('host') 
    .populate('participants') 
    .sort({ createdAt: -1 }) 
    .limit(10); 
    

    res.status(200).json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching meetings' });
  }
}
