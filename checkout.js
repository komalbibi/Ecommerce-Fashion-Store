/* -------------------- CONFIG -------------------- */
const EMAILJS_USER_ID = 'G7o1UK_4_3CkhphmC';      // e.g. user_xxxxx
const EMAILJS_SERVICE_ID = 'service_4b56iwh';       // e.g. service_xxx
const EMAILJS_TEMPLATE_ID = 'template_48izllf';     // e.g. template_xxx

/* ------------------ INIT EMAILJS ----------------- */
(function initEmailJS(){
  if(window.emailjs){
    try { emailjs.init(EMAILJS_USER_ID); } catch(e) { /* ignore */ }
  }
})();

/* ------------------ LOCAL STORAGE KEYS ----------------- */
const LS_CART_KEY = 'checkout_cart_v1';
const LS_FORM_KEY = 'checkout_form_v1';
const LS_PAYMENT_KEY = 'checkout_payment_v1';

/* ------------------ SAMPLE CART ----------------- */
const SAMPLE_CART = [
  { id:1, title: 'Fashionoe - cotton shirt (S)', price: 35.99, qty: 1, img: 'https://i.imgur.com/7kQEsHU.png' },
  { id:2, title: 'Spray wrap skirt', price: 110.99, qty: 1, img: 'https://i.imgur.com/B1vXw2T.png' }
];

/* ------------------ CART FUNCTIONS ----------------- */
function ensureCart() {
  if(!localStorage.getItem(LS_CART_KEY)) {
    localStorage.setItem(LS_CART_KEY, JSON.stringify(SAMPLE_CART));
  }
}

function loadCart() {
  return JSON.parse(localStorage.getItem(LS_CART_KEY) || '[]');
}

/* ------------------ FORM FUNCTIONS ----------------- */
function saveFormData(obj) { localStorage.setItem(LS_FORM_KEY, JSON.stringify(obj)); }
function loadFormData() { 
  try { return JSON.parse(localStorage.getItem(LS_FORM_KEY) || '{}'); } 
  catch(e){ return {}; } 
}

/* ------------------ PAYMENT FUNCTIONS ----------------- */
function savePaymentData(obj) { localStorage.setItem(LS_PAYMENT_KEY, JSON.stringify(obj)); }
function loadPaymentData() { return JSON.parse(localStorage.getItem(LS_PAYMENT_KEY) || '{}'); }

/* ------------------ RENDER SIDEBAR ----------------- */
function renderSidebar(containerSelector){
  ensureCart();
  const container = document.querySelector(containerSelector);
  if(!container) return;

  const cart = loadCart();
  container.innerHTML = ''; 

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

  const subtotal = cart.reduce((s,i)=> s + i.price*i.qty, 0);
  const delivery = 16.0;
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

/* ------------------ BUILD ITEMS HTML ----------------- */
function buildItemsHtml(){
  const cart = JSON.parse(localStorage.getItem(LS_CART_KEY) || '[]');
  let html = '<ul>';
  cart.forEach(it=>{
    html += `<li>${it.title} x${it.qty} — $${(it.price*it.qty).toFixed(2)}</li>`;
  });
  html += '</ul>';
  return html;
}


/* ------------------ STEPPER ----------------- */
function setStepper(stepIndex){
  const steps = document.querySelectorAll('.step');
  const fill = document.querySelector('.steps-line .fill');
  steps.forEach((el,i)=>{
    el.classList.remove('active','completed');
    if(i < stepIndex-1) el.classList.add('completed');
    if(i === stepIndex-1) el.classList.add('active');
  });
  const percent = ((stepIndex-1)/(steps.length-1))*100;
  if(fill) fill.style.width = percent + '%';
}

/* ------------------ CHECKOUT PAGE 1 ----------------- */
function checkout1Init(){
  setStepper(1);
  renderSidebar('.sidebar');

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
    const first = document.querySelector('#firstName').value.trim();
    const email = document.querySelector('#email').value.trim();
    if(!first || !email){ alert('Please enter name and email before continuing.'); return; }

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

/* ------------------ CHECKOUT PAGE 2 ----------------- */
function checkout2Init() {
  setStepper(2);
  renderSidebar('.sidebar');

  const pay = loadPaymentData();
  if(pay.method){
    const sel = document.querySelector(`input[name="paymentMethod"][value="${pay.method}"]`);
    if(sel) sel.checked = true;
  }

  document.querySelector('#returnBtn').addEventListener('click', (e)=>{
    e.preventDefault();
    window.location.href = 'checkout1.html';
  });

  document.querySelector('#confirmBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();

    const methodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const payMethod = methodEl ? methodEl.value : null;
    if(!payMethod){ alert('Please select a payment method.'); return; }

    savePaymentData({
      method: payMethod,
      cardNumber: document.querySelector('#cardNumber')?.value || '',
      expiryMM: document.querySelector('#expMM')?.value || '',
      expiryYY: document.querySelector('#expYY')?.value || '',
      cvv: document.querySelector('#cvv')?.value || ''
    });

    const form = loadFormData();
    const cart = loadCart();
    if(cart.length === 0){ alert('Your cart is empty!'); return; }

    const subtotal = cart.reduce((s,i)=> s + i.price*i.qty, 0);
    const delivery = 16.0;
    const total = (subtotal + delivery).toFixed(2);


const itemsHtml = buildItemsHtml();  // ✅ use your function here

const templateParams = {
  customer_name: `${form.firstName} ${form.lastName}`,
  order_id: orderId,
  payment_method: payMethod,
  order_table: itemsHtml,    // ✅ your products list
  total_price: total         // ✅ total price
};



    try{
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      console.log('✅ Email sent successfully!');
      localStorage.setItem('email_sent', 'true'); 
    } catch(err){
      console.error('❌ Email send failed:', err);
      alert('Email sending failed. Check console.');
      return;
    }

    localStorage.removeItem(LS_CART_KEY); // clear cart after email sent
    window.location.href = 'checkout3.html';
  });
}
