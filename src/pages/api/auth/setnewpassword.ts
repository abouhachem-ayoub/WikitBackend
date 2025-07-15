import { NextApiRequest, NextApiResponse } from "next";
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
  //const { password,token } = req.body;
  const { email, password } = req.body as { email: string; password: string };
  if (!password || typeof password !== "string" ||!email || typeof email !=="string" )//|| !token || typeof token !=='string') {
    return res.status(400).json({ message: "Invalid password or token" });
  try {
    //const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { email: string };
    //const { email } = decoded;
    //console.log("Decoded email:", email);
    
   /* const result = await executeQuery(
      "UPDATE userInfo SET password = ? WHERE email = ?",
      [encryptPassword(password), email]
    );*/
    const temp = await readData({email:email});
    console.log('temp' ,temp);
    const userid = temp[0].id;
    console.log('userid',userid);
    const result = await updateData(userid,['password'],[encryptPassword(password)]);
    console.log('result ',result);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    
    //add login logic here to set the user as logged in

    // Generate a new token for the user
        const token2 = jwt.sign(
          { email: temp[0].email, isVerified: temp[0].emailVerified, userId : temp[0].id },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: "1h" },
        );
    //send the user to the front end with a success message
    return res.status(200).json({ message: "Password reset successful", token: token2, user_id: temp[0].id });
  } catch (error) {
    console.error("Reset error:", error);
    return res.status(400).json({ message: "Something went wrong!" });
  }
}
