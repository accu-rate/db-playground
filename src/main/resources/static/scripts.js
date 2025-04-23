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
        additionalAreaParamContainer.classList.remove('hidden');
        } else if (selectedQuery.includes('${')) {
           additionalAreaParamContainer.classList.add('hidden');
           additionalParamContainer.style.display = 'none';
    } else{
             additionalAreaParamContainer.classList.remove('hidden'); // Eingabefelder anzeigen
             additionalParamContainer.style.display = 'none';
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

document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Verhindert das Standard-Formular-Submit-Verhalten
    uploadCsvFile('csvFile');
});

function uploadCsvFile(fileInputId) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block'; // Ladeindikator anzeigen

    const fileInput = document.getElementById(fileInputId);
    if (!fileInput.files[0]) {
        alert('Bitte wähle eine Datei aus.');
        loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    return fetch('/api/upload-csv', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        if (!response.ok) {
            alert('Fehler beim Hochladen der Datei.');
        }
    })
    .catch(error => {
        loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        console.error('Fehler beim Hochladen:', error);
        alert('Ein Fehler ist aufgetreten.');
    });
}

let selectedChartType = 'bar'; // Standard-Diagrammtyp

function setChartTypeAndUpdate(type) {
 selectedChartType = type;
 const query = document.getElementById('query').value;
 const additionalParam = document.getElementById('additionalParam').value;
 const posXMin = document.getElementById('posXMin').value;
 const posXMax = document.getElementById('posXMax').value;
 const posYMin = document.getElementById('posYMin').value;
 const posYMax = document.getElementById('posYMax').value;

 if (!query) {
     alert('Bitte wähle zuerst eine Abfrage aus.');
     return;
 }

 // Ersetze den Platzhalter "?" nur, wenn er in der Query vorhanden ist
 let queryWithParam = query.includes('?') ? query.replace('?', additionalParam) : query;

 // Ersetze die Platzhalter "${...}" nur, wenn sie in der Query vorhanden sind
 if (query.includes('${')) {
     queryWithParam = queryWithParam
         .replace('${posXMin}', posXMin)
         .replace('${posXMax}', posXMax)
         .replace('${posYMin}', posYMin)
         .replace('${posYMax}', posYMax);
 }

 fetchAndUpdateChart(queryWithParam);
 }

let chartInstance;

function fetchAndUpdateChart(query) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block'; // Ladeindikator anzeigen

    const url = '/api/custom-query';
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
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
        .catch(error => {
            loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}
