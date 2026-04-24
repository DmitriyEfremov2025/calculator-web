# Go Web Calculator

Web-калькулятор на Go (backend API) и чистом JavaScript (frontend).

## Локальный запуск

### Вариант 1: напрямую через Go

```bash
go run ./cmd/server
```

Откройте: <http://localhost:8080>

### Вариант 2: через Docker

```bash
docker compose up --build
```

Откройте: <http://localhost:8080>

## API

- `POST /api/calc`
  - body:
    ```json
    {
      "left": 10,
      "right": 5,
      "op": "+"
    }
    ```
  - response:
    ```json
    {
      "result": 15
    }
    ```

## GitHub Actions

Workflow: `.github/workflows/ci-cd.yml`

- `test` job:
  - проверка форматирования (`gofmt`)
  - запуск тестов (`go test ./...`)
- `docker_publish` job:
  - запускается только при push тега `v*`
  - собирает и публикует образ в DockerHub

### Нужные GitHub Secrets

Добавьте в репозиторий:

- `DOCKERHUB_USERNAME` — ваш логин DockerHub
- `DOCKERHUB_TOKEN` — access token DockerHub

## Деплой (бесплатно)

Простой бесплатный вариант: [Render](https://render.com).

1. Подключите GitHub-репозиторий в Render.
2. Создайте `Web Service` из Docker.
3. Render сам соберет контейнер из `Dockerfile`.
4. Получите публичный URL с HTTPS.

## Публикация в Google Play (через TWA)

1. Разверните веб-приложение по HTTPS (например, на Render).
2. Сгенерируйте Android-обертку TWA через Bubblewrap.
3. Подпишите `.aab` ключом релиза.
4. Загрузите `.aab` в Google Play Console.
