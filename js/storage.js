// ===== مدیریت داده‌ها در LocalStorage =====

function getProducts() {
  return JSON.parse(localStorage.getItem('products')) || [];
}

function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

// ===== تولید شناسه یکتا =====
function generateId() {
  return Date.now().toString();
}

// ===== فرمت اعداد فارسی با جداکننده =====
function formatNumber(num) {
  return Number(num).toLocaleString('fa-IR');
}

// ===== تبدیل عدد فارسی به انگلیسی برای ذخیره =====
function toEnglishDigits(str) {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const en = '0123456789';
  return String(str).split('').map(c => {
    const i = fa.indexOf(c);
    return i > -1 ? en[i] : c;
  }).join('');
}