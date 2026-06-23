const ARTICLE_KEY = "helper_articles";
const CATALOG_KEY = "helper_article_catalog";
const CATALOG_VERSION_KEY = "helper_article_catalog_version";
const LIST_KEY = "helper_lists";
const THEME_KEY = "helper_theme";
const STORAGE_PREFIX = "helper_";
const DEFAULT_CATALOG_VERSION = "2026-06-23-lekkerland-getraenke";

const text = {
  addArticle: "Artikel hinzuf\u00FCgen",
  allDataDeleted: "Alle lokalen Daten wurden gel\u00F6scht.",
  appearanceDescription: "Wechsle zwischen hellem und dunklem Modus. Die Auswahl wird lokal gespeichert.",
  appDataDeleted: "Listen und Einstellungen wurden gel\u00F6scht. Artikel bleiben erhalten.",
  articlesEmpty: "Noch keine Artikel vorhanden.",
  catalogEmpty: "Noch kein Bestand vorhanden.",
  articlesWithCache: "Sollen die gespeicherten Artikel auch gel\u00F6scht werden?",
  cacheConfirmAll: "Wirklich alles l\u00F6schen? Artikel, Listen und Einstellungen werden entfernt.",
  cacheConfirmKeepArticles: "Wirklich l\u00F6schen? Listen und Einstellungen werden entfernt, Artikel bleiben erhalten.",
  cancel: "Abbrechen",
  darkMode: "\u263E Dunkelmodus",
  dateTimeSeparator: "Zeit",
  delete: "L\u00F6schen",
  edit: "Bearbeiten",
  hide: "Ausblenden",
  articleAdded: "Artikel wurde hinzugef\u00FCgt.",
  articleRemoved: "Artikel wurde entfernt.",
  lightMode: "\u2600 Hellmodus",
  listSaved: "Liste {name} wurde gespeichert.",
  listsEmpty: "Noch keine Listen gespeichert.",
  needQuantity: "Bitte trage mindestens eine Menge ein.",
  noArticlesForList: "W\u00E4hle zuerst Artikel aus dem Bestand aus.",
  noSearchResults: "Keine passenden Artikel gefunden.",
  save: "Speichern",
  saveSelection: "Auswahl speichern",
  selectionSaved: "Artikelauswahl wurde gespeichert.",
  show: "Abrufen",
  unknownArticle: "Unbekannter Artikel",
};

const defaultArticles =
  typeof window !== "undefined" && Array.isArray(window.DEFAULT_ARTICLE_CATALOG)
    ? window.DEFAULT_ARTICLE_CATALOG
    : ["Milch", "Brot", "Eier"];

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
  } catch {
    // Die App bleibt benutzbar, wenn der Browser lokalen Speicher blockiert.
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

async function clearAppCache({ includeArticles }) {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .filter((key) => includeArticles || ![ARTICLE_KEY, CATALOG_KEY].includes(key))
      .forEach((key) => localStorage.removeItem(key));
    if (includeArticles) {
      localStorage.setItem(ARTICLE_KEY, JSON.stringify([]));
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
  }));
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
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
}

function mergeCatalogNames(catalog, names) {
  const knownNames = new Set(catalog.map((article) => article.name.toLowerCase()));
  const missingArticles = names
    .map(normalizeName)
    .filter((name) => name && !knownNames.has(name.toLowerCase()))
    .map((name) => {
      knownNames.add(name.toLowerCase());
      return { id: createId(), name };
    });

  return uniqueArticlesByName([...catalog, ...missingArticles]);
}

