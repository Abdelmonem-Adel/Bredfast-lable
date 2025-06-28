let lastProduct = null;
let productionDate = null;
let expirationDate = null;
let oovDate = null;



  function clearInputs() {
  document.getElementById('productBarcode').value = '';
    document.getElementById('productionDay').value = '';
    document.getElementById('productionMonth').value = '';
    document.getElementById('productionYear').value = '';
    document.getElementById('shelfLife').value = '';
}

function formatCustomDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function fetchProduct() {
  const barcode = document.getElementById('productBarcode').value;
  const res = await fetch(`/api/product/${barcode}`);
  const resultDiv = document.getElementById('result');

  if (res.ok) {
    const data = await res.json();
    lastProduct = data;

    const day = parseInt(document.getElementById('productionDay').value);
    const month = parseInt(document.getElementById('productionMonth').value);
    const year = parseInt(document.getElementById('productionYear').value);
    const shelfLifeMonths = parseInt(document.getElementById('shelfLife').value);

    if (day && month && year && shelfLifeMonths) {
      productionDate = new Date(year, month - 1, day);
      expirationDate = new Date(productionDate);
      expirationDate.setMonth(productionDate.getMonth() + shelfLifeMonths);

      oovDate = new Date(expirationDate);
      oovDate.setDate(oovDate.getDate() - 36);
    }

    resultDiv.innerHTML = `
      
  <div class="label-paper">
      <img src="logo.png" alt="Breadfast Logo" class="label-logo" />
        <div class="label-row header-row">
          <span>Internal Reference (ID)</span>
          <span><b>${data.ID || '-'}</b></span>
        </div>
        <div class="label-barcode-number">${data.Barcode || '-'}</div>
        <div class="label-barcode-img">
          <img src="https://barcode.tec-it.com/barcode.ashx?data=${data.Barcode || '-'}&Barcode 39" alt="Barcode" />
        </div>
        <div class="section-line"></div>
        <div class="label-product-name">${data.Name || '-'}</div>

        <div class="section-line"></div>

        <table class="product-info-table">
  <tr>
    <td>Product Category</td>
    <td>${data.Category || '-'}</td>
    <td>Shelf life by Months / مدة الصلاحية بالشهور</td>
    <td>${shelfLifeMonths || '-'}</td>
  </tr>
</table>

        <div class="section-line"></div>
        <div class="label-row label-date-title">
          <span>Production Date / تاريخ الإنتاج (DD/MM/YYYY)</span>
        </div>
        <div class="big-date">${productionDate ? formatCustomDate(productionDate) : '-'}</div>

        <div class="section-line"></div>

        <div class="label-info-table1">
        <div>Items per container / العدد داخل الكرتونة(الشدة)<br><br><b>${data.Unit || '-'}</b></div>
        </div>

        <div class="section-line"></div>
        <table class="details-table">
  <tr>
    <td>No. of Carton/Layer<br>عدد الكراتين بالرصة</td>
    <td>${data.CartoonsPerLayer || '-'}</td>
    <td>No. of Layers/Pallet<br>عدد الرصات علي البالته</td>
    <td>${data.Layers || '-'}</td>
  </tr>
  <tr>
    <td>No. of Carton/Pallet<br>الإجمالي بالكرتونة</td>
    <td>${data.CartoonsPerPallet || '-'}</td>
    <td>No. of units/Pallet<br>الإجمالي بالقطعة</td>
    <td>${data.UnitsPerPallet || '-'}</td>
  </tr>
</table>

        <div class="section-line"></div>
      
        <div class="label-title">Out of validation (OOV)</div>
        <div class="big-date">${oovDate ? formatCustomDate(oovDate) : '-'}</div>
        <div class="section-line"></div>
        <div class="label-title">Expiration Date / تاريخ الإنتهاء (DD/MM/YYYY)</div>
        <div class="big-date">${expirationDate ? formatCustomDate(expirationDate) : '-'}</div>
      </div>

    `;

    resultDiv.style.display = 'block';

    clearInputs()

  } else {
    resultDiv.innerHTML = '<p style="color:red">Product not found</p>';
    resultDiv.style.display = 'block';
  }
}




