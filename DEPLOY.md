# Запуск tnovv.ru на отдельном сервере

Репозиторий: `https://github.com/TimofeyNovv/tnovv.ru.git`. В `Caddyfile` уже указан домен `tnovv.ru`. Команды установки предназначены для Ubuntu 22.04, 24.04 или 26.04 и выполняются на новом сервере от пользователя root.

## 1. Отправить конфигурацию в GitHub — на компьютере

В терминале VS Code в папке проекта:

```bash
git add Caddyfile README.md DEPLOY.md
git commit -m "Configure tnovv.ru deployment"
git push
```

## 2. Направить домен на новый сервер — в панели DNS

Возьми публичный IPv4 нового сервера в панели его хостинга. В DNS-зоне **tnovv.ru** установи запись:

| Имя | Тип | Значение |
| --- | --- | --- |
| `@` или пустое поле | `A` | Публичный IPv4 нового сервера |

Если для этого имени уже есть A-запись с другим IP, замени её значение. Если есть AAAA-запись, она должна указывать на работающий IPv6 нового сервера; устаревшую запись нужно исправить или удалить. Обновление DNS может занять некоторое время.

В сетевом экране хостинга разреши входящие TCP 80 и 443. HTTPS и перенаправление с HTTP настроит Caddy. [Требования для автоматического HTTPS](https://caddyserver.com/docs/automatic-https).

## 3. Подключиться к новому серверу

На компьютере, заменив `NEW_SERVER_IP` на его адрес:

```bash
ssh root@NEW_SERVER_IP
```

Проверить систему и занятые порты:

```bash
cat /etc/os-release
ss -ltnp '( sport = :80 or sport = :443 )'
```

Если версия Ubuntu отличается от перечисленных в начале инструкции, уточни команды установки. Если порты заняты, сначала выясни, какой сервис их использует; до этого не запускай контейнер визитки на этих портах.

## 4. Установить Docker — на новом сервере

Установка через [официальный apt-репозиторий Docker](https://docs.docker.com/engine/install/ubuntu/). Блок с `EOF` копируй целиком:

```bash
apt update
apt install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

. /etc/os-release
cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: ${UBUNTU_CODENAME:-$VERSION_CODENAME}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
docker --version
docker compose version
docker run --rm hello-world
```

Если последняя команда вывела `Hello from Docker!`, Docker работает. При ошибке остановись на соответствующем шаге и проверь её текст.

## 5. Скачать и запустить сайт — на новом сервере

```bash
git clone https://github.com/TimofeyNovv/tnovv.ru.git /opt/portfolio
cd /opt/portfolio
cat Caddyfile
docker compose up -d --build
docker compose ps
docker compose logs --tail=80 web
```

В первой строке `Caddyfile` должно быть `tnovv.ru {`, а у контейнера после запуска — статус `Up`. Для приватного репозитория серверу потребуется авторизация GitHub, например SSH-ключ с доступом к этому репозиторию и SSH-адрес для клонирования. HTTPS-команда выше подходит для публичного репозитория без авторизации.

## 6. Открыть сайт

Открой в Firefox **https://tnovv.ru**. Для первого получения сертификата нужны правильный DNS и доступ к TCP 80/443 извне. Когда DNS обновится и Caddy получит сертификат, можно проверить ответ на сервере:

```bash
curl -I https://tnovv.ru
```

Если сайт не открывается, пришли вывод:

```bash
cd /opt/portfolio
docker compose ps
docker compose logs --tail=100 web
```

## Обновления

После изменений на компьютере выполни `git add`, `git commit` и `git push`. Затем на новом сервере:

```bash
cd /opt/portfolio
git pull --ff-only
docker compose up -d --build
```

Выполняй пересборку после успешного `git pull`: работающий сайт раздаётся из образа. Контейнер запускается после перезагрузки сервера; сертификаты хранятся в постоянном Docker-томе `caddy_data`. Обычная пересборка сохраняет этот том.
