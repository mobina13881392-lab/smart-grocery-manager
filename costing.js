// ===== حسابداری موجودی به روش FIFO (اولین ورودی، اولین خروجی) =====
// هر خرید یک «دسته» (lot) می‌سازد: { id, qty, buyPrice, sellPrice, date }
// qty = تعداد باقی‌مانده از آن دسته.
// فروش همیشه از قدیمی‌ترین دسته کم می‌کند و سود هر دسته با قیمت خرید خودش حساب می‌شود.

// ---- مهاجرت داده‌های قدیمی (محصولاتی که هنوز دسته ندارند) ----
function ensureLots(p) {
  if (!Array.isArray(p.lots)) {
    p.lots = [];
    if (p.stock > 0) {
      p.lots.push({
        id: 'lot-init-' + p.id,
        qty: p.stock,
        buyPrice: p.buyPrice,
        sellPrice: p.sellPrice,
        date: '1970-01-01T00:00:00.000Z' // دسته‌ی اولیه همیشه قدیمی‌ترین است
      });
    }
  }
  return p;
}

// ---- هماهنگ کردن موجودی و قیمت‌های محصول با دسته‌ها ----
// stock = جمع دسته‌ها ، buyPrice/sellPrice = قیمت قدیمی‌ترین دسته (همان که الان فروخته می‌شود)
function syncProductFromLots(p) {
  p.lots = p.lots.filter(function (l) { return l.qty > 0; });
  p.lots.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  p.stock = p.lots.reduce(function (s, l) { return s + l.qty; }, 0);
  if (p.lots.length > 0) {
    p.buyPrice = p.lots[0].buyPrice;
    p.sellPrice = p.lots[0].sellPrice;
  }
  return p;
}

// ---- ارزش واقعی موجودی (هر دسته با قیمت خرید خودش) ----
function getInventoryValue(p) {
  if (!Array.isArray(p.lots)) return p.stock * p.buyPrice;
  return p.lots.reduce(function (s, l) { return s + l.qty * l.buyPrice; }, 0);
}

// ---- پیش‌نمایش فروش FIFO (بدون تغییر دادن داده) ----
function planFifoSale(p, qty) {
  const lots = p.lots.slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  let remaining = qty;
  const segments = [];
  let cost = 0, revenue = 0;

  for (let i = 0; i < lots.length && remaining > 0; i++) {
    const take = Math.min(lots[i].qty, remaining);
    segments.push({
      lotId: lots[i].id,
      qty: take,
      buyPrice: lots[i].buyPrice,
      sellPrice: lots[i].sellPrice,
      date: lots[i].date
    });
    cost += take * lots[i].buyPrice;
    revenue += take * lots[i].sellPrice;
    remaining -= take;
  }
  return { segments: segments, cost: cost, revenue: revenue, profit: revenue - cost, shortage: remaining };
}

// ---- اعمال فروش روی دسته‌ها ----
function applyFifoSale(p, segments) {
  segments.forEach(function (seg) {
    const lot = p.lots.find(function (l) { return l.id === seg.lotId; });
    if (lot) lot.qty -= seg.qty;
  });
  syncProductFromLots(p);
}

// ---- برگرداندن فروش (حذف فروش) ----
function restoreFifoSale(p, sale) {
  if (Array.isArray(sale.segments) && sale.segments.length > 0) {
    sale.segments.forEach(function (seg) {
      const lot = p.lots.find(function (l) { return l.id === seg.lotId; });
      if (lot) {
        lot.qty += seg.qty;
      } else {
        p.lots.push({
          id: seg.lotId, qty: seg.qty,
          buyPrice: seg.buyPrice, sellPrice: seg.sellPrice,
          date: seg.date || sale.date
        });
      }
    });
  } else {
    // فروش‌های قدیمی که اطلاعات دسته ندارند
    p.lots.push({
      id: 'lot-restore-' + sale.id, qty: sale.qty,
      buyPrice: sale.buyPrice, sellPrice: sale.sellPrice,
      date: '1970-01-01T00:00:00.000Z'
    });
  }
  syncProductFromLots(p);
}

// ---- حذف خرید: دسته‌ی همان خرید از انبار برداشته می‌شود ----
function removePurchaseLot(p, purchase) {
  const idx = p.lots.findIndex(function (l) { return l.id === purchase.lotId; });
  if (idx > -1) {
    p.lots.splice(idx, 1); // هر مقدار که از آن دسته مانده، حذف می‌شود
  } else {
    // خریدهای قدیمی بدون دسته: از جدیدترین دسته‌ها کم کن
    let remaining = purchase.qty;
    for (let i = p.lots.length - 1; i >= 0 && remaining > 0; i--) {
      const t = Math.min(p.lots[i].qty, remaining);
      p.lots[i].qty -= t;
      remaining -= t;
    }
  }
  syncProductFromLots(p);
}

// ---- متن ریز دسته‌ها برای نمایش در جدول انبار ----
function formatLots(p) {
  if (!Array.isArray(p.lots) || p.lots.length <= 1) return '';
  return p.lots.map(function (l) {
    return formatNumber(l.qty) + ' عدد × ' + formatNumber(l.buyPrice);
  }).join(' | ');
}
