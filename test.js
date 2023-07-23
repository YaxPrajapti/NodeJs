const nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "75ef56a5bda096",
      pass: "14e2c745a252d2"
    }
  });
var mailOptions = {
    from: '"Yax Prajapati" <yaxprjpt@gmail.com>',
    to: 'unnatiprajapati14112000@gmail.com',
    subject: 'Nice Nodemailer test',
    text: 'Hey there, it’s our first message sent with Nodemailer ',
    html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer<br /><img src="cid:uniq-mailtrap.png" alt="mailtrap" />',
};

transport.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
});