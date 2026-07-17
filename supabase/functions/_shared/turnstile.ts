type TurnstileResult = {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
};

function requesterIp(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
}

export async function verifyTurnstile(request: Request, token: unknown, expectedAction: 'registration' | 'sponsor') {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret || typeof token !== 'string' || token.length < 10 || token.length > 2048) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: requesterIp(request), idempotency_key: crypto.randomUUID() }),
    });
    const result = await response.json() as TurnstileResult;
    const configuredHostname = new URL(Deno.env.get('PUBLIC_SITE_URL') || 'https://entre-nos-eta.vercel.app').hostname;
    const valid = response.ok && result.success === true && result.action === expectedAction && result.hostname === configuredHostname;
    if (!valid) console.error('Turnstile validation rejected', { status: response.status, action: result.action, hostname: result.hostname, errors: result['error-codes'] });
    return valid;
  } catch (error) {
    console.error('Turnstile validation error', error);
    return false;
  }
}
