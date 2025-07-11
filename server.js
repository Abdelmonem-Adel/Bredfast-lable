// ✅ server.js (Ready for Railway Deployment with Google Sheets integration)
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// ✅ Google Sheets Configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME;

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getSheetData() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}`,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });

  return data;
}

// ✅ GET product by Barcode
app.get('/api/product/:barcode', async (req, res) => {
  const barcode = req.params.barcode;
  try {
    const data = await getSheetData();
    const product = data.find(p => String(p.Barcode).trim() === barcode.trim());
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error reading from sheet' });
  }
});

// ✅ POST new product
app.post('/api/product', async (req, res) => {
  const newProduct = req.body;
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}`,
    });

    const rows = read.data.values || [];

    let lastRow = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i][1] && rows[i][1].toString().trim() !== '') {
        lastRow = i;
        break;
      }
    }

    const targetRow = lastRow + 2; // Because rows are 1-indexed in Sheets

    const values = [[
      newProduct.ID || '',
      newProduct.Barcode || '',
      newProduct.Name || '',
      newProduct.Category || '',
      newProduct.Unit || '',
      newProduct.Layers || '',
      newProduct.CartoonsPerLayer || '',
    ]];

    if (lastRow === -1) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values },
      });
    } else {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${targetRow}:H${targetRow}`,
        valueInputOption: 'RAW',
        requestBody: { values },
      });
    }

    res.status(200).json({ message: '✅ Product added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error writing to sheet' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
