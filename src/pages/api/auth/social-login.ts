   import { signIn } from "next-auth/react";
   import { NextApiRequest, NextApiResponse } from "next";
   import cors, { runMiddleware } from '@/../utils/cors';
   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, cors);
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }
   try {
      const provider = req.body
      const result = await signIn(provider, { callbackUrl: "http://localhost:5173/wikit" });
      if (!result?.ok) {
        return res.status(400).json({ message: "Social login failed" });
    }
    else{
        return res.status(200).json({ message: "Sucess",result:result})
    }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Social login failed" });
      //toast.error("Social login failed. Please try again.");
    }
  };