// src/main/main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

// Create the main application window
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,  // Enable Node.js integration for simplicity
            contextIsolation: false, // Disable context isolation
        },
    });

    win.loadFile(path.join(__dirname, '../renderer/index.html')); // Load your HTML
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle folder selection request from renderer
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
});

// Handle file selection request from renderer
ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }],
    });
    return result.canceled ? null : result.filePaths[0];
});

// Handle PDF creation request from renderer
ipcMain.handle('create-pdf', async (event, { cardList, imagesFolder }) => {
    try {
        const pdfDoc = await PDFDocument.create();
        const imagesToProcess = cardList.length > 0 
            ? cardList 
            : fs.readdirSync(imagesFolder).filter(file => /\.(jpg|jpeg|png)$/i.test(file));
        
        let totalCards = imagesToProcess.length;
        let processedCards = 0;

        for (const card of imagesToProcess) {
            const imagePath = path.join(imagesFolder, card);
            if (fs.existsSync(imagePath)) {
                const imageBytes = fs.readFileSync(imagePath);
                const ext = path.extname(imagePath).toLowerCase();
                let image;

                if (ext === '.jpg' || ext === '.jpeg') {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else if (ext === '.png') {
                    image = await pdfDoc.embedPng(imageBytes);
                } else {
                    console.warn(`Unsupported image type: ${ext}`);
                    continue; // Skip unsupported image types
                }

                const { width, height } = image.scale(1);
                const page = pdfDoc.addPage([width, height]);
                page.drawImage(image, { x: 0, y: 0, width, height });

                processedCards++;
                event.sender.send('progress-update', `Processed ${processedCards}/${totalCards}: ${card}`);
            } else {
                console.warn(`Image not found: ${imagePath}`);
                event.sender.send('progress-update', `Image not found: ${imagePath}`);
            }
        }

        console.log('PDF creation complete. Generating PDF bytes...');
        return await pdfDoc.save(); // Return PDF bytes
    } catch (error) {
        console.error('Error creating PDF:', error);
        throw new Error('Error creating PDF: ' + error.message);
    }
});
