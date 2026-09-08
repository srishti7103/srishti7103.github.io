const fs = require('fs');
const path = require('path');

// Load XLSX from libs
const XLSX = require('./libs/xlsx.full.min.js');

function createDatabaseExcel() {
  const wb = XLSX.utils.book_new();

  // 1. Members / Borrowers Directory (Only D001 Clean Demo Profile)
  const members = [
    {
      'Person_ID': 'D001',
      'Name': 'Demo Borrower',
      'Group': 'Group A - Market',
      'Investor': 'Rameshwar Lamba',
      'Phone': '9876500001',
      'Email': 'demo.borrower@example.com',
      'Address': 'Demo Office #101, Main Market, Delhi - 110001',
      'Aadhar_Number': '0000 1111 2222',
      'Cheque_Number': 'CHQ-000111',
      'Witness_Name': 'Demo Witness (Partner)',
      'Witness_Phone': '9876500002',
      'Witness_Aadhar': '3333 4444 5555',
      'Witness_Cheque': 'CHQ-000222',
      'Total_Loans_Taken': 1,
      'Status': 'Active'
    }
  ];

  const wsMembers = XLSX.utils.json_to_sheet(members);
  wsMembers['!cols'] = [
    { wch: 12 }, // Person_ID
    { wch: 22 }, // Name
    { wch: 20 }, // Group
    { wch: 20 }, // Investor
    { wch: 15 }, // Phone
    { wch: 25 }, // Email
    { wch: 45 }, // Address
    { wch: 18 }, // Aadhar_Number
    { wch: 15 }, // Cheque_Number
    { wch: 25 }, // Witness_Name
    { wch: 15 }, // Witness_Phone
    { wch: 18 }, // Witness_Aadhar
    { wch: 15 }, // Witness_Cheque
    { wch: 18 }, // Total_Loans_Taken
    { wch: 12 }  // Status
  ];
  wsMembers['!views'] = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];
  wsMembers['!autofilter'] = { ref: wsMembers['!ref'] };
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Borrowers');

  // 2. Loans Accounts (D001-L1)
  const loans = [
    {
      'Loan_ID': 'D001-L1',
      'Person_ID': 'D001',
      'Borrower_Name': 'Demo Borrower',
      'Group': 'Group A - Market',
      'Investor': 'Rameshwar Lamba',
      'Loan_Number': 1,
      'Principal_Amount': 50000,
      'Weekly_Installment': 2750,
      'Total_Weeks': 20,
      'Total_Receivable': 55000,
      'Interest_Amount': 5000,
      'Start_Date': '2026-08-01',
      'Payment_Day': 'Monday',
      'Total_Paid': 2750,
      'Balance_Remaining': 52250,
      'Installments_Paid': 1,
      'Status': 'Active'
    }
  ];

  const wsLoans = XLSX.utils.json_to_sheet(loans);
  wsLoans['!cols'] = [
    { wch: 12 }, // Loan_ID
    { wch: 12 }, // Person_ID
    { wch: 22 }, // Borrower_Name
    { wch: 20 }, // Group
    { wch: 20 }, // Investor
    { wch: 14 }, // Loan_Number
    { wch: 18 }, // Principal_Amount
    { wch: 18 }, // Weekly_Installment
    { wch: 14 }, // Total_Weeks
    { wch: 18 }, // Total_Receivable
    { wch: 16 }, // Interest_Amount
    { wch: 14 }, // Start_Date
    { wch: 14 }, // Payment_Day
    { wch: 14 }, // Total_Paid
    { wch: 18 }, // Balance_Remaining
    { wch: 18 }, // Installments_Paid
    { wch: 14 }  // Status
  ];
  wsLoans['!views'] = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];
  wsLoans['!autofilter'] = { ref: wsLoans['!ref'] };
  XLSX.utils.book_append_sheet(wb, wsLoans, 'Loans');

  // 3. Weekly Payments Matrix
  const matrix = [
    {
      'Loan_ID': 'D001-L1',
      'Name': 'Demo Borrower',
      'Investor': 'Rameshwar Lamba',
      'Week_1': '2750 [Paid: 03-Aug]',
      'Week_2': '',
      'Week_3': '',
      'Week_4': '',
      'Week_5': '',
      'Week_6': '',
      'Week_7': '',
      'Week_8': '',
      'Week_9': '',
      'Week_10': ''
    }
  ];

  const wsMatrix = XLSX.utils.json_to_sheet(matrix);
  wsMatrix['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 20 },
    { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 },
    { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 }
  ];
  wsMatrix['!views'] = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Payment_Matrix');

  // 4. Payment Transactions (Audit Log)
  const transactions = [
    {
      'Receipt_No': 'RCP-080301',
      'Loan_ID': 'D001-L1',
      'Person_ID': 'D001',
      'Borrower_Name': 'Demo Borrower',
      'Group': 'Group A - Market',
      'Investor': 'Rameshwar Lamba',
      'Week_Number': 1,
      'Due_Date': '2026-08-03',
      'Paid_Date': '2026-08-03',
      'Days_Late': 0,
      'Amount_Due': 2750,
      'Amount_Paid': 2750,
      'Payment_Mode': 'Cash',
      'Status': 'paid',
      'Notes': 'Week 1 on-time demo payment'
    }
  ];

  const wsTx = XLSX.utils.json_to_sheet(transactions);
  wsTx['!cols'] = [
    { wch: 14 }, // Receipt_No
    { wch: 12 }, // Loan_ID
    { wch: 12 }, // Person_ID
    { wch: 20 }, // Borrower_Name
    { wch: 18 }, // Group
    { wch: 20 }, // Investor
    { wch: 14 }, // Week_Number
    { wch: 14 }, // Due_Date
    { wch: 14 }, // Paid_Date
    { wch: 12 }, // Days_Late
    { wch: 14 }, // Amount_Due
    { wch: 14 }, // Amount_Paid
    { wch: 14 }, // Payment_Mode
    { wch: 12 }, // Status
    { wch: 30 }  // Notes
  ];
  wsTx['!views'] = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];
  wsTx['!autofilter'] = { ref: wsTx['!ref'] };
  XLSX.utils.book_append_sheet(wb, wsTx, 'Payment_Transactions');

  // 5. Settings Sheet
  const settings = [
    { 'Setting_Key': 'company_name', 'Setting_Value': 'Lamba Enterprises' },
    { 'Setting_Key': 'investors', 'Setting_Value': 'Rameshwar Lamba, Naresh Patel' },
    { 'Setting_Key': 'default_interest_rate', 'Setting_Value': '10%' },
    { 'Setting_Key': 'default_term_weeks', 'Setting_Value': '20' },
    { 'Setting_Key': 'currency_symbol', 'Setting_Value': '₹' },
    { 'Setting_Key': 'overdue_grace_days', 'Setting_Value': '0' },
    { 'Setting_Key': 'schema_version', 'Setting_Value': '4.0' }
  ];

  const wsSettings = XLSX.utils.json_to_sheet(settings);
  wsSettings['!cols'] = [{ wch: 25 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings');

  // Write file to disk
  const filePath = path.join(__dirname, 'loan_data.xlsx');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  fs.writeFileSync(filePath, buf);
  console.log(`Successfully created: ${filePath}`);

  // Generate js/default-data.js for instant offline loading
  const defaultDataContent = `/* ========================================
   Default Master Database — Lamba Enterprises (Multi-Investor Slate)
   ======================================== */

const DEFAULT_DATABASE = {
  members: [
    {
      personId: 'D001',
      name: 'Demo Borrower',
      group: 'Group A - Market',
      investor: 'Rameshwar Lamba',
      phone: '9876500001',
      email: 'demo.borrower@example.com',
      address: 'Demo Office #101, Main Market, Delhi - 110001',
      aadharNumber: '0000 1111 2222',
      chequeNumber: 'CHQ-000111',
      witnessName: 'Demo Witness (Partner)',
      witnessPhone: '9876500002',
      witnessAadhar: '3333 4444 5555',
      witnessCheque: 'CHQ-000222',
      status: 'Active'
    }
  ],

  loans: [
    {
      loanId: 'D001-L1',
      personId: 'D001',
      borrowerName: 'Demo Borrower',
      group: 'Group A - Market',
      investor: 'Rameshwar Lamba',
      loanNumber: 1,
      loanAmount: 50000,
      weeklyPayment: 2750,
      totalInstallments: 20,
      startDate: new Date('2026-08-01'),
      paymentDay: 'Monday',
      status: 'Active'
    }
  ],

  transactions: [
    {
      receiptNo: 'RCP-080301',
      loanId: 'D001-L1',
      personId: 'D001',
      borrowerName: 'Demo Borrower',
      group: 'Group A - Market',
      investor: 'Rameshwar Lamba',
      weekNumber: 1,
      dueDate: '2026-08-03',
      paidDate: '2026-08-03',
      daysLate: 0,
      amountDue: 2750,
      amountPaid: 2750,
      status: 'paid',
      paymentMode: 'Cash',
      notes: 'Week 1 on-time demo payment'
    }
  ],

  settings: {
    companyName: 'Lamba Enterprises',
    investors: ['Rameshwar Lamba', 'Naresh Patel'],
    defaultTermWeeks: 20,
    currencySymbol: '₹',
    graceDays: 0
  }
};
`;

  fs.writeFileSync(path.join(__dirname, 'js', 'default-data.js'), defaultDataContent, 'utf8');
  console.log('Successfully updated: js/default-data.js');
}

createDatabaseExcel();

