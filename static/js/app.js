/* Просмотр xls/xlsx из ./databases: парсинг на клиенте через SheetJS */
let panels = [];
let activeId = null;
const wbCache = {};      // имя файла -> workbook (кэш, чтобы не качать повторно)
const currentSheet = {}; // имя файла -> выбранный лист

function esc(s) {
    const suf = { 34: "quot;", 38: "amp;", 39: "#39;", 60: "lt;", 62: "gt;" };
    return String(s).replace(/[&<>"']/g, c => "&" + suf[c.charCodeAt(0)]);
}

async function loadPanels() {
    const res = await fetch("/api/dbs");
    const data = await res.json();

    document.getElementById("page-title").textContent = data.title || "";
    panels = data.panels || [];

    renderButtons();
    if (panels.length) selectPanel(panels[0]);
}

function renderButtons() {
    const container = document.getElementById("buttons");
    container.innerHTML = "";

    panels.forEach(name => {
        const btn = document.createElement("button");
        btn.className = "panels__item";
        btn.dataset.id = name;
        btn.textContent = name;
        btn.addEventListener("click", () => selectPanel(name));
        container.appendChild(btn);
    });
}

async function selectPanel(name) {
    activeId = name;

    document.querySelectorAll(".panels__item").forEach(b => {
        b.classList.toggle("panels__item--active", b.dataset.id === name);
    });

    const content = document.getElementById("content");
    content.innerHTML = `
    <div class="content__header">
        <button class="content__action" title="Обновить" aria-label="Обновить">
        ↻
        </button>
        <h2 class="content__title">${esc(name)}</h2>
    </div>
    <p class="content__status content__status--loading">Загрузка…</p>
  `;
    // перезапуск анимации
    content.style.animation = "none";
    void content.offsetWidth;
    content.style.animation = "";

    try {
        let wb = wbCache[name];
        if (!wb) {
            const res = await fetch(`/databases/${encodeURIComponent(name)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = await res.arrayBuffer();
            wb = XLSX.read(buf, { type: "array" }); // работает с .xls и .xlsx
            wbCache[name] = wb;
        }

        if (!currentSheet[name] || !wb.Sheets[currentSheet[name]]) {
            currentSheet[name] = wb.SheetNames[0];
        }
        renderWorkbook(name, wb);
    } catch (err) {
        content.innerHTML = `
      <h2 class="content__title">${esc(name)}</h2>
      <p class="content__status content__status--error">Ошибка загрузки: ${esc(err.message)}</p>
    `;
    }
}

function renderWorkbook(name, wb) {
    const content = document.getElementById("content");
    const sn = currentSheet[name];
    const ws = wb.Sheets[sn];

    const tabs = wb.SheetNames.map(s => {
        const cls = s === sn ? "sheet-tabs__tab sheet-tabs__tab--active" : "sheet-tabs__tab";
        return `<button class="${cls}" data-sheet="${esc(s)}">${esc(s)}</button>`;
    }).join("");

    const html = XLSX.utils.sheet_to_html(ws, { id: "sheet-table" });

    content.innerHTML = `
  <div class="content__header" style="display: flex; justify-content: space-between; align-items: center;">
    <h2 class="content__title">${esc(name)}</h2>
    <button class="sheet-tabs__tab">
        добавить запись
        </button>
    </div>
    <div class="sheet-tabs">${tabs}</div>
    <div class="content__table">${html}</div>
  `;


    content.querySelectorAll(".sheet-tabs__tab").forEach(tab => {
        tab.addEventListener("click", () => {
            currentSheet[name] = tab.dataset.sheet;
            renderWorkbook(name, wb);
        });
    });
}

loadPanels();