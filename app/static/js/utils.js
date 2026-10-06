/* Утилиты: экранирование HTML и мелкие DOM-помощники. */

/** Экранирует строку для безопасной вставки в HTML. */
export function esc(s) {
    const suf = { 34: "quot;", 38: "amp;", 39: "#39;", 60: "lt;", 62: "gt;" };
    return String(s).replace(/[&<>"']/g, c => "&" + suf[c.charCodeAt(0)]);
}

/** Возвращает ` name="value"` для атрибута или пустую строку, если значения нет. */
export function attr(name, value) {
    return value == null || value === "" ? "" : ` ${name}="${esc(value)}"`;
}

/** Перезапускает CSS-анимацию элемента (например, появление контента). */
export function restartAnimation(el) {
    el.style.animation = "none";
    void el.offsetWidth; // принудительный reflow
    el.style.animation = "";
}