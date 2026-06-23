const ARTICLE_KEY = "helper_articles";
const LIST_KEY = "helper_lists";
const THEME_KEY = "helper_theme";
const LANGUAGE_KEY = "helper_language";
const STORAGE_PREFIX = "helper_";

const translations = {
  en: {
    addArticle: "Add article",
    allDataDeleted: "All local data has been deleted.",
    appearanceDescription: "Switch between light and dark mode. Your choice is saved locally.",
    appearanceTitle: "Appearance",
    appDataDeleted: "Lists and settings were deleted. Articles were kept.",
    articleDeletedLabel: "Delete",
    articleName: "Article name",
    articlesDescription: "Add articles and remove anything you no longer need.",
    articlesEmpty: "No articles yet.",
    articlesEyebrow: "Manage articles",
    articlesTitle: "Your articles",
    articlesWithCache: "Should saved articles also be deleted?",
    cancel: "Cancel",
    cacheConfirmAll: "Really delete everything? Articles, lists and settings will be removed.",
    cacheConfirmKeepArticles: "Really delete? Lists and settings will be removed, articles will be kept.",
    cacheDescription: "You will be asked whether articles should also be deleted. Then you confirm the deletion.",
    cacheTitle: "Clear cache",
    clearLocalData: "Delete local data",
    dateTimeSeparator: "Time",
    delete: "Delete",
    darkMode: "\u263E Dark mode",
    edit: "Edit",
    hide: "Hide",
    homeDescription: "Create new lists, keep track of everything, and find it again when you need it.",
    homeEyebrow: "Welcome back",
    homeNewList: "New list",
    homeTitle: "Good to see you.",
    homeViewLists: "View lists",
    languageDescription: "Choose the app language. Your choice is saved locally.",
    languageTitle: "Language",
    lightMode: "\u2600 Light mode",
    listSaved: "List {name} was saved.",
    listsDescription: "Open saved lists, edit quantities, or delete old entries.",
    listsEmpty: "No saved lists yet.",
    listsEyebrow: "Saved lists",
    needQuantity: "Please enter at least one quantity.",
    noArticlesForList: "Create an article first.",
    navArticles: "Articles",
    navLists: "Lists",
    navNewList: "New list",
    newArticlePlaceholder: "New article",
    newListDescription: "Enter the quantity next to each article. Empty quantities are not saved.",
    newListEyebrow: "New list",
    newListTitle: "Enter quantities",
    save: "Save",
    saveList: "Save list",
    settingsDescription: "Manage language, dark mode, and local app data.",
    settingsEyebrow: "Preferences",
    show: "Open",
    unknownArticle: "Unknown article",
  },
  de: {
    addArticle: "Artikel hinzufügen",
    allDataDeleted: "Alle lokalen Daten wurden gelöscht.",
    appDataDeleted: "Listen und Einstellungen wurden gelöscht. Artikel bleiben erhalten.",
    articleDeletedLabel: "Löschen",
    articleName: "Artikelname",
    articlesEmpty: "Noch keine Artikel vorhanden.",
    articlesWithCache: "Sollen die gespeicherten Artikel auch gelöscht werden?",
    cancel: "Abbrechen",
    cacheConfirmAll: "Wirklich alles löschen? Artikel, Listen und Einstellungen werden entfernt.",
    cacheConfirmKeepArticles: "Wirklich löschen? Listen und Einstellungen werden entfernt, Artikel bleiben erhalten.",
    dateTimeSeparator: "Zeit",
    delete: "Löschen",
    darkMode: "\u263E Dunkelmodus",
    edit: "Bearbeiten",
    hide: "Ausblenden",
    homeDescription: "Erstelle neue Listen, behalte den Überblick und finde alles wieder, wenn du es brauchst.",
    homeEyebrow: "Willkommen zurück",
    homeNewList: "Neue Liste",
    homeTitle: "Schön, dass du da bist.",
    homeViewLists: "Listen ansehen",
    lightMode: "\u2600 Hellmodus",
    listSaved: "Liste {name} wurde gespeichert.",
    listsEmpty: "Noch keine Listen gespeichert.",
    needQuantity: "Bitte trage mindestens eine Menge ein.",
    noArticlesForList: "Lege zuerst einen Artikel an.",
    navArticles: "Artikel",
    navLists: "Listen",
    navNewList: "Neue Liste",
    save: "Speichern",
    addArticle: "Artikel hinzuf\u00FCgen",
    allDataDeleted: "Alle lokalen Daten wurden gel\u00F6scht.",
    appearanceDescription: "Wechsle zwischen hellem und dunklem Modus. Die Auswahl wird lokal gespeichert.",
    appearanceTitle: "Darstellung",
    appDataDeleted: "Listen und Einstellungen wurden gel\u00F6scht. Artikel bleiben erhalten.",
    articleDeletedLabel: "L\u00F6schen",
    articlesDescription: "F\u00FCge Artikel hinzu und entferne alles, was du nicht mehr brauchst.",
    articlesEyebrow: "Artikel verwalten",
    articlesTitle: "Deine Artikel",
    articlesWithCache: "Sollen die gespeicherten Artikel auch gel\u00F6scht werden?",
    cacheConfirmAll: "Wirklich alles l\u00F6schen? Artikel, Listen und Einstellungen werden entfernt.",
    cacheConfirmKeepArticles: "Wirklich l\u00F6schen? Listen und Einstellungen werden entfernt, Artikel bleiben erhalten.",
    cacheDescription: "Du wirst gefragt, ob Artikel mitgel\u00F6scht werden sollen. Danach musst du die L\u00F6schung best\u00E4tigen.",
    cacheTitle: "Cache l\u00F6schen",
    clearLocalData: "Lokale Daten l\u00F6schen",
    delete: "L\u00F6schen",
    homeDescription: "Erstelle neue Listen, behalte den \u00DCberblick und finde alles wieder, wenn du es brauchst.",
    homeEyebrow: "Willkommen zur\u00FCck",
    homeTitle: "Sch\u00F6n, dass du da bist.",
    languageDescription: "W\u00E4hle die App-Sprache. Die Auswahl wird lokal gespeichert.",
    languageTitle: "Sprache",
    listsDescription: "Rufe gespeicherte Listen ab, bearbeite Mengen oder l\u00F6sche alte Eintr\u00E4ge.",
    listsEyebrow: "Gespeicherte Listen",
    newArticlePlaceholder: "Neuer Artikel",
    newListDescription: "Trage neben den Artikeln die gew\u00FCnschte Menge ein. Leere Mengen werden nicht gespeichert.",
    newListEyebrow: "Neue Liste",
    newListTitle: "Mengen eintragen",
    saveList: "Liste speichern",
    settingsDescription: "Sprache, Darkmode und lokale App-Daten verwalten.",
    settingsEyebrow: "Einstellungen",
    show: "Abrufen",
    unknownArticle: "Unbekannter Artikel",
  },
};

