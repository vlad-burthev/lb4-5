const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Метод степенів для обчислення найбільшого власного значення
function calculateLargestEigenvalue(matrix) {
  const n = matrix.length;

  // Ініціалізація випадкового вектора
  let vector = Array(n)
    .fill()
    .map(() => Math.random());

  // Нормалізація вектора
  const normalizeVector = (v) => {
    const magnitude = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    return v.map((val) => val / magnitude);
  };

  vector = normalizeVector(vector);

  // Виконання ітерацій методу степенів
  let previousEigenvalue = 0;
  let eigenvalue = 0;
  const maxIterations = 1000;
  const tolerance = 1e-10;

  for (let iter = 0; iter < maxIterations; iter++) {
    // Множення матриці на вектор
    let result = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        result[i] += matrix[i][j] * vector[j];
      }
    }

    // Обчислення частки Релея (власного значення)
    let rayleighNumerator = 0;
    let rayleighDenominator = 0;
    for (let i = 0; i < n; i++) {
      rayleighNumerator += vector[i] * result[i];
      rayleighDenominator += vector[i] * vector[i];
    }
    eigenvalue = rayleighNumerator / rayleighDenominator;

    // Нормалізація результатного вектора
    vector = normalizeVector(result);

    // Перевірка на збіжність
    if (Math.abs(eigenvalue - previousEigenvalue) < tolerance) {
      console.log(`Збіжність досягнута після ${iter} ітерацій`);
      break;
    }

    previousEigenvalue = eigenvalue;
  }

  return eigenvalue;
}

// Ендпоінт для обчислення найбільшого власного значення матриці
app.post("/calculate-eigenvalue", (req, res) => {
  try {
    const matrix = req.body.matrix;

    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
      return res.status(400).json({ error: "Невірно передана матриця" });
    }

    console.log(
      "Отримано запит на обчислення для матриці розміром:",
      matrix.length
    );
    const startTime = Date.now();

    const largestEigenvalue = calculateLargestEigenvalue(matrix);

    const endTime = Date.now();
    console.log(`Обчислення завершено за ${endTime - startTime}мс`);

    return res.json({
      eigenvalue: largestEigenvalue,
      size: matrix.length,
      calculationTime: endTime - startTime,
    });
  } catch (error) {
    console.error("Помилка при обчисленні власного значення:", error);
    return res
      .status(500)
      .json({ error: "Помилка при обчисленні власного значення" });
  }
});

// Ендпоінт перевірки стану сервера
app.get("/", (req, res) => {
  res.send("Сервер працює");
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
