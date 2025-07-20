import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function FirebaseRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const { mode, oobCode, continueUrl } = router.query;

    // Handle email verification
    if (mode === 'verifyEmail' && oobCode && continueUrl) {
      const apiUrl = `/api/firebase-handler?mode=${mode}&oobCode=${oobCode}&continueUrl=${encodeURIComponent(continueUrl as string)}`;
      window.location.href = apiUrl;
    }

    // Handle password reset
    if (mode === 'resetPassword' && oobCode && continueUrl) {
      const apiUrl = `/api/firebase-handler?mode=${mode}&oobCode=${oobCode}&continueUrl=${encodeURIComponent(continueUrl as string)}`;
      window.location.href = apiUrl;
    }
  }, [router.query]);

  // Dynamic content based on mode
  const { mode } = router.query;
  
  if (mode === 'resetPassword') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Processing password reset...</h2>
        <p>Please wait while we redirect you to reset your password.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Processing email verification...</h2>
      <p>Please wait while we verify your email.</p>
    </div>
  );
}