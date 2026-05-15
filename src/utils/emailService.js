const nodemailer = require('nodemailer');

// Create transporter using Ethereal (free testing service)
let transporter;

(async () => {
  // Generate test account
  let testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  
  console.log('Ethereal Email configured');
  console.log('Preview URL will be logged with each email');
})();

const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      console.log('Waiting for Ethereal transporter to initialize...');
      // Simple wait mechanism if called too early
      let retries = 5;
      while (!transporter && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries--;
      }
    }

    const info = await transporter.sendMail({
      from: 'noreply@hrapp.com',
      to: to,
      subject: subject,
      html: html
    });
    console.log('Email sent successfully to:', to);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};


const sendLeaveApprovalEmail = async (employeeEmail, employeeName, fromDate, toDate, days) => {
  const subject = "Your leave request has been approved";
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
      <p>Hi ${employeeName},</p>
      <p>Your leave request from <strong>${fromDate}</strong> to <strong>${toDate}</strong> (${days} days) has been approved.</p>
      <p>Enjoy your leave!</p>
    </div>
  `;
  return sendEmail(employeeEmail, subject, html);
};

const sendLeaveRejectionEmail = async (employeeEmail, employeeName, fromDate, toDate, reason) => {
  const subject = "Your leave request has been rejected";
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
      <p>Hi ${employeeName},</p>
      <p>Your leave request from <strong>${fromDate}</strong> to <strong>${toDate}</strong> has been rejected.</p>
      <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
      <p>Please contact HR for more details.</p>
    </div>
  `;
  return sendEmail(employeeEmail, subject, html);
};

const sendWelcomeEmail = async (employeeEmail, employeeName, tempPassword) => {
  const subject = "Welcome to HR Management System";
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
      <p>Hi ${employeeName},</p>
      <p>Your account has been created in the HR system.</p>
      <p><strong>Email:</strong> ${employeeEmail}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please login and change your password immediately.</p>
      <p>Login URL: <a href="http://localhost:5000/login">http://localhost:5000/login</a></p>
    </div>
  `;
  return sendEmail(employeeEmail, subject, html);
};

module.exports = {
  sendLeaveApprovalEmail,
  sendLeaveRejectionEmail,
  sendWelcomeEmail
};
