import { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "@/components/MysqlConnect/MysqlConnect";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import cors, { runMiddleware } from '@/../utils/cors';
import { readData, updateData } from "@/components/FirebaseQueries/FirebaseConnect";
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
  const { password,token } = req.body;
  if (!password || typeof password !== "string" || !token || typeof token !=='string') {
    return res.status(400).json({ message: "Invalid password or token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { email: string };
    const { email } = decoded;
    console.log("Decoded email:", email);
    
   /* const result = await executeQuery(
      "UPDATE userInfo SET password = ? WHERE email = ?",
      [encryptPassword(password), email]
    );*/
    const temp = await readData({email:email});
    console.log('temp' ,temp);
    const userid = temp[1];
    console.log('userid',userid);
    const result = await updateData(userid,['password'],[encryptPassword(password)]);
    console.log('result ',result);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }        
    return res.status(200).json({ redirectUrl: "http://localhost:5173/" });

  } catch (error) {
    console.error("Reset error:", error);
    return res.status(400).json({ message: "Something went wrong!" });
  }
}
