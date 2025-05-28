import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cors, { runMiddleware } from '@/../utils/cors';
const key = Buffer.from("MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=", "base64");
const secret = process.env.NEXTAUTH_SECRET;
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token } = req.body;
  var userId = '';
  if (!token) {
    console.log('no token found')
    return res.status(400).json({ message: "User not found" });
  }
  try {
    // Verify and decode the token
    if (!secret) {
            return res.status(401).json({ message: "something went very wrong." });
    }
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    // Access the userId from the decoded token
    userId = decoded.userId;
  } catch (error) {
    console.error("Invalid or expired token:", error);
    userId = ''; // Return null if the token is invalid or expired
    return res.status(401).json({ message: "This email is not registered." });
  }
return res.status(200).json({ message: "Login successful",user_id:userId})}
