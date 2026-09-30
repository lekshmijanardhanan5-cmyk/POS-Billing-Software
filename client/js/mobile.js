/**
 * ============================================================================
 * MOBILE ADMIN PORTAL JAVASCRIPT LOGIC
 * Textile POS Billing Management System
 * Handles: Full mobile application interactions, Tab navigation, KPI analytics,
 *          Product CRUD, Staff management, Return processing, Supplier ledger,
 *          and Invoice inspection modal.
 * ============================================================================
 */

// Verify Admin role before rendering
checkAuth('ADMIN');

let allProductsCache = [];

/**
 * Toggle Phone Mockup vs Wide Desktop preview mode
 */
function toggleFrameSize() {
  const frame = document.getElementById('app-frame');
  const btnText = document.getElementById('frame-toggle-text');
  if (frame) {
    frame.classList.toggle('fullscreen-mode');
    if (frame.classList.contains('fullscreen-mode')) {
      if (btnText) btnText.textContent = 'Phone Size View';
    } else {
      if (btnText) btnText.textContent = 'Toggle Wide View';
    }
  }
}

/**
 * Switch bottom navigation tabs in the mobile application view
 * @param {string} tabId - Identifier of the tab ('dashboard', 'products', 'staff', 'returns', 'suppliers', 'invoices')
 * @param {string} title - Optional title to display in mobile header
 */
function switchTab(tabId, title) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.add('active');

  const headerTitle = document.getElementById('mobile-header-title');
  if (headerTitle && title) {
    headerTitle.textContent = title;
  }

  // Highlight matching bottom nav button if present
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(btn => {
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId)) {
      btn.classList.add('active');
    }
  });

  // Scroll mobile body to top on tab switch
  const body = document.querySelector('.mobile-body');
  if (body) body.scrollTop = 0;
}

/**
 * Toggle Expandable Section Form
 * @param {string} formId - DOM id of the form to toggle
 */
function toggleForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.classList.toggle('open');
    if (form.classList.contains('open')) {
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

/**
 * Fetch and populate mobile store data
 */
async function loadMobileData() {
  try {
    // 1. Fetch Dashboard KPI Summary & Low Stock
    const metrics = await apiRequest('/reports/dashboard/');
    if (metrics) {
      if (document.getElementById('m-total-rev')) {
        document.getElementById('m-total-rev').textContent = `₹${parseFloat(metrics.total_revenue || metrics.today_revenue).toFixed(2)}`;
      }
      if (document.getElementById('m-today-rev')) {
        document.getElementById('m-today-rev').textContent = `Today: ₹${parseFloat(metrics.today_revenue).toFixed(2)}`;
      }
      if (document.getElementById('m-total-orders')) {
        document.getElementById('m-total-orders').textContent = metrics.total_invoices_count ?? metrics.today_orders_count;
      }
      if (document.getElementById('m-today-orders')) {
        document.getElementById('m-today-orders').textContent = `Today: ${metrics.today_orders_count} bills`;
      }
      if (document.getElementById('m-total-prods')) {
        document.getElementById('m-total-prods').textContent = metrics.total_products;
      }
      if (document.getElementById('m-total-suppliers')) {
        document.getElementById('m-total-suppliers').textContent = metrics.total_suppliers;
      }

      // Populate Low Stock Alert list
      const lowStockContainer = document.getElementById('m-low-stock-list');
      if (lowStockContainer && metrics.low_stock_products) {
        if (metrics.low_stock_products.length > 0) {
          lowStockContainer.innerHTML = metrics.low_stock_products.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px dashed #fecaca;">
              <div>
                <b style="font-size:12px; color:#1e293b;">${p.name}</b>
                <div style="font-size:10px; color:#64748b;">${p.size} • Code: ${p.barcode}</div>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="badge badge-red">${p.stock_quantity} left</span>
                <button class="m-btn m-btn-outline m-btn-sm" onclick="mEditProductStock(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.stock_quantity})">Restock</button>
              </div>
            </div>
          `).join('');
        } else {
          lowStockContainer.innerHTML = '<p style="color:#15803d; font-size:11px; padding:4px 0;">All items well-stocked (&gt; 10 units).</p>';
        }
      }
    }

    // 2. Fetch Products
    const prods = await apiRequest('/inventory/products/');
    allProductsCache = Array.isArray(prods) ? prods : (prods.results || []);
    renderMobileProducts(allProductsCache);

    // Populate Categories Dropdown in Add Product Form
    const catSelect = document.getElementById('mp-category');
    if (catSelect) {
      const categories = await apiRequest('/inventory/categories/');
      if (categories && categories.length > 0) {
        catSelect.innerHTML = '<option value="">Select Category...</option>' + 
          categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }
    }

    // 3. Fetch Invoices for Dashboard & Transactions Tab
    const invoices = await apiRequest('/sales/invoices/');
    const invList = Array.isArray(invoices) ? invoices : (invoices.results || []);
    
    // Overview tab recent invoices (top 5)
    const mDashInvList = document.getElementById('m-dashboard-invoices-list');
    if (mDashInvList) {
      mDashInvList.innerHTML = invList.slice(0, 5).map(i => renderMobileInvoiceCard(i)).join('') || 
        '<p style="color:#64748b; font-size:12px; text-align:center; padding:12px;">No sales invoices recorded yet.</p>';
    }

    // All Invoices tab
    const mAllInvList = document.getElementById('m-all-invoices-list');
    if (mAllInvList) {
      mAllInvList.innerHTML = invList.map(i => renderMobileInvoiceCard(i)).join('') || 
        '<p style="color:#64748b; font-size:12px; text-align:center; padding:12px;">No sales invoices recorded yet.</p>';
    }

    // 4. Fetch Staff Members
    const staff = await apiRequest('/auth/staff/');
    const mStaffList = document.getElementById('m-staff-list');
    if (mStaffList && staff) {
      const staffArray = Array.isArray(staff) ? staff : (staff.results || []);
      mStaffList.innerHTML = staffArray.map(s => `
        <div class="m-card-item">
          <div class="item-top">
            <div>
              <b style="font-size:13px;">${s.username}</b>
              <div style="font-size:11px; color:#64748b;">${s.email || 'No email registered'}</div>
            </div>
            <span class="badge ${s.role === 'ADMIN' ? 'badge-indigo' : 'badge-green'}">${s.role}</span>
          </div>
          <div class="item-actions">
            <span style="font-size:10px; color:#94a3b8; margin-right:auto;">Joined: ${new Date(s.date_joined).toLocaleDateString()}</span>
            ${s.role === 'ADMIN' 
              ? '<span style="font-size:11px; color:#94a3b8;">Admin User</span>' 
              : `<button class="m-btn m-btn-danger m-btn-sm" onclick="mDeleteStaff(${s.id}, '${s.username}')">Remove</button>`}
          </div>
        </div>
      `).join('') || '<p style="color:#64748b; font-size:12px;">No staff registered yet.</p>';
    }

    // 5. Fetch Returns
    const returns = await apiRequest('/sales/returns/');
    const mRetList = document.getElementById('m-returns-list');
    if (mRetList && returns) {
      const retArray = Array.isArray(returns) ? returns : (returns.results || []);
      mRetList.innerHTML = retArray.map(r => `
        <div class="m-card-item">
          <div class="item-top">
            <div>
              <b style="font-size:13px; color:#b91c1c;">Return #${r.id}</b>
              <div style="font-size:11px; color:#1e293b;">${r.product_name}</div>
              <div style="font-size:10px; color:#64748b;">Invoice: ${r.invoice_number} • Qty: ${r.quantity}</div>
            </div>
            <div style="text-align:right;">
              <b style="color:#b91c1c; font-size:13px;">₹${parseFloat(r.refund_amount).toFixed(2)}</b>
              <div style="font-size:10px; color:#64748b;">Refunded</div>
            </div>
          </div>
          ${r.reason ? `<div style="font-size:11px; color:#475569; background:#f8fafc; padding:6px; border-radius:6px;">Reason: ${r.reason}</div>` : ''}
          <div style="font-size:10px; color:#94a3b8; text-align:right;">
            ${new Date(r.created_at).toLocaleString()}
          </div>
        </div>
      `).join('') || '<p style="color:#64748b; font-size:12px; text-align:center; padding:12px;">No return records found.</p>';
    }

    // 6. Fetch Suppliers
    const suppliers = await apiRequest('/inventory/suppliers/');
    const mSupList = document.getElementById('m-suppliers-list');
    if (mSupList && suppliers) {
      const supArray = Array.isArray(suppliers) ? suppliers : (suppliers.results || []);
      mSupList.innerHTML = supArray.map(sup => `
        <div class="m-card-item">
          <div class="item-top">
            <div>
              <b style="font-size:13px;">${sup.name}</b>
              <div style="font-size:11px; color:#64748b;">Phone: ${sup.phone}</div>
              <div style="font-size:10px; color:#94a3b8;">GST: ${sup.gst_number || 'N/A'}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px; color:#64748b;">Balance Due</div>
              <b style="color:#dc2626; font-size:14px;">₹${parseFloat(sup.balance).toFixed(2)}</b>
            </div>
          </div>
        </div>
      `).join('') || '<p style="color:#64748b; font-size:12px; text-align:center; padding:12px;">No suppliers registered yet.</p>';
    }

  } catch (err) {
    console.error('Failed to load mobile admin data:', err);
  }
}

/**
 * Render Product Cards in Mobile Catalog
 */
function renderMobileProducts(products) {
  const container = document.getElementById('m-products-list');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<p style="color:#64748b; font-size:12px; text-align:center; padding:16px;">No products match your search.</p>';
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="m-card-item">
      <div class="item-top">
        <div style="display:flex; gap:10px; align-items:center;">
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=100&q=80'}" style="width:46px; height:46px; object-fit:cover; border-radius:8px;">
          <div>
            <b style="font-size:13px; color:#1e293b;">${p.name}</b>
            <div style="font-size:11px; color:#64748b;">${p.size} ${p.color ? '• ' + p.color : ''} • <code>${p.barcode}</code></div>
            <div style="font-size:10px; color:#94a3b8;">Category: ${p.category_name || 'General'}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <b style="font-size:14px; color:var(--primary);">₹${p.selling_price}</b>
          <div><span class="badge ${p.stock_quantity <= 5 ? 'badge-red' : 'badge-green'}">${p.stock_quantity} left</span></div>
        </div>
      </div>
      <div class="item-actions">
        <button class="m-btn m-btn-outline m-btn-sm" onclick="mViewProductDetails(${p.id})">Details</button>
        <button class="m-btn m-btn-outline m-btn-sm" onclick="mEditProductStock(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.stock_quantity})">Restock</button>
        <button class="m-btn m-btn-danger m-btn-sm" onclick="mDeleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Delete</button>
      </div>
    </div>
  `).join('');
}

/**
 * Render Single Invoice Card
 */
function renderMobileInvoiceCard(i) {
  return `
    <div class="m-card-item" onclick="mViewInvoiceDetails('${i.invoice_number}')" style="cursor:pointer;">
      <div class="item-top">
        <div>
          <b style="font-size:13px; color:#1e293b;">${i.invoice_number}</b>
          <div style="font-size:11px; color:#64748b;">${i.customer_name || 'Walk-in'} • Cashier: ${i.cashier_name}</div>
          <div style="font-size:10px; color:#94a3b8;">${new Date(i.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
        <div style="text-align:right;">
          <b style="font-size:14px; color:#15803d;">₹${parseFloat(i.grand_total).toFixed(2)}</b>
          <div><span class="badge badge-indigo">${i.payment_mode}</span></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Product Search Filter Handler
 */
const prodSearchInput = document.getElementById('m-product-search');
if (prodSearchInput) {
  prodSearchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderMobileProducts(allProductsCache);
      return;
    }
    const filtered = allProductsCache.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.barcode.toLowerCase().includes(q) ||
      (p.category_name && p.category_name.toLowerCase().includes(q))
    );
    renderMobileProducts(filtered);
  });
}

/**
 * Product Image File Upload Handler
 */
const mImgFileInput = document.getElementById('mp-image-file');
const mImgUrlInput = document.getElementById('mp-image-url');
if (mImgFileInput) {
  mImgFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (mImgUrlInput) mImgUrlInput.value = 'Uploading...';
      const res = await apiUpload('/inventory/products/upload_image/', file);
      if (res && res.image_url) {
        if (mImgUrlInput) mImgUrlInput.value = res.image_url;
      }
    } catch (err) {
      alert(`Image upload failed: ${err.message}`);
      if (mImgUrlInput) mImgUrlInput.value = '';
    }
  });
}

/**
 * Add Product Form Submit
 */
const mAddProdForm = document.getElementById('m-add-prod-form');
if (mAddProdForm) {
  mAddProdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('mp-name').value.trim(),
      barcode: document.getElementById('mp-barcode').value.trim(),
      category: document.getElementById('mp-category').value ? parseInt(document.getElementById('mp-category').value) : null,
      size: document.getElementById('mp-size').value,
      color: document.getElementById('mp-color').value.trim(),
      cost_price: document.getElementById('mp-cost').value,
      selling_price: document.getElementById('mp-price').value,
      stock_quantity: document.getElementById('mp-stock').value,
      image_url: (document.getElementById('mp-image-url') ? document.getElementById('mp-image-url').value.trim() : '') || null,
    };
    try {
      await apiRequest('/inventory/products/', 'POST', payload);
      alert('Product created successfully!');
      mAddProdForm.reset();
      toggleForm('m-add-prod-form');
      loadMobileData();
    } catch (err) {
      alert(`Error creating product: ${err.message}`);
    }
  });
}

/**
 * Product CRUD: Edit Stock
 */
window.mEditProductStock = async function(id, name, currentStock) {
  const input = prompt(`Update Stock Quantity for "${name}":`, currentStock);
  if (input === null) return;
  const newStock = parseInt(input.trim(), 10);
  if (isNaN(newStock) || newStock < 0) {
    alert('Please enter a valid stock quantity (0 or greater).');
    return;
  }
  try {
    await apiRequest(`/inventory/products/${id}/`, 'PATCH', { stock_quantity: newStock });
    alert(`Stock for "${name}" updated to ${newStock}!`);
    loadMobileData();
  } catch (err) {
    alert(`Failed to update stock: ${err.message}`);
  }
};

/**
 * Product CRUD: Delete Product
 */
window.mDeleteProduct = async function(id, name) {
  if (!confirm(`Are you sure you want to remove "${name}" from the active catalog?`)) return;
  try {
    await apiRequest(`/inventory/products/${id}/`, 'DELETE');
    alert(`Product "${name}" removed successfully.`);
    loadMobileData();
  } catch (err) {
    alert(`Failed to remove product: ${err.message}`);
  }
};

/**
 * Add Staff Form Submit
 */
const mAddStaffForm = document.getElementById('m-add-staff-form');
if (mAddStaffForm) {
  mAddStaffForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      username: document.getElementById('ms-username').value.trim(),
      email: document.getElementById('ms-email').value.trim(),
      password: document.getElementById('ms-password').value,
      role: 'STAFF',
    };
    try {
      await apiRequest('/auth/staff/', 'POST', payload);
      alert('Staff member registered successfully!');
      mAddStaffForm.reset();
      toggleForm('m-add-staff-form');
      loadMobileData();
    } catch (err) {
      alert(`Error registering staff: ${err.message}`);
    }
  });
}

/**
 * Remove Staff Member
 */
window.mDeleteStaff = async function(id, username) {
  if (!confirm(`Are you sure you want to remove staff member "${username}"?`)) return;
  try {
    await apiRequest(`/auth/staff/${id}/`, 'DELETE');
    alert(`Staff member "${username}" removed.`);
    loadMobileData();
  } catch (err) {
    alert(`Failed to remove staff: ${err.message}`);
  }
};

/**
 * Product Return Form Submit
 */
const mAddReturnForm = document.getElementById('m-add-return-form');
if (mAddReturnForm) {
  mAddReturnForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      invoice_id: document.getElementById('mr-inv-id').value,
      product_id: document.getElementById('mr-prod-id').value,
      quantity: document.getElementById('mr-qty').value,
      refund_amount: document.getElementById('mr-refund').value,
      reason: document.getElementById('mr-reason').value.trim(),
    };
    try {
      await apiRequest('/sales/returns/', 'POST', payload);
      alert('Product Return processed! Inventory stock has been replenished.');
      mAddReturnForm.reset();
      toggleForm('m-add-return-form');
      loadMobileData();
    } catch (err) {
      alert(`Error processing return: ${err.message}`);
    }
  });
}

/**
 * Register Supplier Form Submit
 */
const mAddSupForm = document.getElementById('m-add-sup-form');
if (mAddSupForm) {
  mAddSupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('msup-name').value.trim(),
      phone: document.getElementById('msup-phone').value.trim(),
      gst_number: document.getElementById('msup-gst').value.trim() || null,
      balance: document.getElementById('msup-balance').value || '0.00',
    };
    try {
      await apiRequest('/inventory/suppliers/', 'POST', payload);
      alert('Supplier registered successfully!');
      mAddSupForm.reset();
      toggleForm('m-add-sup-form');
      loadMobileData();
    } catch (err) {
      alert(`Error registering supplier: ${err.message}`);
    }
  });
}

/**
 * View Invoice Details Modal in Mobile View
 */
window.mViewInvoiceDetails = async function(invoiceNumber) {
  try {
    const invoices = await apiRequest(`/sales/invoices/?search=${encodeURIComponent(invoiceNumber)}`);
    const list = Array.isArray(invoices) ? invoices : (invoices.results || []);
    const inv = list.find(i => i.invoice_number === invoiceNumber) || list[0];
    if (!inv) {
      alert('Invoice details not found.');
      return;
    }

    const modal = document.getElementById('m-invoice-modal');
    const title = document.getElementById('m-modal-title');
    const body = document.getElementById('m-modal-body');

    title.textContent = `${inv.invoice_number}`;
    body.innerHTML = `
      <div style="font-size:12px; margin-bottom:12px; background:#f8fafc; padding:10px; border-radius:8px;">
        <div><b>Customer:</b> ${inv.customer_name || 'Walk-in'} ${inv.customer_phone ? '(' + inv.customer_phone + ')' : ''}</div>
        <div><b>Cashier:</b> ${inv.cashier_name}</div>
        <div><b>Payment:</b> <span class="badge badge-indigo">${inv.payment_mode}</span></div>
        <div><b>Status:</b> <span class="badge ${inv.status === 'COMPLETED' ? 'badge-green' : 'badge-red'}">${inv.status}</span></div>
        <div><b>Date:</b> ${new Date(inv.created_at).toLocaleString()}</div>
      </div>

      <h5 style="margin-bottom:8px; font-size:12px;">Billed Products:</h5>
      <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
        ${(inv.items || []).map(it => `
          <div style="display:flex; justify-content:space-between; font-size:11px; border-bottom:1px solid #f1f5f9; padding-bottom:4px;">
            <div>
              <b>${it.product_name}</b> (${it.product_size || '-'})
              <div style="color:#64748b;">${it.quantity} × ₹${parseFloat(it.unit_price).toFixed(2)}</div>
            </div>
            <b>₹${parseFloat(it.total_price).toFixed(2)}</b>
          </div>
        `).join('')}
      </div>

      <div style="text-align:right; font-size:12px; line-height:1.6; border-top:1px solid #e2e8f0; padding-top:8px;">
        <div>Subtotal: <b>₹${parseFloat(inv.subtotal).toFixed(2)}</b></div>
        <div>Discount: <b>-₹${parseFloat(inv.discount).toFixed(2)}</b></div>
        <div>GST (5%): <b>₹${parseFloat(inv.tax_amount).toFixed(2)}</b></div>
        <div style="font-size:15px; color:#15803d; font-weight:800; margin-top:4px;">Grand Total: ₹${parseFloat(inv.grand_total).toFixed(2)}</div>
      </div>
    `;

    modal.style.display = 'flex';
  } catch (err) {
    alert(`Could not load invoice: ${err.message}`);
  }
};

window.closeMobileInvoiceModal = function() {
  const modal = document.getElementById('m-invoice-modal');
  if (modal) modal.style.display = 'none';
};

/**
 * View Product Details Modal in Mobile Admin
 */
window.mViewProductDetails = async function(productId) {
  try {
    const p = await apiRequest(`/inventory/products/${productId}/`);
    if (!p) return;

    const modal = document.getElementById('m-invoice-modal');
    const title = document.getElementById('m-modal-title');
    const body = document.getElementById('m-modal-body');

    title.textContent = p.name;
    const margin = (parseFloat(p.selling_price) - parseFloat(p.cost_price)).toFixed(2);
    const marginPercent = ((margin / parseFloat(p.selling_price)) * 100).toFixed(1);

    const variants = allProductsCache.filter(item => item.name.trim().toLowerCase() === p.name.trim().toLowerCase());
    const sizeSelectorHtml = variants.length > 1 ? `
      <div style="background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0;">
        <div style="font-size:10px; font-weight:700; color:#64748b; margin-bottom:6px; text-transform:uppercase;">Select Size:</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${variants.map(v => `
            <button type="button" onclick="mViewProductDetails(${v.id})" style="padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; border:1.5px solid ${v.id === p.id ? 'var(--primary)' : '#cbd5e1'}; background:${v.id === p.id ? 'var(--primary)' : '#ffffff'}; color:${v.id === p.id ? '#ffffff' : '#1e293b'};">
              ${v.size} (${v.stock_quantity})
            </button>
          `).join('')}
        </div>
      </div>
    ` : '';

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="width:100%; height:180px; border-radius:10px; overflow:hidden; background:#f1f5f9;">
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80'}" style="width:100%; height:100%; object-fit:cover;">
        </div>

        ${sizeSelectorHtml}

        <div style="font-size:12px; background:#f8fafc; padding:10px; border-radius:8px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div><b>Barcode:</b> <code>${p.barcode}</code></div>
          <div><b>Category:</b> <span class="badge badge-indigo">${p.category_name || 'General'}</span></div>
          <div><b>Size:</b> ${p.size}</div>
          <div><b>Color:</b> ${p.color || 'Standard'}</div>
          <div><b>Cost:</b> ₹${parseFloat(p.cost_price).toFixed(2)}</div>
          <div><b>Selling:</b> <b style="color:var(--primary);">₹${parseFloat(p.selling_price).toFixed(2)}</b></div>
          <div><b>Margin:</b> <span style="color:#15803d; font-weight:700;">₹${margin} (${marginPercent}%)</span></div>
          <div><b>Stock:</b> <span class="badge ${p.stock_quantity <= 5 ? 'badge-red' : 'badge-green'}">${p.stock_quantity} in stock</span></div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:4px;">
          <button class="m-btn m-btn-outline" onclick="closeMobileInvoiceModal()">Close</button>
          <button class="m-btn m-btn-primary" onclick="closeMobileInvoiceModal(); mEditProductStock(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.stock_quantity})">Restock</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  } catch (err) {
    alert(`Could not load product details: ${err.message}`);
  }
};

// Initial Data Load
loadMobileData();
