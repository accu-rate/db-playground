// js/query.js
import { updateChart } from './chart.js';
export function setQuery() {
    const querySelect = document.getElementById('querySelect');
    const queryTextarea = document.getElementById('query');
    const additionalParamContainer = document.getElementById('additionalParamContainer');
    const additionalAreaParamContainer = document.getElementById('additionalAreaParamContainer');

    const selectedQuery = querySelect.value;
    queryTextarea.value = selectedQuery;
    if (selectedQuery.includes('?')) {
        additionalParamContainer.style.display = 'block';
    } else {
        additionalParamContainer.style.display = 'none';
    }

    if (selectedQuery.includes('${x')) {
        additionalAreaParamContainer.classList.remove('hidden');
    } else {
        additionalAreaParamContainer.classList.add('hidden');
    }
}

export let cachedData; // Variable zum Zwischenspeichern der Daten
export function executeQuery() {
    const query = finalizeQuery();

    if (!query) {
        alert('Bitte wähle zuerst eine Abfrage aus.');
        return;
    }

    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    const url = '/api/execute-query';
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = 'none';

            if (data.length === 0) {
                alert('Keine Daten gefunden.');
                return;
            }

            cachedData = data; // Daten zwischenspeichern
            updateChart(data); // Diagramm initial aktualisieren
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}

function finalizeQuery() {
    const query = document.getElementById('query').value;
    const additionalParam = document.getElementById('additionalParam').value;
    const posXMin = document.getElementById('posXMin').value || Number.MIN_VALUE;
    const posXMax = document.getElementById('posXMax').value || Number.MAX_VALUE;
    const posYMin = document.getElementById('posYMin').value || Number.MIN_VALUE;
    const posYMax = document.getElementById('posYMax').value || Number.MAX_VALUE;
    const selectedTable = document.getElementById('tableSelect').value;

    if (!query) {
        alert('Bitte wähle zuerst eine Abfrage aus.');
        return;
    }

    // Ersetze den Platzhalter "?" nur, wenn er in der Query vorhanden ist
    let queryWithParam = query;
    if (query.includes('?')) {
        if (!additionalParam) {
            alert('Bitte setze die Staugrenzgeschwindigkeit.');
            return;
        }
        queryWithParam = query.replace('?', additionalParam);
    }

    // Ersetze die Platzhalter "${selectedTable}" nur, wenn sie in der Query vorhanden sind
     if (query.includes('${selectedTable}')) {
      queryWithParam = queryWithParam
             .replace('${selectedTable}', selectedTable);
     }


    // Ersetze die Platzhalter "${...}" nur, wenn sie in der Query vorhanden sind
    if (query.includes('${p')) {
        queryWithParam = queryWithParam
            .replace('${posXMin}', posXMin)
            .replace('${posXMax}', posXMax)
            .replace('${posYMin}', posYMin)
            .replace('${posYMax}', posYMax);
    }
    return queryWithParam;
}

export function loadQueriesFromApi(apiUrl, selectElementId) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(queries => {
            const querySelect = document.getElementById(selectElementId);
            querySelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Wähle eine Abfrage --';
            querySelect.appendChild(defaultOption);

            for (const [name, query] of Object.entries(queries)) {
                const option = document.createElement('option');
                option.value = query;
                option.textContent = name;
                querySelect.appendChild(option);
            }
        })
        .catch(error => console.error('Fehler beim Laden der Queries:', error));
}

