/* ========================================
   Default Master Database — Lamba Enterprises (Multi-Investor Slate)
   ======================================== */

const DEFAULT_DATABASE = {
  members: [
    {
      personId: 'D001',
      name: 'Demo Borrower',
      group: 'Group A - Market',
      investor: 'Rajesh Varma',
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
      investor: 'Rajesh Varma',
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
      investor: 'Rajesh Varma',
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
    investors: ['Rajesh Varma', 'Naresh Patel'],
    defaultTermWeeks: 20,
    currencySymbol: '₹',
    graceDays: 0
  }
};
