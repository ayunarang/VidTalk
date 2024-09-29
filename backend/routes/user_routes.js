const express= require('express')
const router=express.Router();

const { signin} = require('../controllers/auth.js');
const { createMeeting , addParticipant, finishMeetings, getMeetings, scheduleMeeting} = require('../controllers/meetings.js');



router.post('/auth/google-signin', signin);

router.post('/meetings', createMeeting);

router.post('/meetings/update', addParticipant);

router.post('/meetings/:roomId', finishMeetings);

router.get('/users/:userId/meetings', getMeetings);


router.post('/scheduleMeeting', scheduleMeeting);




module.exports = router;