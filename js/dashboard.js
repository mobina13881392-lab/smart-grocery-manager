// ===== جابجایی بین بخش‌ها =====
function showProducts() {
  document.querySelector('.panel').style.display = 'block';
  document.getElementById('salesPanel').style.display = 'none';
  document.getElementById('purchasesPanel').style.display = 'none';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display = 'none';
}


function showSales() {
  document.querySelector('.panel').style.display = 'none';
  document.getElementById('salesPanel').style.display = 'block';
  document.getElementById('purchasesPanel').style.display = 'none';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display = 'none';
  renderSales();
}

function showPurchases() {
  document.querySelector('.panel').style.display = 'none';
  document.getElementById('salesPanel').style.display = 'none';
  document.getElementById('purchasesPanel').style.display = 'block';
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('reportsPanel').style.display = 'none';
  document.getElementById('analysisPanel').style.display = 'none';
  renderPurchases();
}

// ===== پر کردن کارت‌های داشبورد =====
function renderDashboard() {
  const products = getProducts();
  const sales = getSales();

  // تعداد محصولات
  document.getElementById('totalProducts').textContent = formatNumber(products.length);

  // ارزش موجودی
  let totalValue = 0;
  for (let i = 0; i < products.length; i++) {
    totalValue += products[i].stock * products[i].buyPrice;
  }
  document.getElementById('totalValue').textContent = formatNumber(totalValue) + ' تومان';

  // کالاهای کم‌موجود
  let lowStock = 0;
  for (let i = 0; i < products.length; i++) {
    if (products[i].stock > 0 && products[i].stock <= products[i].minStock) {
      lowStock++;
    }
  }
  document.getElementById('lowStock').textContent = formatNumber(lowStock);

  // امروز (از ساعت ۰۰:۰۰)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // فروش امروز
  let todaySales = 0;
  for (let i = 0; i < sales.length; i++) {
    const saleDate = new Date(sales[i].date);
    if (saleDate >= today) {
      todaySales += sales[i].total;
    }
  }
  document.getElementById('todaySales').textContent = formatNumber(todaySales) + ' تومان';

  // سود امروز
  let todayProfit = 0;
  for (let i = 0; i < sales.length; i++) {
    const saleDate = new Date(sales[i].date);
    if (saleDate >= today) {
      todayProfit += sales[i].profit;
    }
  }
  const profitEl = document.getElementById('todayProfit');
  if (profitEl) {
    profitEl.textContent = formatNumber(todayProfit) + ' تومان';
  }
}

// ===== تاریخ امروز =====
function showTodayDate() {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('todayDate').textContent = today.toLocaleDateString('fa-IR', options);
}

function setActiveFilter(el) {
  const filters = document.querySelectorAll('.inv-filter');
  for (let i = 0; i < filters.length; i++) {
    filters[i].classList.remove('active');
  }
  el.classList.add('active');
}

// ===== راه‌اندازی اولیه =====
document.addEventListener('DOMContentLoaded', function() {
  showTodayDate();
  renderProducts();
  renderSales();
  renderPurchases();
  renderInventory();
  renderReports();
  renderDashboard();
});