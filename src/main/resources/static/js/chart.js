// js/chart.js
let chartInstance;
let selectedChartType = 'scatter';
import { cachedData } from './query.js';

export function setChartTypeAndUpdate(type) {
    if (!cachedData) {
        alert('Keine Daten vorhanden. Bitte führe zuerst eine Abfrage aus.');
        return;
    }

    selectedChartType = type;
    updateChart(cachedData); // Diagramm mit zwischengespeicherten Daten aktualisieren
}

export function updateChart(data) {
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