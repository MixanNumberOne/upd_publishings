/* Глобальное состояние приложения. */

const state = {
    panels: [],
    activeId: null,
    wbCache: new Map(),      // имя файла -> workbook (кэш, чтобы не качать повторно)
    currentSheet: new Map(), // имя файла -> выбранный лист
};

export function setPanels(panels) { state.panels = panels; }
export function getPanels() { return state.panels; }

export function setActivePanel(name) { state.activeId = name; }
export function getActivePanel() { return state.activeId; }

export function getCachedWorkbook(name) { return state.wbCache.get(name); }
export function setCachedWorkbook(name, wb) { state.wbCache.set(name, wb); }

export function getRememberedSheet(name) { return state.currentSheet.get(name); }
export function rememberSheet(name, sheet) { state.currentSheet.set(name, sheet); }