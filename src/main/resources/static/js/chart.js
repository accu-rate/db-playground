// js/chart.js
let chartInstance;
let selectedChartType = 'bar';

export function setChartTypeAndUpdate(type) {
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

    selectedChartType = type;
    fetchAndUpdateChart(queryWithParam);
}

export function fetchAndUpdateChart(query) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    const url = '/api/execute-query';
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query})
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = 'none';

            if (data.length === 0) {
                alert('Keine Daten gefunden.');
                return;
            }

            updateChart(data);
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}

function updateChart(data) {
    const columnNames = Object.keys(data[0]);
    const xAxisLabel = columnNames[0];
    const yAxisLabel = columnNames[1];

    const labels = data.map(item => item[xAxisLabel]);
    const values = data.map(item => item[yAxisLabel]);

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById('resultChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: selectedChartType,
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
}