/**
 * ============================================================================
 * ADMIN PORTAL JAVASCRIPT LOGIC
 * Textile POS Billing Management System
 * Handles: Authentication role checks, KPI analytics fetching, inventory CRUD,
 *          staff registration, returns processing, and supplier ledger.
 * ============================================================================
 */

// Ensure user has ADMIN role before rendering admin features
checkAuth('ADMIN');

/**
 * Tab Navigation Switcher
 * @param {string} tabName - The name of the tab to activate ('dashboard', 'products', etc.)
 */
function showAdminTab(tabName) {
  document.querySelectorAll('.tab-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.classList.add('active');
  if (event && event.currentTarget) event.currentTarget.classList.add('active');

  if (tabName === 'customers') {
    loadCustomers();
  }
}

/**
 * Fetch and render all data for the Admin Portal
 */
async function loadAdminData() {
  try {
    // 1. Load Dashboard KPI Metrics & Low Stock Table
    const metrics = await apiRequest('/reports/dashboard/');
    if (metrics) {
      if (document.getElementById('d-revenue')) {
        document.getElementById('d-revenue').textContent = `₹${parseFloat(metrics.total_revenue || metrics.today_revenue).toFixed(2)}`;
      }
      if (document.getElementById('d-today-revenue')) {
        document.getElementById('d-today-revenue').textContent = `Today: ₹${parseFloat(metrics.today_revenue).toFixed(2)}`;
      }
      if (document.getElementById('d-orders')) {
        document.getElementById('d-orders').textContent = metrics.total_invoices_count ?? metrics.today_orders_count;
      }
      if (document.getElementById('d-today-orders')) {
        document.getElementById('d-today-orders').textContent = `Today: ${metrics.today_orders_count} bills`;
      }
      if (document.getElementById('d-products')) document.getElementById('d-products').textContent = metrics.total_products;
      if (document.getElementById('d-suppliers')) document.getElementById('d-suppliers').textContent = metrics.total_suppliers;

      // Populate Low Stock Table
      const lowStockTbody = document.querySelector('#low-stock-table tbody');
      if (lowStockTbody && metrics.low_stock_products) {
        if (metrics.low_stock_products.length > 0) {
          lowStockTbody.innerHTML = metrics.low_stock_products.map(p => `
            <tr>
              <td><code>${p.barcode}</code></td>
              <td><b>${p.name}</b></td>
              <td>${p.size}</td>
              <td><span class="badge badge-red">Only ${p.stock_quantity} left</span></td>
              <td><button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="showAdminTab('products')">Restock</button></td>
            </tr>
          `).join('');
        } else {
          lowStockTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#10b981; font-weight:600;">All inventory items are well-stocked. No items below threshold.</td></tr>';
        }
      }
    }

    // 1b. Load Recent Invoices Table
    try {
      const invoices = await apiRequest('/sales/invoices/');
      const invTbody = document.querySelector('#invoices-table tbody');
      if (invTbody && invoices) {
        const list = Array.isArray(invoices) ? invoices : (invoices.results || []);
        invTbody.innerHTML = list.slice(0, 10).map(inv => `
          <tr>
            <td><b>${inv.invoice_number}</b></td>
            <td>${inv.customer_name || 'Walk-in Customer'}${inv.customer_phone ? ' (' + inv.customer_phone + ')' : ''}</td>
            <td><code>${inv.cashier_name || 'Staff'}</code></td>
            <td><span class="badge badge-indigo">${inv.payment_mode}</span></td>
            <td><b style="color:var(--success);">₹${parseFloat(inv.grand_total).toFixed(2)}</b></td>
            <td>${new Date(inv.created_at).toLocaleString()}</td>
            <td>
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="viewInvoiceDetails('${inv.invoice_number}')">View Details</button>
            </td>
          </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center; color:#64748b;">No invoices generated yet.</td></tr>';
      }
    } catch (e) {
      console.warn('Could not load invoices table:', e);
    }

    // 2. Load Products Table
    const prods = await apiRequest('/inventory/products/');
    window.adminProductsList = prods || [];
    const pTbody = document.querySelector('#products-table tbody');
    if (pTbody && prods) {
      pTbody.innerHTML = prods.map(p => `
        <tr>
          <td><code>${p.barcode}</code></td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=80&q=80'}" style="width:36px; height:36px; object-fit:cover; border-radius:6px;">
              <b>${p.name}</b>
            </div>
          </td>
          <td>${p.category_name || 'Textile'}</td>
          <td>${p.size} ${p.color ? '/ ' + p.color : ''}</td>
          <td>₹${p.cost_price}</td>
          <td><b style="color:var(--primary);">₹${p.selling_price}</b></td>
          <td><span class="badge ${p.stock_quantity <= 5 ? 'badge-red' : 'badge-green'}">${p.stock_quantity} in stock</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="viewAdminProductDetails(${p.id})">View</button>
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; color:#4f46e5; border-color:#c7d2fe;" onclick="printBarcodeTag(${p.id})">🏷️ Tag</button>
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="editProductStock(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.stock_quantity})">Restock</button>
              <button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // 3. Load Staff Members Table
    const staff = await apiRequest('/auth/staff/');
    const sTbody = document.querySelector('#staff-table tbody');
    if (sTbody && staff) {
      sTbody.innerHTML = staff.map(s => `
        <tr>
          <td><b>${s.username}</b></td>
          <td>${s.email || 'N/A'}</td>
          <td><span class="badge ${s.role === 'ADMIN' ? 'badge-indigo' : 'badge-green'}">${s.role}</span></td>
          <td>${new Date(s.date_joined).toLocaleDateString()}</td>
          <td>
            ${s.role === 'ADMIN' 
              ? '<span style="color:#94a3b8; font-size:11px;">Admin User</span>' 
              : `<button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="deleteStaff(${s.id}, '${s.username}')">Remove</button>`}
          </td>
        </tr>
      `).join('');
    }

    // 4. Load Suppliers & Ledger Table
    const suppliers = await apiRequest('/inventory/suppliers/');
    const supTbody = document.querySelector('#suppliers-table tbody');
    if (supTbody && suppliers) {
      supTbody.innerHTML = suppliers.map(sup => `
        <tr>
          <td><b>${sup.name}</b></td>
          <td>${sup.phone}</td>
          <td><code>${sup.gst_number || 'N/A'}</code></td>
          <td><b style="color:var(--danger);">₹${parseFloat(sup.balance).toFixed(2)}</b></td>
        </tr>
      `).join('');
    }

    // 4b. Load Processed Returns Table
    try {
      const returns = await apiRequest('/sales/returns/');
      const retTbody = document.querySelector('#returns-table tbody');
      if (retTbody && returns) {
        const list = Array.isArray(returns) ? returns : (returns.results || []);
        retTbody.innerHTML = list.map(r => `
          <tr>
            <td><b>#${r.id}</b></td>
            <td><code>${r.invoice_number || ('INV-' + r.invoice)}</code></td>
            <td><b>${r.product_name || ('Product #' + r.product)}</b></td>
            <td><span class="badge badge-indigo">${r.quantity} qty</span></td>
            <td><b style="color:var(--danger);">₹${parseFloat(r.refund_amount).toFixed(2)}</b></td>
            <td>${r.reason || 'N/A'}</td>
            <td>${new Date(r.created_at).toLocaleString()}</td>
          </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center; color:#64748b;">No product returns recorded yet.</td></tr>';
      }
    } catch (e) {
      console.warn('Could not load returns table:', e);
    }

    // 5. Load Categories into Add Product Dropdown
    const catSelect = document.getElementById('p-category');
    if (catSelect) {
      const categories = await apiRequest('/inventory/categories/');
      if (categories && categories.length > 0) {
        const currentVal = catSelect.value;
        catSelect.innerHTML = '<option value="">Select Category...</option>' + 
          categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        if (currentVal) catSelect.value = currentVal;
      }
    }

    // 6. Preload Customers Directory
    await loadCustomers();
  } catch (err) {
    console.error('Failed to load admin data:', err);
  }
}

/**
 * Handle Image URL Real-Time Preview & File Upload
 */
const imgUrlInput = document.getElementById('p-image-url');
const imgPreview = document.getElementById('p-image-preview');
const imgFileInput = document.getElementById('p-image-file');
const uploadStatus = document.getElementById('upload-status-text');

if (imgUrlInput && imgPreview) {
  imgUrlInput.addEventListener('input', () => {
    const val = imgUrlInput.value.trim();
    imgPreview.src = val || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=120&q=80';
  });
}

if (imgFileInput) {
  imgFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (uploadStatus) uploadStatus.textContent = 'Uploading...';
      const res = await apiUpload('/inventory/products/upload_image/', file);
      if (res && res.image_url) {
        if (imgUrlInput) imgUrlInput.value = res.image_url;
        if (imgPreview) imgPreview.src = res.image_url;
        if (uploadStatus) uploadStatus.textContent = 'Image Uploaded!';
        setTimeout(() => {
          if (uploadStatus) uploadStatus.textContent = 'Change Photo';
        }, 2000);
      }
    } catch (err) {
      alert(`Failed to upload image: ${err.message}`);
      if (uploadStatus) uploadStatus.textContent = 'Upload Failed';
    }
  });
}

/**
 * Handle Add Product Submission
 */
const addProdForm = document.getElementById('add-product-form');
if (addProdForm) {
  addProdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('p-name').value.trim(),
      barcode: document.getElementById('p-barcode').value.trim(),
      category: document.getElementById('p-category').value ? parseInt(document.getElementById('p-category').value) : null,
      size: document.getElementById('p-size').value,
      color: document.getElementById('p-color').value.trim(),
      cost_price: document.getElementById('p-cost').value,
      selling_price: document.getElementById('p-price').value,
      stock_quantity: document.getElementById('p-stock').value,
      image_url: (document.getElementById('p-image-url') ? document.getElementById('p-image-url').value.trim() : '') || null,
    };
    try {
      await apiRequest('/inventory/products/', 'POST', payload);
      alert('Product created successfully!');
      addProdForm.reset();
      if (imgPreview) {
        imgPreview.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=120&q=80';
      }
      if (uploadStatus) {
        uploadStatus.textContent = 'Choose File to Upload';
      }
      loadAdminData();
    } catch (err) {
      alert(`Error creating product: ${err.message}`);
    }
  });
}

/**
 * Handle Add Staff Submission
 */
const addStaffForm = document.getElementById('add-staff-form');
if (addStaffForm) {
  addStaffForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      username: document.getElementById('s-username').value.trim(),
      email: document.getElementById('s-email').value.trim(),
      password: document.getElementById('s-password').value,
      role: 'STAFF'
    };
    try {
      await apiRequest('/auth/staff/', 'POST', payload);
      alert('Staff member registered successfully!');
      addStaffForm.reset();
      loadAdminData();
    } catch (err) {
      alert(`Error creating staff: ${err.message}`);
    }
  });
}

/**
 * Handle Product Return Submission (Atomic stock replenishment)
 */
const returnForm = document.getElementById('return-form');
if (returnForm) {
  returnForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      invoice_id: document.getElementById('r-inv-id').value,
      product_id: document.getElementById('r-prod-id').value,
      quantity: document.getElementById('r-qty').value,
      refund_amount: document.getElementById('r-refund').value,
      reason: document.getElementById('r-reason').value.trim(),
    };
    try {
      await apiRequest('/sales/returns/', 'POST', payload);
      alert('Product Return processed successfully! Inventory stock has been restored.');
      returnForm.reset();
      loadAdminData();
    } catch (err) {
      alert(`Error processing return: ${err.message}`);
    }
  });
}

/**
 * Handle Add Supplier Submission
 */
const addSupplierForm = document.getElementById('add-supplier-form');
if (addSupplierForm) {
  addSupplierForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('sup-name').value.trim(),
      phone: document.getElementById('sup-phone').value.trim(),
      gst_number: document.getElementById('sup-gst').value.trim() || null,
      balance: document.getElementById('sup-balance').value || '0.00',
    };
    try {
      await apiRequest('/inventory/suppliers/', 'POST', payload);
      alert('Supplier registered successfully!');
      addSupplierForm.reset();
      loadAdminData();
    } catch (err) {
      alert(`Error registering supplier: ${err.message}`);
    }
  });
}

/**
 * Product CRUD: Edit / Update Stock
 */
window.editProductStock = async function(id, name, currentStock) {
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
    loadAdminData();
  } catch (err) {
    alert(`Failed to update stock: ${err.message}`);
  }
};

/**
 * Product CRUD: Soft Delete / Remove Product
 */
window.deleteProduct = async function(id, name) {
  if (!confirm(`Are you sure you want to remove "${name}" from the active catalog?`)) return;
  try {
    await apiRequest(`/inventory/products/${id}/`, 'DELETE');
    alert(`Product "${name}" removed successfully.`);
    loadAdminData();
  } catch (err) {
    alert(`Failed to remove product: ${err.message}`);
  }
};

/**
 * Staff Management: Remove / Deactivate Staff Member
 */
window.deleteStaff = async function(id, username) {
  if (!confirm(`Are you sure you want to remove staff member "${username}"?`)) return;
  try {
    await apiRequest(`/auth/staff/${id}/`, 'DELETE');
    alert(`Staff member "${username}" removed successfully.`);
    loadAdminData();
  } catch (err) {
    alert(`Failed to remove staff: ${err.message}`);
  }
};

/**
 * Transaction / Billing Management: View Invoice Details Modal
 */
window.viewInvoiceDetails = async function(invoiceNumber) {
  try {
    const invoices = await apiRequest(`/sales/invoices/?search=${encodeURIComponent(invoiceNumber)}`);
    const list = Array.isArray(invoices) ? invoices : (invoices.results || []);
    const inv = list.find(i => i.invoice_number === invoiceNumber) || list[0];
    if (!inv) {
      alert('Invoice details not found.');
      return;
    }

    const modal = document.getElementById('invoice-modal');
    const title = document.getElementById('modal-inv-title');
    const body = document.getElementById('modal-inv-body');

    title.textContent = `Invoice ${inv.invoice_number}`;
    body.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px; font-size:13px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid var(--border);">
        <div><b>Customer:</b> ${inv.customer_name || 'Walk-in Customer'}</div>
        <div><b>Phone:</b> ${inv.customer_phone || 'N/A'}</div>
        <div><b>Cashier:</b> ${inv.cashier_name || 'Staff'}</div>
        <div><b>Payment Mode:</b> <span class="badge badge-indigo">${inv.payment_mode}</span></div>
        <div><b>Status:</b> <span class="badge ${inv.status === 'COMPLETED' ? 'badge-green' : 'badge-red'}">${inv.status}</span></div>
        <div><b>Date:</b> ${new Date(inv.created_at).toLocaleString()}</div>
      </div>

      <h4 style="margin: 12px 0 8px 0; font-size:14px;">Billed Items</h4>
      <table class="data-table" style="margin-bottom:16px; font-size:12px;">
        <thead>
          <tr>
            <th>Item</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${(inv.items || []).map(it => `
            <tr>
              <td><b>${it.product_name || 'Product'}</b></td>
              <td>${it.product_size || '-'}</td>
              <td>${it.quantity}</td>
              <td>₹${parseFloat(it.unit_price).toFixed(2)}</td>
              <td><b>₹${parseFloat(it.total_price).toFixed(2)}</b></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align:right; font-size:13px; line-height:1.6; border-top:1px solid var(--border); padding-top:10px;">
        <div>Subtotal: <b>₹${parseFloat(inv.subtotal).toFixed(2)}</b></div>
        <div>Discount: <b>-₹${parseFloat(inv.discount).toFixed(2)}</b></div>
        <div>GST (5%): <b>₹${parseFloat(inv.tax_amount).toFixed(2)}</b></div>
        <div style="font-size:16px; color:var(--success); font-weight:800; margin-top:4px;">Grand Total: ₹${parseFloat(inv.grand_total).toFixed(2)}</div>
      </div>
    `;

    modal.style.display = 'flex';
  } catch (err) {
    alert(`Could not load invoice details: ${err.message}`);
  }
};

window.closeInvoiceModal = function() {
  const modal = document.getElementById('invoice-modal');
  if (modal) modal.style.display = 'none';
};

/**
 * Product Detail Modal in Admin Portal
 */
window.viewAdminProductDetails = async function(productId) {
  try {
    const p = await apiRequest(`/inventory/products/${productId}/`);
    if (!p) return;

    const modal = document.getElementById('invoice-modal');
    const title = document.getElementById('modal-inv-title');
    const body = document.getElementById('modal-inv-body');

    title.textContent = `Product: ${p.name}`;
    const margin = (parseFloat(p.selling_price) - parseFloat(p.cost_price)).toFixed(2);
    const marginPercent = ((margin / parseFloat(p.selling_price)) * 100).toFixed(1);

    const variants = (window.adminProductsList || []).filter(item => 
      item.name.trim().toLowerCase() === p.name.trim().toLowerCase()
    );

    const sizeSelectorHtml = variants.length > 1 ? `
      <div style="background:#f8fafc; padding:10px 14px; border-radius:10px; border:1px solid var(--border);">
        <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Available Size Variants:</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          ${variants.map(v => `
            <button type="button" onclick="viewAdminProductDetails(${v.id})" style="padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid ${v.id === p.id ? 'var(--primary)' : 'var(--border)'}; background:${v.id === p.id ? 'var(--primary)' : '#ffffff'}; color:${v.id === p.id ? '#ffffff' : 'var(--text-main)'}; display:inline-flex; align-items:center; gap:6px;">
              ${v.size}
              <span style="font-size:10px; opacity:0.85; background:${v.id === p.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0'}; padding:2px 6px; border-radius:4px;">${v.stock_quantity} in stock</span>
            </button>
          `).join('')}
        </div>
      </div>
    ` : '';

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="width:100%; height:200px; border-radius:10px; overflow:hidden; background:#f1f5f9; display:flex; align-items:center; justify-content:center;">
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'}" style="width:100%; height:100%; object-fit:cover;">
        </div>

        ${sizeSelectorHtml}

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:13px; background:#f8fafc; padding:14px; border-radius:10px; border:1px solid var(--border);">
          <div><b>Barcode / SKU:</b> <code>${p.barcode}</code></div>
          <div><b>Category:</b> <span class="badge badge-indigo">${p.category_name || 'Textile'}</span></div>
          <div><b>Size / Dimensions:</b> ${p.size}</div>
          <div><b>Color / Variant:</b> ${p.color || 'Standard'}</div>
          <div><b>Wholesale Cost:</b> ₹${parseFloat(p.cost_price).toFixed(2)}</div>
          <div><b>Selling Price:</b> <b style="color:var(--primary);">₹${parseFloat(p.selling_price).toFixed(2)}</b></div>
          <div><b>Profit Margin:</b> <span style="color:var(--success); font-weight:700;">₹${margin} (${marginPercent}%)</span></div>
          <div><b>Stock Status:</b> <span class="badge ${p.stock_quantity <= 5 ? 'badge-red' : 'badge-green'}">${p.stock_quantity} in stock</span></div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-outline" onclick="closeInvoiceModal()">Close</button>
          <button class="btn btn-outline" style="color:#4f46e5; border-color:#c7d2fe;" onclick="closeInvoiceModal(); printBarcodeTag(${p.id})">🏷️ Print Price Tag</button>
          <button class="btn btn-primary" onclick="closeInvoiceModal(); editProductStock(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.stock_quantity})">Restock Inventory</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  } catch (err) {
    alert(`Could not load product details: ${err.message}`);
  }
};

window.closeInvoiceModal = function() {
  const modal = document.getElementById('invoice-modal');
  if (modal) modal.style.display = 'none';
};

/**
 * Print Barcode Price Tag for Garment
 */
window.printBarcodeTag = async function(productId) {
  try {
    const p = await apiRequest(`/inventory/products/${productId}/`);
    if (!p) return;

    const modal = document.getElementById('barcode-tag-modal');
    const content = document.getElementById('barcode-tag-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div id="printable-tag" style="width:260px; border:2px solid #000; border-radius:10px; padding:16px; background:#ffffff; font-family:'Segoe UI', sans-serif; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
        <!-- Tag punch hole -->
        <div style="width:14px; height:14px; border:2px solid #000; border-radius:50%; margin:0 auto 10px auto; background:#f8fafc;"></div>
        
        <h4 style="margin:0; font-size:15px; font-weight:900; letter-spacing:1px; text-transform:uppercase; color:#000;">KERALA TEXTILES</h4>
        <div style="font-size:10px; color:#555; text-transform:uppercase; letter-spacing:0.5px;">Premium Apparel Store</div>
        <hr style="border:none; border-top:1.5px dashed #000; margin:8px 0;">

        <div style="font-size:13px; font-weight:800; color:#000; line-height:1.3;">${p.name}</div>
        <div style="display:flex; justify-content:space-around; font-size:11px; margin:6px 0; background:#f1f5f9; padding:4px 6px; border-radius:4px;">
          <span>Size: <b style="font-size:13px;">${p.size || 'Free'}</b></span>
          <span>Color: <b>${p.color || 'Standard'}</b></span>
        </div>

        <!-- High-fidelity CSS Simulated Barcode Lines -->
        <div style="display:flex; justify-content:center; align-items:flex-end; gap:2.5px; height:45px; margin:10px 0 4px 0;">
          <div style="width:3px; height:45px; background:#000;"></div>
          <div style="width:1px; height:45px; background:#000;"></div>
          <div style="width:4px; height:45px; background:#000;"></div>
          <div style="width:2px; height:45px; background:#000;"></div>
          <div style="width:1px; height:45px; background:#000;"></div>
          <div style="width:3px; height:45px; background:#000;"></div>
          <div style="width:5px; height:45px; background:#000;"></div>
          <div style="width:2px; height:45px; background:#000;"></div>
          <div style="width:1px; height:45px; background:#000;"></div>
          <div style="width:4px; height:45px; background:#000;"></div>
          <div style="width:2px; height:45px; background:#000;"></div>
          <div style="width:3px; height:45px; background:#000;"></div>
          <div style="width:1px; height:45px; background:#000;"></div>
          <div style="width:4px; height:45px; background:#000;"></div>
          <div style="width:2px; height:45px; background:#000;"></div>
          <div style="width:3px; height:45px; background:#000;"></div>
          <div style="width:1px; height:45px; background:#000;"></div>
          <div style="width:5px; height:45px; background:#000;"></div>
          <div style="width:2px; height:45px; background:#000;"></div>
          <div style="width:3px; height:45px; background:#000;"></div>
        </div>
        <div style="font-family:monospace; font-size:12px; font-weight:700; letter-spacing:2px; color:#000;">${p.barcode}</div>

        <hr style="border:none; border-top:1.5px dashed #000; margin:8px 0;">
        <div style="font-size:11px; text-transform:uppercase; font-weight:700; color:#555;">M.R.P.</div>
        <div style="font-size:22px; font-weight:900; color:#000;">₹${parseFloat(p.selling_price).toFixed(2)}</div>
        <div style="font-size:9px; color:#666; margin-top:2px;">(Inclusive of all Taxes • 5% GST)</div>
      </div>
    `;

    modal.style.display = 'flex';
  } catch (err) {
    alert(`Could not generate price tag: ${err.message}`);
  }
};

window.closeBarcodeTagModal = function() {
  const modal = document.getElementById('barcode-tag-modal');
  if (modal) modal.style.display = 'none';
};

/**
 * ============================================================================
 * CUSTOMER DIRECTORY & LOYALTY LEDGER
 * ============================================================================
 */
let allCustomersCache = [];

/**
 * Load Customers directory data from API
 */
async function loadCustomers() {
  try {
    const customers = await apiRequest('/sales/customers/');
    if (!customers) return;
    const list = Array.isArray(customers) ? customers : (customers.results || []);
    allCustomersCache = list;

    // Update KPI tiles
    const totalCustEl = document.getElementById('c-total-customers');
    const totalRevEl = document.getElementById('c-total-revenue');
    const totalPtsEl = document.getElementById('c-total-points');
    const countBadgeEl = document.getElementById('cust-count-badge');

    const totalSpent = list.reduce((sum, c) => sum + (parseFloat(c.total_spent) || 0), 0);
    const totalPts = list.reduce((sum, c) => sum + (parseInt(c.loyalty_points) || 0), 0);

    if (totalCustEl) totalCustEl.textContent = list.length;
    if (totalRevEl) totalRevEl.textContent = `₹${totalSpent.toFixed(2)}`;
    if (totalPtsEl) totalPtsEl.textContent = `${totalPts} pts`;
    if (countBadgeEl) countBadgeEl.textContent = `${list.length} Customer${list.length === 1 ? '' : 's'}`;

    renderCustomersTable(list);
  } catch (err) {
    console.error('Failed to load customers:', err);
  }
}

/**
 * Render Customers Table
 */
function renderCustomersTable(customers) {
  const tbody = document.querySelector('#customers-table tbody');
  if (!tbody) return;

  if (!customers || customers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:28px; color:var(--text-muted); font-size:13px;">No customer profiles found. When cashiers enter a customer phone during billing, profiles are created here automatically.</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map(c => {
    const initials = c.name ? c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU';
    const regDate = c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '-';
    const spent = parseFloat(c.total_spent || 0).toFixed(2);

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #4f46e5 0%, #818cf8 100%); color:#ffffff; font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${initials}
            </div>
            <div>
              <div style="font-weight:700; color:#1e293b; font-size:14px;">${c.name}</div>
              <span style="font-size:11px; color:var(--text-muted);">ID: #${c.id}</span>
            </div>
          </div>
        </td>
        <td>
          <div style="display:inline-flex; align-items:center; gap:5px; font-weight:600; color:#334155;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${c.phone}
          </div>
        </td>
        <td>${c.email ? `<span style="color:#64748b; font-size:13px;">${c.email}</span>` : '<span style="color:#94a3b8;">-</span>'}</td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:4px; background:#fef3c7; color:#b45309; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; border:1px solid #fde68a;">
            ⭐ ${c.loyalty_points || 0} pts
          </span>
        </td>
        <td><b style="color:#1e293b;">${c.total_orders || 0}</b></td>
        <td><b style="color:#059669; font-size:14px;">₹${spent}</b></td>
        <td style="color:#64748b; font-size:12px;">${regDate}</td>
        <td>
          <button class="btn btn-outline" style="padding:4px 10px; font-size:12px; color:#4f46e5; border-color:#c7d2fe; display:inline-flex; align-items:center; gap:5px;" onclick="viewCustomerHistory(${c.id})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            History
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Filter customers dynamically via search box
 */
window.filterCustomers = function(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderCustomersTable(allCustomersCache);
    return;
  }
  const filtered = allCustomersCache.filter(c => 
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.phone && c.phone.toLowerCase().includes(q)) ||
    (c.email && c.email.toLowerCase().includes(q))
  );
  renderCustomersTable(filtered);
};

/**
 * View Customer Purchase History Invoices in Modal
 */
window.viewCustomerHistory = async function(customerId) {
  const modal = document.getElementById('customer-modal');
  const nameEl = document.getElementById('modal-cust-name');
  const subEl = document.getElementById('modal-cust-sub');
  const statsEl = document.getElementById('modal-cust-stats');
  const bodyEl = document.getElementById('modal-cust-body');

  if (!modal) return;

  const customer = allCustomersCache.find(c => c.id === customerId);
  if (!customer) return;

  nameEl.textContent = customer.name;
  subEl.textContent = `Mobile: ${customer.phone} ${customer.email ? '• ' + customer.email : ''}`;

  statsEl.innerHTML = `
    <div style="background:#f8fafc; border:1px solid var(--border); padding:12px; border-radius:10px; text-align:center;">
      <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Total Orders</span>
      <div style="font-size:18px; font-weight:800; color:#1e293b; margin-top:2px;">${customer.total_orders || 0}</div>
    </div>
    <div style="background:#f8fafc; border:1px solid var(--border); padding:12px; border-radius:10px; text-align:center;">
      <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Lifetime Spend</span>
      <div style="font-size:18px; font-weight:800; color:#059669; margin-top:2px;">₹${parseFloat(customer.total_spent || 0).toFixed(2)}</div>
    </div>
    <div style="background:#f8fafc; border:1px solid var(--border); padding:12px; border-radius:10px; text-align:center;">
      <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Loyalty Balance</span>
      <div style="font-size:18px; font-weight:800; color:#d97706; margin-top:2px;">${customer.loyalty_points || 0} pts</div>
    </div>
  `;

  bodyEl.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Fetching invoices history...</div>';
  modal.style.display = 'flex';

  try {
    const invoices = await apiRequest(`/sales/customers/${customerId}/invoices/`);
    const invList = Array.isArray(invoices) ? invoices : (invoices.results || []);

    if (!invList || invList.length === 0) {
      bodyEl.innerHTML = `
        <div style="text-align:center; padding:30px; background:#f8fafc; border-radius:10px; border:1px dashed var(--border);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#94a3b8; margin-bottom:8px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div style="font-weight:600; color:#64748b;">No completed invoices recorded for this customer yet.</div>
        </div>
      `;
      return;
    }

    bodyEl.innerHTML = `
      <h4 style="margin:0 0 12px 0; font-size:14px; font-weight:700; color:#334155;">Customer Invoices (${invList.length})</h4>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date & Time</th>
              <th>Payment Mode</th>
              <th>Items Purchased</th>
              <th>Total Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${invList.map(inv => {
              const dt = new Date(inv.created_at).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' });
              const itemsSummary = inv.items ? inv.items.map(it => `${it.product_name} (${it.quantity})`).join(', ') : '-';
              return `
                <tr>
                  <td><code>${inv.invoice_number}</code></td>
                  <td style="font-size:12px; color:#64748b;">${dt}</td>
                  <td><span class="badge badge-indigo">${inv.payment_mode}</span></td>
                  <td style="font-size:12px; max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${itemsSummary}">${itemsSummary}</td>
                  <td><b style="color:#059669;">₹${parseFloat(inv.grand_total).toFixed(2)}</b></td>
                  <td>
                    <button class="btn btn-outline" style="padding:2px 8px; font-size:11px;" onclick="closeCustomerModal(); viewInvoiceDetails('${inv.invoice_number}')">View Details</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    bodyEl.innerHTML = `<div class="error-msg">Error loading invoices: ${err.message}</div>`;
  }
};

window.closeCustomerModal = function() {
  const modal = document.getElementById('customer-modal');
  if (modal) modal.style.display = 'none';
};

// Initial Data Load
loadAdminData();

