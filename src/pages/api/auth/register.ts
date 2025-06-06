import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import insertData,{readData,canRegisterOrLogin} from "@/components/FirebaseQueries/FirebaseConnect";
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

  const { email, password, phone, firstName,lastName,pseudo,emailVerified} = req.body;

  if (!email || !pseudo) {
    return res.status(400).json({ message: "The fields are required" });
  }


  try {
    /*const result3 = await executeQuery(
      "select email from userInfo where email = ?",
      [email]
    );*/
    const checkEligibility = await canRegisterOrLogin(email);
    if(!checkEligibility.allowed){
      return res.status(401).json({ message: checkEligibility.message });
    }
    const result3 = await readData({email:email})
    // Query the database for the user
    if(result3.length ===0){
          /*const result = await executeQuery(
          "insert into userInfo(firstName,lastName,email,pseudo,password,phoneNumber) values(?,?,?,?,?,?)",
          [firstName,lastName,email,pseudo,encryptPassword(password),phone]
          );*/
      let toInsert;
      if(!emailVerified){
        toInsert = {
        firstName:firstName,
        lastName:lastName,
        email:email,
        pseudo:pseudo,
        password:encryptPassword(password),
        phone:phone,
        emailVerified: null
      }}
      else {
        toInsert = {
          firstName:firstName,
          lastName:lastName,
          email:email,
          pseudo:pseudo,
          password:encryptPassword(password),
          phone:phone,
          emailVerified: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      }
          const result = await insertData(
            toInsert
          );
          if (result === null || result.length === 0) {
              return res.status(401).json({ message: "something went wrong" });
              }
          else{
            //console.log(result);
            /*const result2 = await executeQuery(
              "select * from  userInfo where email = ?",
              [email]
            );*/
              const result2 = await readData({email:email});
              const token = jwt.sign(
                  { email: result2[0].email, isVerified: result2[0].emailVerified, userId : result2[0].id},
                  process.env.NEXTAUTH_SECRET!,
                  { expiresIn: "1h" },
                );
            return res.status(200).json({ message: "signup successful", email:email,token:token });
          }}

    else{
      /*const result2 = await executeQuery(
        "select * from  userInfo where email = ?",
        [email]
      );*/
      const result2 = await readData({email:email})
      const token = jwt.sign(
        { email: result2[0].email, isVerified: result2[0].isVerified, userId : result2[0].id },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "1h" },
      );
      return res.status(200).json({ message: "login successful", email:email,token:token });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}