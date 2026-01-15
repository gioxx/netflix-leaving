const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const typeSelect = document.getElementById("type");
const ratingRange = document.getElementById("rating");
const ratingValue = document.getElementById("rating-value");
const totalCount = document.getElementById("total-count");
const lastSync = document.getElementById("last-sync");
const cardTemplate = document.getElementById("card-template");

let titles = [];

const formatDuration = (runtime) => {
  // runtime can arrive as seconds (netflixruntime) or string like "119 min"
  if (typeof runtime === "string" && runtime.includes("min")) {
    const parsed = parseInt(runtime, 10);
    return Number.isNaN(parsed) ? "Durata n/d" : `${parsed} min`;
  }
  const minutes = Number.parseInt(runtime, 10);
  if (!minutes || minutes <= 0) return "Durata n/d";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatExpiry = (item) => {
  const raw = item.unogsdate || item.title_date || item.expires_on || item.expiredate;
  if (!raw) return "Data n/d";
  // Try to parse yyyy-mm-dd; fall back to raw string.
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
};

const normalize = (item) => {
  const imdbId = item.imdb_id || item.imdbid || "";
  const runtimeSeconds = item.runtime && typeof item.runtime === "number" ? item.runtime : 0;
  const runtimeMinutes = runtimeSeconds ? Math.round(runtimeSeconds / 60) : item.runtime;
  return {
    title: item.title || "Titolo sconosciuto",
    type: item.title_type || item.type || item.vtype || "na",
    img: item.img || item.poster || "",
    synopsis: item.synopsis || "Nessuna descrizione disponibile.",
    rating: item.rating ? Number.parseFloat(item.rating) : 0,
    year: item.year || "—",
    runtime: runtimeMinutes,
    expiresOn: formatExpiry(item),
    imdbUrl: imdbId ? `https://www.imdb.com/title/${imdbId}/` : "",
    countries: item.countrycodes || [],
  };
};

const renderCards = (list) => {
  grid.innerHTML = "";
  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<div class="card-body"><h3 style="margin:0 0 8px;">Nessun titolo trovato</h3><p class="synopsis">Modifica i filtri o prova un'altra ricerca.</p></div>`;
    grid.appendChild(empty);
    return;
  }

  list.forEach((item) => {
    const node = cardTemplate.content.cloneNode(true);
    const poster = node.querySelector(".poster");
    poster.style.backgroundImage = item.img ? `url(${item.img})` : "linear-gradient(135deg, #e50914, #ff4d5a)";
    node.querySelector(".title").textContent = item.title;
    node.querySelector(".type").textContent = item.type;
    node.querySelector(".year").textContent = item.year;
    node.querySelector(".duration").textContent = formatDuration(item.runtime);
    node.querySelector(".synopsis").textContent = item.synopsis;
    node.querySelector(".rating").textContent = item.rating ? `IMDB ${item.rating.toFixed(1)}` : "IMDB n/d";
    const countries = item.countries && item.countries.length ? ` · ${item.countries.join(", ")}` : "";
    node.querySelector(".expiry").textContent = `${item.expiresOn}${countries}`;
    const imdbLink = node.querySelector(".link");
    if (item.imdbUrl) {
      imdbLink.href = item.imdbUrl;
    } else {
      imdbLink.style.display = "none";
    }
    grid.appendChild(node);
  });
};

const applyFilters = () => {
  const searchValue = searchInput.value.trim().toLowerCase();
  const typeValue = typeSelect.value;
  const minRating = Number.parseFloat(ratingRange.value);
  ratingValue.textContent = minRating.toFixed(1);

  const filtered = titles.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchValue);
    const matchesType = typeValue === "all" || item.type === typeValue;
    const matchesRating = item.rating >= minRating;
    return matchesSearch && matchesType && matchesRating;
  });

  renderCards(filtered);
  totalCount.textContent = `${filtered.length} titoli`;
};

const hydrateMeta = (payload) => {
  const results = Array.isArray(payload.results) ? payload.results : [];
  totalCount.textContent = `${results.length} titoli`;
  const fetchedAt = payload.fetched_at ? new Date(payload.fetched_at) : null;
  lastSync.textContent = fetchedAt && !Number.isNaN(fetchedAt.getTime())
    ? `aggiornato ${fetchedAt.toLocaleString("it-IT")}`
    : "ultimo aggiornamento sconosciuto";
};

const fetchData = async () => {
  try {
    const res = await fetch("./data/latest.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawResults = Array.isArray(data.results) ? data.results : [];
    hydrateMeta(data);
    titles = rawResults.map(normalize);
    applyFilters();
  } catch (err) {
    grid.innerHTML = `<div class="card"><div class="card-body"><h3 style="margin:0 0 8px;">Errore nel caricamento</h3><p class="synopsis">${err.message}</p></div></div>`;
    lastSync.textContent = "aggiornamento fallito";
  }
};

searchInput.addEventListener("input", applyFilters);
typeSelect.addEventListener("change", applyFilters);
ratingRange.addEventListener("input", applyFilters);

fetchData();
