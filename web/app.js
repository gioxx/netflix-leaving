const rows = document.getElementById("rows");
const total = document.getElementById("total");
const lastSync = document.getElementById("last-sync");
const empty = document.getElementById("empty");
const searchInput = document.getElementById("search");
const countryFilter = document.getElementById("country-filter");
const sortState = { key: "date", dir: "asc" };
let results = [];

const formatDate = (value) => {
  if (!value) return "n/d";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
};

const applyFilters = () => {
  const term = (searchInput.value || "").toLowerCase();
  const countrySel = countryFilter.value;
  const filtered = results.filter((item) => {
    const matchTitle = (item.title || "").toLowerCase().includes(term);
    const matchCountry = countrySel === "all" || (item.countrycodes || []).includes(countrySel);
    return matchTitle && matchCountry;
  });

  total.textContent = `${filtered.length} titoli`;
  rows.innerHTML = "";

  if (!filtered.length) {
    empty.style.display = "block";
    empty.textContent = "Nessun dato disponibile con questi filtri";
    return;
  }

  empty.style.display = "none";
  const sorted = [...filtered].sort((a, b) => {
    if (sortState.key === "title") {
      return sortState.dir === "asc"
        ? (a.title || "").localeCompare(b.title || "")
        : (b.title || "").localeCompare(a.title || "");
    }
    if (sortState.key === "country") {
      const ca = (a.countrycodes || []).join(", ");
      const cb = (b.countrycodes || []).join(", ");
      return sortState.dir === "asc" ? ca.localeCompare(cb) : cb.localeCompare(ca);
    }
    // default date
    const da = a.expiredate || "";
    const db = b.expiredate || "";
    return sortState.dir === "asc" ? da.localeCompare(db) : db.localeCompare(da);
  });

  sorted.forEach((item) => {
    const poster = item.img || item.poster || "";
    const placeholder = (item.title || "?").trim().charAt(0).toUpperCase();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><div class="poster">${poster ? `<img src="${poster}" alt="">` : `<span class="placeholder">${placeholder}</span>`}</div></td>
      <td>${item.title || "Titolo n/d"}</td>
      <td>${formatDate(item.expiredate || item.unogsdate)}</td>
      <td>${(item.countrycodes || []).join(", ") || "—"}</td>
    `;
    rows.appendChild(tr);
  });
};

const render = (data) => {
  results = Array.isArray(data.results) ? data.results : [];
  const fetchedAt = data.fetched_at ? new Date(data.fetched_at) : null;
  lastSync.textContent = fetchedAt && !Number.isNaN(fetchedAt.getTime())
    ? fetchedAt.toLocaleString("it-IT")
    : "sconosciuto";

  // populate country filter
  const allCountries = new Set();
  results.forEach((r) => (r.countrycodes || []).forEach((c) => allCountries.add(c)));
  countryFilter.innerHTML = '<option value="all">Tutti</option>';
  [...allCountries].sort().forEach((code) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = code;
    countryFilter.appendChild(opt);
  });

  applyFilters();
};

const loadData = async () => {
  try {
    const res = await fetch("./data/latest.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} su data/latest.json`);
    const payload = await res.json();
    render(payload);
  } catch (err) {
    empty.textContent = `Errore nel caricamento: ${err.message}`;
    console.error(err);
  }
};

loadData();

searchInput.addEventListener("input", applyFilters);
countryFilter.addEventListener("change", applyFilters);

document.querySelectorAll("th[data-sort]").forEach((th) => {
  th.style.cursor = "pointer";
  th.addEventListener("click", () => {
    const key = th.getAttribute("data-sort");
    if (sortState.key === key) {
      sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
    } else {
      sortState.key = key;
      sortState.dir = key === "title" ? "asc" : "asc";
    }
    applyFilters();
  });
});
