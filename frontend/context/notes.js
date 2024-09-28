import React, { createContext, useContext, useState, useCallback } from 'react';
import { debounce } from 'lodash';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [note, setNote] = useState('');

  const UpdateNote = (newNote)=>{
    setNote(newNote);
  }

  return (
    <NotesContext.Provider value={{ note,  UpdateNote}}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  return useContext(NotesContext);
};
