/* ========================================
   Image Handler & Local Persistence Vault (IndexedDB)
   Stores KYC images, full application state, and FileSystem directory handles
   ======================================== */

const ImageHandler = {
  DB_NAME: 'LambaEnterprisesImages',
  DB_VERSION: 2,
  STORE_NAME: 'images',
  STATE_STORE: 'app_state',
  HANDLES_STORE: 'handles',
  db: null,
  dirHandle: null,

  IMAGE_TYPES: [
    { key: 'photo', label: 'Person Photo', icon: '👤' },
    { key: 'signature', label: 'Signature', icon: '✍️' },
    { key: 'aadhar', label: 'Aadhar Card', icon: '🪪' },
    { key: 'cheque_1', label: 'Cheque Photo 1', icon: '📄' },
    { key: 'cheque_2', label: 'Cheque Photo 2', icon: '📄' },
    { key: 'cheque_3', label: 'Cheque Photo 3', icon: '📄' },
    { key: 'promissory_note', label: 'Promissory Note', icon: '📜' }
  ],

  /**
   * Initialize IndexedDB with multi-store schema.
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('ImageHandler: IndexedDB open error', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('ImageHandler: IndexedDB initialized (v' + this.DB_VERSION + ')');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // 1. Images store
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('loanId', 'loanId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
        // 2. App state store (full database backup)
        if (!db.objectStoreNames.contains(this.STATE_STORE)) {
          db.createObjectStore(this.STATE_STORE, { keyPath: 'key' });
        }
        // 3. Handles store (FileSystemDirectoryHandle persistence)
        if (!db.objectStoreNames.contains(this.HANDLES_STORE)) {
          db.createObjectStore(this.HANDLES_STORE, { keyPath: 'key' });
        }
      };
    });
  },

  /**
   * Generate a unique ID from loanId and type.
   */
  _id(loanId, type) {
    return `${loanId}_${type}`;
  },

  getFolderSafeName(personId, memberName = '') {
    if (!memberName) return personId;
    const clean = memberName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    return `${personId}_${clean}`;
  },

  _getExt(mime) {
    const map = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg'
    };
    return map[mime] || '.jpg';
  },

  // ────────────── APP STATE PERSISTENCE IN INDEXEDDB ──────────────

  /**
   * Save entire application state (members, loans, transactions, settings) to IndexedDB.
   */
  async saveAppState(dbData) {
    try {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(this.STATE_STORE, 'readwrite');
        const store = tx.objectStore(this.STATE_STORE);
        const req = store.put({ key: 'master_db', data: dbData, timestamp: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('saveAppState IndexedDB warning:', err);
      return false;
    }
  },

  /**
   * Retrieve saved application state from IndexedDB.
   */
  async getAppState() {
    try {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(this.STATE_STORE, 'readonly');
        const store = tx.objectStore(this.STATE_STORE);
        const req = store.get('master_db');
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('getAppState IndexedDB warning:', err);
      return null;
    }
  },

  // ────────────── FILESYSTEM HANDLE PERSISTENCE ──────────────

  /**
   * Save FileSystemFileHandle for loan_data.xlsx to IndexedDB.
   */
  async saveFileHandle(handle) {
    try {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(this.HANDLES_STORE, 'readwrite');
        const store = tx.objectStore(this.HANDLES_STORE);
        const req = store.put({ key: 'excel_file', handle, timestamp: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('saveFileHandle warning:', err);
      return false;
    }
  },

  /**
   * Get stored FileSystemFileHandle from IndexedDB.
   */
  async getFileHandle() {
    try {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(this.HANDLES_STORE, 'readonly');
        const store = tx.objectStore(this.HANDLES_STORE);
        const req = store.get('excel_file');
        req.onsuccess = () => {
          if (req.result && req.result.handle) {
            resolve(req.result.handle);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('getFileHandle warning:', err);
      return null;
    }
  },

  /**
   * Save FileSystemDirectoryHandle to IndexedDB so folder connection persists across page reloads.
   */
  async saveDirectoryHandle(handle) {
    try {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(this.HANDLES_STORE, 'readwrite');
        const store = tx.objectStore(this.HANDLES_STORE);
        const req = store.put({ key: 'project_folder', handle, timestamp: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('saveDirectoryHandle warning:', err);
      return false;
    }
  },

  /**
   * Get stored FileSystemDirectoryHandle from IndexedDB.
   */
  async getDirectoryHandle() {
    try {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(this.HANDLES_STORE, 'readonly');
        const store = tx.objectStore(this.HANDLES_STORE);
        const req = store.get('project_folder');
        req.onsuccess = () => {
          if (req.result && req.result.handle) {
            resolve(req.result.handle);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('getDirectoryHandle warning:', err);
      return null;
    }
  },

  // ────────────── IMAGE STORAGE & DISK WRITING ──────────────

  /**
   * Save an image blob for a borrower.
   * Saves to IndexedDB and writes physically to assets/<personId>_<name>/<type>.jpg on disk if directory handle is active.
   */
  async saveImage(loanId, type, file, memberName = '') {
    if (!this.db) await this.init();
    const id = this._id(loanId, type);
    const record = {
      id,
      loanId,
      type,
      blob: file,
      filename: file.name || `${id}.jpg`,
      mimeType: file.type || 'image/jpeg',
      timestamp: Date.now()
    };

    // 1. Save to IndexedDB
    await new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });

    // 2. Physical write to assets/ folder if folder handle connected
    if (this.dirHandle) {
      try {
        const ext = this._getExt(file.type || 'image/jpeg');
        const assetsDir = await this.dirHandle.getDirectoryHandle('assets', { create: true });
        const safeName = this.getFolderSafeName(loanId, memberName);
        const borrowerDir = await assetsDir.getDirectoryHandle(safeName, { create: true });
        const fileHandle = await borrowerDir.getFileHandle(`${type}${ext}`, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        console.log(`✓ Physical image saved to disk at assets/${safeName}/${type}${ext}`);
      } catch (err) {
        console.warn('Physical file write warning (will remain safe in local vault):', err);
      }
    }

    return id;
  },

  /**
   * Get a single image record from IndexedDB.
   */
  async getImage(loanId, type) {
    if (!this.db) await this.init();
    const id = this._id(loanId, type);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Get an image URL for display.
   * Priority: 1. IndexedDB Blob URL, 2. Relative disk assets path
   */
  async getImageURL(loanId, type, memberName = '') {
    try {
      const record = await this.getImage(loanId, type);
      if (record && record.blob) {
        return URL.createObjectURL(record.blob);
      }
    } catch (e) {
      console.warn('IndexedDB read error for image:', e);
    }

    // Relative path fallback (e.g. assets/P001_Rajesh_Kumar/photo.jpg)
    const folder = this.getFolderSafeName(loanId, memberName);
    return `assets/${folder}/${type}.jpg`;
  },

  /**
   * Scan disk assets/ directory when folder handle is connected.
   * Loads all photos and KYC documents into IndexedDB.
   */
  async scanAssetsDirectory(dirHandle) {
    if (!dirHandle) return 0;
    if (!this.db) await this.init();
    let loadedCount = 0;

    try {
      const assetsDir = await dirHandle.getDirectoryHandle('assets', { create: false });

      for await (const [folderName, handle] of assetsDir.entries()) {
        if (handle.kind === 'directory') {
          // Extract PersonID e.g. "P001" from "P001_Rajesh_Kumar" or "P008"
          const match = folderName.match(/^([A-Za-z0-9-]+)(?:_(.*))?$/);
          if (!match) continue;
          const personId = match[1];
          const memberName = match[2] ? match[2].replace(/_/g, ' ') : '';

          for await (const [fileName, fileHandle] of handle.entries()) {
            if (fileHandle.kind === 'file') {
              const extMatch = fileName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
              if (extMatch) {
                const baseName = fileName.replace(/\.[^.]+$/, '').toLowerCase();
                const matchedType = this.IMAGE_TYPES.find(
                  t => t.key.toLowerCase() === baseName || baseName.startsWith(t.key.toLowerCase())
                );
                const typeKey = matchedType ? matchedType.key : baseName;

                try {
                  const file = await fileHandle.getFile();
                  if (file.size > 0) {
                    await this.saveImage(personId, typeKey, file, memberName);
                    loadedCount++;
                  }
                } catch (readErr) {
                  console.warn(`Could not read ${fileName}:`, readErr);
                }
              }
            }
          }
        }
      }
      console.log(`✓ Scanned assets folder: successfully loaded ${loadedCount} images into local vault.`);
    } catch (err) {
      console.warn('Assets directory scan warning:', err);
    }

    return loadedCount;
  },

  /**
   * Get all images for a borrower.
   */
  async getAllForLoan(loanId) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const index = store.index('loanId');
      const req = index.getAll(loanId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Get all images across all borrowers.
   */
  async getAllImages() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Delete a single image.
   */
  async deleteImage(loanId, type) {
    if (!this.db) await this.init();
    const id = this._id(loanId, type);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Delete all images for a borrower.
   */
  async deleteAllForLoan(loanId) {
    const images = await this.getAllForLoan(loanId);
    for (const img of images) {
      await this.deleteImage(loanId, img.type);
    }
  },

  /**
   * Check if a borrower has a specific image.
   */
  async hasImage(loanId, type) {
    const record = await this.getImage(loanId, type);
    return record !== null;
  },

  /**
   * Convert blob to base64 for ZIP export.
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Convert base64 to Blob for ZIP import.
   */
  base64ToBlob(base64, mimeType) {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType || 'image/jpeg' });
  }
};
