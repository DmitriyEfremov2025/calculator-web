const form = document.getElementById("calc-form");
const result = document.getElementById("result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const left = Number(document.getElementById("left").value);
  const right = Number(document.getElementById("right").value);
  const op = document.getElementById("op").value;

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
