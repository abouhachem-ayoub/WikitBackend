import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import {readData, updateData } from "@/components/FirebaseQueries/FirebaseConnect";
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
  const { currentPassword,newPassword,userId } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
 if (!currentPassword || !newPassword || !userId) {
    return res.status(400).json({ message: "Something went wrong, try again!" });
  }
  try {
    const email = jwt.verify(token as string, process.env.NEXTAUTH_SECRET!) as { email: string };
    if (!email) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const temp = await readData({id: userId});
    const realPassword = temp[0]?.password;
    if (!realPassword) {
      return res.status(400).json({ message: "User not found or password not set" });
    }
      const ivCiphertext = Buffer.from(temp[0].password, "base64");
        const iv = ivCiphertext.subarray(0, 16);
        const ciphertext = ivCiphertext.subarray(16);
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        const decryptedPassword = Buffer.concat([
          decipher.update(ciphertext),
          decipher.final(),
        ]).toString("utf-8");
    if (decryptedPassword !== currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password cannot be the same as the current password" });
    }
    //encrypt the new password
    const result = await updateData(userId,['password'],[encryptPassword(newPassword)]);
    if (!result) {
      return res.status(500).json({ message: "Failed to update password" });
    }
    return res.status(201).json({ message: "sucess" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}



