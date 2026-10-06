/* Область контента: состояния загрузки/ошибки и рендер workbook с вкладками. */
import {
    actionButton,
    contentHeader,
    statusMessage,
    sheetTabs,
    tableSection,
} from "./components.js";
import { rememberSheet, getRememberedSheet } from "./state.js";
import { restartAnimation } from "./utils.js";

// Кнопки шапки переиспользуются во всех состояниях контента.
const REFRESH_BUTTON = actionButton({ label: "↻", title: "Обновить", ariaLabel: "Обновить" });
const ADD_RECORD_BUTTON = actionButton({ label: "добавить запись", className: "sheet-tabs__tab" });

/** Показывает заголовок и статус «Загрузка…». */
export function renderLoading(name) {
    const content = document.getElementById("content");
    content.innerHTML =
        contentHeader({ title: name, actions: REFRESH_BUTTON }) +
        statusMessage({ type: "loading", text: "Загрузка…" });
    restartAnimation(content);
}

/** Показывает заголовок и сообщение об ошибке. */
export function renderError(name, err) {
    document.getElementById("content").innerHTML =
        contentHeader({ title: name }) +
        statusMessage({ type: "error", text: `Ошибка загрузки: ${err.message}` });
}

/** Отрисовывает workbook: шапка + вкладки листов + таблица активного листа. */
export function renderWorkbook(name, wb) {
    const sheet = ensureCurrentSheet(name, wb);
    const content = document.getElementById("content");

    content.innerHTML =
        contentHeader({ title: name, actions: ADD_RECORD_BUTTON }) +
        sheetTabs(wb.SheetNames, sheet) +
        tableSection(wb.Sheets[sheet]);

    attachSheetTabHandlers(name, wb);
}

/** Возвращает текущий лист книги или выбирает первый, если выбор сброшен. */
function ensureCurrentSheet(name, wb) {
    let sheet = getRememberedSheet(name);
    if (!sheet || !wb.Sheets[sheet]) {
        sheet = wb.SheetNames[0];
        rememberSheet(name, sheet);
    }
    return sheet;
}

/**
 * Переключение листов через делегирование на контейнере вкладок —
 * слушатель вешается один раз, а не на каждую вкладку при каждом рендере.
 */
function attachSheetTabHandlers(name, wb) {
    document.querySelector(".sheet-tabs").addEventListener("click", (event) => {
        const tab = event.target.closest("[data-sheet]");
        if (!tab) return;
        rememberSheet(name, tab.dataset.sheet);
        renderWorkbook(name, wb);
    });
}