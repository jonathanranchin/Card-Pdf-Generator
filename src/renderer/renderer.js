// src/renderer/renderer.js
const { ipcRenderer } = require('electron'); // Import ipcRenderer
const path = require('path');
const fs = require('fs'); // Import fs for file writing

const cardListInput = document.getElementById('cardList');
const selectFolderButton = document.getElementById('selectFolder');
const generatePdfButton = document.getElementById('generatePdf');
const statusDiv = document.getElementById('status');
const selectedCardListDiv = document.getElementById('selectedCardList');
const selectedImagesFolderDiv = document.getElementById('selectedImagesFolder');

let selectedImagesFolder = null;
let cardListData = [];

// Handle file input for card_list.txt
cardListInput.addEventListener('change', async () => {
    try {
        const selectedFilePath = await ipcRenderer.invoke('select-file'); // Use ipcRenderer to select file
        if (selectedFilePath) {
            const fileContent = await fs.promises.readFile(selectedFilePath, 'utf-8'); // Read the selected file
            cardListData = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            selectedCardListDiv.innerHTML = `Selected card list: ${selectedFilePath}`;
            console.log('Card list contents:', cardListData); // Debugging
        } else {
            selectedCardListDiv.innerHTML = 'No card list file selected.';
        }
    } catch (error) {
        console.error('Error selecting file:', error);
        statusDiv.innerHTML += `<br>Error selecting file: ${error.message}`;
    }
});

// Handle folder selection for images
selectFolderButton.addEventListener('click', async () => {
    try {
        const result = await ipcRenderer.invoke('select-folder'); // Use ipcRenderer to select folder
        if (result) {
            selectedImagesFolder = result;
            selectedImagesFolderDiv.innerHTML = `Selected image folder: ${selectedImagesFolder}`;
        }
    } catch (error) {
        console.error('Error selecting folder:', error);
        statusDiv.innerHTML += `<br>Error selecting folder: ${error.message}`;
    }
});

// Handle PDF generation
generatePdfButton.addEventListener('click', async () => {
    if (!selectedImagesFolder || !cardListData.length) {
        statusDiv.innerHTML = 'Please select both an image folder and a card list file.';
        return;
    }

    statusDiv.innerText = 'Generating PDF...';

    try {
        const pdfBytes = await ipcRenderer.invoke('create-pdf', { cardList: cardListData, imagesFolder: selectedImagesFolder });
        const pdfPath = path.join(selectedImagesFolder, 'cards.pdf');
        fs.writeFileSync(pdfPath, pdfBytes); // Save the PDF

        statusDiv.innerHTML += `<br>PDF created successfully at ${pdfPath}`;
    } catch (error) {
        statusDiv.innerHTML += `<br>Error: ${error.message}`;
    }
});
