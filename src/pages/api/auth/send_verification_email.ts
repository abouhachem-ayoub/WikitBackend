import executeQuery from "@/components/MysqlConnect/MysqlConnect";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
var nodemailer = require('nodemailer');
import { createTransport } from "nodemailer";
import cors, { runMiddleware } from '@/../utils/cors';


const key = Buffer.from("MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=", "base64");
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abouhachemayoub@gmail.com',
    pass: 'tsavhjkfwyikgwey'
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
    const existingUser = await executeQuery(
      "SELECT email FROM userInfo WHERE email = ?",
      [email]
    );

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
  var mailOptions = {
    from: 'abouhachemayoub@gmail.com',
    to: email,
    subject: 'WikiTime - Verify your email',
    text: 'Verify your email by clicking the link: ' + link,
    html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
  };
  transporter.sendMail(mailOptions, (error:any, info:any) =>{
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  // Use a library like Nodemailer or an email service like SendGrid
  console.log(`Send verification email to ${email} with link: ${link}`);
}