// js/chart.js
let chartInstance;
let selectedChartType = 'scatter';
import { cachedQueries } from './query.js';

export function setChartTypeAndUpdate(type) {
    if (!cachedQueries) {
        alert('Keine Daten vorhanden. Bitte führe zuerst eine Abfrage aus.');
        return;
    }

    selectedChartType = type;
    plotSelectedQueries();
}


export function updateChart(data) {
    const datasets = [];
    const colors = ['rgba(27, 107, 189, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)'];

    data.forEach((dataset, index) => {
        const columnNames = Object.keys(dataset[0]);
        const xAxisLabel = columnNames[0];
        const yAxisLabel = columnNames[1];

        datasets.push({
            label: `Datensatz ${index + 1}: ${xAxisLabel} vs ${yAxisLabel}`,
            data: selectedChartType === 'scatter'
                ? dataset.map(item => ({ x: item[xAxisLabel], y: item[yAxisLabel] }))
                : dataset.map(item => item[yAxisLabel]),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.2', '1'),
            borderWidth: 1
        });
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById('resultChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: selectedChartType,
        data: {
            labels: data[0].map(item => item[Object.keys(item)[0]]), // Labels basieren auf der ersten Abfrage
            datasets: datasets
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Kombinierte Abfragen'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'X-Achse'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Y-Achse'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}


export function plotSelectedQueries() {
   const selectedIndices = Array.from(document.querySelectorAll('#queryTable tbody input[type="checkbox"]:checked'))
    .map(checkbox => parseInt(checkbox.value));

    if (selectedIndices.length === 0) {
        alert('Bitte wähle mindestens eine Abfrage aus.');
        return;
    }

    const selectedData = selectedIndices.map(index => cachedQueries[index].data);
    updateChart(selectedData); // Nutze die `updateChart`-Funktion, um die Daten zu plotten
}
