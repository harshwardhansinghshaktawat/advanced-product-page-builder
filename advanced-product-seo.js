class ProductSEODashboard extends HTMLElement {
    constructor() {
        super();
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
    }
    
    static get observedAttributes() {
        return ['product-data', 'notification'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'product-data' && newValue && newValue !== oldValue) {
            try {
                const data = JSON.parse(newValue);
                this.setProducts(data);
            } catch (e) {
                console.error('Error parsing product data:', e);
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
                console.error('Error parsing notification:', e);
            }
        }
    }
    
    connectedCallback() {}
    
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
                    flex: 1;
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
                
                .btn-secondary {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                }
                
                .btn-test {
                    background: #8b5cf6;
                    color: white;
                }
                
                .btn-test:hover {
                    background: #7c3aed;
                }
                
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
                
                .form-title {
                    font-size: 24px;
                    font-weight: 700;
                }
                
                .form-header-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                
                .btn-sample {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .btn-sample:hover {
                    background: rgba(255, 255, 255, 0.3);
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
                        <div id="loadingContainer" class="loading-container active">
                            <div class="spinner"></div>
                            <div class="loading-text">Loading products...</div>
                        </div>
                        
                        <div id="productsView" class="view-container">
                            <div class="products-grid" id="productsGrid"></div>
                            <div class="pagination" id="pagination" style="display: none;">
                                <button class="btn btn-secondary" id="prevPage">← Previous</button>
                                <span class="pagination-info" id="paginationInfo"></span>
                                <button class="btn btn-secondary" id="nextPage">Next →</button>
                            </div>
                        </div>
                        
                        <div id="formView" class="view-container">
                            <div class="seo-form-container">
                                <div class="form-header">
                                    <h2 class="form-title" id="formTitle">Product SEO Setup</h2>
                                    <div class="form-header-actions">
                                        <button class="btn-sample" id="loadSampleBtn">📋 Load Sample Data</button>
                                        <button class="form-close" id="closeForm">×</button>
                                    </div>
                                </div>
                                
                                <div class="form-body" id="formBody"></div>
                                
                                <div class="form-footer">
                                    <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
                                    <button class="btn btn-success" id="saveBtn">Save SEO Data</button>
                                </div>
                            </div>
                        </div>
                        
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
        
        this._shadow.getElementById('closeForm').addEventListener('click', () => {
            this._hideForm();
        });
        
        this._shadow.getElementById('cancelBtn').addEventListener('click', () => {
            this._hideForm();
        });
        
        this._shadow.getElementById('saveBtn').addEventListener('click', () => {
            this._handleSave();
        });
        
        this._shadow.getElementById('loadSampleBtn').addEventListener('click', () => {
            this._loadSampleData();
        });
    }
    
    _dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
    
    _loadProducts() {
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
                            <div class="action-buttons">
                                <button class="btn btn-warning edit-btn">✏️ Edit</button>
                                <button class="btn btn-danger delete-btn">🗑️ Delete</button>
                            </div>
                            <button class="btn btn-test test-btn">🔍 Test Rich Results</button>
                        ` : `
                            <button class="btn btn-primary set-btn">🚀 Setup SEO</button>
                        `}
                    </div>
                </div>
            `;
            
            const setBtn = card.querySelector('.set-btn');
            const editBtn = card.querySelector('.edit-btn');
            const deleteBtn = card.querySelector('.delete-btn');
            const testBtn = card.querySelector('.test-btn');
            
            if (setBtn) {
                setBtn.addEventListener('click', () => this._showForm(product, null, false));
            }
            
            if (editBtn) {
                editBtn.addEventListener('click', () => this._showForm(product, seoItem, true));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this._deleteSEO(product, seoItem));
            }
            
            if (testBtn) {
                testBtn.addEventListener('click', () => this._openRichResultsTest(product));
            }
            
            grid.appendChild(card);
        });
    }
    
    _openRichResultsTest(product) {
        const productUrl = product.productUrl || product.offerUrl;
        if (!productUrl) {
            alert('Product URL not found');
            return;
        }
        
        const fullUrl = productUrl.startsWith('http') 
            ? productUrl 
            : `${window.location.origin}${productUrl}`;
        
        const testUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(fullUrl)}`;
        window.open(testUrl, '_blank');
    }
    
    _loadSampleData() {
        this._formData = {
            productName: "Premium Artisan Coffee Beans - Dark Roast",
            description: "Experience rich notes of dark chocolate and caramel with our premium organic dark roast coffee beans. Freshly roasted and delivered to your door.",
            metaKeywords: "organic coffee, dark roast, premium coffee beans, artisan coffee",
            canonicalUrl: "https://example.com/products/premium-dark-roast",
            robotsContent: "index, follow",
            sku: "COFFEE-DR-001",
            mpn: "ARTISAN-2024",
            gtin: "00812345678901",
            isbn: "",
            brandName: "Artisan Coffee Co.",
            imageUrls: [
                "https://example.com/coffee-bag-front.jpg",
                "https://example.com/coffee-beans-detail.jpg",
                "https://example.com/coffee-cup-brew.jpg"
            ],
            price: "24.99",
            priceCurrency: "USD",
            priceValidUntil: "2026-12-31",
            offerUrl: "https://example.com/products/premium-dark-roast",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            strikethroughPrice: "29.99",
            unitPricingValue: "500",
            unitPricingUnit: "GRM",
            unitPricingBaseValue: "100",
            unitPricingBaseUnit: "GRM",
            memberPrice: "21.99",
            memberProgramName: "Coffee Club VIP",
            memberProgramUrl: "https://example.com/vip-club",
            memberTierName: "Gold Member",
            memberPointsEarned: "25",
            isProductGroup: false,
            productGroupID: "",
            variesBySize: false,
            variesByColor: false,
            variesByMaterial: false,
            variesByPattern: false,
            shippingCost: "5.99",
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
            returnShippingFees: "",
            customerRemorseReturnFees: "https://schema.org/FreeReturn",
            itemDefectReturnFees: "https://schema.org/FreeReturn",
            returnLabelSource: "https://schema.org/ReturnLabelDownloadAndPrint",
            aggregateRatingValue: "4.8",
            reviewCount: "156",
            bestRating: "5",
            worstRating: "1",
            certificationName: "USDA Organic",
            certificationIssuer: "United States Department of Agriculture",
            certificationRating: "Certified Organic",
            certificationId: "ORG-2024-001",
            model3dUrl: "",
            ogTitle: "Premium Dark Roast Coffee - Artisan Quality",
            ogDescription: "Rich, bold dark roast coffee beans with chocolate notes. Perfect for espresso lovers.",
            ogImage: "https://example.com/coffee-social.jpg",
            twitterCard: "summary_large_image"
        };
        
        this._reviews = [
            {
                author: "Sarah Johnson",
                rating: "5",
                title: "Best coffee I've ever had!",
                text: "The dark roast is incredible. Rich, smooth, and no bitterness. Perfect for my morning espresso.",
                date: "2025-01-15",
                pros: "Rich flavor, Smooth taste, Great aroma",
                cons: ""
            },
            {
                author: "Mike Thompson",
                rating: "4",
                title: "Excellent quality",
                text: "High quality beans, fresh roast. Slightly expensive but worth it for the quality.",
                date: "2025-01-10",
                pros: "Fresh roast, Quality beans, Good packaging",
                cons: "Bit pricey"
            }
        ];
        
        this._faqs = [
            {
                question: "Is this coffee organic?",
                answer: "Yes, our coffee beans are USDA Certified Organic and ethically sourced from sustainable farms."
            },
            {
                question: "What's the roast date?",
                answer: "We roast to order, so your beans are roasted within 48 hours of shipping to ensure maximum freshness."
            },
            {
                question: "Can I grind the beans?",
                answer: "You can choose whole bean or select your preferred grind size at checkout (espresso, drip, French press, etc.)."
            }
        ];
        
        this._variants = [];
        this._certifications = [];
        this._shippingConditions = [
            {
                country: "US",
                cost: "0",
                currency: "USD",
                minOrder: "50",
                maxOrder: "",
                doesNotShip: false,
                description: "Free shipping on orders over $50"
            }
        ];
        
        this._renderForm();
        this._showToast('success', 'Sample data loaded successfully!');
    }
    
    _showForm(product, seoData, isEdit) {
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
        
        this._formData = {
            productName: product.name,
            description: '',
            metaKeywords: '',
            canonicalUrl: '',
            robotsContent: 'index, follow',
            sku: '',
            mpn: '',
            gtin: '',
            isbn: '',
            brandName: '',
            imageUrls: [],
            price: '',
            priceCurrency: 'USD',
            priceValidUntil: '',
            offerUrl: '',
            availability: '',
            itemCondition: '',
            strikethroughPrice: '',
            unitPricingValue: '',
            unitPricingUnit: '',
            unitPricingBaseValue: '',
            unitPricingBaseUnit: '',
            memberPrice: '',
            memberProgramName: '',
            memberProgramUrl: '',
            memberTierName: '',
            memberPointsEarned: '',
            shippingCost: '',
            shippingCurrency: 'USD',
            shippingDestination: '',
            handlingTimeMin: '',
            handlingTimeMax: '',
            deliveryTimeMin: '',
            deliveryTimeMax: '',
            returnDays: '',
            returnCountry: '',
            returnMethod: '',
            returnFees: '',
            returnShippingFees: '',
            customerRemorseReturnFees: '',
            itemDefectReturnFees: '',
            returnLabelSource: '',
            aggregateRatingValue: '',
            reviewCount: '',
            bestRating: '5',
            worstRating: '1',
            certificationName: '',
            certificationIssuer: '',
            certificationRating: '',
            certificationId: '',
            model3dUrl: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterCard: 'summary_large_image',
            isProductGroup: false,
            productGroupID: '',
            variesBySize: false,
            variesByColor: false,
            variesByMaterial: false,
            variesByPattern: false
        };
        
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
        
        this._renderForm();
        
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
            <div class="form-section">
                <div class="section-header" data-section="basic">
                    <div class="section-title">📝 Basic SEO</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content" data-content="basic">
                    <div class="form-group">
                        <label class="form-label required">Product Name</label>
                        <input type="text" class="form-input" id="productName" maxlength="60" value="${this._formData.productName || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label required">Meta Description</label>
                        <textarea class="form-textarea" id="description" maxlength="160" rows="3">${this._formData.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Meta Keywords</label>
                            <input type="text" class="form-input" id="metaKeywords" value="${this._formData.metaKeywords || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Canonical URL</label>
                            <input type="url" class="form-input" id="canonicalUrl" value="${this._formData.canonicalUrl || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Robots Directive</label>
                        <select class="form-select" id="robotsContent">
                            <option value="index, follow" ${this._formData.robotsContent === 'index, follow' ? 'selected' : ''}>Index & Follow</option>
                            <option value="index, nofollow" ${this._formData.robotsContent === 'index, nofollow' ? 'selected' : ''}>Index, No Follow</option>
                            <option value="noindex, follow" ${this._formData.robotsContent === 'noindex, follow' ? 'selected' : ''}>No Index, Follow</option>
                            <option value="noindex, nofollow" ${this._formData.robotsContent === 'noindex, nofollow' ? 'selected' : ''}>No Index, No Follow</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="schema">
                    <div class="section-title">🏷️ Product Schema</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="schema">
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
                            <label class="form-label">GTIN</label>
                            <input type="text" class="form-input" id="gtin" value="${this._formData.gtin || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">ISBN</label>
                            <input type="text" class="form-input" id="isbn" value="${this._formData.isbn || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Brand Name</label>
                            <input type="text" class="form-input" id="brandName" value="${this._formData.brandName || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Image URLs (One per line)</label>
                        <textarea class="form-textarea" id="imageUrls" rows="5">${imageUrlsValue}</textarea>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="pricing">
                    <div class="section-title">💰 Pricing</div>
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
                    
                    <div class="form-group">
                        <label class="form-label">Strikethrough Price</label>
                        <input type="number" step="0.01" min="0" class="form-input" id="strikethroughPrice" value="${this._formData.strikethroughPrice || ''}">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Product Quantity Value</label>
                            <input type="number" step="0.01" class="form-input" id="unitPricingValue" value="${this._formData.unitPricingValue || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Product Quantity Unit</label>
                            <select class="form-select" id="unitPricingUnit">
                                <option value="">-- Select --</option>
                                <option value="ML" ${this._formData.unitPricingUnit === 'ML' ? 'selected' : ''}>ML</option>
                                <option value="L" ${this._formData.unitPricingUnit === 'L' ? 'selected' : ''}>L</option>
                                <option value="GRM" ${this._formData.unitPricingUnit === 'GRM' ? 'selected' : ''}>GRM</option>
                                <option value="KGM" ${this._formData.unitPricingUnit === 'KGM' ? 'selected' : ''}>KGM</option>
                                <option value="CMT" ${this._formData.unitPricingUnit === 'CMT' ? 'selected' : ''}>CMT</option>
                                <option value="MTR" ${this._formData.unitPricingUnit === 'MTR' ? 'selected' : ''}>MTR</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Base Unit Value</label>
                            <input type="number" step="0.01" class="form-input" id="unitPricingBaseValue" value="${this._formData.unitPricingBaseValue || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Base Unit</label>
                            <select class="form-select" id="unitPricingBaseUnit">
                                <option value="">-- Select --</option>
                                <option value="ML" ${this._formData.unitPricingBaseUnit === 'ML' ? 'selected' : ''}>ML</option>
                                <option value="L" ${this._formData.unitPricingBaseUnit === 'L' ? 'selected' : ''}>L</option>
                                <option value="GRM" ${this._formData.unitPricingBaseUnit === 'GRM' ? 'selected' : ''}>GRM</option>
                                <option value="KGM" ${this._formData.unitPricingBaseUnit === 'KGM' ? 'selected' : ''}>KGM</option>
                                <option value="CMT" ${this._formData.unitPricingBaseUnit === 'CMT' ? 'selected' : ''}>CMT</option>
                                <option value="MTR" ${this._formData.unitPricingBaseUnit === 'MTR' ? 'selected' : ''}>MTR</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Price Valid Until</label>
                            <input type="date" class="form-input" id="priceValidUntil" value="${this._formData.priceValidUntil || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Product URL</label>
                            <input type="url" class="form-input" id="offerUrl" value="${this._formData.offerUrl || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required">Availability</label>
                            <select class="form-select" id="availability">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/InStock" ${this._formData.availability === 'https://schema.org/InStock' ? 'selected' : ''}>In Stock</option>
                                <option value="https://schema.org/OutOfStock" ${this._formData.availability === 'https://schema.org/OutOfStock' ? 'selected' : ''}>Out of Stock</option>
                                <option value="https://schema.org/PreOrder" ${this._formData.availability === 'https://schema.org/PreOrder' ? 'selected' : ''}>Pre-Order</option>
                                <option value="https://schema.org/Discontinued" ${this._formData.availability === 'https://schema.org/Discontinued' ? 'selected' : ''}>Discontinued</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Item Condition</label>
                            <select class="form-select" id="itemCondition">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/NewCondition" ${this._formData.itemCondition === 'https://schema.org/NewCondition' ? 'selected' : ''}>New</option>
                                <option value="https://schema.org/RefurbishedCondition" ${this._formData.itemCondition === 'https://schema.org/RefurbishedCondition' ? 'selected' : ''}>Refurbished</option>
                                <option value="https://schema.org/UsedCondition" ${this._formData.itemCondition === 'https://schema.org/UsedCondition' ? 'selected' : ''}>Used</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="loyalty">
                    <div class="section-title">🎁 Loyalty Program</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="loyalty">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Member Price</label>
                            <input type="number" step="0.01" min="0" class="form-input" id="memberPrice" value="${this._formData.memberPrice || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Member Points Earned</label>
                            <input type="number" min="0" class="form-input" id="memberPointsEarned" value="${this._formData.memberPointsEarned || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Program Name</label>
                            <input type="text" class="form-input" id="memberProgramName" value="${this._formData.memberProgramName || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Membership Tier</label>
                            <input type="text" class="form-input" id="memberTierName" value="${this._formData.memberTierName || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Program URL</label>
                        <input type="url" class="form-input" id="memberProgramUrl" value="${this._formData.memberProgramUrl || ''}">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="section-header collapsed" data-section="variants">
                    <div class="section-title">🔄 Product Variants</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="variants">
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="isProductGroup" ${this._formData.isProductGroup ? 'checked' : ''}> 
                            Has variants
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Product Group ID</label>
                        <input type="text" class="form-input" id="productGroupID" value="${this._formData.productGroupID || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Variant Types:</label>
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                            <label><input type="checkbox" id="variesBySize" ${this._formData.variesBySize ? 'checked' : ''}> Size</label>
                            <label><input type="checkbox" id="variesByColor" ${this._formData.variesByColor ? 'checked' : ''}> Color</label>
                            <label><input type="checkbox" id="variesByMaterial" ${this._formData.variesByMaterial ? 'checked' : ''}> Material</label>
                            <label><input type="checkbox" id="variesByPattern" ${this._formData.variesByPattern ? 'checked' : ''}> Pattern</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Individual Variants</label>
                        <div id="variantsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addVariant">+ Add Variant</button>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="shipping">
                    <div class="section-title">🚚 Shipping</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="shipping">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Shipping Cost</label>
                            <input type="number" step="0.01" min="0" class="form-input" id="shippingCost" value="${this._formData.shippingCost || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Currency</label>
                            <select class="form-select" id="shippingCurrency">
                                ${currencies}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Destination</label>
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
                    
                    <div class="form-group">
                        <label class="form-label">Additional Shipping Conditions</label>
                        <div id="shippingConditionsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addShippingCondition">+ Add Condition</button>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="returns">
                    <div class="section-title">↩️ Returns</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="returns">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Return Window (Days)</label>
                            <input type="number" min="0" class="form-input" id="returnDays" value="${this._formData.returnDays || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Country</label>
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
                                <option value="https://schema.org/ReturnByMail" ${this._formData.returnMethod === 'https://schema.org/ReturnByMail' ? 'selected' : ''}>By Mail</option>
                                <option value="https://schema.org/ReturnInStore" ${this._formData.returnMethod === 'https://schema.org/ReturnInStore' ? 'selected' : ''}>In Store</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Return Fees</label>
                            <select class="form-select" id="returnFees">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/FreeReturn" ${this._formData.returnFees === 'https://schema.org/FreeReturn' ? 'selected' : ''}>Free</option>
                                <option value="https://schema.org/ReturnShippingFees" ${this._formData.returnFees === 'https://schema.org/ReturnShippingFees' ? 'selected' : ''}>Customer Pays</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Shipping Fees Amount</label>
                        <input type="number" step="0.01" min="0" class="form-input" id="returnShippingFees" value="${this._formData.returnShippingFees || ''}">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Customer Remorse Fees</label>
                            <select class="form-select" id="customerRemorseReturnFees">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/FreeReturn" ${this._formData.customerRemorseReturnFees === 'https://schema.org/FreeReturn' ? 'selected' : ''}>Free</option>
                                <option value="https://schema.org/ReturnShippingFees" ${this._formData.customerRemorseReturnFees === 'https://schema.org/ReturnShippingFees' ? 'selected' : ''}>Customer Pays</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Item Defect Fees</label>
                            <select class="form-select" id="itemDefectReturnFees">
                                <option value="">-- Select --</option>
                                <option value="https://schema.org/FreeReturn" ${this._formData.itemDefectReturnFees === 'https://schema.org/FreeReturn' ? 'selected' : ''}>Free</option>
                                <option value="https://schema.org/ReturnShippingFees" ${this._formData.itemDefectReturnFees === 'https://schema.org/ReturnShippingFees' ? 'selected' : ''}>Customer Pays</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Return Label Source</label>
                        <select class="form-select" id="returnLabelSource">
                            <option value="">-- Select --</option>
                            <option value="https://schema.org/ReturnLabelInBox" ${this._formData.returnLabelSource === 'https://schema.org/ReturnLabelInBox' ? 'selected' : ''}>In Box</option>
                            <option value="https://schema.org/ReturnLabelDownloadAndPrint" ${this._formData.returnLabelSource === 'https://schema.org/ReturnLabelDownloadAndPrint' ? 'selected' : ''}>Download & Print</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="reviews">
                    <div class="section-title">⭐ Reviews</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="reviews">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Average Rating</label>
                            <input type="number" step="0.1" min="0" max="5" class="form-input" id="aggregateRatingValue" value="${this._formData.aggregateRatingValue || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Review Count</label>
                            <input type="number" min="0" class="form-input" id="reviewCount" value="${this._formData.reviewCount || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Individual Reviews</label>
                        <div id="reviewsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addReview">+ Add Review</button>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="certifications">
                    <div class="section-title">🏆 Certifications</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="certifications">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Certification Name</label>
                            <input type="text" class="form-input" id="certificationName" value="${this._formData.certificationName || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Issuer</label>
                            <input type="text" class="form-input" id="certificationIssuer" value="${this._formData.certificationIssuer || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Rating/Class</label>
                            <input type="text" class="form-input" id="certificationRating" value="${this._formData.certificationRating || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ID Number</label>
                            <input type="text" class="form-input" id="certificationId" value="${this._formData.certificationId || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Multiple Certifications</label>
                        <div id="certificationsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addCertification">+ Add</button>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="media">
                    <div class="section-title">🎨 3D Model</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="media">
                    <div class="form-group">
                        <label class="form-label">3D Model URL</label>
                        <input type="url" class="form-input" id="model3dUrl" value="${this._formData.model3dUrl || ''}">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="faq">
                    <div class="section-title">❓ FAQs</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="faq">
                    <div class="form-group">
                        <label class="form-label">Frequently Asked Questions</label>
                        <div id="faqsList" class="dynamic-list"></div>
                        <button type="button" class="btn-add" id="addFaq">+ Add FAQ</button>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <div class="section-header collapsed" data-section="social">
                    <div class="section-title">🌐 Social Media</div>
                    <div class="section-toggle">▼</div>
                </div>
                <div class="section-content collapsed" data-content="social">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">OG Title</label>
                            <input type="text" class="form-input" id="ogTitle" value="${this._formData.ogTitle || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">OG Image</label>
                            <input type="url" class="form-input" id="ogImage" value="${this._formData.ogImage || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">OG Description</label>
                        <textarea class="form-textarea" id="ogDescription" rows="3">${this._formData.ogDescription || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Twitter Card</label>
                        <select class="form-select" id="twitterCard">
                            <option value="summary" ${this._formData.twitterCard === 'summary' ? 'selected' : ''}>Summary</option>
                            <option value="summary_large_image" ${this._formData.twitterCard === 'summary_large_image' ? 'selected' : ''}>Large Image</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        const sectionHeaders = formBody.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sectionName = header.dataset.section;
                const content = formBody.querySelector(`[data-content="${sectionName}"]`);
                header.classList.toggle('collapsed');
                content.classList.toggle('collapsed');
            });
        });
        
        setTimeout(() => {
            const priceCurrency = formBody.querySelector('#priceCurrency');
            if (priceCurrency) priceCurrency.value = this._formData.priceCurrency || 'USD';
            
            const shippingCurrency = formBody.querySelector('#shippingCurrency');
            if (shippingCurrency) shippingCurrency.value = this._formData.shippingCurrency || 'USD';
            
            const shippingDestination = formBody.querySelector('#shippingDestination');
            if (shippingDestination) shippingDestination.value = this._formData.shippingDestination || '';
            
            const returnCountry = formBody.querySelector('#returnCountry');
            if (returnCountry) returnCountry.value = this._formData.returnCountry || '';
            
            this._renderReviews();
            this._renderFaqs();
            this._renderVariants();
            this._renderCertifications();
            this._renderShippingConditions();
            
            formBody.querySelector('#addReview')?.addEventListener('click', () => this._addReview());
            formBody.querySelector('#addFaq')?.addEventListener('click', () => this._addFaq());
            formBody.querySelector('#addVariant')?.addEventListener('click', () => this._addVariant());
            formBody.querySelector('#addCertification')?.addEventListener('click', () => this._addCertification());
            formBody.querySelector('#addShippingCondition')?.addEventListener('click', () => this._addShippingCondition());
        }, 0);
    }

    _renderReviews() {
        const reviewsList = this._shadow.getElementById('reviewsList');
        if (!reviewsList) return;
        
        reviewsList.innerHTML = '';
        
        if (this._reviews.length === 0) {
            reviewsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No reviews added</p>';
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
                        <input type="text" class="form-input review-author" data-index="${index}" value="${review.author || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Rating (1-5)</label>
                        <input type="number" min="1" max="5" class="form-input review-rating" data-index="${index}" value="${review.rating || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-input review-title" data-index="${index}" value="${review.title || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Review Text</label>
                    <textarea class="form-textarea review-text" data-index="${index}" rows="3">${review.text || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-input review-date" data-index="${index}" value="${review.date || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Positive Notes</label>
                        <input type="text" class="form-input review-pros" data-index="${index}" value="${review.pros || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Negative Notes</label>
                    <input type="text" class="form-input review-cons" data-index="${index}" value="${review.cons || ''}">
                </div>
            `;
            
            reviewsList.appendChild(reviewItem);
            
            reviewItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._reviews.splice(index, 1);
                this._renderReviews();
            });
            
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
        if (!faqsList) return;
        
        faqsList.innerHTML = '';
        
        if (this._faqs.length === 0) {
            faqsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No FAQs added</p>';
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
                    <input type="text" class="form-input faq-question" data-index="${index}" value="${faq.question || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Answer</label>
                    <textarea class="form-textarea faq-answer" data-index="${index}" rows="3">${faq.answer || ''}</textarea>
                </div>
            `;
            
            faqsList.appendChild(faqItem);
            
            faqItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._faqs.splice(index, 1);
                this._renderFaqs();
            });
            
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
        if (!variantsList) return;
        
        variantsList.innerHTML = '';
        
        if (this._variants.length === 0) {
            variantsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No variants added</p>';
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
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input variant-name" data-index="${index}" value="${variant.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">SKU</label>
                        <input type="text" class="form-input variant-sku" data-index="${index}" value="${variant.sku || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Size</label>
                        <input type="text" class="form-input variant-size" data-index="${index}" value="${variant.size || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Color</label>
                        <input type="text" class="form-input variant-color" data-index="${index}" value="${variant.color || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Material</label>
                        <input type="text" class="form-input variant-material" data-index="${index}" value="${variant.material || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Pattern</label>
                        <input type="text" class="form-input variant-pattern" data-index="${index}" value="${variant.pattern || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">GTIN</label>
                        <input type="text" class="form-input variant-gtin" data-index="${index}" value="${variant.gtin || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">URL</label>
                        <input type="url" class="form-input variant-url" data-index="${index}" value="${variant.url || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Price</label>
                        <input type="number" step="0.01" class="form-input variant-price" data-index="${index}" value="${variant.price || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Availability</label>
                        <select class="form-select variant-availability" data-index="${index}">
                            <option value="">-- Select --</option>
                            <option value="https://schema.org/InStock" ${variant.availability === 'https://schema.org/InStock' ? 'selected' : ''}>In Stock</option>
                            <option value="https://schema.org/OutOfStock" ${variant.availability === 'https://schema.org/OutOfStock' ? 'selected' : ''}>Out of Stock</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Image URL</label>
                    <input type="url" class="form-input variant-image" data-index="${index}" value="${variant.image || ''}">
                </div>
            `;
            
            variantsList.appendChild(variantItem);
            
            variantItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._variants.splice(index, 1);
                this._renderVariants();
            });
            
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
        if (!certificationsList) return;
        
        certificationsList.innerHTML = '';
        
        if (this._certifications.length === 0) {
            certificationsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No certifications added</p>';
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
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input cert-name" data-index="${index}" value="${cert.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Issuer</label>
                        <input type="text" class="form-input cert-issuer" data-index="${index}" value="${cert.issuer || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Rating</label>
                        <input type="text" class="form-input cert-rating" data-index="${index}" value="${cert.rating || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ID</label>
                        <input type="text" class="form-input cert-id" data-index="${index}" value="${cert.id || ''}">
                    </div>
                </div>
            `;
            
            certificationsList.appendChild(certItem);
            
            certItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._certifications.splice(index, 1);
                this._renderCertifications();
            });
            
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
        if (!shippingConditionsList) return;
        
        shippingConditionsList.innerHTML = '';
        
        if (this._shippingConditions.length === 0) {
            shippingConditionsList.innerHTML = '<p style="color: #6b7280; font-style: italic; padding: 20px; text-align: center;">No conditions added</p>';
            return;
        }
        
        const countries = this._getAllCountries();
        const currencies = this._getAllCurrencies();
        
        this._shippingConditions.forEach((condition, index) => {
            const conditionItem = document.createElement('div');
            conditionItem.className = 'dynamic-item';
            conditionItem.innerHTML = `
                <div class="dynamic-item-header">
                    <div class="dynamic-item-title">Condition #${index + 1}</div>
                    <button type="button" class="btn-remove" data-index="${index}">Remove</button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Country</label>
                        <select class="form-select condition-country" data-index="${index}">
                            ${countries}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Cost</label>
                        <input type="number" step="0.01" min="0" class="form-input condition-cost" data-index="${index}" value="${condition.cost || ''}">
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
                        <label class="form-label">Min Order</label>
                        <input type="number" step="0.01" min="0" class="form-input condition-min-order" data-index="${index}" value="${condition.minOrder || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <input type="text" class="form-input condition-description" data-index="${index}" value="${condition.description || ''}">
                </div>
            `;
            
            shippingConditionsList.appendChild(conditionItem);
            
            setTimeout(() => {
                conditionItem.querySelector('.condition-country').value = condition.country || '';
                conditionItem.querySelector('.condition-currency').value = condition.currency || 'USD';
            }, 0);
            
            conditionItem.querySelector('.btn-remove').addEventListener('click', () => {
                this._shippingConditions.splice(index, 1);
                this._renderShippingConditions();
            });
            
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
            description: ''
        });
        this._renderShippingConditions();
    }

    _collectFormData() {
        const formBody = this._shadow.getElementById('formBody');
        
        const data = {
            productName: formBody.querySelector('#productName')?.value.trim() || '',
            description: formBody.querySelector('#description')?.value.trim() || '',
            metaKeywords: formBody.querySelector('#metaKeywords')?.value.trim() || '',
            canonicalUrl: formBody.querySelector('#canonicalUrl')?.value.trim() || '',
            robotsContent: formBody.querySelector('#robotsContent')?.value || 'index, follow',
            sku: formBody.querySelector('#sku')?.value.trim() || '',
            mpn: formBody.querySelector('#mpn')?.value.trim() || '',
            gtin: formBody.querySelector('#gtin')?.value.trim() || '',
            isbn: formBody.querySelector('#isbn')?.value.trim() || '',
            brandName: formBody.querySelector('#brandName')?.value.trim() || '',
            imageUrls: [],
            price: formBody.querySelector('#price')?.value.trim() || '',
            priceCurrency: formBody.querySelector('#priceCurrency')?.value || 'USD',
            priceValidUntil: formBody.querySelector('#priceValidUntil')?.value || '',
            offerUrl: formBody.querySelector('#offerUrl')?.value.trim() || '',
            availability: formBody.querySelector('#availability')?.value || '',
            itemCondition: formBody.querySelector('#itemCondition')?.value || '',
            strikethroughPrice: formBody.querySelector('#strikethroughPrice')?.value.trim() || '',
            unitPricingValue: formBody.querySelector('#unitPricingValue')?.value.trim() || '',
            unitPricingUnit: formBody.querySelector('#unitPricingUnit')?.value || '',
            unitPricingBaseValue: formBody.querySelector('#unitPricingBaseValue')?.value.trim() || '',
            unitPricingBaseUnit: formBody.querySelector('#unitPricingBaseUnit')?.value || '',
            memberPrice: formBody.querySelector('#memberPrice')?.value.trim() || '',
            memberProgramName: formBody.querySelector('#memberProgramName')?.value.trim() || '',
            memberProgramUrl: formBody.querySelector('#memberProgramUrl')?.value.trim() || '',
            memberTierName: formBody.querySelector('#memberTierName')?.value.trim() || '',
            memberPointsEarned: formBody.querySelector('#memberPointsEarned')?.value.trim() || '',
            isProductGroup: formBody.querySelector('#isProductGroup')?.checked || false,
            productGroupID: formBody.querySelector('#productGroupID')?.value.trim() || '',
            variesBySize: formBody.querySelector('#variesBySize')?.checked || false,
            variesByColor: formBody.querySelector('#variesByColor')?.checked || false,
            variesByMaterial: formBody.querySelector('#variesByMaterial')?.checked || false,
            variesByPattern: formBody.querySelector('#variesByPattern')?.checked || false,
            shippingCost: formBody.querySelector('#shippingCost')?.value.trim() || '',
            shippingCurrency: formBody.querySelector('#shippingCurrency')?.value || 'USD',
            shippingDestination: formBody.querySelector('#shippingDestination')?.value || '',
            handlingTimeMin: formBody.querySelector('#handlingTimeMin')?.value.trim() || '',
            handlingTimeMax: formBody.querySelector('#handlingTimeMax')?.value.trim() || '',
            deliveryTimeMin: formBody.querySelector('#deliveryTimeMin')?.value.trim() || '',
            deliveryTimeMax: formBody.querySelector('#deliveryTimeMax')?.value.trim() || '',
            returnDays: formBody.querySelector('#returnDays')?.value.trim() || '',
            returnCountry: formBody.querySelector('#returnCountry')?.value || '',
            returnMethod: formBody.querySelector('#returnMethod')?.value || '',
            returnFees: formBody.querySelector('#returnFees')?.value || '',
            returnShippingFees: formBody.querySelector('#returnShippingFees')?.value.trim() || '',
            customerRemorseReturnFees: formBody.querySelector('#customerRemorseReturnFees')?.value || '',
            itemDefectReturnFees: formBody.querySelector('#itemDefectReturnFees')?.value || '',
            returnLabelSource: formBody.querySelector('#returnLabelSource')?.value || '',
            aggregateRatingValue: formBody.querySelector('#aggregateRatingValue')?.value.trim() || '',
            reviewCount: formBody.querySelector('#reviewCount')?.value.trim() || '',
            bestRating: '5',
            worstRating: '1',
            certificationName: formBody.querySelector('#certificationName')?.value.trim() || '',
            certificationIssuer: formBody.querySelector('#certificationIssuer')?.value.trim() || '',
            certificationRating: formBody.querySelector('#certificationRating')?.value.trim() || '',
            certificationId: formBody.querySelector('#certificationId')?.value.trim() || '',
            model3dUrl: formBody.querySelector('#model3dUrl')?.value.trim() || '',
            ogTitle: formBody.querySelector('#ogTitle')?.value.trim() || '',
            ogDescription: formBody.querySelector('#ogDescription')?.value.trim() || '',
            ogImage: formBody.querySelector('#ogImage')?.value.trim() || '',
            twitterCard: formBody.querySelector('#twitterCard')?.value || 'summary_large_image',
            reviews: this._reviews,
            faqs: this._faqs,
            variants: this._variants,
            certifications: this._certifications,
            shippingConditions: this._shippingConditions
        };
        
        const imageUrlsText = formBody.querySelector('#imageUrls')?.value.trim() || '';
        if (imageUrlsText) {
            data.imageUrls = imageUrlsText.split('\n').map(url => url.trim()).filter(url => url);
        }
        
        return data;
    }
    
    _validateForm() {
        const formBody = this._shadow.getElementById('formBody');
        
        const productName = formBody.querySelector('#productName')?.value.trim();
        if (!productName) {
            alert('Please enter a product name');
            return false;
        }
        
        const description = formBody.querySelector('#description')?.value.trim();
        if (!description) {
            alert('Please enter a meta description');
            return false;
        }
        
        const price = formBody.querySelector('#price')?.value.trim();
        if (!price) {
            alert('Please enter a price');
            return false;
        }
        
        const availability = formBody.querySelector('#availability')?.value;
        if (!availability) {
            alert('Please select availability status');
            return false;
        }
        
        return true;
    }
    
    _handleSave() {
        if (!this._validateForm()) {
            return;
        }
        
        const seoData = this._collectFormData();
        
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
            'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY', 'CNY', 'CHF', 'SEK'
        ];
        
        return currencies.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    
    _getAllCountries() {
        const countries = [
            { code: '', name: '-- Select --' },
            { code: 'US', name: 'United States' },
            { code: 'GB', name: 'United Kingdom' },
            { code: 'CA', name: 'Canada' },
            { code: 'AU', name: 'Australia' },
            { code: 'DE', name: 'Germany' },
            { code: 'FR', name: 'France' },
            { code: 'IT', name: 'Italy' },
            { code: 'ES', name: 'Spain' }
        ];
        
        return countries.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
    }
}

customElements.define('product-seo-dashboard', ProductSEODashboard);
