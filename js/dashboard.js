// ===== جابجایی بین بخش‌ها =====

function showProducts() {
    document.getElementById('pageTitle').textContent = 'محصولات';
  document.getElementById('productsPanel').style.display = 'block';
  document.getElementById('salesPanel').style.display = 'none';
  document.getElementById('purchasesPanel').style.display = 'none';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display = 'none';
  document.getElementById('settingsPanel').style.display = 'none';
}

function showSales() {
   document.getElementById('pageTitle').textContent = 'فروش‌ها';
  document.getElementById('productsPanel').style.display = 'none';
  document.getElementById('salesPanel').style.display = 'block';
  document.getElementById('purchasesPanel').style.display = 'none';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display = 'none';
  document.getElementById('settingsPanel').style.display = 'none';
  renderSales();
}

function showPurchases() {
   document.getElementById('pageTitle').textContent = 'خریدها';
  document.getElementById('productsPanel').style.display = 'none';
  document.getElementById('salesPanel').style.display = 'none';
  document.getElementById('purchasesPanel').style.display = 'block';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display = 'none';
  document.getElementById('settingsPanel').style.display = 'none';
  renderPurchases();
}

// ===== فیلتر انبار =====
function setActiveFilter(el) {
  const filters = document.querySelectorAll('.inv-filter');
  for (let i = 0; i < filters.length; i++) {
    filters[i].classList.remove('active');
  }
  el.classList.add('active');
}

// ===== پر کردن کارت‌های داشبورد =====
function renderDashboard() {
  const products = getProducts();
  const sales = getSales();

  document.getElementById('totalProducts').textContent = formatNumber(products.length);

  let totalValue = 0;
  for (let i = 0; i < products.length; i++) {
    totalValue += products[i].stock * products[i].buyPrice;
  }
  document.getElementById('totalValue').textContent = formatNumber(totalValue) + ' تومان';

  let lowStock = 0;
  for (let i = 0; i < products.length; i++) {
    if (products[i].stock > 0 && products[i].stock <= products[i].minStock) {
      lowStock++;
    }
  }
  document.getElementById('lowStock').textContent = formatNumber(lowStock);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let todaySales = 0;
  let todayProfit = 0;
  for (let i = 0; i < sales.length; i++) {
    const saleDate = new Date(sales[i].date);
    if (saleDate >= today) {
      todaySales += sales[i].total;
      todayProfit += sales[i].profit;
    }
  }
  document.getElementById('todaySales').textContent = formatNumber(todaySales) + ' تومان';

  const profitEl = document.getElementById('todayProfit');
  if (profitEl) profitEl.textContent = formatNumber(todayProfit) + ' تومان';
}

// ===== تاریخ امروز =====
function showTodayDate() {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('todayDate').textContent = today.toLocaleDateString('fa-IR', options);
}

// ===== راه‌اندازی =====
document.addEventListener('DOMContentLoaded', function() {
  showTodayDate();
  renderProducts();
  renderSales();
  renderPurchases();
  renderInventory();
  renderReports();
  renderAnalysis();
  renderDashboard();
});