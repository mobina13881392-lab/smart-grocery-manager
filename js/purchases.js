// ===== مدیریت خریدها =====
function getPurchases() {
  return JSON.parse(localStorage.getItem('purchases')) || [];
}

function savePurchases(list) {
  localStorage.setItem('purchases', JSON.stringify(list));
}

function openPurchaseForm() {
  const products = getProducts();
  if (products.length === 0) {
    alert('اول باید محصول اضافه کنی');
    return;
  }

  const select = document.getElementById('purProduct');
  let options = '<option value="">انتخاب کن...</option>';
  for (let i = 0; i < products.length; i++) {
    options += '<option value="' + products[i].id + '">' + products[i].name + '</option>';
  }
  select.innerHTML = options;

  document.getElementById('purQty').value = '';
  document.getElementById('purPrice').value = '';
  document.getElementById('purSupplier').value = '';
  document.getElementById('purModal').classList.add('open');
}

function closePurchaseForm() {
  document.getElementById('purModal').classList.remove('open');
}

function savePurchase() {
  const productId = document.getElementById('purProduct').value;
  const qty = Number(toEnglishDigits(document.getElementById('purQty').value));
  const price = Number(toEnglishDigits(document.getElementById('purPrice').value));
  const supplier = document.getElementById('purSupplier').value.trim();

  if (!productId) { alert('محصول را انتخاب کن'); return; }
  if (qty <= 0) { alert('تعداد را درست وارد کن'); return; }
  if (price <= 0) { alert('قیمت خرید را درست وارد کن'); return; }

  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // افزایش موجودی
  product.stock = product.stock + qty;
  // به‌روزرسانی قیمت خرید (آخرین قیمت خرید ملاک می‌شه)
  product.buyPrice = price;

  const purchase = {
    id: generateId(),
    productId: product.id,
    productName: product.name,
    qty: qty,
    price: price,
    total: qty * price,
    supplier: supplier || '-',
    date: new Date().toISOString()
  };

  const purchases = getPurchases();
  purchases.push(purchase);
  savePurchases(purchases);
  saveProducts(products);

  closePurchaseForm();
  renderProducts();
  renderPurchases();
  renderDashboard();
}

function renderPurchases() {
  const tbody = document.getElementById('purchasesTable');
  if (!tbody) return;

  const purchases = getPurchases();
  if (purchases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">هنوز خریدی ثبت نشده</td></tr>';
    return;
  }

  let html = '';
  for (let i = purchases.length - 1; i >= 0; i--) {
    const p = purchases[i];
    const d = new Date(p.date).toLocaleDateString('fa-IR');
    html += '<tr>';
    html += '<td>' + p.productName + '</td>';
    html += '<td>' + formatNumber(p.qty) + '</td>';
    html += '<td>' + formatNumber(p.price) + '</td>';
    html += '<td>' + formatNumber(p.total) + '</td>';
    html += '<td>' + p.supplier + '</td>';
    html += '<td>' + d + '</td>';
    html += '<td><button class="btn-danger" onclick="deletePurchase(\'' + p.id + '\')">حذف</button></td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

function deletePurchase(id) {
  if (!confirm('این خرید حذف شود؟ موجودی کم می‌شود.')) return;

  const purchases = getPurchases();
  const purchase = purchases.find(p => p.id === id);
  if (!purchase) return;

  const products = getProducts();
  const product = products.find(p => p.id === purchase.productId);
  if (product) {
    product.stock = product.stock - purchase.qty;
    if (product.stock < 0) product.stock = 0;
    saveProducts(products);
  }

  savePurchases(purchases.filter(p => p.id !== id));

  renderProducts();
  renderPurchases();
  renderDashboard();
}