const defaultArticles = ["Milk", "Bread", "Eggs"];

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
    // The app remains usable if a browser temporarily blocks local storage.
  }
}

function getLanguage() {
  const language = readStorage(LANGUAGE_KEY, "en");
  return translations[language] ? language : "en";
}

function t(key, replacements = {}) {
  const dictionary = translations[getLanguage()] ?? translations.en;
  const text = dictionary[key] ?? translations.en[key] ?? key;
  return Object.entries(replacements).reduce(
    (value, [name, replacement]) => value.replace(`{${name}}`, replacement),
    text,
  );
}

function applyLanguage() {
  const language = getLanguage();
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const label = t(element.dataset.i18nAria);
    element.setAttribute("aria-label", label);
    element.title = label;
  });

  document.querySelectorAll("[data-language-select]").forEach((select) => {
    select.value = language;
  });
}

function setupLanguage() {
  applyLanguage();

  document.querySelectorAll("[data-language-select]").forEach((select) => {
    select.addEventListener("change", () => {
      writeStorage(LANGUAGE_KEY, select.value);
      applyLanguage();
      window.location.reload();
    });
  });
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
    const isDark = theme === "dark";
    const label = isDark ? t("lightMode") : t("darkMode");
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
      .filter((key) => includeArticles || key !== ARTICLE_KEY)
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Some iOS privacy modes can block access; cache storage is still attempted below.
  }

  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch {
      // CacheStorage may be unavailable depending on browser settings.
    }
  }
}

