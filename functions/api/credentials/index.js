/**
 * Cloudflare Pages Function for Credential Management
 * Handles GET (retrieve) and POST (update) requests for /api/credentials
 */

export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === 'GET') {
    return handleGetCredentials(env, corsHeaders);
  } else if (request.method === 'POST') {
    return handleUpdateCredentials(request, env, corsHeaders);
  } else {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }
}

/**
 * Get stored credentials from KV
 */
async function handleGetCredentials(env, corsHeaders) {
  try {
    const credentials = await env.ADMIN_CREDENTIALS.get('admin', { type: 'json' });
    
    if (!credentials) {
      // Return default credentials if none stored
      const defaultCredentials = {
        email: 'admin@rayyanenterprises.in',
        password: 'AdminPassword123!',
        isDefault: true
      };
      return new Response(JSON.stringify(defaultCredentials), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ ...credentials, isDefault: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve credentials' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update credentials in KV
 */
async function handleUpdateCredentials(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { currentPassword, newEmail, newPassword } = body;
    
    // Get current credentials
    const currentCredentials = await env.ADMIN_CREDENTIALS.get('admin', { type: 'json' }) || {
      email: 'admin@rayyanenterprises.in',
      password: 'AdminPassword123!'
    };
    
    // Verify current password
    if (currentPassword !== currentCredentials.password) {
      return new Response(JSON.stringify({ error: 'Current password is incorrect' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Update credentials
    const updatedCredentials = {
      email: newEmail || currentCredentials.email,
      password: newPassword || currentCredentials.password,
      updatedAt: new Date().toISOString()
    };
    
    await env.ADMIN_CREDENTIALS.put('admin', JSON.stringify(updatedCredentials));
    
    return new Response(JSON.stringify({ success: true, credentials: updatedCredentials }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update credentials' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}