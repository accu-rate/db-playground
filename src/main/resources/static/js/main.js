// js/main.js
async function loadComponent(elementId, path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component ${path}:`, error);
    }
}

// Lade alle Komponenten beim Start
async function initializeComponents() {
    await Promise.all([
        loadComponent('header', 'html/header.html'),
        loadComponent('query-section', 'html/query-section.html'),
        loadComponent('upload-section', 'html/upload-section.html'),
        loadComponent('chart-section', 'html/chart-section.html')
    ]);

    // Initialisiere die Anwendung nach dem Laden aller Komponenten
    initializeApp();
}

function initializeApp() {
    // Hier kommt der bereits existierende Initialisierungscode
    loadQueriesFromApi('/api/queries', 'querySelect');

    document.getElementById('uploadMultipleFilesForm').addEventListener('submit', function (event) {
        event.preventDefault();
        uploadMultipleCsvFilesAndFetchTables('csvFiles');
    });

    document.getElementById('resetDatabaseButton').addEventListener('click', () => {
        resetDatabase();
    });
}



// Starte die Anwendung
document.addEventListener('DOMContentLoaded', initializeComponents);


// Exportiere die Funktionen, die im HTML verwendet werden
import { setQuery } from './query.js';
import { loadQueriesFromApi } from './query.js';
import { executeQuery } from './query.js';
import { uploadMultipleCsvFilesAndFetchTables } from './data.js';
import { setChartTypeAndUpdate } from './chart.js';
import { plotSelectedQueries } from './chart.js';
import { clearAllQueries } from './query.js';
import { deleteSelectedQueries } from './query.js';
import { initializeTableSelectListener } from './tables.js';
import { resetDatabase } from './data.js';
import { downloadDatabase } from './data.js';

window.deleteSelectedQueries = deleteSelectedQueries;
window.clearAllQueries = clearAllQueries;
window.setQuery = setQuery;
window.setChartTypeAndUpdate = setChartTypeAndUpdate;
window.executeQuery = executeQuery;
window.plotSelectedQueries = plotSelectedQueries;
window.downloadDatabase = downloadDatabase;