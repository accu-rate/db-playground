// js/query.js
import {hideElement, sendRequestToBackend, showElement} from '../utils/utils.js';
import {filterTypeElement} from '../constants.js';
import {destroyFormerChart} from '../result/chart.js';
import {invertMapAssignment} from '../utils/mapping.js';

export const QUERY_NAME_PEDS_VS_EVACTIME = 'Anzahl Personen vs. Räumungszeit'; // be careful with this name, it is used in queries-duckdb.sql - I know, very bad practice
export const QUERY_NAME_EXITS_VS_EVACTIME = 'Anzahl Ausgänge vs. Räumungszeit'; // be careful with this name, it is used in queries-duckdb.sql - I know, very bad practice
export let cachedQueries = []; // Array für mehrere Abfragen

export function clearAllQueries() {
    // Leere das Array der gespeicherten Queries
    cachedQueries.length = 0;

    // Entferne alle Listenelemente aus query table
    const queryTableBody = document.querySelector('#queryTable tbody');
    queryTableBody.innerHTML = '';
    destroyFormerChart()
    const chartForm = document.getElementById('chartForm');
    hideElement(chartForm);
}

export function deleteSelectedQueries() {
    const chartDisplay = document.getElementById('chartDisplay');
    hideElement(chartDisplay);

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
        showElement(queryForm);

        querySelect.innerHTML = '';

        // Standardoption hinzufügen
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Wähle eine Abfrage --';
        querySelect.appendChild(defaultOption);

        // Queries hinzufügen
        for (const [name, query] of Object.entries(queries)) {
            if (name === QUERY_NAME_EXITS_VS_EVACTIME) {
                const typeFilter = document.getElementById(filterTypeElement);
                const options = Array.from(typeFilter.options);
                const containsTrueOrFalse = options.some(option => option.value === 'availability');
                if (!containsTrueOrFalse) {
                    continue;
                }
            }
            if (name === QUERY_NAME_PEDS_VS_EVACTIME) {
                const typeFilter = document.getElementById(filterTypeElement);
                const options = Array.from(typeFilter.options);
                const containsTrueOrFalse = options.some(option => option.value === 'noOfPeds');
                if (!containsTrueOrFalse) {
                    continue;
                }
            }
            if (name === QUERY_NAME_EXITS_VS_EVACTIME || name === QUERY_NAME_PEDS_VS_EVACTIME) {
                const constraintTypeFilter = document.getElementById('constraintValue');
                const constraintOptions = Array.from(constraintTypeFilter.options);
                const containsEvacTime = constraintOptions.some(option => invertMapAssignment(option.value).type === 'evacuationTime');
                if (!containsEvacTime) {

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
