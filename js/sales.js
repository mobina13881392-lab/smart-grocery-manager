// ===== مدیریت فروش‌ها =====

function getSales() {
  return JSON.parse(localStorage.getItem('sales')) || [];
}

function saveSales(sales) {
  localStorage.setItem('sales', JSON.stringify(sales));
}

function openSaleForm() {
  const products = getProducts();
  if (products.length === 0) {
    alert('اول باید محصول اضافه کنی');
    return;
  }

  // پر کردن لیست محصولات در dropdown
  const select = document.getElementById('sProduct');
  let options = '<option value="">انتخاب کن...</option>';
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    options += '<option value="' + p.id + '">' + p.name + ' (موجودی: ' + p.stock + ')</option>';
  }
  select.innerHTML = options;

  document.getElementById('sQty').value = '';
  document.getElementById('sModal').classList.add('open');
}

function closeSaleForm() {
  document.getElementById('sModal').classList.remove('open');
}

function saveSale() {
  const productId = document.getElementById('sProduct').value;
  const qty = Number(toEnglishDigits(document.getElementById('sQty').value));

  if (!productId) { alert('محصول را انتخاب کن'); return; }
  if (qty <= 0) { alert('تعداد را درست وارد کن'); return; }

  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) { alert('محصول پیدا نشد'); return; }
  if (qty > product.stock) {
    alert('موجودی کافی نیست! موجودی فعلی: ' + product.stock);
    return;
  }

  // کم کردن از موجودی
  product.stock = product.stock - qty;

  // ساخت رکورد فروش
  const sale = {
    id: generateId(),
    productId: product.id,
    productName: product.name,
    qty: qty,
    buyPrice: product.buyPrice,
    sellPrice: product.sellPrice,
    total: qty * product.sellPrice,
    profit: qty * (product.sellPrice - product.buyPrice),
    date: new Date().toISOString()
  };

  const sales = getSales();
  sales.push(sale);
  saveSales(sales);
  saveProducts(products);

  closeSaleForm();
  renderProducts();
  renderSales();
  renderDashboard();
}

function renderSales() {
  const tbody = document.getElementById('salesTable');
  if (!tbody) return;

  const sales = getSales();
  if (sales.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">هنوز فروشی ثبت نشده</td></tr>';
    return;
  }

  let html = '';
  for (let i = sales.length - 1; i >= 0; i--) {
    const s = sales[i];
    const d = new Date(s.date);
    const dateStr = d.toLocaleDateString('fa-IR');

    html += '<tr>';
    html += '<td>' + s.productName + '</td>';
    html += '<td>' + formatNumber(s.qty) + '</td>';
    html += '<td>' + formatNumber(s.sellPrice) + '</td>';
    html += '<td>' + formatNumber(s.total) + '</td>';
    html += '<td>' + formatNumber(s.profit) + '</td>';
    html += '<td>' + dateStr + '</td>';
    html += '<td><button class="btn-danger" onclick="deleteSale(\'' + s.id + '\')">حذف</button></td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

function deleteSale(id) {
  if (!confirm('این فروش حذف شود؟ موجودی به انبار برمی‌گردد.')) return;

  const sales = getSales();
  const sale = sales.find(s => s.id === id);
  if (!sale) return;

  // برگرداندن موجودی
  const products = getProducts();
  const product = products.find(p => p.id === sale.productId);
  if (product) {
    product.stock = product.stock + sale.qty;
    saveProducts(products);
  }

  const newSales = sales.filter(s => s.id !== id);
  saveSales(newSales);

  renderProducts();
  renderSales();
  renderDashboard();
}