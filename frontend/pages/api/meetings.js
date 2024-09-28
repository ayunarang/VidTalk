import connectToDatabase from "@/pages/utils/db"; 
import Meeting from "@/pages/models/Meeting"; 
import User from "@/pages/models/User";

export default async function handler(req, res) {
  await connectToDatabase(); 

  if (req.method === 'POST') {
    const { roomId, title, host, participants , userId} = req.body;

    try {
      const newMeeting = new Meeting({
        roomId: roomId,
        title,
        host,
        participants,
      });

      await newMeeting.save();

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { meetings: newMeeting._id } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(newMeeting); 
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ error: "Error creating meeting" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
