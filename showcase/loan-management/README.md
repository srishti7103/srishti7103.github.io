# 💼 Lamba Enterprises — Loan Management System

A self-contained, offline-first micro-lending and weekly installment loan management system designed for **Lamba Enterprises**.

---

## 🚀 Quick Start (How to Open)

1. Double-click **`index.html`** to open in **Google Chrome** or **Microsoft Edge**.
2. Click the **`⚡ Connect Local Excel`** button in the top right and select **`loan_data.xlsx`** from this folder.
3. Done! Any payment recorded, borrower added, or loan disbursed will **automatically save directly into `loan_data.xlsx` on your disk in real time**.

---

## 📁 Folder Structure

```
Loan Management/
├── index.html            # Main web application (Double-click to open)
├── loan_data.xlsx        # Master 5-sheet Excel database (Permanent frozen headers & filters)
├── HOW_TO_USE.txt        # Simple 1-page quick start guide for the owner
├── README.md             # Complete system documentation
├── css/
│   └── styles.css        # Modern glassmorphic styles, print passbook layout, responsive cards
├── js/
│   ├── app.js            # Main application controller & router
│   ├── default-data.js   # Preloaded offline database
│   ├── excel-handler.js  # 5-sheet parser and 2-way disk auto-sync
│   ├── export-handler.js # Full archive ZIP backup & restore
│   ├── image-handler.js  # Offline document & photo vault (IndexedDB)
│   ├── loan-calculator.js# Financial calculation engine (dates, days late, ratings)
│   └── ui-components.js  # Cards grid, tables, modals, timelines, statements
└── libs/
    ├── jszip.min.js      # Bundled offline ZIP library
    └── xlsx.full.min.js  # Bundled offline SheetJS Excel engine
```

---

## ⭐ Key Highlights & Features

| Feature | Description |
| :--- | :--- |
| **Big Photo Cards** | Browse borrowers with large visual photos/avatars, phone, address, credit stars rating, and live status glow (🟢 Active, 🔴 Overdue). |
| **Instant 📷 Upload** | Upload or change borrower photos directly from their cards. |
| **2-Way Excel Auto-Sync** | Edit in HTML ➔ saves directly to `loan_data.xlsx`. Edit in Excel ➔ switches back and reloads automatically. |
| **Exact Date & Late Tracking** | Tracks scheduled due date vs actual paid date (e.g. `14 days late`). |
| **Sequential Multi-Loans** | Permanent `Person_ID` (P001) preserves complete history across Loan 1, Loan 2, Loan 3... |
| **Printable Passbooks** | 1-click **"🖨 Statement"** button generates an official A4 repayment passbook ready for printing. |
| **1-Click WhatsApp Reminders** | Sends pre-composed payment reminder messages to borrowers with exact amounts and due dates. |
| **100% Offline & Private** | Zero internet required. All data remains exclusively on this computer. |

---

## 🔒 Backup & Portability
* To backup everything: Open **Settings & Data** ➔ Click **"Export Full Backup ZIP"**.
* To share with someone: Right-click this folder ➔ **Compress to ZIP** and send!
