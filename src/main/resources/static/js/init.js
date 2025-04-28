import {loadQueriesFromApiAndFillOptions, updateQueries} from './query.js';
import {uploadMultipleCsvFilesAndFetchTables, resetDatabase, importDatabase} from './data.js';
import {initializeTableSelectListener} from './tables.js';


export function initializeApp() {
    document.getElementById('uploadMultipleFilesForm').addEventListener('submit', function (event) {
        event.preventDefault();
        uploadMultipleCsvFilesAndFetchTables('csvFiles');
    });

    document.getElementById('resetDatabaseButton').addEventListener('click', resetDatabase);
    document.getElementById('importDatabaseButton').addEventListener('click', importDatabase);

    document.getElementById('tableSelect').addEventListener('change', async () => {
        await updateQueries();
    });


    document.addEventListener('DOMContentLoaded', () => {
        const queryButton = document.getElementById('send-query');
        const tableSelect = document.getElementById('tableSelect');

        // Button deaktivieren, wenn keine Tabelle ausgewählt ist
        tableSelect.addEventListener('change', () => {
            queryButton.disabled = tableSelect.value === '';
        });
    });

    initializeTableSelectListener();
    toggleVisibility(document.getElementById('toggleAreaCheckbox'), document.getElementById('queryContainer'));

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

    function toggleVisibility(checkboxElement, containerElement) {
        checkboxElement.addEventListener('change', () => {
            if (checkboxElement.checked) {
                containerElement.classList.remove('hidden');
            } else {
                containerElement.classList.add('hidden');
            }
        });
    }
}