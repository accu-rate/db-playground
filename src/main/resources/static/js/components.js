export async function loadComponent(elementId, path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component ${path}:`, error);
    }
}

export async function initializeComponents() {
    await Promise.all([
        loadComponent('header', 'html/header.html'),
        loadComponent('filter-section', 'html/filter-section.html'),
        loadComponent('query-section', 'html/query-section.html'),
        loadComponent('upload-section', 'html/upload-section.html'),
        loadComponent('chart-section', 'html/chart-section.html')
    ]);
}