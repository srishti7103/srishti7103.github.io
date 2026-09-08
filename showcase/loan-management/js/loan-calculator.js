/* ========================================
   Loan Calculator — Advanced financial & schedule engine
   Handles dates, installments, interest, days-late, and credit score
   ======================================== */

const LoanCalculator = {

  DAY_MAP: {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  },
  DAY_NAMES: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  /**
   * Calculate all due dates for a loan based on start date & payment day.
   */
  calculateDueDates(startDate, paymentDay, totalInstallments) {
    const targetDay = this.DAY_MAP[(paymentDay || 'monday').toLowerCase()];
    if (targetDay === undefined || !totalInstallments) return [];
    const dates = [];
    const first = new Date(startDate);
    first.setHours(0, 0, 0, 0);

    // Advance to the first occurrence of target paymentDay on or after startDate
    while (first.getDay() !== targetDay) {
      first.setDate(first.getDate() + 1);
    }

    for (let i = 0; i < totalInstallments; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() + (i * 7));
      dates.push(d);
    }
    return dates;
  },

  /**
   * Calculate difference in calendar days between two dates.
   */
  diffInDays(dateA, dateB) {
    if (!dateA || !dateB) return 0;
    const a = new Date(dateA); a.setHours(0, 0, 0, 0);
    const b = new Date(dateB); b.setHours(0, 0, 0, 0);
    return Math.round((a - b) / (1000 * 60 * 60 * 24));
  },

  /**
   * Calculate installment status and late metrics.
   */
  evaluateInstallment(dueDate, amountDue, tx, today) {
    today = today || new Date();
    const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0);
    const dueStart = new Date(dueDate); dueStart.setHours(0, 0, 0, 0);

    if (tx && tx.amountPaid !== null && tx.amountPaid !== undefined && tx.amountPaid !== '') {
      const paid = Number(tx.amountPaid);
      const paidDate = tx.paidDate ? new Date(tx.paidDate) : dueStart;
      paidDate.setHours(0, 0, 0, 0);
      const daysLate = Math.max(0, this.diffInDays(paidDate, dueStart));

      if (paid >= amountDue) {
        return {
          status: daysLate > 0 ? 'paid_late' : 'paid',
          amountPaid: paid,
          paidDate: tx.paidDate || this.formatDateISO(dueStart),
          daysLate,
          paymentMode: tx.paymentMode || 'Cash',
          receiptNo: tx.receiptNo || '',
          notes: tx.notes || ''
        };
      } else if (paid > 0) {
        return {
          status: 'partial',
          amountPaid: paid,
          paidDate: tx.paidDate || this.formatDateISO(dueStart),
          daysLate,
          paymentMode: tx.paymentMode || 'Cash',
          receiptNo: tx.receiptNo || '',
          notes: tx.notes || ''
        };
      }
    }

    // No payment made yet
    if (dueStart <= todayStart) {
      const daysLate = Math.max(0, this.diffInDays(todayStart, dueStart));
      return {
        status: 'missed',
        amountPaid: 0,
        paidDate: null,
        daysLate,
        paymentMode: '',
        receiptNo: '',
        notes: 'Payment overdue'
      };
    }

    return {
      status: 'pending',
      amountPaid: null,
      paidDate: null,
      daysLate: 0,
      paymentMode: '',
      receiptNo: '',
      notes: ''
    };
  },

  /**
   * Full Loan Summary calculation.
   */
  getLoanSummary(loan, allTransactions) {
    allTransactions = allTransactions || [];
    const loanTxs = allTransactions.filter(t => t.loanId === loan.loanId);
    const dueDates = this.calculateDueDates(loan.startDate, loan.paymentDay, loan.totalInstallments);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    let totalPaid = 0;
    let onTimeCount = 0;
    let latePaidCount = 0;
    let partialCount = 0;
    let missedCount = 0;
    let pendingCount = 0;
    let totalOverdueAmount = 0;
    const installments = [];

    for (let i = 0; i < loan.totalInstallments; i++) {
      const weekNumber = i + 1;
      const dueDate = dueDates[i] || new Date();
      const tx = loanTxs.find(t => Number(t.weekNumber) === weekNumber);
      const evalResult = this.evaluateInstallment(dueDate, loan.weeklyPayment, tx, today);

      const paidNum = Number(evalResult.amountPaid) || 0;
      totalPaid += paidNum;

      if (evalResult.status === 'paid') onTimeCount++;
      else if (evalResult.status === 'paid_late') latePaidCount++;
      else if (evalResult.status === 'partial') {
        partialCount++;
        totalOverdueAmount += Math.max(0, loan.weeklyPayment - paidNum);
      } else if (evalResult.status === 'missed') {
        missedCount++;
        totalOverdueAmount += loan.weeklyPayment;
      } else {
        pendingCount++;
      }

      installments.push({
        weekNumber,
        dueDate,
        amountDue: loan.weeklyPayment,
        ...evalResult
      });
    }

    const totalExpected = loan.weeklyPayment * loan.totalInstallments;
    const isManuallyCompleted = loan.status === 'Completed' || loan.status === 'Settled';
    const isCompleted = totalPaid >= totalExpected || isManuallyCompleted;
    const totalRemaining = isManuallyCompleted ? 0 : Math.max(0, totalExpected - totalPaid);
    const nextUnpaid = isManuallyCompleted ? null : installments.find(inst => inst.status === 'pending' || inst.status === 'missed' || inst.status === 'partial');
    const nextDueDate = nextUnpaid ? nextUnpaid.dueDate : null;

    let loanStatus = 'Active';
    if (isCompleted) loanStatus = 'Completed';
    else if (missedCount > 0 || partialCount > 0) loanStatus = 'Overdue';

    const paidInstallmentsCount = isManuallyCompleted ? loan.totalInstallments : (onTimeCount + latePaidCount + (partialCount > 0 ? 0.5 : 0));
    const interestEarned = Math.max(0, (isManuallyCompleted ? totalPaid : totalExpected) - loan.loanAmount);

    return {
      loanId: loan.loanId,
      personId: loan.personId,
      principal: loan.loanAmount,
      weeklyPayment: loan.weeklyPayment,
      totalInstallments: loan.totalInstallments,
      totalExpected,
      totalPaid,
      totalRemaining,
      interestEarned,
      percentPaid: totalExpected > 0 ? Math.min(100, (totalPaid / totalExpected) * 100) : 0,
      paidCount: onTimeCount + latePaidCount,
      onTimeCount,
      latePaidCount,
      partialCount,
      missedCount,
      pendingCount,
      totalOverdueAmount,
      installmentsLeft: Math.max(0, loan.totalInstallments - (onTimeCount + latePaidCount)),
      nextDueDate,
      loanStatus,
      isCompleted,
      installments
    };
  },

  /**
   * Calculate borrower's overall credit score & track record across all their loans.
   */
  getBorrowerTrackRecord(personId, allLoans, allTransactions) {
    const memberLoans = allLoans.filter(l => l.personId === personId);
    let totalExpected = 0;
    let totalPaid = 0;
    let onTimeInstallments = 0;
    let totalDueInstallments = 0;
    let completedLoans = 0;
    let hasOverdue = false;

    memberLoans.forEach(l => {
      const summary = this.getLoanSummary(l, allTransactions);
      totalExpected += summary.totalExpected;
      totalPaid += summary.totalPaid;
      onTimeInstallments += summary.onTimeCount;
      totalDueInstallments += (summary.onTimeCount + summary.latePaidCount + summary.partialCount + summary.missedCount);
      if (summary.isCompleted) completedLoans++;
      if (summary.loanStatus === 'Overdue') hasOverdue = true;
    });

    const onTimeRate = totalDueInstallments > 0 ? Math.round((onTimeInstallments / totalDueInstallments) * 100) : 100;
    let stars = '⭐⭐⭐⭐⭐';
    let ratingLabel = 'Excellent (A+)';

    if (onTimeRate < 60 || hasOverdue) {
      stars = '⭐⭐☆☆☆';
      ratingLabel = 'Needs Attention (C)';
    } else if (onTimeRate < 80) {
      stars = '⭐⭐⭐☆☆';
      ratingLabel = 'Fair (B)';
    } else if (onTimeRate < 95) {
      stars = '⭐⭐⭐⭐☆';
      ratingLabel = 'Good (A)';
    }

    return {
      totalLoans: memberLoans.length,
      completedLoans,
      activeLoans: memberLoans.length - completedLoans,
      totalExpected,
      totalPaid,
      onTimeRate,
      stars,
      ratingLabel,
      hasOverdue
    };
  },

  /**
   * Aggregated dashboard analytics across all members & loans with optional investor filter.
   */
  getDashboardStats(members, loans, allTransactions, investorFilter = 'all') {
    const isFiltered = investorFilter && investorFilter !== 'all';
    const targetLoans = isFiltered ? loans.filter(l => (l.investor || 'Rameshwar Lamba') === investorFilter) : loans;
    const targetMembers = isFiltered ? members.filter(m => targetLoans.some(l => l.personId === m.personId) || ((m.investor || 'Rameshwar Lamba') === investorFilter)) : members;

    let totalDisbursed = 0;
    let totalReceivable = 0;
    let totalCollected = 0;
    let totalRemaining = 0;
    let totalInterest = 0;
    let totalOverdue = 0;
    let activeLoansCount = 0;
    let completedLoansCount = 0;
    let overdueLoansCount = 0;
    const groupStats = {};

    targetLoans.forEach(loan => {
      const summary = this.getLoanSummary(loan, allTransactions);
      const member = targetMembers.find(m => m.personId === loan.personId);

      totalDisbursed += loan.loanAmount;
      totalReceivable += summary.totalExpected;
      totalCollected += summary.totalPaid;
      totalRemaining += summary.totalRemaining;
      totalInterest += summary.interestEarned;
      totalOverdue += summary.totalOverdueAmount;

      if (summary.isCompleted) completedLoansCount++;
      else if (summary.loanStatus === 'Overdue') overdueLoansCount++;
      else activeLoansCount++;

      const group = (member && member.group) ? member.group : 'General';
      if (!groupStats[group]) {
        groupStats[group] = {
          name: group,
          count: 0,
          memberIds: new Set(),
          disbursed: 0,
          collected: 0,
          remaining: 0,
          overdue: 0,
          active: 0,
          completed: 0
        };
      }

      groupStats[group].count++;
      if (member) groupStats[group].memberIds.add(member.personId);
      groupStats[group].disbursed += loan.loanAmount;
      groupStats[group].collected += summary.totalPaid;
      groupStats[group].remaining += summary.totalRemaining;
      groupStats[group].overdue += summary.totalOverdueAmount;
      if (summary.isCompleted) groupStats[group].completed++;
      else if (summary.loanStatus === 'Overdue') groupStats[group].overdueCount = (groupStats[group].overdueCount || 0) + 1;
      else groupStats[group].active++;
    });

    const recoveryRate = totalReceivable > 0 ? (totalCollected / totalReceivable) * 100 : 0;

    return {
      totalMembers: targetMembers.length,
      totalLoans: targetLoans.length,
      totalDisbursed,
      totalReceivable,
      totalCollected,
      totalRemaining,
      totalInterest,
      totalOverdue,
      activeLoansCount,
      completedLoansCount,
      overdueLoansCount,
      recoveryRate,
      groupStats
    };
  },

  /**
   * Compare financial metrics across all investors (Rameshwar Lamba & Naresh Patel).
   */
  getInvestorComparison(members, loans, allTransactions, investorList = ['Rameshwar Lamba', 'Naresh Patel']) {
    return investorList.map(inv => {
      const invLoans = loans.filter(l => (l.investor || 'Rameshwar Lamba') === inv);
      const invMembers = members.filter(m => invLoans.some(l => l.personId === m.personId) || ((m.investor || 'Rameshwar Lamba') === inv));

      let disbursed = 0;
      let receivable = 0;
      let collected = 0;
      let remaining = 0;
      let interest = 0;
      let overdue = 0;
      let active = 0;
      let completed = 0;

      invLoans.forEach(l => {
        const s = this.getLoanSummary(l, allTransactions);
        disbursed += l.loanAmount;
        receivable += s.totalExpected;
        collected += s.totalPaid;
        remaining += s.totalRemaining;
        interest += s.interestEarned;
        overdue += s.totalOverdueAmount;
        if (s.isCompleted) completed++;
        else active++;
      });

      const recoveryRate = receivable > 0 ? (collected / receivable) * 100 : 0;

      return {
        investor: inv,
        memberCount: invMembers.length,
        loanCount: invLoans.length,
        disbursed,
        receivable,
        collected,
        remaining,
        interest,
        overdue,
        active,
        completed,
        recoveryRate
      };
    });
  },

  /**
   * Get list of payments due today or overdue with optional investor filter.
   */
  getDueToday(members, loans, allTransactions, investorFilter = 'all') {
    const isFiltered = investorFilter && investorFilter !== 'all';
    const targetLoans = isFiltered ? loans.filter(l => (l.investor || 'Rameshwar Lamba') === investorFilter) : loans;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayDay = this.DAY_NAMES[today.getDay()];
    const list = [];

    targetLoans.forEach(loan => {
      const summary = this.getLoanSummary(loan, allTransactions);
      if (summary.isCompleted) return;

      const member = members.find(m => m.personId === loan.personId);
      if (!member) return;

      const isTodayScheduled = (loan.paymentDay || '').toLowerCase() === todayDay.toLowerCase();
      const hasOverdue = summary.missedCount > 0 || summary.partialCount > 0;

      if (isTodayScheduled || hasOverdue) {
        const nextInst = summary.installments.find(i => i.status === 'pending' || i.status === 'missed' || i.status === 'partial');
        list.push({
          member,
          loan,
          summary,
          nextInstallment: nextInst,
          isToday: isTodayScheduled,
          isOverdue: hasOverdue
        });
      }
    });

    return list;
  },

  // Formatting helpers
  formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  },

  formatDate(date) {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  formatDateShort(date) {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  },

  formatDateISO(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  },

  generatePersonId(existingMembers) {
    let maxNum = 0;
    existingMembers.forEach(m => {
      const match = (m.personId || '').match(/P(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return 'P' + String(maxNum + 1).padStart(3, '0');
  },

  generateLoanId(personId, existingLoans) {
    const personLoans = existingLoans.filter(l => l.personId === personId);
    const nextNum = personLoans.length + 1;
    return `${personId}-L${nextNum}`;
  },

  generateReceiptNo() {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `RCP-${Date.now().toString().slice(-4)}${random.toString().slice(-2)}`;
  }
};
