import connectToDatabase from '@/pages/utils/db'; 
import Meeting from '@/pages/models/Meeting';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { dbId, roomId } = req.body;

    try {
      const updatedMeeting = await Meeting.findOneAndUpdate(
        { roomId },
        { $addToSet: { participants: dbId } }, 
        { new: true }
      );

      if (!updatedMeeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      if (updatedMeeting.host && updatedMeeting.host.toString() === dbId) {
        updatedMeeting.status = 'ongoing'; 
        await updatedMeeting.save(); 
      }

      res.status(200).json(updatedMeeting);
    } catch (error) {
      console.error('Error updating meeting:', error);
      res.status(500).json({ message: 'Error updating meeting', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
