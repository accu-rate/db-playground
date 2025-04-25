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
    loadQueriesFromApiAndFillOptions('/api/queries', 'querySelect');

    document.getElementById('uploadMultipleFilesForm').addEventListener('submit', function (event) {
        event.preventDefault();
        uploadMultipleCsvFilesAndFetchTables('csvFiles');
    });

    document.getElementById('resetDatabaseButton').addEventListener('click', () => {
        resetDatabase();
    });

    document.getElementById('importDatabaseButton').addEventListener('click', importDatabase);

    document.getElementById('tableSelect').addEventListener('change', async () => {
        console.log('Tabelle gewechselt');
        const selectedTable = document.getElementById('tableSelect').value;

        if (!selectedTable) {
            updateQueryOptions([]); // Leere die Query-Auswahl
            return;
        }

        // Hole die Spalten der ausgewählten Tabelle (z. B. über eine API)
        const tableColumns = await fetch(`/api/get-columns?table=${encodeURIComponent(selectedTable)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP-Fehler! Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Tabellenspalten:', error);
                return [];
            });

        const filteredQueries = await filterQueriesFromQuerySelect(selectedTable, tableColumns);
        if (Array.isArray(filteredQueries)) {
            updateQueryOptions(filteredQueries);
        } else {
            console.error('filteredQueries ist kein Array:', filteredQueries);
        }
    });

}


// Starte die Anwendung
document.addEventListener('DOMContentLoaded', initializeComponents);


// Exportiere die Funktionen, die im HTML verwendet werden
import {filterQueriesFromQuerySelect, loadQueriesFromApiAndFillOptions, setQuery, updateQueryOptions} from './query.js';
import {loadQueriesFromApi} from './query.js';
import {executeQuery} from './query.js';
import {uploadMultipleCsvFilesAndFetchTables} from './data.js';
import {setChartTypeAndUpdate} from './chart.js';
import {plotSelectedQueries} from './chart.js';
import {clearAllQueries} from './query.js';
import {deleteSelectedQueries} from './query.js';
import {resetDatabase} from './data.js';
import {downloadDatabase} from './data.js';
import {importDatabase} from './data.js';

window.deleteSelectedQueries = deleteSelectedQueries;
window.clearAllQueries = clearAllQueries;
window.setQuery = setQuery;
window.setChartTypeAndUpdate = setChartTypeAndUpdate;
window.executeQuery = executeQuery;
window.plotSelectedQueries = plotSelectedQueries;
window.downloadDatabase = downloadDatabase;