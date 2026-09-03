export interface VerifiedGoogleUser {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  emailVerified: boolean;
}

export async function verifyGoogleIdToken(token: string): Promise<VerifiedGoogleUser> {
  if (!token || typeof token !== 'string') {
    throw new Error('Google credential token is required');
  }

  // Hermetic test bypass for automated unit tests
  if (process.env.NODE_ENV === 'test' && token.startsWith('test-google-token:')) {
    const [, testEmail, testGoogleId, testFirstName, testLastName] = token.split(':');
    return {
      email: (testEmail || 'test.google@example.com').toLowerCase().trim(),
      googleId: testGoogleId || 'google-test-id-12345',
      firstName: testFirstName || 'Google',
      lastName: testLastName || 'User',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
      emailVerified: true,
    };
  }

  const tokenUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`;
  
  const response = await fetch(tokenUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as any;
    throw new Error(errorData?.error_description || 'Invalid Google credential token');
  }

  const payload = (await response.json()) as {
    iss?: string;
    sub?: string;
    aud?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    exp?: string;
  };

  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    throw new Error('Invalid token issuer');
  }

  if (payload.exp && Number(payload.exp) * 1000 < Date.now()) {
    throw new Error('Google token has expired');
  }

  const expectedClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (expectedClientId && payload.aud !== expectedClientId) {
    throw new Error('Google token audience does not match configured client ID');
  }

  const isVerified = payload.email_verified === true || payload.email_verified === 'true';
  if (!isVerified || !payload.email) {
    throw new Error('Google account email is not verified');
  }

  if (!payload.sub) {
    throw new Error('Google user identifier (sub) missing from token');
  }

  const email = payload.email.toLowerCase().trim();
  const firstName = (payload.given_name || payload.name?.split(' ')[0] || 'User').trim();
  const lastName = (payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '').trim();

  return {
    googleId: payload.sub,
    email,
    firstName,
    lastName,
    avatar: payload.picture,
    emailVerified: isVerified,
  };
}
