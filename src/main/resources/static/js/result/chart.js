// js/chart.js
import {showElement} from '../utils/utils.js';

let chartInstance;
let selectedChartType = 'scatter';
import {cachedQueries} from '../query/query.js';

export function setChartTypeAndUpdate(type) {
    if (!cachedQueries) {
        alert('Keine Daten vorhanden. Bitte führe zuerst eine Abfrage aus.');
        return;
    }

    selectedChartType = type;
    plotSelectedQueries();
}

export function updateChart(data) {
    console.log('updateChart', data);
    const chartSection = document.getElementById('chartDisplay');
    showElement(chartSection);

    const datasets = [];
    const colors = generateColors(data.length);
    let xAxisLabel;
    let yAxisLabel;


    data.forEach((entry, index) => {
        const dataset = entry.data;
        const label = `${entry.id} (${entry.table})`;
        const columnNames = Object.keys(dataset[0]);
        if (index === 0) { // Nur beim ersten Durchlauf setzen
            xAxisLabel = columnNames[0];
            yAxisLabel = columnNames[1];
        }

        datasets.push({
            label: label, // Verwende das dynamische Label
            data: selectedChartType === 'scatter'
                ? dataset.map(item => ({x: item[xAxisLabel], y: item[yAxisLabel]}))
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
            labels: data[0].data.map(item => item[Object.keys(item)[0]]), // Labels basieren auf der X-Achse
            datasets: datasets
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Ergebnis'
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

function generateColors(count) {
    const alpha = 0.8; // Definiere den Alpha-Wert als Variable

    const baseColors = [
        `rgba(27, 107, 189, ${alpha})`,  // Mittelblau
        `rgba(13, 51, 89, ${alpha})`,    // Dunkelblau
        `rgba(255, 107, 43, ${alpha})`,  // Orange
        `rgba(255, 140, 85, ${alpha})`,  // Helles Orange
        `rgba(204, 221, 237, ${alpha})`, // Helles Graublau
        `rgba(0, 82, 155, ${alpha})`,    // Tiefblau
        `rgba(233, 234, 242, ${alpha})`, // Graublau
        `rgba(255, 178, 128, ${alpha})`, // Pastellorange
        `rgba(189, 204, 221, ${alpha})`, // Blasses Blau
        `rgba(102, 153, 204, ${alpha})`  // Mittelgraublau
    ];
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]); // Wiederhole Farben, falls nötig
    }
    return colors;
}


export function plotSelectedQueries() {
    const selectedIndices = Array.from(document.querySelectorAll('#queryTable tbody input[type="checkbox"]:checked'))
        .map(checkbox => parseInt(checkbox.value));

    if (selectedIndices.length === 0) {
      //  alert('Bitte wähle mindestens eine Abfrage aus.');
        return;
    }

    const selectedData = selectedIndices.map(index => cachedQueries[index]);
    console.log('selectedData', selectedData);
    updateChart(selectedData);
}
