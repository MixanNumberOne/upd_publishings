/* HTML-компоненты*/
import { esc, attr } from "./utils.js";

/** Кнопка-действие в шапке контента. */
export function actionButton({ label, title = "", ariaLabel = "", className = "content__action" }) {
    return `<button class="${className}"${attr("title", title)}${attr("aria-label", ariaLabel)}>${label}</button>`;
}

/** Шапка блока контента: заголовок слева, необязательные действия справа. */
export function contentHeader({ title, actions = "" }) {
    return `
    <div class="content__header">
        <h2 class="content__title">${esc(title)}</h2>
        ${actions}
    </div>`;
}

/** Статусное сообщение (loading / error / ...). */
export function statusMessage({ type, text }) {
    return `<p class="content__status content__status--${type}">${esc(text)}</p>`;
}

/** Блок вкладок листов книги. */
export function sheetTabs(sheetNames, activeSheet) {
    const tabs = sheetNames.map(s => {
        const cls = s === activeSheet
            ? "sheet-tabs__tab sheet-tabs__tab--active"
            : "sheet-tabs__tab";
        return `<button class="${cls}" data-sheet="${esc(s)}">${esc(s)}</button>`;
    }).join("");
    return `<div class="sheet-tabs">${tabs}</div>`;
}

/** Таблица активного листа, обёрнутая в прокручиваемый блок. */
export function tableSection(worksheet) {
    const html = XLSX.utils.sheet_to_html(worksheet, { id: "sheet-table" });
    return `<div class="content__table">${html}</div>`;
}