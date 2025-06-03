import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from 'nodemailer';
import { readData } from "@/components/FirebaseQueries/FirebaseConnect";
import cors, { runMiddleware } from '@/../utils/cors';
import SMTPTransport from "nodemailer/lib/smtp-transport";

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
   /* const password = await executeQuery(
      "SELECT password FROM userInfo WHERE email = ?",
      [email]
    );*/

    const result = await readData({email:email});
    const password = result[0].password;

    if (password.length < 0) {
      return res.status(400).json({ message: "Something went wrong, try again later or contact the website admin!" });
    }

   
   
    const token = jwt.sign({ email }, process.env.NEXTAUTH_SECRET!, { expiresIn: "1h" });
    const verificationLink = process.env.FRONT_END+`?resetPassword=true&token=${token}`;
    await sendVerificationEmail(email, verificationLink);
    return res.status(201).json({ message: "sucess" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function sendVerificationEmail(email: string, link: string) {
  const transporter = nodemailer.createTransport(
    new SMTPTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_SENDER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD,
    },
  }));

  await new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error("Error verifying transporter:", error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });

  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: "WikiTime - Reset your password",
    text: `You can reset your password by clicking the link: ${link}`,
    html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
  };

  // Send the email
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info);
      }
    });
  });
}