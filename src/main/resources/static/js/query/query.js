// js/query.js
import {sendRequestToBackend} from '../utils/utils.js';

export const QUERY_NAME_PEDS_VS_EVACTIME = 'Anzahl Personen vs. Räumungszeit'; // be careful with this name, it is used in queries-duckdb.sql - I know, very bad practice
export const QUERY_NAME_EXITS_VS_EVACTIME = 'Anzahl Ausgänge vs. Räumungszeit'; // be careful with this name, it is used in queries-duckdb.sql - I know, very bad practice
export let cachedQueries = []; // Array für mehrere Abfragen

export function clearAllQueries() {
    // Leere das Array der gespeicherten Queries
    cachedQueries.length = 0;

    // Entferne alle Listenelemente aus query table
    const queryTableBody = document.querySelector('#queryTable tbody');
    queryTableBody.innerHTML = '';
    const chartForm = document.getElementById('chartForm');
    chartForm.classList.add('hidden');
}

export function deleteSelectedQueries() {
    const chartDisplay = document.getElementById('chartDisplay');
    chartDisplay.classList.add('hidden');

    const queryTableBody = document.querySelector('#queryTable tbody');
    const selectedCheckboxes = queryTableBody.querySelectorAll('input[type="checkbox"]:checked');

    selectedCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr'); // Finde die zugehörige Tabellenzeile
        const index = parseInt(checkbox.value); // Hole den Index der Abfrage
        cachedQueries.splice(index, 1); // Entferne die Abfrage aus dem Array
        row.remove(); // Entferne die Zeile aus der Tabelle
    });

    // Aktualisiere die Werte der Checkboxen, um die Indizes zu korrigieren
    Array.from(queryTableBody.querySelectorAll('input[type="checkbox"]')).forEach((checkbox, newIndex) => {
        checkbox.value = newIndex;
    });

}

export async function loadQueriesFromApiAndFillOptions() {
    try {
        const apiUrl = '/api/queries'; // API-URL für die Queries
        console.log("Lade Queries von API:", apiUrl);
        const queries = await sendRequestToBackend(null, apiUrl);

        if (!queries || typeof queries !== 'object') {
            console.error('Ungültige API-Antwort:', queries);
            return;
        }

        const querySelect = document.getElementById('querySelect');
        if (!querySelect) {
            console.error("Element mit ID 'querySelect' nicht gefunden.");
            return;
        }
        const queryForm = document.getElementById('queryForm');
        queryForm.classList.remove('hidden');


        querySelect.innerHTML = '';

        // Standardoption hinzufügen
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Wähle eine Abfrage --';
        querySelect.appendChild(defaultOption);

        // Queries hinzufügen
        for (const [name, query] of Object.entries(queries)) {
            if (name === QUERY_NAME_EXITS_VS_EVACTIME) {
                const typeFilter = document.getElementById('typeFilter');
                const options = Array.from(typeFilter.options);
                const containsTrueOrFalse = options.some(option => option.text === 'availability');
                if (!containsTrueOrFalse) {
                    console.log("query filter." + options.map(option => option.text));
                    continue;
                }
            }
            if (name === QUERY_NAME_PEDS_VS_EVACTIME) {
                const typeFilter = document.getElementById('typeFilter');
                const options = Array.from(typeFilter.options);
                const containsTrueOrFalse = options.some(option => option.text === 'noOfPeds');
                if (!containsTrueOrFalse) {
                    console.log("query filter." + options.map(option => option.text));
                    continue;
                }
            }
            if (name === QUERY_NAME_EXITS_VS_EVACTIME || name === QUERY_NAME_PEDS_VS_EVACTIME) {
                const constraintTypeFilter = document.getElementById('constraintTypeFilter');
                const constraintOptions = Array.from(constraintTypeFilter.options);
                const containsEvacTime = constraintOptions.some(option => option.text === 'evacuationTime');
                if (!containsEvacTime) {
                    console.log("query filter." + constraintOptions.map(option => option.text));
                    continue;
                }
            }

            const option = document.createElement('option');
            option.value = query;
            option.textContent = name;
            querySelect.appendChild(option);
        }

        console.log("Queries erfolgreich geladen und hinzugefügt.");
    } catch (error) {
        console.error('Fehler beim Laden der Queries:', error.message || error);
    }
}
