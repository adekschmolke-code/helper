const ARTICLE_KEY = "helper_articles";
const CATALOG_KEY = "helper_article_catalog";
const DELETED_CATALOG_KEY = "helper_deleted_catalog_names";
const CATALOG_VERSION_KEY = "helper_article_catalog_version";
const LIST_KEY = "helper_lists";
const THEME_KEY = "helper_theme";
const STORAGE_PREFIX = "helper_";
const DEFAULT_CATALOG_VERSION = "2026-06-24-getraenke-kategorien";
const DEFAULT_CIGARETTE_CATALOG_VERSION = "2026-06-24-zigaretten-kurz";
const DEFAULT_CATEGORY = "beverages";
const BEVERAGE_CATEGORIES = [
  { id: "coffee_milk", label: "Kaffee & Milchgetr\u00E4nke" },
  { id: "water", label: "Wasser" },
  { id: "softdrinks", label: "Softdrinks" },
  { id: "energy", label: "Energy" },
];
const CATEGORY_CONFIG = {
  beverages: {
    label: "Getr\u00E4nke",
    articleKey: ARTICLE_KEY,
    catalogKey: CATALOG_KEY,
    deletedCatalogKey: DELETED_CATALOG_KEY,
    catalogVersionKey: CATALOG_VERSION_KEY,
    listKey: LIST_KEY,
    catalogVersion: DEFAULT_CATALOG_VERSION,
  },
  cigarettes: {
    label: "Zigaretten",
    articleKey: `${STORAGE_PREFIX}cigarette_articles`,
    catalogKey: `${STORAGE_PREFIX}cigarette_article_catalog`,
    deletedCatalogKey: `${STORAGE_PREFIX}deleted_cigarette_catalog_names`,
    catalogVersionKey: `${STORAGE_PREFIX}cigarette_article_catalog_version`,
    listKey: `${STORAGE_PREFIX}cigarette_lists`,
    catalogVersion: DEFAULT_CIGARETTE_CATALOG_VERSION,
  },
};

const text = {
  addArticle: "Artikel hinzuf\u00FCgen",
  allDataDeleted: "Gel\u00F6scht.",
  appearanceDescription: "Wechsle zwischen hellem und dunklem Modus. Die Auswahl wird lokal gespeichert.",
  appDataDeleted: "Gel\u00F6scht.",
  articlesEmpty: "Noch keine Artikel vorhanden.",
  catalogEmpty: "Noch kein Bestand vorhanden.",
  articlesWithCache: "Sollen die gespeicherten Artikel auch gel\u00F6scht werden?",
  cacheConfirmAll: "Wirklich alles l\u00F6schen? Artikel, Listen und Einstellungen werden entfernt.",
  cacheConfirmKeepArticles: "Wirklich l\u00F6schen? Listen und Einstellungen werden entfernt, Artikel bleiben erhalten.",
  cancel: "Abbrechen",
  catalogArticleDeleted: "Gel\u00F6scht.",
  darkMode: "\u263E Dunkelmodus",
  dateTimeSeparator: "Zeit",
  delete: "L\u00F6schen",
  edit: "Bearbeiten",
  editDone: "Fertig",
  hide: "Ausblenden",
  articleAdded: "Hinzugef\u00FCgt.",
  articleExists: "Schon vorhanden.",
  articleRemoved: "Entfernt.",
  catalogArticleAdded: "Angelegt.",
  lightMode: "\u2600 Hellmodus",
  listAutoSaved: "Gespeichert.",
  listSaved: "Liste {name} wurde gespeichert.",
  listsEmpty: "Noch keine Listen gespeichert.",
  needQuantity: "Bitte trage mindestens eine Menge ein.",
  noArticlesForList: "Keine Artikel.",
  noSearchResults: "Kein Treffer.",
  save: "Speichern",
  saveSelection: "Auswahl speichern",
  selectionSaved: "Artikelauswahl wurde gespeichert.",
  show: "Abrufen",
  storageUnavailable: "Speichern fehlgeschlagen.",
  unknownArticle: "Unbekannter Artikel",
};

let activeAutoListId = "";

const defaultCatalogs =
  typeof window !== "undefined" && window.DEFAULT_CATALOGS
    ? window.DEFAULT_CATALOGS
    : {
        beverages: Array.isArray(window.DEFAULT_ARTICLE_CATALOG)
          ? window.DEFAULT_ARTICLE_CATALOG
          : ["Milch", "Brot", "Eier"],
        cigarettes: [],
      };

function getCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  return CATEGORY_CONFIG[category] ? category : DEFAULT_CATEGORY;
}

function getActiveCategory() {
  return document.body.dataset.category || getCategoryFromUrl();
}

function getCategoryConfig(category = getActiveCategory()) {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG[DEFAULT_CATEGORY];
}

function getDefaultArticles(category = getActiveCategory()) {
  const articles = defaultCatalogs[category];
  return Array.isArray(articles) && articles.length ? articles : [];
}

function getLegacyDefaultArticles(category = getActiveCategory()) {
  if (
    category === "beverages" &&
    typeof window !== "undefined" &&
    Array.isArray(window.LEGACY_BEVERAGE_CATALOG)
  ) {
    return window.LEGACY_BEVERAGE_CATALOG;
  }

  if (
    category === "cigarettes" &&
    typeof window !== "undefined" &&
    Array.isArray(window.LEGACY_CIGARETTE_CATALOG)
  ) {
    return window.LEGACY_CIGARETTE_CATALOG;
  }

  return [];
}

function withCategoryParam(href, category = getActiveCategory()) {
  if (category === DEFAULT_CATEGORY || href === "index.html") {
    return href;
  }
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}category=${encodeURIComponent(category)}`;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Die App bleibt benutzbar, wenn der Browser lokalen Speicher blockiert.
    return false;
  }
}

function t(key, replacements = {}) {
  const template = text[key] ?? key;
  return Object.entries(replacements).reduce(
    (value, [name, replacement]) => value.replace(`{${name}}`, replacement),
    template,
  );
}

function getPreferredTheme() {
  const storedTheme = readStorage(THEME_KEY, "");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return storedTheme || (prefersDark ? "dark" : "light");
}

function applyTheme(theme) {
  const themeColor = document.querySelector('meta[name="theme-color"]');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  themeColor?.setAttribute("content", theme === "dark" ? "#111827" : "#f7f9fc");

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const label = theme === "dark" ? t("lightMode") : t("darkMode");
    button.textContent = label;
    button.setAttribute("aria-label", label);
    button.title = label;
  });
}

function setupTheme() {
  applyTheme(getPreferredTheme());

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      writeStorage(THEME_KEY, nextTheme);
      applyTheme(nextTheme);
    });
  });
}

function setupCategory() {
  const category = getCategoryFromUrl();
  document.body.dataset.category = category;

  document.querySelectorAll("[data-category-label]").forEach((element) => {
    element.textContent = getCategoryConfig(category).label;
  });

  document.querySelectorAll("a[href$='.html']").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && !href.includes("category=")) {
      link.setAttribute("href", withCategoryParam(href, category));
    }
  });

  document.querySelectorAll("[data-category-link]").forEach((link) => {
    const linkCategory = link.dataset.categoryLink;
    const href = link.getAttribute("href")?.split("?")[0] || "artikel.html";
    link.setAttribute("href", withCategoryParam(href, linkCategory));
    link.classList.toggle("active", linkCategory === category);
    if (linkCategory === category) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

async function clearAppCache({ includeArticles }) {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .filter((key) => includeArticles || !Object.values(CATEGORY_CONFIG).some((config) =>
        [config.articleKey, config.catalogKey, config.deletedCatalogKey].includes(key),
      ))
      .forEach((key) => localStorage.removeItem(key));
    if (includeArticles) {
      Object.values(CATEGORY_CONFIG).forEach((config) => {
        localStorage.setItem(config.articleKey, JSON.stringify([]));
      });
    }
  } catch {
    // Manche iOS-Privatmodi blockieren Speicherzugriff.
  }

  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch {
      // CacheStorage kann je nach Browser-Einstellung fehlen.
    }
  }
}

function setupSettingsPage() {
  const clearButton = document.querySelector("[data-clear-cache]");
  const status = document.querySelector("[data-settings-status]");

  clearButton?.addEventListener("click", async () => {
    const includeArticles = window.confirm(t("articlesWithCache"));
    const confirmed = window.confirm(
      includeArticles ? t("cacheConfirmAll") : t("cacheConfirmKeepArticles"),
    );

    if (!confirmed) {
      return;
    }

    await clearAppCache({ includeArticles });
    applyTheme(getPreferredTheme());

    if (status) {
      status.textContent = includeArticles ? t("allDataDeleted") : t("appDataDeleted");
    }
  });
}

function createArticlesFromNames(names) {
  return names.map((name) => ({
    id: createId(),
    name,
    ...createArticleMetadata(name),
  }));
}

function getBeverageCategoryById(categoryId) {
  return BEVERAGE_CATEGORIES.find((category) => category.id === categoryId) ?? BEVERAGE_CATEGORIES[2];
}

function getBeverageCategoryId(name) {
  const groupRank = getBeverageGroupRank(name);
  return BEVERAGE_CATEGORIES[groupRank]?.id ?? "softdrinks";
}

function createArticleMetadata(name, categoryId = "") {
  if (getActiveCategory() !== "beverages") {
    return {};
  }

  return {
    category: getBeverageCategoryById(categoryId || getBeverageCategoryId(name)).id,
  };
}

function getArticleCategory(article) {
  if (getActiveCategory() !== "beverages") {
    return null;
  }

  return getBeverageCategoryById(article.category || getBeverageCategoryId(article.name));
}

function uniqueArticlesByName(articles) {
  const seen = new Set();
  return articles
    .map((article) => {
      if (!article || typeof article.name !== "string") {
        return null;
      }

      const name = normalizeName(article.name);
      if (!name) {
        return null;
      }

      return {
        id: typeof article.id === "string" && article.id ? article.id : createId(),
        name,
        ...createArticleMetadata(name, article.category),
      };
    })
    .filter(Boolean)
    .filter((article) => {
      const key = article.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort(compareArticles);
}

function getDefaultArticleOrder(category = getActiveCategory()) {
  return new Map(
    getDefaultArticles(category).map((name, index) => [normalizeName(name).toLowerCase(), index]),
  );
}

function getBeverageGroupRank(name) {
  const lowerName = name.toLowerCase();
  const coffeeAndMilkTerms = [
    "starbucks",
    "oatly",
    "nescafé",
    "nescafe",
    "brown",
    "café",
    "caffè",
    "caffe",
    "latte",
    "espresso",
    "macchiato",
    "cappuccino",
    "kakao",
    "müllermilch",
    "mullermilch",
    "yfood",
    "yopro",
  ];
  const energyTerms = [
    "effect",
    "28 black",
    "flying horse",
    "take off",
    "gönrgy",
    "gonrgy",
    "monster",
    "rockstar",
  ];

  if (coffeeAndMilkTerms.some((term) => lowerName.includes(term))) {
    return 0;
  }

  if (lowerName.includes("wasser")) {
    return 1;
  }

  if (energyTerms.some((term) => lowerName.includes(term))) {
    return 3;
  }

  return 2;
}

function getBeverageSortKey(name, defaultIndex = Number.MAX_SAFE_INTEGER, categoryId = "") {
  const lowerName = name.toLowerCase();
  const volumeMatch = lowerName.match(/(\d+(?:[,.]\d+)?)\s*l\b/);
  const volume = volumeMatch ? Number(volumeMatch[1].replace(",", ".")) : 0;
  const categoryRank = categoryId
    ? BEVERAGE_CATEGORIES.findIndex((category) => category.id === categoryId)
    : getBeverageGroupRank(name);
  const packageRank = lowerName.includes("dose")
    ? 0
    : lowerName.includes("pet 0,5") || lowerName.includes("pet-flasche, 0,50")
      ? 1
      : lowerName.includes("flasche") || lowerName.includes("pet")
        ? 2
        : 3;

  return [categoryRank >= 0 ? categoryRank : getBeverageGroupRank(name), defaultIndex, packageRank, volume, name];
}

function getCigaretteSortKey(name) {
  const [, rawSize = ""] = name.split(/\s[–-]\s/);
  const size = rawSize.trim().toLowerCase();
  const number = Number(size.replace(",", "."));
  const namedSizeOrder = {
    l: 100,
    long: 101,
    xl: 110,
    xxl: 120,
  };
  const sizeRank = Number.isFinite(number) ? number : (namedSizeOrder[size] ?? 0);

  return [name.replace(/\s[–-]\s.*$/, ""), sizeRank, name];
}

function compareSortKeys(left, right) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const leftValue = left[index] ?? "";
    const rightValue = right[index] ?? "";
    if (typeof leftValue === "number" && typeof rightValue === "number") {
      if (leftValue !== rightValue) {
        return leftValue - rightValue;
      }
      continue;
    }

    const compared = String(leftValue).localeCompare(String(rightValue), "de", {
      numeric: true,
      sensitivity: "base",
    });
    if (compared !== 0) {
      return compared;
    }
  }

  return 0;
}

function compareArticles(left, right) {
  const category = getActiveCategory();
  const defaultOrder = getDefaultArticleOrder(category);
  const leftDefaultIndex = defaultOrder.get(left.name.toLowerCase());
  const rightDefaultIndex = defaultOrder.get(right.name.toLowerCase());

  if (category === "beverages") {
    return compareSortKeys(
      getBeverageSortKey(left.name, leftDefaultIndex ?? Number.MAX_SAFE_INTEGER, left.category),
      getBeverageSortKey(right.name, rightDefaultIndex ?? Number.MAX_SAFE_INTEGER, right.category),
    );
  }

  if (leftDefaultIndex !== undefined && rightDefaultIndex !== undefined) {
    return leftDefaultIndex - rightDefaultIndex;
  }

  if (leftDefaultIndex !== undefined) {
    return -1;
  }

  if (rightDefaultIndex !== undefined) {
    return 1;
  }

  if (category === "cigarettes") {
    return compareSortKeys(getCigaretteSortKey(left.name), getCigaretteSortKey(right.name));
  }

  return left.name.localeCompare(right.name, "de", { numeric: true, sensitivity: "base" });
}

function haveSameArticleNames(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((article, index) => article.name === right[index].name);
}

function buildCatalogWithCustomArticles(catalog) {
  const defaultArticles = getDefaultArticles();
  const storedCatalog = Array.isArray(catalog) ? uniqueArticlesByName(catalog) : [];
  const { deletedCatalogKey } = getCategoryConfig();
  const deletedNames = readStorage(deletedCatalogKey, []);
  const deleted = new Set(Array.isArray(deletedNames) ? deletedNames.map((name) => normalizeName(name).toLowerCase()) : []);
  const storedByName = new Map(
    storedCatalog.map((article) => [article.name.toLowerCase(), article]),
  );
  const defaultNames = new Set(defaultArticles.map((name) => normalizeName(name).toLowerCase()));
  const defaultCatalog = defaultArticles
    .map((name) => normalizeName(name))
    .filter((name) => !deleted.has(name.toLowerCase()))
    .map((name) => storedByName.get(name.toLowerCase()) ?? { id: createId(), name });
  const customCatalog = storedCatalog.filter(
    (article) => !defaultNames.has(article.name.toLowerCase()) && !deleted.has(article.name.toLowerCase()),
  );

  return uniqueArticlesByName([...defaultCatalog, ...customCatalog]);
}

function getCatalog() {
  const category = getActiveCategory();
  const { catalogKey, catalogVersionKey, catalogVersion } = getCategoryConfig();
  const defaultArticles = getDefaultArticles();
  const catalog = readStorage(catalogKey, null);
  const catalogVersionValue = readStorage(catalogVersionKey, "");

  if (Array.isArray(catalog)) {
    const legacyDefaultNames = catalogVersionValue !== catalogVersion
      ? new Set(getLegacyDefaultArticles(category).map((name) => normalizeName(name).toLowerCase()))
      : new Set();
    const sourceCatalog = legacyDefaultNames.size
      ? catalog.filter((article) => !legacyDefaultNames.has(normalizeName(article?.name ?? "").toLowerCase()))
      : catalog;
    const mergedCatalog = buildCatalogWithCustomArticles(sourceCatalog);

    if (
      catalogVersionValue !== catalogVersion ||
      !haveSameArticleNames(uniqueArticlesByName(sourceCatalog), mergedCatalog)
    ) {
      writeStorage(catalogKey, mergedCatalog);
      writeStorage(catalogVersionKey, catalogVersion);
    }
    return mergedCatalog;
  }

  const initialCatalog = uniqueArticlesByName(createArticlesFromNames(defaultArticles));
  writeStorage(catalogKey, initialCatalog);
  writeStorage(catalogVersionKey, catalogVersion);
  return initialCatalog;
}

function saveCatalog(catalog) {
  return writeStorage(getCategoryConfig().catalogKey, buildCatalogWithCustomArticles(catalog));
}

function getArticles() {
  const { articleKey } = getCategoryConfig();
  const articles = readStorage(articleKey, null);
  if (Array.isArray(articles)) {
    const catalogNames = new Set(getCatalog().map((article) => article.name.toLowerCase()));
    const selectedArticles = uniqueArticlesByName(articles).filter((article) =>
      catalogNames.has(article.name.toLowerCase()),
    );
    if (selectedArticles.length !== articles.length) {
      saveArticles(selectedArticles);
    }
    return selectedArticles;
  }

  getCatalog();
  const initialArticles = [];
  writeStorage(articleKey, initialArticles);
  return initialArticles;
}

function saveArticles(articles) {
  return writeStorage(getCategoryConfig().articleKey, uniqueArticlesByName(Array.isArray(articles) ? articles : []));
}

function addArticleToCatalog(name, categoryId = "") {
  const cleanName = normalizeName(name);
  if (!cleanName) {
    return { article: null, exists: false, stored: false };
  }

  const catalog = getCatalog();
  const existingArticle = catalog.find(
    (article) => article.name.toLowerCase() === cleanName.toLowerCase(),
  );
  if (existingArticle) {
    return { article: existingArticle, exists: true, stored: true };
  }

  const { deletedCatalogKey } = getCategoryConfig();
  const deletedNames = readStorage(deletedCatalogKey, []);
  if (Array.isArray(deletedNames)) {
    const nextDeletedNames = deletedNames.filter(
      (deletedName) => normalizeName(deletedName).toLowerCase() !== cleanName.toLowerCase(),
    );
    if (nextDeletedNames.length !== deletedNames.length) {
      writeStorage(deletedCatalogKey, nextDeletedNames);
    }
  }

  const article = { id: createId(), name: cleanName, ...createArticleMetadata(cleanName, categoryId) };
  const stored = saveCatalog([...catalog, article]);
  return { article: stored ? article : null, exists: false, stored };
}

function deleteArticleFromCatalog(article) {
  const cleanName = normalizeName(article.name);
  const key = cleanName.toLowerCase();
  const defaultArticles = getDefaultArticles();
  const { catalogKey, deletedCatalogKey } = getCategoryConfig();
  const defaultNames = new Set(defaultArticles.map((name) => normalizeName(name).toLowerCase()));
  const deletedNames = readStorage(deletedCatalogKey, []);
  const deleted = new Set(Array.isArray(deletedNames) ? deletedNames.map((name) => normalizeName(name).toLowerCase()) : []);

  if (defaultNames.has(key)) {
    deleted.add(key);
    if (!writeStorage(deletedCatalogKey, [...deleted])) {
      return false;
    }
  }

  const nextCatalog = getCatalog().filter((entry) => entry.name.toLowerCase() !== key);
  if (!writeStorage(catalogKey, nextCatalog)) {
    return false;
  }

  removeArticleFromSelection({ id: article.id, name: cleanName });
  return true;
}

function sanitizeListItem(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const name = typeof item.name === "string" ? normalizeName(item.name) : "";
  const quantity = typeof item.quantity === "string" ? normalizeName(item.quantity) : "";
  if (!name || !quantity) {
    return null;
  }

  return {
    articleId: typeof item.articleId === "string" && item.articleId ? item.articleId : createId(),
    name,
    quantity,
  };
}

function sanitizeList(list) {
  if (!list || typeof list !== "object" || !Array.isArray(list.items)) {
    return null;
  }

  const items = list.items.map(sanitizeListItem).filter(Boolean);
  if (items.length === 0) {
    return null;
  }

  return {
    id: typeof list.id === "string" && list.id ? list.id : createId(),
    title: typeof list.title === "string" && list.title ? list.title : formatDateTime(new Date()),
    createdAt: typeof list.createdAt === "string" && list.createdAt ? list.createdAt : new Date().toISOString(),
    items,
  };
}

function getLists() {
  const lists = readStorage(getCategoryConfig().listKey, []);
  if (!Array.isArray(lists)) {
    return [];
  }

  return lists.map(sanitizeList).filter(Boolean);
}

function saveLists(lists) {
  return writeStorage(getCategoryConfig().listKey, Array.isArray(lists) ? lists.map(sanitizeList).filter(Boolean) : []);
}

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(-2)} / ${t("dateTimeSeparator")} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function normalizeQuantity(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return "";
  }

  return String(Math.trunc(number));
}

function addArticleToSelection(article) {
  const selectedArticles = getArticles();
  if (!selectedArticles.some((entry) => entry.name.toLowerCase() === article.name.toLowerCase())) {
    return saveArticles([...selectedArticles, article]);
  }
  return true;
}

function removeArticleFromSelection(article) {
  return saveArticles(
    getArticles().filter((entry) => entry.name.toLowerCase() !== article.name.toLowerCase()),
  );
}

function createEmptyState(message) {
  const element = document.createElement("p");
  element.className = "empty-state";
  element.textContent = message;
  return element;
}

function setIconButton(button, symbol, label) {
  button.classList.add("icon-button");
  button.textContent = symbol;
  button.setAttribute("aria-label", label);
  button.title = label;
}

function createCategoryPill(category) {
  const pill = document.createElement("span");
  pill.className = "category-pill";
  pill.textContent = category.label;
  return pill;
}

function createCategoryHeader(category) {
  const header = document.createElement("li");
  header.className = "category-header";
  header.textContent = category.label;
  return header;
}

function createQuantityCategoryHeader(category) {
  const header = document.createElement("div");
  header.className = "category-header quantity-category-header";
  header.textContent = category.label;
  return header;
}

function setupArticlePage() {
  const form = document.querySelector("[data-article-form]");
  const input = document.querySelector("[data-article-input]");
  const categorySelect = document.querySelector("[data-article-category]");
  const editPanel = document.querySelector("[data-edit-panel]");
  const editToggle = document.querySelector("[data-edit-toggle]");
  const searchInput = document.querySelector("[data-article-search]");
  const list = document.querySelector("[data-article-list]");
  const status = document.querySelector("[data-article-status]");
  let editMode = false;

  if (categorySelect) {
    categorySelect.hidden = getActiveCategory() !== "beverages";
    categorySelect.disabled = getActiveCategory() !== "beverages";
  }

  function updateEditMode() {
    if (editPanel) {
      editPanel.hidden = !editMode;
    }
    if (editToggle) {
      editToggle.textContent = editMode ? t("editDone") : t("edit");
      editToggle.setAttribute("aria-label", editMode ? t("editDone") : t("edit"));
      editToggle.title = editMode ? t("editDone") : t("edit");
    }
  }

  function render() {
    const catalog = getCatalog();
    const selectedNames = new Set(getArticles().map((article) => article.name.toLowerCase()));
    const searchTerm = normalizeName(searchInput?.value ?? "").toLowerCase();
    const visibleCatalog = searchTerm
      ? catalog.filter((article) => article.name.toLowerCase().includes(searchTerm))
      : catalog;
    list.innerHTML = "";

    if (catalog.length === 0) {
      list.append(createEmptyState(t("catalogEmpty")));
      return;
    }

    if (visibleCatalog.length === 0) {
      list.append(createEmptyState(t("noSearchResults")));
      return;
    }

    let previousCategoryId = "";
    visibleCatalog.forEach((article) => {
      const articleCategory = getArticleCategory(article);
      if (articleCategory && articleCategory.id !== previousCategoryId) {
        list.append(createCategoryHeader(articleCategory));
        previousCategoryId = articleCategory.id;
      }

      const item = document.createElement("li");
      const isSelected = selectedNames.has(article.name.toLowerCase());
      item.className = `item-row${isSelected ? " is-selected" : ""}`;

      const textGroup = document.createElement("span");
      textGroup.className = "item-text";

      const name = document.createElement("span");
      name.textContent = article.name;
      textGroup.append(name);

      if (articleCategory) {
        textGroup.append(createCategoryPill(articleCategory));
      }

      const actionButton = document.createElement("button");
      actionButton.className = `button compact ${editMode || isSelected ? "danger" : "secondary"}`;
      actionButton.type = "button";
      setIconButton(
        actionButton,
        editMode || isSelected ? "\u00D7" : "+",
        editMode ? t("delete") : isSelected ? t("delete") : t("addArticle"),
      );
      actionButton.addEventListener("click", () => {
        let stored = false;
        if (editMode) {
          stored = deleteArticleFromCatalog(article);
          if (status) {
            status.textContent = stored ? t("catalogArticleDeleted") : t("storageUnavailable");
          }
        } else if (isSelected) {
          stored = removeArticleFromSelection(article);
          if (status) {
            status.textContent = stored ? t("articleRemoved") : t("storageUnavailable");
          }
        } else {
          stored = addArticleToSelection(article);
          if (status) {
            status.textContent = stored ? t("articleAdded") : t("storageUnavailable");
          }
        }
        if (stored) {
          render();
        }
      });

      item.append(textGroup, actionButton);
      list.append(item);
    });
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = addArticleToCatalog(input.value, categorySelect?.value ?? "");
    if (status) {
      status.textContent = result.stored
        ? result.exists
          ? t("articleExists")
          : t("catalogArticleAdded")
        : t("storageUnavailable");
    }

    if (result.stored) {
      input.value = "";
      render();
    }
    input.focus();
  });

  editToggle?.addEventListener("click", () => {
    editMode = !editMode;
    updateEditMode();
    render();
  });

  searchInput?.addEventListener("input", render);

  updateEditMode();
  render();
}

function createQuantityRow(article, quantity = "", onChange) {
  const row = document.createElement("div");
  row.className = "quantity-row";
  row.dataset.articleId = article.id;
  row.dataset.articleName = article.name.toLowerCase();

  const name = document.createElement("span");
  name.className = "quantity-name";
  name.textContent = article.name;

  const controls = document.createElement("div");
  controls.className = "quantity-controls";

  const minusButton = document.createElement("button");
  minusButton.className = "button secondary compact";
  minusButton.type = "button";
  setIconButton(minusButton, "\u2212", "Menge verringern");

  const input = document.createElement("input");
  input.className = "quantity-input";
  input.inputMode = "numeric";
  input.min = "0";
  input.name = article.id;
  input.placeholder = "0";
  input.type = "number";
  input.value = quantity;

  const plusButton = document.createElement("button");
  plusButton.className = "button secondary compact";
  plusButton.type = "button";
  setIconButton(plusButton, "+", "Menge erh\u00F6hen");

  function updateQuantity(nextValue) {
    input.value = normalizeQuantity(nextValue);
    onChange?.(article.id, input.value);
  }

  minusButton.addEventListener("click", () => {
    updateQuantity(Math.max(0, Number(input.value || 0) - 1));
  });

  plusButton.addEventListener("click", () => {
    updateQuantity(Number(input.value || 0) + 1);
  });

  input.addEventListener("input", () => {
    input.value = normalizeQuantity(input.value);
    onChange?.(article.id, input.value);
  });

  controls.append(minusButton, input, plusButton);
  row.append(name, controls);
  return row;
}

function setupNewListPage() {
  const searchInput = document.querySelector("[data-list-search]");
  const articleContainer = document.querySelector("[data-list-articles]");
  const status = document.querySelector("[data-status]");
  const quantityValues = new Map();

  function collectItems() {
    const articleMap = new Map(getArticles().map((article) => [article.id, article]));
    return [...quantityValues.entries()]
      .map(([articleId, quantity]) => ({
        articleId,
        name: articleMap.get(articleId)?.name ?? t("unknownArticle"),
        quantity: normalizeQuantity(quantity),
      }))
      .filter((item) => item.quantity);
  }

  function autoSaveList() {
    const items = collectItems();
    if (items.length === 0) {
      if (activeAutoListId) {
        saveLists(getLists().filter((list) => list.id !== activeAutoListId));
        activeAutoListId = "";
      }
      status.textContent = "";
      return;
    }

    const lists = getLists();
    const existingList = lists.find((list) => list.id === activeAutoListId);
    if (existingList) {
      const updatedLists = lists.map((list) =>
        list.id === activeAutoListId ? { ...list, items } : list,
      );
      status.textContent = saveLists(updatedLists) ? t("listAutoSaved") : t("storageUnavailable");
      return;
    }

    const now = new Date();
    const list = {
      id: createId(),
      title: formatDateTime(now),
      createdAt: now.toISOString(),
      items,
    };
    activeAutoListId = list.id;
    status.textContent = saveLists([list, ...lists]) ? t("listAutoSaved") : t("storageUnavailable");
  }

  function renderQuantities() {
    [...articleContainer.querySelectorAll("input")].forEach((input) => {
      quantityValues.set(input.name, input.value);
    });
    articleContainer.innerHTML = "";

    const searchTerm = normalizeName(searchInput?.value ?? "").toLowerCase();
    const articles = getArticles();
    const visibleArticles = searchTerm
      ? articles.filter((article) => article.name.toLowerCase().includes(searchTerm))
      : articles;

    if (articles.length === 0) {
      articleContainer.append(createEmptyState(t("noArticlesForList")));
      return;
    }

    if (visibleArticles.length === 0) {
      articleContainer.append(createEmptyState(t("noSearchResults")));
      return;
    }

    let previousCategoryId = "";
    visibleArticles.forEach((article) => {
      const articleCategory = getArticleCategory(article);
      if (articleCategory && articleCategory.id !== previousCategoryId) {
        articleContainer.append(createQuantityCategoryHeader(articleCategory));
        previousCategoryId = articleCategory.id;
      }

      articleContainer.append(
        createQuantityRow(article, quantityValues.get(article.id) ?? "", (articleId, quantity) => {
          quantityValues.set(articleId, quantity);
          autoSaveList();
        }),
      );
    });
  }

  searchInput?.addEventListener("input", () => {
    renderQuantities();
  });

  renderQuantities();
}

function createListDetails(list) {
  const details = document.createElement("div");
  details.className = "list-details";
  details.hidden = true;

  const items = document.createElement("ul");
  items.className = "simple-list";
  list.items.forEach((item) => {
    const row = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = item.name;

    const quantity = document.createElement("strong");
    quantity.className = "saved-quantity";
    quantity.textContent = item.quantity;

    row.append(name, quantity);
    items.append(row);
  });

  details.append(items);
  return details;
}

function createEditForm(list, onSave) {
  const form = document.createElement("form");
  form.className = "edit-form";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  const savedItems = new Map(list.items.map((item) => [item.articleId, item]));
  const editArticles = getArticles().map((article) => ({
    articleId: article.id,
    name: article.name,
    quantity: savedItems.get(article.id)?.quantity ?? "",
  }));

  list.items.forEach((item) => {
    if (!editArticles.some((article) => article.articleId === item.articleId)) {
      editArticles.push(item);
    }
  });

  function collectUpdatedItems() {
    const updatedItems = [...form.querySelectorAll("input")]
      .map((input) => {
        const original = editArticles.find((item) => item.articleId === input.name);
        return {
          articleId: input.name,
          name: original?.name ?? t("unknownArticle"),
        quantity: normalizeQuantity(input.value),
        };
      })
      .filter((item) => item.quantity);
    onSave(updatedItems);
  }

  editArticles.forEach((item) => {
    form.append(
      createQuantityRow({ id: item.articleId, name: item.name }, item.quantity, collectUpdatedItems),
    );
  });

  return form;
}

function setupListsPage() {
  const container = document.querySelector("[data-saved-lists]");

  function render() {
    const lists = getLists();
    container.innerHTML = "";

    if (lists.length === 0) {
      container.append(createEmptyState(t("listsEmpty")));
      return;
    }

    lists.forEach((list) => {
      const card = document.createElement("article");
      card.className = "list-card";

      const header = document.createElement("div");
      header.className = "list-card-header";

      const titleGroup = document.createElement("div");
      titleGroup.className = "list-title-group";

      const title = document.createElement("h2");
      title.textContent = list.title;

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const editButton = document.createElement("button");
      editButton.className = "button secondary compact";
      editButton.type = "button";
      setIconButton(editButton, "\u270E", t("edit"));

      const deleteButton = document.createElement("button");
      deleteButton.className = "button danger compact";
      deleteButton.type = "button";
      setIconButton(deleteButton, "\u00D7", t("delete"));

      titleGroup.append(title);
      actions.append(editButton, deleteButton);
      header.append(titleGroup, actions);

      const details = createListDetails(list);
      card.append(header, details);

      function toggleDetails() {
        details.hidden = !details.hidden;
      }

      card.addEventListener("click", (event) => {
        if (event.target.closest("button, input, label, form")) {
          return;
        }
        toggleDetails();
      });

      editButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const editForm = createEditForm(
          list,
          (items) => {
            const updatedLists = getLists().map((entry) =>
              entry.id === list.id ? { ...entry, items } : entry,
            );
            if (saveLists(updatedLists)) {
              list.items = items;
            }
          },
        );
        details.replaceChildren(editForm);
        details.hidden = false;
      });

      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (saveLists(getLists().filter((entry) => entry.id !== list.id))) {
          render();
        }
      });

      container.append(card);
    });
  }

  render();
}

const page = document.body.dataset.page;

setupCategory();
setupTheme();

if (page === "artikel") {
  setupArticlePage();
}

if (page === "neue-liste") {
  setupNewListPage();
}

if (page === "listen") {
  setupListsPage();
}

if (page === "settings") {
  setupSettingsPage();
}
