

import React, { useEffect, useState } from 'react';
import styles from '@/styles/dashboard.module.css';
import { useUsername } from '@/context/username';
import { Users, MessageSquareShare, NotebookPen, ExternalLink } from 'lucide-react';
import useFormattedDate from '@/hooks/useFormattedDate';
import Chat from '@/component/Chat/Chat';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/router';
import ScheduleMeeting from '@/component/ScheduleMeeting/ScheduleMeeting';



const MeetingsDashboard = () => {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [completedMeetings, setCompletedMeetings] = useState([]);


  const [loading, setLoading] = useState(true);
  const { userId, avatar } = useUsername();
  const [openComponent, setOpenComponent] = useState(null);
  const [customChat, setCustomChat] = useState([]);
  const [MeetingParticipants, setMeetingParticipants] = useState(null);
  const [note, setNote] = useState(null);
  const [isScheduleMeeting, setisScheduleMeeting] = useState(false);


  const fetchMeetings = async (userId) => {
    try {
      const response = await fetch(`/api/meetings/getmeetings?userId=${userId}`);
      const data = await response.json();
      console.log(data);

      if (Array.isArray(data)) {
        const upcoming = data.filter(meeting => meeting.status === 'upcoming');
        const completed = data.filter(meeting => meeting.status === 'completed');

        setUpcomingMeetings(upcoming);
        setCompletedMeetings(completed);
      }

    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (userId && avatar) {
      fetchMeetings(userId);

    }
  }, [userId, avatar]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleChat = (chat) => {
    if (openComponent === "chat") {
      setOpenComponent(null);
      setCustomChat(null);
    } else {
      setOpenComponent("chat");
      setCustomChat(chat.chatHistory);
    }
  };

  const toggleNotes = (meeting) => {
    if (openComponent === "notes") {
      setOpenComponent(null);
      setNote(null);
    } else {
      setOpenComponent("notes");
      console.log(meeting._id);

      const participant = meeting.participants.find(participant => participant._id === userId);
      console.log(participant);

      if (participant) {
        const note = participant.notes.find(note => note.meeting === meeting._id);
        console.log(note);

        setNote(note ? note.note : null);
        console.log(note);
      } else {
        setNote(null);
      }
    }
  };

  const toggleParticipants = (meeting) => {
    console.log(meeting);
    if (openComponent === "participants") {
      setOpenComponent(null);
    } else {
      setOpenComponent("participants");
      setMeetingParticipants(meeting.participants);
    }
  };
  const exportPDF = async () => {
    const pdf = new jsPDF();
    const canvas = await html2canvas(document.querySelector('#notesContent'), {
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL('image/png');

    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFillColor(30, 30, 30);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const aspectRatio = imgWidth / imgHeight;

    let newWidth = pageWidth - margin * 2;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > pageHeight - margin * 2) {
      newHeight = pageHeight - margin * 2;
      newWidth = newHeight * aspectRatio;
    }

    pdf.addImage(imgData, 'PNG', margin, margin, newWidth, newHeight);

    pdf.save('meeting-notes.pdf');
  };


  const viewNotesPage = () => {
    router.push(`/noteViewer?content=${encodeURIComponent(note)}`);
  };

  return (
    <>
      <div className={styles.topBar}>
        <h1
          onClick={() => router.push("/")}
          className={styles.logo}>VIDTALK</h1>
      </div>
      <div className={styles.container}>
        <div className={styles.headingBox}>
          <h2 className={styles.headingContainer}>Meetings Dashboard</h2>
          <div className={styles.rightHeader}>
            <button onClick={() => {
              setisScheduleMeeting(true);
              console.log("opened")
            }}
              className={styles.btn}>Schedule Meeting</button>
            <button
              onClick={() => { router.push("/") }}
              className={styles.btn}>Create Meeting</button>
            <img src={avatar} alt="Avatar" className={styles.avatar} />
          </div>
        </div>

        <h2 className={styles.upcomingHeader}>Upcoming Meetings</h2>
        {upcomingMeetings && upcomingMeetings.length > 0 ? (
          upcomingMeetings.map((meeting) => {
            const { formattedDate, formattedTime } = useFormattedDate(meeting.createdAt);
            return (
              <div key={meeting._id} className={styles.meetingCard}>
                <div>
                  <p className={styles.date}>{formattedDate}</p>
                  <p className={styles.time}>{formattedTime}</p>
                </div>
                <div className={styles.meetingInfo}>
                  <img src={meeting?.host?.avatar || '/default-avatar.jpg'} alt="Avatar" className={styles.avatar} />
                  <div>
                    <p className={styles.name}>Hosted by {meeting?.host?.name}</p>
                  </div>
                </div>
                <button className={styles.participants} onClick={() => { toggleParticipants(meeting) }}>
                  <Users className={styles.icon} />
                  <span style={{ fontSize: '1.2rem' }}>{meeting.participants.length}</span>
                </button>
                <button>{meeting.status}</button>
                <MessageSquareShare className={styles.icon} onClick={() => { handleChat(meeting) }} />
                <NotebookPen className={styles.icon} onClick={() => { toggleNotes(meeting) }} />
              </div>
            );
          })
        ) : (
          <p className='mb-5 text-[#828282]'>No upcoming meetings</p>
        )}

        <h2 className={styles.upcomingHeader}>Completed Meetings</h2>
        {completedMeetings && completedMeetings.length > 0 ? (
          completedMeetings.map((meeting) => {
            const { formattedDate, formattedTime } = useFormattedDate(meeting.createdAt);
            return (
              <div key={meeting._id} className={styles.meetingCard}>
                <div>
                  <p className={styles.date}>{formattedDate}</p>
                  <p className={styles.time}>{formattedTime}</p>
                </div>
                <div className={styles.meetingInfo}>
                  <img src={meeting?.host?.avatar || '/default-avatar.jpg'} alt="Avatar" className={styles.avatar} />
                  <div>
                    <p className={styles.name}>Hosted by {meeting?.host?.name}</p>
                  </div>
                </div>
                <button className={styles.participants} onClick={() => { toggleParticipants(meeting) }}>
                  <Users className={styles.icon} />
                  <span style={{ fontSize: '1.2rem' }}>{meeting.participants.length}</span>
                </button>
                <button>{meeting.status}</button>
                <MessageSquareShare className={styles.icon} onClick={() => { handleChat(meeting) }} />
                <NotebookPen className={styles.icon} onClick={() => { toggleNotes(meeting) }} />
              </div>
            );
          })
        ) : (
          <p>No completed meetings</p>

        )}
      </div>

      <div
        className={`absolute right-0 top-0 bottom-0 w-96 h-full bg-[#1e1e1e] shadow-lg z-50 transition-transform duration-700 ease-in-out transform ${openComponent === "chat" ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ overflowY: 'auto' }}
      >
        {openComponent === "chat" && <Chat isSavedChat={true} customChat={customChat} />}
      </div>

      <div
        className={`absolute right-0 top-0 bottom-0 w-96 h-full bg-[#1e1e1e] shadow-lg z-50 transition-transform duration-700 ease-in-out transform ${openComponent === "notes" ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ overflowY: 'auto' }}
      >
        {openComponent === "notes" && (
          note || note.length > 0 ? (
            <div className={styles.participantsContainer}>
              <h2 className='text-2xl font-bold mb-3'>Meeting Notes</h2>
              <div className='flex gap-2 align-baseline '>
                <button onClick={exportPDF} className="text-base">Download as PDF</button>
                <ExternalLink size={20} className='text-[#828282b1]' />
              </div>
              <div className='flex gap-2 align-baseline'>
                <button onClick={viewNotesPage} className='mb-1 text-base'>View in New Page</button>
                <ExternalLink size={20} className='text-[#828282b1]' />
              </div>
              <hr className="border-neutral-700 rounded mb-4 mt-4" />
              <div id="notesContent" dangerouslySetInnerHTML={{ __html: note }} />
            </div>
          ) : (
            <div className='py-5 px-5'>
              <h2 className='text-2xl font-bold mb-3'>Meeting Notes</h2>
              <p>No Notes created in meeting</p>
            </div>
          )
        )}
      </div>



      <div
        className={`absolute right-0 top-0 bottom-0 w-96 h-full bg-[#1e1e1e] shadow-lg z-50 transition-transform duration-700 ease-in-out transform ${openComponent === "participants" ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ overflowY: 'auto' }}
      >
        {openComponent === "participants" && (
          <div className={styles.participantsContainer}>
            <h2 className='text-2xl font-bold mb-3'>Participants -
              ({MeetingParticipants?.length})</h2>
            <hr className="border-neutral-700 rounded mb-7" />
            <ul className='list-none'>
              {MeetingParticipants.map(participant => (
                <li className='text-xl mb-3 flex items-center gap-3'
                  key={participant._id}>
                  <img src={participant.avatar || '/default-avatar.jpg'} alt="Avatar" className={styles.avatar} />
                  <p>{participant.name}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(isScheduleMeeting) ?
        <ScheduleMeeting ScheduleMeeting={isScheduleMeeting} setScheduleMeeting={setisScheduleMeeting} /> : null}
    </>
  );
};

export default MeetingsDashboard;



