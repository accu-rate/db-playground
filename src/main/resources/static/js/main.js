document.addEventListener('DOMContentLoaded', async () => {
    await initializeComponents();
    initializeApp();
});


// Exportiere die Funktionen, die im HTML verwendet werden
import {initializeComponents} from './components.js';
import {initializeApp} from './init.js';
import {executeQuery} from './query.js';
import {setChartTypeAndUpdate} from './chart.js';
import {plotSelectedQueries} from './chart.js';
import {clearAllQueries} from './query.js';
import {setQuery} from './query.js';
import {deleteSelectedQueries} from './query.js';
import {downloadDatabase} from './data.js';
import {applyFilters} from './filter.js';


window.deleteSelectedQueries = deleteSelectedQueries;
window.clearAllQueries = clearAllQueries;
window.setQuery = setQuery;
window.setChartTypeAndUpdate = setChartTypeAndUpdate;
window.executeQuery = executeQuery;
window.plotSelectedQueries = plotSelectedQueries;
window.downloadDatabase = downloadDatabase;
window.applyFilters = applyFilters;