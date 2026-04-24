const form = document.getElementById("calc-form");
const result = document.getElementById("result");
const opInput = document.getElementById("op");
const rightInput = document.getElementById("right");
const rightRow = document.getElementById("right-row");
const operationButtons = document.querySelectorAll(".op-btn");

const unaryOps = new Set(["square", "sqrt"]);

function syncOperandVisibility() {
  const isUnary = unaryOps.has(opInput.value);
  rightRow.classList.toggle("hidden", isUnary);
  rightInput.required = !isUnary;
  if (isUnary) {
    rightInput.value = "";
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
      return;
    }

    result.textContent = `Результат: ${data.result}`;
    result.classList.remove("error");
  } catch (error) {
    result.textContent = "Ошибка сети. Попробуйте позже.";
    result.classList.add("error");
  }
});

syncOperandVisibility();
