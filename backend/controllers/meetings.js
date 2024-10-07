const User= require('../models/User.js');
const Meeting= require('../models/Meeting.js');
const send_mail= require('../utils/mailTemplate.js');
const {v4}= require('uuid');
const nodemailer= require('nodemailer');


exports.createMeeting = async (req, res) => {
  // console.log('POST /meetings request received with body:', req.body);
    const { roomId, title, host, participants, userId } = req.body;
  
    try {
      const newMeeting = new Meeting({
        roomId,
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
  
      return res.status(200).json(newMeeting);
    } catch (error) {
      // console.error('Error creating meeting:', error);
      return res.status(500).json({ error: 'Error creating meeting' });
    }
}




exports.addParticipant= async (req, res) => {
    const { dbId, roomId } = req.body;
  
    try {
      // console.log("inside add participant")
      const updatedMeeting = await Meeting.findOneAndUpdate(
        { roomId },
        { $addToSet: { participants: dbId } }, 
        { new: true } 
      );

      // console.log("meeting found and updated", updatedMeeting)
  
      if (!updatedMeeting) {
        return res.status(404).json({ message: 'Meeting not found' });
      }
  
      if (updatedMeeting.host && updatedMeeting.host.toString() === dbId) {
        updatedMeeting.status = 'ongoing';
        await updatedMeeting.save();
      }

  
      return res.status(200).json(updatedMeeting);
    } catch (error) {
      // console.error('Error updating meeting:', error);
      return res.status(500).json({ message: 'Error updating meeting', error });
    }
};
  
  



exports.finishMeetings= async (req, res) => {
    const { roomId } = req.params;  
    const { userId, messages, note } = req.body;  
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const meeting = await Meeting.findOne({ roomId });
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }
  
      if (meeting.host.toString() === userId) {
        meeting.status = 'completed';
      }
  
      meeting.chatHistory = messages.map((msg) => ({
        senderName: msg.senderName,
        senderId: msg.senderId,
        message: msg.message,
      }));
  
      await meeting.save();
      // console.log('Meeting saved in db:', meeting);
  
      user.notes.push({
        meeting: meeting._id,
        note: note,
      });
  
      await user.save();
      // console.log('User updated in db:', user);
  
      return res.status(200).json({ message: 'Meeting marked as completed.' });
  
    } catch (error) {
      // console.error('Error completing meeting:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  



exports.getMeetings= async (req, res) => {
    const { userId } = req.params;
  
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
  
      return res.status(200).json(meetings);
    } catch (error) {
      // console.error('Error fetching meetings:', error);
      return res.status(500).json({ message: 'Error fetching meetings', error });
    }
  }





exports.scheduleMeeting=async (req, res) => {
    const { title, startDate, startTime, notificationTime, userId } = req.body;

    if (!title || !startDate || !startTime || !userId || !notificationTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // console.log(req.body);

    const roomId = v4(); 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const meetingData = {
            roomId,
            title,
            startDate,
            startTime,
            host: userId,
            status: 'upcoming',
        };

        const meeting = await Meeting.create(meetingData);
        // console.log('Meeting created:', meeting);

        const meetingDateTime = new Date(`${startDate}T${startTime}`);
        const notificationTimeBeforeMeeting = new Date(meetingDateTime.getTime() - notificationTime * 60000);
        const checkParticipantsTime = new Date(meetingDateTime.getTime() + 2 * 60000); 


        scheduleEmailNotification(meeting, notificationTimeBeforeMeeting, notificationTime);
        // console.log('Meeting sent to scheduler');


        scheduleCheckForParticipants(meeting, checkParticipantsTime);
        // console.log('Meeting check-for-participants job scheduled');

        return res.status(200).json({ message: 'Meeting scheduled successfully', meeting });
    } catch (error) {
        // console.error('Error scheduling the meeting:', error);
        return res.status(500).json({ error: 'Failed to schedule the meeting' });
    }
}

function scheduleEmailNotification(meeting, sendTime, notificationTime) {
    const { host, roomId } = meeting;

    const currentTime = new Date();
    const delay = sendTime.getTime() - currentTime.getTime();

    // console.log(delay);

    if (delay > 0) {
        setTimeout(async () => {
            try {
                const user = await User.findById(host);
                if (!user || !user.email) {
                    // console.log('User not found or email not available');
                    return;
                }
                const username = user.name;

                await sendEmailNotification({
                    to: user.email,
                    subject: `Reminder for meeting: ${meeting.title}`,
                    html: send_mail(username, roomId, notificationTime),
                });

                // console.log('Email reminder sent successfully');
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }, delay);
    } 
    // else {
    //     console.error('Notification time has already passed.');
    // }
}

const sendEmailNotification = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log('Email sent successfully');
    } catch (error) {
        // console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};


function scheduleCheckForParticipants(meeting, checkTime) {
  const { roomId } = meeting;
  // console.log('Scheduling check for participants for Room ID:', roomId);

  const currentTime = new Date();
  const delay = checkTime.getTime() - currentTime.getTime();

  if (delay > 0) {
      setTimeout(async () => {
          try {
              const meetingToCheck = await Meeting.findOne({ roomId });

              if (!meetingToCheck) {
                  // console.log('Meeting not found for Room ID:', roomId);
                  return;
              }

              if (meetingToCheck.status === 'completed') {
                  // console.log('Meeting already completed for Room ID:', roomId);
                  return;
              }

              if (meetingToCheck.participants.length === 0) {
                  meetingToCheck.status = 'completed';
                  await meetingToCheck.save();
                  // console.log(`Meeting ${roomId} marked as completed due to no participants.`);
              } 
              // else {
              //     console.log(`Meeting ${roomId} has participants, no action taken.`);
              // }
          } catch (error) {
              console.error('Error checking for participants:', error);
          }
      }, delay);
  } 
  // else {
  //     console.error('Check for participants time has already passed.');
  // }
}
