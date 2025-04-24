// Funktion zum Setzen der ausgewählten Query
function setQuery() {
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

    if (selectedQuery.includes('${')) {
        additionalAreaParamContainer.classList.remove('hidden');
    } else {
        additionalAreaParamContainer.classList.add('hidden');
    }
}


document.addEventListener('DOMContentLoaded', function () {
    loadQueriesFromApi('/api/queries', 'querySelect');
})

function loadQueriesFromApi(apiUrl, selectElementId) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(queries => {
            const querySelect = document.getElementById(selectElementId);
            querySelect.innerHTML = ''; // Vorherige Optionen entfernen
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

document.getElementById('uploadMultipleFilesForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Verhindert das Standard-Formular-Submit-Verhalten
    uploadMultipleCsvFilesAndFetchTables('csvFiles');
});

function uploadMultipleCsvFilesAndFetchTables(fileInputId) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block'; // Ladeindikator anzeigen

    const fileInput = document.getElementById(fileInputId);
    if (!fileInput.files.length) {
        alert('Bitte wähle mindestens eine Datei aus.');
        loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        return;
    }

    const formData = new FormData();
    for (const file of fileInput.files) {
        formData.append('files', file);
    }

    fetch('/api/upload-multiple-csvs', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return fetch('/api/get-tables'); // Tabellen abrufen
            } else {
                throw new Error('Fehler beim Hochladen der Dateien.');
            }
        })
        .then(response => response.json())
        .then(tables => {
            const select = document.getElementById('tableSelect');
            select.innerHTML = ''; // Vorherige Optionen entfernen
            tables.forEach(table => {
                const option = document.createElement('option');
                option.value = table;
                option.textContent = table;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Ein Fehler ist aufgetreten.');
        })
        .finally(() => {
            loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        });
}


// Abfrage ausführen
function executeQuery() {
    const selectedTable = document.getElementById('tableSelect').value;
    const query = `
        SELECT pedID, MAX(time) - MIN(time) AS Duration
        FROM ${selectedTable}
        WHERE posX BETWEEN :posXMin AND :posXMax AND posY BETWEEN :posYMin AND :posYMax
        GROUP BY pedID
        HAVING COUNT(*) > 2;
    `;
    // Senden Sie die Abfrage an das Backend
    fetch('/api/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, params: { posXMin: 0, posXMax: 10, posYMin: 0, posYMax: 10 } })
    })
    .then(response => response.json())
    .then(data => console.log(data));
}

let selectedChartType = 'bar'; // Standard-Diagrammtyp

function setChartTypeAndUpdate(type) {
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
                  alert('Tabelle wird ersetzt.');
      queryWithParam = queryWithParam
             .replace('${selectedTable}', selectedTable);
     }


    // Ersetze die Platzhalter "${...}" nur, wenn sie in der Query vorhanden sind
    if (query.includes('${p')) {
                      alert('posXMin.');
        queryWithParam = queryWithParam
            .replace('${posXMin}', posXMin)
            .replace('${posXMax}', posXMax)
            .replace('${posYMin}', posYMin)
            .replace('${posYMax}', posYMax);
    }

    selectedChartType = type;
     alert(queryWithParam);
    fetchAndUpdateChart(queryWithParam);
}

let chartInstance;

function fetchAndUpdateChart(query) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block'; // Ladeindikator anzeigen

    const url = '/api/execute-query';
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query})
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden

            if (data.length === 0) {
                alert('Keine Daten gefunden.');
                return;
            }

            const columnNames = Object.keys(data[0]);
            const xAxisLabel = columnNames[0];
            const yAxisLabel = columnNames[1];

            const labels = data.map(item => item[xAxisLabel]);
            const values = data.map(item => item[yAxisLabel]);

            // Zerstöre das bestehende Diagramm, falls vorhanden
            if (chartInstance) {
                chartInstance.destroy();
            }

            const ctx = document.getElementById('resultChart').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: selectedChartType, // Verwende den ausgewählten Diagrammtyp
                data: {
                    labels: labels,
                    datasets: [{
                        label: yAxisLabel,
                        data: selectedChartType === 'scatter' ? data.map(item => ({
                            x: item[xAxisLabel],
                            y: item[yAxisLabel]
                        })) : values,
                        backgroundColor: 'rgba(27, 107, 189, 0.2)',
                        borderColor: 'rgba(27, 107, 189, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: `Diagramm: ${xAxisLabel} vs ${yAxisLabel}`
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: xAxisLabel
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: yAxisLabel
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => {
            loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}
