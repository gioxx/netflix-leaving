const rows = document.getElementById("rows");
const total = document.getElementById("total");
const lastSync = document.getElementById("last-sync");
const empty = document.getElementById("empty");

const formatDate = (value) => {
  if (!value) return "n/d";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
};

const render = (data) => {
  const results = Array.isArray(data.results) ? data.results : [];
  rows.innerHTML = "";

  if (!results.length) {
    empty.textContent = "Nessun dato disponibile";
    return;
  }

  empty.style.display = "none";
  total.textContent = `${results.length} titoli`;
  const fetchedAt = data.fetched_at ? new Date(data.fetched_at) : null;
  lastSync.textContent = fetchedAt && !Number.isNaN(fetchedAt.getTime())
    ? `Sync: ${fetchedAt.toLocaleString("it-IT")}`
    : "Sync: sconosciuto";

  results
    .sort((a, b) => (a.expiredate || "").localeCompare(b.expiredate || ""))
    .forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.title || "Titolo n/d"}</td>
        <td><span class="pill">${item.title_type || item.type || item.vtype || "n/d"}</span></td>
        <td>${formatDate(item.expiredate || item.unogsdate)}</td>
        <td>${(item.countrycodes || []).join(", ") || "—"}</td>
      `;
      rows.appendChild(tr);
    });
};

const loadData = async () => {
  try {
    const res = await fetch("./data/latest.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    render(payload);
  } catch (err) {
    empty.textContent = `Errore nel caricamento: ${err.message}`;
  }
};

loadData();
