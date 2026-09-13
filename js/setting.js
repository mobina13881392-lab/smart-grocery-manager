// ===== تنظیمات =====

function getSettings() {
  return JSON.parse(localStorage.getItem('settings')) || {
    shopName: 'مدیریت هوشمند خواربارفروشی',
    currency: 'تومان'
  };
}

function saveSettings(settings) {
  localStorage.setItem('settings', JSON.stringify(settings));
}

function showSettings() {
  document.getElementById('productsPanel').style.display = 'none';
  document.getElementById('salesPanel').style.display = 'none';
  document.getElementById('purchasesPanel').style.display = 'none';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display = 'none';
  document.getElementById('settingsPanel').style.display = 'block';
  renderSettings();
}

function renderSettings() {
  const s = getSettings();
  document.getElementById('setShopName').value = s.shopName;
  document.getElementById('setCurrency').value = s.currency;
  updateShopName();
}

function saveSettingsForm() {
  const shopName = document.getElementById('setShopName').value.trim();
  const currency = document.getElementById('setCurrency').value.trim();

  if (!shopName) { alert('اسم فروشگاه را وارد کن'); return; }

  saveSettings({ shopName: shopName, currency: currency || 'تومان' });
  updateShopName();
  alert('تنظیمات ذخیره شد ✅');
}

function updateShopName() {
  const s = getSettings();
  const logoEl = document.querySelector('.logo');
  if (logoEl) logoEl.textContent = '🛒 ' + s.shopName;
}

// ===== پشتیبان‌گیری =====
function backupData() {
  const data = {
    products: getProducts(),
    sales: getSales(),
    purchases: getPurchases(),
    settings: getSettings(),
    backupDate: new Date().toISOString()
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile('backup-' + Date.now() + '.json', json, 'application/json');
}

function restoreData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (!confirm('همه داده‌های فعلی پاک می‌شود و از فایل جایگزین می‌شود. مطمئنی؟')) return;

        if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
        if (data.sales) localStorage.setItem('sales', JSON.stringify(data.sales));
        if (data.purchases) localStorage.setItem('purchases', JSON.stringify(data.purchases));
        if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));

        alert('بازیابی انجام شد ✅');
        location.reload();
      } catch (err) {
        alert('فایل معتبر نیست');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearAllData() {
  if (!confirm('⚠️ همه محصولات، فروش‌ها و خریدها پاک می‌شوند. مطمئنی؟')) return;
  if (!confirm('این کار قابل برگشت نیست! دوباره مطمئنی؟')) return;

  localStorage.removeItem('products');
  localStorage.removeItem('sales');
  localStorage.removeItem('purchases');
  alert('همه داده‌ها پاک شد');
  location.reload();
}

// ===== خروجی CSV =====
function downloadFile(filename, content, mimeType) {
  const blob = new Blob(['\ufeff' + content], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows) {
  return rows.map(row =>
    row.map(cell => {
      const s = String(cell == null ? '' : cell);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',')
  ).join('\n');
}

function exportProducts() {
  const products = getProducts();
  if (products.length === 0) { alert('محصولی نیست'); return; }const rows = [['نام', 'دسته', 'قیمت خرید', 'قیمت فروش', 'موجودی', 'حداقل موجودی']];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    rows.push([p.name, p.category, p.buyPrice, p.sellPrice, p.stock, p.minStock]);
  }
  downloadFile('products-' + Date.now() + '.csv', toCSV(rows), 'text/csv');
}

function exportSales() {
  const sales = getSales();
  if (sales.length === 0) { alert('فروشی نیست'); return; }

  const rows = [['محصول', 'تعداد', 'قیمت فروش', 'مبلغ کل', 'سود', 'تاریخ']];
  for (let i = 0; i < sales.length; i++) {
    const s = sales[i];
    rows.push([
      s.productName, s.qty, s.sellPrice, s.total, s.profit,
      new Date(s.date).toLocaleDateString('fa-IR')
    ]);
  }
  downloadFile('sales-' + Date.now() + '.csv', toCSV(rows), 'text/csv');
}

function exportPurchases() {
  const purchases = getPurchases();
  if (purchases.length === 0) { alert('خریدی نیست'); return; }

  const rows = [['محصول', 'تعداد', 'قیمت خرید', 'مبلغ کل', 'تأمین‌کننده', 'تاریخ']];
  for (let i = 0; i < purchases.length; i++) {
    const p = purchases[i];
    rows.push([
      p.productName, p.qty, p.price, p.total, p.supplier,
      new Date(p.date).toLocaleDateString('fa-IR')
    ]);
  }
  downloadFile('purchases-' + Date.now() + '.csv', toCSV(rows), 'text/csv');
}

function exportInventory() {
  const products = getProducts();
  if (products.length === 0) { alert('محصولی نیست'); return; }

  const rows = [['نام', 'دسته', 'موجودی', 'ارزش موجودی']];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    rows.push([p.name, p.category, p.stock, p.stock * p.buyPrice]);
  }
  downloadFile('inventory-' + Date.now() + '.csv', toCSV(rows), 'text/csv');
}