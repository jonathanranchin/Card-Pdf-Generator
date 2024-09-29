/*const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs to the renderer through `window.electronAPI`
contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    selectFile: () => ipcRenderer.invoke('select-file'), // New file selection API
    createPdf: (cardList, imagesFolder) => ipcRenderer.invoke('create-pdf', { cardList, imagesFolder }),
  });
   
  const { contextBridge, ipcRenderer } = require('electron');
  const fs = require('fs');
  const path = require('path');
  
  contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: () => ipcRenderer.invoke('select-file'),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    createPdf: (cardList, imagesFolder) => ipcRenderer.invoke('create-pdf', { cardList, imagesFolder }),
    path: path, // Expose path
    fs: {
      writeFileSync: (filePath, data) => fs.writeFileSync(filePath, data),  // Expose writeFileSync
      readFileSync: (filePath, encoding) => fs.readFileSync(filePath, encoding) // Expose readFileSync
    }
  });
  */
  const { contextBridge, ipcRenderer } = require('electron');
  const fs = require('fs');
  const path = require('path');
  
  contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: () => ipcRenderer.invoke('select-file'),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    createPdf: () => ipcRenderer.invoke('create-pdf'),
    path: path,
    fs: {
      writeFileSync: (filePath, data, options) => fs.writeFileSync(filePath, data, options),
      readFileSync: (filePath, encoding) => fs.readFileSync(filePath, encoding)
    }
  });
  