const form = document.getElementById("calc-form");
const result = document.getElementById("result");
const opInput = document.getElementById("op");
const rightInput = document.getElementById("right");
const rightRow = document.getElementById("right-row");
const operationButtons = document.querySelectorAll(".op-btn");
const themeToggle = document.getElementById("theme-toggle");
const copyResultButton = document.getElementById("copy-result");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");

const unaryOps = new Set(["square", "sqrt"]);
const historyStorageKey = "calc_history_v1";

let lastResultValue = null;
let historyItems = [];

function syncOperandVisibility() {
  const isUnary = unaryOps.has(opInput.value);
  rightRow.classList.toggle("hidden", isUnary);
  rightInput.required = !isUnary;
  if (isUnary) {
    rightInput.value = "";
  }
}

function formatOperation(left, op, right, resultValue) {
  switch (op) {
    case "square":
      return `${left}² = ${resultValue}`;
    case "sqrt":
      return `√${left} = ${resultValue}`;
    default:
      return `${left} ${op} ${right} = ${resultValue}`;
  }
}

function saveHistory() {
  localStorage.setItem(historyStorageKey, JSON.stringify(historyItems));
}

function renderHistory() {
  historyList.innerHTML = "";
  if (historyItems.length === 0) {
    historyList.innerHTML = '<li class="history-empty">История пока пустая</li>';
    return;
  }

  historyItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <span>${item.text}</span>
      <button type="button" class="reuse-btn" data-value="${item.result}">Использовать</button>
    `;
    historyList.appendChild(li);
  });
}

function addHistoryItem(left, op, right, resultValue) {
  const text = formatOperation(left, op, right, resultValue);
  historyItems.unshift({ text, result: resultValue });
  historyItems = historyItems.slice(0, 10);
  saveHistory();
  renderHistory();
}

function loadHistory() {
  const stored = localStorage.getItem(historyStorageKey);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      historyItems = parsed.slice(0, 10);
    }
  } catch (_) {
    historyItems = [];
  }
}

operationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    opInput.value = button.dataset.op;
    operationButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    syncOperandVisibility();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const left = Number(document.getElementById("left").value);
  const op = opInput.value;
  const right = unaryOps.has(op) ? 0 : Number(rightInput.value);

  try {
    const response = await fetch("/api/calc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ left, right, op }),
    });

    const data = await response.json();
    if (!response.ok) {
      result.textContent = `Ошибка: ${data.error || "неизвестная ошибка"}`;
      result.classList.add("error");
      lastResultValue = null;
      return;
    }

    result.textContent = `Результат: ${data.result}`;
    result.classList.remove("error");
    lastResultValue = data.result;
    addHistoryItem(left, op, right, data.result);
  } catch (error) {
    result.textContent = "Ошибка сети. Попробуйте позже.";
    result.classList.add("error");
    lastResultValue = null;
  }
});

copyResultButton.addEventListener("click", async () => {
  if (lastResultValue === null) {
    result.textContent = "Сначала выполните вычисление.";
    result.classList.add("error");
    return;
  }

  try {
    await navigator.clipboard.writeText(String(lastResultValue));
    result.textContent = `Результат: ${lastResultValue} (скопировано)`;
    result.classList.remove("error");
  } catch (_) {
    result.textContent = "Не удалось скопировать результат.";
    result.classList.add("error");
  }
});

historyList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("reuse-btn")) return;

  const value = Number(target.dataset.value);
  if (!Number.isNaN(value)) {
    document.getElementById("left").value = String(value);
    document.getElementById("left").focus();
  }
});

clearHistoryButton.addEventListener("click", () => {
  historyItems = [];
  saveHistory();
  renderHistory();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const darkEnabled = document.body.classList.contains("dark");
  localStorage.setItem("calc_theme", darkEnabled ? "dark" : "light");
  themeToggle.textContent = darkEnabled ? "☀️" : "🌙";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.ctrlKey) {
    form.requestSubmit();
  }
});

const storedTheme = localStorage.getItem("calc_theme");
if (storedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

loadHistory();
renderHistory();
syncOperandVisibility();
