/**
 * Cloudflare Pages Function for Credential Verification
 * Handles POST requests for /api/credentials/verify
 */

export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === 'POST') {
    return handleVerifyCredentials(request, env, corsHeaders);
  } else {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }
}

/**
 * Verify credentials for login
 */
async function handleVerifyCredentials(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Get current credentials
    const credentials = await env.ADMIN_CREDENTIALS.get('admin', { type: 'json' }) || {
      email: 'admin@rayyanenterprises.in',
      password: 'AdminPassword123!'
    };
    
    // Verify credentials
    if (email.toLowerCase() === credentials.email.toLowerCase() && password === credentials.password) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: false }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to verify credentials' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}