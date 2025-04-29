import {loadQueriesFromApiAndFillOptions} from './query.js';
import {resetDatabase, importDatabase} from './data.js';
import {initializeTableSelectListener} from './tables.js';


export function initializeApp() {
    document.getElementById('resetDatabaseButton').addEventListener('click', resetDatabase);
    document.getElementById('importDatabaseButton').addEventListener('click', importDatabase);

    document.getElementById('selectAllTablesCheckbox').addEventListener('change', function () {
        const tableSelect = document.getElementById('tableSelect');
        const isChecked = this.checked;

        // Alle Optionen in der Mehrfachauswahl auswählen oder abwählen
        for (const option of tableSelect.options) {
            option.selected = isChecked;
        }
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