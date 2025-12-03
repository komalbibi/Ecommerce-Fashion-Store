// app.js - shared behavior for checkout pages

/* --------------- CONFIG - replace these with your EmailJS values --------------- */
/*
  1) Sign up at https://www.emailjs.com
  2) Create an email service (eg. gmail) -> get SERVICE_ID
  3) Create an email template -> get TEMPLATE_ID (use template variable names used below)
  4) Get your USER_ID (public key)
*/
const EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID';      // e.g. user_xxxxx
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';       // e.g. service_xxx
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';     // e.g. template_xxx
/* ------------------------------------------------------------------------------- */

(function initEmailJS(){
  if(window.emailjs){
    try{ emailjs.init(EMAILJS_USER_ID); }catch(e){ /* ignore */ }
  }
})();

/* -------- Sample cart data (replace/populate from actual cart) -------- */
const SAMPLE_CART = [
  { id:1, title: 'Fashionoe - cotton shirt (S)', price: 35.99, qty: 1, img: 'https://i.imgur.com/7kQEsHU.png' },
  { id:2, title: 'Spray wrap skirt', price: 110.99, qty: 1, img: 'https://i.imgur.com/B1vXw2T.png' }
];

// Use localStorage key names
const LS_CART_KEY = 'checkout_cart_v1';
const LS_FORM_KEY = 'checkout_form_v1';
const LS_PAYMENT_KEY = 'checkout_payment_v1';

/* init store if not present */
function ensureCart(){
  const c = localStorage.getItem(LS_CART_KEY);
  if(!c){
    localStorage.setItem(LS_CART_KEY, JSON.stringify(SAMPLE_CART));
  }
}

/* Render sidebar order summary into an element */
function renderSidebar(containerSelector){
  ensureCart();
  const container = document.querySelector(containerSelector);
  if(!container) return;
  const cart = JSON.parse(localStorage.getItem(LS_CART_KEY) || '[]');
  container.innerHTML = ''; // clear

  const h = document.createElement('h3');
  h.textContent = 'Your Order';
  h.style.marginBottom = '12px';
  container.appendChild(h);

  cart.forEach(it=>{
    const row = document.createElement('div');
    row.className = 'order-item';
    row.innerHTML = `
      <img src="${it.img}" alt="">
      <div style="flex:1">
        <div class="title">${it.title} x${it.qty}</div>
        <div style="color:#9a9a9a; font-size:13px;">$${it.price.toFixed(2)}</div>
      </div>
    `;
    container.appendChild(row);
  });

  // totals
  const subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  const delivery = 16.00;
  const total = subtotal + delivery;

  const priceRow = document.createElement('div');
  priceRow.className = 'order-row';
  priceRow.innerHTML = `<div>Order price</div><div>$${subtotal.toFixed(2)}</div>`;
  container.appendChild(priceRow);

  const promoRow = document.createElement('div');
  promoRow.className = 'order-row';
  promoRow.innerHTML = `<div>Discount for promo code</div><div>No</div>`;
  container.appendChild(promoRow);

  const delRow = document.createElement('div');
  delRow.className = 'order-row';
  delRow.innerHTML = `<div>Delivery (Aug 02 at 16:00)</div><div>$${delivery.toFixed(2)}</div>`;
  container.appendChild(delRow);

  const hr = document.createElement('hr');
  hr.style.border = 'none';
  hr.style.borderTop = '1px solid #eee';
  hr.style.margin = '14px 0';
  container.appendChild(hr);

  const totRow = document.createElement('div');
  totRow.className = 'order-row';
  totRow.style.fontWeight = '700';
  totRow.innerHTML = `<div>Total</div><div>$${total.toFixed(2)}</div>`;
  container.appendChild(totRow);
}

/* Save order form data */
function saveFormData(obj){
  localStorage.setItem(LS_FORM_KEY, JSON.stringify(obj));
}

/* Load form data */
function loadFormData(){
  try{ return JSON.parse(localStorage.getItem(LS_FORM_KEY) || '{}'); }catch(e){return {};}
}

/* Save payment selection */
function savePaymentData(obj){
  localStorage.setItem(LS_PAYMENT_KEY, JSON.stringify(obj));
}
function loadPaymentData(){ return JSON.parse(localStorage.getItem(LS_PAYMENT_KEY) || '{}'); }

/* Build HTML content for items (for email) */
function buildItemsHtml(){
  const cart = JSON.parse(localStorage.getItem(LS_CART_KEY) || '[]');
  let html = '<ul>';
  cart.forEach(it=>{
    html += `<li>${it.title} x${it.qty} — $${(it.price*it.qty).toFixed(2)}</li>`;
  });
  html += '</ul>';
  return html;
}

/* Stepper UI logic: set progress based on step index 1..3 */
function setStepper(stepIndex){
  const steps = document.querySelectorAll('.step');
  const fill = document.querySelector('.steps-line .fill');
  steps.forEach((el,i)=>{
    el.classList.remove('active','completed');
    if(i < stepIndex-1) el.classList.add('completed');
    if(i === stepIndex-1) el.classList.add('active');
  });
  // fill width (0, 50, 100)
  const percent = ((stepIndex-1)/(steps.length-1))*100;
  if(fill) fill.style.width = percent + '%';
}

/* ------------------- PAGE SPECIFIC FUNCTIONS ------------------- */

