// ===== مدیریت انبار =====
let currentInventoryFilter = 'all';

function showInventory() {
  document.querySelector('.panel').style.display = 'none';
  document.getElementById('salesPanel').style.display = 'none';
  document.getElementById('purchasesPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysis').style.display = 'none';
  document.getElementById('inventoryPanel').style.display = 'block';
  renderInventory();
}

function filterInventory(filter) {
  currentInventoryFilter = filter;
  renderInventory();
}

function getProductStatus(p) {
  if (p.stock === 0) return 'out';
  if (p.stock <= p.minStock) return 'low';
  if (p.stock <= p.minStock * 2) return 'near';
  return 'ok';
}

function renderInventory() {
  const tbody = document.getElementById('inventoryTable');
  if (!tbody) return;

  const products = getProducts();

  // شمارش وضعیت‌ها
  let counts = { all: products.length, ok: 0, near: 0, low: 0, out: 0 };
  let filtered = [];

  for (let i = 0; i < products.length; i++) {
    const status = getProductStatus(products[i]);
    counts[status]++;
    if (currentInventoryFilter === 'all' || currentInventoryFilter === status) {
      filtered.push(products[i]);
    }
  }

  // به‌روزرسانی شمارنده‌های فیلتر
  const ids = ['all', 'ok', 'near', 'low', 'out'];
  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById('invCount_' + ids[i]);
    if (el) el.textContent = formatNumber(counts[ids[i]]);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">موردی در این دسته نیست</td></tr>';
    return;
  }

  let html = '';
  for (let i = 0; i < filtered.length; i++) {
    const p = filtered[i];
    const status = getProductStatus(p);

    let statusClass = 'badge-ok';
    let statusText = 'عادی';
    if (status === 'out') { statusClass = 'badge-out'; statusText = 'ناموجود'; }
    else if (status === 'low') { statusClass = 'badge-low'; statusText = 'کم'; }
    else if (status === 'near') { statusClass = 'badge-warn'; statusText = 'رو به اتمام'; }

    const value = p.stock * p.buyPrice;

    html += '<tr>';
    html += '<td>' + p.name + '</td>';
    html += '<td>' + (p.category || '-') + '</td>';
    html += '<td>' + formatNumber(p.stock) + '</td>';
    html += '<td>' + formatNumber(p.minStock) + '</td>';
    html += '<td>' + formatNumber(value) + '</td>';
    html += '<td><span class="badge ' + statusClass + '">' + statusText + '</span></td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}