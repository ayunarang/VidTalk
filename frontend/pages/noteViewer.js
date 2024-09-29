import { useRouter } from 'next/router';
import React from 'react';

const NotesPage = () => {
  const router = useRouter();
  const { content } = router.query; 

  return (
    <div className='mt-20 mb-10 ml-28 mr-28'>
      <div dangerouslySetInnerHTML={{ __html: decodeURIComponent(content) }} />
    </div>
  );
};

export default NotesPage;
