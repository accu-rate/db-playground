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
            const xAxisLabel = columnNames[1];
            const yAxisLabel = columnNames[0];

            const labels = data.map(item => item[xAxisLabel]);
            const values = data.map(item => item[yAxisLabel]);

            if (chartInstance) {
                chartInstance.data.labels = labels;
                chartInstance.data.datasets[0].data = values;
                chartInstance.data.datasets[0].label = yAxisLabel;
                chartInstance.options.plugins.title.text = `Diagramm: ${xAxisLabel} vs ${yAxisLabel}`;
                chartInstance.update();
            } else {
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
            }
        })
        .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
}

document.getElementById('queryForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.getElementById('query').value;
    fetchAndUpdateChart(query);
});