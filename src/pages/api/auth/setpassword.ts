import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { NextApiRequest, NextApiResponse } from "next";
import {updateData } from "@/components/FirebaseQueries/FirebaseConnect";
import cors, { runMiddleware } from '@/../utils/cors';
const key = Buffer.from("MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=", "base64");
function encryptPassword(password: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encryptedPassword = Buffer.concat([cipher.update(password, "utf-8"), cipher.final()]);
    const ivCiphertext = Buffer.concat([iv, encryptedPassword]);
    return ivCiphertext.toString("base64");
  }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { password,userId } = req.body;
  const { token } = req.query;  
  if (!password || !userId) {
    return res.status(400).json({ message: "Something went wrong, try again later!" });
  }
  try {
    const email = jwt.verify(token as string, process.env.NEXTAUTH_SECRET!) as { email: string };
    if (!email) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const result = await updateData(userId,['password'],[encryptPassword(password)]);
    if (!result) {
      return res.status(500).json({ message: "Failed to update password" });
    }
    return res.status(201).json({ message: "sucess" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}



