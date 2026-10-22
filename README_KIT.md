# Kit v2 — Smoothface's Epic, desde cero

Esto es el andamiaje de gobernanza para la segunda corrida. No trae arte ni
motor: trae las reglas, los skills, los gates automáticos y la mesa de luz
para que el arte se produzca pieza por pieza y nada avance sin tu
aprobación.

## Índice

| archivo | para qué |
|---|---|
| `AGENTS.md` | las 11 reglas del agente y el orden de producción. Se lee al inicio de cada sesión |
| `STYLE_BIBLE.md` | el estilo congelado, con las decisiones de Alex del 2026-10-21 (diseño Aguilar + construcción cutout, bordes tosco/limpio, tinta por profundidad, lápiz, dos paletas, 35 %) |
| `SLICE.md` | alcance cerrado del slice 1 |
| `BACKLOG.md` | ideas diferidas; ya trae las del piloto |
| `BITACORA.md` | registro; ya trae la entrada del reinicio |
| `SUPERPROMPT_SESION.md` | el prompt de arranque de cada sesión y los 15 lotes del slice |
| `.agents/skills/*/SKILL.md` | 7 skills: `style-bible`, `one-piece-generator`, `style-critic`, `anatomy-critic`, `review-gate`, `room-layout`, `bitacora` |
| `pipeline/gates.py` | gates automáticos: `normalize`, `check`, `layout` |
| `pipeline/rules.json`, `palette.json`, `heights.json` | umbrales, paleta y alturas. Los editás vos; `palette.json` trae valores de ejemplo que hay que reemplazar |
| `pipeline/collect_references.py` | busca las referencias de 2010 en el repo, aplana PSD, exporta capas y las deja en `art/references/` con los nombres correctos |
| `pipeline/approve.py` | aplica tus veredictos: mueve a `approved/` o `rejected/`, escribe `MANIFEST.json` |
| `review/review_server.py` + `review_sheet.html` | la mesa de luz: `python review/review_server.py --root .` y abrí http://localhost:8765 |
| `review/review.schema.json` | formato de `review.json` |
| `layout/z1s3.layout.json` | layout de ejemplo con los objetos en `pending` |
| `art/` | `references/` (lo llenás vos), `candidates/`, `approved/` (con manifiesto vacío), `rejected/` |

## Instalación

1. Congelá el piloto: `git tag v0-pilot-2026-10-20 && git push --tags`.
2. Rama nueva o repo nuevo. Copiá este kit a la raíz (los archivos nuevos
   conviven con `src/`; los `.agents/skills` viejos se borran o se mueven a
   `_archive/`).
3. `python pipeline/collect_references.py --repo .` copia las referencias a
   `art/references/` con los nombres de `STYLE_BIBLE.md §1` (necesita
   `pip install psd-tools` para aplanar los PSD). Si reporta FALTA, copiá
   ese archivo a mano. Las paletas se aprueban en el lote P0 de la primera
   sesión (el agente las extrae, vos las aprobás en la mesa de luz); hasta
   entonces `palette.json` es provisional y el gate solo reporta.
4. Probá los gates con una pieza del piloto que te haya gustado y una que
   no: `python pipeline/gates.py check <png> --meta <meta.json>`. Si la
   buena falla o la mala pasa, ajustá `rules.json`.
5. Calibrá los críticos como dice `style-critic/SKILL.md` (3 aprobadas, 3
   rechazadas del piloto).
6. Arrancá la sesión 1 con `SUPERPROMPT_SESION.md`, lote L0 (tres piezas).

## Tu rutina

Dos veces al día, diez minutos: `python review/review_server.py --root .`,
abrir la mesa de luz, A para aprobar, R + motivo + Ctrl+Enter para
rechazar. Escribí los motivos con tus palabras; son el único feedback que
mejora a los críticos. Después le decís al agente "ya revisé" y él aplica
los veredictos con `approve.py`.

## Lo que el kit no decide por vos

Si L0 (tres piezas) no te convence, el problema no es el agente ni el
generador: es `STYLE_BIBLE.md`. Se ajusta ahí y se repite L0. No se pasa a
L1 con un hero que no te guste.
