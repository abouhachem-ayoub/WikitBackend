import { NextApiRequest, NextApiResponse } from "next";
import { deleteAccount ,readData} from "@/components/FirebaseQueries/FirebaseConnect";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import cors, { runMiddleware } from '@/../utils/cors';
const key = Buffer.from("MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=", "base64");
const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, cors);
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1]; 
  const {password} = req.body;
  // Extract the token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
       if (!secret) {
              return res.status(401).json({ message: "something went very wrong." });
           }
           const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
           // Access the userId from the decoded token
           const userId = decoded.userId;
           const email = decoded.email;

            const result = await readData({email:email});
           
               if (result.length === 0) {
                 return res.status(401).json({ message: "Could not perform this operation, try again or contact admin!" });
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

    // Call the deleteAccount function
    await deleteAccount(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error:unknown) {
    if(error instanceof Error){
    console.error("Error deleting account:", error);
    res.status(500).json({ message: error.message || "Failed to delete account" });}
    else{
        console.log('unkown error :',error);
        res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}