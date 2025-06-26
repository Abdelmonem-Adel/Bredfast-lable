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
          <img src="https://barcode.tec-it.com/barcode.ashx?data=${data.Barcode || '-'}&Code39" alt="Barcode" />
        </div>
        <div class="section-line"></div>
        <div class="label-product-name">${data.Name || '-'}</div>
        <div class="section-line"></div>
        <div class="label-row">
          <span>Product Category:</span>
          <span>${data.Category || 'Food Cupboard'}</span>
          <span>Shelf life by Months:</span>
          <span>${shelfLifeMonths || '-'}</span>
        </div>
        <div class="section-line"></div>
        <div class="label-row label-date-title">
          <span>Production Date / تاريخ الإنتاج (DD/MM/YYYY)</span>
        </div>
        <div class="label-date-main">${productionDate ? formatCustomDate(productionDate) : '-'}</div>

        <div class="section-line"></div>

        <div class="label-info-table1">
        <div>Items per container / العدد داخل الكرتونة(الشدة)<br><br><b>${data.Unit || '-'}</b></div>
        </div>

        <div class="section-line"></div>
        <div class="label-info-table2">
          
          <div>No. of Carton/Layer <br> عدد الكراتين بالرصة<br><br><b>${data.CartoonsPerLayer || '-'}</b></div>
          <div>No. of Layers/Pallet <br> عدد الرصات علي البالته <br><br><b>${data.Layers || '-'}</b></div>
          <div>No. of Carton/Pallet <br> الإجمالي بالكرتونة <br><br><b>${data.CartoonsPerPallet || '-'}</b></div>
          <div>No. of units/Pallet <br> الإجمالي بالقطعة <br><br><b>${data.UnitsPerPallet || '-'}</b></div>
        </div>
        <div class="section-line"></div>
        <div class="label-row label-date-title">
          <span>Out of validation (OOV)</span>
        </div>
        <div class="label-date-main">${oovDate ? formatCustomDate(oovDate) : '-'}</div>
        <div class="section-line"></div>
        <div class="label-row label-date-title">
          <span>Expiration Date / تاريخ الإنتهاء (DD/MM/YYYY)</span>
        </div>
        <div class="label-date-main">${expirationDate ? formatCustomDate(expirationDate) : '-'}</div>
      </div>
    `;
    resultDiv.style.display = 'block';

    clearInputs()

  } else {
    resultDiv.innerHTML = '<p style="color:red">Product not found</p>';
    resultDiv.style.display = 'block';
  }
}