function setupSettingsPage() {
  const clearButton = document.querySelector("[data-clear-cache]");
  const status = document.querySelector("[data-settings-status]");

  clearButton?.addEventListener("click", async () => {
    const includeArticles = window.confirm(t("articlesWithCache"));
    const confirmed = window.confirm(
      includeArticles
        ? t("cacheConfirmAll")
        : t("cacheConfirmKeepArticles"),
    );

    if (!confirmed) {
      return;
    }

    await clearAppCache({ includeArticles });
    applyTheme(getPreferredTheme());

    if (status) {
      status.textContent = includeArticles
        ? t("allDataDeleted")
        : t("appDataDeleted");
    }
  });
}

function getArticles() {
  const articles = readStorage(ARTICLE_KEY, null);
  if (Array.isArray(articles)) {
    return articles;
  }

  const initialArticles = defaultArticles.map((name) => ({
    id: createId(),
    name,
  }));
  writeStorage(ARTICLE_KEY, initialArticles);
  return initialArticles;
}

function saveArticles(articles) {
  writeStorage(ARTICLE_KEY, articles);
}

function getLists() {
  return readStorage(LIST_KEY, []);
}

function saveLists(lists) {
  writeStorage(LIST_KEY, lists);
}

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(-2)} / ${t("dateTimeSeparator")} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function addArticleByName(name) {
  const cleanName = normalizeName(name);
  if (!cleanName) {
    return { article: null, created: false };
  }

  const articles = getArticles();
  const existingArticle = articles.find(
    (article) => article.name.toLowerCase() === cleanName.toLowerCase(),
  );

  if (existingArticle) {
    return { article: existingArticle, created: false };
  }

  const article = {
    id: createId(),
    name: cleanName,
  };
  articles.push(article);
  articles.sort((a, b) => a.name.localeCompare(b.name, "de"));
  saveArticles(articles);
  return { article, created: true };
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
  const form = document.querySelector("[data-article-form]");
  const input = document.querySelector("[data-article-input]");
  const list = document.querySelector("[data-article-list]");

  function render() {
    const articles = getArticles();
    list.innerHTML = "";

    if (articles.length === 0) {
      list.append(createEmptyState(t("articlesEmpty")));
      return;
    }

    articles.forEach((article) => {
      const item = document.createElement("li");
      item.className = "item-row";

      const name = document.createElement("span");
      name.textContent = article.name;

      const deleteButton = document.createElement("button");
      deleteButton.className = "button danger compact";
      deleteButton.type = "button";
      setIconButton(deleteButton, "\u00d7", t("delete"));
      deleteButton.addEventListener("click", () => {
        saveArticles(getArticles().filter((entry) => entry.id !== article.id));
        render();
      });

      item.append(name, deleteButton);
      list.append(item);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    addArticleByName(input.value);
    input.value = "";
    input.focus();
    render();
  });

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
  const articleForm = document.querySelector("[data-inline-article-form]");
  const articleInput = document.querySelector("[data-inline-article-input]");
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

  articleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = addArticleByName(articleInput.value);
    articleInput.value = "";
    renderQuantities();

    if (result.article) {
      const input = articleContainer.querySelector(`input[name="${result.article.id}"]`);
      input?.focus();
    }
  });

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
  setIconButton(cancelButton, "\u00d7", t("cancel"));
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

      const title = document.createElement("h2");
      title.textContent = list.title;

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const showButton = document.createElement("button");
      showButton.className = "button secondary compact";
      showButton.type = "button";
      setIconButton(showButton, "\u2304", t("show"));

      const editButton = document.createElement("button");
      editButton.className = "button secondary compact";
      editButton.type = "button";
      setIconButton(editButton, "\u270e", t("edit"));

      const deleteButton = document.createElement("button");
      deleteButton.className = "button danger compact";
      deleteButton.type = "button";
      setIconButton(deleteButton, "\u00d7", t("delete"));

      actions.append(showButton, editButton, deleteButton);
      header.append(title, actions);

      const details = createListDetails(list);
      card.append(header, details);

      showButton.addEventListener("click", () => {
        details.hidden = !details.hidden;
        setIconButton(
          showButton,
          details.hidden ? "\u2304" : "\u2303",
          details.hidden ? t("show") : t("hide"),
        );
      });

      editButton.addEventListener("click", () => {
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

      deleteButton.addEventListener("click", () => {
        saveLists(getLists().filter((entry) => entry.id !== list.id));
        render();
      });

      container.append(card);
    });
  }

  render();
}

const page = document.body.dataset.page;

setupLanguage();
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
