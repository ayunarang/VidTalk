import connectToDatabase from '@/pages/utils/db';
import Meeting from '@/pages/models/Meeting';
import User from '@/pages/models/User';
export default async function handler(req, res) {
  await connectToDatabase();

  const { roomId } = req.query;

  if (req.method === 'POST') {
    const { userId, messages, note } = req.body;

    try {

      const user = await User.findOne({ _id:userId });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const meeting = await Meeting.findOne({ roomId });

      if (meeting.host.toString() === userId) {
        meeting.status = 'completed';
      }

      meeting.chatHistory = messages.map((msg) => ({
        username: msg.sender,
        sender: msg.userId,
        message: msg.message, 
      }));

      await meeting.save();
      console.log("meeting saved in db",meeting);

      user.notes.push({
        meeting: meeting._id, 
        note: note, 
      });

      await user.save();
      console.log("user updated in db",user);


      return res.status(200).json({ message: 'Meeting marked as completed.' });

    } catch (error) {
      console.error('Error leaving meeting:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
