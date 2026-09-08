/* ========================================
   Excel Handler — Master 5-Sheet Sync & File System Live Auto-Save
   Seamless bidirectional synchronization with loan_data.xlsx
   ======================================== */

const ExcelHandler = {

  dirHandle: null,
  fileHandle: null,
  fileName: 'loan_data.xlsx',

  /**
   * Connect entire Project Folder (Loan Management) via Directory Picker.
   * Gives persistent 2-way read/write access to BOTH loan_data.xlsx AND assets/ folder on disk!
   */
  async openFolderWithFileSystemAPI() {
    if (!window.showDirectoryPicker) {
      return await this.openWithFileSystemAPI();
    }
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      this.dirHandle = dirHandle;
      if (typeof ImageHandler !== 'undefined') {
        ImageHandler.dirHandle = dirHandle;
        await ImageHandler.saveDirectoryHandle(dirHandle);
      }

      // Automatically scan and load all photos and documents from assets/ folder
      let scannedImages = 0;
      if (typeof ImageHandler !== 'undefined') {
        scannedImages = await ImageHandler.scanAssetsDirectory(dirHandle);
      }

      // Try to read loan_data.xlsx from directory
      try {
        const fileHandle = await dirHandle.getFileHandle('loan_data.xlsx', { create: false });
        this.fileHandle = fileHandle;
        const file = await fileHandle.getFile();
        const data = await this.parseFile(file);
        return { ...data, scannedImages };
      } catch (e) {
        console.log('Creating fresh loan_data.xlsx in selected project folder...');
        return { scannedImages };
      }
    } catch (err) {
      if (err.name === 'AbortError') return null;
      throw err;
    }
  },

  /**
   * Attempt to restore previously connected file or directory handle from IndexedDB across page reloads.
   */
  async restoreStoredDirectoryHandle() {
    if (typeof ImageHandler === 'undefined') return null;
    try {
      // 1. Try file handle first (exact loan_data.xlsx file)
      const fHandle = await ImageHandler.getFileHandle();
      if (fHandle) {
        this.fileHandle = fHandle;
        this.fileName = fHandle.name || 'loan_data.xlsx';
        try {
          const file = await fHandle.getFile();
          return await this.parseFile(file);
        } catch (e) {
          console.warn('Could not read restored fileHandle:', e);
        }
      }

      // 2. Try directory handle (Project folder)
      const dHandle = await ImageHandler.getDirectoryHandle();
      if (dHandle) {
        this.dirHandle = dHandle;
        ImageHandler.dirHandle = dHandle;
        try {
          const fileHandle = await dHandle.getFileHandle('loan_data.xlsx', { create: false });
          this.fileHandle = fileHandle;
          const file = await fileHandle.getFile();
          return await this.parseFile(file);
        } catch (e) {
          return null;
        }
      }
    } catch (err) {
      console.warn('restoreStoredDirectoryHandle warning:', err);
    }
    return null;
  },

  /**
   * Connect directly to local Excel file (*.xlsx) via File System Access API.
   * Gives persistent in-place read/write access to the exact file on disk!
   */
  async openWithFileSystemAPI() {
    if (!window.showOpenFilePicker) return null;
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Excel Spreadsheet (*.xlsx)',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
          }
        }],
        multiple: false
      });
      this.fileHandle = handle;
      this.fileName = handle.name || 'loan_data.xlsx';
      
      // Save file handle to IndexedDB for persistent auto-sync across reloads
      if (typeof ImageHandler !== 'undefined') {
        await ImageHandler.saveFileHandle(handle);
      }

      const file = await handle.getFile();
      return await this.parseFile(file);
    } catch (err) {
      if (err.name === 'AbortError') return null; // User cancelled dialog
      throw err;
    }
  },

  /**
   * Load and parse from a standard File object (file input or drag-and-drop).
   */
  async loadFromFile(file) {
    this.fileName = file.name || 'loan_data.xlsx';
    return await this.parseFile(file);
  },

  /**
   * Parse File ArrayBuffer into the full application database.
   */
  async parseFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
          resolve(this.parseWorkbook(wb));
        } catch (err) {
          reject(new Error('Failed to parse Excel workbook: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk'));
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Parse workbook sheets into structured objects.
   */
  parseWorkbook(wb) {
    const members = this.parseMembersSheet(wb);
    const loans = this.parseLoansSheet(wb);
    const transactions = this.parseTransactionsSheet(wb, loans);
    const settings = this.parseSettingsSheet(wb);

    return {
      members,
      loans,
      transactions,
      settings
    };
  },

  parseMembersSheet(wb) {
    const sheet = wb.Sheets['Borrowers'] || wb.Sheets['Members'];
    if (!sheet) return [];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const memberMap = new Map();
    rows.forEach(r => {
      const personId = String(r['Person_ID'] || r['PersonID'] || r['ID'] || '').trim();
      const name = String(r['Name'] || r['Borrower_Name'] || r['Full_Name'] || '').trim();
      if (!personId || !name) return;

      memberMap.set(personId, {
        personId,
        name,
        group: String(r['Group'] || r['Group_Name'] || 'General').trim(),
        investor: String(r['Investor'] || 'Rameshwar Lamba').trim(),
        phone: String(r['Phone'] || r['Mobile'] || '').trim(),
        email: String(r['Email'] || '').trim(),
        address: String(r['Address'] || '').trim(),
        aadharNumber: String(r['Aadhar_Number'] || r['Aadhar'] || '').trim(),
        chequeNumber: String(r['Cheque_Number'] || r['Cheque'] || '').trim(),
        witnessName: String(r['Witness_Name'] || '').trim(),
        witnessPhone: String(r['Witness_Phone'] || '').trim(),
        witnessAadhar: String(r['Witness_Aadhar'] || '').trim(),
        witnessCheque: String(r['Witness_Cheque'] || '').trim(),
        totalLoansTaken: Number(r['Total_Loans_Taken']) || 1,
        status: String(r['Status'] || 'Active').trim()
      });
    });

    return Array.from(memberMap.values());
  },

  parseLoansSheet(wb) {
    const sheet = wb.Sheets['Loans'] || wb.Sheets['Loan_Accounts'];
    if (!sheet) return [];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    return rows.map(r => {
      let startDate = r['Start_Date'];
      if (startDate && !(startDate instanceof Date)) startDate = new Date(startDate);
      if (!startDate || isNaN(startDate.getTime())) startDate = new Date();

      return {
        loanId: String(r['Loan_ID'] || '').trim(),
        personId: String(r['Person_ID'] || '').trim(),
        borrowerName: String(r['Borrower_Name'] || r['Name'] || '').trim(),
        group: String(r['Group'] || '').trim(),
        investor: String(r['Investor'] || 'Rameshwar Lamba').trim(),
        loanNumber: Number(r['Loan_Number']) || 1,
        loanAmount: Number(r['Principal_Amount'] || r['Loan_Amount']) || 0,
        weeklyPayment: Number(r['Weekly_Installment'] || r['Weekly_Payment']) || 0,
        totalInstallments: Number(r['Total_Weeks'] || r['Total_Installments']) || 0,
        startDate,
        paymentDay: String(r['Payment_Day'] || 'Monday').trim(),
        status: String(r['Status'] || 'Active').trim()
      };
    }).filter(l => l.loanId);
  },

  parseTransactionsSheet(wb, loans) {
    const sheet = wb.Sheets['Payment_Transactions'] || wb.Sheets['Transactions'];
    if (sheet) {
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      return rows.map(r => ({
        receiptNo: String(r['Receipt_No'] || r['Receipt'] || LoanCalculator.generateReceiptNo()).trim(),
        loanId: String(r['Loan_ID'] || '').trim(),
        personId: String(r['Person_ID'] || '').trim(),
        investor: String(r['Investor'] || '').trim(),
        weekNumber: Number(r['Week_No'] || r['Week_Number'] || r['Week']) || 1,
        dueDate: String(r['Due_Date'] || '').trim(),
        paidDate: String(r['Paid_Date'] || r['Payment_Date'] || '').trim(),
        daysLate: Number(r['Days_Late']) || 0,
        amountDue: Number(r['Amount_Expected'] || r['Amount_Due']) || 0,
        amountPaid: Number(r['Amount_Paid'] || r['Paid_Amount']) || 0,
        status: String(r['Payment_Status'] || 'paid').toLowerCase().includes('partial') ? 'partial' : (Number(r['Amount_Paid']) > 0 ? 'paid' : 'missed'),
        paymentMode: String(r['Payment_Mode'] || 'Cash').trim(),
        notes: String(r['Notes'] || '').trim()
      })).filter(t => t.loanId);
    }

    // Fallback: parse from matrix sheet if transactions sheet is not present
    const matrixSheet = wb.Sheets['Payment_Matrix'] || wb.Sheets['Payments'];
    if (matrixSheet) {
      const rows = XLSX.utils.sheet_to_json(matrixSheet, { defval: '' });
      const txList = [];

      rows.forEach(r => {
        const loanId = String(r['Loan_ID'] || '').trim();
        const loan = loans.find(l => l.loanId === loanId);
        if (!loan) return;

        const maxWeeks = loan.totalInstallments || 20;
        const dueDates = LoanCalculator.calculateDueDates(loan.startDate, loan.paymentDay, maxWeeks);

        for (let w = 1; w <= maxWeeks; w++) {
          const val = r[`Week_${w}`];
          if (val !== undefined && val !== null && val !== '') {
            const str = String(val).trim();
            if (str.toUpperCase() === 'MISSED') {
              txList.push({
                receiptNo: LoanCalculator.generateReceiptNo(),
                loanId: loan.loanId,
                personId: loan.personId,
                investor: loan.investor || 'Rameshwar Lamba',
                weekNumber: w,
                dueDate: LoanCalculator.formatDateISO(dueDates[w - 1] || new Date()),
                paidDate: '',
                daysLate: 0,
                amountDue: loan.weeklyPayment,
                amountPaid: 0,
                status: 'missed',
                paymentMode: 'Cash',
                notes: 'Imported missed payment'
              });
            } else {
              const match = str.match(/^(\d+(?:\.\d+)?)/);
              const amt = match ? Number(match[1]) : loan.weeklyPayment;
              txList.push({
                receiptNo: LoanCalculator.generateReceiptNo(),
                loanId: loan.loanId,
                personId: loan.personId,
                investor: loan.investor || 'Rameshwar Lamba',
                weekNumber: w,
                dueDate: LoanCalculator.formatDateISO(dueDates[w - 1] || new Date()),
                paidDate: LoanCalculator.formatDateISO(dueDates[w - 1] || new Date()),
                daysLate: 0,
                amountDue: loan.weeklyPayment,
                amountPaid: amt,
                status: amt >= loan.weeklyPayment ? 'paid' : 'partial',
                paymentMode: 'Cash',
                notes: 'Imported payment'
              });
            }
          }
        }
      });
      return txList;
    }

    return [];
  },

  parseSettingsSheet(wb) {
    const sheet = wb.Sheets['Settings'];
    if (!sheet) return {};
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const settings = {};
    rows.forEach(r => {
      const k = String(r['Key'] || r['Setting_Key'] || '').trim();
      const v = String(r['Value'] || r['Setting_Value'] || '').trim();
      if (k === 'Company_Name' || k === 'company_name') settings.companyName = v;
      if (k === 'investors' || k === 'Investors') settings.investors = v.split(',').map(s => s.trim()).filter(Boolean);
      if (k === 'Owner_Name' || k === 'owner_name') settings.ownerName = v;
      if (k === 'Currency' || k === 'currency_symbol') settings.currency = v;
    });
    return settings;
  },

  // ────────────── BUILD WORKBOOK & SAVE ──────────────

  /**
   * Build complete 5-sheet XLSX workbook buffer.
   */
  buildWorkbook(members, loans, transactions, settings) {
    const wb = XLSX.utils.book_new();

    // 1. Borrowers Sheet
    const memberRows = members.map(m => {
      const memberLoans = loans.filter(l => l.personId === m.personId);
      const activeInv = memberLoans[0]?.investor || m.investor || 'Rameshwar Lamba';
      return {
        'Person_ID': m.personId,
        'Name': m.name,
        'Group': m.group,
        'Investor': activeInv,
        'Phone': m.phone,
        'Email': m.email || '',
        'Address': m.address || '',
        'Aadhar_Number': m.aadharNumber,
        'Cheque_Number': m.chequeNumber || '',
        'Witness_Name': m.witnessName || '',
        'Witness_Phone': m.witnessPhone || '',
        'Witness_Aadhar': m.witnessAadhar || '',
        'Witness_Cheque': m.witnessCheque || '',
        'Total_Loans_Taken': memberLoans.length || 1,
        'Status': m.status || 'Active'
      };
    });
    const wsMembers = XLSX.utils.json_to_sheet(memberRows);
    wsMembers['!cols'] = [
      { wch: 12 }, { wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
      { wch: 25 }, { wch: 45 }, { wch: 18 }, { wch: 16 },
      { wch: 24 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
      { wch: 18 }, { wch: 14 }
    ];
    wsMembers['!views'] = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];
    wsMembers['!autofilter'] = { ref: wsMembers['!ref'] };
    XLSX.utils.book_append_sheet(wb, wsMembers, 'Borrowers');

    // 2. Loans Sheet
    const loanRows = loans.map(l => {
      const summary = LoanCalculator.getLoanSummary(l, transactions);
      const member = members.find(m => m.personId === l.personId);
      return {
        'Loan_ID': l.loanId,
        'Person_ID': l.personId,
        'Borrower_Name': member ? member.name : (l.borrowerName || ''),
        'Group': member ? member.group : (l.group || ''),
        'Investor': l.investor || (member && member.investor) || 'Rameshwar Lamba',
        'Loan_Number': l.loanNumber,
        'Principal_Amount': l.loanAmount,
        'Weekly_Installment': l.weeklyPayment,
        'Total_Weeks': l.totalInstallments,
        'Total_Receivable': summary.totalExpected,
        'Interest_Amount': summary.interestEarned,
        'Start_Date': LoanCalculator.formatDateISO(l.startDate),
        'Payment_Day': l.paymentDay,
        'Total_Paid': summary.totalPaid,
        'Balance_Remaining': summary.totalRemaining,
        'Installments_Paid': summary.paidCount,
        'Status': summary.loanStatus
      };
    });
    const wsLoans = XLSX.utils.json_to_sheet(loanRows);
    wsLoans['!cols'] = [
      { wch: 14 }, { wch: 12 }, { wch: 22 }, { wch: 20 }, { wch: 20 },
      { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 14 },
      { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
      { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 14 }
    ];
    wsLoans['!views'] = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];
    wsLoans['!autofilter'] = { ref: wsLoans['!ref'] };
    XLSX.utils.book_append_sheet(wb, wsLoans, 'Loans');

    // 3. Payment Matrix with Dates
    const maxWeeks = Math.max(...loans.map(l => l.totalInstallments || 0), 10);
    const matrixRows = loans.map(l => {
      const member = members.find(m => m.personId === l.personId);
      const summary = LoanCalculator.getLoanSummary(l, transactions);
      const row = {
        'Loan_ID': l.loanId,
        'Name': member ? member.name : '',
        'Investor': l.investor || (member && member.investor) || 'Rameshwar Lamba'
      };

      for (let w = 1; w <= maxWeeks; w++) {
        const inst = summary.installments.find(i => i.weekNumber === w);
        if (inst) {
          if (inst.amountPaid && inst.amountPaid > 0) {
            const dateStr = inst.paidDate ? LoanCalculator.formatDateShort(inst.paidDate) : '';
            const lateStr = inst.daysLate > 0 ? ` (${inst.daysLate}d Late)` : '';
            row[`Week_${w}`] = `${inst.amountPaid} [Paid: ${dateStr}${lateStr}]`;
          } else if (inst.status === 'missed') {
            row[`Week_${w}`] = 'MISSED';
          } else {
            row[`Week_${w}`] = '';
          }
        } else {
          row[`Week_${w}`] = '';
        }
      }
      return row;
    });
    const wsMatrix = XLSX.utils.json_to_sheet(matrixRows);
    const matrixCols = [{ wch: 14 }, { wch: 22 }, { wch: 20 }];
    for (let i = 0; i < maxWeeks; i++) matrixCols.push({ wch: 26 });
    wsMatrix['!cols'] = matrixCols;
    wsMatrix['!views'] = [{ state: 'frozen', xSplit: 3, ySplit: 1, activeCell: 'D2' }];
    XLSX.utils.book_append_sheet(wb, wsMatrix, 'Payment_Matrix');

    // 4. Payment Transactions Ledger
    const txRows = transactions.map(t => {
      const member = members.find(m => m.personId === t.personId);
      const loan = loans.find(l => l.loanId === t.loanId);
      const daysLate = t.daysLate || 0;
      let statusLabel = 'On Time';
      if (t.status === 'partial') statusLabel = `Partial (${daysLate > 0 ? daysLate + 'd Late' : 'Short'})`;
      else if (daysLate > 0) statusLabel = `Late (${daysLate} days)`;
      else if (t.status === 'missed') statusLabel = 'Missed';

      return {
        'Receipt_No': t.receiptNo || LoanCalculator.generateReceiptNo(),
        'Loan_ID': t.loanId,
        'Borrower_Name': member ? member.name : '',
        'Group': member ? member.group : '',
        'Investor': t.investor || (loan && loan.investor) || (member && member.investor) || 'Rameshwar Lamba',
        'Week_No': t.weekNumber,
        'Due_Date': t.dueDate,
        'Paid_Date': t.paidDate || t.dueDate,
        'Days_Late': daysLate,
        'Amount_Expected': t.amountDue,
        'Amount_Paid': t.amountPaid,
        'Payment_Status': statusLabel,
        'Payment_Mode': t.paymentMode || 'Cash',
        'Notes': t.notes || ''
      };
    });
    const wsTx = XLSX.utils.json_to_sheet(txRows);
    wsTx['!cols'] = [
      { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 10 },
      { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 18 },
      { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 35 }
    ];
    wsTx['!views'] = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];
    wsTx['!autofilter'] = { ref: wsTx['!ref'] };
    XLSX.utils.book_append_sheet(wb, wsTx, 'Payment_Transactions');

    // 5. Settings Sheet
    const settingsRows = [
      { 'Key': 'Company_Name', 'Value': settings.companyName || 'Lamba Enterprises' },
      { 'Key': 'Investors', 'Value': (settings.investors || ['Rameshwar Lamba', 'Naresh Patel']).join(', ') },
      { 'Key': 'Owner_Name', 'Value': settings.ownerName || 'Lamba' },
      { 'Key': 'Currency', 'Value': settings.currency || '₹' },
      { 'Key': 'Version', 'Value': '4.0 Multi-Investor' },
      { 'Key': 'Auto_Sync', 'Value': 'Enabled' },
      { 'Key': 'Last_Updated', 'Value': new Date().toISOString() }
    ];
    const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
    wsSettings['!cols'] = [{ wch: 20 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings');

    return wb;
  },

  /**
   * Convert workbook to Blob for download or File System write.
   */
  getWorkbookBlob(members, loans, transactions, settings) {
    const wb = this.buildWorkbook(members, loans, transactions, settings);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  },

  /**
   * Alias for export handler.
   */
  buildExcelBlob(members, loans, transactions, settings) {
    return this.getWorkbookBlob(members, loans, transactions, settings);
  },

  /**
   * Live Auto-Save to connected Directory or FileHandle.
   * If connected, writes seamlessly on disk without download popup!
   */
  async autoSave(members, loans, transactions, settings) {
    const blob = this.getWorkbookBlob(members, loans, transactions, settings);

    // 1. If handles are in IndexedDB but not loaded in memory, restore them
    if (!this.fileHandle && !this.dirHandle && typeof ImageHandler !== 'undefined') {
      const f = await ImageHandler.getFileHandle();
      if (f) { this.fileHandle = f; this.fileName = f.name || 'loan_data.xlsx'; }
      const d = await ImageHandler.getDirectoryHandle();
      if (d) { this.dirHandle = d; ImageHandler.dirHandle = d; }
    }

    if (this.dirHandle) {
      try {
        let perm = 'granted';
        if (this.dirHandle.queryPermission) {
          perm = await this.dirHandle.queryPermission({ mode: 'readwrite' });
          if (perm === 'prompt' && this.dirHandle.requestPermission) {
            perm = await this.dirHandle.requestPermission({ mode: 'readwrite' });
          }
        }
        if (perm === 'granted') {
          const fileHandle = await this.dirHandle.getFileHandle('loan_data.xlsx', { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          console.log('✓ Successfully wrote updated data into loan_data.xlsx on disk!');
          return { success: true, method: 'directory-file-system', fileName: 'loan_data.xlsx' };
        }
      } catch (err) {
        console.warn('Directory write error (will try fileHandle):', err);
        if (err.name === 'NoModificationAllowedError' || (err.message && (err.message.includes('locked') || err.message.includes('access') || err.message.includes('permission')))) {
          if (typeof UI !== 'undefined') {
            UI.toast('⚠️ "loan_data.xlsx" is open in Microsoft Excel. Please close Excel so the app can write to disk!', 'warning');
          }
        }
      }
    }

    if (this.fileHandle && this.fileHandle.createWritable) {
      try {
        let perm = 'granted';
        if (this.fileHandle.queryPermission) {
          perm = await this.fileHandle.queryPermission({ mode: 'readwrite' });
          if (perm === 'prompt' && this.fileHandle.requestPermission) {
            perm = await this.fileHandle.requestPermission({ mode: 'readwrite' });
          }
        }
        if (perm === 'granted') {
          const writable = await this.fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          console.log('✓ Successfully wrote updated data into ' + (this.fileName || 'loan_data.xlsx') + ' on disk!');
          return { success: true, method: 'direct-file-system', fileName: this.fileName || 'loan_data.xlsx' };
        }
      } catch (err) {
        console.warn('File System write failed:', err);
        if (err.name === 'NoModificationAllowedError' || (err.message && (err.message.includes('locked') || err.message.includes('access') || err.message.includes('permission')))) {
          if (typeof UI !== 'undefined') {
            UI.toast('⚠️ "loan_data.xlsx" is open in Microsoft Excel. Please close Excel so the app can write to disk!', 'warning');
          }
        }
      }
    }

    return { success: false, method: 'none', blob };
  },

  /**
   * Force save with instant download to local Downloads folder.
   */
  downloadExcel(members, loans, transactions, settings) {
    const blob = this.getWorkbookBlob(members, loans, transactions, settings);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName || 'loan_data.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 200);
    return true;
  }
};
