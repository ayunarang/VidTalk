import React from 'react';
import { useLocation } from 'react-router-dom';

const NotesPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const content = queryParams.get('content');

  return (
    <div className='mt-20 mb-10 ml-28 mr-28'>
      <div dangerouslySetInnerHTML={{ __html: decodeURIComponent(content) }} />
    </div>
  );
};

export default NotesPage;
