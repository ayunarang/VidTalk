
import "@/styles/globals.css";

import { SocketProvider } from "@/context/socket";
import { UsernameProvider } from "@/context/username";
import { useEffect, useState } from "react";
import AuthProvider from "@/component/AuthProvider/AuthProvider";
import { ChatProvider } from "@/context/chat";
import { NotesProvider } from "@/context/notes";



export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <UsernameProvider>
          <ChatProvider>
            <NotesProvider>
              <Component {...pageProps} />

            </NotesProvider>
          </ChatProvider>
        </UsernameProvider>
      </SocketProvider>
    </AuthProvider>

  );
}
