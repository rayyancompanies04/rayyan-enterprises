/* ==========================================================================
   Rayyan Enterprises — Admin Portal JavaScript
   Handles authentication, document management, and UI interactions
   ========================================================================== */

(function() {
  "use strict";
  
  // Configuration
  const CONFIG = {
    ADMIN_EMAIL: 'admin@rayyanenterprises.in',
    ADMIN_PASSWORD: 'AdminPassword123!',
    SESSION_KEY: 'rayyan_admin_session',
    DOCUMENTS_KEY: 'rayyan_documents',
    CREDENTIALS_KEY: 'rayyan_admin_credentials',
    API_BASE_URL: '/api', // Relative path - works on same domain (rayyanenterprises.in)
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    MAX_KV_DOCUMENT_SIZE: 25 * 1024 * 1024 // KV max value size (25MB)
  };
  
  // Category labels and colors
  const CATEGORIES = {
    gst: { label: 'GST Documents', color: 'blue' },
    business: { label: 'Business Registration', color: 'green' },
    tax: { label: 'Tax Filings', color: 'purple' },
    banking: { label: 'Invoices', color: 'yellow' },
    contracts: { label: 'Contracts & Legal', color: 'orange' },
    misc: { label: 'Miscellaneous', color: 'gray' }
  };
  
  // Color classes for badges
  const COLOR_CLASSES = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  
  // Mock business documents
  const MOCK_DOCUMENTS = [
    {
      id: 'mock_1',
      title: 'GST Registration Certificate',
      category: 'gst',
      fileName: 'GST_Certificate.pdf',
      fileType: 'application/pdf',
      size: 245000, // ~245KB
      uploadDate: '2024-01-15',
      notes: 'Official GST registration document for Rayyan Enterprises',
      data: null, // Would contain Base64 data in real implementation
      isMock: true
    },
    {
      id: 'mock_2',
      title: 'PAN Card - Business',
      category: 'business',
      fileName: 'PAN_Card.pdf',
      fileType: 'application/pdf',
      size: 128000, // ~128KB
      uploadDate: '2024-02-20',
      notes: 'Permanent Account Number for business entity',
      data: null,
      isMock: true
    },
    {
      id: 'mock_3',
      title: 'GSTR-3B Filing - Q1 2024',
      category: 'tax',
      fileName: 'GSTR3B_Q1_2024.pdf',
      fileType: 'application/pdf',
      size: 156000, // ~156KB
      uploadDate: '2024-04-30',
      notes: 'GSTR-3B return filing for first quarter 2024',
      data: null,
      isMock: true
    }
  ];
  
  // State
  let state = {
    isAuthenticated: false,
    currentUser: null,
    documents: [],
    selectedFile: null,
    currentCategory: 'all',
    searchQuery: '',
    documentToDelete: null
  };
  
  // DOM Elements
  const elements = {
    // Login
    loginScreen: document.getElementById('loginScreen'),
    dashboard: document.getElementById('dashboard'),
    loginForm: document.getElementById('loginForm'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    passwordToggle: document.getElementById('passwordToggle'),
    eyeOpen: document.getElementById('eyeOpen'),
    eyeClosed: document.getElementById('eyeClosed'),
    loginError: document.getElementById('loginError'),
    
    // Dashboard
    userEmail: document.getElementById('userEmail'),
    logoutBtn: document.getElementById('logoutBtn'),
    mobileLogoutBtn: document.getElementById('mobileLogoutBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    searchInput: document.getElementById('searchInput'),
    mobileSearchInput: document.getElementById('mobileSearchInput'),
    categoryTabs: document.getElementById('categoryTabs'),
    settingsBtn: document.getElementById('settingsBtn'),
    mobileSettingsBtn: document.getElementById('mobileSettingsBtn'),
    
    // Metrics
    totalFiles: document.getElementById('totalFiles'),
    storageUsed: document.getElementById('storageUsed'),
    gstCount: document.getElementById('gstCount'),
    legalCount: document.getElementById('legalCount'),
    
    // Documents Table
    documentsTable: document.getElementById('documentsTable'),
    mobileDocumentsList: document.getElementById('mobileDocumentsList'),
    emptyState: document.getElementById('emptyState'),
    
    // Upload Modal
    uploadModal: document.getElementById('uploadModal'),
    uploadModalBackdrop: document.getElementById('uploadModalBackdrop'),
    closeUploadModal: document.getElementById('closeUploadModal'),
    uploadForm: document.getElementById('uploadForm'),
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),
    selectedFile: document.getElementById('selectedFile'),
    selectedFileName: document.getElementById('selectedFileName'),
    selectedFileSize: document.getElementById('selectedFileSize'),
    removeFile: document.getElementById('removeFile'),
    cancelUpload: document.getElementById('cancelUpload'),
    docTitle: document.getElementById('docTitle'),
    docCategory: document.getElementById('docCategory'),
    docNotes: document.getElementById('docNotes'),
    
    // Preview Modal
    previewModal: document.getElementById('previewModal'),
    previewModalBackdrop: document.getElementById('previewModalBackdrop'),
    closePreviewModal: document.getElementById('closePreviewModal'),
    previewTitle: document.getElementById('previewTitle'),
    previewContent: document.getElementById('previewContent'),
    previewDownload: document.getElementById('previewDownload'),
    
    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
    deleteFileName: document.getElementById('deleteFileName'),
    cancelDelete: document.getElementById('cancelDelete'),
    confirmDelete: document.getElementById('confirmDelete'),
    
    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    settingsModalBackdrop: document.getElementById('settingsModalBackdrop'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    settingsForm: document.getElementById('settingsForm'),
    currentPassword: document.getElementById('currentPassword'),
    newEmail: document.getElementById('newEmail'),
    newPassword: document.getElementById('newPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    cancelSettings: document.getElementById('cancelSettings'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
  };
  
  // Initialize
  async function init() {
    await loadCredentials();
    checkAuth();
    await loadDocuments();
    setupEventListeners();
  }
  
  // Credentials Management
  async function loadCredentials() {
    console.log('Loading credentials...');
    
    try {
      // Try to load from Cloudflare KV API
      console.log('Attempting to load from Cloudflare KV API:', `${CONFIG.API_BASE_URL}/credentials`);
      const response = await fetch(`${CONFIG.API_BASE_URL}/credentials`);
      console.log('KV API response status:', response.status);
      
      if (response.ok) {
        const credentials = await response.json();
        console.log('Loaded credentials from KV:', credentials);
        if (credentials.email && credentials.password) {
          CONFIG.ADMIN_EMAIL = credentials.email;
          CONFIG.ADMIN_PASSWORD = credentials.password;
          console.log('Credentials updated from KV');
          return;
        }
      }
    } catch (error) {
      console.log('Failed to load from KV, using localStorage fallback:', error);
    }
    
    // Fallback to localStorage
    console.log('Trying localStorage fallback...');
    const stored = localStorage.getItem(CONFIG.CREDENTIALS_KEY);
    if (stored) {
      try {
        const credentials = JSON.parse(stored);
        if (credentials.email && credentials.password) {
          CONFIG.ADMIN_EMAIL = credentials.email;
          CONFIG.ADMIN_PASSWORD = credentials.password;
          console.log('Credentials loaded from localStorage');
          return;
        }
      } catch (e) {
        console.log('localStorage data corrupted, using defaults');
      }
    }
    
    console.log('Using default credentials');
  }
  
  async function saveCredentials(email, password) {
    const credentials = {
      currentPassword: CONFIG.ADMIN_PASSWORD,
      newEmail: email,
      newPassword: password
    };
    
    try {
      // Try to save to Cloudflare KV API
      const response = await fetch(`${CONFIG.API_BASE_URL}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          CONFIG.ADMIN_EMAIL = result.credentials.email;
          CONFIG.ADMIN_PASSWORD = result.credentials.password;
          // Also save to localStorage as backup
          localStorage.setItem(CONFIG.CREDENTIALS_KEY, JSON.stringify(result.credentials));
          return true;
        }
      }
    } catch (error) {
      console.log('Failed to save to KV, using localStorage fallback');
    }
    
    // Fallback to localStorage
    const localCredentials = {
      email: email,
      password: password,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CONFIG.CREDENTIALS_KEY, JSON.stringify(localCredentials));
    CONFIG.ADMIN_EMAIL = email;
    CONFIG.ADMIN_PASSWORD = password;
    return true;
  }
  
  async function verifyCredentials(email, password) {
    console.log('Verifying credentials for:', email);
    
    try {
      // Try to verify via Cloudflare KV API
      console.log('Attempting KV verification at:', `${CONFIG.API_BASE_URL}/credentials/verify`);
      const response = await fetch(`${CONFIG.API_BASE_URL}/credentials/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('KV verification response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('KV verification result:', result);
        return result.success;
      } else {
        console.log('KV verification failed, using local fallback');
      }
    } catch (error) {
      console.log('Failed to verify via KV, using local fallback:', error);
    }
    
    // Fallback to local verification
    const localValid = email.toLowerCase() === CONFIG.ADMIN_EMAIL.toLowerCase() && password === CONFIG.ADMIN_PASSWORD;
    console.log('Local verification result:', localValid);
    console.log('Expected email:', CONFIG.ADMIN_EMAIL.toLowerCase());
    console.log('Expected password:', CONFIG.ADMIN_PASSWORD);
    return localValid;
  }
  
  // Authentication
  function checkAuth() {
    const session = localStorage.getItem(CONFIG.SESSION_KEY);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.isAuthenticated && sessionData.email === CONFIG.ADMIN_EMAIL) {
          state.isAuthenticated = true;
          state.currentUser = sessionData.email;
          showDashboard();
          return;
        }
      } catch (e) {
        localStorage.removeItem(CONFIG.SESSION_KEY);
      }
    }
    showLogin();
  }
  
  async function login(email, password) {
    try {
      // Load the most recent credentials before checking
      await loadCredentials();
      
      const isValid = await verifyCredentials(email, password);
      
      if (!isValid) {
        showLoginError();
        return false;
      }
      
      state.isAuthenticated = true;
      state.currentUser = email;
      
      const sessionData = {
        isAuthenticated: true,
        email: email,
        timestamp: Date.now()
      };
      
      localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sessionData));
      
      showToast('Login successful', 'success');
      showDashboard();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      showLoginError('Login failed. Please try again.');
      return false;
    }
  }
  
  function logout() {
    state.isAuthenticated = false;
    state.currentUser = null;
    localStorage.removeItem(CONFIG.SESSION_KEY);
    showLogin();
    showToast('Logged out successfully', 'info');
  }
  
  function showLogin() {
    elements.loginScreen.classList.remove('hidden');
    elements.dashboard.classList.add('hidden');
  }
  
  function showDashboard() {
    elements.loginScreen.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');
    elements.userEmail.textContent = state.currentUser;
    updateMetrics();
    renderDocuments();
  }
  
  function showLoginError(message = 'Invalid email or password. Please try again.') {
    elements.loginError.textContent = message;
    elements.loginError.classList.remove('hidden');
    setTimeout(() => {
      elements.loginError.classList.add('hidden');
    }, 5000);
  }
  
  // Document Management
  async function loadDocuments() {
    console.log('Loading documents...');
    
    try {
      // Try to load from Cloudflare KV API
      console.log('Attempting to load documents from KV API:', `${CONFIG.API_BASE_URL}/documents`);
      const response = await fetch(`${CONFIG.API_BASE_URL}/documents`);
      console.log('Documents API response status:', response.status);
      
      if (response.ok) {
        const documents = await response.json();
        console.log('Loaded documents from KV:', documents.length);
        state.documents = documents;
        return;
      } else {
        console.log('KV API returned non-OK status, using localStorage fallback');
      }
    } catch (error) {
      console.log('Failed to load from KV, using localStorage fallback:', error);
    }
    
    // Fallback to localStorage
    console.log('Trying localStorage fallback for documents...');
    const stored = localStorage.getItem(CONFIG.DOCUMENTS_KEY);
    if (stored) {
      try {
        const documents = JSON.parse(stored);
        console.log('Loaded documents from localStorage:', documents.length);
        state.documents = documents;
      } catch (e) {
        console.log('localStorage data corrupted, using mock documents');
        state.documents = [...MOCK_DOCUMENTS];
      }
    } else {
      console.log('No stored documents, using mock documents');
      state.documents = [...MOCK_DOCUMENTS];
      saveDocuments();
    }
  }
  
  async function saveDocuments() {
    console.log('Saving documents:', state.documents.length);
    
    try {
      // Try to save to Cloudflare KV API
      const totalSize = JSON.stringify(state.documents).length;
      console.log('Total document data size:', totalSize, 'bytes');
      
      if (totalSize > CONFIG.MAX_KV_DOCUMENT_SIZE) {
        console.log('Document data too large for KV, using localStorage fallback');
        throw new Error('Data exceeds KV size limit');
      }
      
      console.log('Attempting to save documents to KV API');
      const response = await fetch(`${CONFIG.API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ document: state.documents[0] }) // Send the new document
      });
      
      console.log('Documents save API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Documents saved to KV successfully');
        // Also save to localStorage as backup
        localStorage.setItem(CONFIG.DOCUMENTS_KEY, JSON.stringify(state.documents));
        return true;
      } else {
        console.log('KV save failed, using localStorage fallback');
        throw new Error('KV save failed');
      }
    } catch (error) {
      console.log('Failed to save to KV, using localStorage fallback:', error);
      // Fallback to localStorage
      localStorage.setItem(CONFIG.DOCUMENTS_KEY, JSON.stringify(state.documents));
      return true;
    }
  }
  
  async function deleteDocumentFromStorage(documentId) {
    console.log('Deleting document:', documentId);
    
    try {
      // Try to delete via Cloudflare KV API
      console.log('Attempting to delete document via KV API');
      const response = await fetch(`${CONFIG.API_BASE_URL}/documents`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentId })
      });
      
      console.log('Document delete API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Document deleted from KV successfully');
        // Also update localStorage
        localStorage.setItem(CONFIG.DOCUMENTS_KEY, JSON.stringify(result.documents));
        return result.documents;
      } else {
        console.log('KV delete failed, using local fallback');
        throw new Error('KV delete failed');
      }
    } catch (error) {
      console.log('Failed to delete from KV, using local fallback:', error);
      // Fallback to local deletion
      state.documents = state.documents.filter(doc => doc.id !== documentId);
      localStorage.setItem(CONFIG.DOCUMENTS_KEY, JSON.stringify(state.documents));
      return state.documents;
    }
  }
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  function updateMetrics() {
    const totalFiles = state.documents.length;
    const totalBytes = state.documents.reduce((sum, doc) => sum + doc.size, 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    
    const gstDocs = state.documents.filter(doc => doc.category === 'gst' || doc.category === 'tax').length;
    const legalDocs = state.documents.filter(doc => doc.category === 'contracts').length;
    
    elements.totalFiles.textContent = totalFiles;
    elements.storageUsed.textContent = totalMB + ' MB';
    elements.gstCount.textContent = gstDocs;
    elements.legalCount.textContent = legalDocs;
  }
  
  function getFilteredDocuments() {
    let filtered = state.documents;
    
    // Filter by category
    if (state.currentCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === state.currentCategory);
    }
    
    // Filter by search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.fileName.toLowerCase().includes(query) ||
        (doc.notes && doc.notes.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }
  
  function renderDocuments() {
    const filtered = getFilteredDocuments();
    
    if (filtered.length === 0) {
      elements.documentsTable.innerHTML = '';
      elements.mobileDocumentsList.innerHTML = '';
      elements.emptyState.classList.remove('hidden');
      return;
    }
    
    elements.emptyState.classList.add('hidden');
    
    // Desktop Table View
    let desktopHtml = '';
    filtered.forEach(doc => {
      const categoryInfo = CATEGORIES[doc.category] || { label: doc.category, color: 'gray' };
      const colorClass = COLOR_CLASSES[categoryInfo.color] || COLOR_CLASSES.gray;
      const uploadDate = new Date(doc.uploadDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      desktopHtml += `
        <tr class="document-row transition-colors border-b border-gray-100">
          <td class="px-6 py-4">
            <div class="flex flex-col">
              <button class="document-title-btn text-left font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors" data-id="${doc.id}">
                ${escapeHtml(doc.title)}
              </button>
              ${doc.notes ? `<span class="text-sm text-gray-500 mt-1">${escapeHtml(doc.notes)}</span>` : ''}
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="inline-flex px-3 py-1 rounded-full text-xs font-medium ${colorClass}">
              ${categoryInfo.label}
            </span>
          </td>
          <td class="px-6 py-4">
            <div class="flex flex-col">
              <span class="text-gray-900 text-sm">${escapeHtml(doc.fileName)}</span>
              <span class="text-xs text-gray-500">${formatFileSize(doc.size)}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-600 text-sm">
            ${uploadDate}
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button class="preview-btn p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors" data-id="${doc.id}" title="Preview">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
              <button class="download-btn p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-green-600 transition-colors" data-id="${doc.id}" title="Download">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
              <button class="delete-btn p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors" data-id="${doc.id}" title="Delete">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    
    elements.documentsTable.innerHTML = desktopHtml;
    
    // Mobile Card View
    let mobileHtml = '';
    filtered.forEach(doc => {
      const categoryInfo = CATEGORIES[doc.category] || { label: doc.category, color: 'gray' };
      const colorClass = COLOR_CLASSES[categoryInfo.color] || COLOR_CLASSES.gray;
      const uploadDate = new Date(doc.uploadDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      mobileHtml += `
        <div class="p-4 bg-white hover:bg-gray-50 transition-colors">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1 pr-4">
              <button class="document-title-btn text-left font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors" data-id="${doc.id}">
                ${escapeHtml(doc.title)}
              </button>
              ${doc.notes ? `<p class="text-sm text-gray-500 mt-1">${escapeHtml(doc.notes)}</p>` : ''}
            </div>
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium ${colorClass} flex-shrink-0">
              ${categoryInfo.label}
            </span>
          </div>
          
          <div class="flex justify-between items-center text-sm text-gray-500 mb-3">
            <div>
              <p class="text-gray-900">${escapeHtml(doc.fileName)}</p>
              <p class="text-xs">${formatFileSize(doc.size)}</p>
            </div>
            <p class="text-xs">${uploadDate}</p>
          </div>
          
          <div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button class="preview-btn flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium" data-id="${doc.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Preview
            </button>
            <button class="download-btn flex items-center gap-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-sm font-medium" data-id="${doc.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download
            </button>
            <button class="delete-btn flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium" data-id="${doc.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      `;
    });
    
    elements.mobileDocumentsList.innerHTML = mobileHtml;
    attachDocumentActionListeners();
  }
  
  function attachDocumentActionListeners() {
    document.querySelectorAll('.preview-btn').forEach(btn => {
      btn.addEventListener('click', () => previewDocument(btn.dataset.id));
    });
    
    document.querySelectorAll('.document-title-btn').forEach(btn => {
      btn.addEventListener('click', () => previewDocument(btn.dataset.id));
    });
    
    document.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', () => downloadDocument(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => showDeleteConfirmation(btn.dataset.id));
    });
  }
  
  // File Upload
  function handleFileSelect(file) {
    if (!file) return;
    
    // Validate file type
    if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
      showToast('Invalid file type. Please upload PDF, PNG, JPG, JPEG, DOCX, or XLSX files.', 'error');
      return;
    }
    
    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      showToast('File size exceeds 10MB limit.', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      state.selectedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: e.target.result
      };
      
      elements.selectedFileName.textContent = file.name;
      elements.selectedFileSize.textContent = formatFileSize(file.size);
      elements.selectedFile.classList.remove('hidden');
      elements.uploadZone.classList.add('hidden');
    };
    
    reader.readAsDataURL(file);
  }
  
  async function uploadDocument() {
    const title = elements.docTitle.value.trim();
    const category = elements.docCategory.value;
    const notes = elements.docNotes.value.trim();
    
    if (!title) {
      showToast('Please enter a document title', 'error');
      return;
    }
    
    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }
    
    if (!state.selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }
    
    const document = {
      id: Date.now().toString(),
      title: title,
      category: category,
      fileName: state.selectedFile.name,
      fileType: state.selectedFile.type,
      size: state.selectedFile.size,
      uploadDate: new Date().toISOString().split('T')[0],
      notes: notes,
      data: state.selectedFile.data,
      isMock: false
    };
    
    state.documents.unshift(document);
    await saveDocuments();
    
    // Reset form
    resetUploadForm();
    closeUploadModalFn();
    
    // Update UI
    updateMetrics();
    renderDocuments();
    
    showToast('Document uploaded successfully', 'success');
  }
  
  function resetUploadForm() {
    elements.uploadForm.reset();
    state.selectedFile = null;
    elements.selectedFile.classList.add('hidden');
    elements.uploadZone.classList.remove('hidden');
    elements.fileInput.value = '';
  }
  
  function closeUploadModalFn() {
    elements.uploadModal.classList.add('hidden');
    resetUploadForm();
  }
  
  // Preview
  function previewDocument(id) {
    const doc = state.documents.find(d => d.id === id);
    if (!doc) return;
    
    elements.previewTitle.textContent = doc.title;
    
    let previewContent = '';
    
    if (doc.isMock) {
      // Mock documents don't have actual data
      previewContent = `
        <div class="text-center p-8">
          <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-600 dark:text-gray-400 mb-2">This is a mock document</p>
          <p class="text-sm text-gray-500 dark:text-slate-500">Mock documents are pre-loaded samples for demonstration purposes.</p>
        </div>
      `;
      elements.previewDownload.style.display = 'none';
    } else if (doc.fileType === 'application/pdf') {
      previewContent = `<iframe src="${doc.data}" type="application/pdf"></iframe>`;
      elements.previewDownload.href = doc.data;
      elements.previewDownload.download = doc.fileName;
      elements.previewDownload.style.display = 'block';
    } else if (doc.fileType.startsWith('image/')) {
      previewContent = `<img src="${doc.data}" alt="${escapeHtml(doc.title)}">`;
      elements.previewDownload.href = doc.data;
      elements.previewDownload.download = doc.fileName;
      elements.previewDownload.style.display = 'block';
    } else {
      previewContent = `
        <div class="text-center p-8">
          <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-600 dark:text-gray-400 mb-2">Preview not available</p>
          <p class="text-sm text-gray-500 dark:text-slate-500">Please download the file to view it</p>
        </div>
      `;
      elements.previewDownload.href = doc.data;
      elements.previewDownload.download = doc.fileName;
      elements.previewDownload.style.display = 'block';
    }
    
    elements.previewContent.innerHTML = previewContent;
    elements.previewModal.classList.remove('hidden');
  }
  
  function closePreviewModalFn() {
    elements.previewModal.classList.add('hidden');
  }
  
  // Download
  function downloadDocument(id) {
    const doc = state.documents.find(d => d.id === id);
    if (!doc) return;
    
    if (doc.isMock) {
      showToast('Mock documents cannot be downloaded', 'info');
      return;
    }
    
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Download started', 'success');
  }
  
  // Delete
  function showDeleteConfirmation(id) {
    const doc = state.documents.find(d => d.id === id);
    if (!doc) return;
    
    state.documentToDelete = id;
    elements.deleteFileName.textContent = doc.title;
    elements.deleteModal.classList.remove('hidden');
  }
  
  async function deleteDocument() {
    if (!state.documentToDelete) return;
    
    state.documents = await deleteDocumentFromStorage(state.documentToDelete);
    
    state.documentToDelete = null;
    elements.deleteModal.classList.add('hidden');
    
    updateMetrics();
    renderDocuments();
    
    showToast('Document deleted successfully', 'success');
  }
  
  // Category Filter
  function setCategory(category) {
    state.currentCategory = category;
    
    // Update tab styles
    document.querySelectorAll('.category-tab').forEach(tab => {
      if (tab.dataset.category === category) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    renderDocuments();
  }
  
  // Search
  function handleSearch(query) {
    state.searchQuery = query;
    renderDocuments();
  }
  
  // Settings Modal
  function openSettingsModal() {
    elements.settingsModal.classList.remove('hidden');
    elements.settingsForm.reset();
  }
  
  function closeSettingsModalFn() {
    elements.settingsModal.classList.add('hidden');
    elements.settingsForm.reset();
  }
  
  async function updateCredentials() {
    const currentPassword = elements.currentPassword.value;
    const newEmail = elements.newEmail.value.trim();
    const newPassword = elements.newPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    
    // Verify current password
    if (currentPassword !== CONFIG.ADMIN_PASSWORD) {
      showToast('Current password is incorrect', 'error');
      return;
    }
    
    // If changing email
    if (newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
    }
    
    // If changing password
    if (newPassword) {
      if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
    }
    
    // Update credentials
    const updatedEmail = newEmail || CONFIG.ADMIN_EMAIL;
    const updatedPassword = newPassword || CONFIG.ADMIN_PASSWORD;
    
    const success = await saveCredentials(updatedEmail, updatedPassword);
    
    if (success) {
      // Update current user if email changed
      if (newEmail && state.currentUser) {
        state.currentUser = updatedEmail;
        elements.userEmail.textContent = updatedEmail;
      }
      
      closeSettingsModalFn();
      showToast('Credentials updated successfully', 'success');
    } else {
      showToast('Failed to update credentials', 'error');
    }
  }
  
  // Toast Notifications
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    
    let bgColor, icon;
    switch (type) {
      case 'success':
        bgColor = 'bg-green-500';
        icon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        break;
      case 'error':
        bgColor = 'bg-red-500';
        icon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
        break;
      default:
        bgColor = 'bg-blue-500';
        icon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    }
    
    toast.className = `toast ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`;
    toast.innerHTML = `
      ${icon}
      <span class="flex-1">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
  
  // Utility
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Event Listeners
  function setupEventListeners() {
    // Mobile search
    elements.mobileSearchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });
    
    // Settings buttons
    elements.settingsBtn.addEventListener('click', openSettingsModal);
    elements.mobileSettingsBtn.addEventListener('click', openSettingsModal);
    
    // Settings modal
    elements.closeSettingsModal.addEventListener('click', closeSettingsModalFn);
    elements.settingsModalBackdrop.addEventListener('click', closeSettingsModalFn);
    elements.cancelSettings.addEventListener('click', closeSettingsModalFn);
    elements.settingsForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      await updateCredentials();
    });
    
    // Login form
    elements.loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = elements.email.value.trim();
      const password = elements.password.value;
      await login(email, password);
    });
    
    // Password toggle
    elements.passwordToggle.addEventListener('click', function() {
      const type = elements.password.type === 'password' ? 'text' : 'password';
      elements.password.type = type;
      elements.eyeOpen.classList.toggle('hidden', type === 'text');
      elements.eyeClosed.classList.toggle('hidden', type === 'password');
    });
    
    // Logout (both desktop and mobile buttons)
    document.querySelectorAll('#logoutBtn, #mobileLogoutBtn').forEach(btn => {
      btn.addEventListener('click', logout);
    });
    
    // Upload button
    elements.uploadBtn.addEventListener('click', () => {
      elements.uploadModal.classList.remove('hidden');
    });
    
    // Close upload modal
    elements.closeUploadModal.addEventListener('click', closeUploadModalFn);
    elements.uploadModalBackdrop.addEventListener('click', closeUploadModalFn);
    elements.cancelUpload.addEventListener('click', closeUploadModalFn);
    
    // File input
    elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
    
    // Drag and drop
    elements.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.uploadZone.classList.add('dragover');
    });
    
    elements.uploadZone.addEventListener('dragleave', () => {
      elements.uploadZone.classList.remove('dragover');
    });
    
    elements.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.uploadZone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
    
    // Remove file
    elements.removeFile.addEventListener('click', () => {
      state.selectedFile = null;
      elements.selectedFile.classList.add('hidden');
      elements.uploadZone.classList.remove('hidden');
      elements.fileInput.value = '';
    });
    
    // Upload form submit
    elements.uploadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      await uploadDocument();
    });
    
    // Category tabs
    elements.categoryTabs.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-tab')) {
        setCategory(e.target.dataset.category);
      }
    });
    
    // Search
    elements.searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });
    
    // Preview modal
    elements.closePreviewModal.addEventListener('click', closePreviewModalFn);
    elements.previewModalBackdrop.addEventListener('click', closePreviewModalFn);
    
    // Delete modal
    elements.deleteModalBackdrop.addEventListener('click', () => {
      elements.deleteModal.classList.add('hidden');
    });
    elements.cancelDelete.addEventListener('click', () => {
      elements.deleteModal.classList.add('hidden');
    });
    elements.confirmDelete.addEventListener('click', deleteDocument);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeUploadModalFn();
        closePreviewModalFn();
        closeSettingsModalFn();
        elements.deleteModal.classList.add('hidden');
      }
    });
  }
  
  // Initialize
  init();
  
})();