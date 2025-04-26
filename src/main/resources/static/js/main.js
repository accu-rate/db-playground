document.addEventListener('DOMContentLoaded', async () => {
    await initializeComponents();
    initializeApp();
});


// Exportiere die Funktionen, die im HTML verwendet werden
import {initializeComponents} from './components.js';
import {initializeApp} from './init.js';
import {
    executeQuery,
    clearAllQueries,
    setQuery,
    deleteSelectedQueries
} from './query.js';
import {
    setChartTypeAndUpdate,
    plotSelectedQueries
} from './chart.js';
import {
    downloadDatabase,
    processVariantFolder
} from './data.js';
import {applyFilters, resetFilters} from './filter.js';

window.deleteSelectedQueries = deleteSelectedQueries;
window.clearAllQueries = clearAllQueries;
window.setQuery = setQuery;
window.setChartTypeAndUpdate = setChartTypeAndUpdate;
window.executeQuery = executeQuery;
window.plotSelectedQueries = plotSelectedQueries;
window.downloadDatabase = downloadDatabase;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.processVariantFolder = processVariantFolder;