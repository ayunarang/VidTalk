

import React, { useEffect, useState } from 'react';
import styles from '../styles/dashboard.module.css';
import { useUsername } from '../context/username';
import { Users, MessageSquareShare, NotebookPen, ExternalLink, PlusSquare } from 'lucide-react';
import Chat from '../component/Chat/Chat';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ScheduleMeeting from '../component/ScheduleMeeting/ScheduleMeeting';
import { useNavigate } from 'react-router-dom';



const MeetingsDashboard = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [completedMeetings, setCompletedMeetings] = useState([]);
  const [overlay, setOverlay] = useState(false);


  const [loading, setLoading] = useState(true);
  const { userId, avatar } = useUsername();
  const [openComponent, setOpenComponent] = useState(null);
  const [customChat, setCustomChat] = useState([]);
  const [MeetingParticipants, setMeetingParticipants] = useState(null);
  const [note, setNote] = useState(null);
  const [isScheduleMeeting, setisScheduleMeeting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 992);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  const fetchMeetings = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_CLIENT_URL}/api/users/${userId}/meetings`);

      const data = await response.json();
      // console.log(data);

      if (Array.isArray(data)) {
        const upcoming = data.filter(meeting => meeting.status === 'upcoming');
        const completed = data.filter(meeting => meeting.status !== 'upcoming');

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
      // console.log(meeting._id);

      const participant = meeting.participants.find(participant => participant._id === userId);
      // console.log(participant);

      if (participant) {
        const note = participant.notes.find(note => note.meeting === meeting._id);
        // console.log(note);

        setNote(note ? note.note : null);
        // console.log(note);
      } else {
        setNote(null);
      }
    }
  };

  const toggleParticipants = (meeting) => {
    // console.log(meeting);
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
    navigate(`/noteViewer?content=${encodeURIComponent(note)}`);
  };

  const formatMeetingDate = (dateString) => {
    const date = new Date(dateString);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString(undefined, options);
    const formattedTime = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return { formattedDate, formattedTime };
  };

  return (
    <>
      <div className="flex justify-between px-5 py-4 bg-[#252525] border-b border-[#333]">
        <h1
          onClick={() => navigate("/")}
          className="font-extrabold text-3xl text-white cursor-pointer"
        >
          VIDTALK
        </h1>
      </div>

      <div className="max-w-full h-screen m-0 py-5 pb-20 md:pb-32 md:px-20 sm:px-10 px-5 overflow-y-auto bg-[#1e1e1e] scrollbar-none">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white">
            Meetings Dashboard
          </h2>

          <div className="flex gap-3 items-center justify-center">
            {!isMobile ? (
              <>
                <button
                  onClick={() => {
                    setisScheduleMeeting(true);
                    console.log("opened");
                  }}
                  className="rounded-sm sm:rounded-md md:rounded-full py-2 px-1 md:py-4 sm:py-2 sm:px-3 md:px-5 bg-[#5270EF] text-white font-semibold cursor-pointer md:text-lg sm:text-base text-sm"
                >
                  Schedule Meeting
                </button>
                <button
                  onClick={() => {
                    navigate("/");
                  }}
                  className="rounded-sm sm:rounded-md md:rounded-full py-2 px-1 md:py-4 sm:py-2 sm:px-3 md:px-5 bg-[#5270EF] text-white font-semibold cursor-pointer md:text-lg sm:text-base text-sm"
                >
                  Create Meeting
                </button>
              </>
            ) : (
              <div className='relative'>
                <PlusSquare onClick={() => setOverlay(!overlay)} />
                {overlay && (
                  <div className="absolute top-10 right-0 bg-[#2e2e2e] py-2 px-4 rounded shadow-lg z-50 w-40">
                    <ul className="text-white space-y-2">
                      <li
                        className="cursor-pointer hover:text-gray-300"
                        onClick={() => {
                          setisScheduleMeeting(true);
                          setOverlay(false);
                        }}
                      >
                        Schedule Meeting
                      </li>
                      <li
                        className="cursor-pointer hover:text-gray-300"
                        onClick={() => {
                          navigate("/");
                          setOverlay(false);
                        }}
                      >
                        Create Meeting
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <img
              src={avatar}
              alt="Avatar"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full object-cover"
            />
          </div>
        </div>

        <h2 className="text-white text-xl font-semibold mb-6">Upcoming Meetings</h2>
        {upcomingMeetings && upcomingMeetings.length > 0 ? (
          upcomingMeetings.map((meeting) => {
            const { formattedDate, formattedTime } = formatMeetingDate(meeting.createdAt);
            return (
              <div key={meeting._id} className="bg-[#242424] shadow-md rounded-lg md:py-8 md:px-10 py-5 px-5 flex flex-col sm:flex-row md:flex-row justify-between sm:items-center md:items-center md:mb-8 sm:mb-8 mb-6 max-w-6xl gap-3">
                <div className='flex flex-row justify-between md:justify-normal sm:flex-col md:flex-col'>
                  <p className="text-[#888] text-lg font-semibold">{formattedDate}</p>
                  <p className="text-[#4a4a4a] text-lg font-semibold">{formattedTime}</p>
                </div>
                <div className="flex items-center gap-4">
                  <img src={meeting?.host?.avatar || '/default-avatar.jpg'} alt="Avatar" className="md:w-16 md:h-16 sm:w-12 sm:h-12 h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="text-white md:text-lg sm:text-lg text-base">Hosted by {meeting?.host?.name}</p>
                  </div>
                </div>
                <div className="flex md:gap-20 sm:gap-10 justify-between items-center">
                  <button>{meeting.status}</button>
                  <button className="flex items-center gap-2">
                    <Users
                      onClick={() => toggleParticipants(meeting)}
                      className="md:w-6 md:h-6 sm:w-6 sm:h-6 h-5 w-5" />
                    <span className="text-xl">{meeting.participants.length}</span>
                  </button>
                  <MessageSquareShare className="md:w-6 md:h-6 sm:w-6 sm:h-6 h-5 w-5 cursor-pointer" onClick={() => { handleChat(meeting) }} />
                  <NotebookPen className="md:w-6 md:h-6 sm:w-6 sm:h-6 h-5 w-5 cursor-pointer" onClick={() => { toggleNotes(meeting) }} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="mb-5 text-[#828282]">No upcoming meetings</p>
        )}

        <h2 className="text-white text-xl font-semibold mb-6">Completed Meetings</h2>
        {completedMeetings && completedMeetings.length > 0 ? (
          completedMeetings.map((meeting) => {
            const { formattedDate, formattedTime } = formatMeetingDate(meeting.createdAt);
            return (
              <div key={meeting._id} className="bg-[#242424] shadow-md rounded-lg md:py-8 md:px-10 py-5 px-5 flex flex-col sm:flex-row md:flex-row justify-between sm:items-center md:items-center md:mb-8 sm:mb-8 mb-6 max-w-6xl gap-3">
                <div className='flex flex-row sm:flex-col md:flex-col justify-between md:justify-normal'>
                  <p className="text-[#888] text-lg font-semibold">{formattedDate}</p>
                  <p className="text-[#4a4a4a] text-lg font-semibold">{formattedTime}</p>
                </div>
                <div className="flex items-center gap-4">
                  <img src={meeting?.host?.avatar || '/default-avatar.jpg'} alt="Avatar" className="md:w-16 md:h-16 sm:w-12 sm:h-12 h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="text-white md:text-lg sm:text-lg text-base">Hosted by {meeting?.host?.name}</p>
                  </div>
                </div>
                <div className="flex md:gap-20 sm:gap-10 justify-between items-center">
                  <button>{meeting.status}</button>
                  <button
                    className="flex items-center gap-2">
                    <Users
                      onClick={() => toggleParticipants(meeting)}
                      className="md:w-6 md:h-6 sm:w-6 sm:h-6 h-5 w-5" />
                    <span className="text-xl">{meeting.participants.length}</span>
                  </button>
                  <MessageSquareShare className="md:w-6 md:h-6 sm:w-6 sm:h-6 h-5 w-5 cursor-pointer" onClick={() => { handleChat(meeting) }} />
                  <NotebookPen className="md:w-6 md:h-6 sm:w-6 sm:h-6 h-5 w-5 cursor-pointer" onClick={() => { toggleNotes(meeting) }} />
                </div>
              </div>
            );
          })
        ) : (
          <p>No completed meetings</p>
        )}
      </div>

      <div
      className={`fixed right-0 top-0 bottom-0 w-96 h-full bg-[#1e1e1e] shadow-lg z-50 transition-transform duration-700 ease-in-out transform ${
        openComponent === "chat" ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ overflowY: 'auto' }}
    
      >
        {openComponent === "chat" && <Chat isSavedChat={true} customChat={customChat} setCustomChat={setCustomChat} setOpenComponent={setOpenComponent} />}
      </div>
      <div
      className={`fixed right-0 top-0 bottom-0 w-96 h-full bg-[#1e1e1e] shadow-lg z-100 transition-transform duration-700 ease-in-out transform ${
        openComponent === "notes" ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ overflowY: 'auto' }}
    >
        {openComponent === "notes" &&
          note ? (
            <div className={styles.participantsContainer}>
              <div className='flex gap-2'>
              <p className='cursor-pointer font-bold justify-center items-center'
              onClick={()=>{setOpenComponent(null)}}>x</p>
              <h2 className='text-2xl font-bold mb-3'>Meeting Notes</h2>
              </div>
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
               <div className='flex gap-2'>
              <p className='cursor-pointer font-bold justify-center items-center'
              onClick={()=>{setOpenComponent(null)}}>x</p>
              <h2 className='text-2xl font-bold mb-3'>Meeting Notes</h2>
              </div>
              <p>No Notes created in meeting</p>
            </div>
          
        )}
      </div>

      <div
      className={`fixed right-0 top-0 bottom-0 w-96 h-full bg-[#1e1e1e] shadow-lg z-50 transition-transform duration-700 ease-in-out transform ${
        openComponent === "participants" ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ overflowY: 'auto' }}
    >
        {openComponent === "participants" && (
          <div className={styles.participantsContainer}>
            <div className='flex gap-2 items-center'>
            <p className='cursor-pointer font-bold justify-center items-center'
              onClick={()=>{setOpenComponent(null)}}>x</p>
               <h2 className='text-2xl font-bold mb-3'>Participants - ({MeetingParticipants?.length})</h2>
               </div>
            <hr className="border-neutral-700 rounded mb-7" />
            <ul className='list-none'>
              {MeetingParticipants.map(participant => (
                <li className='text-xl mb-3 flex items-center gap-3' key={participant._id}>
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



