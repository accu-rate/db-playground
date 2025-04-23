    // Funktion zum Setzen der ausgewählten Query
function setQuery() {
    const querySelect = document.getElementById('querySelect');
    const queryTextarea = document.getElementById('query');
    const additionalParamContainer = document.getElementById('additionalParamContainer');

    const selectedQuery = querySelect.value;
    queryTextarea.value = selectedQuery;

    // Überprüfen, ob die Query einen Platzhalter "?" enthält
    if (selectedQuery.includes('?')) {
        additionalParamContainer.style.display = 'block'; // Eingabefeld anzeigen
    } else {
        additionalParamContainer.style.display = 'none'; // Eingabefeld ausblenden
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


// Funktion zum Hochladen der CSV-Datei
function uploadCsvFile(fileInputId) {
    const fileInput = document.getElementById(fileInputId);
if (!fileInput.files[0]) {
    alert('Bitte wähle eine Datei aus.');
    return;
}
const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    return fetch('/api/upload-csv', {
        method: 'POST',
        body: formData
    });
}

// Event-Listener für das Formular
document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    uploadCsvFile('csvFile')
        .then(response => {
            if (response.ok) {
                alert('Datei erfolgreich hochgeladen und verarbeitet.');
            } else {
                alert('Fehler beim Hochladen der Datei.');
            }
        })
        .catch(error => console.error('Fehler beim Hochladen:', error));
});

let selectedChartType = 'bar'; // Standard-Diagrammtyp

function setChartTypeAndUpdate(type) {
    selectedChartType = type;
    const query = document.getElementById('query').value;
    const additionalParam = document.getElementById('additionalParam').value;

    if (!query) {
        alert('Bitte wähle zuerst eine Abfrage aus.');
        return;
    }


    // Ersetze den Platzhalter "?" nur, wenn er in der Query vorhanden ist
    const queryWithParam = query.includes('?') ? query.replace('?', additionalParam) : query;

    fetchAndUpdateChart(queryWithParam);}

let chartInstance;

function fetchAndUpdateChart(query) {
    const url = '/api/custom-query';
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
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
                        data: selectedChartType === 'scatter' ? data.map(item => ({ x: item[xAxisLabel], y: item[yAxisLabel] })) : values,
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
        .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

