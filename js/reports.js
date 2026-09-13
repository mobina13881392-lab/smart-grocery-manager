// ===== مدیریت گزارش‌ها =====
function showReports() {
  document.querySelector('.panel').style.display = 'none';
  document.getElementById('salesPanel').style.display = 'none';
  document.getElementById('purchasesPanel').style.display = 'none';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display ='none';
  document.getElementById('reportsPanel').style.display = 'block';
  renderReports();
}

function renderReports() {
  const sales = getSales();
  const purchases = getPurchases();
  const products = getProducts();

  // بازه‌ها
  const now = new Date();
  const today = new Date(); today.setHours(0,0,0,0);

  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);

  // محاسبات
  let todaySales = 0, todayProfit = 0, todayCount = 0;
  let weekSales = 0, weekProfit = 0;
  let monthSales = 0, monthProfit = 0;
  let totalSales = 0, totalProfit = 0;
  let totalPurchases = 0;

  for (let i = 0; i < sales.length; i++) {
    const s = sales[i];
    const d = new Date(s.date);
    totalSales += s.total;
    totalProfit += s.profit;

    if (d >= today) { todaySales += s.total; todayProfit += s.profit; todayCount++; }
    if (d >= weekAgo) { weekSales += s.total; weekProfit += s.profit; }
    if (d >= monthAgo) { monthSales += s.total; monthProfit += s.profit; }
  }

  for (let i = 0; i < purchases.length; i++) {
    totalPurchases += purchases[i].total;
  }

  document.getElementById('repTodaySales').textContent = formatNumber(todaySales) + ' ت';
  document.getElementById('repTodayProfit').textContent = formatNumber(todayProfit) + ' ت';
  document.getElementById('repTodayCount').textContent = formatNumber(todayCount) + ' فاکتور';

  document.getElementById('repWeekSales').textContent = formatNumber(weekSales) + ' ت';
  document.getElementById('repWeekProfit').textContent = formatNumber(weekProfit) + ' ت';

  document.getElementById('repMonthSales').textContent = formatNumber(monthSales) + ' ت';
  document.getElementById('repMonthProfit').textContent = formatNumber(monthProfit) + ' ت';

  document.getElementById('repTotalSales').textContent = formatNumber(totalSales) + ' ت';
  document.getElementById('repTotalProfit').textContent = formatNumber(totalProfit) + ' ت';
  document.getElementById('repTotalPurchases').textContent = formatNumber(totalPurchases) + ' ت';

  // محصولات پرفروش
  renderTopProducts(sales);
}

function renderTopProducts(sales) {
  // جمع فروش هر محصول
  const map = {};
  for (let i = 0; i < sales.length; i++) {
    const s = sales[i];
    if (!map[s.productId]) {
      map[s.productId] = { name: s.productName, qty: 0, sales: 0, profit: 0 };
    }
    map[s.productId].qty += s.qty;
    map[s.productId].sales += s.total;
    map[s.productId].profit += s.profit;
  }

  const list = Object.values(map);

  // پرفروش‌ها (بر اساس تعداد)
  const topQty = list.slice().sort((a, b) => b.qty - a.qty).slice(0, 5);
  // پرسودها
  const topProfit = list.slice().sort((a, b) => b.profit - a.profit).slice(0, 5);

  fillTable('repTopQty', topQty, 'qty');
  fillTable('repTopProfit', topProfit, 'profit');
}

function fillTable(id, list, type) {
  const tbody = document.getElementById(id);
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty">داده‌ای نیست</td></tr>';
    return;
  }
  let html = '';
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const val = type === 'qty' ? formatNumber(item.qty) : formatNumber(item.profit) + ' ت';
    html += '<tr><td>' + (i + 1) + '</td><td>' + item.name + '</td><td>' + val + '</td></tr>';
  }
  tbody.innerHTML = html;
}