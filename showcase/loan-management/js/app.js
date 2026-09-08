/* ========================================
   App — Master Controller for Lamba Enterprises Loan Management
   Real-time offline state, live Excel sync, multi-loan tracking & print engine
   ======================================== */

const App = {

  state: {
    currentPage: 'dashboard',
    borrowerViewMode: 'grid', // 'grid' (big photo cards) or 'table'
    photoCache: {},
    members: [],
    loans: [],
    transactions: [],
    settings: {
      companyName: 'Lamba Enterprises',
      ownerName: 'Lamba',
      currency: '₹',
      version: '2.0 Professional',
      autoSync: true
    },
    filters: {
      search: '',
      group: 'all',
      status: 'all',
      investor: 'all'
    },
    selectedPersonId: null,
    isDataLoaded: false,
    isLiveSynced: false,
    syncedFileName: 'loan_data.xlsx',
    lastSavedTime: null
  },

  // ──── Initialization ────
  async init() {
    try {
      await ImageHandler.init();
    } catch (e) {
      console.warn('ImageHandler init warning:', e);
    }

    // 1. Load persisted state from LocalStorage & IndexedDB
    await this.loadInitialState();

    // 2. Try to restore FileSystem Directory Handle from IndexedDB across page reloads
    await this.tryRestoreFolderSync();

    this.setupNavigation();
    this.setupFileHandlers();

    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('focus', () => {
      if ((ExcelHandler.dirHandle || ExcelHandler.fileHandle) && App.state.isLiveSynced) {
        App.refreshFromExcelQuietly();
      }
    });
    this.handleHashChange();
  },

  async loadInitialState() {
    // Priority 1: Check localStorage for master database V4
    try {
      const saved = localStorage.getItem('LAMBA_LOAN_MASTER_V4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.members) && parsed.members.length > 0) {
          this.state.members = parsed.members;
          this.state.loans = (parsed.loans || []).map(l => ({ ...l, startDate: new Date(l.startDate) }));
          this.state.transactions = parsed.transactions || [];
          this.state.settings = { ...this.state.settings, ...(parsed.settings || {}) };
          this.state.isDataLoaded = true;
          this.initPhotoCache();
          console.log(`✓ Loaded user database from LAMBA_LOAN_MASTER_V4 (${this.state.members.length} members)`);
          return;
        }
      }
    } catch (err) {
      console.warn('LocalStorage read error for LAMBA_LOAN_MASTER_V4:', err);
    }

    // Priority 2: Check IndexedDB (only if already clean V4 / contains D001)
    try {
      const idbData = await ImageHandler.getAppState();
      if (idbData && Array.isArray(idbData.members) && idbData.members.length > 0 && idbData.members.some(m => m.personId === 'D001')) {
        this.state.members = idbData.members;
        this.state.loans = (idbData.loans || []).map(l => ({ ...l, startDate: new Date(l.startDate) }));
        this.state.transactions = idbData.transactions || [];
        this.state.settings = { ...this.state.settings, ...(idbData.settings || {}) };
        this.state.isDataLoaded = true;
        this.persistLocalState();
        this.initPhotoCache();
        console.log(`✓ Loaded user database from IndexedDB (${this.state.members.length} members)`);
        return;
      }
    } catch (e) {
      console.warn('IndexedDB app state read error:', e);
    }

    // Priority 3 (Clean install / Fresh initialization): Load fresh DEFAULT_DATABASE (D001 only)
    if (typeof DEFAULT_DATABASE !== 'undefined') {
      this.state.members = JSON.parse(JSON.stringify(DEFAULT_DATABASE.members));
      this.state.loans = DEFAULT_DATABASE.loans.map(l => ({ ...l, startDate: new Date(l.startDate) }));
      this.state.transactions = JSON.parse(JSON.stringify(DEFAULT_DATABASE.transactions));
      this.state.settings = JSON.parse(JSON.stringify(DEFAULT_DATABASE.settings));
      this.state.isDataLoaded = true;
      this.persistLocalState();
      this.initPhotoCache();
      console.log(`✓ Initialized fresh clean demo database (1 member: D001)`);
    }
  },

  initPhotoCache() {
    if (!this.state.photoCache) this.state.photoCache = {};
    if (this.state.members && typeof ImageHandler !== 'undefined') {
      for (const m of this.state.members) {
        if (!this.state.photoCache[m.personId]) {
          const folder = ImageHandler.getFolderSafeName(m.personId, m.name);
          this.state.photoCache[m.personId] = `assets/${folder}/photo.jpg`;
        }
      }
    }
  },

  persistLocalState() {
    try {
      const db = {
        members: this.state.members,
        loans: this.state.loans,
        transactions: this.state.transactions,
        settings: this.state.settings,
        savedAt: new Date().toISOString()
      };
      // 1. Synchronous localStorage save
      localStorage.setItem('LAMBA_LOAN_MASTER_V4', JSON.stringify(db));

      // 2. Asynchronous IndexedDB vault save
      if (typeof ImageHandler !== 'undefined') {
        ImageHandler.saveAppState(db);
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  async tryRestoreFolderSync() {
    if (typeof ExcelHandler === 'undefined') return;
    try {
      const data = await ExcelHandler.restoreStoredDirectoryHandle();
      if (ExcelHandler.dirHandle) {
        this.state.isLiveSynced = true;
        this.state.syncedFileName = 'Project Folder + loan_data.xlsx';
        if (data && data.members && data.members.length > 0) {
          this.state.members = data.members;
          this.state.loans = data.loans;
          this.state.transactions = data.transactions;
          this.state.settings = { ...this.state.settings, ...data.settings };
          this.persistLocalState();
        }
        await this.refreshMemberPhotos();
        console.log('✓ Re-established live folder auto-sync across page reload!');
      }
    } catch (err) {
      console.warn('tryRestoreFolderSync warning:', err);
    }
  },

  setupNavigation() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        if (page) this.navigate(page);
      });
    });
  },

  setupFileHandlers() {
    const fi = document.getElementById('excel-file-input');
    if (fi) fi.addEventListener('change', (e) => this.handleExcelFileInput(e));

    const bi = document.getElementById('backup-file-input');
    if (bi) bi.addEventListener('change', (e) => this.handleBackupZipInput(e));
  },

  // ──── Navigation ────
  navigate(page, param = null) {
    this.state.currentPage = page;
    this.state.selectedPersonId = param;
    window.location.hash = param ? `${page}/${param}` : page;
    this.render();
  },

  handleHashChange() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const parts = hash.split('/');
    this.state.currentPage = parts[0] || 'dashboard';
    this.state.selectedPersonId = parts[1] || null;
    this.render();
  },

  // ──── Render Router ────
  render() {
    // Update sidebar navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      const itemPage = item.getAttribute('data-page');
      if (itemPage === this.state.currentPage) item.classList.add('active');
      if (this.state.currentPage === 'member-detail' && itemPage === 'borrowers') item.classList.add('active');
    });

    // Update bottom status widget
    const statusDot = document.querySelector('.data-status-dot');
    const statusText = document.querySelector('.data-status-text');
    if (statusDot && statusText) {
      statusDot.classList.add('loaded');
      statusText.textContent = `${this.state.members.length} Borrowers · ${this.state.loans.length} Loans`;
    }

    // Top Sync Indicator
    const syncIndicator = document.getElementById('live-sync-indicator');
    if (syncIndicator) {
      if (this.state.isLiveSynced) {
        syncIndicator.className = 'sync-badge sync-active';
        syncIndicator.innerHTML = `<span class="pulse-dot"></span> Live-Synced (${this.state.syncedFileName})`;
      } else {
        syncIndicator.className = 'sync-badge sync-offline';
        syncIndicator.innerHTML = `<span class="pulse-dot-gray"></span> Offline Storage Active`;
      }
    }

    const container = document.getElementById('page-container');
    const topBar = document.getElementById('top-bar-content');

    switch (this.state.currentPage) {
      case 'dashboard':
        this.renderDashboard(container, topBar);
        break;
      case 'borrowers':
        this.renderBorrowers(container, topBar);
        break;
      case 'member-detail':
        this.renderMemberDetail(container, topBar);
        break;
      case 'payments':
        this.renderPayments(container, topBar);
        break;
      case 'settings':
        this.renderSettings(container, topBar);
        break;
      default:
        this.renderDashboard(container, topBar);
    }
  },

  setInvestorFilter(investorName) {
    this.state.filters.investor = investorName;
    this.render();
  },

  // ──── Page: Dashboard ────
  renderDashboard(container, topBar) {
    const stats = LoanCalculator.getDashboardStats(this.state.members, this.state.loans, this.state.transactions, this.state.filters.investor);
    const dueToday = LoanCalculator.getDueToday(this.state.members, this.state.loans, this.state.transactions, this.state.filters.investor);
    const compData = LoanCalculator.getInvestorComparison(this.state.members, this.state.loans, this.state.transactions, this.state.settings.investors || ['Rameshwar Lamba', 'Naresh Patel']);

    const isFiltered = this.state.filters.investor && this.state.filters.investor !== 'all';

    topBar.innerHTML = `
      <div class="top-bar-left">
        <h2 class="page-title">Dashboard Overview</h2>
        <span class="breadcrumb">${this.state.settings.companyName} · ${isFiltered ? 'Filtered: ' + this.state.filters.investor : 'Complete Portfolio'}</span>
      </div>
      <div class="top-bar-actions">
        <div class="topbar-investor-selector">
          <span>💼 Investor:</span>
          <select class="topbar-investor-select" onchange="App.setInvestorFilter(this.value)">
            <option value="all" ${this.state.filters.investor === 'all' ? 'selected' : ''}>All Investors</option>
            <option value="Rameshwar Lamba" ${this.state.filters.investor === 'Rameshwar Lamba' ? 'selected' : ''}>👑 Rameshwar Lamba</option>
            <option value="Naresh Patel" ${this.state.filters.investor === 'Naresh Patel' ? 'selected' : ''}>💼 Naresh Patel</option>
          </select>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.connectLocalExcel()" title="Connect direct to loan_data.xlsx for auto-saving">
          ⚡ Connect Local Excel
        </button>
        <button class="btn btn-primary btn-sm" onclick="App.saveExcel()" title="Save / Download loan_data.xlsx">
          💾 Save Excel
        </button>
      </div>`;

    let html = `
      <!-- Partner Capital Comparison Widget -->
      ${UI.investorComparisonWidget(compData, this.state.filters.investor)}

      <!-- Top Metric Cards -->
      <div class="stats-grid">
        ${UI.statCard('👥', stats.totalMembers, isFiltered ? `${this.state.filters.investor}'s Borrowers` : 'Total Borrowers', '#6366f1', `${stats.totalLoans} loan accounts`)}
        ${UI.statCard('💰', LoanCalculator.formatCurrency(stats.totalDisbursed), isFiltered ? `${this.state.filters.investor}'s Principal` : 'Total Disbursed', '#f59e0b', 'Deployed capital')}
        ${UI.statCard('📥', LoanCalculator.formatCurrency(stats.totalCollected), 'Total Collected', '#10b981', `${stats.recoveryRate.toFixed(1)}% recovery`)}
        ${UI.statCard('📊', LoanCalculator.formatCurrency(stats.totalRemaining), 'Balance Left', '#ef4444', 'To collect')}
      </div>

      <div class="stats-grid">
        ${UI.statCard('💎', LoanCalculator.formatCurrency(stats.totalInterest), 'Interest / Profit', '#10b981', 'Bake-in return')}
        ${UI.statCard('🟢', stats.activeLoansCount, 'Active Loans', '#6366f1', 'Currently paying')}
        ${UI.statCard('⚠', stats.overdueLoansCount, 'Overdue Loans', '#ef4444', LoanCalculator.formatCurrency(stats.totalOverdue))}
        ${UI.statCard('✅', stats.completedLoansCount, 'Completed Loans', '#8b5cf6', 'Fully closed')}
      </div>

      <!-- Recovery Progress -->
      <div class="card mb-3">
        <div class="card-header">
          <div>
            <h3 class="card-title">Overall Portfolio Collection Progress</h3>
            <p class="card-subtitle">Total recovered: ${LoanCalculator.formatCurrency(stats.totalCollected)} of ${LoanCalculator.formatCurrency(stats.totalReceivable)} receivable</p>
          </div>
          <span class="pct-pill">${stats.recoveryRate.toFixed(1)}%</span>
        </div>
        ${UI.progressBar(stats.recoveryRate, `${LoanCalculator.formatCurrency(stats.totalCollected)} collected`, `${LoanCalculator.formatCurrency(stats.totalRemaining)} pending`)}
      </div>

      <div class="dashboard-split-grid">
        <!-- Today's / Overdue Collections -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">📅 Today & Overdue Collections</h3>
              <p class="card-subtitle">${dueToday.length} collection${dueToday.length !== 1 ? 's' : ''} actionable</p>
            </div>
          </div>
          <div class="due-list">`;

    if (dueToday.length === 0) {
      html += `
        <div class="empty-state" style="padding: 28px;">
          <div class="empty-icon">🎉</div>
          <div class="empty-title">All caught up!</div>
          <div class="empty-description">No pending installments due today.</div>
        </div>`;
    } else {
      dueToday.forEach(item => {
        const nextWk = item.nextInstallment ? item.nextInstallment.weekNumber : 1;
        html += `
          <div class="due-item-row" onclick="App.openPaymentModal('${item.loan.loanId}', ${nextWk})">
            <div class="due-left">
              <div class="table-avatar ${item.isOverdue ? 'avatar-overdue' : ''}">
                ${item.member.name.charAt(0)}
              </div>
              <div>
                <div class="due-name">${item.member.name}</div>
                <div class="due-sub">${item.member.group} · W${nextWk} · ${item.isOverdue ? '🔴 Overdue' : '🟢 Due Today'}</div>
              </div>
            </div>
            <div class="due-right">
              <div class="due-amount">${LoanCalculator.formatCurrency(item.loan.weeklyPayment)}</div>
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); App.openPaymentModal('${item.loan.loanId}', ${nextWk})">
                Collect
              </button>
            </div>
          </div>`;
      });
    }

    html += `
          </div>
        </div>

        <!-- Groups Portfolio Summary -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🏢 Groups & Areas</h3>
              <p class="card-subtitle">Portfolio breakdown by group</p>
            </div>
          </div>
          <div class="due-list">`;

    Object.entries(stats.groupStats).sort((a, b) => a[0].localeCompare(b[0])).forEach(([grpName, gs]) => {
      const recPct = gs.disbursed > 0 ? (gs.collected / (gs.disbursed + (gs.disbursed * 0.1)) * 100) : 0;
      html += `
        <div class="due-item-row" onclick="App.state.filters.group = '${grpName}'; App.navigate('borrowers');">
          <div class="due-left">
            <div class="table-avatar" style="background: rgba(245,158,11,0.15); color: var(--accent);">
              ${grpName.charAt(0)}
            </div>
            <div>
              <div class="due-name">${grpName}</div>
              <div class="due-sub">${gs.memberIds.size} borrowers · ${gs.active} active · ${gs.completed} completed</div>
            </div>
          </div>
          <div class="due-right" style="text-align: right;">
            <div class="due-amount">${LoanCalculator.formatCurrency(gs.collected)}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">of ${LoanCalculator.formatCurrency(gs.disbursed)}</div>
          </div>
        </div>`;
    });

    html += `
          </div>
        </div>
      </div>`;

    container.innerHTML = html;
  },

  // ──── Page: Borrowers Directory ────
  async renderBorrowers(container, topBar) {
    const groups = UI.getGroups(this.state.members);
    const groupOpts = groups.map(g =>
      `<option value="${g}" ${this.state.filters.group === g ? 'selected' : ''}>${g}</option>`
    ).join('');

    const isGrid = this.state.borrowerViewMode === 'grid';

    topBar.innerHTML = `
      <div class="top-bar-left">
        <h2 class="page-title">Borrower Directory</h2>
        <span class="breadcrumb">${this.state.members.length} registered members</span>
      </div>
      <div class="top-bar-actions">
        <div class="view-toggle-group">
          <button class="btn btn-sm ${isGrid ? 'btn-primary' : 'btn-secondary'}" onclick="App.toggleBorrowerView('grid')" title="Cards Grid with Large Photos">
            🗂️ Cards View
          </button>
          <button class="btn btn-sm ${!isGrid ? 'btn-primary' : 'btn-secondary'}" onclick="App.toggleBorrowerView('table')" title="Compact Table View">
            📋 Table View
          </button>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.saveExcel()" title="Save directly to loan_data.xlsx on disk">
          💾 Save Excel
        </button>
        <button class="btn btn-primary btn-sm" onclick="App.showAddMember()">
          ➕ Add New Borrower
        </button>
      </div>`;

    container.innerHTML = `
      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search by name, ID, phone, aadhar, or address..."
                 value="${this.state.filters.search}"
                 oninput="App.state.filters.search = this.value; App.renderMembersDisplay();">
        </div>
        <select class="form-select filter-select" onchange="App.state.filters.group = this.value; App.renderMembersDisplay();">
          <option value="all">All Groups</option>
          ${groupOpts}
        </select>
        <select class="form-select filter-select" onchange="App.state.filters.investor = this.value; App.renderMembersDisplay();">
          <option value="all" ${this.state.filters.investor === 'all' ? 'selected' : ''}>All Investors</option>
          <option value="Rameshwar Lamba" ${this.state.filters.investor === 'Rameshwar Lamba' ? 'selected' : ''}>👑 Rameshwar Lamba</option>
          <option value="Naresh Patel" ${this.state.filters.investor === 'Naresh Patel' ? 'selected' : ''}>💼 Naresh Patel</option>
        </select>
        <select class="form-select filter-select" onchange="App.state.filters.status = this.value; App.renderMembersDisplay();">
          <option value="all" ${this.state.filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="Active" ${this.state.filters.status === 'Active' ? 'selected' : ''}>Active Loans</option>
          <option value="Overdue" ${this.state.filters.status === 'Overdue' ? 'selected' : ''}>🔴 Overdue</option>
          <option value="Completed" ${this.state.filters.status === 'Completed' ? 'selected' : ''}>✅ Completed All</option>
        </select>
      </div>
      <div id="members-display-container">
        ${isGrid
          ? UI.memberCardsGrid(this.state.members, this.state.loans, this.state.transactions, this.state.filters, this.state.photoCache)
          : UI.membersTable(this.state.members, this.state.loans, this.state.transactions, this.state.filters, this.state.photoCache)
        }
      </div>`;

    // Fetch and sync photos from IndexedDB
    this.refreshMemberPhotos();
  },

  async refreshMemberPhotos() {
    let updated = false;
    for (const m of this.state.members) {
      try {
        const url = await ImageHandler.getImageURL(m.personId, 'photo', m.name);
        if (url && this.state.photoCache[m.personId] !== url) {
          this.state.photoCache[m.personId] = url;
          updated = true;
        }
      } catch (e) {
        // ignore
      }
    }
    if (updated) {
      this.renderMembersDisplay();
    }
  },

  toggleBorrowerView(mode) {
    this.state.borrowerViewMode = mode;
    this.render();
  },

  renderMembersDisplay() {
    const el = document.getElementById('members-display-container');
    if (el) {
      const isGrid = this.state.borrowerViewMode === 'grid';
      el.innerHTML = isGrid
        ? UI.memberCardsGrid(this.state.members, this.state.loans, this.state.transactions, this.state.filters, this.state.photoCache)
        : UI.membersTable(this.state.members, this.state.loans, this.state.transactions, this.state.filters, this.state.photoCache);
    }
  },

  async refreshFromExcel() {
    if (ExcelHandler.fileHandle) {
      try {
        const file = await ExcelHandler.fileHandle.getFile();
        const data = await ExcelHandler.parseFile(file);
        this.state.members = data.members;
        this.state.loans = data.loans;
        this.state.transactions = data.transactions;
        this.state.settings = { ...this.state.settings, ...data.settings };
        this.state.isDataLoaded = true;
        this.persistLocalState();
        UI.toast(`Refreshed database from ${ExcelHandler.fileName} ✓`, 'success');
        this.render();
      } catch (err) {
        UI.toast('Refresh error: ' + err.message, 'error');
      }
    } else {
      this.loadInitialState();
      UI.toast('Reloaded from local database ✓', 'info');
      this.render();
    }
  },

  async refreshFromExcelQuietly() {
    if (ExcelHandler.dirHandle || ExcelHandler.fileHandle) {
      try {
        let file;
        if (ExcelHandler.dirHandle) {
          const fh = await ExcelHandler.dirHandle.getFileHandle('loan_data.xlsx', { create: false });
          file = await fh.getFile();
        } else if (ExcelHandler.fileHandle) {
          file = await ExcelHandler.fileHandle.getFile();
        }
        if (file) {
          const data = await ExcelHandler.parseFile(file);
          if (data && data.members && data.members.length > 0) {
            this.state.members = data.members;
            this.state.loans = data.loans;
            this.state.transactions = data.transactions;
            this.state.settings = { ...this.state.settings, ...data.settings };
            this.state.isDataLoaded = true;
            this.persistLocalState();
            this.render();
          }
        }
      } catch (err) {
        // silent fail on blur/focus collision
      }
    }
  },

  // ──── Page: Member Detail Profile ────
  async renderMemberDetail(container, topBar) {
    const personId = this.state.selectedPersonId;
    const member = this.state.members.find(m => m.personId === personId);

    if (!member) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">Borrower not found</div>
          <div class="empty-description">ID "${personId}" does not exist in the database.</div>
          <button class="btn btn-secondary" onclick="App.navigate('borrowers')">← Back to Directory</button>
        </div>`;
      return;
    }

    const memberLoans = this.state.loans.filter(l => l.personId === personId).sort((a, b) => a.loanNumber - b.loanNumber);
    const activeLoan = memberLoans.find(l => {
      const s = LoanCalculator.getLoanSummary(l, this.state.transactions);
      return !s.isCompleted;
    });
    const canCreateNewLoan = !activeLoan;
    const track = LoanCalculator.getBorrowerTrackRecord(personId, this.state.loans, this.state.transactions);

    // Fetch documents
    const imageURLs = {};
    for (const type of ImageHandler.IMAGE_TYPES) {
      try {
        imageURLs[type.key] = await ImageHandler.getImageURL(personId, type.key, member.name);
      } catch (e) {
        imageURLs[type.key] = null;
      }
    }

    const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const photoUrl = imageURLs['photo'] || (typeof ImageHandler !== 'undefined' ? `assets/${ImageHandler.getFolderSafeName(member.personId, member.name)}/photo.jpg` : null);

    topBar.innerHTML = `
      <div class="top-bar-left">
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('borrowers')">← Back</button>
        <h2 class="page-title">${member.name}</h2>
        <span class="breadcrumb">${member.personId} · ${member.group}</span>
      </div>
      <div class="top-bar-actions">
        <button class="btn btn-secondary btn-sm" onclick="App.showEditMember('${personId}')">✏️ Edit Details</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger); border:1px solid rgba(239,68,68,0.35);" onclick="App.deleteMember('${personId}')" title="Permanently Delete Borrower">🗑️ Delete Profile</button>
        ${canCreateNewLoan ? `<button class="btn btn-primary btn-sm" onclick="App.showNewLoan('${personId}')">🆕 Disburse New Loan</button>` : ''}
        ${activeLoan ? `<button class="btn btn-primary btn-sm" onclick="App.openNextPaymentModal('${activeLoan.loanId}')">💰 Record Payment</button>` : ''}
      </div>`;

    container.innerHTML = `
      <!-- Main Profile Banner -->
      <div class="detail-header">
        <div class="detail-avatar ${track.hasOverdue ? 'avatar-overdue' : ''}">
          <img src="${photoUrl || ''}" alt="${member.name}"
               onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';"
               onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
               style="${photoUrl ? '' : 'display:none;'}">
          <div class="avatar-fallback" style="${photoUrl ? 'display:none;' : ''}">${initials}</div>
        </div>
        <div class="detail-info" style="flex: 1;">
          <div class="detail-title-row">
            <h2>${member.name}</h2>
            <div class="badge-group">
              ${activeLoan
                ? UI.badge(LoanCalculator.getLoanSummary(activeLoan, this.state.transactions).loanStatus)
                : UI.badge('Completed')
              }
              <span class="badge badge-pending">📋 Total ${memberLoans.length} Loan${memberLoans.length !== 1 ? 's' : ''} Taken</span>
              <span class="badge badge-active">${track.stars} ${track.ratingLabel}</span>
            </div>
          </div>

          <div class="detail-meta">
            <div class="detail-meta-item"><span class="meta-icon">📋</span> <strong>ID:</strong> ${member.personId}</div>
            <div class="detail-meta-item"><span class="meta-icon">🏢</span> <strong>Group:</strong> ${member.group}</div>
            <div class="detail-meta-item"><span class="meta-icon">💼</span> <strong>Investor:</strong> ${UI.investorBadge(member.investor || activeLoan?.investor || 'Rameshwar Lamba')}</div>
            <div class="detail-meta-item"><span class="meta-icon">📞</span> <strong>Phone:</strong> ${member.phone || '—'}</div>
            ${member.email ? `<div class="detail-meta-item"><span class="meta-icon">📧</span> ${member.email}</div>` : ''}
            <div class="detail-meta-item"><span class="meta-icon">🪪</span> <strong>Aadhar:</strong> ${member.aadharNumber}</div>
            ${member.chequeNumber ? `<div class="detail-meta-item"><span class="meta-icon">📄</span> <strong>Security Cheque:</strong> ${member.chequeNumber}</div>` : ''}
          </div>

          ${member.address ? `
            <div class="detail-address-box">
              <span class="meta-icon">📍</span> <strong>Full Address:</strong> ${member.address}
            </div>` : ''
          }
        </div>
      </div>

      <!-- Witness / Guarantor Box -->
      ${member.witnessName ? `
        <div class="card mb-3 witness-box">
          <div class="card-header">
            <h3 class="card-title" style="font-size: 0.95rem;">🤝 Guarantor / Witness Information</h3>
          </div>
          <div class="detail-meta">
            <div class="detail-meta-item"><span class="meta-icon">👤</span> <strong>Witness:</strong> ${member.witnessName}</div>
            <div class="detail-meta-item"><span class="meta-icon">📞</span> <strong>Phone:</strong> ${member.witnessPhone || '—'}</div>
            <div class="detail-meta-item"><span class="meta-icon">🪪</span> <strong>Aadhar:</strong> ${member.witnessAadhar || '—'}</div>
            ${member.witnessCheque ? `<div class="detail-meta-item"><span class="meta-icon">📄</span> <strong>Cheque:</strong> ${member.witnessCheque}</div>` : ''}
          </div>
        </div>` : ''
      }

      <!-- Multi-Loan History Section -->
      <div class="section-header">
        <h3 class="section-title">
          <span class="section-icon">📊</span> Multi-Loan History (${memberLoans.length} Loan${memberLoans.length !== 1 ? 's' : ''})
        </h3>
        ${canCreateNewLoan
          ? `<button class="btn btn-primary btn-sm" onclick="App.showNewLoan('${personId}')">🆕 Disburse Loan #${memberLoans.length + 1}</button>`
          : `<span class="note-pill">Complete active loan to disburse next loan</span>`
        }
      </div>

      ${UI.loanHistoryCards(memberLoans, this.state.transactions)}

      <!-- Documents & Photos Section -->
      <div class="card mt-3">
        <div class="card-header">
          <div>
            <h3 class="card-title">📎 Document Vault & Photo Attachments</h3>
            <p class="card-subtitle">Stored securely offline (Person photo, Signature, Cheques, Aadhar, Promissory Note)</p>
          </div>
        </div>
        ${UI.imageGallery(personId, imageURLs)}
      </div>`;
  },

  // ──── Page: Payments (Quick Collection) ────
  renderPayments(container, topBar) {
    topBar.innerHTML = `
      <div class="top-bar-left">
        <h2 class="page-title">Quick Payment Collection</h2>
        <span class="breadcrumb">Instant record & automatic Excel sync</span>
      </div>
      <div class="top-bar-actions">
        <button class="btn btn-primary btn-sm" onclick="App.saveExcel()">💾 Save Excel</button>
      </div>`;

    const activeLoans = this.state.loans.filter(l => {
      const s = LoanCalculator.getLoanSummary(l, this.state.transactions);
      if (s.isCompleted) return false;
      if (this.state.filters.investor && this.state.filters.investor !== 'all') {
        return (l.investor || 'Rameshwar Lamba') === this.state.filters.investor;
      }
      return true;
    });

    let html = `
      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search active loans by borrower or group..."
                 id="payment-search-input"
                 oninput="App.filterQuickPayList(this.value)">
        </div>
        <select class="form-select filter-select" onchange="App.state.filters.investor = this.value; App.render();">
          <option value="all" ${this.state.filters.investor === 'all' ? 'selected' : ''}>All Investors</option>
          <option value="Rameshwar Lamba" ${this.state.filters.investor === 'Rameshwar Lamba' ? 'selected' : ''}>👑 Rameshwar Lamba</option>
          <option value="Naresh Patel" ${this.state.filters.investor === 'Naresh Patel' ? 'selected' : ''}>💼 Naresh Patel</option>
        </select>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Active Loan Portfolios</h3>
          <span style="font-size:0.85rem; color:var(--text-muted);">${activeLoans.length} active loans</span>
        </div>
        <div id="quick-pay-list">`;

    activeLoans.forEach(loan => {
      const member = this.state.members.find(m => m.personId === loan.personId);
      if (!member) return;
      const summary = LoanCalculator.getLoanSummary(loan, this.state.transactions);
      const nextUnpaid = summary.installments.find(i => i.status === 'pending' || i.status === 'missed' || i.status === 'partial');
      const nextWeek = nextUnpaid ? nextUnpaid.weekNumber : 1;

      html += `
        <div class="quick-pay-row" data-name="${member.name.toLowerCase()}" data-group="${member.group.toLowerCase()}">
          <div class="pay-name-col">
            <div style="font-weight: 600;">${member.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${loan.loanId} · ${member.group}</div>
          </div>
          <div class="pay-week-pill">Week ${nextWeek}</div>
          <div class="pay-due-amt">${LoanCalculator.formatCurrency(loan.weeklyPayment)}</div>
          <button class="btn btn-primary btn-sm" onclick="App.openPaymentModal('${loan.loanId}', ${nextWeek})">
            💰 Record Payment
          </button>
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('member-detail', '${member.personId}')">
            View Details →
          </button>
        </div>`;
    });

    if (activeLoans.length === 0) {
      html += `
        <div class="empty-state" style="padding: 36px;">
          <div class="empty-icon">🎉</div>
          <div class="empty-title">All loans completed!</div>
          <div class="empty-description">No pending installments remaining.</div>
        </div>`;
    }

    html += '</div></div>';
    container.innerHTML = html;
  },

  filterQuickPayList(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.quick-pay-row').forEach(row => {
      const name = row.getAttribute('data-name') || '';
      const group = row.getAttribute('data-group') || '';
      row.style.display = (name.includes(q) || group.includes(q)) ? '' : 'none';
    });
  },

  // ──── Page: Settings & Data ────
  renderSettings(container, topBar) {
    topBar.innerHTML = `
      <div class="top-bar-left">
        <h2 class="page-title">Settings & Data Management</h2>
        <span class="breadcrumb">Offline sync, backups, and configurations</span>
      </div>
      <div class="top-bar-actions"></div>`;

    container.innerHTML = `
      <!-- Live Sync Section -->
      <div class="settings-section">
        <div class="section-badge-row">
          <h3 class="settings-section-title">⚡ Live Excel Auto-Sync (Direct File System)</h3>
          ${this.state.isLiveSynced
            ? `<span class="badge badge-active">● Active (${this.state.syncedFileName})</span>`
            : `<span class="badge badge-pending">Offline Cache</span>`
          }
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 16px;">
          Connect directly to <code>loan_data.xlsx</code> in your project folder. Every payment, borrower addition, or edit will auto-save straight to the file on disk without prompting!
        </p>
        <div class="settings-action-grid">
          <div class="settings-action-card" onclick="App.connectLocalExcel()">
            <div class="action-icon">⚡</div>
            <div class="action-title">Link loan_data.xlsx File</div>
            <div class="action-desc">Select loan_data.xlsx file directly for in-place disk auto-saving</div>
          </div>
          <div class="settings-action-card" onclick="App.connectProjectFolder()">
            <div class="action-icon">📁</div>
            <div class="action-title">Link Project Folder</div>
            <div class="action-desc">Select Loan Management folder for both Excel + Photo syncing</div>
          </div>
          <div class="settings-action-card" onclick="App.saveExcel()">
            <div class="action-icon">💾</div>
            <div class="action-title">Save to loan_data.xlsx</div>
            <div class="action-desc">Write directly to disk without downloading copies</div>
          </div>
          <div class="settings-action-card" onclick="document.getElementById('excel-file-input').click()">
            <div class="action-icon">📂</div>
            <div class="action-title">Load External Excel</div>
            <div class="action-desc">Import any existing .xlsx file</div>
          </div>
          <div class="settings-action-card" onclick="App.reloadFromMasterDatabase()">
            <div class="action-icon">🔄</div>
            <div class="action-title">Reload Master Database</div>
            <div class="action-desc">Reset/refresh data to match master default records</div>
          </div>
        </div>
      </div>

      <!-- Backup & Restore -->
      <div class="settings-section">
        <h3 class="settings-section-title">📦 Complete Backup & Portability</h3>
        <div class="settings-action-grid">
          <div class="settings-action-card" onclick="App.exportFullBackup()">
            <div class="action-icon">📤</div>
            <div class="action-title">Export Full Backup ZIP</div>
            <div class="action-desc">ZIP with Excel + all photos in profile folders</div>
          </div>
          <div class="settings-action-card" onclick="App.exportAssetsOnlyZip()">
            <div class="action-icon">📁</div>
            <div class="action-title">Export Assets Folders</div>
            <div class="action-desc">Download all photos organized per borrower</div>
          </div>
          <div class="settings-action-card" onclick="document.getElementById('backup-file-input').click()">
            <div class="action-icon">📥</div>
            <div class="action-title">Restore from ZIP</div>
            <div class="action-desc">Restore entire database and images</div>
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="settings-section">
        <h3 class="settings-section-title">ℹ️ System Status</h3>
        <div style="display:grid; grid-template-columns: auto 1fr; gap: 10px 24px; font-size: 0.9rem;">
          <span style="color:var(--text-muted)">Organization:</span><span>${this.state.settings.companyName}</span>
          <span style="color:var(--text-muted)">Total Registered Borrowers:</span><span>${this.state.members.length}</span>
          <span style="color:var(--text-muted)">Total Loan Accounts:</span><span>${this.state.loans.length}</span>
          <span style="color:var(--text-muted)">Total Transaction Records:</span><span>${this.state.transactions.length}</span>
          <span style="color:var(--text-muted)">Storage Mode:</span><span style="color:var(--success)">🔒 100% Offline & Private</span>
          <span style="color:var(--text-muted)">Live Auto-Sync:</span><span>${this.state.isLiveSynced ? '✓ Active (' + this.state.syncedFileName + ')' : 'Local Storage Cache'}</span>
        </div>
      </div>`;
  },

  // ──── Live Excel File Connection & Auto-Sync ────

  async connectLocalExcel() {
    try {
      // Direct File Connection to loan_data.xlsx via File System Access API
      await ExcelHandler.openWithFileSystemAPI();
      if (ExcelHandler.fileHandle) {
        this.state.isLiveSynced = true;
        this.state.syncedFileName = ExcelHandler.fileName || 'loan_data.xlsx';
        
        // Immediately feed/write our active database into the connected loan_data.xlsx file!
        const res = await ExcelHandler.autoSave(
          this.state.members,
          this.state.loans,
          this.state.transactions,
          this.state.settings
        );

        this.persistLocalState();
        await this.refreshMemberPhotos();
        if (res && res.success) {
          UI.toast(`✓ Linked to ${this.state.syncedFileName} · All data fed & saved directly to disk!`, 'success');
        } else {
          UI.toast(`✓ Linked to ${this.state.syncedFileName} · Live Disk Sync Active`, 'success');
        }
        this.render();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('File connect error:', err);
        UI.toast('Could not connect file: ' + err.message, 'error');
      }
    }
  },

  async connectProjectFolder() {
    try {
      const data = await ExcelHandler.openFolderWithFileSystemAPI();
      if (ExcelHandler.dirHandle) {
        this.state.isLiveSynced = true;
        this.state.syncedFileName = 'Project Folder + loan_data.xlsx';
        if (data && data.members && data.members.length > 0) {
          this.state.members = data.members;
          this.state.loans = data.loans;
          this.state.transactions = data.transactions;
          this.state.settings = { ...this.state.settings, ...data.settings };
          this.state.isDataLoaded = true;
        }
        this.persistLocalState();
        await this.refreshMemberPhotos();
        const imgMsg = data && data.scannedImages ? ` & ${data.scannedImages} images loaded` : '';
        UI.toast(`Connected to Project Folder · Live Disk Sync Active${imgMsg} ✓`, 'success');
        this.render();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Folder connect error:', err);
        UI.toast('Could not connect folder: ' + err.message, 'error');
      }
    }
  },

  async scanAssetsFolder() {
    if (ExcelHandler.dirHandle) {
      try {
        const count = await ImageHandler.scanAssetsDirectory(ExcelHandler.dirHandle);
        await this.refreshMemberPhotos();
        UI.toast(`✓ Scanned assets folder: ${count} photos/documents synced`, 'success');
        this.render();
      } catch (err) {
        UI.toast('Error scanning assets: ' + err.message, 'error');
      }
    } else {
      await this.connectLocalExcel();
    }
  },

  async reloadFromMasterDatabase() {
    if (confirm('🔄 Reload all data to match master default database (including all 6 borrowers & loans)?')) {
      if (typeof DEFAULT_DATABASE !== 'undefined') {
        this.state.members = JSON.parse(JSON.stringify(DEFAULT_DATABASE.members));
        this.state.loans = DEFAULT_DATABASE.loans.map(l => ({ ...l, startDate: new Date(l.startDate) }));
        this.state.transactions = JSON.parse(JSON.stringify(DEFAULT_DATABASE.transactions));
        this.state.settings = JSON.parse(JSON.stringify(DEFAULT_DATABASE.settings));
        this.state.isDataLoaded = true;
        this.persistLocalState();
        this.initPhotoCache();
        await this.refreshMemberPhotos();
        UI.toast('Master database loaded successfully ✓', 'success');
        this.render();
      }
    }
  },

  async handleExcelFileInput(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const data = await ExcelHandler.loadFromFile(file);
      this.state.members = data.members;
      this.state.loans = data.loans;
      this.state.transactions = data.transactions;
      this.state.settings = { ...this.state.settings, ...data.settings };
      this.state.isDataLoaded = true;

      this.persistLocalState();
      UI.toast(`Loaded ${data.members.length} borrowers & ${data.loans.length} loans from ${file.name}`, 'success');
      this.navigate('dashboard');
    } catch (err) {
      console.error('File load error:', err);
      UI.toast('Error reading Excel: ' + err.message, 'error');
    }
    event.target.value = '';
  },

  async triggerAutoSave() {
    this.persistLocalState();

    if (typeof ExcelHandler !== 'undefined') {
      try {
        const res = await ExcelHandler.autoSave(
          this.state.members,
          this.state.loans,
          this.state.transactions,
          this.state.settings
        );
        this.state.lastSavedTime = new Date();
        if (res && res.success) {
          this.state.isLiveSynced = true;
          this.state.syncedFileName = ExcelHandler.fileName || 'loan_data.xlsx';
          console.log(`✓ Auto-saved seamlessly to ${res.fileName}`);
        }
      } catch (err) {
        console.warn('Auto-save write error:', err);
      }
    }
  },

  async saveExcel() {
    if (typeof ExcelHandler !== 'undefined') {
      try {
        const res = await ExcelHandler.autoSave(
          this.state.members,
          this.state.loans,
          this.state.transactions,
          this.state.settings
        );
        if (res && res.success) {
          this.state.isLiveSynced = true;
          this.state.syncedFileName = ExcelHandler.fileName || 'loan_data.xlsx';
          UI.toast(`✓ Saved directly into loan_data.xlsx on disk!`, 'success');
          return;
        }
      } catch (err) {
        console.warn('Save directly error:', err);
      }
    }

    // If not currently linked to file, prompt to select loan_data.xlsx for direct in-place saving
    try {
      if (window.showOpenFilePicker) {
        UI.toast('📂 Please select your "loan_data.xlsx" file to save directly into it...', 'info');
        await this.connectLocalExcel();
        return;
      }
    } catch (e) {
      console.warn('File picker connect warning:', e);
    }

    // Fallback for browsers that do not support File System Access API
    ExcelHandler.downloadExcel(
      this.state.members,
      this.state.loans,
      this.state.transactions,
      this.state.settings
    );
    UI.toast('✓ Excel workbook downloaded to Downloads folder!', 'success');
  },

  // ──── Backup & Restore ZIP ────

  async exportFullBackup() {
    try {
      await ExportHandler.exportFullBackup(
        this.state.members,
        this.state.loans,
        this.state.transactions,
        this.state.settings
      );
      UI.toast('Full backup ZIP generated & downloaded!', 'success');
    } catch (err) {
      UI.toast('Export failed: ' + err.message, 'error');
    }
  },

  async exportAssetsOnlyZip() {
    try {
      UI.toast('Generating borrower assets folders ZIP...', 'info');
      await ExportHandler.exportAssetsOnlyZip(this.state.members);
      UI.toast('Borrower assets folders ZIP generated & downloaded!', 'success');
    } catch (err) {
      console.error('Export assets failed:', err);
      UI.toast('Export assets failed: ' + err.message, 'error');
    }
  },

  async handleBackupZipInput(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const data = await ExportHandler.importFullBackup(file);
      this.state.members = data.members;
      this.state.loans = data.loans;
      this.state.transactions = data.transactions || [];
      this.state.settings = { ...this.state.settings, ...data.settings };
      this.state.isDataLoaded = true;

      this.persistLocalState();
      UI.toast(`Backup restored! Loaded ${data.members.length} borrowers & documents.`, 'success');
      this.navigate('dashboard');
    } catch (err) {
      UI.toast('Import error: ' + err.message, 'error');
    }
    event.target.value = '';
  },

  // ──── Member CRUD ────

  showAddMember() {
    const newId = LoanCalculator.generatePersonId(this.state.members);
    UI.showModal('➕ Add New Borrower', UI.memberForm(null, newId), true);
  },

  showEditMember(personId) {
    const member = this.state.members.find(m => m.personId === personId);
    if (!member) return;
    UI.showModal(`✏️ Edit Borrower — ${member.name}`, UI.memberForm(member), true);
  },

  async handleMemberSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const isEdit = fd.get('isEdit') === 'true';

    const member = {
      personId: (fd.get('personId') || '').trim(),
      name: (fd.get('name') || '').trim(),
      group: (fd.get('group') || 'Group A - Market').trim(),
      investor: (fd.get('investor') || 'Rameshwar Lamba').trim(),
      phone: (fd.get('phone') || '').trim(),
      email: (fd.get('email') || '').trim(),
      address: (fd.get('address') || '').trim(),
      aadharNumber: (fd.get('aadharNumber') || '').trim(),
      chequeNumber: (fd.get('chequeNumber') || '').trim(),
      witnessName: (fd.get('witnessName') || '').trim(),
      witnessPhone: (fd.get('witnessPhone') || '').trim(),
      witnessAadhar: (fd.get('witnessAadhar') || '').trim(),
      witnessCheque: (fd.get('witnessCheque') || '').trim(),
      status: 'Active'
    };

    if (!member.personId || !member.name) {
      UI.toast('Person ID and Full Name are required', 'error');
      return;
    }

    if (isEdit) {
      const origId = fd.get('originalPersonId');
      const idx = this.state.members.findIndex(m => m.personId === origId);
      if (idx !== -1) {
        this.state.members[idx] = { ...this.state.members[idx], ...member };
        // Sync name, group, and investor across all loan accounts for this member
        this.state.loans.forEach(l => {
          if (l.personId === origId) {
            l.borrowerName = member.name;
            l.group = member.group;
            l.investor = member.investor; // Fully update investor on all associated loans!
          }
        });
        // Sync investor on all transaction audit logs for this member
        this.state.transactions.forEach(t => {
          if (t.personId === origId) {
            t.borrowerName = member.name;
            t.group = member.group;
            t.investor = member.investor;
          }
        });
        UI.toast(`✓ Updated details & investor for ${member.name} in App & Excel`, 'success');
      }
    } else {
      const existing = this.state.members.find(m => m.personId.trim().toLowerCase() === member.personId.trim().toLowerCase());
      if (existing) {
        UI.toast(`❌ Person ID "${member.personId}" is already assigned to "${existing.name}". Please enter a unique ID from your physical ledger.`, 'error');
        return;
      }
      this.state.members.push(member);

      // Check if initial loan is requested
      const disburseNow = fd.get('disburseNow') === 'true';
      if (disburseNow) {
        const pAmt = Number(fd.get('initLoanAmount')) || 50000;
        const wPmt = Number(fd.get('initWeeklyPayment')) || 2750;
        const totalInst = Number(fd.get('initTotalInstallments')) || 20;
        const sDate = fd.get('initStartDate') ? new Date(fd.get('initStartDate')) : new Date();
        const pDay = fd.get('initPaymentDay') || 'Monday';
        const pInv = (fd.get('initInvestor') || member.investor || 'Rameshwar Lamba').trim();

        const initialLoan = {
          loanId: `${member.personId}-L1`,
          personId: member.personId,
          borrowerName: member.name,
          group: member.group,
          investor: pInv,
          loanNumber: 1,
          loanAmount: pAmt,
          weeklyPayment: wPmt,
          totalInstallments: totalInst,
          startDate: sDate,
          paymentDay: pDay,
          status: 'Active'
        };
        this.state.loans.push(initialLoan);
        UI.toast(`Added ${member.name} & disbursed Loan #1 funded by ${pInv} (${LoanCalculator.formatCurrency(pAmt)}) ✓`, 'success');
      } else {
        UI.toast(`Added borrower ${member.name} (${member.personId})`, 'success');
      }
    }

    this.closeModal();
    this.persistLocalState();
    await this.triggerAutoSave();
    
    if (!isEdit) {
      this.navigate('member-detail', member.personId);
    } else {
      this.render();
    }
  },

  // ──── Multi-Loan CRUD ────

  showNewLoan(personId) {
    const member = this.state.members.find(m => m.personId === personId);
    if (!member) return;

    // Verify no unfinished loans
    const activeLoan = this.state.loans.find(l => {
      if (l.personId !== personId) return false;
      const s = LoanCalculator.getLoanSummary(l, this.state.transactions);
      return !s.isCompleted;
    });

    if (activeLoan) {
      UI.toast('Cannot disburse new loan: Current loan is still active and unpaid!', 'warning');
      return;
    }

    UI.showModal(`🆕 Disburse New Loan for ${member.name}`, UI.loanForm(personId, member), true);
  },

  showEditLoan(loanId) {
    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!loan) return;
    const member = this.state.members.find(m => m.personId === loan.personId);
    if (!member) return;

    UI.showModal(`✏️ Edit Loan Terms — ${loanId}`, UI.loanForm(loan.personId, member, loan), true);
  },

  updateLoanPreview() {
    const p = Number(document.getElementById('field-principal')?.value) || 0;
    const w = Number(document.getElementById('field-weekly')?.value) || 0;
    const n = Number(document.getElementById('field-weeks')?.value) || 0;

    const receivable = w * n;
    const interest = Math.max(0, receivable - p);

    const recEl = document.getElementById('preview-receivable');
    const intEl = document.getElementById('preview-interest');
    const durEl = document.getElementById('preview-duration');

    if (recEl) recEl.textContent = LoanCalculator.formatCurrency(receivable);
    if (intEl) intEl.textContent = LoanCalculator.formatCurrency(interest);
    if (durEl) durEl.textContent = `${n} Weeks (~${Math.round(n / 4.3)} Months)`;
  },

  async handleLoanSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const personId = fd.get('personId');
    const isEdit = fd.get('isEdit') === 'true';
    const member = this.state.members.find(m => m.personId === personId);

    const loanData = {
      personId,
      borrowerName: member ? member.name : '',
      group: member ? member.group : '',
      investor: (fd.get('investor') || member?.investor || 'Rameshwar Lamba').trim(),
      loanAmount: Number(fd.get('loanAmount')),
      weeklyPayment: Number(fd.get('weeklyPayment')),
      totalInstallments: Number(fd.get('totalInstallments')),
      startDate: new Date(fd.get('startDate')),
      paymentDay: fd.get('paymentDay'),
      status: 'Active'
    };

    if (isEdit) {
      const origId = fd.get('originalLoanId');
      const idx = this.state.loans.findIndex(l => l.loanId === origId);
      if (idx !== -1) {
        this.state.loans[idx] = { ...this.state.loans[idx], ...loanData };
        // Sync investor on all transactions for this loan
        this.state.transactions.forEach(t => {
          if (t.loanId === origId) {
            t.investor = loanData.investor;
          }
        });
        if (member) member.investor = loanData.investor;
        UI.toast(`✓ Updated terms & investor for loan ${origId} in App & Excel`, 'success');
      }
    } else {
      const loanNumber = this.state.loans.filter(l => l.personId === personId).length + 1;
      const loanId = `${personId}-L${loanNumber}`;
      const newLoan = {
        ...loanData,
        loanId,
        loanNumber
      };
      this.state.loans.push(newLoan);
      if (member) member.investor = loanData.investor;
      UI.toast(`Loan ${loanId} funded by ${loanData.investor} created for ${member ? member.name : personId} ✓`, 'success');
    }

    this.closeModal();
    this.persistLocalState();
    await this.triggerAutoSave();
    this.render();
  },

  async deleteMember(personId) {
    const member = this.state.members.find(m => m.personId === personId);
    if (!member) return;
    const confirmMsg = `⚠️ Are you sure you want to permanently DELETE borrower "${member.name}" (${personId})?\n\nThis will remove:\n• Borrower profile\n• All associated loan accounts\n• All payment history\n• All uploaded KYC documents and photos\n\nThis cannot be undone!`;
    if (!confirm(confirmMsg)) return;

    try {
      await ImageHandler.deleteAllForLoan(personId);
    } catch (e) {
      console.warn('Image deletion error:', e);
    }

    this.state.members = this.state.members.filter(m => m.personId !== personId);
    this.state.loans = this.state.loans.filter(l => l.personId !== personId);
    this.state.transactions = this.state.transactions.filter(t => t.personId !== personId);
    if (this.state.photoCache) delete this.state.photoCache[personId];

    this.closeModal();
    this.persistLocalState();
    await this.triggerAutoSave();
    UI.toast(`✓ Borrower "${member.name}" was permanently deleted from App & Excel`, 'info');
    this.navigate('borrowers');
  },

  async deleteLoan(loanId) {
    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!loan) return;
    if (!confirm(`⚠️ Are you sure you want to permanently delete Loan "${loanId}"?\n\nThis will remove the loan account and its payment transaction records.`)) return;

    this.state.loans = this.state.loans.filter(l => l.loanId !== loanId);
    this.state.transactions = this.state.transactions.filter(t => t.loanId !== loanId);

    this.closeModal();
    this.persistLocalState();
    await this.triggerAutoSave();
    UI.toast(`✓ Loan "${loanId}" deleted from App & Excel`, 'info');
    this.render();
  },

  settleLoan(loanId) {
    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!loan) return;
    const member = this.state.members.find(m => m.personId === loan.personId);
    if (!member) return;
    const summary = LoanCalculator.getLoanSummary(loan, this.state.transactions);

    UI.showModal(`🛑 Early Foreclosure & Settlement — ${loan.loanId}`, UI.settleModal(loan, member, summary));
  },

  handleSettleSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const loanId = fd.get('loanId');
    const personId = fd.get('personId');
    const settlementAmount = Number(fd.get('settlementAmount')) || 0;
    const settlementDate = fd.get('settlementDate') || LoanCalculator.formatDateISO(new Date());
    const paymentMode = fd.get('paymentMode') || 'Cash';
    const notes = fd.get('notes') || 'Full and final early settlement';

    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!loan) return;
    const member = this.state.members.find(m => m.personId === personId);

    const dueDates = LoanCalculator.calculateDueDates(loan.startDate, loan.paymentDay, loan.totalInstallments);

    // Record settlement transaction for all remaining unpaid / missed weeks
    for (let i = 0; i < loan.totalInstallments; i++) {
      const weekNumber = i + 1;
      const existingTxIdx = this.state.transactions.findIndex(t => t.loanId === loanId && Number(t.weekNumber) === weekNumber);

      if (existingTxIdx === -1) {
        this.state.transactions.push({
          loanId,
          personId,
          borrowerName: member ? member.name : '',
          group: member ? member.group : '',
          weekNumber,
          dueDate: LoanCalculator.formatDateISO(dueDates[i] || new Date()),
          paidDate: settlementDate,
          daysLate: 0,
          amountDue: loan.weeklyPayment,
          amountPaid: loan.weeklyPayment,
          status: 'paid',
          paymentMode,
          receiptNo: LoanCalculator.generateReceiptNo(),
          notes: `${notes} (Early Prepayment)`
        });
      } else {
        const tx = this.state.transactions[existingTxIdx];
        if (tx.status === 'missed' || tx.status === 'partial') {
          tx.status = 'paid';
          tx.paidDate = settlementDate;
          tx.amountPaid = loan.weeklyPayment;
          tx.notes = `${notes} (Overdue Cleared in Settlement)`;
        }
      }
    }

    loan.status = 'Completed';
    this.closeModal();
    this.persistLocalState();
    this.triggerAutoSave();
    UI.toast(`🎉 Loan ${loanId} settled & closed! Balance is now ₹0 ✓`, 'success');
    this.render();
  },

  // ──── Payment Actions ────

  openPaymentModal(loanId, weekNumber) {
    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!loan) return;
    const member = this.state.members.find(m => m.personId === loan.personId);
    if (!member) return;

    UI.showModal(`💰 Record Payment — ${member.name} (Week ${weekNumber})`, UI.paymentModal(loan, member, weekNumber, this.state.transactions));
  },

  openNextPaymentModal(loanId) {
    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!loan) return;
    const summary = LoanCalculator.getLoanSummary(loan, this.state.transactions);
    const nextUnpaid = summary.installments.find(i => i.status === 'pending' || i.status === 'missed' || i.status === 'partial');
    const weekNumber = nextUnpaid ? nextUnpaid.weekNumber : 1;
    this.openPaymentModal(loanId, weekNumber);
  },

  async handlePaymentSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.target);

    const loanId = fd.get('loanId');
    const personId = fd.get('personId');
    const weekNumber = Number(fd.get('weekNumber'));
    const paidDate = fd.get('paidDate');
    const amountPaid = Number(fd.get('amountPaid'));
    const paymentMode = fd.get('paymentMode') || 'Cash';
    const receiptNo = fd.get('receiptNo') || LoanCalculator.generateReceiptNo();
    const notes = fd.get('notes') || '';

    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!loan) return;

    const dueDates = LoanCalculator.calculateDueDates(loan.startDate, loan.paymentDay, loan.totalInstallments);
    const dueDate = dueDates[weekNumber - 1] || new Date();
    const daysLate = Math.max(0, LoanCalculator.diffInDays(new Date(paidDate), dueDate));

    const status = amountPaid >= loan.weeklyPayment ? (daysLate > 0 ? 'paid_late' : 'paid') : (amountPaid > 0 ? 'partial' : 'missed');

    const txRecord = {
      receiptNo,
      loanId,
      personId,
      weekNumber,
      dueDate: LoanCalculator.formatDateISO(dueDate),
      paidDate,
      daysLate,
      amountDue: loan.weeklyPayment,
      amountPaid,
      status,
      paymentMode,
      notes
    };

    // Remove previous transaction for this week if existing, then add new
    const existingIdx = this.state.transactions.findIndex(t => t.loanId === loanId && Number(t.weekNumber) === weekNumber);
    if (existingIdx !== -1) {
      this.state.transactions[existingIdx] = txRecord;
    } else {
      this.state.transactions.push(txRecord);
    }

    const member = this.state.members.find(m => m.personId === personId);
    UI.toast(
      amountPaid > 0
        ? `✓ ${LoanCalculator.formatCurrency(amountPaid)} recorded & synced to Excel (Week ${weekNumber})`
        : `🔴 Marked Week ${weekNumber} as Missed / Unpaid (₹0)`,
      amountPaid > 0 ? 'success' : 'warning'
    );

    this.closeModal();
    await this.triggerAutoSave();
    this.render();
  },

  async deletePayment(loanId, weekNumber) {
    if (!confirm(`Clear payment record for Week ${weekNumber}?`)) return;
    this.state.transactions = this.state.transactions.filter(t => !(t.loanId === loanId && Number(t.weekNumber) === weekNumber));
    this.closeModal();
    this.persistLocalState();
    await this.triggerAutoSave();
    UI.toast(`✓ Payment for Week ${weekNumber} cleared from App & Excel`, 'info');
    this.render();
  },

  // ──── Document Photos ────

  handleImageClick(personId, type) {
    ImageHandler.getImageURL(personId, type).then(url => {
      if (url) UI.showLightbox(url);
      else this.handleImageUpload(personId, type);
    });
  },

  handleImageUpload(personId, type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await ImageHandler.saveImage(personId, type, file);
        if (type === 'photo') {
          const freshUrl = URL.createObjectURL(file);
          this.state.photoCache[personId] = freshUrl;
        }
        const member = this.state.members.find(m => m.personId === personId);
        const name = member ? member.name : personId;
        UI.toast(`Photo saved for ${name} ✓`, 'success');
        this.render();
      } catch (err) {
        UI.toast('Upload error: ' + err.message, 'error');
      }
    };
    input.click();
  },

  async handleImageDelete(personId, type) {
    if (!confirm(`Delete this ${type.replace(/_/g, ' ')} photo?`)) return;
    try {
      await ImageHandler.deleteImage(personId, type);
      if (type === 'photo') {
        this.state.photoCache[personId] = null;
      }
      UI.toast('Photo removed', 'info');
      this.render();
    } catch (err) {
      UI.toast('Delete failed', 'error');
    }
  },

  // ──── Print Passbook Statement ────

  printPassbook(loanId) {
    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!loan) return;
    const member = this.state.members.find(m => m.personId === loan.personId);
    if (!member) return;
    const summary = LoanCalculator.getLoanSummary(loan, this.state.transactions);

    const win = window.open('', '_blank');
    if (!win) {
      UI.toast('Popup blocked by browser. Please allow popups to print statement.', 'warning');
      return;
    }

    let rowsHtml = '';
    summary.installments.forEach(inst => {
      const dueStr = LoanCalculator.formatDate(inst.dueDate);
      const paidStr = inst.paidDate ? LoanCalculator.formatDate(inst.paidDate) : '—';
      const amtStr = inst.amountPaid ? LoanCalculator.formatCurrency(inst.amountPaid) : '—';
      const statusStr = inst.status.toUpperCase().replace('_', ' ');

      rowsHtml += `
        <tr>
          <td style="padding: 6px 10px; border: 1px solid #ddd; text-align:center;">${inst.weekNumber}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${dueStr}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${LoanCalculator.formatCurrency(inst.amountDue)}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${paidStr}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd; font-weight:bold;">${amtStr}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd; text-align:center;">${statusStr}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${inst.receiptNo || ''}</td>
        </tr>`;
    });

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Loan Passbook — ${member.name} (${loan.loanId})</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #111; max-width: 800px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
          .header p { margin: 4px 0; color: #555; font-size: 14px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 13px; }
          .meta-box { background: #f9f9f9; padding: 12px; border: 1px solid #eee; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th { background: #333; color: white; padding: 8px 10px; text-align: left; }
          .summary-footer { display: flex; justify-content: space-between; margin-top: 20px; padding: 12px; background: #eee; font-weight: bold; }
          .sig-row { display: flex; justify-content: space-between; margin-top: 50px; font-size: 13px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAMBA ENTERPRISES</h1>
          <p>Official Loan Repayment Passbook & Statement</p>
          <p style="font-size:12px;">Printed on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <strong>BORROWER DETAILS:</strong><br>
            <strong>Name:</strong> ${member.name}<br>
            <strong>Person ID:</strong> ${member.personId} | <strong>Group:</strong> ${member.group}<br>
            <strong>Phone:</strong> ${member.phone} | <strong>Aadhar:</strong> ${member.aadharNumber}<br>
            <strong>Address:</strong> ${member.address || '—'}
          </div>
          <div class="meta-box">
            <strong>LOAN TERMS (${loan.loanId}):</strong><br>
            <strong>Principal Disbursed:</strong> ${LoanCalculator.formatCurrency(loan.loanAmount)}<br>
            <strong>Weekly Installment:</strong> ${LoanCalculator.formatCurrency(loan.weeklyPayment)} (${loan.paymentDay}s)<br>
            <strong>Total Weeks:</strong> ${loan.totalInstallments} | <strong>Total Receivable:</strong> ${LoanCalculator.formatCurrency(summary.totalExpected)}<br>
            <strong>Guarantor:</strong> ${member.witnessName || '—'} (📞 ${member.witnessPhone || '—'})
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Wk</th>
              <th>Due Date</th>
              <th>Due (₹)</th>
              <th>Paid Date</th>
              <th>Paid (₹)</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="summary-footer">
          <span>Total Disbursed: ${LoanCalculator.formatCurrency(loan.loanAmount)}</span>
          <span>Total Collected: ${LoanCalculator.formatCurrency(summary.totalPaid)}</span>
          <span>Balance Remaining: ${LoanCalculator.formatCurrency(summary.totalRemaining)}</span>
        </div>

        <div class="sig-row">
          <div>_______________________<br>Borrower's Signature</div>
          <div>_______________________<br>Guarantor's Signature</div>
          <div>_______________________<br>Authorized Signatory (Lamba Enterprises)</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  },

  sendWhatsAppReminder(personId, loanId) {
    const member = this.state.members.find(m => m.personId === personId);
    const loan = this.state.loans.find(l => l.loanId === loanId);
    if (!member || !loan) return;

    const cleanPhone = (member.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      UI.toast(`No valid phone number found for ${member.name}. Please edit their profile first.`, 'warning');
      return;
    }

    const summary = LoanCalculator.getLoanSummary(loan, this.state.transactions);
    const nextUnpaid = summary.installments.find(i => i.status === 'pending' || i.status === 'missed' || i.status === 'partial');
    const weekNum = nextUnpaid ? nextUnpaid.weekNumber : 1;
    const dueDateStr = nextUnpaid ? LoanCalculator.formatDate(nextUnpaid.dueDate) : 'this week';
    const amountStr = LoanCalculator.formatCurrency(loan.weeklyPayment);
    const balStr = LoanCalculator.formatCurrency(summary.totalRemaining);
    const isOverdue = nextUnpaid && (nextUnpaid.status === 'missed' || nextUnpaid.daysLate > 0);

    const message = `Namaste ${member.name} Ji,\n\nThis is a payment reminder from *${this.state.settings.companyName}* regarding your Loan Account *${loan.loanId}*.\n\n📌 *Installment:* Week ${weekNum}\n📅 *Scheduled Due Date:* ${dueDateStr}\n💰 *Weekly Amount Due:* ${amountStr}\n📊 *Total Remaining Balance:* ${balStr}${isOverdue ? `\n⚠️ *Payment Status:* Overdue (${nextUnpaid.daysLate} days late)` : ''}\n\nPlease arrange the payment via Cash or UPI (Google Pay / PhonePe / Paytm).\n\nThank you,\n*${this.state.settings.companyName}*`;

    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
    UI.toast(`WhatsApp reminder pre-filled for ${member.name}!`, 'success');
  },

  printDailyCollectionSheet() {
    const today = new Date();
    const dueToday = LoanCalculator.getDueToday(this.state.members, this.state.loans, this.state.transactions);

    const win = window.open('', '_blank');
    if (!win) {
      UI.toast('Please allow popups to print collection sheet', 'warning');
      return;
    }

    let rowsHtml = '';
    dueToday.forEach((item, idx) => {
      const nextWk = item.nextInstallment ? item.nextInstallment.weekNumber : 1;
      const dueAmt = LoanCalculator.formatCurrency(item.loan.weeklyPayment);
      const balAmt = LoanCalculator.formatCurrency(item.summary.totalRemaining);

      rowsHtml += `
        <tr>
          <td style="padding:8px; border:1px solid #333; text-align:center;">${idx + 1}</td>
          <td style="padding:8px; border:1px solid #333;"><strong>${item.member.name}</strong><br><small>${item.member.personId} · ${item.member.group}</small></td>
          <td style="padding:8px; border:1px solid #333;">📞 ${item.member.phone || '—'}<br><small>📍 ${item.member.address || '—'}</small></td>
          <td style="padding:8px; border:1px solid #333; text-align:center;">Week ${nextWk}</td>
          <td style="padding:8px; border:1px solid #333; font-weight:bold; color:#000;">${dueAmt}</td>
          <td style="padding:8px; border:1px solid #333;">${balAmt}</td>
          <td style="padding:8px; border:1px solid #333; min-width:80px;">[ &nbsp; ] Cash<br>[ &nbsp; ] UPI</td>
          <td style="padding:8px; border:1px solid #333; min-width:90px;"></td>
        </tr>`;
    });

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Field Collection Sheet — ${this.state.settings.companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #f0f0f0; border: 1px solid #333; padding: 8px; text-align: left; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0;">${this.state.settings.companyName.toUpperCase()}</h2>
          <h3 style="margin:4px 0;">DAILY FIELD COLLECTION RUN SHEET</h3>
          <p style="margin:0; font-size:12px;">Date: ${today.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} · Total Actionable: ${dueToday.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Borrower / Group</th>
              <th>Contact & Address</th>
              <th>Week</th>
              <th>Due (₹)</th>
              <th>Balance Left</th>
              <th>Mode Collected</th>
              <th>Borrower Signature</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="8" style="text-align:center; padding:20px;">No pending collections scheduled for today.</td></tr>'}
          </tbody>
        </table>
        <div class="footer">
          <div>Agent / Collector Name: _______________________</div>
          <div>Total Collected (₹): _______________________</div>
          <div>Verified By: _______________________</div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    win.document.close();
  },

  openLoanCalculatorModal() {
    const content = `
      <div class="loan-planner-box">
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
          Quickly simulate any principal amount, weekly installment, and weeks duration to preview your total return and interest profit.
        </p>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Principal Amount (₹)</label>
            <input type="number" id="calc-principal" class="form-input" value="50000" oninput="App.runMiniCalculator()">
          </div>
          <div class="form-group">
            <label class="form-label">Weekly Installment (₹)</label>
            <input type="number" id="calc-weekly" class="form-input" value="2750" oninput="App.runMiniCalculator()">
          </div>
          <div class="form-group">
            <label class="form-label">Duration (Weeks)</label>
            <input type="number" id="calc-weeks" class="form-input" value="20" oninput="App.runMiniCalculator()">
          </div>
        </div>
        <div class="loan-calc-preview mt-3" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; background:var(--bg-tertiary); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
          <div class="preview-item">
            <div style="font-size:0.75rem; color:var(--text-muted);">Total Receivable</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--accent);" id="calc-res-receivable">₹55,000</div>
          </div>
          <div class="preview-item">
            <div style="font-size:0.75rem; color:var(--text-muted);">Total Interest Profit</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--success);" id="calc-res-profit">₹5,000 (+10%)</div>
          </div>
          <div class="preview-item">
            <div style="font-size:0.75rem; color:var(--text-muted);">Duration Approx</div>
            <div style="font-size:1.2rem; font-weight:800;" id="calc-res-monthly">~4.6 Months</div>
          </div>
        </div>
        <div class="modal-footer" style="margin-top:20px;">
          <button type="button" class="btn btn-primary" onclick="App.closeModal()">Done</button>
        </div>
      </div>`;
    UI.showModal('🧮 Loan EMI & Profit Planner', content, false);
    this.runMiniCalculator();
  },

  runMiniCalculator() {
    const p = Number(document.getElementById('calc-principal')?.value) || 0;
    const w = Number(document.getElementById('calc-weekly')?.value) || 0;
    const n = Number(document.getElementById('calc-weeks')?.value) || 0;
    const rec = w * n;
    const profit = Math.max(0, rec - p);
    const pct = p > 0 ? ((profit / p) * 100).toFixed(1) : 0;

    const rEl = document.getElementById('calc-res-receivable');
    const pEl = document.getElementById('calc-res-profit');
    const mEl = document.getElementById('calc-res-monthly');

    if (rEl) rEl.textContent = LoanCalculator.formatCurrency(rec);
    if (pEl) pEl.textContent = `${LoanCalculator.formatCurrency(profit)} (+${pct}%)`;
    if (mEl) mEl.textContent = `~${(n / 4.3).toFixed(1)} Months`;
  },

  closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    UI.closeModal();
  }
};

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
