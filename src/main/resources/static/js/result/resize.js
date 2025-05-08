import {plotSelectedQueries} from './chart.js';

export function makeCanvasResizable() {
    const container = document.querySelector('.resizable-container');
    const canvas = document.getElementById('resultChart');

    const resizeObserver = new ResizeObserver(() => {
        console.log('resizeObserver', container.clientWidth, container.clientHeight);
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        plotSelectedQueries();
    });

    resizeObserver.observe(container);

}