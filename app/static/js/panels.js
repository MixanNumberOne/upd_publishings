/* Боковая панель со списком панелей. */
import { getPanels } from "./state.js";

/** Отрисовывает кнопки панелей. onSelect(name) вызывается по клику. */
export function renderPanelButtons(onSelect) {
    const container = document.getElementById("buttons");
    container.innerHTML = "";

    getPanels().forEach(name => {
        const btn = document.createElement("button");
        btn.className = "panels__item";
        btn.dataset.id = name;
        btn.textContent = name;
        btn.addEventListener("click", () => onSelect(name));
        container.appendChild(btn);
    });
}

/** Подсвечивает активную кнопку панели. */
export function highlightActivePanel(name) {
    document.querySelectorAll(".panels__item").forEach(b => {
        b.classList.toggle("panels__item--active", b.dataset.id === name);
    });
}