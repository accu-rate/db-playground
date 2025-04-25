import {loadQueriesFromApiAndFillOptions} from './query.js';
import {uploadMultipleCsvFilesAndFetchTables, resetDatabase, importDatabase} from './data.js';
import {filterQueriesFromQuerySelect, updateQueryOptions} from './query.js';

export function initializeApp() {
    loadQueriesFromApiAndFillOptions('/api/queries', 'querySelect');

    document.getElementById('uploadMultipleFilesForm').addEventListener('submit', function (event) {
        event.preventDefault();
        uploadMultipleCsvFilesAndFetchTables('csvFiles');
    });

    document.getElementById('resetDatabaseButton').addEventListener('click', resetDatabase);
    document.getElementById('importDatabaseButton').addEventListener('click', importDatabase);

    document.getElementById('tableSelect').addEventListener('change', async () => {
        const selectedTable = document.getElementById('tableSelect').value;

        if (!selectedTable) {
            updateQueryOptions([]);
            return;
        }

        const tableColumns = await fetch(`/api/get-columns?table=${encodeURIComponent(selectedTable)}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Fehler beim Abrufen der Tabellenspalten:', error);
                return [];
            });

        const filteredQueries = await filterQueriesFromQuerySelect(selectedTable, tableColumns);
        updateQueryOptions(filteredQueries);
    });


    const queryTable = document.getElementById('queryTable');
    const headerCheckbox = document.getElementById('headerCheckbox');

// Event-Listener für die Header-Checkbox
    headerCheckbox.addEventListener('change', () => {
        const isChecked = headerCheckbox.checked;
        const checkboxes = queryTable.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });

// Event-Delegation für die Tabelle
    queryTable.addEventListener('change', (event) => {
        if (event.target.matches('tbody input[type="checkbox"]')) {
            const checkboxes = queryTable.querySelectorAll('tbody input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            const someChecked = Array.from(checkboxes).some(cb => cb.checked);

            headerCheckbox.checked = allChecked;
            headerCheckbox.indeterminate = !allChecked && someChecked;
        }
    });

}