function getCatalog() {
  const catalog = readStorage(CATALOG_KEY, null);
  const catalogVersion = readStorage(CATALOG_VERSION_KEY, "");
  const namesToEnsure = [...defaultArticles];

  if (Array.isArray(catalog)) {
    const mergedCatalog = mergeCatalogNames(catalog, namesToEnsure);
    if (catalogVersion !== DEFAULT_CATALOG_VERSION || mergedCatalog.length !== catalog.length) {
      writeStorage(CATALOG_KEY, mergedCatalog);
      writeStorage(CATALOG_VERSION_KEY, DEFAULT_CATALOG_VERSION);
    }
    return mergedCatalog;
  }

  const initialCatalog = uniqueArticlesByName(createArticlesFromNames(namesToEnsure));
  writeStorage(CATALOG_KEY, initialCatalog);
  writeStorage(CATALOG_VERSION_KEY, DEFAULT_CATALOG_VERSION);
  return initialCatalog;
}

function getArticles() {
  const articles = readStorage(ARTICLE_KEY, null);
  if (Array.isArray(articles)) {
    return uniqueArticlesByName(articles);
  }

  getCatalog();
  const initialArticles = [];
  writeStorage(ARTICLE_KEY, initialArticles);
  return initialArticles;
}

function saveArticles(articles) {
  writeStorage(ARTICLE_KEY, uniqueArticlesByName(Array.isArray(articles) ? articles : []));
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
  const lists = readStorage(LIST_KEY, []);
  if (!Array.isArray(lists)) {
    return [];
  }

  return lists.map(sanitizeList).filter(Boolean);
}

function saveLists(lists) {
  writeStorage(LIST_KEY, Array.isArray(lists) ? lists.map(sanitizeList).filter(Boolean) : []);
}

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(-2)} / ${t("dateTimeSeparator")} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatItemCount(count) {
  return `${count} ${count === 1 ? "Artikel" : "Artikel"}`;
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function addArticleToSelection(article) {
  const selectedArticles = getArticles();
  if (!selectedArticles.some((entry) => entry.name.toLowerCase() === article.name.toLowerCase())) {
    saveArticles([...selectedArticles, article]);
  }
}

function removeArticleFromSelection(article) {
  saveArticles(
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

function setupArticlePage() {
  const searchInput = document.querySelector("[data-article-search]");
  const list = document.querySelector("[data-article-list]");
  const status = document.querySelector("[data-article-status]");

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

    visibleCatalog.forEach((article) => {
      const item = document.createElement("li");
      const isSelected = selectedNames.has(article.name.toLowerCase());
      item.className = `item-row${isSelected ? " is-selected" : ""}`;

      const name = document.createElement("span");
      name.textContent = article.name;

      const actionButton = document.createElement("button");
      actionButton.className = `button compact ${isSelected ? "danger" : "secondary"}`;
      actionButton.type = "button";
      setIconButton(actionButton, isSelected ? "\u00D7" : "+", isSelected ? t("delete") : t("addArticle"));
      actionButton.addEventListener("click", () => {
        if (isSelected) {
          removeArticleFromSelection(article);
          if (status) {
            status.textContent = t("articleRemoved");
          }
        } else {
          addArticleToSelection(article);
          if (status) {
            status.textContent = t("articleAdded");
          }
        }
        render();
      });

      item.append(name, actionButton);
      list.append(item);
    });
  }

  searchInput?.addEventListener("input", render);

  render();
}

function createQuantityRow(article, quantity = "") {
  const row = document.createElement("label");
  row.className = "quantity-row";
  row.dataset.articleId = article.id;

  const name = document.createElement("span");
  name.textContent = article.name;

  const input = document.createElement("input");
  input.inputMode = "decimal";
  input.name = article.id;
  input.placeholder = "0";
  input.type = "text";
  input.value = quantity;

  row.append(name, input);
  return row;
}

function setupNewListPage() {
  const listForm = document.querySelector("[data-new-list-form]");
  const articleContainer = document.querySelector("[data-list-articles]");
  const status = document.querySelector("[data-status]");

  function renderQuantities() {
    const oldValues = new Map(
      [...articleContainer.querySelectorAll("input")].map((input) => [
        input.name,
        input.value,
      ]),
    );
    articleContainer.innerHTML = "";

    const articles = getArticles();
    if (articles.length === 0) {
      articleContainer.append(createEmptyState(t("noArticlesForList")));
      return;
    }

    articles.forEach((article) => {
      articleContainer.append(createQuantityRow(article, oldValues.get(article.id) ?? ""));
    });
  }

  listForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const articleMap = new Map(getArticles().map((article) => [article.id, article]));
    const items = [...articleContainer.querySelectorAll("input")]
      .map((input) => ({
        articleId: input.name,
        name: articleMap.get(input.name)?.name ?? t("unknownArticle"),
        quantity: normalizeName(input.value),
      }))
      .filter((item) => item.quantity);

    if (items.length === 0) {
      status.textContent = t("needQuantity");
      return;
    }

    const now = new Date();
    const lists = getLists();
    lists.unshift({
      id: createId(),
      title: formatDateTime(now),
      createdAt: now.toISOString(),
      items,
    });
    saveLists(lists);

    listForm.reset();
    renderQuantities();
    status.textContent = t("listSaved", { name: formatDateTime(now) });
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
    row.textContent = `${item.name}: ${item.quantity}`;
    items.append(row);
  });

  details.append(items);
  return details;
}

