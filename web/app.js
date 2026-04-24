const screen = document.getElementById("screen");
const result = document.getElementById("result");
const keypad = document.querySelector(".keypad");
const themeToggle = document.getElementById("theme-toggle");
const copyResultButton = document.getElementById("copy-result");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");
const historyStorageKey = "calc_history_v1";

let lastResultValue = null;
let historyItems = [];
let displayValue = "0";
let firstOperand = null;
let pendingOp = null;
let replaceDisplay = false;

function updateScreen() {
  screen.textContent = displayValue;
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

function parseDisplay() {
  return Number(displayValue);
}

function setDisplayFromNumber(value) {
  displayValue = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(8)));
  updateScreen();
}

function appendDigit(digit) {
  if (replaceDisplay) {
    displayValue = digit === "." ? "0." : digit;
    replaceDisplay = false;
    updateScreen();
    return;
  }

  if (digit === "." && displayValue.includes(".")) return;
  if (displayValue === "0" && digit !== ".") {
    displayValue = digit;
  } else {
    displayValue += digit;
  }
  updateScreen();
}

function clearAll() {
  displayValue = "0";
  firstOperand = null;
  pendingOp = null;
  replaceDisplay = false;
  updateScreen();
}

function backspace() {
  if (replaceDisplay) return;
  if (displayValue.length <= 1) {
    displayValue = "0";
  } else {
    displayValue = displayValue.slice(0, -1);
  }
  updateScreen();
}

async function apiCompute(left, op, right) {
  const response = await fetch("/api/calc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ left, right, op }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "неизвестная ошибка");
  }
  return data.result;
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

async function applyUnary(op) {
  const left = parseDisplay();
  try {
    const computed = await apiCompute(left, op, 0);
    setDisplayFromNumber(computed);
    result.textContent = `Результат: ${computed}`;
    result.classList.remove("error");
    lastResultValue = computed;
    addHistoryItem(left, op, 0, computed);
    replaceDisplay = true;
  } catch (error) {
    result.textContent = `Ошибка: ${error.message}`;
    result.classList.add("error");
    lastResultValue = null;
  }
}

function selectBinaryOp(op) {
  firstOperand = parseDisplay();
  pendingOp = op;
  replaceDisplay = true;
  result.textContent = `Выбрана операция: ${op}`;
  result.classList.remove("error");
}

async function calculateResult() {
  if (!pendingOp || firstOperand === null) return;
  const right = parseDisplay();
  try {
    const computed = await apiCompute(firstOperand, pendingOp, right);
    setDisplayFromNumber(computed);
    result.textContent = `Результат: ${computed}`;
    result.classList.remove("error");
    lastResultValue = computed;
    addHistoryItem(firstOperand, pendingOp, right, computed);
    firstOperand = null;
    pendingOp = null;
    replaceDisplay = true;
  } catch (error) {
    result.textContent = `Ошибка: ${error.message}`;
    result.classList.add("error");
    lastResultValue = null;
  }
}

keypad.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("key")) return;

  const digit = target.dataset.digit;
  const op = target.dataset.op;
  const action = target.dataset.action;

  if (digit) {
    appendDigit(digit);
    return;
  }

  if (op === "square" || op === "sqrt") {
    await applyUnary(op);
    return;
  }

  if (op) {
    selectBinaryOp(op);
    return;
  }

  if (action === "clear") {
    clearAll();
    return;
  }

  if (action === "backspace") {
    backspace();
    return;
  }

  if (action === "equals") {
    await calculateResult();
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
    displayValue = String(value);
    replaceDisplay = true;
    updateScreen();
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
  if ((event.key >= "0" && event.key <= "9") || event.key === ".") {
    appendDigit(event.key);
    return;
  }
  if (event.key === "Backspace") {
    backspace();
    return;
  }
  if (event.key === "Escape") {
    clearAll();
    return;
  }
  if (event.key === "=" || event.key === "Enter") {
    calculateResult();
  }
});

const storedTheme = localStorage.getItem("calc_theme");
if (storedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

loadHistory();
renderHistory();
updateScreen();
