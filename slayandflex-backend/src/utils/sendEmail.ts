import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (options: EmailOptions) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER!, // Your Gmail address
      pass: process.env.EMAIL_PASS!, // Your Gmail password or app password
    },
  });

  // Define email options
  const mailOptions = {
    from: `"Slay And Flex" <${process.env.EMAIL_USER}>`, // Sender address
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
