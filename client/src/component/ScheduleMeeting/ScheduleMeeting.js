import { useUsername } from '../../context/username';
import { X } from 'lucide-react';
import React, { useState } from 'react';

const ScheduleMeeting = ({ ScheduleMeeting, setScheduleMeeting }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notification, setNotification] = useState('Email');
  const [notificationTime, setNotificationTime] = useState(30);
  const {userId}= useUsername();
  console.log(userId)

  const handleSave = async () => {
    const meetingData = {
      title, startDate, startTime, notificationTime, userId
    };

    console.log("meeting data", meetingData)
  
    try {
      const response = await fetch(`${process.env.REACT_APP_CLIENT_URL}/api/scheduleMeeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log('Meeting scheduled:', result);
        setScheduleMeeting(false);
      } else {
        console.error('Failed to schedule meeting:', result.error);
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };
  


  return (
    <div className="fixed inset-0 bg-[#161614] bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#252525] rounded-lg p-6 font-white w-2/4"
          style={{height: 'fit-content' }} 
>
      <div className='flex justify-between'>
      <h2 className="text-3xl font-semibold mb-4 text-white">Schedule Meeting</h2>
      <X size={32} onClick={() => { setScheduleMeeting(false); }} style={{ backgroundColor: '#D60010', padding: '0.3rem', borderRadius: '5px', cursor: 'pointer' }} />
      </div>
      <p className='text-lg text-gray-100 mb-5 mt-2'>Scheduled meetings will automatically be marked completed after <span className='font-bold'>1 hour</span> of scheduled time if no one shows up in the meeting.</p>


        <div className="mb-8">
          <label className="block text-gray-100 text-sm font-medium mb-2" htmlFor="title">
            Add Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full outline-none px-4 py-4 border text-black border-gray-300 rounded-lg text-xl"
            placeholder="Enter meeting title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-gray-100  text-sm font-medium mb-2" htmlFor="start-date">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full outline-none px-4 py-4 text-black border border-gray-300 rounded-lg text-xl"
            />
          </div>

          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2" htmlFor="start-time">
              Start Time
            </label>
            <input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-4 outline-none text-black border border-gray-300 rounded-lg text-xl"
            />
          </div>


        </div>


        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2" htmlFor="notification">
              Notifications
            </label>
            <select
              id="notification"
              value={notification}
              onChange={(e) => setNotification(e.target.value)}
              className="w-full px-4 py-4 outline-none border text-black border-gray-300 rounded-lg text-xl"
            >
              <option value="Email and SMS" className='text-lg'>Email</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2" htmlFor="notification-time">
              Minutes Before
            </label>
            <input
              type="number"
              id="notification-time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="w-full px-4 py-4 outline-none text-black border border-gray-300 rounded-lg text-xl"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-5">
          <button
            className="px-6 py-4 text-black bg-gray-200 hover:bg-gray-300 rounded-lg text-xl transition duration-300 font-semibold"
            onClick={() => {setScheduleMeeting(false)}}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-4 text-white bg-[#5270EF] hover:bg-[#4463ef]
            rounded-lg text-xl transition duration-300 font-semibold"
          >
            Save Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeeting;
