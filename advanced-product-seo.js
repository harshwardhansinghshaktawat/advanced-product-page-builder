class ProductSEODashboard extends HTMLElement {
    constructor() {
        super();
        console.log('🔷 Dashboard Constructor: Initializing...');
        this._shadow = this.attachShadow({ mode: 'open' });
        this._products = [];
        this._seoItems = [];
        this._currentPage = 0;
        this._pageSize = 12;
        this._totalProducts = 0;
        this._selectedProduct = null;
        this._editMode = false;
        this._showingForm = false;
        this._formData = {};
        this._reviews = [];
        this._faqs = [];
        this._variants = [];
        this._certifications = [];
        this._shippingConditions = [];
        this._root = document.createElement('div');
        
        this._createStructure();
        this._setupEventListeners();
        console.log('🔷 Dashboard Constructor: Complete');
    }
    
    static get observedAttributes() {
        return ['product-data', 'notification'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`🔷 Dashboard attributeChangedCallback: ${name}`);
        
        if (name === 'product-data' && newValue && newValue !== oldValue) {
            try {
                const data = JSON.parse(newValue);
                console.log('🔷 Dashboard: Parsed data successfully');
                this.setProducts(data);
            } catch (e) {
                console.error('🔷 Dashboard: Error parsing product data:', e);
            }
        }
        
        if (name === 'notification' && newValue && newValue !== oldValue) {
            try {
                const notification = JSON.parse(newValue);
                if (notification.type === 'success') {
                    this._showToast('success', notification.message);
                    this._hideForm();
                } else if (notification.type === 'error') {
                    this._showToast('error', notification.message);
                }
            } catch (e) {
                console.error('🔷 Dashboard: Error parsing notification:', e);
            }
        }
    }
    
    connectedCallback() {
        console.log('🔷 Dashboard connectedCallback: Element connected to DOM');
    }
    
    _createStructure() {
        this._root.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                :host {
                    --primary: #2563eb;
                    --primary-dark: #1d4ed8;
                    --primary-light: #dbeafe;
                    --success: #10b981;
                    --warning: #f59e0b;
                    --error: #ef4444;
                    --purple: #9333ea;
                    --bg-primary: #ffffff;
                    --bg-secondary: #f9fafb;
                    --bg-tertiary: #f3f4f6;
                    --text-primary: #111827;
                    --text-secondary: #6b7280;
                    --text-tertiary: #9ca3af;
                    --border: #e5e7eb;
                    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    display: block;
                    width: 100%;
                    min-height: 600px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-size: 14px;
                    color: var(--text-primary);
                    background: var(--bg-secondary);
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                .dashboard-container {
                    width: 100%;
                    min-height: 600px;
                    display: flex;
                    flex-direction: column;
                }
                
                .dashboard-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 32px;
                    box-shadow: var(--shadow-lg);
                }
                
                .header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .dashboard-title {
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }
                
                .dashboard-subtitle {
                    font-size: 16px;
                    opacity: 0.95;
                    line-height: 1.6;
                    font-weight: 400;
                }
                
                .stats-bar {
                    display: flex;
                    gap: 24px;
                    margin-top: 24px;
                    flex-wrap: wrap;
                }
                
                .stat-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    padding: 16px 20px;
                    border-radius: 12px;
                    min-width: 140px;
                }
                
                .stat-label {
                    font-size: 13px;
                    opacity: 0.9;
                    font-weight: 500;
                }
                
                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                }
                
                .main-content {
                    flex: 1;
                    padding: 32px;
                    min-height: 400px;
                }
                
                .content-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .view-container {
                    display: none;
                }
                
                .view-container.active {
                    display: block;
                }
                
                /* Products Grid */
                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }
                
                .product-card {
                    background: var(--bg-primary);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                    border: 1px solid var(--border);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                }
                
                .product-card:hover {
                    box-shadow: var(--shadow-xl);
                    transform: translateY(-8px);
                    border-color: var(--primary-light);
                }
                
                .product-image {
                    width: 100%;
                    height: 220px;
                    object-fit: cover;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }
                
                .product-info {
                    padding: 20px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .product-name {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 12px;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .product-price {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--primary);
                    margin-bottom: 16px;
                }
                
                .seo-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 16px;
                    width: fit-content;
                }
                
                .seo-status-active {
                    background: #d1fae5;
                    color: #065f46;
                }
                
                .seo-status-none {
                    background: #fee2e2;
                    color: #991b1b;
                }
                
                .product-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: auto;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 10px;
                }
                
                .btn {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-family: inherit;
                    text-align: center;
                    white-space: nowrap;
                    text-decoration: none;
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                .btn-primary {
                    background: var(--primary);
                    color: white;
                }
                
                .btn-primary:hover {
                    background: var(--primary-dark);
                }
                
                .btn-success {
                    background: var(--success);
                    color: white;
                }
                
                .btn-warning {
                    background: var(--warning);
                    color: white;
                }
                
                .btn-danger {
                    background: var(--error);
                    color: white;
                }
                
                .btn-purple {
                    background: var(--purple);
                    color: white;
                }
                
                .btn-purple:hover {
                    background: #7e22ce;
                }
                
                .btn-secondary {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                }
                
                .btn-small {
                    padding: 8px 14px;
                    font-size: 12px;
                }
                
                /* Single Form */
                .seo-form-container {
                    background: var(--bg-primary);
                    border-radius: 20px;
                    box-shadow: var(--shadow-xl);
                    overflow: hidden;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .form-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 24px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .form-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .form-title {
                    font-size: 24px;
                    font-weight: 700;
                }
                
                .form-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    transition: background 0.2s;
                }
                
                .form-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                .form-body {
                    padding: 32px;
                    max-height: 70vh;
                    overflow-y: auto;
                }
                
                .info-box {
                    background: linear-gradient(135deg, #e0e7ff 0%, #cffafe 100%);
                    border-left: 4px solid var(--primary);
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }
                
                .info-box-title {
                    font-weight: 700;
                    color: var(--primary);
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .info-box-text {
                    font-size: 13px;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }
                
                .warning-box {
                    background: #fef3c7;
                    border-left: 4px solid var(--warning);
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                }
                
                .warning-box-title {
                    font-weight: 700;
                    color: #92400e;
                    margin-bottom: 8px;
                }
                
                .warning-box-text {
                    font-size: 13px;
                    color: #78350f;
                    line-height: 1.6;
                }
                
                .form-section {
                    margin-bottom: 32px;
                }
                
                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    padding: 16px;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    margin-bottom: 16px;
                    transition: all 0.2s;
                }
                
                .section-header:hover {
                    background: var(--bg-tertiary);
                }
                
                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .section-toggle {
                    font-size: 24px;
                    color: var(--text-secondary);
                    transition: transform 0.3s;
                }
                
                .section-header.collapsed .section-toggle {
                    transform: rotate(-90deg);
                }
                
                .section-content {
                    max-height: 5000px;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                }
                
                .section-content.collapsed {
                    max-height: 0;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                    font-size: 14px;
                }
                
                .form-label.required::after {
                    content: '*';
                    color: var(--error);
                    margin-left: 4px;
                }
                
                .form-label-badge {
                    display: inline-block;
                    background: var(--primary-light);
                    color: var(--primary);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-left: 8px;
                }
                
                .form-input,
                .form-textarea,
                .form-select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid var(--border);
                    border-radius: 10px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: all 0.2s;
                    background: var(--bg-primary);
                }
                
                .form-input:focus,
                .form-textarea:focus,
                .form-select:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                
                .form-textarea {
                    resize: vertical;
                    min-height: 100px;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .form-row-3 {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 16px;
                }
                
                .help-text {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-top: 6px;
                    line-height: 1.5;
                }
                
                .help-text strong {
                    color: var(--text-primary);
                }
                
                /* Dynamic Lists */
                .dynamic-list {
                    margin-top: 16px;
                }
                
                .dynamic-item {
                    background: var(--bg-secondary);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    border: 2px solid var(--border);
                    position: relative;
                }
                
                .dynamic-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                
                .dynamic-item-title {
                    font-weight: 700;
                    color: var(--text-primary);
                }
                
                .btn-remove {
                    background: var(--error);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    font-weight: 600;
                }
                
                .btn-add {
                    background: var(--success);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-size: 14px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 12px;
                }
                
                .btn-add:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                .form-footer {
                    padding: 24px 32px;
                    background: var(--bg-secondary);
                    border-top: 2px solid var(--border);
                    display: flex;
                    gap: 16px;
                    justify-content: flex-end;
                }
                
                .loading-container,
                .empty-state {
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 20px;
                    min-height: 400px;
                }
                
                .loading-container.active,
                .empty-state.active {
                    display: flex;
                }
                
                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid var(--border);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 20px;
                    border-radius: 12px;
                    box-shadow: var(--shadow-xl);
                    display: none;
                    align-items: center;
                    gap: 12px;
                    z-index: 2000;
                    animation: slideIn 0.3s ease;
                    min-width: 320px;
                }
                
                .toast-notification.show {
                    display: flex;
                }
                
                .toast-success {
                    background: #f0fdf4;
                    border-left: 4px solid var(--success);
                    color: #166534;
                }
                
                .toast-error {
                    background: #fef2f2;
                    border-left: 4px solid var(--error);
                    color: #991b1b;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 32px 0;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .form-row,
                    .form-row-3 {
                        grid-template-columns: 1fr;
                    }
                    
                    .products-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                    }
                }
            </style>
            
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <div class="header-content">
                        <h1 class="dashboard-title">Product SEO Manager</h1>
                        <p class="dashboard-subtitle">
                            Professional SEO optimization with Google-compliant structured data
                        </p>
                        <div class="stats-bar">
                            <div class="stat-item">
                                <span class="stat-label">Total Products</span>
                                <span class="stat-value" id="totalProducts">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">SEO Optimized</span>
                                <span class="stat-value" id="seoConfigured">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Pending</span>
                                <span class="stat-value" id="needsSetup">0</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="main-content">
                    <div class="content-wrapper">
                        <!-- Loading -->
                        <div id="loadingContainer" class="loading-container active">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading products...</div>
                        </div>
                        
                        <!-- Products Grid -->
                        <div id="productsView" class="view-container">
                            <div class="products-grid" id="productsGrid"></div>
                            <div class="pagination" id="pagination" style="display: none;">
                                <button class="btn btn-secondary" id="prevPage">← Previous</button>
                                <span class="pagination-info" id="paginationInfo"></span>
                                <button class="btn btn-secondary" id="nextPage">Next →</button>
                            </div>
                        </div>
                        
                        <!-- Single Form -->
                        <div id="formView" class="view-container">
                            <div class="seo-form-container">
                                <div class="form-header">
                                    <div class="form-header-left">
                                        <h2 class="form-title" id="formTitle">Product SEO Setup</h2>
                                        <button class="btn btn-secondary btn-small" id="fillSampleBtn">
                                            🧪 Fill Sample Data
                                        </button>
                                    </div>
                                    <button class="form-close" id="closeForm">×</button>
                                </div>
                                
                                <div class="form-body" id="formBody">
                                    <!-- Form content will be inserted here -->
                                </div>
                                
                                <div class="form-footer">
                                    <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
                                    <button class="btn btn-success" id="saveBtn">Save SEO Data</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Empty State -->
                        <div id="emptyState" class="empty-state">
                            <h2>No Products Found</h2>
                            <p>There are no products available in your store.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="toast-notification" id="toastNotification">
                <div id="toastMessage"></div>
            </div>
        `;
        
        this._shadow.appendChild(this._root);
    }

    _setupEventListeners() {
        console.log('🔷 Dashboard: Setting up event listeners...');
        
        // Pagination
        this._shadow.getElementById('prevPage').addEventListener('click', () => {
            if (this._currentPage > 0) {
                this._currentPage--;
                this._loadProducts();
            }
        });
        
        this._shadow.getElementById('nextPage').addEventListener('click', () => {
            this._currentPage++;
            this._loadProducts();
        });
        
        // Form controls
        this._shadow.getElementById('closeForm').addEventListener('click', () => {
            this._hideForm();
        });
        
        this._shadow.getElementById('cancelBtn').addEventListener('click', () => {
            this._hideForm();
        });
        
        this._shadow.getElementById('saveBtn').addEventListener('click', () => {
            this._handleSave();
        });
        
        // Sample data button
        this._shadow.getElementById('fillSampleBtn').addEventListener('click', () => {
            this._fillSampleData();
        });
    }
    
    _dispatchEvent(eventName, detail) {
        console.log('🔷 Dashboard: Dispatching event:', eventName);
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
    
    _loadProducts() {
        console.log('🔷 Dashboard: Loading products...');
        
        const loadingContainer = this._shadow.getElementById('loadingContainer');
        const productsView = this._shadow.getElementById('productsView');
        const formView = this._shadow.getElementById('formView');
        const emptyState = this._shadow.getElementById('emptyState');
        
        loadingContainer.classList.add('active');
        productsView.classList.remove('active');
        formView.classList.remove('active');
        emptyState.classList.remove('active');
        
        this._dispatchEvent('load-products', {
            limit: this._pageSize,
            skip: this._currentPage * this._pageSize
        });
    }
    
    setProducts(data) {
        console.log('🔷 Dashboard: Setting products:', data.products.length);
        
        this._products = data.products || [];
        this._totalProducts = data.totalCount || 0;
        this._seoItems = data.seoItems || [];
        
        const loadingContainer = this._shadow.getElementById('loadingContainer');
        const productsView = this._shadow.getElementById('productsView');
        const emptyState = this._shadow.getElementById('emptyState');
        
        loadingContainer.classList.remove('active');
        
        if (this._products.length === 0) {
            emptyState.classList.add('active');
            productsView.classList.remove('active');
        } else {
            emptyState.classList.remove('active');
            productsView.classList.add('active');
            this._renderProducts();
            this._updateStats();
            this._updatePagination();
        }
    }
    
    _renderProducts() {
        const grid = this._shadow.getElementById('productsGrid');
        grid.innerHTML = '';
        
        this._products.forEach((product) => {
            const seoItem = this._seoItems.find(item => 
                item.productId === product.id || item.title === product.name
            );
            
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const hasSEO = !!seoItem;
            
            // Generate Google Rich Results Test URL
            const testUrl = hasSEO && seoItem.structuredData 
                ? `https://search.google.com/test/rich-results?url=${encodeURIComponent(product.productUrl || window.location.href)}`
                : '';
            
            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="seo-status-badge ${hasSEO ? 'seo-status-active' : 'seo-status-none'}">
                        ${hasSEO ? '✓ SEO Active' : '✗ No SEO'}
                    </div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${product.price}</div>
                    <div class="product-actions">
                        ${hasSEO ? `
                            <a href="${testUrl}" target="_blank" class="btn btn-purple btn-small" style="margin-bottom: 10px;">
                                🔍 Test in Google Rich Results
                            </a>
                            <div class="action-buttons">
                                <button class="btn btn-warning edit-btn">✏️ Edit SEO</button>
                                <button class="btn btn-danger delete-btn">🗑️ Delete</button>
                            </div>
                        ` : `
                            <button class="btn btn-primary set-btn">🚀 Setup SEO</button>
                        `}
                    </div>
                </div>
            `;
            
            const setBtn = card.querySelector('.set-btn');
            const editBtn = card.querySelector('.edit-btn');
            const deleteBtn = card.querySelector('.delete-btn');
            
            if (setBtn) {
                setBtn.addEventListener('click', () => this._showForm(product, null, false));
            }
            
            if (editBtn) {
                editBtn.addEventListener('click', () => this._showForm(product, seoItem, true));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this._deleteSEO(product, seoItem));
            }
            
            grid.appendChild(card);
        });
    }
    
    _getSampleDataByProductType() {
        const productName = this._selectedProduct ? this._selectedProduct.name.toLowerCase() : '';
        
        // Electronics Sample (Wireless Headphones)
        if (productName.includes('headphone') || productName.includes('audio') || productName.includes('speaker')) {
            return this._getElectronicsSample();
        }
        
        // Clothing Sample (T-Shirt)
        if (productName.includes('shirt') || productName.includes('clothing') || productName.includes('apparel')) {
            return this._getClothingSample();
        }
        
        // Food/Beverage Sample (Coffee)
        if (productName.includes('coffee') || productName.includes('tea') || productName.includes('food') || productName.includes('beverage')) {
            return this._getFoodSample();
        }
        
        // Book Sample
        if (productName.includes('book') || productName.includes('novel') || productName.includes('guide')) {
            return this._getBookSample();
        }
        
        // Furniture Sample (Office Chair)
        if (productName.includes('chair') || productName.includes('furniture') || productName.includes('desk')) {
            return this._getFurnitureSample();
        }
        
        // Default to electronics
        return this._getElectronicsSample();
    }
    
    _getElectronicsSample() {
        return {
            productName: "SonicWave Pro Wireless Headphones | Premium Noise Cancelling",
            description: "Experience studio-quality sound with active noise cancellation, 40-hour battery life, and premium comfort. Free shipping on orders over $50. Limited time: Save 20%!",
            metaKeywords: "wireless headphones, noise cancelling, bluetooth headphones, premium audio, studio quality",
            canonicalUrl: "https://yourstore.com/products/sonicwave-pro-headphones",
            robotsContent: "index, follow",
            
            sku: "SWP-2024-BLK",
            mpn: "SONICWAVE-PRO-001",
            gtin: "0012345678905",
            brandName: "SonicWave Audio",
            
            imageUrls: [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200"
            ],
            
            price: "199.99",
            priceCurrency: "USD",
            priceValidUntil: "2026-12-31",
            offerUrl: "https://yourstore.com/products/sonicwave-pro-headphones",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            strikethroughPrice: "249.99",
            
            memberPrice: "179.99",
            memberProgramName: "SonicWave VIP Club",
            memberProgramUrl: "https://yourstore.com/vip-membership",
            memberTierName: "Gold Member",
            memberPointsEarned: "200",
            
            isProductGroup: true,
            productGroupID: "SONICWAVE-PRO-2024",
            variesByColor: true,
            
            shippingCost: "0",
            shippingCurrency: "USD",
            shippingDestination: "US",
            handlingTimeMin: "1",
            handlingTimeMax: "2",
            deliveryTimeMin: "3",
            deliveryTimeMax: "5",
            
            returnDays: "30",
            returnCountry: "US",
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
            customerRemorseReturnFees: "https://schema.org/FreeReturn",
            itemDefectReturnFees: "https://schema.org/FreeReturn",
            returnLabelSource: "https://schema.org/ReturnLabelDownloadAndPrint",
            
            aggregateRatingValue: "4.8",
            reviewCount: "347",
            
            certificationName: "FCC",
            certificationIssuer: "Federal Communications Commission",
            certificationRating: "Approved",
            certificationId: "FCC-2024-SWP-001",
            
            ogTitle: "SonicWave Pro Wireless Headphones - Premium Noise Cancelling",
            ogDescription: "Experience studio-quality sound with 40-hour battery life. Save 20% now!",
            ogImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200",
            
            reviews: [
                {
                    author: "Sarah Johnson",
                    rating: "5",
                    title: "Best headphones I've ever owned!",
                    text: "The sound quality is absolutely incredible. The noise cancellation works perfectly on my daily commute. Battery life is exactly as advertised - I only charge them once a week!",
                    date: "2026-02-15",
                    pros: "Amazing sound quality, Excellent battery life, Comfortable for long wear, Great noise cancellation",
                    cons: "Slightly heavy, Carrying case could be smaller"
                },
                {
                    author: "Michael Chen",
                    rating: "5",
                    title: "Worth every penny",
                    text: "As an audio engineer, I'm very picky about sound quality. These headphones deliver crystal clear audio across all frequencies. The build quality is premium and they feel durable.",
                    date: "2026-02-10",
                    pros: "Professional sound quality, Durable construction, Premium materials, Easy Bluetooth pairing",
                    cons: "Expensive, No wired option included"
                },
                {
                    author: "Emily Rodriguez",
                    rating: "4",
                    title: "Great for travel",
                    text: "I bought these specifically for a long international flight and they were perfect. The noise cancellation blocked out the engine noise completely. Very comfortable even after 10 hours of wear.",
                    date: "2026-02-08",
                    pros: "Excellent noise cancellation, Very comfortable, Long battery life, Compact folding design",
                    cons: "Touch controls take time to learn, Pricey"
                },
                {
                    author: "David Thompson",
                    rating: "5",
                    title: "Incredible value with VIP discount",
                    text: "Got these at the VIP member price and they're an absolute steal. The sound quality rivals headphones twice the price. Highly recommend joining the VIP program if you're buying these.",
                    date: "2026-01-28",
                    pros: "Outstanding value for VIP members, Exceptional sound, Great customer service, Fast shipping",
                    cons: "Regular price is high, Wish they came in more colors"
                },
                {
                    author: "Lisa Wang",
                    rating: "5",
                    title: "Perfect for work from home",
                    text: "I use these for video calls all day and the microphone quality is exceptional. People can hear me clearly even with background noise. The comfort is unmatched for all-day wear.",
                    date: "2026-01-20",
                    pros: "Clear microphone, All-day comfort, Excellent for calls, Reliable Bluetooth connection",
                    cons: "None really"
                }
            ],
            
            faqs: [
                {
                    question: "What is the battery life of the SonicWave Pro headphones?",
                    answer: "The SonicWave Pro headphones offer up to 40 hours of playtime on a single charge with ANC (Active Noise Cancellation) turned on, and up to 50 hours with ANC off. A quick 10-minute charge provides 5 hours of playback time."
                },
                {
                    question: "Are these headphones compatible with both iPhone and Android?",
                    answer: "Yes! The SonicWave Pro headphones are compatible with all Bluetooth-enabled devices including iPhone, Android phones, tablets, laptops, and more. They support Bluetooth 5.3 for reliable connectivity up to 33 feet (10 meters)."
                },
                {
                    question: "Can I use these headphones for phone calls?",
                    answer: "Absolutely! The SonicWave Pro features 4 built-in microphones with advanced noise reduction technology, making them perfect for crystal-clear phone calls and video conferences even in noisy environments."
                },
                {
                    question: "What comes in the box?",
                    answer: "Your purchase includes: SonicWave Pro Headphones, Premium hard-shell carrying case, USB-C charging cable, 3.5mm audio cable for wired use, airplane adapter, quick start guide, and 2-year warranty card."
                },
                {
                    question: "How does the VIP membership discount work?",
                    answer: "VIP members save $20 on this product (regular price $199.99, VIP price $179.99) and earn 200 reward points with purchase. Points can be redeemed for future discounts. Join the VIP Club for free at checkout to start saving immediately!"
                }
            ],
            
            variants: [
                {
                    name: "SonicWave Pro - Midnight Black",
                    sku: "SWP-2024-BLK",
                    color: "Midnight Black",
                    material: "Premium Aluminum & Memory Foam",
                    gtin: "0012345678905",
                    url: "https://yourstore.com/products/sonicwave-pro?color=black",
                    price: "199.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200"
                },
                {
                    name: "SonicWave Pro - Arctic Silver",
                    sku: "SWP-2024-SLV",
                    color: "Arctic Silver",
                    material: "Premium Aluminum & Memory Foam",
                    gtin: "0012345678912",
                    url: "https://yourstore.com/products/sonicwave-pro?color=silver",
                    price: "199.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200"
                },
                {
                    name: "SonicWave Pro - Rose Gold",
                    sku: "SWP-2024-RSG",
                    color: "Rose Gold",
                    material: "Premium Aluminum & Memory Foam",
                    gtin: "0012345678929",
                    url: "https://yourstore.com/products/sonicwave-pro?color=rosegold",
                    price: "199.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200"
                }
            ],
            
            certifications: [
                {
                    name: "CE",
                    issuer: "European Commission",
                    rating: "Certified",
                    id: "CE-2024-AUDIO-789"
                },
                {
                    name: "RoHS",
                    issuer: "European Union",
                    rating: "Compliant",
                    id: "ROHS-2024-456"
                }
            ],
            
            shippingConditions: [
                {
                    country: "US",
                    cost: "0",
                    currency: "USD",
                    minOrder: "50",
                    maxOrder: "",
                    doesNotShip: false,
                    description: "Free standard shipping on orders over $50"
                },
                {
                    country: "CA",
                    cost: "9.99",
                    currency: "USD",
                    minOrder: "0",
                    maxOrder: "99.99",
                    doesNotShip: false,
                    description: "Standard shipping to Canada"
                }
            ]
        };
    }
    
    _getClothingSample() {
        return {
            productName: "Premium Cotton T-Shirt | Sustainable & Organic",
            description: "Eco-friendly organic cotton t-shirt. Soft, breathable, and ethically made. Available in 5 colors and all sizes. Free returns within 60 days!",
            metaKeywords: "organic cotton, sustainable clothing, eco-friendly shirt, ethical fashion",
            canonicalUrl: "https://yourstore.com/products/premium-cotton-tshirt",
            robotsContent: "index, follow",
            
            sku: "PCT-2024-WHT-M",
            mpn: "ECO-SHIRT-001",
            gtin: "0034567890123",
            brandName: "EcoThreads",
            
            imageUrls: [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
                "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200",
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200"
            ],
            
            price: "34.99",
            priceCurrency: "USD",
            priceValidUntil: "2026-12-31",
            offerUrl: "https://yourstore.com/products/premium-cotton-tshirt",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            strikethroughPrice: "49.99",
            
            memberPrice: "29.99",
            memberProgramName: "EcoThreads Green Club",
            memberProgramUrl: "https://yourstore.com/green-membership",
            memberTierName: "Silver",
            memberPointsEarned: "35",
            
            isProductGroup: true,
            productGroupID: "ECO-TSHIRT-2024",
            variesBySize: true,
            variesByColor: true,
            
            shippingCost: "5.99",
            shippingCurrency: "USD",
            shippingDestination: "US",
            handlingTimeMin: "1",
            handlingTimeMax: "3",
            deliveryTimeMin: "5",
            deliveryTimeMax: "7",
            
            returnDays: "60",
            returnCountry: "US",
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
            customerRemorseReturnFees: "https://schema.org/FreeReturn",
            itemDefectReturnFees: "https://schema.org/FreeReturn",
            returnLabelSource: "https://schema.org/ReturnLabelInBox",
            
            aggregateRatingValue: "4.9",
            reviewCount: "1247",
            
            certificationName: "GOTS",
            certificationIssuer: "Global Organic Textile Standard",
            certificationRating: "Certified Organic",
            certificationId: "GOTS-2024-ECO-555",
            
            ogTitle: "Premium Organic Cotton T-Shirt - Sustainable Fashion",
            ogDescription: "Soft, breathable, ethically made. Save 30% today!",
            ogImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
            
            reviews: [
                {
                    author: "Jessica Martinez",
                    rating: "5",
                    title: "Softest shirt ever!",
                    text: "This is hands down the softest, most comfortable t-shirt I own. The organic cotton feels amazing against my skin. I've already ordered 3 more in different colors!",
                    date: "2026-02-18",
                    pros: "Incredibly soft, Perfect fit, Sustainable, Breathable fabric",
                    cons: "Wish there were more colors"
                },
                {
                    author: "Tom Wilson",
                    rating: "5",
                    title: "Finally, a shirt that fits!",
                    text: "As a tall guy, finding shirts that fit properly is always a challenge. These run true to size and the length is perfect. Quality is outstanding.",
                    date: "2026-02-14",
                    pros: "True to size, Great length, Durable, Holds shape after washing",
                    cons: "None"
                },
                {
                    author: "Rachel Kim",
                    rating: "5",
                    title: "Love supporting sustainable brands",
                    text: "It's rare to find sustainable clothing that's actually affordable and high quality. These shirts check all the boxes. The GOTS certification gives me peace of mind.",
                    date: "2026-02-10",
                    pros: "Eco-friendly, Affordable, Certified organic, Well-made",
                    cons: "Shipping took a bit long"
                },
                {
                    author: "Chris Anderson",
                    rating: "4",
                    title: "Great everyday shirt",
                    text: "I wear this shirt at least twice a week. It's comfortable, looks good, and has held up well through many washes. Highly recommend!",
                    date: "2026-02-05",
                    pros: "Comfortable, Versatile, Durable, Great value",
                    cons: "Wrinkles easily"
                },
                {
                    author: "Maria Santos",
                    rating: "5",
                    title: "Perfect basic tee",
                    text: "This is now my go-to basic t-shirt. The fit is flattering, the fabric is breathable, and I love that it's ethically made. Worth every penny!",
                    date: "2026-01-30",
                    pros: "Flattering fit, Breathable, Ethical production, Good price",
                    cons: "None really"
                }
            ],
            
            faqs: [
                {
                    question: "What sizes do you offer?",
                    answer: "We offer sizes XS through 3XL. Our shirts run true to size. We recommend checking our detailed size chart for measurements to ensure the perfect fit."
                },
                {
                    question: "Is this really organic cotton?",
                    answer: "Yes! All our t-shirts are made from 100% GOTS-certified organic cotton. This means the cotton is grown without harmful pesticides or synthetic fertilizers, and the entire production process meets strict environmental and social criteria."
                },
                {
                    question: "How do I care for this shirt?",
                    answer: "Machine wash cold with like colors, tumble dry low or hang dry. Avoid bleach. Iron on low heat if needed. The organic cotton will actually get softer with each wash!"
                },
                {
                    question: "What's your return policy?",
                    answer: "We offer a generous 60-day return policy with free return shipping. If you're not completely satisfied, simply use the prepaid return label included in your package. Full refund, no questions asked!"
                }
            ],
            
            variants: [
                {
                    name: "Premium Cotton Tee - White - Small",
                    sku: "PCT-2024-WHT-S",
                    size: "Small",
                    color: "White",
                    material: "100% Organic Cotton",
                    gtin: "0034567890123",
                    url: "https://yourstore.com/products/tshirt?color=white&size=s",
                    price: "34.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200"
                },
                {
                    name: "Premium Cotton Tee - White - Medium",
                    sku: "PCT-2024-WHT-M",
                    size: "Medium",
                    color: "White",
                    material: "100% Organic Cotton",
                    gtin: "0034567890130",
                    url: "https://yourstore.com/products/tshirt?color=white&size=m",
                    price: "34.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200"
                },
                {
                    name: "Premium Cotton Tee - Black - Medium",
                    sku: "PCT-2024-BLK-M",
                    size: "Medium",
                    color: "Black",
                    material: "100% Organic Cotton",
                    gtin: "0034567890147",
                    url: "https://yourstore.com/products/tshirt?color=black&size=m",
                    price: "34.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200"
                },
                {
                    name: "Premium Cotton Tee - Navy - Large",
                    sku: "PCT-2024-NVY-L",
                    size: "Large",
                    color: "Navy Blue",
                    material: "100% Organic Cotton",
                    gtin: "0034567890154",
                    url: "https://yourstore.com/products/tshirt?color=navy&size=l",
                    price: "34.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200"
                }
            ],
            
            certifications: [
                {
                    name: "Fair Trade",
                    issuer: "Fair Trade USA",
                    rating: "Certified",
                    id: "FT-2024-ECO-333"
                },
                {
                    name: "OEKO-TEX",
                    issuer: "OEKO-TEX Association",
                    rating: "Standard 100",
                    id: "OEKO-2024-888"
                }
            ],
            
            shippingConditions: [
                {
                    country: "US",
                    cost: "5.99",
                    currency: "USD",
                    minOrder: "0",
                    maxOrder: "49.99",
                    doesNotShip: false,
                    description: "Standard shipping"
                },
                {
                    country: "US",
                    cost: "0",
                    currency: "USD",
                    minOrder: "50",
                    maxOrder: "",
                    doesNotShip: false,
                    description: "Free shipping on orders over $50"
                }
            ]
        };
    }
    
    _getFoodSample() {
        return {
            productName: "Artisan Dark Roast Espresso Beans | USDA Organic 1kg",
            description: "Experience rich notes of dark chocolate and caramel. Freshly roasted, USDA Organic, and perfect for home baristas. Save 15% on your first order!",
            metaKeywords: "espresso beans, organic coffee, dark roast, whole bean coffee, artisan coffee",
            canonicalUrl: "https://yourstore.com/products/artisan-dark-roast",
            robotsContent: "index, follow",
            
            sku: "ARO-DK-1KG",
            mpn: "ART-ES-001",
            gtin: "0045678901234",
            brandName: "Aroma Coffee Co.",
            
            imageUrls: [
                "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200",
                "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200",
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200"
            ],
            
            price: "24.99",
            priceCurrency: "USD",
            priceValidUntil: "2026-12-31",
            offerUrl: "https://yourstore.com/products/artisan-dark-roast",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            strikethroughPrice: "29.99",
            
            unitPricingValue: "1000",
            unitPricingUnit: "GRM",
            unitPricingBaseValue: "100",
            unitPricingBaseUnit: "GRM",
            
            memberPrice: "21.99",
            memberProgramName: "Coffee Club Rewards",
            memberProgramUrl: "https://yourstore.com/coffee-club",
            memberTierName: "Gold Roaster",
            memberPointsEarned: "25",
            
            isProductGroup: false,
            
            shippingCost: "0",
            shippingCurrency: "USD",
            shippingDestination: "US",
            handlingTimeMin: "1",
            handlingTimeMax: "2",
            deliveryTimeMin: "2",
            deliveryTimeMax: "4",
            
            returnDays: "30",
            returnCountry: "US",
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
            customerRemorseReturnFees: "https://schema.org/FreeReturn",
            itemDefectReturnFees: "https://schema.org/FreeReturn",
            returnLabelSource: "https://schema.org/ReturnLabelDownloadAndPrint",
            
            aggregateRatingValue: "4.9",
            reviewCount: "892",
            
            certificationName: "USDA Organic",
            certificationIssuer: "United States Department of Agriculture",
            certificationRating: "Certified Organic",
            certificationId: "USDA-ORG-2024-567",
            
            ogTitle: "Artisan Dark Roast Espresso - USDA Organic 1kg",
            ogDescription: "Rich dark chocolate & caramel notes. Freshly roasted. Save 15%!",
            ogImage: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200",
            
            reviews: [
                {
                    author: "John Coffee",
                    rating: "5",
                    title: "Best espresso I've tried!",
                    text: "As a former barista, I'm very particular about my coffee. These beans produce a smooth, rich espresso with no bitterness. The chocolate notes are prominent and delicious.",
                    date: "2026-02-17",
                    pros: "Rich flavor, Smooth finish, No bitterness, Fresh roast",
                    cons: "Bags could be resealable"
                },
                {
                    author: "Emma Brewster",
                    rating: "5",
                    title: "Perfect for my morning routine",
                    text: "I've been buying this coffee for 6 months now and it's consistently excellent. The beans are always fresh and the flavor is outstanding. Great value for organic coffee!",
                    date: "2026-02-12",
                    pros: "Consistently good, Fresh beans, Great value, Organic certified",
                    cons: "None"
                },
                {
                    author: "Mike Espresso",
                    rating: "5",
                    title: "Coffee club member for life",
                    text: "The Coffee Club discount makes these beans even more affordable. At the member price, this is the best value for premium organic espresso. Highly recommend joining!",
                    date: "2026-02-08",
                    pros: "Excellent member pricing, Premium quality, Fast shipping, Organic",
                    cons: "Regular price is a bit high"
                },
                {
                    author: "Sarah Latte",
                    rating: "4",
                    title: "Great for lattes",
                    text: "These beans work perfectly in my home espresso machine. They create a nice crema and the flavor holds up well with milk. Would recommend for latte lovers!",
                    date: "2026-02-03",
                    pros: "Good crema, Works well with milk, Fresh roast, Organic",
                    cons: "Could be a bit stronger"
                }
            ],
            
            faqs: [
                {
                    question: "When are the beans roasted?",
                    answer: "We roast our beans fresh to order! Your beans are roasted within 48 hours of shipping to ensure maximum freshness and flavor. The roast date is printed on every bag."
                },
                {
                    question: "Are these beans suitable for drip coffee makers?",
                    answer: "While these beans are optimized for espresso, they also work wonderfully in drip coffee makers, French press, and pour-over methods. The dark roast provides a bold, rich flavor regardless of brewing method."
                },
                {
                    question: "What's the best way to store these beans?",
                    answer: "Store in an airtight container in a cool, dark place. Avoid refrigeration as it can cause condensation. For best flavor, use within 2-3 weeks of opening. We recommend grinding just before brewing."
                },
                {
                    question: "Do you offer a subscription service?",
                    answer: "Yes! Join our Coffee Club for automatic monthly deliveries at a discounted price. Members save $3 per bag and earn points with every purchase. Cancel or modify your subscription anytime."
                }
            ],
            
            variants: [],
            
            certifications: [
                {
                    name: "Fair Trade",
                    issuer: "Fair Trade International",
                    rating: "Certified",
                    id: "FT-COFFEE-2024-789"
                },
                {
                    name: "Rainforest Alliance",
                    issuer: "Rainforest Alliance",
                    rating: "Certified",
                    id: "RA-2024-COFFEE-456"
                }
            ],
            
            shippingConditions: [
                {
                    country: "US",
                    cost: "0",
                    currency: "USD",
                    minOrder: "0",
                    maxOrder: "",
                    doesNotShip: false,
                    description: "Free shipping on all coffee orders"
                }
            ]
        };
    }
    
    _getBookSample() {
        return {
            productName: "The Complete Guide to Web Development | 2024 Edition",
            description: "Master HTML, CSS, JavaScript, React, and Node.js with this comprehensive 800-page guide. Includes real-world projects and code examples. Perfect for beginners to advanced developers.",
            metaKeywords: "web development, programming book, learn javascript, coding guide, react tutorial",
            canonicalUrl: "https://yourstore.com/products/web-development-guide",
            robotsContent: "index, follow",
            
            sku: "BOOK-WEB-2024",
            mpn: "WEB-DEV-GUIDE-2024",
            isbn: "978-0123456789",
            brandName: "TechPress Publishing",
            
            imageUrls: [
                "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200"
            ],
            
            price: "49.99",
            priceCurrency: "USD",
            priceValidUntil: "2026-12-31",
            offerUrl: "https://yourstore.com/products/web-development-guide",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            strikethroughPrice: "69.99",
            
            isProductGroup: false,
            
            shippingCost: "4.99",
            shippingCurrency: "USD",
            shippingDestination: "US",
            handlingTimeMin: "1",
            handlingTimeMax: "2",
            deliveryTimeMin: "3",
            deliveryTimeMax: "7",
            
            returnDays: "30",
            returnCountry: "US",
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
            
            aggregateRatingValue: "4.7",
            reviewCount: "523",
            
            ogTitle: "The Complete Guide to Web Development - 2024 Edition",
            ogDescription: "Master modern web development. 800 pages of tutorials, projects & code examples.",
            ogImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200",
            
            reviews: [
                {
                    author: "Alex Developer",
                    rating: "5",
                    title: "Best programming book I've read",
                    text: "This book is incredibly comprehensive yet easy to follow. The examples are practical and the explanations are clear. I went from knowing nothing about web development to building my own projects in 3 months!",
                    date: "2026-02-15",
                    pros: "Clear explanations, Practical examples, Comprehensive coverage, Well-organized",
                    cons: "Heavy to carry around"
                },
                {
                    author: "Jennifer Code",
                    rating: "5",
                    title: "Perfect for beginners",
                    text: "I've tried many programming books and this is by far the best for beginners. It doesn't assume any prior knowledge and builds concepts progressively. Highly recommended!",
                    date: "2026-02-10",
                    pros: "Beginner-friendly, Step-by-step approach, Good exercises, Updated for 2024",
                    cons: "None"
                },
                {
                    author: "Mark Backend",
                    rating: "4",
                    title: "Great reference guide",
                    text: "Even as an experienced developer, I find myself referencing this book often. The Node.js and React sections are particularly well done. Worth having on your shelf!",
                    date: "2026-02-05",
                    pros: "Comprehensive, Good reference, Modern technologies, Quality binding",
                    cons: "Could use more advanced topics"
                }
            ],
            
            faqs: [
                {
                    question: "Is this book suitable for complete beginners?",
                    answer: "Absolutely! The book starts with the basics of HTML and CSS, assuming no prior programming knowledge. It then progressively builds your skills through JavaScript, React, and Node.js."
                },
                {
                    question: "Does the book include code examples?",
                    answer: "Yes! The book includes over 100 code examples and 15 complete projects. All code is available for download from our website, so you can follow along and modify the examples."
                },
                {
                    question: "Is there a digital version available?",
                    answer: "Yes! When you purchase the physical book, you also get free access to the PDF, EPUB, and MOBI versions. The download link will be sent to your email within 24 hours of purchase."
                }
            ],
            
            variants: [],
            certifications: [],
            shippingConditions: []
        };
    }
    
    _getFurnitureSample() {
        return {
            productName: "ErgoMax Pro Office Chair | Lumbar Support & Adjustable",
            description: "Premium ergonomic office chair with adjustable lumbar support, breathable mesh back, and 4D armrests. Supports up to 300lbs. Free white-glove delivery and assembly!",
            metaKeywords: "ergonomic chair, office chair, lumbar support, adjustable chair, mesh chair",
            canonicalUrl: "https://yourstore.com/products/ergomax-pro-chair",
            robotsContent: "index, follow",
            
            sku: "EMP-2024-BLK",
            mpn: "ERGO-CHAIR-PRO-001",
            gtin: "0056789012345",
            brandName: "ErgoMax",
            
            imageUrls: [
                "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200",
                "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200",
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200"
            ],
            
            price: "399.99",
            priceCurrency: "USD",
            priceValidUntil: "2026-12-31",
            offerUrl: "https://yourstore.com/products/ergomax-pro-chair",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            strikethroughPrice: "599.99",
            
            memberPrice: "359.99",
            memberProgramName: "ErgoMax VIP",
            memberProgramUrl: "https://yourstore.com/vip",
            memberTierName: "Premium",
            memberPointsEarned: "400",
            
            isProductGroup: true,
            productGroupID: "ERGOMAX-PRO-2024",
            variesByColor: true,
            variesByMaterial: true,
            
            shippingCost: "0",
            shippingCurrency: "USD",
            shippingDestination: "US",
            handlingTimeMin: "3",
            handlingTimeMax: "5",
            deliveryTimeMin: "7",
            deliveryTimeMax: "14",
            
            returnDays: "90",
            returnCountry: "US",
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
            customerRemorseReturnFees: "https://schema.org/FreeReturn",
            itemDefectReturnFees: "https://schema.org/FreeReturn",
            returnLabelSource: "https://schema.org/ReturnLabelCustomerResponsibility",
            
            aggregateRatingValue: "4.8",
            reviewCount: "1834",
            
            certificationName: "BIFMA",
            certificationIssuer: "Business and Institutional Furniture Manufacturers Association",
            certificationRating: "Level 3 Certified",
            certificationId: "BIFMA-2024-CHAIR-999",
            
            model3dUrl: "https://example.com/models/ergomax-chair.gltf",
            
            ogTitle: "ErgoMax Pro Office Chair - Premium Ergonomic Design",
            ogDescription: "All-day comfort with adjustable lumbar support. Free delivery & assembly. Save $200!",
            ogImage: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200",
            
            reviews: [
                {
                    author: "David Office",
                    rating: "5",
                    title: "Best chair investment ever",
                    text: "After years of back pain from cheap office chairs, I finally invested in the ErgoMax Pro. Within a week, my back pain was gone. The lumbar support is adjustable and actually works!",
                    date: "2026-02-16",
                    pros: "Excellent lumbar support, Very comfortable, Easy assembly, Sturdy construction",
                    cons: "Expensive but worth it"
                },
                {
                    author: "Lisa Remote",
                    rating: "5",
                    title: "Perfect for working from home",
                    text: "I sit in this chair 8-10 hours a day working remotely. It's incredibly comfortable and all the adjustments let me dial in the perfect position. The mesh back keeps me cool too!",
                    date: "2026-02-12",
                    pros: "All-day comfort, Breathable mesh, Highly adjustable, Free delivery",
                    cons: "Armrests could be softer"
                },
                {
                    author: "Robert Gamer",
                    rating: "5",
                    title: "Great for gaming too",
                    text: "I bought this for my home office but it's become my gaming chair too. Way more comfortable than gaming chairs and better for your posture. The 300lb weight capacity is perfect.",
                    date: "2026-02-08",
                    pros: "Comfortable for long sessions, Good for posture, Sturdy, Quiet casters",
                    cons: "No RGB lights (joking!)"
                },
                {
                    author: "Susan Designer",
                    rating: "4",
                    title: "Professional quality",
                    text: "This is exactly what you'd find in a professional office. The build quality is excellent and it looks great in my home office. Assembly was straightforward with clear instructions.",
                    date: "2026-02-03",
                    pros: "Professional quality, Looks great, Easy assembly, Durable",
                    cons: "Pricey, Takes up space"
                }
            ],
            
            faqs: [
                {
                    question: "What's the weight capacity?",
                    answer: "The ErgoMax Pro is designed to support up to 300 pounds (136 kg). The chair has been rigorously tested to meet and exceed BIFMA standards for safety and durability."
                },
                {
                    question: "Is assembly required?",
                    answer: "Minimal assembly is required. The chair comes mostly pre-assembled - you just need to attach the base and armrests (takes about 10 minutes). For an additional fee, we offer white-glove delivery with professional assembly."
                },
                {
                    question: "What are the dimensions?",
                    answer: "Seat width: 20.5 inches, Seat depth: 20 inches, Back height: 26 inches, Overall height: 42-52 inches (adjustable), Base width: 27 inches. The chair fits comfortably under most standard desks."
                },
                {
                    question: "What's your return policy?",
                    answer: "We offer a 90-day trial period with free returns. If you're not completely satisfied, contact us for a return authorization. We'll arrange pickup at no cost to you and issue a full refund."
                },
                {
                    question: "Does it come with a warranty?",
                    answer: "Yes! The ErgoMax Pro comes with a 10-year warranty on the frame and mechanism, 3-year warranty on the gas lift, and 2-year warranty on the fabric and foam. We stand behind our products!"
                }
            ],
            
            variants: [
                {
                    name: "ErgoMax Pro - Black Mesh",
                    sku: "EMP-2024-BLK-MESH",
                    color: "Black",
                    material: "Breathable Mesh",
                    gtin: "0056789012345",
                    url: "https://yourstore.com/products/ergomax?color=black&material=mesh",
                    price: "399.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200"
                },
                {
                    name: "ErgoMax Pro - Gray Mesh",
                    sku: "EMP-2024-GRY-MESH",
                    color: "Gray",
                    material: "Breathable Mesh",
                    gtin: "0056789012352",
                    url: "https://yourstore.com/products/ergomax?color=gray&material=mesh",
                    price: "399.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200"
                },
                {
                    name: "ErgoMax Pro - Black Leather",
                    sku: "EMP-2024-BLK-LTHR",
                    color: "Black",
                    material: "Premium Leather",
                    gtin: "0056789012369",
                    url: "https://yourstore.com/products/ergomax?color=black&material=leather",
                    price: "499.99",
                    availability: "https://schema.org/InStock",
                    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200"
                }
            ],
            
            certifications: [
                {
                    name: "GREENGUARD Gold",
                    issuer: "UL Environment",
                    rating: "Certified",
                    id: "GG-2024-CHAIR-777"
                }
            ],
            
            shippingConditions: [
                {
                    country: "US",
                    cost: "0",
                    currency: "USD",
                    minOrder: "0",
                    maxOrder: "",
                    doesNotShip: false,
                    description: "Free standard shipping (curbside delivery)"
                },
                {
                    country: "US",
                    cost: "99.99",
                    currency: "USD",
                    minOrder: "0",
                    maxOrder: "",
                    doesNotShip: false,
                    description: "White-glove delivery with assembly"
                }
            ]
        };
    }
    
    _fillSampleData() {
        const sampleData = this._getSampleDataByProductType();
        
        this._formData = sampleData;
        this._reviews = sampleData.reviews || [];
        this._faqs = sampleData.faqs || [];
        this._variants = sampleData.variants || [];
        this._certifications = sampleData.certifications || [];
        this._shippingConditions = sampleData.shippingConditions || [];
        
        // Re-render the form with sample data
        this._renderForm();
        
        this._showToast('success', '✨ Sample data loaded! Review the fields and click Save to test.');
    }

_showForm(product, seoData, isEdit) {
        console.log('🔷 Dashboard: Showing form for:', product.name);
        
        this._selectedProduct = product;
        this._editMode = isEdit;
        this._showingForm = true;
        this._reviews = [];
        this._faqs = [];
        this._variants = [];
        this._certifications = [];
        this._shippingConditions = [];
        
        const formTitle = this._shadow.getElementById('formTitle');
        formTitle.textContent = isEdit ? 'Edit Product SEO' : 'Setup Product SEO';
        
        // Initialize form data with ALL new fields
        this._formData = {
            // Basic SEO
            productName: product.name,
            description: '',
            metaKeywords: '',
            canonicalUrl: '',
            robotsContent: 'index, follow',
            
            // Product Schema
            sku: '',
            mpn: '',
            gtin: '',
            isbn: '',
            brandName: '',
            imageUrls: [],
            
            // Pricing
            price: '',
            priceCurrency: 'USD',
            priceValidUntil: '',
            offerUrl: '',
            availability: '',
            itemCondition: '',
            
            // Sale Pricing
            salePrice: '',
            strikethroughPrice: '',
            
            // Unit Pricing
            unitPricingValue: '',
            unitPricingUnit: '',
            unitPricingBaseValue: '',
            unitPricingBaseUnit: '',
            
            // Member/Loyalty Pricing
            memberPrice: '',
            memberProgramName: '',
            memberProgramUrl: '',
            memberTierName: '',
            memberPointsEarned: '',
            
            // Shipping
            shippingCost: '',
            shippingCurrency: 'USD',
            shippingDestination: '',
            handlingTimeMin: '',
            handlingTimeMax: '',
            deliveryTimeMin: '',
            deliveryTimeMax: '',
            
            // Returns
            returnDays: '',
            returnCountry: '',
            returnMethod: '',
            returnFees: '',
            returnShippingFees: '',
            customerRemorseReturnFees: '',
            itemDefectReturnFees: '',
            returnLabelSource: '',
            
            // Reviews
            aggregateRatingValue: '',
            reviewCount: '',
            bestRating: '5',
            worstRating: '1',
            
            // Certifications
            certificationName: '',
            certificationIssuer: '',
            certificationRating: '',
            certificationId: '',
            
            // 3D Model
            model3dUrl: '',
            
            // Social
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterCard: 'summary_large_image',
            
            // Product Group (Variants)
            isProductGroup: false,
            productGroupID: '',
            variesBySize: false,
            variesByColor: false,
            variesByMaterial: false,
            variesByPattern: false
        };
        
        // Populate from existing data
        if (seoData && seoData.seoData) {
            try {
                const data = typeof seoData.seoData === 'string' 
                    ? JSON.parse(seoData.seoData) 
                    : seoData.seoData;
                
                Object.assign(this._formData, data);
                
                if (data.reviews) this._reviews = data.reviews;
                if (data.faqs) this._faqs = data.faqs;
                if (data.variants) this._variants = data.variants;
                if (data.certifications) this._certifications = data.certifications;
                if (data.shippingConditions) this._shippingConditions = data.shippingConditions;
            } catch (e) {
                console.error('Error parsing SEO data:', e);
            }
        }
        
        // Render form
        this._renderForm();
        
        // Show form view
        const productsView = this._shadow.getElementById('productsView');
        const formView = this._shadow.getElementById('formView');
        
        productsView.classList.remove('active');
        formView.classList.add('active');
    }

    _renderForm() {
        const formBody = this._shadow.getElementById('formBody');
        
        const currencies = this._getAllCurrencies();
        const countries = this._getAllCountries();
        const imageUrlsValue = (this._formData.imageUrls && Array.isArray(this._formData.imageUrls)) 
            ? this._formData.imageUrls.join('\n') 
            : '';
        
        formBody.innerHTML = `
            <div class="info-box">
                <div class="info-box-title">📋 Complete Product SEO Optimization</div>
                <div class="info-box-text">
                    This form includes ALL Google-supported structured data properties for products. Complete the fields below to maximize your product's visibility in search results, Google Shopping, and rich results. Fields marked with * are required. Click section headers to expand/collapse.
                </div>
            </div>
            
            <!-- Section 1: Basic SEO -->
            <div class="form-section">
                <div class="section-header" data-section="basic">
                    <div class="section-title">📝 Basic SEO Information</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content" data-content="basic">
                    <div class="form-group">
                        <label class="form-label required">Product Name (Title Tag)</label>
                        <input type="text" class="form-input" id="productName" maxlength="60" value="${this._formData.productName || ''}">
                        <div class="help-text">
                            <strong>What it is:</strong> The main title shown in search results and browser tabs.<br>
                            <strong>Best practice:</strong> Keep under 60 characters. Include main keyword at the beginning.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label required">Meta Description</label>
                        <textarea class="form-textarea" id="description" maxlength="160" rows="3">${this._formData.description || ''}</textarea>
                        <div class="help-text">
                            <strong>Best practice:</strong> 150-160 characters. Include a call-to-action and main benefits.
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Meta Keywords <span class="form-label-badge">Optional</span></label>
                            <input type="text" class="form-input" id="metaKeywords" value="${this._formData.metaKeywords || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Canonical URL <span class="form-label-badge">Optional</span></label>
                            <input type="url" class="form-input" id="canonicalUrl" value="${this._formData.canonicalUrl || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Robots Directive</label>
                        <select class="form-select" id="robotsContent">
                            <option value="index, follow" ${this._formData.robotsContent === 'index, follow' ? 'selected' : ''}>Index & Follow (Recommended)</option>
                            <option value="index, nofollow" ${this._formData.robotsContent === 'index, nofollow' ? 'selected' : ''}>Index but Don't Follow</option>
                            <option value="noindex, follow" ${this._formData.robotsContent === 'noindex, follow' ? 'selected' : ''}>Don't Index but Follow</option>
                            <option value="noindex, nofollow" ${this._formData.robotsContent === 'noindex, nofollow' ? 'selected' : ''}>Don't Index or Follow</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Section 2: Product Schema -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="schema">
                    <div class="section-title">🏷️ Product Schema & Identifiers</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="schema">
                    <div class="warning-box">
                        <div class="warning-box-title">⚠️ Important: Product Identifiers</div>
                        <div class="warning-box-text">
                            At least ONE of these identifiers (GTIN, MPN, or Brand) is required for Google Shopping. GTIN is most important and must be 8, 12, 13, or 14 digits.
                        </div>
                    </div>
                    
                    <div class="form-row-3">
                        <div class="form-group">
                            <label class="form-label">SKU</label>
                            <input type="text" class="form-input" id="sku" value="${this._formData.sku || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">MPN</label>
                            <input type="text" class="form-input" id="mpn" value="${this._formData.mpn || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">GTIN <span class="form-label-badge">Highly Recommended</span></label>
                            <input type="text" class="form-input" id="gtin" value="${this._formData.gtin || ''}" placeholder="8, 12, 13, or 14 digits">
                            <div class="help-text">Must be 8, 12, 13, or 14 digits (GTIN-8, UPC, EAN, or GTIN-14)</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">ISBN <span class="form-label-badge">For Books Only</span></label>
                            <input type="text" class="form-input" id="isbn" value="${this._formData.isbn || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Brand Name <span class="form-label-badge">Highly Recommended</span></label>
                            <input type="text" class="form-input" id="brandName" value="${this._formData.brandName || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Image URLs (One per line)</label>
                        <textarea class="form-textarea" id="imageUrls" rows="5">${imageUrlsValue}</textarea>
                        <div class="help-text">
                            <strong>Requirements:</strong> Min 800x800px. JPG, PNG, or WebP. 3-5 images recommended.
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Section 3: Pricing & Offers -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="pricing">
                    <div class="section-title">💰 Pricing & Offers</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="pricing">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required">Price</label>
                            <input type="number" step="0.01" min="0" class="form-input" id="price" value="${this._formData.price || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label required">Currency</label>
                            <select class="form-select" id="priceCurrency">
                                ${currencies}
                            </select>
                        </div>
                    </div>
                    
                    <div class="info-box">
                        <div class="info-box-title">💸 Sale Pricing</div>
                        <div class="info-box-text">
                            To show a sale price with strikethrough, enter both the current sale price above and the original price below.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Strikethrough Price (Original Price) <span class="form-label-badge">Optional</span></label>
                        <input type="number" step="0.01" min="0" class="form-input" id="strikethroughPrice" value="${this._formData.strikethroughPrice || ''}">
                        <div class="help-text">
                            <strong>Example:</strong> If selling for $79.99 (sale price), enter $79.99 above and $99.99 here.
                        </div>
                    </div>
                    
                    <div class="info-box">
                        <div class="info-box-title">📏 Unit Pricing Measure</div>
                        <div class="info-box-text">
                            Show price per standard unit (e.g., $10 per 100ml). Required in EU, Australia, NZ for products sold by volume/weight/length.
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Product Quantity Value</label>
                            <input type="number" step="0.01" class="form-input" id="unitPricingValue" value="${this._formData.unitPricingValue || ''}" placeholder="200">
                            <div class="help-text">Example: 200 (for 200ml bottle)</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Product Quantity Unit</label>
                            <select class="form-select" id="unitPricingUnit">
                                <option value="">-- Select Unit --</option>
                                <option value="ML" ${this._formData.unitPricingUnit === 'ML' ? 'selected' : ''}>ML (Milliliters)</option>
                                <option value="L" ${this._formData.unitPricingUnit === 'L' ? 'selected' : ''}>L (Liters)</option>
                                <option value="GRM" ${this._formData.unitPricingUnit === 'GRM' ? 'selected' : ''}>GRM (Grams)</option>
                                <option value="KGM" ${this._formData.unitPricingUnit === 'KGM' ? 'selected' : ''}>KGM (Kilograms)</option>
                                <option value="CMT" ${this._formData.unitPricingUnit === 'CMT' ? 'selected' : ''}>CMT (Centimeters)</option>
                                <option value="MTR" ${this._formData.unitPricingUnit === 'MTR' ? 'selected' : ''}>MTR (Meters)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Base Unit Value</label>
                            <input type="number" step="0.01" class="form-input" id="unitPricingBaseValue" value="${this._formData.unitPricingBaseValue || ''}" placeholder="100">
                            <div class="help-text">Example: 100 (show price per 100ml)</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Base Unit</label>
                            <select class="form-select" id="unitPricingBaseUnit">
                                <option value="">-- Select Unit --</option>
                                <option value="ML" ${this._formData.unitPricingBaseUnit === 'ML' ? 'selected' : ''}>ML (Milliliters)</option>
                                <option value="L" ${this._formData.unitPricingBaseUnit === 'L' ? 'selected' : ''}>L (Liters)</option>
                                <option value="GRM" ${this._formData.unitPricingBaseUnit === 'GRM' ? 'selected' : ''}>GRM (Grams)</option>
                                <option value="KGM" ${this._formData.unitPricingBaseUnit === 'KGM' ? 'selected' : ''}>KGM (Kilograms)</option>
                                <option value="CMT" ${this._formData.unitPricingBaseUnit === 'CMT' ? 'selected' : ''}>CMT (Centimeters)</option>
                                <option value="MTR" ${this._formData.unitPricingBaseUnit === 'MTR' ? 'selected' : ''}>MTR (Meters)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Price Valid Until</label>
                            <input type="date" class="form-input" id="priceValidUntil" value="${this._formData.priceValidUntil || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Product Page URL</label>
                            <input type="url" class="form-input" id="offerUrl" value="${this._formData.offerUrl || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required">Availability Status</label>
                            <select class="form-select" id="availability">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/InStock" ${this._formData.availability === 'https://schema.org/InStock' ? 'selected' : ''}>In Stock</option>
                                <option value="https://schema.org/OutOfStock" ${this._formData.availability === 'https://schema.org/OutOfStock' ? 'selected' : ''}>Out of Stock</option>
                                <option value="https://schema.org/PreOrder" ${this._formData.availability === 'https://schema.org/PreOrder' ? 'selected' : ''}>Pre-Order</option>
                                <option value="https://schema.org/Discontinued" ${this._formData.availability === 'https://schema.org/Discontinued' ? 'selected' : ''}>Discontinued</option>
                                <option value="https://schema.org/LimitedAvailability" ${this._formData.availability === 'https://schema.org/LimitedAvailability' ? 'selected' : ''}>Limited Availability</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Item Condition</label>
                            <select class="form-select" id="itemCondition">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/NewCondition" ${this._formData.itemCondition === 'https://schema.org/NewCondition' ? 'selected' : ''}>New</option>
                                <option value="https://schema.org/RefurbishedCondition" ${this._formData.itemCondition === 'https://schema.org/RefurbishedCondition' ? 'selected' : ''}>Refurbished</option>
                                <option value="https://schema.org/UsedCondition" ${this._formData.itemCondition === 'https://schema.org/UsedCondition' ? 'selected' : ''}>Used</option>
                                <option value="https://schema.org/DamagedCondition" ${this._formData.itemCondition === 'https://schema.org/DamagedCondition' ? 'selected' : ''}>Damaged</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Section 4: Loyalty/Member Pricing -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="loyalty">
                    <div class="section-title">🎁 Loyalty Program & Member Pricing</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="loyalty">
                    <div class="info-box">
                        <div class="info-box-title">💳 About Loyalty Programs</div>
                        <div class="info-box-text">
                            Show special prices for loyalty program members. Google can display member prices alongside regular prices in search results.
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Member Price <span class="form-label-badge">Optional</span></label>
                            <input type="number" step="0.01" min="0" class="form-input" id="memberPrice" value="${this._formData.memberPrice || ''}">
                            <div class="help-text">
                                <strong>Example:</strong> $8.00 for members (while regular price is $10.00)
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Member Points Earned</label>
                            <input type="number" min="0" class="form-input" id="memberPointsEarned" value="${this._formData.memberPointsEarned || ''}">
                            <div class="help-text">Points earned when purchasing (e.g., 20 points)</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Membership Program Name</label>
                            <input type="text" class="form-input" id="memberProgramName" value="${this._formData.memberProgramName || ''}" placeholder="VIP Rewards">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Membership Tier</label>
                            <input type="text" class="form-input" id="memberTierName" value="${this._formData.memberTierName || ''}" placeholder="Gold, Silver, etc.">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Membership Program URL</label>
                        <input type="url" class="form-input" id="memberProgramUrl" value="${this._formData.memberProgramUrl || ''}" placeholder="https://yourstore.com/membership">
                    </div>
                </div>
            </div>

            <!-- Section 5: Product Variants (ProductGroup) -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="variants">
                    <div class="section-title">🔄 Product Variants (Sizes, Colors, etc.)</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="variants">
                    <div class="info-box">
                        <div class="info-box-title">🎨 About Product Variants</div>
                        <div class="info-box-text">
                            If this product comes in multiple variations (sizes, colors, materials), you can group them together. This helps Google understand your product catalog better and can display variant information in search results.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="isProductGroup" ${this._formData.isProductGroup ? 'checked' : ''}> 
                            This product has variants (sizes, colors, etc.)
                        </label>
                        <div class="help-text">
                            Check this if you sell this product in multiple variations. Example: T-shirts in Small, Medium, Large or Red, Blue, Green.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Product Group ID <span class="form-label-badge">Required if has variants</span></label>
                        <input type="text" class="form-input" id="productGroupID" value="${this._formData.productGroupID || ''}" placeholder="TSHIRT-2024">
                        <div class="help-text">
                            <strong>What it is:</strong> A unique identifier for this product group (parent product).<br>
                            <strong>Example:</strong> "TSHIRT-2024" or "SHOES-WINTER-COLLECTION"
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Select Variant Types:</label>
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                            <label>
                                <input type="checkbox" id="variesBySize" ${this._formData.variesBySize ? 'checked' : ''}>
                                Size (Small, Medium, Large, XL, etc.)
                            </label>
                            <label>
                                <input type="checkbox" id="variesByColor" ${this._formData.variesByColor ? 'checked' : ''}>
                                Color (Red, Blue, Green, etc.)
                            </label>
                            <label>
                                <input type="checkbox" id="variesByMaterial" ${this._formData.variesByMaterial ? 'checked' : ''}>
                                Material (Cotton, Polyester, Leather, etc.)
                            </label>
                            <label>
                                <input type="checkbox" id="variesByPattern" ${this._formData.variesByPattern ? 'checked' : ''}>
                                Pattern (Striped, Solid, Floral, etc.)
                            </label>
                        </div>
                    </div>
                    
                    <div class="warning-box">
                        <div class="warning-box-title">⚠️ Important: Variant Setup</div>
                        <div class="warning-box-text">
                            Each variant must have its own unique SKU, GTIN (8, 12, 13, or 14 digits), and URL. If you're using variants, make sure each size/color combination has these identifiers.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Individual Variants</label>
                        <div id="variantsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addVariant">+ Add Variant</button>
                    </div>
                </div>
            </div>
            
            <!-- Section 6: Shipping Details -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="shipping">
                    <div class="section-title">🚚 Shipping Details</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="shipping">
                    <div class="warning-box">
                        <div class="warning-box-title">⚠️ Google Shopping Requirements</div>
                        <div class="warning-box-text">
                            Complete these fields to appear in Google Shopping. You can add multiple shipping conditions for different countries or order values.
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Shipping Cost</label>
                            <input type="number" step="0.01" min="0" class="form-input" id="shippingCost" value="${this._formData.shippingCost || ''}" placeholder="0.00">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Shipping Currency</label>
                            <select class="form-select" id="shippingCurrency">
                                ${currencies}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Shipping Destination</label>
                        <select class="form-select" id="shippingDestination">
                            ${countries}
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Handling Time (Days)</label>
                            <div class="form-row">
                                <input type="number" min="0" class="form-input" id="handlingTimeMin" value="${this._formData.handlingTimeMin || ''}" placeholder="Min">
                                <input type="number" min="0" class="form-input" id="handlingTimeMax" value="${this._formData.handlingTimeMax || ''}" placeholder="Max">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Delivery Time (Days)</label>
                            <div class="form-row">
                                <input type="number" min="0" class="form-input" id="deliveryTimeMin" value="${this._formData.deliveryTimeMin || ''}" placeholder="Min">
                                <input type="number" min="0" class="form-input" id="deliveryTimeMax" value="${this._formData.deliveryTimeMax || ''}" placeholder="Max">
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-box">
                        <div class="info-box-title">📋 Multiple Shipping Conditions</div>
                        <div class="info-box-text">
                            You can specify different shipping rates based on order value or destination. Example: Free shipping for orders over $50, otherwise $5.99.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Additional Shipping Conditions</label>
                        <div id="shippingConditionsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addShippingCondition">+ Add Shipping Condition</button>
                    </div>
                </div>
            </div>
            
            <!-- Section 7: Return Policy -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="returns">
                    <div class="section-title">↩️ Return Policy</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="returns">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Return Window (Days)</label>
                            <input type="number" min="0" class="form-input" id="returnDays" value="${this._formData.returnDays || ''}" placeholder="30">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Return Policy Country</label>
                            <select class="form-select" id="returnCountry">
                                ${countries}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Return Method</label>
                            <select class="form-select" id="returnMethod">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/ReturnByMail" ${this._formData.returnMethod === 'https://schema.org/ReturnByMail' ? 'selected' : ''}>Return by Mail</option>
                                <option value="https://schema.org/ReturnInStore" ${this._formData.returnMethod === 'https://schema.org/ReturnInStore' ? 'selected' : ''}>Return in Store</option>
                                <option value="https://schema.org/ReturnAtKiosk" ${this._formData.returnMethod === 'https://schema.org/ReturnAtKiosk' ? 'selected' : ''}>Return at Kiosk</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Return Fees</label>
                            <select class="form-select" id="returnFees">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/FreeReturn" ${this._formData.returnFees === 'https://schema.org/FreeReturn' ? 'selected' : ''}>Free Return</option>
                                <option value="https://schema.org/ReturnShippingFees" ${this._formData.returnFees === 'https://schema.org/ReturnShippingFees' ? 'selected' : ''}>Customer Pays Shipping</option>
                                <option value="https://schema.org/RestockingFees" ${this._formData.returnFees === 'https://schema.org/RestockingFees' ? 'selected' : ''}>Restocking Fee</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Return Shipping Fees Amount</label>
                        <input type="number" step="0.01" min="0" class="form-input" id="returnShippingFees" value="${this._formData.returnShippingFees || ''}" placeholder="5.99">
                        <div class="help-text">Cost to customer for return shipping (if applicable)</div>
                    </div>
                    
                    <div class="info-box">
                        <div class="info-box-title">🔍 Detailed Return Options</div>
                        <div class="info-box-text">
                            Specify different return policies for customer remorse (changed mind) vs. defective items.
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Customer Remorse Return Fees</label>
                            <select class="form-select" id="customerRemorseReturnFees">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/FreeReturn" ${this._formData.customerRemorseReturnFees === 'https://schema.org/FreeReturn' ? 'selected' : ''}>Free</option>
                                <option value="https://schema.org/ReturnShippingFees" ${this._formData.customerRemorseReturnFees === 'https://schema.org/ReturnShippingFees' ? 'selected' : ''}>Customer Pays</option>
                            </select>
                            <div class="help-text">Policy when customer changes mind</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Item Defect Return Fees</label>
                            <select class="form-select" id="itemDefectReturnFees">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/FreeReturn" ${this._formData.itemDefectReturnFees === 'https://schema.org/FreeReturn' ? 'selected' : ''}>Free</option>
                                <option value="https://schema.org/ReturnShippingFees" ${this._formData.itemDefectReturnFees === 'https://schema.org/ReturnShippingFees' ? 'selected' : ''}>Customer Pays</option>
                            </select>
                            <div class="help-text">Policy for defective items</div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Return Label Source</label>
                        <select class="form-select" id="returnLabelSource">
                            <option value="">-- Select --</option>
                            <option value="https://schema.org/ReturnLabelInBox" ${this._formData.returnLabelSource === 'https://schema.org/ReturnLabelInBox' ? 'selected' : ''}>Label Included in Box</option>
                            <option value="https://schema.org/ReturnLabelDownloadAndPrint" ${this._formData.returnLabelSource === 'https://schema.org/ReturnLabelDownloadAndPrint' ? 'selected' : ''}>Customer Downloads & Prints</option>
                            <option value="https://schema.org/ReturnLabelCustomerResponsibility" ${this._formData.returnLabelSource === 'https://schema.org/ReturnLabelCustomerResponsibility' ? 'selected' : ''}>Customer Provides Own Label</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Section 8: Reviews & Ratings -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="reviews">
                    <div class="section-title">⭐ Reviews & Ratings</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="reviews">
                    <div class="warning-box">
                        <div class="warning-box-title">⚠️ Critical: Fake Reviews Are Prohibited</div>
                        <div class="warning-box-text">
                            <strong>DO NOT create fake reviews!</strong> Only add genuine reviews from real customers. Violations result in penalties.
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Average Rating</label>
                            <input type="number" step="0.1" min="0" max="5" class="form-input" id="aggregateRatingValue" value="${this._formData.aggregateRatingValue || ''}" placeholder="4.5">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Total Review Count</label>
                            <input type="number" min="0" class="form-input" id="reviewCount" value="${this._formData.reviewCount || ''}" placeholder="89">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Individual Reviews</label>
                        <div id="reviewsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addReview">+ Add Review</button>
                    </div>
                </div>
            </div>
            
            <!-- Section 9: Certifications -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="certifications">
                    <div class="section-title">🏆 Certifications & Awards</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="certifications">
                    <div class="info-box">
                        <div class="info-box-title">🎖️ About Certifications</div>
                        <div class="info-box-text">
                            Add certifications like energy efficiency labels (EPREL), CO2 emissions class, organic certifications, safety certifications, etc. These can appear in search results for certain products.
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Certification Name</label>
                            <input type="text" class="form-input" id="certificationName" value="${this._formData.certificationName || ''}" placeholder="EPREL, Vehicle_CO2_Class, etc.">
                            <div class="help-text">
                                <strong>Examples:</strong> EPREL (energy label), Vehicle_CO2_Class, USDA Organic, Energy Star
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Certification Issuer</label>
                            <input type="text" class="form-input" id="certificationIssuer" value="${this._formData.certificationIssuer || ''}" placeholder="European Commission, EPA, etc.">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Certification Rating/Class</label>
                            <input type="text" class="form-input" id="certificationRating" value="${this._formData.certificationRating || ''}" placeholder="A++, D, 5-star, etc.">
                            <div class="help-text">Rating or class (e.g., "A++" for energy, "D" for CO2 emissions)</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Certification ID Number</label>
                            <input type="text" class="form-input" id="certificationId" value="${this._formData.certificationId || ''}" placeholder="123456">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Multiple Certifications</label>
                        <div id="certificationsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addCertification">+ Add Another Certification</button>
                    </div>
                </div>
            </div>
            
            <!-- Section 10: 3D Model & Media -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="media">
                    <div class="section-title">🎨 3D Model & Advanced Media</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="media">
                    <div class="info-box">
                        <div class="info-box-title">🖼️ About 3D Models</div>
                        <div class="info-box-text">
                            Add a 3D model of your product. Google can display 3D models in search results, allowing customers to view products from all angles. Supported formats: GLTF, GLB.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">3D Model URL <span class="form-label-badge">Optional</span></label>
                        <input type="url" class="form-input" id="model3dUrl" value="${this._formData.model3dUrl || ''}" placeholder="https://example.com/product.gltf">
                        <div class="help-text">
                            <strong>Supported formats:</strong> .gltf or .glb files<br>
                            <strong>Example:</strong> https://example.com/sofa-3d-model.gltf
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Section 11: FAQ Schema -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="faq">
                    <div class="section-title">❓ FAQ Schema</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="faq">
                    <div class="warning-box">
                        <div class="warning-box-title">⚠️ FAQ Best Practices</div>
                        <div class="warning-box-text">
                            <strong>Only add FAQs if they actually exist on your product page!</strong> FAQs must be visible to users. Don't use for promotional content.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Frequently Asked Questions</label>
                        <div id="faqsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addFaq">+ Add FAQ</button>
                    </div>
                </div>
            </div>
            
            <!-- Section 12: Social Media -->
            <div class="form-section">
                <div class="section-header collapsed" data-section="social">
                    <div class="section-title">🌐 Social Media / Open Graph</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="social">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Open Graph Title</label>
                            <input type="text" class="form-input" id="ogTitle" value="${this._formData.ogTitle || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Open Graph Image</label>
                            <input type="url" class="form-input" id="ogImage" value="${this._formData.ogImage || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Open Graph Description</label>
                        <textarea class="form-textarea" id="ogDescription" rows="3">${this._formData.ogDescription || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Twitter Card Type</label>
                        <select class="form-select" id="twitterCard">
                            <option value="summary" ${this._formData.twitterCard === 'summary' ? 'selected' : ''}>Summary</option>
                            <option value="summary_large_image" ${this._formData.twitterCard === 'summary_large_image' ? 'selected' : ''}>Summary Large Image</option>
                            <option value="product" ${this._formData.twitterCard === 'product' ? 'selected' : ''}>Product</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        // Set up collapsible sections
        const sectionHeaders = formBody.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sectionName = header.dataset.section;
                const content = formBody.querySelector(`[data-content="${sectionName}"]`);
                header.classList.toggle('collapsed');
                content.classList.toggle('collapsed');
            });
        });
        
        // Set selected values for dropdowns
        setTimeout(() => {
            const priceCurrency = formBody.querySelector('#priceCurrency');
            if (priceCurrency) priceCurrency.value = this._formData.priceCurrency || 'USD';
            
            const shippingCurrency = formBody.querySelector('#shippingCurrency');
            if (shippingCurrency) shippingCurrency.value = this._formData.shippingCurrency || 'USD';
            
            const shippingDestination = formBody.querySelector('#shippingDestination');
            if (shippingDestination) shippingDestination.value = this._formData.shippingDestination || '';
            
            const returnCountry = formBody.querySelector('#returnCountry');
            if (returnCountry) returnCountry.value = this._formData.returnCountry || '';
            
            // Render dynamic lists
            this._renderReviews();
            this._renderFaqs();
            this._renderVariants();
            this._renderCertifications();
            this._renderShippingConditions();
            
            // Set up add buttons
            formBody.querySelector('#addReview')?.addEventListener('click', () => this._addReview());
            formBody.querySelector('#addFaq')?.addEventListener('click', () => this._addFaq());
            formBody.querySelector('#addVariant')?.addEventListener('click', () => this._addVariant());
            formBody.querySelector('#addCertification')?.addEventListener('click', () => this._addCertification());
            formBody.querySelector('#addShippingCondition')?.addEventListener('click', () => this._addShippingCondition());
        }, 0);
    }

    _renderReviews() {
        const reviewsList = this._shadow.getElementById('reviewsList');
        
        if (!reviewsList) {
            console.warn('🔷 Dashboard: reviewsList element not found');
            return;
        }
        
        reviewsList.innerHTML = '';
        
        if (this._reviews.length === 0) {
            reviewsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No reviews added yet.</p>';
            return;
        }
        
        this._reviews.forEach((review, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'dynamic-item';
            reviewItem.innerHTML = `
                <div class="dynamic-item-header">
                    <div class="dynamic-item-title">Review #${index + 1}</div>
                    <button type="button" class="btn-remove" data-index="${index}">Remove</button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Reviewer Name</label>
                        <input type="text" class="form-input review-author" data-index="${index}" value="${review.author || ''}" placeholder="John Smith">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Rating (1-5)</label>
                        <input type="number" min="1" max="5" class="form-input review-rating" data-index="${index}" value="${review.rating || ''}" placeholder="5">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Review Title</label>
                    <input type="text" class="form-input review-title" data-index="${index}" value="${review.title || ''}" placeholder="Great product!">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Review Text</label>
                    <textarea class="form-textarea review-text" data-index="${index}" rows="3" placeholder="This product exceeded my expectations...">${review.text || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Review Date</label>
                        <input type="date" class="form-input review-date" data-index="${index}" value="${review.date || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Positive Notes (comma-separated)</label>
                        <input type="text" class="form-input review-pros" data-index="${index}" value="${review.pros || ''}" placeholder="Durable, Good value, Fast delivery">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Negative Notes (comma-separated)</label>
                    <input type="text" class="form-input review-cons" data-index="${index}" value="${review.cons || ''}" placeholder="Expensive, Heavy">
                </div>
            `;
            
            reviewsList.appendChild(reviewItem);
            
            // Add remove listener
            reviewItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._reviews.splice(index, 1);
                this._renderReviews();
            });
            
            // Add change listeners
            reviewItem.querySelector('.review-author').addEventListener('input', (e) => {
                this._reviews[index].author = e.target.value;
            });
            
            reviewItem.querySelector('.review-rating').addEventListener('input', (e) => {
                this._reviews[index].rating = e.target.value;
            });
            
            reviewItem.querySelector('.review-title').addEventListener('input', (e) => {
                this._reviews[index].title = e.target.value;
            });
            
            reviewItem.querySelector('.review-text').addEventListener('input', (e) => {
                this._reviews[index].text = e.target.value;
            });
            
            reviewItem.querySelector('.review-date').addEventListener('input', (e) => {
                this._reviews[index].date = e.target.value;
            });
            
            reviewItem.querySelector('.review-pros').addEventListener('input', (e) => {
                this._reviews[index].pros = e.target.value;
            });
            
            reviewItem.querySelector('.review-cons').addEventListener('input', (e) => {
                this._reviews[index].cons = e.target.value;
            });
        });
    }
    
    _addReview() {
        this._reviews.push({
            author: '',
            rating: '',
            title: '',
            text: '',
            date: '',
            pros: '',
            cons: ''
        });
        this._renderReviews();
    }
    
    _renderFaqs() {
        const faqsList = this._shadow.getElementById('faqsList');
        
        if (!faqsList) {
            console.warn('🔷 Dashboard: faqsList element not found');
            return;
        }
        
        faqsList.innerHTML = '';
        
        if (this._faqs.length === 0) {
            faqsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No FAQs added yet.</p>';
            return;
        }
        
        this._faqs.forEach((faq, index) => {
            const faqItem = document.createElement('div');
            faqItem.className = 'dynamic-item';
            faqItem.innerHTML = `
                <div class="dynamic-item-header">
                    <div class="dynamic-item-title">FAQ #${index + 1}</div>
                    <button type="button" class="btn-remove" data-index="${index}">Remove</button>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Question</label>
                    <input type="text" class="form-input faq-question" data-index="${index}" value="${faq.question || ''}" placeholder="What is the warranty period?">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Answer</label>
                    <textarea class="form-textarea faq-answer" data-index="${index}" rows="3" placeholder="This product comes with a 2-year manufacturer warranty...">${faq.answer || ''}</textarea>
                </div>
            `;
            
            faqsList.appendChild(faqItem);
            
            // Add remove listener
            faqItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._faqs.splice(index, 1);
                this._renderFaqs();
            });
            
            // Add change listeners
            faqItem.querySelector('.faq-question').addEventListener('input', (e) => {
                this._faqs[index].question = e.target.value;
            });
            
            faqItem.querySelector('.faq-answer').addEventListener('input', (e) => {
                this._faqs[index].answer = e.target.value;
            });
        });
    }
    
    _addFaq() {
        this._faqs.push({
            question: '',
            answer: ''
        });
        this._renderFaqs();
    }
    
    _renderVariants() {
        const variantsList = this._shadow.getElementById('variantsList');
        
        if (!variantsList) {
            console.warn('🔷 Dashboard: variantsList element not found');
            return;
        }
        
        variantsList.innerHTML = '';
        
        if (this._variants.length === 0) {
            variantsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No variants added yet.</p>';
            return;
        }
        
        this._variants.forEach((variant, index) => {
            const variantItem = document.createElement('div');
            variantItem.className = 'dynamic-item';
            variantItem.innerHTML = `
                <div class="dynamic-item-header">
                    <div class="dynamic-item-title">Variant #${index + 1}</div>
                    <button type="button" class="btn-remove" data-index="${index}">Remove</button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Variant Name</label>
                        <input type="text" class="form-input variant-name" data-index="${index}" value="${variant.name || ''}" placeholder="Small Red T-Shirt">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Variant SKU</label>
                        <input type="text" class="form-input variant-sku" data-index="${index}" value="${variant.sku || ''}" placeholder="TSHIRT-SM-RED">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Size</label>
                        <input type="text" class="form-input variant-size" data-index="${index}" value="${variant.size || ''}" placeholder="Small, Medium, Large">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Color</label>
                        <input type="text" class="form-input variant-color" data-index="${index}" value="${variant.color || ''}" placeholder="Red, Blue, Green">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Material</label>
                        <input type="text" class="form-input variant-material" data-index="${index}" value="${variant.material || ''}" placeholder="Cotton, Polyester">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Pattern</label>
                        <input type="text" class="form-input variant-pattern" data-index="${index}" value="${variant.pattern || ''}" placeholder="Striped, Solid">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Variant GTIN</label>
                        <input type="text" class="form-input variant-gtin" data-index="${index}" value="${variant.gtin || ''}" placeholder="8, 12, 13, or 14 digits">
                        <div class="help-text">Must be 8, 12, 13, or 14 digits</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Variant URL</label>
                        <input type="url" class="form-input variant-url" data-index="${index}" value="${variant.url || ''}" placeholder="https://store.com/product?size=small&color=red">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Variant Price</label>
                        <input type="number" step="0.01" class="form-input variant-price" data-index="${index}" value="${variant.price || ''}" placeholder="29.99">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Variant Availability</label>
                        <select class="form-select variant-availability" data-index="${index}">
                            <option value="">-- Select --</option>
                            <option value="https://schema.org/InStock" ${variant.availability === 'https://schema.org/InStock' ? 'selected' : ''}>In Stock</option>
                            <option value="https://schema.org/OutOfStock" ${variant.availability === 'https://schema.org/OutOfStock' ? 'selected' : ''}>Out of Stock</option>
                            <option value="https://schema.org/PreOrder" ${variant.availability === 'https://schema.org/PreOrder' ? 'selected' : ''}>Pre-Order</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Variant Image URL</label>
                    <input type="url" class="form-input variant-image" data-index="${index}" value="${variant.image || ''}" placeholder="https://example.com/tshirt-small-red.jpg">
                </div>
            `;
            
            variantsList.appendChild(variantItem);
            
            // Add remove listener
            variantItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._variants.splice(index, 1);
                this._renderVariants();
            });
            
            // Add change listeners
            variantItem.querySelector('.variant-name').addEventListener('input', (e) => {
                this._variants[index].name = e.target.value;
            });
            
            variantItem.querySelector('.variant-sku').addEventListener('input', (e) => {
                this._variants[index].sku = e.target.value;
            });
            
            variantItem.querySelector('.variant-size').addEventListener('input', (e) => {
                this._variants[index].size = e.target.value;
            });
            
            variantItem.querySelector('.variant-color').addEventListener('input', (e) => {
                this._variants[index].color = e.target.value;
            });
            
            variantItem.querySelector('.variant-material').addEventListener('input', (e) => {
                this._variants[index].material = e.target.value;
            });
            
            variantItem.querySelector('.variant-pattern').addEventListener('input', (e) => {
                this._variants[index].pattern = e.target.value;
            });
            
            variantItem.querySelector('.variant-gtin').addEventListener('input', (e) => {
                this._variants[index].gtin = e.target.value;
            });
            
            variantItem.querySelector('.variant-url').addEventListener('input', (e) => {
                this._variants[index].url = e.target.value;
            });
            
            variantItem.querySelector('.variant-price').addEventListener('input', (e) => {
                this._variants[index].price = e.target.value;
            });
            
            variantItem.querySelector('.variant-availability').addEventListener('change', (e) => {
                this._variants[index].availability = e.target.value;
            });
            
            variantItem.querySelector('.variant-image').addEventListener('input', (e) => {
                this._variants[index].image = e.target.value;
            });
        });
    }
    
    _addVariant() {
        this._variants.push({
            name: '',
            sku: '',
            size: '',
            color: '',
            material: '',
            pattern: '',
            gtin: '',
            url: '',
            price: '',
            availability: '',
            image: ''
        });
        this._renderVariants();
    }
    
    _renderCertifications() {
        const certificationsList = this._shadow.getElementById('certificationsList');
        
        if (!certificationsList) {
            console.warn('🔷 Dashboard: certificationsList element not found');
            return;
        }
        
        certificationsList.innerHTML = '';
        
        if (this._certifications.length === 0) {
            certificationsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No additional certifications added yet.</p>';
            return;
        }
        
        this._certifications.forEach((cert, index) => {
            const certItem = document.createElement('div');
            certItem.className = 'dynamic-item';
            certItem.innerHTML = `
                <div class="dynamic-item-header">
                    <div class="dynamic-item-title">Certification #${index + 1}</div>
                    <button type="button" class="btn-remove" data-index="${index}">Remove</button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Certification Name</label>
                        <input type="text" class="form-input cert-name" data-index="${index}" value="${cert.name || ''}" placeholder="Energy Star">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Issuing Organization</label>
                        <input type="text" class="form-input cert-issuer" data-index="${index}" value="${cert.issuer || ''}" placeholder="EPA">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Rating/Class</label>
                        <input type="text" class="form-input cert-rating" data-index="${index}" value="${cert.rating || ''}" placeholder="A++, 5-star, etc.">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Certification ID</label>
                        <input type="text" class="form-input cert-id" data-index="${index}" value="${cert.id || ''}" placeholder="123456">
                    </div>
                </div>
            `;
            
            certificationsList.appendChild(certItem);
            
            // Add remove listener
            certItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._certifications.splice(index, 1);
                this._renderCertifications();
            });
            
            // Add change listeners
            certItem.querySelector('.cert-name').addEventListener('input', (e) => {
                this._certifications[index].name = e.target.value;
            });
            
            certItem.querySelector('.cert-issuer').addEventListener('input', (e) => {
                this._certifications[index].issuer = e.target.value;
            });
            
            certItem.querySelector('.cert-rating').addEventListener('input', (e) => {
                this._certifications[index].rating = e.target.value;
            });
            
            certItem.querySelector('.cert-id').addEventListener('input', (e) => {
                this._certifications[index].id = e.target.value;
            });
        });
    }
    
    _addCertification() {
        this._certifications.push({
            name: '',
            issuer: '',
            rating: '',
            id: ''
        });
        this._renderCertifications();
    }
    
    _renderShippingConditions() {
        const shippingConditionsList = this._shadow.getElementById('shippingConditionsList');
        
        if (!shippingConditionsList) {
            console.warn('🔷 Dashboard: shippingConditionsList element not found');
            return;
        }
        
        shippingConditionsList.innerHTML = '';
        
        if (this._shippingConditions.length === 0) {
            shippingConditionsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No additional shipping conditions added yet.</p>';
            return;
        }
        
        const countries = this._getAllCountries();
        const currencies = this._getAllCurrencies();
        
        this._shippingConditions.forEach((condition, index) => {
            const conditionItem = document.createElement('div');
            conditionItem.className = 'dynamic-item';
            conditionItem.innerHTML = `
                <div class="dynamic-item-header">
                    <div class="dynamic-item-title">Shipping Condition #${index + 1}</div>
                    <button type="button" class="btn-remove" data-index="${index}">Remove</button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Destination Country</label>
                        <select class="form-select condition-country" data-index="${index}">
                            ${countries}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Shipping Cost</label>
                        <input type="number" step="0.01" min="0" class="form-input condition-cost" data-index="${index}" value="${condition.cost || ''}" placeholder="5.99">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Currency</label>
                        <select class="form-select condition-currency" data-index="${index}">
                            ${currencies}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Minimum Order Value</label>
                        <input type="number" step="0.01" min="0" class="form-input condition-min-order" data-index="${index}" value="${condition.minOrder || ''}" placeholder="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Maximum Order Value</label>
                        <input type="number" step="0.01" min="0" class="form-input condition-max-order" data-index="${index}" value="${condition.maxOrder || ''}" placeholder="49.99">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" class="condition-no-ship" data-index="${index}" ${condition.doesNotShip ? 'checked' : ''}>
                            Does not ship to this destination
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-input condition-description" data-index="${index}" value="${condition.description || ''}" placeholder="Free shipping for orders over $50">
                </div>
            `;
            
            shippingConditionsList.appendChild(conditionItem);
            
            // Set select values
            setTimeout(() => {
                conditionItem.querySelector('.condition-country').value = condition.country || '';
                conditionItem.querySelector('.condition-currency').value = condition.currency || 'USD';
            }, 0);
            
            // Add remove listener
            conditionItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._shippingConditions.splice(index, 1);
                this._renderShippingConditions();
            });
            
            // Add change listeners
            conditionItem.querySelector('.condition-country').addEventListener('change', (e) => {
                this._shippingConditions[index].country = e.target.value;
            });
            
            conditionItem.querySelector('.condition-cost').addEventListener('input', (e) => {
                this._shippingConditions[index].cost = e.target.value;
            });
            
            conditionItem.querySelector('.condition-currency').addEventListener('change', (e) => {
                this._shippingConditions[index].currency = e.target.value;
            });
            
            conditionItem.querySelector('.condition-min-order').addEventListener('input', (e) => {
                this._shippingConditions[index].minOrder = e.target.value;
            });
            
            conditionItem.querySelector('.condition-max-order').addEventListener('input', (e) => {
                this._shippingConditions[index].maxOrder = e.target.value;
            });
            
            conditionItem.querySelector('.condition-no-ship').addEventListener('change', (e) => {
                this._shippingConditions[index].doesNotShip = e.target.checked;
            });
            
            conditionItem.querySelector('.condition-description').addEventListener('input', (e) => {
                this._shippingConditions[index].description = e.target.value;
            });
        });
    }
    
    _addShippingCondition() {
        this._shippingConditions.push({
            country: '',
            cost: '',
            currency: 'USD',
            minOrder: '',
            maxOrder: '',
            doesNotShip: false,
            description: ''
        });
        this._renderShippingConditions();
    }

    _collectFormData() {
        const formBody = this._shadow.getElementById('formBody');
        
        // Collect all form values
        const data = {
            // Basic SEO
            productName: formBody.querySelector('#productName')?.value.trim() || '',
            description: formBody.querySelector('#description')?.value.trim() || '',
            metaKeywords: formBody.querySelector('#metaKeywords')?.value.trim() || '',
            canonicalUrl: formBody.querySelector('#canonicalUrl')?.value.trim() || '',
            robotsContent: formBody.querySelector('#robotsContent')?.value || 'index, follow',
            
            // Product Schema
            sku: formBody.querySelector('#sku')?.value.trim() || '',
            mpn: formBody.querySelector('#mpn')?.value.trim() || '',
            gtin: formBody.querySelector('#gtin')?.value.trim() || '',
            isbn: formBody.querySelector('#isbn')?.value.trim() || '',
            brandName: formBody.querySelector('#brandName')?.value.trim() || '',
            
            // Images
            imageUrls: [],
            
            // Pricing
            price: formBody.querySelector('#price')?.value.trim() || '',
            priceCurrency: formBody.querySelector('#priceCurrency')?.value || 'USD',
            priceValidUntil: formBody.querySelector('#priceValidUntil')?.value || '',
            offerUrl: formBody.querySelector('#offerUrl')?.value.trim() || '',
            availability: formBody.querySelector('#availability')?.value || '',
            itemCondition: formBody.querySelector('#itemCondition')?.value || '',
            
            // Sale Pricing
            strikethroughPrice: formBody.querySelector('#strikethroughPrice')?.value.trim() || '',
            
            // Unit Pricing
            unitPricingValue: formBody.querySelector('#unitPricingValue')?.value.trim() || '',
            unitPricingUnit: formBody.querySelector('#unitPricingUnit')?.value || '',
            unitPricingBaseValue: formBody.querySelector('#unitPricingBaseValue')?.value.trim() || '',
            unitPricingBaseUnit: formBody.querySelector('#unitPricingBaseUnit')?.value || '',
            
            // Member/Loyalty Pricing
            memberPrice: formBody.querySelector('#memberPrice')?.value.trim() || '',
            memberProgramName: formBody.querySelector('#memberProgramName')?.value.trim() || '',
            memberProgramUrl: formBody.querySelector('#memberProgramUrl')?.value.trim() || '',
            memberTierName: formBody.querySelector('#memberTierName')?.value.trim() || '',
            memberPointsEarned: formBody.querySelector('#memberPointsEarned')?.value.trim() || '',
            
            // Product Group (Variants)
            isProductGroup: formBody.querySelector('#isProductGroup')?.checked || false,
            productGroupID: formBody.querySelector('#productGroupID')?.value.trim() || '',
            variesBySize: formBody.querySelector('#variesBySize')?.checked || false,
            variesByColor: formBody.querySelector('#variesByColor')?.checked || false,
            variesByMaterial: formBody.querySelector('#variesByMaterial')?.checked || false,
            variesByPattern: formBody.querySelector('#variesByPattern')?.checked || false,
            
            // Shipping
            shippingCost: formBody.querySelector('#shippingCost')?.value.trim() || '',
            shippingCurrency: formBody.querySelector('#shippingCurrency')?.value || 'USD',
            shippingDestination: formBody.querySelector('#shippingDestination')?.value || '',
            handlingTimeMin: formBody.querySelector('#handlingTimeMin')?.value.trim() || '',
            handlingTimeMax: formBody.querySelector('#handlingTimeMax')?.value.trim() || '',
            deliveryTimeMin: formBody.querySelector('#deliveryTimeMin')?.value.trim() || '',
            deliveryTimeMax: formBody.querySelector('#deliveryTimeMax')?.value.trim() || '',
            
            // Returns
            returnDays: formBody.querySelector('#returnDays')?.value.trim() || '',
            returnCountry: formBody.querySelector('#returnCountry')?.value || '',
            returnMethod: formBody.querySelector('#returnMethod')?.value || '',
            returnFees: formBody.querySelector('#returnFees')?.value || '',
            returnShippingFees: formBody.querySelector('#returnShippingFees')?.value.trim() || '',
            customerRemorseReturnFees: formBody.querySelector('#customerRemorseReturnFees')?.value || '',
            itemDefectReturnFees: formBody.querySelector('#itemDefectReturnFees')?.value || '',
            returnLabelSource: formBody.querySelector('#returnLabelSource')?.value || '',
            
            // Reviews
            aggregateRatingValue: formBody.querySelector('#aggregateRatingValue')?.value.trim() || '',
            reviewCount: formBody.querySelector('#reviewCount')?.value.trim() || '',
            bestRating: '5',
            worstRating: '1',
            
            // Certifications
            certificationName: formBody.querySelector('#certificationName')?.value.trim() || '',
            certificationIssuer: formBody.querySelector('#certificationIssuer')?.value.trim() || '',
            certificationRating: formBody.querySelector('#certificationRating')?.value.trim() || '',
            certificationId: formBody.querySelector('#certificationId')?.value.trim() || '',
            
            // 3D Model
            model3dUrl: formBody.querySelector('#model3dUrl')?.value.trim() || '',
            
            // Social
            ogTitle: formBody.querySelector('#ogTitle')?.value.trim() || '',
            ogDescription: formBody.querySelector('#ogDescription')?.value.trim() || '',
            ogImage: formBody.querySelector('#ogImage')?.value.trim() || '',
            twitterCard: formBody.querySelector('#twitterCard')?.value || 'summary_large_image',
            
            // Dynamic data
            reviews: this._reviews,
            faqs: this._faqs,
            variants: this._variants,
            certifications: this._certifications,
            shippingConditions: this._shippingConditions
        };
        
        // Parse image URLs
        const imageUrlsText = formBody.querySelector('#imageUrls')?.value.trim() || '';
        if (imageUrlsText) {
            data.imageUrls = imageUrlsText.split('\n').map(url => url.trim()).filter(url => url);
        }
        
        return data;
    }
    
    _validateForm() {
        const formBody = this._shadow.getElementById('formBody');
        
        // Required fields
        const productName = formBody.querySelector('#productName')?.value.trim();
        if (!productName) {
            alert('❌ Please enter a product name');
            return false;
        }
        
        const description = formBody.querySelector('#description')?.value.trim();
        if (!description) {
            alert('❌ Please enter a meta description');
            return false;
        }
        
        const price = formBody.querySelector('#price')?.value.trim();
        if (!price) {
            alert('❌ Please enter a price');
            return false;
        }
        
        const priceCurrency = formBody.querySelector('#priceCurrency')?.value;
        if (!priceCurrency) {
            alert('❌ Please select a currency');
            return false;
        }
        
        const availability = formBody.querySelector('#availability')?.value;
        if (!availability) {
            alert('❌ Please select availability status');
            return false;
        }
        
        // Validate GTIN if provided
        const gtin = formBody.querySelector('#gtin')?.value.trim();
        if (gtin) {
            const gtinClean = gtin.replace(/\D/g, '');
            const validLengths = [8, 12, 13, 14];
            if (!validLengths.includes(gtinClean.length)) {
                alert('❌ GTIN must be 8, 12, 13, or 14 digits.\n\n' +
                      'Examples:\n' +
                      '• GTIN-8: 12345670\n' +
                      '• GTIN-12 (UPC): 123456789012\n' +
                      '• GTIN-13 (EAN): 1234567890123\n' +
                      '• GTIN-14: 12345678901234');
                return false;
            }
        }
        
        // Validate product group if enabled
        const isProductGroup = formBody.querySelector('#isProductGroup')?.checked;
        if (isProductGroup) {
            const productGroupID = formBody.querySelector('#productGroupID')?.value.trim();
            if (!productGroupID) {
                alert('❌ Please enter a Product Group ID when variants are enabled');
                return false;
            }
            
            const hasVariationType = formBody.querySelector('#variesBySize')?.checked ||
                                   formBody.querySelector('#variesByColor')?.checked ||
                                   formBody.querySelector('#variesByMaterial')?.checked ||
                                   formBody.querySelector('#variesByPattern')?.checked;
            
            if (!hasVariationType) {
                alert('❌ Please select at least one variant type (Size, Color, Material, or Pattern)');
                return false;
            }
            
            // Validate variant GTINs
            if (this._variants && this._variants.length > 0) {
                for (let i = 0; i < this._variants.length; i++) {
                    const variant = this._variants[i];
                    if (variant.gtin) {
                        const variantGtinClean = variant.gtin.replace(/\D/g, '');
                        const validLengths = [8, 12, 13, 14];
                        if (!validLengths.includes(variantGtinClean.length)) {
                            alert(`❌ Variant #${i + 1} GTIN is invalid.\n\nGTIN must be 8, 12, 13, or 14 digits.`);
                            return false;
                        }
                    }
                }
            }
        }
        
        // Validate unit pricing (all or none)
        const unitPricingValue = formBody.querySelector('#unitPricingValue')?.value.trim();
        const unitPricingUnit = formBody.querySelector('#unitPricingUnit')?.value;
        const unitPricingBaseValue = formBody.querySelector('#unitPricingBaseValue')?.value.trim();
        const unitPricingBaseUnit = formBody.querySelector('#unitPricingBaseUnit')?.value;
        
        if (unitPricingValue || unitPricingUnit || unitPricingBaseValue || unitPricingBaseUnit) {
            if (!unitPricingValue || !unitPricingUnit || !unitPricingBaseValue || !unitPricingBaseUnit) {
                alert('❌ Unit pricing requires all fields: Product Quantity Value, Product Quantity Unit, Base Unit Value, and Base Unit');
                return false;
            }
        }
        
        // Validate member pricing
        const memberPrice = formBody.querySelector('#memberPrice')?.value.trim();
        if (memberPrice) {
            const memberProgramName = formBody.querySelector('#memberProgramName')?.value.trim();
            if (!memberProgramName) {
                alert('❌ Member pricing requires a Membership Program Name');
                return false;
            }
        }
        
        return true;
    }
    
    _handleSave() {
        console.log('🔷 Dashboard: Handling save');
        
        // Validate
        if (!this._validateForm()) {
            return;
        }
        
        // Collect form data
        const seoData = this._collectFormData();
        
        console.log('🔷 Dashboard: Collected SEO data:', seoData);
        
        const existingSEO = this._seoItems.find(item => 
            item.productId === this._selectedProduct.id || item.title === this._selectedProduct.name
        );
        
        this._dispatchEvent('save-seo', {
            product: this._selectedProduct,
            seoData: seoData,
            existingSEO: existingSEO
        });
    }
    
    _deleteSEO(product, seoData) {
        if (!confirm(`Delete SEO data for "${product.name}"?`)) {
            return;
        }
        
        this._dispatchEvent('delete-seo', {
            product: product,
            seoData: seoData
        });
    }
    
    _hideForm() {
        console.log('🔷 Dashboard: Hiding form');
        
        this._showingForm = false;
        this._selectedProduct = null;
        this._editMode = false;
        this._formData = {};
        this._reviews = [];
        this._faqs = [];
        this._variants = [];
        this._certifications = [];
        this._shippingConditions = [];
        
        const productsView = this._shadow.getElementById('productsView');
        const formView = this._shadow.getElementById('formView');
        
        formView.classList.remove('active');
        productsView.classList.add('active');
    }
    
    _updateStats() {
        this._shadow.getElementById('totalProducts').textContent = this._totalProducts;
        
        const seoConfigured = this._seoItems.length;
        const needsSetup = this._totalProducts - seoConfigured;
        
        this._shadow.getElementById('seoConfigured').textContent = seoConfigured;
        this._shadow.getElementById('needsSetup').textContent = needsSetup;
    }
    
    _updatePagination() {
        const pagination = this._shadow.getElementById('pagination');
        const prevBtn = this._shadow.getElementById('prevPage');
        const nextBtn = this._shadow.getElementById('nextPage');
        const info = this._shadow.getElementById('paginationInfo');
        
        const totalPages = Math.ceil(this._totalProducts / this._pageSize);
        
        if (totalPages > 1) {
            pagination.style.display = 'flex';
            prevBtn.disabled = this._currentPage === 0;
            nextBtn.disabled = this._currentPage >= totalPages - 1;
            
            const start = this._currentPage * this._pageSize + 1;
            const end = Math.min((this._currentPage + 1) * this._pageSize, this._totalProducts);
            info.textContent = `${start}-${end} of ${this._totalProducts}`;
        } else {
            pagination.style.display = 'none';
        }
    }
    
    _showToast(type, message) {
        const toast = this._shadow.getElementById('toastNotification');
        const toastMessage = this._shadow.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast-notification toast-${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
    
    _getAllCurrencies() {
        const currencies = [
            { code: 'USD', name: 'US Dollar' },
            { code: 'EUR', name: 'Euro' },
            { code: 'GBP', name: 'British Pound' },
            { code: 'INR', name: 'Indian Rupee' },
            { code: 'AUD', name: 'Australian Dollar' },
            { code: 'CAD', name: 'Canadian Dollar' },
            { code: 'JPY', name: 'Japanese Yen' },
            { code: 'CNY', name: 'Chinese Yuan' }
        ];
        
        return currencies.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join('');
    }
    
    _getAllCountries() {
        const countries = [
            { code: '', name: '-- Select Country --' },
            { code: 'US', name: 'United States' },
            { code: 'GB', name: 'United Kingdom' },
            { code: 'CA', name: 'Canada' },
            { code: 'AU', name: 'Australia' },
            { code: 'DE', name: 'Germany' },
            { code: 'FR', name: 'France' },
            { code: 'IT', name: 'Italy' },
            { code: 'ES', name: 'Spain' },
            { code: 'IN', name: 'India' }
        ];
        
        return countries.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
    }
}

customElements.define('product-seo-dashboard', ProductSEODashboard);
console.log('🔷 Dashboard: ✅ Custom element registered with sample data & Google Rich Results testing');
