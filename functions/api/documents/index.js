/**
 * Cloudflare Pages Function for Document Management
 * Handles GET (list), POST (upload), DELETE operations for /api/documents
 */

export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === 'GET') {
    return handleGetDocuments(env, corsHeaders);
  } else if (request.method === 'POST') {
    return handleUploadDocument(request, env, corsHeaders);
  } else if (request.method === 'DELETE') {
    return handleDeleteDocument(request, env, corsHeaders);
  } else {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }
}

/**
 * Get all documents from KV
 */
async function handleGetDocuments(env, corsHeaders) {
  try {
    const documents = await env.ADMIN_DOCUMENTS.get('all', { type: 'json' }) || [];
    return new Response(JSON.stringify(documents), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve documents' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Upload document to KV
 */
async function handleUploadDocument(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { document } = body;
    
    // Get existing documents
    const documents = await env.ADMIN_DOCUMENTS.get('all', { type: 'json' }) || [];
    
    // Add new document at the beginning
    documents.unshift(document);
    
    // Save to KV
    await env.ADMIN_DOCUMENTS.put('all', JSON.stringify(documents));
    
    return new Response(JSON.stringify({ success: true, documents }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to upload document: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Delete document from KV
 */
async function handleDeleteDocument(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { documentId } = body;
    
    // Get existing documents
    const documents = await env.ADMIN_DOCUMENTS.get('all', { type: 'json' }) || [];
    
    // Remove document
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    
    // Save to KV
    await env.ADMIN_DOCUMENTS.put('all', JSON.stringify(updatedDocuments));
    
    return new Response(JSON.stringify({ success: true, documents: updatedDocuments }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete document' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}