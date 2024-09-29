import React from 'react';
import { useNavigate, useParams } from "react-router-dom";

const NotesPage = () => {
  const router = useNavigate();
  const { content } = useParams(); 

  return (
    <div className='mt-20 mb-10 ml-28 mr-28'>
      <div dangerouslySetInnerHTML={{ __html: decodeURIComponent(content) }} />
    </div>
  );
};

export default NotesPage;
