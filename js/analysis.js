// ===== تحلیل هوشمند =====
function showAnalysis() {
  document.querySelector('.panel').style.display = 'none';
  document.getElementById('salesPanel').style.display = 'none';
  document.getElementById('purchasesPanel').style.display = 'none';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display = 'block';
  renderAnalysis();
}

function renderAnalysis() {
  const products = getProducts();
  const sales = getSales();

  // ===== ۱. سرمایه خوابیده در انبار =====
  renderCapitalTied(products);

  // ===== ۲. پیش‌بینی اتمام موجودی =====
  renderStockForecast(products, sales);

  // ===== ۳. محصولات کم‌فروش =====
  renderSlowMoving(products, sales);

  // ===== ۴. هشدارهای هوشمند =====
  renderSmartAlerts(products, sales);
}

// ===== سرمایه خوابیده (Top 10) =====
function renderCapitalTied(products) {
  const tbody = document.getElementById('analysisCapital');
  if (!tbody) return;

  const list = products.map(p => ({
    name: p.name,
    stock: p.stock,
    buyPrice: p.buyPrice,
    capital: p.stock * p.buyPrice
  })).sort((a, b) => b.capital - a.capital).slice(0, 10);

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">محصولی نیست</td></tr>';
    return;
  }

  let html = '';
  let total = 0;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    total += item.capital;
    html += '<tr>';
    html += '<td>' + (i + 1) + '</td>';
    html += '<td>' + item.name + '</td>';
    html += '<td>' + formatNumber(item.stock) + '</td>';
    html += '<td>' + formatNumber(item.capital) + ' ت</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;

  const totalEl = document.getElementById('analysisCapitalTotal');
  if (totalEl) totalEl.textContent = formatNumber(total) + ' تومان';
}

// ===== پیش‌بینی اتمام موجودی =====
function renderStockForecast(products, sales) {
  const tbody = document.getElementById('analysisForecast');
  if (!tbody) return;

  // میانگین فروش روزانه ۳۰ روز اخیر
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const soldMap = {};
  for (let i = 0; i < sales.length; i++) {
    const s = sales[i];
    if (new Date(s.date) >= monthAgo) {
      soldMap[s.productId] = (soldMap[s.productId] || 0) + s.qty;
    }
  }

  const list = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const sold30 = soldMap[p.id] || 0;
    const dailyAvg = sold30 / 30;
    if (dailyAvg > 0 && p.stock > 0) {
      const daysLeft = Math.round(p.stock / dailyAvg);
      if (daysLeft <= 14) {
        list.push({
          name: p.name,
          stock: p.stock,
          dailyAvg: dailyAvg,
          daysLeft: daysLeft,
          suggestBuy: Math.ceil(dailyAvg * 30 - p.stock)
        });
      }
    }
  }

  list.sort((a, b) => a.daysLeft - b.daysLeft);

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">هیچ محصولی در خطر اتمام نیست 👌</td></tr>';
    return;
  }

  let html = '';
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    let cls = 'badge-ok';
    let txt = item.daysLeft + ' روز';
    if (item.daysLeft <= 3) { cls = 'badge-out'; }
    else if (item.daysLeft <= 7) { cls = 'badge-low'; }
    else { cls = 'badge-warn'; }

    html += '<tr>';
    html += '<td>' + item.name + '</td>';
    html += '<td>' + formatNumber(item.stock) + '</td>';
    html += '<td>' + item.dailyAvg.toFixed(1) + '</td>';
    html += '<td><span class="badge ' + cls + '">' + txt + '</span></td>';
    html += '<td>' + formatNumber(item.suggestBuy) + ' عدد</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

