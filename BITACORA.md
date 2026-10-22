# BITACORA.md - Registro del proyecto (v2, desde cero)

Regla: si no está aquí, no pasó. El formato exacto está en
`.agents/skills/bitacora/SKILL.md`. Las entradas se agregan al final; nunca
se editan entradas anteriores (si algo cambió, nueva entrada que lo diga).

---

## 2026-10-20 - Reinicio

- Se congela la corrida anterior como piloto: tag `v0-pilot-2026-10-20` en el
  repo `alebar000/moonstorm-smoothfaces-epic`. No se vuelve a escribir en esa rama.
- Causas del reinicio (resumen de Alex): sin style bible congelado; el agente
  regeneraba assets aprobados; críticos sintéticos sin relación con el juicio
  humano; alcance cambiando a mitad de loop; objetos recortados de fondos
  compuestos; anatomía rota (un brazo, ojos desalineados); alturas de
  personajes inconsistentes.
- Nuevo kit instalado: `AGENTS.md`, `STYLE_BIBLE.md`, `SLICE.md`, skills en
  `.agents/skills/`, hoja de revisión en `review/`, gates en `pipeline/`.

---

## 2026-10-21 20:33-20:45 - Instalación limpia de `moonstorm-v2` y congelamiento del piloto

1. **Verificación de congelamiento de `..\moonstorm` (piloto v0)**:
   - Se verificó en `c:\Users\alexb\Documents\GrokBotHandoff\moonstorm` que el árbol de trabajo está limpio (`nothing to commit, working tree clean`) y que el tag `v0-pilot-2026-10-20` existe tanto localmente como en el remoto `origin` (`https://github.com/alebar000/moonstorm-smoothfaces-epic.git`, ref `39617f171f7f24169bb7e7fdca82cd8235d0ad0b`).
   - No se escribió ni modificó ningún archivo en `..\moonstorm`. Queda estrictamente como referencia de solo lectura.

2. **Creación de `moonstorm-v2` al lado (`c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2`)**:
   - Se copió de `..\moonstorm` únicamente lo autorizado:
     - `recovered/` (archivo histórico recuperado de 2010: `docs/`, `emails/`, `images/`, `builds/`, `other/`).
     - `dr_stache_art/` (archivo visual de 2010: `demo/`, `email/`, `psd_composites/`, `psd_layers/`, `ART_INDEX.md`, `CONTACT_SHEET_*.jpg`, `asset_manifest.json`), excluyendo explícitamente `dr_stache_art/generated_psds/` que pertenecía a la corrida piloto de 2026.
     - Motor funcional: `src/`, `index.html`, `package.json`, `vite.config.ts` y `tsconfig.json`.
   - No se copió nada más de la carpeta vieja: ni `public/assets/`, ni `logs/`, ni `.agents/` viejos, ni `PLAN_*`, ni `SUPERPROMPT_*`, ni `PLAY_SMOOTHFACE_MVP.html`.

3. **Descompresión del kit v2 en la raíz de `moonstorm-v2`**:
   - Se descomprimió `C:\Users\alexb\Downloads\moonstorm-v2-kit.zip` directamente en la raíz de `moonstorm-v2`:
     - Gobernanza y documentos: `AGENTS.md`, `STYLE_BIBLE.md`, `SLICE.md`, `BACKLOG.md`, `BITACORA.md`, `README_KIT.md`, `SUPERPROMPT_SESION.md`.
     - Skills nuevos (`.agents/skills/`): `anatomy-critic`, `bitacora`, `one-piece-generator`, `review-gate`, `room-layout`, `style-bible`, `style-critic`.
     - Estructura de arte (`art/`): `art/approved/MANIFEST.json`, `art/candidates/`, `art/references/`, `art/rejected/`.
     - Layout inicial (`layout/`): `layout/z1s3.layout.json`.
     - Pipeline (`pipeline/`): `gates.py`, `approve.py`, `heights.json`, `palette.json`, `rules.json`.
     - Mesa de luz (`review/`): `review_server.py`, `review_sheet.html`, `review.schema.json`.
   - Se limpiaron todos los caracteres em-dash de los archivos del kit para cumplir la regla de cero em-dashes en todo el repositorio.

4. **Recolección automática de referencias de 2010 (`pipeline/collect_references.py`)**:
   - Como `moonstorm-v2-kit.zip` no incluía el script `pipeline/collect_references.py`, se implementó `pipeline/collect_references.py` y se ejecutó `python pipeline/collect_references.py --repo .`.
   - Referencias recolectadas en `art/references/` (marcadas como solo lectura):
     - `art/references/ref_hero_smoothface_flat.png` (de `dr_stache_art/email/email_2010-06-22_aguilar_smoothface003.png`).
     - `art/references/ref_hero_smoothface_layers/` (10 capas PNG de `dr_stache_art/psd_layers/smoothface-cutout003/`).
     - `art/references/ref_room_z1s3_2010.png` (de `dr_stache_art/psd_composites/psd_2010-10-26_aguilar_Z1S3-substampede_captainroom_WIP_composite.jpg`).
     - `art/references/ref_room_z1s3_lineart_2010.png` (de `dr_stache_art/email/email_2010-08-20_aguilar_Z1S3-substampede_captainroom.png`).
     - `art/references/ref_room_z1s3_layers/` (7 capas PNG de `dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/`).
     - `art/references/ref_sketch_capdread.png` (de `dr_stache_art/email/email_2010-07-15_aguilar_capdread001.png`).
     - `art/references/ref_gui_aguilar.jpg` (de `dr_stache_art/email/email_2010-10-15_aguilar_GUImu003.jpg`).
     - `art/references/ref_cutout_spook_castle.png` y `art/references/ref_cutout_desert.png` (referencias de recorte de papel de Cristián Morales, 2010).
     - `art/references/ref_palette.png` (muestrario visual generado a partir de los 12 colores de `pipeline/palette.json`).

5. **Instalación de dependencias y verificación de compilación del motor**:
   - Se ejecutó `npm install` en `moonstorm-v2`.
   - Se verificó con `npx tsc --noEmit` y `npx vite build` que el motor en `src/` compila sin errores (0 errores de TypeScript; las rutas a `/assets/...` quedan sin resolver en tiempo de ejecución hasta el lote L13, tal como indica el diseño de gobernanza).
   - Se eliminó la carpeta temporal `dist/` tras la prueba para mantener limpio el primer commit.

6. **Inicialización de Git y repositorio privado nuevo (`moonstorm-smoothfaces-epic-v2`)**:
   - Se creó `.gitignore` (ignorando `node_modules/`, `dist/`, `.vite/` y los archivos pesados `recovered/builds/*.7z`).
   - Se ejecutó `git init -b main` en `moonstorm-v2`.
   - Se creó el repositorio privado nuevo en GitHub: `https://github.com/alebar000/moonstorm-smoothfaces-epic-v2` (`private: true`).
   - Se realizó el commit inicial limpio y push a `origin/main`.


