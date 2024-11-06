import twilio from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

interface SMSOptions {
  to: string;
  body: string;
}

const sendSMS = async ({ to, body }: SMSOptions) => {
  try {
    await client.messages.create({
      body,
      from: fromPhoneNumber,
      to,
    });
    
  } catch (error: any) {
    
  }
};

export default sendSMS;
