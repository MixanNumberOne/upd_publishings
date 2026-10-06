/* Слой данных: запросы к серверу и кэширование. */
import { getCachedWorkbook, setCachedWorkbook } from "./state.js";

/** Загружает список панелей и заголовок страницы. */
export async function fetchPanels() {
    const res = await fetch("/api/dbs");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

/**
 * Загружает workbook (кэширует при повторном обращении).
 * Поддерживает .xls и .xlsx — парсинг делает SheetJS в браузере.
 */
export async function fetchWorkbook(name) {
    const cached = getCachedWorkbook(name);
    if (cached) return cached;

    const res = await fetch(`/databases/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });

    setCachedWorkbook(name, wb);
    return wb;
}