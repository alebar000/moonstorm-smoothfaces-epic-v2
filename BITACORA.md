# BITACORA.md — Registro del proyecto (v2, desde cero)

Regla: si no está aquí, no pasó. El formato exacto está en
`.agents/skills/bitacora/SKILL.md`. Las entradas se agregan al final; nunca
se editan entradas anteriores (si algo cambió, nueva entrada que lo diga).

---

## 2026-10-20 — Reinicio

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

## 2026-10-21 20:33-20:57 - Instalación limpia de `moonstorm-v2` con el kit final (25 archivos)

1. **Congelamiento verificado de `..\moonstorm` (piloto v0)**:
   - Se verificó que `c:\Users\alexb\Documents\GrokBotHandoff\moonstorm` tiene el árbol limpio y el tag `v0-pilot-2026-10-20` publicado en `origin` (`https://github.com/alebar000/moonstorm-smoothfaces-epic.git`, commit `7b47ef984b7d317023676ceebed504028dc157d4`). No se volvió a escribir ahí; queda como referencia de solo lectura.

2. **Copia selectiva desde `..\moonstorm`**:
   - Se copiaron únicamente:
     - `recovered/` y `dr_stache_art/` (archivo original de 2010, excluyendo `dr_stache_art/generated_psds/` de la corrida piloto).
     - `src/`, `index.html`, `package.json`, `vite.config.ts` y `tsconfig.json`.
   - No se copió `public/assets/`, `logs/`, `.agents/` viejos, `PLAN_*` ni `SUPERPROMPT_*`.

3. **Reemplazo del borrador v1 del kit por el kit final (`C:\AntiGravityStuff\Moonstorm2\moonstorm-v2-kit.zip`, 25 archivos)**:
   - Inicialmente se había descomprimido el zip de borrador de `Downloads` (24 archivos, sin `collect_references.py`), y el agente había escrito un `collect_references.py` propio con los nombres viejos (`ref_hero_smoothface_flat.png`, `ref_palette.png`, etc.) y editado `AGENTS.md`.
   - Siguiendo la corrección de Alex, se eliminaron por completo los archivos del borrador y los archivos inventados, y se descomprimió el `moonstorm-v2-kit.zip` final de 25 archivos (ubicado en `C:\AntiGravityStuff\Moonstorm2\moonstorm-v2-kit.zip`) sin modificar `AGENTS.md` ni `STYLE_BIBLE.md`.
   - Verificación con `findstr`:
     - `findstr /C:"Decisiones tomadas por Alex" STYLE_BIBLE.md` -> OK (`Decisiones tomadas por Alex el 2026-10-21. No hay huecos pendientes; las`)
     - `findstr /C:"provisional" pipeline\palette.json` -> OK (`"status": "provisional"`)
     - `findstr /C:"ref_design_smoothface" pipeline\collect_references.py` -> OK (`"ref_design_smoothface.png": ...`)

4. **Ejecución del `pipeline/collect_references.py` oficial (`python pipeline/collect_references.py --repo .`)**:
   - Resultado: `5 listas, 0 faltan`.
   - Contenido exacto de `art/references/` (5 entradas):
     - `ref_design_smoothface.png` (`<- dr_stache_art/demo/demo_LolDemo1final_0629_smoothSplash.png`)
     - `ref_design_capdread.png` (`<- recovered/images/characters/capdread001.png`)
     - `ref_room_z1s3_2010.png` (`<- recovered/images/Z1S3-substampede_captainroom.png`)
     - `ref_gui_aguilar.jpg` (`<- recovered/images/GUImu003.jpg`)
     - `ref_cutout_layers/` (10 PNGs `<- dr_stache_art/psd_layers/smoothface-cutout003`)

5. **Dependencias, compilación y repositorio privado (`moonstorm-smoothfaces-epic-v2`)**:
   - Ejecutado `npm install`; verificado `npx tsc --noEmit` y `npx vite build` con 0 errores.
   - Publicado en el repositorio privado nuevo `https://github.com/alebar000/moonstorm-smoothfaces-epic-v2.git` (rama `main`) y sincronizado también en `C:\AntiGravityStuff\Moonstorm2`.


