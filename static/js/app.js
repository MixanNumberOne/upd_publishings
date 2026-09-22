/* Точка входа: связывает данные, состояние и представления. */
import { fetchPanels, fetchWorkbook } from "./api.js";
import { setPanels, getPanels, setActivePanel } from "./state.js";
import { renderPanelButtons, highlightActivePanel } from "./panels.js";
import { renderLoading, renderError, renderWorkbook } from "./workbook.js";

async function init() {
    const data = await fetchPanels();

    document.getElementById("page-title").textContent = data.title || "";
    setPanels(data.panels || []);

    renderPanelButtons(selectPanel);
    const first = getPanels()[0];
    if (first) selectPanel(first);
}

/** Выбор панели: подсветка кнопки, состояние загрузки, затем рендер книги. */
async function selectPanel(name) {
    setActivePanel(name);
    highlightActivePanel(name);

    renderLoading(name);
    try {
        const wb = await fetchWorkbook(name);
        renderWorkbook(name, wb);
    } catch (err) {
        renderError(name, err);
    }
}

init();