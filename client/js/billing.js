/**
 * ============================================================================
 * BILLING PORTAL (POS) JAVASCRIPT LOGIC
 * Textile POS Billing Management System
 * Handles: Barcode search, category filtering, cart management, discount/tax
 *          calculation, atomic invoice checkout, and 80mm receipt generation.
 * ============================================================================
 */

let allProducts = [];
let cart = [];
let selectedPaymentMode = 'CASH';
let selectedCategory = 'ALL';
let selectedSize = 'ALL';

// Authenticate user (Both Cashier/Staff and Admin are permitted to use POS)
const currentUser = checkAuth();

if (currentUser) {
  const userLabel = document.getElementById('user-display-label');

  if (userLabel) {
    userLabel.innerHTML = `
      <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:4px 12px; border-radius:20px; border:1px solid rgba(255,255,255,0.1);">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#94a3b8;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span style="color:#ffffff; font-weight:600; font-size:13px;">${currentUser.username}</span>
      </div>
    `;
  }
}

/**
 * Fetch products from inventory endpoint
 */
async function loadProducts() {
  try {
    allProducts = await apiRequest('/inventory/products/');
    renderFilteredProducts();
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

/**
 * Helper to determine standard sizes for a product
 */
function getAvailableSizes(product) {
  const name = (product.name || '').toLowerCase();
  const cat = (product.category_name || '').toLowerCase();
  const sz = (product.size || '').toUpperCase();

  if (sz === 'FREE' || name.includes('saree') || name.includes('mundu')) {
    return ['FREE'];
  }
  if (sz.includes('METER') || cat.includes('fabric') || name.includes('fabric')) {
    return ['1 Meter', '2.5 Meters', '5 Meters'];
  }
  if (name.includes('chino') || name.includes('jean') || name.includes('trouser') || ['30', '32', '34', '36'].includes(product.size)) {
    return ['30', '32', '34', '36'];
  }
  return ['S', 'M', 'L', 'XL', 'XXL'];
}

/**
 * Filter products based on active category pill, size pill, and search bar query
 */
function renderFilteredProducts() {
  const searchTerm = (document.getElementById('barcode-search')?.value || '').toLowerCase().trim();
  
  const filtered = allProducts.filter(p => {
    const matchesCategory = (selectedCategory === 'ALL') || (p.category_name === selectedCategory);
    const availableSizes = getAvailableSizes(p);
    const matchesSize = (selectedSize === 'ALL') || (p.size === selectedSize) || availableSizes.includes(selectedSize);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm) || p.barcode.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSize && matchesSearch;
  });

  renderProductsGrid(filtered);
}

/**
 * Render product cards into the catalog grid (1 unique card per item)
 * @param {Array} list - Array of products to render
 */
function renderProductsGrid(list) {
  const container = document.getElementById('products-grid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--text-light);">No products found matching criteria.</div>';
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="product-card">
      <div style="position:relative;">
        <img class="product-card-img" src="${p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80'}" alt="${p.name}" onclick="showProductDetails(${p.id})" style="cursor:pointer;" title="Click to view details & choose size">
        <button type="button" class="btn-detail-view" onclick="event.stopPropagation(); showProductDetails(${p.id})" title="View Product Details">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          Details
        </button>
      </div>
      <div onclick="addToCart(${p.id})">
        <span class="badge badge-indigo">${p.category_name || 'Textile'}</span>
        <h4>${p.name}</h4>
        <div class="product-meta">Size: <b style="color:var(--primary); font-size:12px;">${p.size || 'Standard'}</b> ${p.color ? '• ' + p.color : ''}<br>Code: <code>${p.barcode}</code></div>
      </div>
      <div class="product-card-footer" onclick="addToCart(${p.id})">
        <span class="product-price">₹${p.selling_price}</span>
        <span class="badge ${p.stock_quantity <= 5 ? 'badge-red' : 'badge-green'}">${p.stock_quantity} left</span>
      </div>
    </div>
  `).join('');
}

/**
 * Category Pill Filter Handler
 * @param {string} category - Category name to filter by, or 'ALL'
 */
function filterCategory(category) {
  selectedCategory = category;
  document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
  if (event && event.currentTarget) event.currentTarget.classList.add('active');
  renderFilteredProducts();
}

/**
 * Size Pill Filter Handler
 * @param {string} size - Size string to filter by, or 'ALL'
 */
function filterSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-pill').forEach(pill => pill.classList.remove('active'));
  if (event && event.currentTarget) event.currentTarget.classList.add('active');
  renderFilteredProducts();
}

/**
 * Barcode search input event listener
 */
const searchInput = document.getElementById('barcode-search');
if (searchInput) {
  searchInput.addEventListener('input', renderFilteredProducts);

  // If cashier hits 'Enter' after scanning barcode, auto add matching product to cart!
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const code = searchInput.value.trim();
      const match = allProducts.find(p => p.barcode === code);
      if (match) {
        addToCart(match.id);
        searchInput.value = '';
        renderFilteredProducts();
      }
    }
  });
}

/**
 * Add a product to the cart or increment quantity with chosen size
 * @param {number} productId - The ID of the product
 * @param {string} chosenSize - The selected size variant
 */
function addToCart(productId, chosenSize) {
  const product = allProducts.find(p => p.id === productId);
  if (!product || product.stock_quantity <= 0) {
    alert('This product is out of stock!');
    return;
  }

  const itemSize = chosenSize || product.size;
  const existing = cart.find(c => c.product_id === productId && c.size === itemSize);
  if (existing) {
    if (existing.quantity >= product.stock_quantity) {
      alert(`Cannot add more than available stock (${product.stock_quantity})!`);
      return;
    }
    existing.quantity++;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      size: itemSize,
      unit_price: parseFloat(product.selling_price),
      quantity: 1,
      max_stock: product.stock_quantity
    });
  }
  updateCartUI();
}

/**
 * Modify line item quantity in the cart by item index
 * @param {number} cartIndex 
 * @param {number} delta - (+1 or -1)
 */
function changeQty(cartIndex, delta) {
  const item = cart[cartIndex];
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart.splice(cartIndex, 1);
  } else if (item.quantity > item.max_stock) {
    alert(`Cannot exceed available stock of ${item.max_stock}!`);
    item.quantity = item.max_stock;
  }
  updateCartUI();
}

/**
 * Set active payment mode (Cash, UPI, Card)
 * @param {string} mode 
 * @param {HTMLElement} element 
 */
function setPaymentMode(mode, element) {
  selectedPaymentMode = mode;
  document.querySelectorAll('.pay-chip').forEach(chip => chip.classList.remove('active'));
  if (element) element.classList.add('active');
}

/**
 * Refresh the Cart UI, totals, tax, and item badges
 */
function updateCartUI() {
  const container = document.getElementById('cart-items');
  const countBadge = document.getElementById('cart-count-badge');
  if (!container) return;

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) countBadge.textContent = `${totalItemCount} Items`;

  if (cart.length === 0) {
    container.innerHTML = '<p style="color:var(--text-light); text-align:center; padding: 40px 0; font-size:13px;">Cart is empty.<br>Click items on the left or scan a barcode to add.</p>';
  } else {
    container.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h5>${item.name} (${item.size})</h5>
          <small>₹${item.unit_price.toFixed(2)} × ${item.quantity} = <b>₹${(item.unit_price * item.quantity).toFixed(2)}</b></small>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${idx}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  // Calculate Subtotal, Discounts, and GST Tax
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const discountInput = document.getElementById('discount-input');
  const discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * 0.05; // 5% GST
  const grandTotal = taxable + tax;

  if (document.getElementById('subtotal')) document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  if (document.getElementById('tax-amount')) document.getElementById('tax-amount').textContent = `₹${tax.toFixed(2)}`;
  if (document.getElementById('grand-total')) document.getElementById('grand-total').textContent = `₹${grandTotal.toFixed(2)}`;
}

const discountEl = document.getElementById('discount-input');
if (discountEl) {
  discountEl.addEventListener('input', updateCartUI);
}

let currentCustomer = null;
let customerLoyaltyPoints = 0;
let activePointsRedeemed = 0;
let activePromoCode = null;
let lastCompletedInvoice = null;

// Customer Loyalty Real-time Lookup
window.checkCustomerLoyalty = async function(phone) {
  const cleanPhone = (phone || '').trim();
  const loyaltyBox = document.getElementById('loyalty-box');
  if (cleanPhone.length < 10) {
    if (loyaltyBox) loyaltyBox.style.display = 'none';
    currentCustomer = null;
    customerLoyaltyPoints = 0;
    activePointsRedeemed = 0;
    return;
  }

  try {
    const res = await apiRequest(`/sales/customers/lookup/?phone=${encodeURIComponent(cleanPhone)}`);
    if (res && res.id) {
      currentCustomer = res;
      customerLoyaltyPoints = res.loyalty_points || 0;
      if (document.getElementById('cust-name') && !document.getElementById('cust-name').value.trim()) {
        document.getElementById('cust-name').value = res.name;
      }
      if (loyaltyBox) {
        document.getElementById('loyalty-cust-name').textContent = res.name;
        document.getElementById('loyalty-points-val').textContent = customerLoyaltyPoints;
        document.getElementById('loyalty-cash-val').textContent = customerLoyaltyPoints;
        loyaltyBox.style.display = 'flex';
      }
    } else {
      if (loyaltyBox) loyaltyBox.style.display = 'none';
      currentCustomer = null;
      customerLoyaltyPoints = 0;
    }
  } catch (e) {
    console.warn('Customer lookup error:', e);
  }
};

window.redeemLoyaltyPoints = function() {
  if (customerLoyaltyPoints <= 0) {
    alert('This customer has 0 loyalty points to redeem.');
    return;
  }
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  if (subtotal <= 0) {
    alert('Add items to cart before redeeming points.');
    return;
  }

  const redeemable = Math.min(customerLoyaltyPoints, Math.floor(subtotal));
  activePointsRedeemed = redeemable;
  const discountInput = document.getElementById('discount-input');
  if (discountInput) {
    discountInput.value = redeemable;
    updateCartUI();
  }
  alert(`🌟 Successfully applied ₹${redeemable} discount (${redeemable} Loyalty Points redeemed)!`);
};

// Festival Promo Code Engine
const PROMO_CODES = {
  'ONAM10': { type: 'PERCENT', value: 10, minOrder: 0, label: 'Onam 10% Festival Discount' },
  'VISHU15': { type: 'PERCENT', value: 15, minOrder: 1500, label: 'Vishu 15% Grand Discount (Min ₹1500)' },
  'KERALA5': { type: 'PERCENT', value: 5, minOrder: 0, label: 'Kerala Textiles 5% Discount' },
  'FESTIVE100': { type: 'FLAT', value: 100, minOrder: 500, label: 'Flat ₹100 Off (Min ₹500)' },
  'WELCOME50': { type: 'FLAT', value: 50, minOrder: 300, label: 'Welcome Offer ₹50 Off' }
};

window.applyPromoCode = function() {
  const code = (document.getElementById('promo-input')?.value || '').trim().toUpperCase();
  const statusMsg = document.getElementById('promo-status-msg');
  if (!code) {
    if (statusMsg) statusMsg.innerHTML = '<span style="color:#ef4444;">Please enter a promo code</span>';
    return;
  }

  const promo = PROMO_CODES[code];
  if (!promo) {
    if (statusMsg) statusMsg.innerHTML = `<span style="color:#ef4444;">Invalid code "${code}"</span>`;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  if (subtotal < promo.minOrder) {
    if (statusMsg) statusMsg.innerHTML = `<span style="color:#ef4444;">Min order ₹${promo.minOrder} required</span>`;
    return;
  }

  let disc = 0;
  if (promo.type === 'PERCENT') {
    disc = parseFloat(((subtotal * promo.value) / 100).toFixed(2));
  } else {
    disc = promo.value;
  }

  activePromoCode = code;
  const discountInput = document.getElementById('discount-input');
  if (discountInput) {
    discountInput.value = disc;
    updateCartUI();
  }

  if (statusMsg) {
    statusMsg.innerHTML = `<span style="color:#15803d; font-weight:700;">✓ ${code}: Saved ₹${disc.toFixed(2)}</span>`;
  }
};

window.quickApplyPromo = function(code) {
  const input = document.getElementById('promo-input');
  if (input) input.value = code;
  applyPromoCode();
};

/**
 * Handle Complete Checkout Action
 */
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
      alert('Your cart is empty! Please add products before checking out.');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discount = parseFloat(document.getElementById('discount-input').value) || 0;
    const tax = Math.max(0, subtotal - discount) * 0.05;
    const grandTotal = Math.max(0, subtotal - discount) + tax;

    const payload = {
      customer_phone: document.getElementById('cust-phone').value.trim(),
      customer_name: document.getElementById('cust-name').value.trim(),
      payment_mode: selectedPaymentMode,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      promo_code: activePromoCode,
      points_redeemed: activePointsRedeemed,
      tax_amount: tax.toFixed(2),
      grand_total: grandTotal.toFixed(2),
      items: cart.map(c => ({ product_id: c.product_id, quantity: c.quantity, unit_price: c.unit_price }))
    };

    try {
      const invoice = await apiRequest('/sales/invoices/', 'POST', payload);
      lastCompletedInvoice = invoice;
      showReceipt(invoice);
      
      // Reset POS fields
      cart = [];
      document.getElementById('cust-phone').value = '';
      document.getElementById('cust-name').value = '';
      document.getElementById('discount-input').value = '0';
      if (document.getElementById('promo-input')) document.getElementById('promo-input').value = '';
      if (document.getElementById('promo-status-msg')) document.getElementById('promo-status-msg').innerHTML = '';
      if (document.getElementById('loyalty-box')) document.getElementById('loyalty-box').style.display = 'none';
      activePromoCode = null;
      activePointsRedeemed = 0;
      updateCartUI();
      loadProducts(); // Refresh product inventory counts immediately
    } catch (err) {
      alert(`Checkout Failed: ${err.message}`);
    }
  });
}

/**
 * Display the 80mm Thermal Receipt Modal
 * @param {Object} inv - The completed invoice object
 */
function showReceipt(inv) {
  lastCompletedInvoice = inv;
  const receipt = document.getElementById('printable-receipt');
  if (!receipt) return;

  receipt.innerHTML = `
    <center>
      <h2 style="font-size:16px; margin:0;">TEXTILE RETAIL POS</h2>
      <p style="margin:2px 0;">Fashion Street, Calicut</p>
      <p style="margin:2px 0;">GSTIN: 32AABCR1234F1Z5</p>
      <p style="margin:2px 0;">Email: admin@keralatextiles.com</p>
    </center>
    <hr>
    <div style="display:flex; justify-content:space-between;">
      <span><b>Invoice:</b> ${inv.invoice_number}</span>
      <span>${inv.payment_mode}</span>
    </div>
    <div style="display:flex; justify-content:space-between;">
      <span><b>Date:</b> ${new Date(inv.created_at).toLocaleDateString()}</span>
      <span>${new Date(inv.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    </div>
    <p style="margin:2px 0;"><b>Cashier:</b> ${currentUser.username}</p>
    ${inv.customer_phone ? `<p style="margin:2px 0;"><b>Customer:</b> ${inv.customer_name || 'Customer'} (${inv.customer_phone})</p>` : ''}
    <hr>
    <table style="width:100%; font-size:12px; border-collapse:collapse;">
      <thead>
        <tr style="text-align:left; border-bottom: 1px dashed #000;">
          <th>Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Amt</th>
        </tr>
      </thead>
      <tbody>
        ${(inv.items || []).map(i => `
          <tr>
            <td>${i.product_name} (${i.product_size})</td>
            <td style="text-align:center;">${i.quantity}</td>
            <td style="text-align:right;">₹${parseFloat(i.total_price).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <hr>
    <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span><span>₹${parseFloat(inv.subtotal).toFixed(2)}</span></div>
    <div style="display:flex; justify-content:space-between;"><span>Discount:</span><span>-₹${parseFloat(inv.discount).toFixed(2)}${inv.promo_code ? ' (' + inv.promo_code + ')' : ''}</span></div>
    <div style="display:flex; justify-content:space-between;"><span>GST (5%):</span><span>+₹${parseFloat(inv.tax_amount).toFixed(2)}</span></div>
    <hr>
    <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:15px; margin: 4px 0;">
      <span>GRAND TOTAL:</span>
      <span>₹${parseFloat(inv.grand_total).toFixed(2)}</span>
    </div>
    ${inv.loyalty_earned ? `
      <div style="background:#f8fafc; padding:6px; border:1px dashed #cbd5e1; border-radius:6px; margin:6px 0; font-size:11px; text-align:center;">
        🌟 <b>${inv.loyalty_earned} Loyalty Points Earned!</b><br>
        Current Balance: <b>${inv.loyalty_balance} pts</b>
      </div>
    ` : ''}
    <hr>
    <center>
      <p style="margin-top:6px; font-weight:bold;">*** THANK YOU VISIT AGAIN ***</p>
      <p style="font-size:10px; margin-top:2px;">Exchange within 7 days with original bill</p>
    </center>
  `;
  document.getElementById('receipt-modal').style.display = 'flex';
}

function closeReceipt() {
  document.getElementById('receipt-modal').style.display = 'none';
}

// WhatsApp E-Bill Sharing
window.shareReceiptWhatsApp = function() {
  if (!lastCompletedInvoice) {
    alert('No invoice receipt available to share.');
    return;
  }
  const inv = lastCompletedInvoice;
  let phone = inv.customer_phone || (document.getElementById('cust-phone')?.value || '').trim();
  if (!phone) {
    phone = prompt('Enter customer WhatsApp mobile number (10 digits):', '');
  }
  if (!phone) return;
  phone = phone.replace(/[^0-9]/g, '');
  if (phone.length === 10) phone = '91' + phone;

  const itemsText = (inv.items || []).map((it, idx) => 
    `${idx + 1}. *${it.product_name}* (${it.product_size || '-'})\n   Qty: ${it.quantity} × ₹${parseFloat(it.unit_price).toFixed(2)} = ₹${parseFloat(it.total_price).toFixed(2)}`
  ).join('\n');

  const text = 
`✨ *KERALA TEXTILES RETAIL STORE* ✨
📍 MG Road, Calicut, Kerala - 673001
📞 Helpline: +91 98470 12345
-------------------------------------------
🧾 *E-TAX INVOICE:* \`${inv.invoice_number}\`
📅 Date: ${new Date(inv.created_at).toLocaleDateString()} | ${new Date(inv.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
👤 Customer: ${inv.customer_name || 'Valued Customer'}
💳 Payment: ${inv.payment_mode}
-------------------------------------------
${itemsText}
-------------------------------------------
Subtotal: ₹${parseFloat(inv.subtotal).toFixed(2)}
Discount: -₹${parseFloat(inv.discount).toFixed(2)}${inv.promo_code ? ' (' + inv.promo_code + ')' : ''}
GST (5%): +₹${parseFloat(inv.tax_amount).toFixed(2)}
💰 *GRAND TOTAL: ₹${parseFloat(inv.grand_total).toFixed(2)}*
${inv.loyalty_earned ? `🌟 Loyalty Points Earned: *${inv.loyalty_earned} pts* (Balance: ${inv.loyalty_balance} pts)\n` : ''}-------------------------------------------
*** THANK YOU FOR SHOPPING WITH US! ***
Exchange within 7 days with this digital e-bill.`;

  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
};

// Day-End Z-Report Modal
window.openZReportModal = async function() {
  try {
    const data = await apiRequest('/reports/z-report/');
    if (!data) return;

    const modal = document.getElementById('z-report-modal');
    const content = document.getElementById('z-report-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <center>
        <h2 style="font-size:16px; margin:0;">KERALA TEXTILES POS</h2>
        <h3 style="font-size:13px; margin:4px 0; text-transform:uppercase; color:#b91c1c;">*** DAY-END Z-REPORT (SHIFT CLOSE) ***</h3>
        <p style="margin:2px 0;">Date: <b>${data.report_date}</b></p>
        <p style="margin:2px 0; font-size:11px;">Generated: ${new Date(data.generated_at).toLocaleTimeString()}</p>
        <p style="margin:2px 0;">Cashier: <b>${data.cashier}</b></p>
      </center>
      <hr style="border-top:1px dashed #000; margin:8px 0;">
      
      <div style="font-size:12px; line-height:1.7;">
        <div style="display:flex; justify-content:space-between;"><span>Total Tax Invoices:</span><b>${data.total_bills}</b></div>
        <div style="display:flex; justify-content:space-between;"><span>Gross Sales (Subtotal):</span><b>₹${data.gross_sales.toFixed(2)}</b></div>
        <div style="display:flex; justify-content:space-between;"><span>Total Discounts Given:</span><b style="color:#b91c1c;">-₹${data.total_discount.toFixed(2)}</b></div>
        <div style="display:flex; justify-content:space-between;"><span>Kerala GST Collected (5%):</span><b>+₹${data.total_tax.toFixed(2)}</b></div>
        <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:800; border-top:1px solid #000; border-bottom:1px solid #000; padding:3px 0; margin:4px 0;">
          <span>NET TURNOVER:</span>
          <span>₹${data.grand_total.toFixed(2)}</span>
        </div>
      </div>

      <hr style="border-top:1px dashed #000; margin:8px 0;">
      <h4 style="font-size:12px; margin:4px 0; text-transform:uppercase;">Payment Modes Breakdown:</h4>
      <div style="font-size:12px; line-height:1.6;">
        <div style="display:flex; justify-content:space-between;"><span>• Cash In Hand:</span><b>₹${data.payment_breakdown.cash.toFixed(2)}</b></div>
        <div style="display:flex; justify-content:space-between;"><span>• UPI / BharatQR:</span><b>₹${data.payment_breakdown.upi.toFixed(2)}</b></div>
        <div style="display:flex; justify-content:space-between;"><span>• Card (POS Machine):</span><b>₹${data.payment_breakdown.card.toFixed(2)}</b></div>
        <div style="display:flex; justify-content:space-between;"><span>• Split Payments:</span><b>₹${data.payment_breakdown.split.toFixed(2)}</b></div>
      </div>

      <hr style="border-top:1px dashed #000; margin:8px 0;">
      <div style="font-size:12px; line-height:1.6;">
        <div style="display:flex; justify-content:space-between;"><span>Product Returns (${data.returns_count}):</span><b style="color:#b91c1c;">-₹${data.returns_refund.toFixed(2)}</b></div>
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px; color:#15803d; margin-top:4px;">
          <span>NET CASH IN DRAWER:</span>
          <span>₹${data.net_cash_in_drawer.toFixed(2)}</span>
        </div>
      </div>
      <hr style="border-top:1px dashed #000; margin:8px 0;">
      <center style="font-size:10px; margin-top:6px;">
        <p>Cashier Signature: __________________</p>
        <p>Manager Signature: __________________</p>
      </center>
    `;

    modal.style.display = 'flex';
  } catch (err) {
    alert(`Could not generate Z-Report: ${err.message}`);
  }
};

window.closeZReportModal = function() {
  const modal = document.getElementById('z-report-modal');
  if (modal) modal.style.display = 'none';
};

let currentModalProductId = null;
let currentModalSize = 'M';

/**
 * Show Detailed Product Modal with dynamic size selection
 * @param {number} productId - ID of the product to display
 */
window.showProductDetails = function(productId) {
  const p = allProducts.find(item => item.id === productId);
  if (!p) return;

  currentModalProductId = p.id;
  const availableSizes = getAvailableSizes(p);
  currentModalSize = p.size && availableSizes.includes(p.size) ? p.size : availableSizes[0];

  const modal = document.getElementById('product-detail-modal');
  const title = document.getElementById('pdm-title');
  const body = document.getElementById('pdm-body');

  title.textContent = p.name;
  
  const taxPortion = (parseFloat(p.selling_price) * 0.05 / 1.05).toFixed(2);
  const basePrice = (parseFloat(p.selling_price) - parseFloat(taxPortion)).toFixed(2);

  const sizeSelectorHtml = availableSizes.length > 1 ? `
    <div class="pdm-size-box">
      <div class="pdm-size-header">
        <span class="pdm-size-label">Select Size:</span>
        <span class="pdm-size-current">Active Size: <b id="pdm-selected-size-label">${currentModalSize}</b></span>
      </div>
      <div class="pdm-size-list">
        ${availableSizes.map(sz => `
          <button type="button" class="pdm-size-btn ${sz === currentModalSize ? 'active' : ''}" onclick="selectModalSize('${sz}')">
            ${sz}
          </button>
        `).join('')}
      </div>
    </div>
  ` : '';

  body.innerHTML = `
    <div class="pdm-body-wrap">
      <div class="pdm-image-box">
        <img src="${p.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'}">
        <span class="badge badge-indigo" style="position:absolute; top:12px; left:12px; font-size:11px; padding:4px 10px;">${p.category_name || 'Textile'}</span>
        <span class="badge ${p.stock_quantity <= 5 ? 'badge-red' : 'badge-green'}" style="position:absolute; top:12px; right:12px; font-size:11px; padding:4px 10px;">
          ${p.stock_quantity > 0 ? p.stock_quantity + ' Units Available' : 'Out of Stock'}
        </span>
      </div>

      ${sizeSelectorHtml}

      <div class="pdm-grid">
        <div>
          <span style="color:var(--text-muted); font-size:11px; text-transform:uppercase; font-weight:700;">Barcode / SKU</span>
          <div style="font-weight:700; font-family:monospace; font-size:14px; color:var(--text-main); margin-top:2px;">${p.barcode}</div>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:11px; text-transform:uppercase; font-weight:700;">Fabric & Color</span>
          <div style="font-weight:600; color:var(--text-main); margin-top:2px;">${p.color || 'Standard'} / Size: <b id="pdm-meta-size">${currentModalSize}</b></div>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:11px; text-transform:uppercase; font-weight:700;">Base Price</span>
          <div style="font-weight:600; color:var(--text-main); margin-top:2px;">₹${basePrice}</div>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:11px; text-transform:uppercase; font-weight:700;">Kerala GST (5%)</span>
          <div style="font-weight:600; color:var(--text-muted); margin-top:2px;">+ ₹${taxPortion}</div>
        </div>
      </div>

      <div class="pdm-footer">
        <div>
          <span style="font-size:11px; color:var(--text-muted); display:block; font-weight:700; text-transform:uppercase;">Retail Price</span>
          <span style="font-size:24px; font-weight:900; color:var(--primary);">₹${parseFloat(p.selling_price).toFixed(2)}</span>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <div class="pdm-qty-wrap">
            <button type="button" class="pdm-qty-btn" onclick="adjustPdmQty(-1)">-</button>
            <input type="number" id="pdm-qty-input" class="pdm-qty-field" value="1" min="1" max="${p.stock_quantity}" readonly>
            <button type="button" class="pdm-qty-btn" onclick="adjustPdmQty(1, ${p.stock_quantity})">+</button>
          </div>
          <button type="button" class="btn btn-primary" onclick="addPdmToCart(${p.id})" style="padding:10px 18px; font-weight:700;">
            Add to Bill
          </button>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
};

window.selectModalSize = function(size) {
  currentModalSize = size;
  const label = document.getElementById('pdm-selected-size-label');
  if (label) label.textContent = size;
  const meta = document.getElementById('pdm-meta-size');
  if (meta) meta.textContent = size;
  document.querySelectorAll('.pdm-size-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === size);
  });
};

window.adjustPdmQty = function(delta, maxStock) {
  const input = document.getElementById('pdm-qty-input');
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val += delta;
  if (val < 1) val = 1;
  if (maxStock && val > maxStock) val = maxStock;
  input.value = val;
};

window.addPdmToCart = function(productId) {
  const input = document.getElementById('pdm-qty-input');
  const qty = input ? (parseInt(input.value, 10) || 1) : 1;
  for (let i = 0; i < qty; i++) {
    addToCart(productId, currentModalSize);
  }
  closeProductDetailModal();
};

window.closeProductDetailModal = function() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) modal.style.display = 'none';
};

// Initial Catalog Load
loadProducts();
