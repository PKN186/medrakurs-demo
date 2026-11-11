# Видео и плеер v6

Проверено 11.11.2026. Первичный источник обоих роликов — секция «Про офтальмологию» на главной странице https://ra-kurs86.ru/. Прямые MP4 указаны в HTML действующего сайта. Ролики перенесены полностью; имена, медицинские обещания и расшифровки речи в демо не добавлялись.

| В демо | Оригинал центра | Длительность копии | Размер копии |
|---|---|---:|---:|
| clinic-appointment-720.mp4 — «Приём офтальмолога» | https://ra-kurs86.ru/images/video/Kozlovskaya_Priem.mp4 | 180.436 с | 13 203 088 байт |
| clinic-orthokeratology-720.mp4 — «Об ортокератологии» | https://ra-kurs86.ru/images/video/Kozlovskaya_Ortokeratologia.mp4 | 181.673333 с | 17 055 264 байт |

Оригиналы: 264 019 848 и 272 115 705 байт соответственно, 1920×1080, H.264/AAC, 25 кадров/с. Продолжительность контейнеров — 180.48 и 181.717333 с; разница длительности контейнеров после перекодирования — около 44 мс. Монтаж, обрезка и изменение скорости не применялись. Полное содержание сохранено.

Копии: 1280×720, H.264, yuv420p, AAC 96 кбит/с. moov расположен перед mdat (faststart). Команда для каждого оригинала:

```sh
ffmpeg -i ORIGINAL.mp4 -map 0:v:0 -map 0:a:0 -vf scale=-2:720 \
  -c:v libx264 -preset medium -crf 24 -maxrate 900k -bufsize 1800k \
  -threads 4 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart OUTPUT.mp4
```

Обложки video-appointment.webp / video-orthokeratology.webp — реальные кадры соответствующих оригиналов на 00:35. Экспорт 1280×720; миниатюры 240×135. Обложки не генерировались, персонажам не приписаны неподтверждённые имена.

## Контрольные суммы SHA-256

```text
Оригинал Kozlovskaya_Priem.mp4
54db1584c674ccd8c2ccd480a2b0be2502afe86eeafd09d0ea31713a83ac43fa
Оригинал Kozlovskaya_Ortokeratologia.mp4
120549159914caeee9ecb41cabd6bab72c351976575c67b4fd4440f0c8f000d1
clinic-appointment-720.mp4
792e9a6893eccd3281384855398fabe7040baae140cd14c5f84bc52fb86595e1
clinic-orthokeratology-720.mp4
137eae3e16a47b33648e3ad56916fc55f6b23c2ac8b0e8386c151e9a3aad6fb9
video-appointment.webp
3c4f99878fba376a96beee8e14785dfaf7fd9ef9548fc8ca64d23933d741422e
video-orthokeratology.webp
401177423d590402c90b48a1f80d1c859fb6ed57474dcb99f9f223cdb739fc26
```

## Video.js

Локальный пакет @videojs/html **10.3.0**, установлен из официального npm. Основа: https://videojs.org/docs/framework/html/guides/self-hosting и https://videojs.org/docs/guides/installation/html. Нативный HTML video, стандартный video-skin, русский media-i18n. Встроенные языковые пакеты включены в единый ESM-файл; весь пакет загружается только по явному запуску ролика. В исходном HTML нет src у video, preload=none; библиотека подключается через dynamic import.

Точка входа — player-entry-v6.js, готовая сборка — video-player-v6.js (572 527 байт). Для пересборки из корня проекта:

```sh
player_build=$(mktemp -d)
npm install --prefix "$player_build" --save-exact --ignore-scripts --no-audit --no-fund @videojs/html@10.3.0 esbuild@0.28.2
NODE_PATH="$player_build/node_modules" "$player_build/node_modules/.bin/esbuild" player-entry-v6.js \
  --bundle --format=esm --target=es2022 --minify --legal-comments=linked --outfile=video-player-v6.js
```

Зависимости в сборке: @videojs/core, @videojs/element, @videojs/html, @videojs/media, @videojs/store, @videojs/utils — 10.3.0, Apache-2.0; @lit/context 1.1.6 — BSD-3-Clause. Полные тексты лицензий и уведомление Video.js — VIDEOJS-LICENSE.txt; автоматические уведомления сборщика — video-player-v6.js.LEGAL.txt. Копирование сборки должно сохранять оба файла.

Никаких CDN, рекламных модулей, аналитики, загрузчиков стороннего видео или хранения контактов не добавлено. Библиотека не пишет пользовательские настройки в localStorage; прежняя настройка крупного текста — единственное локальное сохранение страницы. CSP сохраняет connect-src 'none' и form-action 'none', добавлен media-src 'self'. При сбое ESM остаются нативные controls. При отключённом JavaScript показаны ссылки на два локальных файла.

Субтитры в исходных MP4 отсутствуют; выдуманные дорожки и автоматические расшифровки не добавлялись.
