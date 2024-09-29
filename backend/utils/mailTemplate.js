function send_mail(username, roomId, notificationTime) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Scheduled Meeting Alert!</title>
    </head>
    <body>
      <div style="padding:2.2rem; background-color: #F9F9F9; max-width: 800px; text-align: center;" class="outer-container">
        <div style="background-color: white; padding:1.5rem; margin: 2.2rem;" class="mail-content-container">
          <p style="font-size: 1.2rem; margin-bottom: 1rem; font-weight: 500; text-align:left" class="username">Hey ${username},</p>
          <p style="font-size: 1rem; text-align:left" class="mail-content">Your scheduled meeting is going to start in ${notificationTime} minutes. Below is more information about this meeting:</p>
          <p style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0;" class="roomid">Room ID:</p>
          <p style="color: #1a73e8; font-size:0.85rem;">${roomId}</p>
          <hr style="width:100%;" class="hr">
          <p style="margin: 1.2rem 1rem 1rem 1rem; font-size: 0.8rem" class="extra-info">This is an automated notification. If you are already in the meeting, please ignore.</p>
        </div>
        <div style="font-size: 0.7rem; font-weight: 400; color: #B8C4CB;" class="last-content">Sent by VidTalk</div>
      </div>
    </body>
    </html>
    `;
  }
  
module.exports = send_mail ;
  