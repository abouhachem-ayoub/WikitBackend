import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mode, oobCode, continueUrl } = req.query || {};

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

  // Default response for any other case
  return res.status(200).json({ message: 'Firebase action handler ready' });
}