/* checkout1.html (order details) */
function checkout1Init(){
  setStepper(1);
  renderSidebar('.sidebar');

  // Populate form with previous values if exists
  const form = loadFormData();
  document.querySelector('#firstName').value = form.firstName || '';
  document.querySelector('#lastName').value = form.lastName || '';
  document.querySelector('#phone').value = form.phone || '';
  document.querySelector('#email').value = form.email || '';
  document.querySelector('#country').value = form.country || '';
  document.querySelector('#city').value = form.city || '';
  document.querySelector('#address').value = form.address || '';
  document.querySelector('#deliveryDay').value = form.deliveryDay || '';
  document.querySelector('#deliveryTime').value = form.deliveryTime || '';
  document.querySelector('#comment').value = form.comment || '';

  document.querySelector('#continueBtn').addEventListener('click', (e)=>{
    e.preventDefault();
    // basic validation
    const first = document.querySelector('#firstName').value.trim();
    const email = document.querySelector('#email').value.trim();
    if(!first || !email){
      alert('Please enter name and email before continuing.');
      return;
    }
    // save
    const obj = {
      firstName: document.querySelector('#firstName').value.trim(),
      lastName: document.querySelector('#lastName').value.trim(),
      phone: document.querySelector('#phone').value.trim(),
      email: document.querySelector('#email').value.trim(),
      country: document.querySelector('#country').value,
      city: document.querySelector('#city').value,
      address: document.querySelector('#address').value,
      deliveryDay: document.querySelector('#deliveryDay').value,
      deliveryTime: document.querySelector('#deliveryTime').value,
      comment: document.querySelector('#comment').value
    };
    saveFormData(obj);
    window.location.href = 'checkout2.html';
  });
}

/* checkout2.html (payment) */
function checkout2Init(){
  setStepper(2);
  renderSidebar('.sidebar');

  // Populate previously selected payment
  const pay = loadPaymentData();
  if(pay.method){
    const sel = document.querySelector(`input[name="paymentMethod"][value="${pay.method}"]`);
    if(sel) sel.checked = true;
  }

  document.querySelector('#returnBtn').addEventListener('click', (e)=>{
    e.preventDefault();
    window.location.href = 'checkout1.html';
  });

  document.querySelector('#confirmBtn').addEventListener('click', async (e)=>{
    e.preventDefault();
    // collect payment data
    const method = document.querySelector('input[name="paymentMethod"]:checked');
    const payMethod = method ? method.value : null;
    if(!payMethod){
      alert('Please select a payment method or Cash on Delivery (COD).');
      return;
    }
    const payData = {
      method: payMethod,
      cardNumber: document.querySelector('#cardNumber') ? document.querySelector('#cardNumber').value : '',
      expiryMM: document.querySelector('#expMM') ? document.querySelector('#expMM').value : '',
      expiryYY: document.querySelector('#expYY') ? document.querySelector('#expYY').value : '',
      cvv: document.querySelector('#cvv') ? document.querySelector('#cvv').value : ''
    };
    savePaymentData(payData);

    // Build email payload and send via EmailJS
    const form = loadFormData();
    const itemsHtml = buildItemsHtml();
    const cart = JSON.parse(localStorage.getItem(LS_CART_KEY) || '[]');
    const subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
    const delivery = 16.00;
    const total = (subtotal + delivery).toFixed(2);

    const templateParams = {
      customer_name: `${form.firstName || ''} ${form.lastName || ''}`,
      customer_email: form.email || '',
      customer_phone: form.phone || '',
      delivery_address: `${form.address || ''}, ${form.city || ''}, ${form.country || ''}`,
      delivery_day: form.deliveryDay || '',
      payment_method: payMethod,
      items_html: itemsHtml,
      subtotal: `$${subtotal.toFixed(2)}`,
      delivery: `$${delivery.toFixed(2)}`,
      total: `$${total}`,
      notes: form.comment || ''
    };

    // send email (if EmailJS configured)
    try{
      if(!window.emailjs){
        console.warn('EmailJS not loaded - skipping email send.');
      } else {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      }
    }catch(err){
      console.error('Email send failed:', err);
      // still continue to thank you page
    }

    // Mark order as complete and go to thank you
    window.location.href = 'checkout3.html';
  });
}

/* checkout3.html (thank you) */
function checkout3Init(){
  setStepper(3);
  renderSidebar('.sidebar');

  // show thank you message and order summary populated from localStorage
  const wrap = document.querySelector('#thankWrap');
  const form = loadFormData();
  const pay = loadPaymentData();
  const cart = JSON.parse(localStorage.getItem(LS_CART_KEY) || '[]');
  const subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  const delivery = 16.00;
  const total = (subtotal + delivery).toFixed(2);

  wrap.innerHTML = `
    <h1>Thanks For Your Purchase!</h1>
    <p>Everything went well, wait for the order to arrive at the time specified in the order.</p>
    <p style="margin-top:20px;"><strong>Approximate arrival via:</strong></p>
    <p>${form.deliveryDay || 'Delivery date not selected'}</p>
    <p style="margin-top:12px;"><strong>Payment:</strong> ${pay.method || 'N/A'}</p>
    <p style="margin-top:8px;"><strong>Order total:</strong> $${total}</p>
    <div style="margin-top:20px;">
      <a href="shop.html" class="btn btn-primary">Return to Shop</a>
    </div>
  `;

  // If you want to clear cart/form after order:
  // localStorage.removeItem(LS_CART_KEY);
  // localStorage.removeItem(LS_FORM_KEY);
  // localStorage.removeItem(LS_PAYMENT_KEY);
}

/* Helper to run init based on body id */
document.addEventListener('DOMContentLoaded', ()=>{
  const id = document.body.id || '';
  if(id === 'checkout1') checkout1Init();
  if(id === 'checkout2') checkout2Init();
  if(id === 'checkout3') checkout3Init();
});