// ===== محصولات کم‌فروش =====
function renderSlowMoving(products, sales) {
  const tbody = document.getElementById('analysisSlow');
  if (!tbody) return;

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);const soldMap = {};
  for (let i = 0; i < sales.length; i++) {
    const s = sales[i];
    if (new Date(s.date) >= monthAgo) {
      soldMap[s.productId] = (soldMap[s.productId] || 0) + s.qty;
    }
  }

  const list = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.stock > 0) {
      const sold = soldMap[p.id] || 0;
      if (sold <= 2) {
        list.push({
          name: p.name,
          stock: p.stock,
          sold: sold,
          capital: p.stock * p.buyPrice
        });
      }
    }
  }

  list.sort((a, b) => b.capital - a.capital);

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">همه محصولات فروش خوبی دارن 👌</td></tr>';
    return;
  }

  let html = '';
  for (let i = 0; i < list.length && i < 10; i++) {
    const item = list[i];
    html += '<tr>';
    html += '<td>' + item.name + '</td>';
    html += '<td>' + formatNumber(item.stock) + '</td>';
    html += '<td>' + formatNumber(item.sold) + '</td>';
    html += '<td>' + formatNumber(item.capital) + ' ت</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

// ===== هشدارهای هوشمند (متن) =====
function renderSmartAlerts(products, sales) {
  const container = document.getElementById('analysisAlerts');
  if (!container) return;

  const alerts = [];

  // ۱. محصولات ناموجود
  const outOfStock = products.filter(p => p.stock === 0);
  if (outOfStock.length > 0) {
    alerts.push({
      type: 'danger',
      text: '⛔ ' + outOfStock.length + ' محصول ناموجود داری: ' + outOfStock.map(p => p.name).join('، ')
    });
  }

  // ۲. محصولات کم‌موجود
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  if (lowStock.length > 0) {
    alerts.push({
      type: 'warning',
      text: '⚠️ ' + lowStock.length + ' محصول موجودی کم دارن: ' + lowStock.map(p => p.name).join('، ')
    });
  }

  // ۳. محصول با بیشترین سرمایه خوابیده
  if (products.length > 0) {
    let top = products[0];
    let topCapital = 0;
    for (let i = 0; i < products.length; i++) {
      const cap = products[i].stock * products[i].buyPrice;
      if (cap > topCapital) {
        topCapital = cap;
        top = products[i];
      }
    }
    if (topCapital > 0) {
      alerts.push({
        type: 'info',
        text: '💰 بیشترین سرمایه خوابیده: «' + top.name + '» با ' + formatNumber(topCapital) + ' تومان'
      });
    }
  }

  // ۴. پرفروش‌ترین محصول ۳۰ روز اخیر
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const soldMap = {};
  for (let i = 0; i < sales.length; i++) {
    const s = sales[i];
    if (new Date(s.date) >= monthAgo) {
      soldMap[s.productName] = (soldMap[s.productName] || 0) + s.qty;
    }
  }
  const topSeller = Object.entries(soldMap).sort((a, b) => b[1] - a[1])[0];
  if (topSeller) {
    alerts.push({
      type: 'success',
      text: '🏆 پرفروش‌ترین محصول ۳۰ روز اخیر: «' + topSeller[0] + '» با ' + formatNumber(topSeller[1]) + ' عدد فروش'
    });
  }

  // ۵. سود ماه
  let monthProfit = 0;
  for (let i = 0; i < sales.length; i++) {
    if (new Date(sales[i].date) >= monthAgo) {
      monthProfit += sales[i].profit;
    }
  }
  if (monthProfit > 0) {
    alerts.push({
      type: 'success',
      text: '📈 سود ۳۰ روز اخیر: ' + formatNumber(monthProfit) + ' تومان'
    });
  }

  // خروجی
  if (alerts.length === 0) {
    container.innerHTML = '<div class="alert alert-info">هنوز داده کافی برای تحلیل نیست. چند فروش و خرید ثبت کن.</div>';
    return;
  }

  let html = '';
  for (let i = 0; i < alerts.length; i++) {
    html += '<div class="alert alert-' + alerts[i].type + '">' + alerts[i].text + '</div>';
  }
  container.innerHTML = html;
}