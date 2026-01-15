const rows = document.getElementById("rows");
const total = document.getElementById("total");
const lastSync = document.getElementById("last-sync");
const empty = document.getElementById("empty");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genre-filter");
const ratingFilter = document.getElementById("rating-filter");
const sortState = { key: "date", dir: "asc" };
let results = [];

const formatDate = (value) => {
  if (!value) return "n/d";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
};

const runtimeToMinutes = (runtime) => {
  if (runtime == null) return null;
  if (typeof runtime === "number") {
    const minutes = Math.round(runtime);
    return minutes > 0 ? minutes : null;
  }
  const raw = String(runtime).trim().toLowerCase();
  // patterns: "119 min", "1h 30m", "1h30m", "90"
  const hoursMatch = raw.match(/(\d+)\s*h/i);
  const minsMatch = raw.match(/(\d+)\s*m/i);
  if (hoursMatch) {
    const h = parseInt(hoursMatch[1], 10);
    const m = minsMatch ? parseInt(minsMatch[1], 10) : 0;
    const total = h * 60 + (Number.isNaN(m) ? 0 : m);
    return total > 0 ? total : null;
  }
  const num = parseInt(raw, 10);
  return Number.isNaN(num) || num <= 0 ? null : num;
};

const formatDuration = (runtime) => {
  const minutes = runtimeToMinutes(runtime);
  return minutes ? `${minutes} min` : "n/d";
};

const formatRating = (value) => {
  const num = Number.parseFloat(value);
  if (!num || Number.isNaN(num)) return "n/d";
  return num.toFixed(1);
};

const applyFilters = () => {
  const term = (searchInput.value || "").toLowerCase();
  const selectedGenre = genreFilter.value;
  const minRating = Number.parseFloat(ratingFilter.value || "0");
  const filtered = results.filter((item) => {
    const matchesTitle = (item.title || "").toLowerCase().includes(term);
    const genres = (item.genre || "")
      .split(",")
      .map((g) => g.trim().toLowerCase())
      .filter(Boolean);
    const matchesGenre = selectedGenre === "all" || genres.includes(selectedGenre.toLowerCase());
    const ratingVal = Number.parseFloat(item.rating) || 0;
    const matchesRating = ratingVal >= minRating;
    return matchesTitle && matchesGenre && matchesRating;
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
    if (sortState.key === "genre") {
      return sortState.dir === "asc"
        ? (a.genre || "").localeCompare(b.genre || "")
        : (b.genre || "").localeCompare(a.genre || "");
    }
    if (sortState.key === "rating") {
      const ra = Number.parseFloat(a.rating) || 0;
      const rb = Number.parseFloat(b.rating) || 0;
      return sortState.dir === "asc" ? ra - rb : rb - ra;
    }
    if (sortState.key === "runtime") {
      const ra = runtimeToMinutes(a.runtime) || 0;
      const rb = runtimeToMinutes(b.runtime) || 0;
      return sortState.dir === "asc" ? ra - rb : rb - ra;
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
      <td><span class="genre-text">${item.genre || "—"}</span></td>
      <td>${formatDuration(item.runtime)}</td>
      <td>${formatRating(item.rating)}</td>
      <td>${formatDate(item.expiredate || item.unogsdate)}</td>
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

  // populate genre filter
  const allGenres = new Set();
  results.forEach((r) => {
    (r.genre || "")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
      .forEach((g) => allGenres.add(g));
  });
  genreFilter.innerHTML = '<option value="all">Tutti</option>';
  [...allGenres].sort((a, b) => a.localeCompare(b)).forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genreFilter.appendChild(opt);
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
genreFilter.addEventListener("change", applyFilters);
ratingFilter.addEventListener("change", applyFilters);

document.querySelectorAll("th[data-sort]").forEach((th) => {
  th.style.cursor = "pointer";
  th.addEventListener("click", () => {
    const key = th.getAttribute("data-sort");
    if (sortState.key === key) {
      sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
    } else {
      sortState.key = key;
      sortState.dir = "asc";
    }
    applyFilters();
  });
});
