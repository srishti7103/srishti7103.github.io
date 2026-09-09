/* ========================================
   UI Components — Modern Glassmorphic Component Library
   Interactive timelines, payment modals, receipts, printable statements, forms
   ======================================== */

const UI = {

  /**
   * Toast notification system.
   */
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  },

  /**
   * Stat card with gradient icon and trend pill.
   */
  statCard(icon, value, label, color, extra = '') {
    return `
      <div class="stat-card" style="--stat-color: ${color}">
        <div class="stat-icon" style="background: ${color}18; color: ${color}">${icon}</div>
        <div class="stat-info">
          <div class="stat-value">${value}</div>
          <div class="stat-label">${label}</div>
          ${extra ? `<div class="stat-change" style="background: ${color}15; color: ${color}">${extra}</div>` : ''}
        </div>
      </div>`;
  },

  /**
   * Status badges.
   */
  badge(status) {
    const map = {
      'Active': { cls: 'badge-active', icon: '●', text: 'Active' },
      'Completed': { cls: 'badge-completed', icon: '✓', text: 'Completed' },
      'Overdue': { cls: 'badge-overdue', icon: '⚠', text: 'Overdue' },
      'paid': { cls: 'badge-active', icon: '✓', text: 'Paid' },
      'paid_late': { cls: 'badge-partial', icon: '⏰', text: 'Paid Late' },
      'partial': { cls: 'badge-partial', icon: '◐', text: 'Partial' },
      'missed': { cls: 'badge-overdue', icon: '✕', text: 'Missed' },
      'pending': { cls: 'badge-pending', icon: '○', text: 'Pending' }
    };
    const info = map[status] || { cls: 'badge-pending', icon: '○', text: status };
    return `<span class="badge ${info.cls}">${info.icon} ${info.text}</span>`;
  },

  /**
   * Investor colored badge.
   */
  investorBadge(name) {
    if (!name) return '';
    const isRajesh = name.toLowerCase().includes('rajesh') || name.toLowerCase().includes('rameshwar');
    const isNaresh = name.toLowerCase().includes('naresh');
    const cls = isRajesh ? 'inv-rajesh' : (isNaresh ? 'inv-naresh' : 'inv-other');
    const icon = isRajesh ? '👑' : (isNaresh ? '💼' : '👔');
    return `<span class="investor-pill ${cls}">${icon} ${name}</span>`;
  },

  /**
   * Side-by-Side Multi-Investor Portfolio Comparison Widget for Dashboard.
   */
  investorComparisonWidget(investorList, activeFilter) {
    if (!investorList || investorList.length === 0) return '';
    let html = `
      <div style="margin-bottom: 24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:1.05rem; font-weight:800; display:flex; align-items:center; gap:8px;">
            <span>🤝</span> Partner Capital Portfolios
          </h3>
          <span style="font-size:0.8rem; color:var(--text-muted);">Independent Investment Tracking</span>
        </div>
        <div class="investor-comparison-grid">`;

    investorList.forEach(inv => {
      const isRajesh = inv.investor.toLowerCase().includes('rajesh') || inv.investor.toLowerCase().includes('rameshwar');
      const isNaresh = inv.investor.toLowerCase().includes('naresh');
      const cardCls = isRajesh ? 'comp-rajesh' : (isNaresh ? 'comp-naresh' : 'comp-other');
      const icon = isRajesh ? '👑' : (isNaresh ? '💼' : '👔');
      const isActive = activeFilter === inv.investor;

      html += `
        <div class="investor-comp-card ${cardCls} ${isActive ? 'active-comp' : ''}">
          <div class="inv-card-head">
            <div class="inv-card-name">
              <span>${icon}</span>
              <span>${inv.investor}</span>
            </div>
            ${this.investorBadge(inv.investor)}
          </div>
          <div class="inv-stats-mini-grid">
            <div class="inv-stat-item">
              <span class="lbl">Capital Deployed</span>
              <span class="val" style="color:var(--accent)">${LoanCalculator.formatCurrency(inv.disbursed)}</span>
            </div>
            <div class="inv-stat-item">
              <span class="lbl">Total Collected</span>
              <span class="val" style="color:var(--success)">${LoanCalculator.formatCurrency(inv.collected)}</span>
            </div>
            <div class="inv-stat-item">
              <span class="lbl">Balance Remaining</span>
              <span class="val" style="color:${inv.remaining > 0 ? 'var(--danger)' : 'var(--text-muted)'}">${LoanCalculator.formatCurrency(inv.remaining)}</span>
            </div>
            <div class="inv-stat-item">
              <span class="lbl">Interest / Profit</span>
              <span class="val" style="color:var(--success)">+${LoanCalculator.formatCurrency(inv.interest)}</span>
            </div>
          </div>
          <div class="inv-card-actions">
            <div style="font-size:0.8rem; color:var(--text-muted);">
              <strong>${inv.loanCount}</strong> Loans · <strong>${inv.memberCount}</strong> Borrowers · <strong>${inv.recoveryRate.toFixed(1)}%</strong> Recovery
            </div>
            <button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}" onclick="App.setInvestorFilter('${inv.investor}')">
              ${isActive ? '✓ Filtering' : 'Filter →'}
            </button>
          </div>
        </div>`;
    });

    html += `</div></div>`;
    return html;
  },

  /**
   * Progress bar with percentage and labels.
   */
  progressBar(percent, leftText, rightText) {
    const safePct = Math.min(100, Math.max(0, percent || 0));
    return `
      <div class="progress-wrap">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${safePct}%"></div>
        </div>
        <div class="progress-text">
          <span>${leftText}</span>
          <span>${rightText}</span>
        </div>
      </div>`;
  },

  /**
   * Detailed Interactive Payment Grid with Scheduled Due Dates & Actual Paid Dates.
   */
  paymentGrid(loan, transactions, isCompleted) {
    const summary = LoanCalculator.getLoanSummary(loan, transactions);
    let html = '<div class="payment-grid-detailed">';

    summary.installments.forEach(inst => {
      let statusClass = `status-${inst.status}`;
      if (isCompleted) statusClass = 'status-completed-all';

      const dueDateStr = LoanCalculator.formatDateShort(inst.dueDate);
      const paidDateStr = inst.paidDate ? LoanCalculator.formatDateShort(inst.paidDate) : '';
      const lateTag = inst.daysLate > 0 ? `<span class="late-tag">${inst.daysLate}d late</span>` : '';

      let amountDisplay = '—';
      if (inst.amountPaid && inst.amountPaid > 0) {
        amountDisplay = LoanCalculator.formatCurrency(inst.amountPaid);
      } else if (inst.status === 'missed') {
        amountDisplay = `<span class="missed-text">Due ${LoanCalculator.formatCurrency(inst.amountDue)}</span>`;
      }

      html += `
        <div class="payment-cell-card ${statusClass}"
             onclick="App.openPaymentModal('${loan.loanId}', ${inst.weekNumber})"
             title="Click to Record or Edit Week ${inst.weekNumber} Payment">
          <div class="cell-top">
            <span class="cell-week">Week ${inst.weekNumber}</span>
            <span class="cell-due-date">${dueDateStr}</span>
          </div>
          <div class="cell-amount">${amountDisplay}</div>
          <div class="cell-bottom">
            ${paidDateStr ? `<span class="paid-date-badge">✓ ${paidDateStr}</span>` : `<span class="status-badge-mini">${inst.status}</span>`}
            ${lateTag}
          </div>
        </div>`;
    });

    html += '</div>';
    return html;
  },

  /**
   * Document & Image Upload Gallery.
   */
  imageGallery(personId, imageURLs) {
    let html = '<div class="image-upload-grid">';
    ImageHandler.IMAGE_TYPES.forEach(type => {
      const url = imageURLs[type.key] || null;
      const hasImage = !!url;
      html += `
        <div class="image-upload-card ${hasImage ? 'has-image' : ''}"
             data-person-id="${personId}" data-type="${type.key}"
             onclick="App.handleImageClick('${personId}', '${type.key}')">
          <img src="${url || ''}" alt="${type.label}"
               onload="this.parentElement.classList.add('has-image'); this.style.display='block'; if(this.nextElementSibling && this.nextElementSibling.classList.contains('image-upload-placeholder')) this.nextElementSibling.style.display='none';"
               onerror="this.parentElement.classList.remove('has-image'); this.style.display='none'; if(this.nextElementSibling && this.nextElementSibling.classList.contains('image-upload-placeholder')) this.nextElementSibling.style.display='flex';"
               style="${url ? '' : 'display:none;'}">
          <div class="image-upload-placeholder" style="${url ? 'display:none;' : 'display:flex; flex-direction:column; align-items:center;'}">
            <div class="image-upload-icon">${type.icon}</div>
            <div class="image-upload-label">${type.label}</div>
            <div class="image-upload-hint">Click to upload</div>
          </div>
          <div class="image-overlay">
            <button class="btn btn-sm btn-secondary" title="Replace Photo" onclick="event.stopPropagation(); App.handleImageUpload('${personId}', '${type.key}')">📷 Replace</button>
            <button class="btn btn-sm btn-danger" title="Delete Photo" onclick="event.stopPropagation(); App.handleImageDelete('${personId}', '${type.key}')">🗑</button>
          </div>
        </div>`;
    });
    html += '</div>';
    return html;
  },

  /**
   * Borrower Big Photo Card Grid View.
   */
  memberCardsGrid(members, loans, transactions, filter, photoCache = {}) {
    let filtered = [...members];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.personId.toLowerCase().includes(q) ||
        m.group.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.aadharNumber && m.aadharNumber.includes(q)) ||
        (m.address && m.address.toLowerCase().includes(q))
      );
    }

    if (filter.group && filter.group !== 'all') {
      filtered = filtered.filter(m => m.group === filter.group);
    }

    if (filter.investor && filter.investor !== 'all') {
      filtered = filtered.filter(m => {
        const memberLoans = loans.filter(l => l.personId === m.personId);
        const activeInv = memberLoans[0]?.investor || m.investor || 'Rajesh Varma';
        return activeInv === filter.investor || memberLoans.some(l => (l.investor || 'Rajesh Varma') === filter.investor);
      });
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(m => {
        const memberLoans = loans.filter(l => l.personId === m.personId);
        const activeLoan = memberLoans.find(l => l.status !== 'Completed') || memberLoans[memberLoans.length - 1];
        if (!activeLoan) return filter.status === 'Completed';
        const s = LoanCalculator.getLoanSummary(activeLoan, transactions);
        return s.loanStatus === filter.status;
      });
    }

    if (filtered.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <div class="empty-title">No borrowers found</div>
          <div class="empty-description">
            ${members.length === 0
              ? 'No member records found. Connect to loan_data.xlsx or add a new borrower.'
              : 'Try changing your search term or group filter.'}
          </div>
          ${members.length === 0 ? `<button class="btn btn-primary" onclick="App.showAddMember()">➕ Add First Borrower</button>` : ''}
        </div>`;
    }

    let html = '<div class="borrower-cards-grid">';

    filtered.forEach(m => {
      const memberLoans = loans.filter(l => l.personId === m.personId).sort((a, b) => a.loanNumber - b.loanNumber);
      const latestLoan = memberLoans[memberLoans.length - 1] || null;
      const latestSummary = latestLoan ? LoanCalculator.getLoanSummary(latestLoan, transactions) : null;
      const hasActiveLoan = latestLoan && !latestSummary.isCompleted && latestLoan.status !== 'Completed';
      const activeLoan = hasActiveLoan ? latestLoan : null;
      const summary = latestSummary;
      const track = LoanCalculator.getBorrowerTrackRecord(m.personId, loans, transactions);
      const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const photoUrl = photoCache[m.personId] || (typeof ImageHandler !== 'undefined' ? `assets/${ImageHandler.getFolderSafeName(m.personId, m.name)}/photo.jpg` : null);

      const isOverdue = summary && summary.loanStatus === 'Overdue';
      const statusClass = hasActiveLoan
        ? (isOverdue ? 'card-status-overdue' : 'card-status-active')
        : 'card-status-completed';

      html += `
        <div class="borrower-big-card ${statusClass}" onclick="App.navigate('member-detail', '${m.personId}')">
          <div class="card-photo-col">
            <div class="big-card-avatar ${isOverdue ? 'avatar-overdue' : ''}">
              <img src="${photoUrl || ''}" alt="${m.name}"
                   onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';"
                   onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
                   style="${photoUrl ? '' : 'display:none;'}">
              <div class="avatar-fallback" style="${photoUrl ? 'display:none;' : ''}">${initials}</div>
              <button class="avatar-cam-btn" title="Upload/Change Photo" onclick="event.stopPropagation(); App.handleImageUpload('${m.personId}', 'photo')">📷</button>
            </div>
            <span class="card-id-tag">${m.personId}</span>
          </div>

          <div class="card-main-col">
            <div class="card-top-header">
              <div>
                <h3 class="card-person-name">${m.name}</h3>
                <div class="card-stars-row">
                  <span class="stars-text">${track.stars}</span>
                  <span class="track-label">${track.ratingLabel}</span>
                </div>
              </div>
              <div class="card-badges-stack">
                ${summary ? this.badge(summary.loanStatus) : '<span class="badge badge-completed">No Loan</span>'}
                <span class="loan-count-pill">${memberLoans.length} Loan${memberLoans.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div class="card-meta-list">
              <div class="card-meta-row">
                <span class="meta-ico">🏢</span> <span class="meta-txt"><strong>${m.group || 'General'}</strong></span>
              </div>
              <div class="card-meta-row">
                <span class="meta-ico">💼</span> <span class="meta-txt">${this.investorBadge(latestLoan?.investor || m.investor || 'Rajesh Varma')}</span>
              </div>
              <div class="card-meta-row">
                <span class="meta-ico">📞</span> <span class="meta-txt">${m.phone || '—'}</span>
              </div>
              ${m.address ? `
                <div class="card-meta-row card-addr-row">
                  <span class="meta-ico">📍</span> <span class="meta-txt">${m.address}</span>
                </div>` : ''
              }
              ${m.witnessName ? `
                <div class="card-meta-row card-witness-row">
                  <span class="meta-ico">🤝</span> <span class="meta-txt">Witness: ${m.witnessName} (${m.witnessPhone || '—'})</span>
                </div>` : ''
              }
            </div>

            ${hasActiveLoan && summary ? `
              <div class="card-loan-snapshot">
                <div class="snap-row">
                  <div class="snap-box">
                    <span class="snap-lbl">Loan #${latestLoan.loanNumber} Principal</span>
                    <span class="snap-val">${LoanCalculator.formatCurrency(latestLoan.loanAmount)}</span>
                  </div>
                  <div class="snap-box">
                    <span class="snap-lbl">Weekly</span>
                    <span class="snap-val text-accent">${LoanCalculator.formatCurrency(latestLoan.weeklyPayment)}</span>
                  </div>
                  <div class="snap-box">
                    <span class="snap-lbl">Balance Left</span>
                    <span class="snap-val ${summary.totalRemaining > 0 ? 'text-danger' : 'text-success'}">${LoanCalculator.formatCurrency(summary.totalRemaining)}</span>
                  </div>
                </div>
                ${this.progressBar(summary.percentPaid, `Paid ${LoanCalculator.formatCurrency(summary.totalPaid)} (${summary.paidCount}/${latestLoan.totalInstallments} wks)`, `${summary.percentPaid.toFixed(0)}%`)}
              </div>` : `
              <div class="card-no-loan-snapshot" style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); color:var(--success); padding:8px 12px; border-radius:var(--radius-md); font-size:0.76rem; text-align:center;">
                <span>✓ ${memberLoans.length > 0 ? `Loan #${latestLoan.loanNumber} 100% Cleared (₹0 Balance)` : 'No active loans'}. Ready for new disbursement!</span>
              </div>`
            }

            <div class="card-footer-actions">
              ${hasActiveLoan ? `
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); App.openNextPaymentModal('${activeLoan.loanId}')">
                  💰 Collect
                </button>
                <button class="btn btn-secondary btn-sm" title="Send WhatsApp Payment Reminder" onclick="event.stopPropagation(); App.sendWhatsAppReminder('${m.personId}', '${activeLoan.loanId}')">
                  📲 WhatsApp
                </button>` : `
                <button class="btn btn-primary btn-sm" style="background:linear-gradient(135deg, #10b981, #059669); border:none;" onclick="event.stopPropagation(); App.showNewLoan('${m.personId}')">
                  🆕 Disburse Loan #${memberLoans.length + 1}
                </button>`
              }
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); App.navigate('member-detail', '${m.personId}')">
                Profile →
              </button>
            </div>
          </div>
        </div>`;
    });

    html += '</div>';
    return html;
  },

  /**
   * Main Members Directory Table View.
   */
  membersTable(members, loans, transactions, filter, photoCache = {}) {
    let filtered = [...members];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.personId.toLowerCase().includes(q) ||
        m.group.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.aadharNumber && m.aadharNumber.includes(q)) ||
        (m.address && m.address.toLowerCase().includes(q))
      );
    }

    if (filter.group && filter.group !== 'all') {
      filtered = filtered.filter(m => m.group === filter.group);
    }

    if (filter.investor && filter.investor !== 'all') {
      filtered = filtered.filter(m => {
        const memberLoans = loans.filter(l => l.personId === m.personId);
        const activeInv = memberLoans[0]?.investor || m.investor || 'Rajesh Varma';
        return activeInv === filter.investor || memberLoans.some(l => (l.investor || 'Rajesh Varma') === filter.investor);
      });
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(m => {
        const memberLoans = loans.filter(l => l.personId === m.personId);
        const activeLoan = memberLoans.find(l => l.status !== 'Completed') || memberLoans[memberLoans.length - 1];
        if (!activeLoan) return filter.status === 'Completed';
        const s = LoanCalculator.getLoanSummary(activeLoan, transactions);
        return s.loanStatus === filter.status;
      });
    }

    if (filtered.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <div class="empty-title">No borrowers found</div>
          <div class="empty-description">
            ${members.length === 0
              ? 'No member records found. Connect to loan_data.xlsx or add a new borrower.'
              : 'Try changing your search term or group filter.'}
          </div>
          ${members.length === 0 ? `<button class="btn btn-primary" onclick="App.showAddMember()">➕ Add First Borrower</button>` : ''}
        </div>`;
    }

    let html = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Borrower / Address</th>
              <th>Group</th>
              <th>Investor</th>
              <th>Loans</th>
              <th>Current Loan</th>
              <th>Weekly</th>
              <th>Repayment Progress</th>
              <th>Status</th>
              <th>Next Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>`;

    filtered.forEach(m => {
      const memberLoans = loans.filter(l => l.personId === m.personId).sort((a, b) => a.loanNumber - b.loanNumber);
      const latestLoan = memberLoans[memberLoans.length - 1] || null;
      const latestSummary = latestLoan ? LoanCalculator.getLoanSummary(latestLoan, transactions) : null;
      const hasActiveLoan = latestLoan && !latestSummary.isCompleted && latestLoan.status !== 'Completed';
      const activeLoan = hasActiveLoan ? latestLoan : null;
      const summary = latestSummary;
      const track = LoanCalculator.getBorrowerTrackRecord(m.personId, loans, transactions);
      const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const photoUrl = photoCache[m.personId] || (typeof ImageHandler !== 'undefined' ? `assets/${ImageHandler.getFolderSafeName(m.personId, m.name)}/photo.jpg` : null);

      const isOverdue = summary && summary.loanStatus === 'Overdue';
      const rowStyle = isOverdue ? 'style="border-left: 3px solid var(--danger);"' : '';

      html += `
        <tr onclick="App.navigate('member-detail', '${m.personId}')" ${rowStyle}>
          <td>
            <div class="table-name-cell">
              <div class="table-avatar ${isOverdue ? 'avatar-overdue' : ''}">
                <img src="${photoUrl || ''}" alt="${m.name}"
                     onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';"
                     onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
                     style="${photoUrl ? '' : 'display:none;'}">
                <span class="table-avatar-fallback" style="${photoUrl ? 'display:none;' : ''}">${initials}</span>
              </div>
              <div>
                <div class="table-name">${m.name} <span class="stars-mini">${track.stars}</span></div>
                <div class="table-sub">${m.personId} · 📞 ${m.phone || 'No phone'}</div>
                ${m.address ? `<div class="table-address">📍 ${m.address.substring(0, 32)}${m.address.length > 32 ? '...' : ''}</div>` : ''}
              </div>
            </div>
          </td>
          <td><span class="badge badge-pending">${m.group || 'General'}</span></td>
          <td>${this.investorBadge(latestLoan?.investor || m.investor || 'Rajesh Varma')}</td>
          <td>
            <span class="loan-count-badge">${memberLoans.length} Loan${memberLoans.length !== 1 ? 's' : ''}</span>
          </td>
          <td style="font-weight: 700; color: var(--text-primary);">
            ${activeLoan ? LoanCalculator.formatCurrency(activeLoan.loanAmount) : '—'}
          </td>
          <td style="font-weight: 600; color: var(--accent);">
            ${activeLoan ? LoanCalculator.formatCurrency(activeLoan.weeklyPayment) : '—'}
          </td>
          <td style="min-width: 170px;">
            ${activeLoan && summary
              ? this.progressBar(summary.percentPaid, LoanCalculator.formatCurrency(summary.totalPaid), `${summary.percentPaid.toFixed(0)}%`)
              : '<span style="color:var(--success); font-size:0.8rem;">✓ Cleared (Ready for new loan)</span>'
            }
          </td>
          <td>${summary ? this.badge(summary.loanStatus) : this.badge('Completed')}</td>
          <td style="font-size: 0.85rem; font-weight: 500;">
            ${activeLoan && summary && summary.nextDueDate ? LoanCalculator.formatDate(summary.nextDueDate) : '—'}
          </td>
          <td>
            ${hasActiveLoan ? `
              <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); App.navigate('member-detail', '${m.personId}')" title="View Profile">
                Profile →
              </button>` : `
              <button class="btn btn-primary btn-sm" style="font-size:0.75rem; padding:4px 8px;" onclick="event.stopPropagation(); App.showNewLoan('${m.personId}')">
                🆕 Loan #${memberLoans.length + 1}
              </button>`
            }
          </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    return html;
  },

  /**
   * Member Form (Add / Edit with Witness & Address details + Optional Initial Loan Disbursal).
   */
  memberForm(member = null, defaultPersonId = '') {
    const isEdit = !!member;
    const m = member || {
      personId: defaultPersonId || (typeof App !== 'undefined' ? LoanCalculator.generatePersonId(App.state.members) : 'P001'),
      name: '', group: 'Group A - Market', phone: '', email: '',
      address: '', aadharNumber: '', chequeNumber: '',
      witnessName: '', witnessPhone: '', witnessAadhar: '', witnessCheque: ''
    };

    const todayStr = LoanCalculator.formatDateISO(new Date());
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayOptions = days.map(d => `<option value="${d}" ${d === 'Monday' ? 'selected' : ''}>${d}</option>`).join('');

    return `
      <form id="member-form" onsubmit="App.handleMemberSubmit(event)">
        <input type="hidden" name="isEdit" value="${isEdit}">
        <input type="hidden" name="originalPersonId" value="${m.personId}">

        <div class="form-section-title">
          <span>👤</span> Personal & KYC Details
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              Person ID (Ledger Key) <span class="required">*</span>
              ${isEdit ? '<span class="badge badge-completed" style="font-size:0.65rem; margin-left:6px;">🔒 Rigid Primary Key</span>' : ''}
            </label>
            <input type="text" name="personId" class="form-input" value="${m.personId}"
                   ${isEdit ? 'readonly style="opacity:0.65; cursor:not-allowed;"' : ''}
                   placeholder="e.g. P001, B-105, or Ledger Page No." required>
            ${!isEdit ? '<span class="field-hint" style="font-size:0.75rem; color:var(--text-muted); margin-top:3px; display:block;">Enter your physical paper ledger/file ID. Permanent & immutable.</span>' : ''}
          </div>
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" name="name" class="form-input" value="${m.name}"
                   placeholder="Borrower's complete name" required autofocus>
          </div>
        </div>

        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Group / Area</label>
            <input type="text" name="group" class="form-input" value="${m.group || 'Group A - Market'}"
                   placeholder="e.g. Group A - Market">
          </div>
          <div class="form-group">
            <label class="form-label">Investor / Capital Source <span class="required">*</span></label>
            <select name="investor" class="form-select" onchange="const el = document.querySelector('select[name=initInvestor]'); if (el) el.value = this.value;">
              <option value="Rajesh Varma" ${(m.investor || 'Rajesh Varma') === 'Rajesh Varma' ? 'selected' : ''}>👑 Rajesh Varma</option>
              <option value="Naresh Patel" ${m.investor === 'Naresh Patel' ? 'selected' : ''}>💼 Naresh Patel</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number <span class="required">*</span></label>
            <input type="text" name="phone" class="form-input" value="${m.phone}"
                   placeholder="10-digit mobile number" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Full Residential / Shop Address <span class="optional">(optional)</span></label>
          <textarea name="address" class="form-input" rows="2"
                    placeholder="Complete address with landmark & pincode">${m.address}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Aadhar Card Number <span class="optional">(optional)</span></label>
            <input type="text" name="aadharNumber" class="form-input" value="${m.aadharNumber}"
                   placeholder="1234 5678 9012">
          </div>
          <div class="form-group">
            <label class="form-label">Security Cheque Number <span class="optional">(optional)</span></label>
            <input type="text" name="chequeNumber" class="form-input" value="${m.chequeNumber}"
                   placeholder="e.g. CHQ-554210">
          </div>
        </div>

        <div class="form-section-title" style="margin-top: 20px;">
          <span>🤝</span> Guarantor / Witness Section <span class="optional" style="font-weight:normal; font-size:0.75rem;">(optional)</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Witness Full Name</label>
            <input type="text" name="witnessName" class="form-input" value="${m.witnessName}"
                   placeholder="e.g. Suresh Kumar (Brother)">
          </div>
          <div class="form-group">
            <label class="form-label">Witness Phone Number</label>
            <input type="text" name="witnessPhone" class="form-input" value="${m.witnessPhone}"
                   placeholder="10-digit phone">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Witness Aadhar Number</label>
            <input type="text" name="witnessAadhar" class="form-input" value="${m.witnessAadhar}"
                   placeholder="Witness Aadhar card number">
          </div>
          <div class="form-group">
            <label class="form-label">Witness Cheque Number</label>
            <input type="text" name="witnessCheque" class="form-input" value="${m.witnessCheque}"
                   placeholder="Witness security cheque">
          </div>
        </div>

        ${!isEdit ? `
        <!-- Initial Loan Setup Section (Only for new borrower creation) -->
        <div class="form-section-title" style="margin-top: 24px; display:flex; justify-content:space-between; align-items:center; background:rgba(99,102,241,0.08); padding:10px 14px; border-radius:var(--radius-md); border:1px solid rgba(99,102,241,0.2);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>💰</span> <strong>Initial Loan Details (Loan #1)</strong>
          </div>
          <label style="font-size:0.82rem; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px; color:var(--accent); margin:0;">
            <input type="checkbox" name="disburseNow" id="check-disburse-now" value="true" checked
                   onchange="document.getElementById('initial-loan-fields').style.display = this.checked ? 'block' : 'none'">
            Disburse Loan Now
          </label>
        </div>

        <div id="initial-loan-fields" style="background:var(--bg-tertiary); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-top:10px;">
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Principal Amount (₹) <span class="required">*</span></label>
              <input type="number" name="initLoanAmount" id="field-principal" class="form-input"
                     value="50000" min="1000" oninput="App.updateLoanPreview()">
            </div>
            <div class="form-group">
              <label class="form-label">Weekly Payment (₹) <span class="required">*</span></label>
              <input type="number" name="initWeeklyPayment" id="field-weekly" class="form-input"
                     value="2750" min="100" oninput="App.updateLoanPreview()">
            </div>
            <div class="form-group">
              <label class="form-label">Duration (Weeks) <span class="required">*</span></label>
              <input type="number" name="initTotalInstallments" id="field-weeks" class="form-input"
                     value="20" min="1" max="104" oninput="App.updateLoanPreview()">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Loan Start Date <span class="required">*</span></label>
              <input type="date" name="initStartDate" class="form-input" value="${todayStr}">
            </div>
            <div class="form-group">
              <label class="form-label">Weekly Payment Day <span class="required">*</span></label>
              <select name="initPaymentDay" class="form-select">
                ${dayOptions}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Funding Investor <span class="required">*</span></label>
              <select name="initInvestor" class="form-select">
                <option value="Rajesh Varma" selected>👑 Rajesh Varma</option>
                <option value="Naresh Patel">💼 Naresh Patel</option>
              </select>
            </div>
          </div>

          <!-- Live Preview Box -->
          <div class="loan-calc-preview" id="loan-calc-preview" style="margin-top:12px;">
            <div class="preview-item">
              <span class="preview-label">Total Receivable</span>
              <span class="preview-val text-accent" id="preview-receivable">₹55,000</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Total Interest Return</span>
              <span class="preview-val text-success" id="preview-interest">₹5,000 (+10.0%)</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Duration</span>
              <span class="preview-val" id="preview-duration">20 Weeks (~5 Months)</span>
            </div>
          </div>
        </div>` : ''}

        <div class="modal-footer" style="margin-top: 24px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            ${isEdit ? `
              <button type="button" class="btn btn-ghost" style="color:var(--danger); border:1px solid rgba(239,68,68,0.3);" onclick="App.deleteMember('${m.personId}')">
                🗑️ Delete Borrower Profile
              </button>` : ''}
          </div>
          <div style="display:flex; gap:10px;">
            <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">
              ${isEdit ? '💾 Update Member Details' : '➕ Save & Disburse Loan'}
            </button>
          </div>
        </div>
      </form>`;
  },

  /**
   * Loan Form (Create New Loan or Edit Existing Loan).
   */
  loanForm(personId, member, loan = null) {
    const isEdit = !!loan;
    const l = loan || {
      loanId: '',
      loanAmount: 50000,
      weeklyPayment: 2750,
      totalInstallments: 20,
      startDate: new Date(),
      paymentDay: 'Monday'
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayOptions = days.map(d =>
      `<option value="${d}" ${l.paymentDay === d ? 'selected' : ''}>${d}</option>`
    ).join('');

    return `
      <form id="loan-form" onsubmit="App.handleLoanSubmit(event)">
        <input type="hidden" name="personId" value="${personId}">
        <input type="hidden" name="isEdit" value="${isEdit}">
        <input type="hidden" name="originalLoanId" value="${l.loanId}">

        <div class="borrower-summary-banner">
          <div class="banner-title">Borrower: ${member.name} (${personId})</div>
          <div class="banner-sub">${member.group} · 📞 ${member.phone}</div>
        </div>

        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Principal Amount (₹) <span class="required">*</span></label>
            <input type="number" name="loanAmount" id="field-principal" class="form-input"
                   value="${l.loanAmount}" placeholder="Type any amount..." required min="1000"
                   oninput="App.updateLoanPreview()">
            <div class="quick-amt-btns" style="margin-top:6px;">
              <button type="button" class="btn-chip" onclick="document.getElementById('field-principal').value = 20000; App.updateLoanPreview();">₹20,000</button>
              <button type="button" class="btn-chip" onclick="document.getElementById('field-principal').value = 50000; App.updateLoanPreview();">₹50,000</button>
              <button type="button" class="btn-chip" onclick="document.getElementById('field-principal').value = 100000; App.updateLoanPreview();">₹1,00,000</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Weekly Payment (₹) <span class="required">*</span></label>
            <input type="number" name="weeklyPayment" id="field-weekly" class="form-input"
                   value="${l.weeklyPayment}" placeholder="Type weekly installment..." required min="100"
                   oninput="App.updateLoanPreview()">
            <div class="quick-amt-btns" style="margin-top:6px;">
              <button type="button" class="btn-chip" onclick="document.getElementById('field-weekly').value = 1100; App.updateLoanPreview();">₹1,100</button>
              <button type="button" class="btn-chip" onclick="document.getElementById('field-weekly').value = 2750; App.updateLoanPreview();">₹2,750</button>
              <button type="button" class="btn-chip" onclick="document.getElementById('field-weekly').value = 5500; App.updateLoanPreview();">₹5,500</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Total Weeks <span class="required">*</span></label>
            <input type="number" name="totalInstallments" id="field-weeks" class="form-input"
                   value="${l.totalInstallments}" placeholder="20" required min="1" max="104"
                   oninput="App.updateLoanPreview()">
            <div class="quick-amt-btns" style="margin-top:6px;">
              <button type="button" class="btn-chip" onclick="document.getElementById('field-weeks').value = 10; App.updateLoanPreview();">10 Wks</button>
              <button type="button" class="btn-chip" onclick="document.getElementById('field-weeks').value = 20; App.updateLoanPreview();">20 Wks</button>
              <button type="button" class="btn-chip" onclick="document.getElementById('field-weeks').value = 25; App.updateLoanPreview();">25 Wks</button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Loan Start Date <span class="required">*</span></label>
            <input type="date" name="startDate" class="form-input"
                   value="${LoanCalculator.formatDateISO(l.startDate)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Weekly Payment Day <span class="required">*</span></label>
            <select name="paymentDay" class="form-select" required>
              ${dayOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Investor / Capital Source <span class="required">*</span></label>
            <select name="investor" class="form-select" required>
              <option value="Rajesh Varma" ${(l.investor || (member && member.investor) || 'Rajesh Varma') === 'Rajesh Varma' ? 'selected' : ''}>👑 Rajesh Varma</option>
              <option value="Naresh Patel" ${(l.investor || (member && member.investor)) === 'Naresh Patel' ? 'selected' : ''}>💼 Naresh Patel</option>
            </select>
          </div>
        </div>

        <!-- Live Calculation Preview -->
        <div class="loan-calc-preview" id="loan-calc-preview">
          <div class="preview-item">
            <span class="preview-label">Total Receivable</span>
            <span class="preview-val text-accent" id="preview-receivable">${LoanCalculator.formatCurrency(l.weeklyPayment * l.totalInstallments)}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Interest Earned</span>
            <span class="preview-val text-success" id="preview-interest">${LoanCalculator.formatCurrency(Math.max(0, (l.weeklyPayment * l.totalInstallments) - l.loanAmount))}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Duration</span>
            <span class="preview-val" id="preview-duration">${l.totalInstallments} Weeks (~${Math.round(l.totalInstallments / 4.3)} Months)</span>
          </div>
        </div>

        <div class="modal-footer" style="margin-top: 24px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            ${isEdit ? `
              <button type="button" class="btn btn-ghost" style="color:var(--danger); border:1px solid rgba(239,68,68,0.3); font-size:0.8rem;" onclick="App.deleteLoan('${l.loanId}')">
                🗑️ Delete Loan
              </button>
              <button type="button" class="btn btn-secondary" style="color:var(--warning); border-color:rgba(245,158,11,0.4); font-size:0.8rem; margin-left:6px;" onclick="App.settleLoan('${l.loanId}')">
                🛑 Settle / Close Early
              </button>` : ''}
          </div>
          <div style="display:flex; gap:10px;">
            <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">
              ${isEdit ? '💾 Save Loan Changes' : '🆕 Disburse New Loan'}
            </button>
          </div>
        </div>
      </form>`;
  },

  /**
   * Payment Entry & Receipt Modal (Records exact payment date, amount, mode, notes).
   */
  paymentModal(loan, member, weekNumber, transactions) {
    const summary = LoanCalculator.getLoanSummary(loan, transactions);
    const inst = summary.installments.find(i => i.weekNumber === weekNumber) || {
      weekNumber,
      dueDate: new Date(),
      amountDue: loan.weeklyPayment,
      amountPaid: 0,
      status: 'pending',
      daysLate: 0,
      paymentMode: 'Cash',
      notes: ''
    };

    const isAlreadyPaid = inst.amountPaid && inst.amountPaid > 0;
    const defaultPaidDate = inst.paidDate ? LoanCalculator.formatDateISO(inst.paidDate) : LoanCalculator.formatDateISO(new Date());

    return `
      <form id="payment-record-form" onsubmit="App.handlePaymentSubmit(event)">
        <input type="hidden" name="loanId" value="${loan.loanId}">
        <input type="hidden" name="personId" value="${member.personId}">
        <input type="hidden" name="weekNumber" value="${weekNumber}">

        <div class="payment-info-box">
          <div class="info-col">
            <span class="info-lbl">Borrower</span>
            <span class="info-val">${member.name}</span>
          </div>
          <div class="info-col">
            <span class="info-lbl">Installment</span>
            <span class="info-val text-accent">Week ${weekNumber}</span>
          </div>
          <div class="info-col">
            <span class="info-lbl">Scheduled Due Date</span>
            <span class="info-val">${LoanCalculator.formatDate(inst.dueDate)}</span>
          </div>
          <div class="info-col">
            <span class="info-lbl">Expected Amount</span>
            <span class="info-val text-accent">${LoanCalculator.formatCurrency(inst.amountDue)}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Payment Date (Date Money Was Paid) <span class="required">*</span></label>
            <input type="date" name="paidDate" class="form-input" value="${defaultPaidDate}" required>
            <span class="field-hint">Feeds the exact date to track on-time vs late payment</span>
          </div>
          <div class="form-group">
            <label class="form-label">Amount Paid (₹) <span class="required">*</span></label>
            <input type="number" name="amountPaid" id="payment-amount-input" class="form-input"
                   value="${isAlreadyPaid ? inst.amountPaid : inst.amountDue}" required min="0">
            <div class="quick-amt-btns">
              <button type="button" class="btn-chip" onclick="document.getElementById('payment-amount-input').value = ${inst.amountDue}">
                Full (${LoanCalculator.formatCurrency(inst.amountDue)})
              </button>
              <button type="button" class="btn-chip" onclick="document.getElementById('payment-amount-input').value = ${Math.round(inst.amountDue / 2)}">
                Half (${LoanCalculator.formatCurrency(Math.round(inst.amountDue / 2))})
              </button>
              <button type="button" class="btn-chip" style="color:var(--danger); border-color:rgba(239,68,68,0.4);" onclick="document.getElementById('payment-amount-input').value = 0; document.getElementById('payment-notes-input').value = 'Missed / Unpaid — Promised payment on next visit';">
                🔴 Missed (₹0)
              </button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select name="paymentMode" class="form-select">
              <option value="Cash" ${inst.paymentMode === 'Cash' ? 'selected' : ''}>💵 Cash</option>
              <option value="UPI" ${inst.paymentMode === 'UPI' ? 'selected' : ''}>📱 UPI (GooglePay / PhonePe / Paytm)</option>
              <option value="Cheque" ${inst.paymentMode === 'Cheque' ? 'selected' : ''}>📄 Cheque</option>
              <option value="Bank Transfer" ${inst.paymentMode === 'Bank Transfer' ? 'selected' : ''}>🏦 Bank Transfer (IMPS/NEFT)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Receipt / Reference No.</label>
            <input type="text" name="receiptNo" class="form-input"
                   value="${inst.receiptNo || LoanCalculator.generateReceiptNo()}" placeholder="RCP-1001">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Notes / Remarks <span class="optional">(optional)</span></label>
          <input type="text" name="notes" id="payment-notes-input" class="form-input" value="${inst.notes || ''}"
                 placeholder="e.g. Paid in full on time / Promised remaining balance next week">
        </div>

        <div class="modal-footer">
          ${isAlreadyPaid ? `<button type="button" class="btn btn-ghost" onclick="App.deletePayment('${loan.loanId}', ${weekNumber})">🗑 Clear Payment</button>` : ''}
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">
            💰 Record & Sync Payment
          </button>
        </div>
      </form>`;
  },

  /**
   * Loan History Cards on Member Detail Page.
   */
  loanHistoryCards(memberLoans, transactions) {
    if (!memberLoans || memberLoans.length === 0) {
      return `
        <div class="empty-state" style="padding: 24px;">
          <div class="empty-icon">📋</div>
          <div class="empty-title">No loans on record</div>
          <div class="empty-description">Create the first loan for this member above.</div>
        </div>`;
    }

    let html = '';
    const allCompleted = memberLoans.every(l => {
      const s = LoanCalculator.getLoanSummary(l, transactions);
      return s.isCompleted || l.status === 'Completed';
    });

    if (allCompleted && memberLoans.length > 0) {
      const nextNum = memberLoans.length + 1;
      html += `
        <div class="card mb-3" style="background:linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.08) 100%); border:1px solid rgba(16,185,129,0.35); padding:16px 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h4 style="margin:0; color:var(--success); font-size:1.05rem;">🎉 All Previous Loans Completed & Cleared (₹0 Balance)!</h4>
              <p style="margin:4px 0 0 0; font-size:0.85rem; color:var(--text-secondary);">
                This borrower has an excellent track record and is eligible for their next loan.
              </p>
            </div>
            <button class="btn btn-primary" style="background:linear-gradient(135deg, #10b981, #059669); border:none;" onclick="App.showNewLoan('${memberLoans[0].personId}')">
              🆕 Disburse Loan #${nextNum} Now →
            </button>
          </div>
        </div>`;
    }

    memberLoans.sort((a, b) => b.loanNumber - a.loanNumber).forEach(loan => {
      const summary = LoanCalculator.getLoanSummary(loan, transactions);
      const isActive = !summary.isCompleted;
      const borderClass = isActive
        ? (summary.loanStatus === 'Overdue' ? 'border-overdue' : 'border-active')
        : 'border-completed';

      html += `
        <div class="card mb-3 loan-history-card ${borderClass}">
          <div class="card-header">
            <div>
              <div class="loan-card-badge-row">
                <span class="loan-num-pill">Loan #${loan.loanNumber}</span>
                <span class="loan-id-pill">${loan.loanId}</span>
                ${this.investorBadge(loan.investor || 'Rajesh Varma')}
                ${this.badge(summary.loanStatus)}
              </div>
              <p class="card-subtitle" style="margin-top: 6px;">
                📅 Disbursed: ${LoanCalculator.formatDate(loan.startDate)} · ${loan.paymentDay}s · ${loan.totalInstallments} Weekly Installments
              </p>
            </div>
            <div class="card-actions" style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" onclick="App.printPassbook('${loan.loanId}')" title="Print Loan Statement">
                🖨 Statement
              </button>
              <button class="btn btn-ghost btn-sm" onclick="App.showEditLoan('${loan.loanId}')" title="Edit Loan Terms">
                ✏️ Edit Terms
              </button>
              ${isActive ? `
                <button class="btn btn-ghost btn-sm" style="color:var(--warning); border:1px solid rgba(245,158,11,0.35);" onclick="App.settleLoan('${loan.loanId}')" title="Settle / Close Loan Early">
                  🛑 Settle Early
                </button>` : ''
              }
              <button class="btn btn-ghost btn-sm" style="color:var(--danger); border:1px solid rgba(239,68,68,0.3);" onclick="App.deleteLoan('${loan.loanId}')" title="Delete This Loan Record">
                🗑️ Delete
              </button>
            </div>
          </div>

          <div class="summary-grid" style="margin-bottom: 16px;">
            <div class="summary-item">
              <div class="label">Principal Disbursed</div>
              <div class="value">${LoanCalculator.formatCurrency(loan.loanAmount)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Weekly Payment</div>
              <div class="value text-accent">${LoanCalculator.formatCurrency(loan.weeklyPayment)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Receivable</div>
              <div class="value">${LoanCalculator.formatCurrency(summary.totalExpected)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Collected</div>
              <div class="value text-success">${LoanCalculator.formatCurrency(summary.totalPaid)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Remaining Balance</div>
              <div class="value ${summary.totalRemaining > 0 ? 'text-danger' : 'text-success'}">
                ${LoanCalculator.formatCurrency(summary.totalRemaining)}
              </div>
            </div>
            <div class="summary-item">
              <div class="label">Interest / Profit</div>
              <div class="value text-accent">${LoanCalculator.formatCurrency(summary.interestEarned)}</div>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            ${this.progressBar(
              summary.percentPaid,
              `Collected: ${LoanCalculator.formatCurrency(summary.totalPaid)} (${summary.paidCount}/${loan.totalInstallments} weeks)`,
              `Balance: ${LoanCalculator.formatCurrency(summary.totalRemaining)}`
            )}
          </div>

          <div class="timeline-section-header">
            <h4 class="timeline-title">📅 Payment Timeline & Schedule</h4>
            <div class="timeline-legend">
              <span class="legend-item"><span class="legend-dot dot-paid"></span> Paid on time</span>
              <span class="legend-item"><span class="legend-dot dot-late"></span> Paid late</span>
              <span class="legend-item"><span class="legend-dot dot-missed"></span> Missed</span>
              <span class="legend-item"><span class="legend-dot dot-pending"></span> Pending</span>
            </div>
          </div>

          ${this.paymentGrid(loan, transactions, summary.isCompleted)}
        </div>`;
    });

    return html;
  },

  /**
   * Settle Early / Foreclosure Modal.
   */
  settleModal(loan, member, summary) {
    const todayStr = LoanCalculator.formatDateISO(new Date());
    const remainingBalance = summary.totalRemaining;
    const unpaidCount = summary.installmentsLeft;

    return `
      <form id="settle-form" onsubmit="App.handleSettleSubmit(event)">
        <input type="hidden" name="loanId" value="${loan.loanId}">
        <input type="hidden" name="personId" value="${member.personId}">

        <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:14px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:var(--warning); font-size:1rem;">🛑 Early Foreclosure & Full Settlement</strong>
              <div style="color:var(--text-secondary); font-size:0.85rem; margin-top:2px;">
                ${member.name} (${member.personId}) · Loan #${loan.loanNumber} (${loan.loanId})
              </div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Remaining Debt</span>
              <strong style="color:var(--danger); font-size:1.25rem;">${LoanCalculator.formatCurrency(remainingBalance)}</strong>
            </div>
          </div>
        </div>

        <div class="metrics-grid" style="grid-template-columns:repeat(3, 1fr); margin-bottom:16px;">
          <div class="metric-card" style="padding:10px;">
            <div class="metric-label" style="font-size:0.7rem;">Principal Disbursed</div>
            <div class="metric-value" style="font-size:1.1rem;">${LoanCalculator.formatCurrency(loan.loanAmount)}</div>
          </div>
          <div class="metric-card" style="padding:10px;">
            <div class="metric-label" style="font-size:0.7rem;">Already Collected</div>
            <div class="metric-value" style="font-size:1.1rem; color:var(--success);">${LoanCalculator.formatCurrency(summary.totalPaid)}</div>
          </div>
          <div class="metric-card" style="padding:10px;">
            <div class="metric-label" style="font-size:0.7rem;">Unpaid Weeks Left</div>
            <div class="metric-value" style="font-size:1.1rem; color:var(--warning);">${unpaidCount} / ${loan.totalInstallments} Wks</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Settlement Lump-Sum Collected (₹) <span class="required">*</span></label>
            <input type="number" name="settlementAmount" class="form-input" value="${remainingBalance}" min="0" step="1" required>
            <span class="field-hint" style="font-size:0.75rem; color:var(--text-muted);">Amount paid to clear and close the loan today.</span>
          </div>
          <div class="form-group">
            <label class="form-label">Settlement Date <span class="required">*</span></label>
            <input type="date" name="settlementDate" class="form-input" value="${todayStr}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Payment Mode</label>
            <select name="paymentMode" class="form-select">
              <option value="Cash" selected>💵 Cash</option>
              <option value="UPI">📱 UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="Bank Transfer">🏦 Bank Transfer</option>
              <option value="Cheque">📜 Cheque</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Settlement Notes / Reason</label>
            <input type="text" name="notes" class="form-input" value="Full and final early settlement" placeholder="e.g. Paid in full early">
          </div>
        </div>

        <div class="form-actions" style="margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background:linear-gradient(135deg, #f59e0b, #d97706); border:none;">
            ✅ Complete Settlement & Close Loan
          </button>
        </div>
      </form>`;
  },

  /**
   * Modal wrapper.
   */
  showModal(title, content, wide = false) {
    const container = document.getElementById('modal-container');
    if (!container) return;
    container.innerHTML = `
      <div class="modal-backdrop" onclick="App.closeModal(event)">
        <div class="modal ${wide ? 'modal-wide' : ''}" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" onclick="App.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      </div>`;
  },

  closeModal() {
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
  },

  showLightbox(imageUrl) {
    const container = document.getElementById('modal-container');
    if (!container) return;
    container.innerHTML = `
      <div class="lightbox" onclick="App.closeModal()">
        <img src="${imageUrl}" alt="Document preview">
      </div>`;
  },

  getGroups(members) {
    const groups = new Set();
    members.forEach(m => {
      if (m.group) groups.add(m.group);
    });
    return Array.from(groups).sort();
  }
};
