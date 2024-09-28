import nodemailer from 'nodemailer';
import connectToDatabase from '../utils/db';
import Meeting from '../models/Meeting';
import User from '../models/User';
import send_mail from '../utils/mailTemplate';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const { title, startDate, startTime, notificationTime, userId } = req.body;

    if (!title || !startDate || !startTime || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const roomId = uuidv4();

    try {
        await connectToDatabase();
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
        };

        const meeting = await Meeting.create(meetingData);
        meeting.status = 'upcoming';

        console.log("meeting doc created", meeting);

        const meetingDateTime = new Date(`${startDate}T${startTime}`);
        const notificationTimeBeforeMeeting = new Date(meetingDateTime.getTime() - notificationTime * 60000);

        scheduleEmailNotification(meeting, notificationTimeBeforeMeeting);

        console.log("meeting sent to scheduler");

        return res.status(200).json({ message: 'Meeting scheduled successfully' });
    } catch (error) {
        console.error('Error scheduling the meeting:', error);
        return res.status(500).json({ error: 'Failed to schedule the meeting' });
    }
}

function scheduleEmailNotification(meeting, sendTime) {
    const { host, roomId } = meeting;
    console.log("host", host, "room id", roomId)

    const currentTime = new Date();
    const delay = sendTime.getTime() - currentTime.getTime();

    if (delay > 0) {
        setTimeout(async () => {
            try {
                const user = await User.findById({ _id: host });
                const username = user.name;

                if (!user || !user.email) {
                    console.log('User not found or email not available');
                    return;
                }

                await sendEmailNotification({
                    to: user.email,
                    subject: `Reminder for meeting: ${meeting.title}`,
                    html: send_mail(username, roomId),
                });

                console.log("send email func called with custom template")
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }, delay);
    } else {
        console.error('Notification time has already passed.');
    }
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
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};