function createEditForm(list, onSave, onCancel) {
  const form = document.createElement("form");
  form.className = "edit-form";

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

  editArticles.forEach((item) => {
    form.append(createQuantityRow({ id: item.articleId, name: item.name }, item.quantity));
  });

  const actions = document.createElement("div");
  actions.className = "actions left";

  const saveButton = document.createElement("button");
  saveButton.className = "button primary compact";
  saveButton.type = "submit";
  setIconButton(saveButton, "\u2713", t("save"));

  const cancelButton = document.createElement("button");
  cancelButton.className = "button secondary compact";
  cancelButton.type = "button";
  setIconButton(cancelButton, "\u00D7", t("cancel"));
  cancelButton.addEventListener("click", onCancel);

  actions.append(saveButton, cancelButton);
  form.append(actions);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const updatedItems = [...form.querySelectorAll("input")]
      .map((input) => {
        const original = editArticles.find((item) => item.articleId === input.name);
        return {
          articleId: input.name,
          name: original?.name ?? t("unknownArticle"),
          quantity: normalizeName(input.value),
        };
      })
      .filter((item) => item.quantity);
    onSave(updatedItems);
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

      const meta = document.createElement("p");
      meta.className = "list-count";
      meta.textContent = formatItemCount(list.items.length);

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const showButton = document.createElement("button");
      showButton.className = "button secondary compact";
      showButton.type = "button";
      setIconButton(showButton, "\u2304", t("show"));

      const editButton = document.createElement("button");
      editButton.className = "button secondary compact";
      editButton.type = "button";
      setIconButton(editButton, "\u270E", t("edit"));

      const deleteButton = document.createElement("button");
      deleteButton.className = "button danger compact";
      deleteButton.type = "button";
      setIconButton(deleteButton, "\u00D7", t("delete"));

      titleGroup.append(title, meta);
      actions.append(showButton, editButton, deleteButton);
      header.append(titleGroup, actions);

      const details = createListDetails(list);
      card.append(header, details);

      function toggleDetails() {
        details.hidden = !details.hidden;
        setIconButton(showButton, details.hidden ? "\u2304" : "\u2303", details.hidden ? t("show") : t("hide"));
      }

      card.addEventListener("click", (event) => {
        if (event.target.closest("button, input, label, form")) {
          return;
        }
        toggleDetails();
      });

      showButton.addEventListener("click", (event) => {
        event.stopPropagation();
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
            saveLists(updatedLists);
            render();
          },
          render,
        );
        details.replaceChildren(editForm);
        details.hidden = false;
        setIconButton(showButton, "\u2303", t("hide"));
      });

      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        saveLists(getLists().filter((entry) => entry.id !== list.id));
        render();
      });

      container.append(card);
    });
  }

  render();
}

const page = document.body.dataset.page;

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
