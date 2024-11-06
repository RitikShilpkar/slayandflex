
import nodemailer from 'nodemailer';


interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  const mailOptions = {
    from: `"Your E-commerce Platform" <${process.env.EMAIL_FROM}>`, // Sender address
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    
  } catch (error: any) {
    
    if (error.response) {
      
    }
  }
};

export default sendEmail;
