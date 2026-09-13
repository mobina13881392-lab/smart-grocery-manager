function openProductForm(id = null) {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('modalTitle');

  ['productId','pName','pCategory','pBuy','pSell','pStock','pMin'].forEach(f => {
    document.getElementById(f).value = '';
  });
  document.getElementById('pMin').value = 5;

  if (id) {
    title.textContent = 'ویرایش محصول';
    const product = getProducts().find(p => p.id === id);
    if (product) {
      document.getElementById('productId').value = product.id;
      document.getElementById('pName').value = product.name;
      document.getElementById('pCategory').value = product.category;
      document.getElementById('pBuy').value = product.buyPrice;
      document.getElementById('pSell').value = product.sellPrice;
      document.getElementById('pStock').value = product.stock;
      document.getElementById('pMin').value = product.minStock;
    }
  } else {
    title.textContent = 'افزودن محصول';
  }

  modal.classList.add('open');
}

function closeProductForm() {
  document.getElementById('productModal').classList.remove('open');
}

function saveProduct() {
  const id = document.getElementById('productId').value;
  const name = document.getElementById('pName').value.trim();
  const category = document.getElementById('pCategory').value.trim();
  const buyPrice = Number(toEnglishDigits(document.getElementById('pBuy').value));
  const sellPrice = Number(toEnglishDigits(document.getElementById('pSell').value));
  const stock = Number(toEnglishDigits(document.getElementById('pStock').value));
  const minStock = Number(toEnglishDigits(document.getElementById('pMin').value));

  if (!name) { alert('نام محصول را وارد کن'); return; }
  if (buyPrice <= 0 || sellPrice <= 0) { alert('قیمتها را درست وارد کن'); return; }

  const products = getProducts();

  if (id) {
    const idx = products.findIndex(p => p.id === id);
    products[idx] = { id, name, category, buyPrice, sellPrice, stock, minStock };
  } else {
    products.push({
      id: generateId(),
      name, category, buyPrice, sellPrice, stock, minStock
    });
  }

  saveProducts(products);
  closeProductForm();
  renderProducts();
  renderDashboard();
}

function deleteProduct(id) {
  if (!confirm('مطمئنی میخواهی حذف کنی؟')) return;
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  renderProducts();
  renderDashboard();
}

function renderProducts() {
  const tbody = document.getElementById('productsTable');
  const products = getProducts();

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">هنوز محصولی اضافه نشده</td></tr>';
    return;
  }

  let html = '';
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let statusClass = 'badge-ok';
    let statusText = 'عادی';
    if (p.stock === 0) {
      statusClass = 'badge-out';
      statusText = 'ناموجود';
    } else if (p.stock <= p.minStock) {
      statusClass = 'badge-low';
      statusText = 'کم';
    }

    html += '<tr>';
    html += '<td>' + p.name + '</td>';
    html += '<td>' + (p.category || '-') + '</td>';
    html += '<td>' + formatNumber(p.stock) + '</td>';
    html += '<td>' + formatNumber(p.buyPrice) + '</td>';
    html += '<td>' + formatNumber(p.sellPrice) + '</td>';
    html += '<td><span class="badge ' + statusClass + '">' + statusText + '</span></td>';
    html += '<td>';
    html += '<button class="btn-edit" onclick="openProductForm(\'' + p.id + '\')">ویرایش</button>';
    html += '<button class="btn-danger" onclick="deleteProduct(\'' + p.id + '\')">حذف</button>';
    html += '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}