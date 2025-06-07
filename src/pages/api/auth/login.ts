import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import cors, { runMiddleware } from '@/../utils/cors';
import { readData,canRegisterOrLogin,updateData } from "@/components/FirebaseQueries/FirebaseConnect";
const key = Buffer.from("MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=", "base64");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password,allowpasswordless} = req.body;


  if(!allowpasswordless){
  if ((!email || !password)) {
    return res.status(400).json({ message: "Email and password are required" });
    }
  }
  const checkEligibility = await canRegisterOrLogin(email);
  if(!checkEligibility.allowed){
    return res.status(401).json({ message: checkEligibility.message });
  }
  if(allowpasswordless){
    try{
      const result = await readData({email:email});
      if (result.length === 0) {
        return res.status(401).json({ message: "This email is not registered." });
      }
      // Check if the user is verified
      if (result[0].emailVerified === null) {
        //update the userverified status to current time
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await updateData(result[0].id, ['emailVerified'], [currentTime]);
      }
      const token = jwt.sign(
        { email: result[0].email, isVerified: result[0].emailVerified, userId : result[0].id },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "1h" },
      );
      return res.status(200).json({ message: "Login successful", token:token,user_id:result[0].id,user:JSON.stringify(result[0])});
    }
    catch(error){
      return res.status(500).json({ message: "Internal server error"+error});

    }
  }
  try {
    console.log("Received credentials:", { email, password });

    // Query the database for the user
    /*const result = await executeQuery(
      "SELECT userId, email, password, emailVerified FROM userInfo WHERE email = ?",
      [email]
    );*/

    const result = await readData({email:email});

    if (result.length === 0) {
      return res.status(401).json({ message: "This email is not registered." });
    }

    // Decrypt the stored password
    const ivCiphertext = Buffer.from(result[0].password, "base64");
    const iv = ivCiphertext.subarray(0, 16);
    const ciphertext = ivCiphertext.subarray(16);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const decryptedPassword = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf-8");

    if (decryptedPassword !== password) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { email: result[0].email, isVerified: result[0].emailVerified, userId : result[0].id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1h" },
    );
    return res.status(200).json({ message: "Login successful", token:token,user_id:result[0].id,user:JSON.stringify(result[0])});
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}