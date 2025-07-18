import { NextApiRequest, NextApiResponse } from "next";
import cors, { runMiddleware } from '@/../utils/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle case where query is undefined during build time
  await runMiddleware(req, res, cors);
  if (!req.query) {
    return res.status(200).json({ message: 'Firebase action handler' });
  }

  const { mode, oobCode, continueUrl } = req.query;

  if (mode === 'verifyEmail' && oobCode && continueUrl) {
    try {
      // Extract email from continueUrl
      const url = new URL(continueUrl as string);
      const email = url.searchParams.get('email');
      
      // Redirect to your verify-email API with the parameters
      return res.redirect(302, `/api/auth/verify-email?oobCode=${oobCode}&email=${email}`);
    } catch (error) {
      console.error('Error processing verification:', error);
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
  }

  // Default response
  res.status(200).json({ message: 'Firebase action handler' });
}