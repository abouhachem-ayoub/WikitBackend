import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from 'nodemailer'
import cors, { runMiddleware } from '@/../utils/cors';
import { readData } from "@/components/FirebaseQueries/FirebaseConnect";


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD
  }
});
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { email } = req.body;
  console.log(email);
  if (!email) {
    return res.status(400).json({ message: "Something went wrong, try again later!" });
  }
  try {
    // Check if the email already exists
    /*const existingUser = await executeQuery(
      "SELECT email FROM userInfo WHERE email = ?",
      [email]
    );*/

    const existingUser = await readData({email:email});

    if (existingUser.length < 0) {
      return res.status(400).json({ message: "Something went wrong, try again later or contact the website admin!" });
    }

    // Encrypt the password


    // Insert the user into the database
   
    const token = jwt.sign({ email }, process.env.NEXTAUTH_SECRET!, { expiresIn: "1h" });
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${token}`;
    await sendVerificationEmail(email, verificationLink);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function sendVerificationEmail(email: string, link: string) {
  const mailOptions = {
    from: 'abouhachemayoub@gmail.com',
    to: email,
    subject: 'WikiTime - Verify your email',
    text: 'Verify your email by clicking the link: ' + link,
    html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
  };
  transporter.sendMail(mailOptions, (error, info) =>{
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  // Use a library like Nodemailer or an email service like SendGrid
  console.log(`Send verification email to ${email} with link: ${link}`);
}