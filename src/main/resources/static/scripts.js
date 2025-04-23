    // Funktion zum Setzen der ausgewählten Query
    function setQuery() {
        const querySelect = document.getElementById('querySelect');
        const queryTextarea = document.getElementById('query');
        queryTextarea.value = querySelect.value;
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
let chartInstance; // Globale Variable für das Diagramm
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
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: yAxisLabel,
                        data: values,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
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

document.getElementById('queryForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.getElementById('query').value;
    fetchAndUpdateChart(query);
});