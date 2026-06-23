const ARTICLE_KEY = "helper_articles";
const LIST_KEY = "helper_lists";
const THEME_KEY = "helper_theme";
const STORAGE_PREFIX = "helper_";

const text = {
  addArticle: "Artikel hinzuf\u00FCgen",
  allDataDeleted: "Alle lokalen Daten wurden gel\u00F6scht.",
  appearanceDescription: "Wechsle zwischen hellem und dunklem Modus. Die Auswahl wird lokal gespeichert.",
  appDataDeleted: "Listen und Einstellungen wurden gel\u00F6scht. Artikel bleiben erhalten.",
  articlesEmpty: "Noch keine Artikel vorhanden.",
  articlesWithCache: "Sollen die gespeicherten Artikel auch gel\u00F6scht werden?",
  cacheConfirmAll: "Wirklich alles l\u00F6schen? Artikel, Listen und Einstellungen werden entfernt.",
  cacheConfirmKeepArticles: "Wirklich l\u00F6schen? Listen und Einstellungen werden entfernt, Artikel bleiben erhalten.",
  cancel: "Abbrechen",
  darkMode: "\u263E Dunkelmodus",
  dateTimeSeparator: "Zeit",
  delete: "L\u00F6schen",
  edit: "Bearbeiten",
  hide: "Ausblenden",
  lightMode: "\u2600 Hellmodus",
  listSaved: "Liste {name} wurde gespeichert.",
  listsEmpty: "Noch keine Listen gespeichert.",
  needQuantity: "Bitte trage mindestens eine Menge ein.",
  noArticlesForList: "Lege zuerst einen Artikel an.",
  save: "Speichern",
  show: "Abrufen",
  unknownArticle: "Unbekannter Artikel",
};

const defaultArticles = ["Milch", "Brot", "Eier"];

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
      .filter((key) => includeArticles || key !== ARTICLE_KEY)
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
      setIconButton(deleteButton, "\u00D7", t("delete"));
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
      setIconButton(editButton, "\u270E", t("edit"));

      const deleteButton = document.createElement("button");
      deleteButton.className = "button danger compact";
      deleteButton.type = "button";
      setIconButton(deleteButton, "\u00D7", t("delete"));

      actions.append(showButton, editButton, deleteButton);
      header.append(title, actions);

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
