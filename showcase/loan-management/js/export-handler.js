/* ========================================
   Export Handler — ZIP backup/restore using JSZip
   Organized Assets Folder per Borrower Profile
   ======================================== */

const ExportHandler = {

  async exportFullBackup(members, loans, payments, settings) {
    const zip = new JSZip();

    // 1. Generate Master Excel File
    const excelBlob = ExcelHandler.buildExcelBlob(members, loans, payments, settings);
    const arrayBuffer = await excelBlob.arrayBuffer();
    zip.file('loan_data.xlsx', arrayBuffer);

    // 2. Add images organized by Borrower Folder inside assets/
    try {
      const allImages = await ImageHandler.getAllImages();
      const assetsFolder = zip.folder('assets');
      const flatImagesFolder = zip.folder('images');

      for (const img of allImages) {
        if (img.blob) {
          const ext = this._getExt(img.mimeType || 'image/jpeg');
          const member = (members || []).find(m => m.personId === img.loanId);
          const safeName = member ? `${member.personId}_${member.name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}` : img.loanId;
          const memberFolder = assetsFolder.folder(safeName);

          const base64 = await ImageHandler.blobToBase64(img.blob);
          
          // Organized folder: assets/P001_Rajesh_Kumar/photo.jpg
          memberFolder.file(`${img.type}${ext}`, base64, { base64: true });
          
          // Flat folder for backwards compatibility: images/P001_photo.jpg
          flatImagesFolder.file(`${img.loanId}_${img.type}${ext}`, base64, { base64: true });
        }
      }
    } catch (err) { console.warn('Could not export images:', err); }

    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    this._download(zipBlob, 'lamba_enterprises_master_backup.zip');
    return zipBlob;
  },

  async exportAssetsOnlyZip(members) {
    const zip = new JSZip();
    try {
      const allImages = await ImageHandler.getAllImages();
      const assetsFolder = zip.folder('assets');

      for (const img of allImages) {
        if (img.blob) {
          const ext = this._getExt(img.mimeType || 'image/jpeg');
          const member = (members || []).find(m => m.personId === img.loanId);
          const safeName = member ? `${member.personId}_${member.name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}` : img.loanId;
          const memberFolder = assetsFolder.folder(safeName);
          const base64 = await ImageHandler.blobToBase64(img.blob);
          memberFolder.file(`${img.type}${ext}`, base64, { base64: true });
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      this._download(zipBlob, 'borrower_assets_folders.zip');
      return zipBlob;
    } catch (err) {
      console.error('Export assets zip failed:', err);
      throw err;
    }
  },

  async importFullBackup(zipFile) {
    const zip = await JSZip.loadAsync(zipFile);
    let data = null;
    const xlsxFile = zip.file('loan_data.xlsx');
    if (xlsxFile) {
      const xlsxData = await xlsxFile.async('arraybuffer');
      const wb = XLSX.read(xlsxData, { type: 'array', cellDates: true });
      data = ExcelHandler.parseWorkbook(wb);
    }
    if (!data) throw new Error('No loan_data.xlsx found in ZIP');

    // Import images from both assets/ and images/
    const imageFiles = [];
    zip.forEach((path, file) => {
      if (!file.dir && (path.startsWith('assets/') || path.startsWith('images/'))) {
        imageFiles.push({ path, file });
      }
    });

    for (const { path, file } of imageFiles) {
      try {
        const parts = path.split('/');
        let personId = '';
        let type = '';

        if (path.startsWith('assets/') && parts.length >= 3) {
          // assets/P001_Rajesh_Kumar/photo.jpg
          const folderName = parts[1];
          personId = folderName.split('_')[0];
          const filename = parts[2];
          type = filename.replace(/\.[^.]+$/, '');
        } else if (path.startsWith('images/')) {
          // images/P001_photo.jpg
          const filename = parts[parts.length - 1].replace(/\.[^.]+$/, '');
          const fnParts = filename.split('_');
          personId = fnParts[0];
          type = fnParts.slice(1).join('_');
        }

        if (personId && type) {
          const blob = await file.async('blob');
          const ext = path.split('.').pop().toLowerCase();
          const mimeMap = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp' };
          const imageFile = new File([blob], path, { type: mimeMap[ext] || 'image/jpeg' });
          await ImageHandler.saveImage(personId, type, imageFile);
        }
      } catch (err) { console.warn('Import image failed:', path, err); }
    }
    return data;
  },

  _getExt(mime) {
    const map = { 'image/jpeg':'.jpg', 'image/png':'.png', 'image/webp':'.webp', 'image/gif':'.gif' };
    return map[mime] || '.jpg';
  },

  _download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
};
