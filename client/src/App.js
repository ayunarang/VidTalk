import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import "./styles/globals.css";

import { SocketProvider } from "./context/socket";
import { UsernameProvider } from "./context/username";
import { ChatProvider } from "./context/chat";
import { NotesProvider } from "./context/notes";
import Home from './pages/Home';
import MeetingsDashboard from './pages/meetingsDashboard';
import Room from './pages/Room';


function App() {

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <SocketProvider>
        <UsernameProvider>
          <ChatProvider>
            <NotesProvider>
              <Router>
                <Routes>
                  <Route exact path="/" element={<Home />} />
                  <Route exact path="/:roomId" element={<Room />} />
                  <Route exact path="/meetingsDashboard" element={<MeetingsDashboard/>} />
                </Routes>

              </Router>
            </NotesProvider>
          </ChatProvider>
        </UsernameProvider>
      </SocketProvider>
    </GoogleOAuthProvider>

  );
}

export default App;


