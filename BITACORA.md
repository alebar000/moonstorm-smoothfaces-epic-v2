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

---

## 2026-10-21 21:15 · Cambio manual de referencia `ref_room_z1s3_2010.png`

- `pipeline/collect_references.py` había elegido `recovered/images/Z1S3-substampede_captainroom.png` (boceto en blanco y negro del 20-ago-2010, 98.9 % escala de grises y 1.1 % rectángulo guía rosado) porque su ruta era más corta que la del PSD coloreado del 26-oct-2010.
- Por instrucción de Alex, se reemplazó `art/references/ref_room_z1s3_2010.png` a mano por `dr_stache_art/psd_composites/psd_2010-10-26_aguilar_Z1S3-substampede_captainroom_WIP_composite.jpg` convertido a PNG con el mismo nombre y marcado de solo lectura.

### 2026-10-21 21:15 · palette.characters · v1
- prompt: n/a (k-means k=8 con +10 % saturación sobre las 5 piezas coloreadas de Aguilar + 4 slots fijos Smoothface canon)
- refs: dr_stache_art/psd_layers/smoothface-cutout003/*, dr_stache_art/email/email_2010-05-24_aguilar_stache004.png, dr_stache_art/email/email_2010-05-25_aguilar_stache004d.PNG, dr_stache_art/email/email_2010-07-01_aguilar_Ecstasy_of_Gold.png, dr_stache_art/email/email_2010-07-01_aguilar_Black_Hole_Sun.png, dr_stache_art/psd_composites/psd_2010-06-22_aguilar_test-cutout_composite.jpg
- gates: n/a (lote P0 de extracción de paleta)
- style-critic: n/a
- anatomy-critic: n/a
- estado: proposed
- Alex: pendiente

### 2026-10-21 21:15 · palette.scenery · v1
- prompt: n/a (k-means k=12 con -25 % saturación sobre ref_room_z1s3_2010.png excluyendo blanco de papel y tinta)
- refs: art/references/ref_room_z1s3_2010.png (de dr_stache_art/psd_composites/psd_2010-10-26_aguilar_Z1S3-substampede_captainroom_WIP_composite.jpg)
- gates: n/a (lote P0 de extracción de paleta)
- style-critic: n/a
- anatomy-critic: n/a
- estado: proposed
- Alex: pendiente

## 2026-10-21 · sesión 1 · lote P0
- generadas: 2 · pasaron gates: n/a · pasaron críticos: n/a · en hoja: 2 · detenidas: 0
- detenidas: ninguna
- cambios a layout/: ninguno
- cambios a src/: ninguno
- cambios a pipeline/palette.json: ninguno (sigue en `"status": "provisional"`)
- backlog: ninguna
- siguiente lote propuesto: L0 (una vez que Alex apruebe `palette.characters` y `palette.scenery` y se actualice `pipeline/palette.json`)

---

### 2026-10-21 21:28 · veredicto · palette.characters v1 · approved
- Alex: ""
- acción: copiado a art/approved/palette/palette.characters.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-21 21:28 · veredicto · palette.scenery v1 · rejected
- Alex: "Me hacen falta algunos colores unos 4 colores un poquito más claros y brillantes, talvez amarilloish, rojoish, y algunos azulitos. Está todo muy lúgubre. Recuerda que también tenemos circos y otros escenarios raros."
- acción: movido a art/rejected/palette.scenery_v1/ ; siguiente versión v2 con FIX: muestreo balanceado por capas de escenario de 2010 (Z1S3 capas + Spook Castle + Desert) con deduplicación en Lab (min_dist >= 24) y -25 % saturación para incluir amarillos, rojizos y azules sin repetir marrones/grises
- calibración: no aplica

### 2026-10-21 21:30 · palette.scenery · v2
- prompt: n/a (k-means k=28 con deduplicación perceptual en Lab min_dist>=24 a 12 colores y -25 % saturación sobre capas de Z1S3 + Spook Castle + Desert, total 24,500 px muestreados)
- refs: art/references/ref_room_z1s3_2010.png, dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/002_scenery_beta.png, dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/005_sarco.png, dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/006_hanger.png, dr_stache_art/psd_layers/test-spook_castle/027_towers.png, dr_stache_art/psd_composites/psd_2010-06-23_morales_test-spook_castle_composite.jpg, dr_stache_art/psd_composites/psd_2010-06-23_morales_test-desert_foreign_legion_composite.jpg
- gates: n/a (lote P0 de extracción de paleta)
- style-critic: n/a
- anatomy-critic: n/a
- estado: rejected
- Alex: "Estoy de acuerdo, pero podemos talvez mutear un pcoo los colores de fondo, para que no se vean tan vividos como los de personajes"

### 2026-10-21 21:33 · palette.scenery · v3
- prompt: n/a (mismos 12 centroides de v2 con saturación muteada S * 0.65, tope S <= 0.42 y V <= 0.84 para papel envejecido de fondo)
- refs: art/references/ref_room_z1s3_2010.png, dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/002_scenery_beta.png, dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/005_sarco.png, dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/006_hanger.png, dr_stache_art/psd_layers/test-spook_castle/027_towers.png, dr_stache_art/psd_composites/psd_2010-06-23_morales_test-spook_castle_composite.jpg, dr_stache_art/psd_composites/psd_2010-06-23_morales_test-desert_foreign_legion_composite.jpg
- gates: n/a (lote P0 de extracción de paleta)
- style-critic: n/a
- anatomy-critic: n/a
- estado: approved
- Alex: ""

### 2026-10-21 21:38 · veredicto · palette.scenery v3 · approved
- Alex: ""
- acción: copiado a art/approved/palette/palette.scenery.png (SHA-256 registrado en art/approved/MANIFEST.json) y actualizado pipeline/palette.json con las dos paletas aprobadas y `"status": "approved"`
- calibración: no aplica

## 2026-10-21 · cierre sesión 1 · lote P0
- generadas: 4 (palette.characters v1, palette.scenery v1, v2, v3) · pasaron gates: n/a · pasaron críticos: n/a · aprobadas: 2 (`palette.characters` v1, `palette.scenery` v3) · detenidas: 0
- detenidas: ninguna
- cambios a layout/: ninguno
- cambios a src/: ninguno
- cambios a pipeline/palette.json: actualizado con los 12 hex aprobados de `characters`, los 12 hex aprobados de `scenery` y `"status": "approved"`
- backlog: ninguna
- siguiente lote propuesto: L0 (`smoothface.torso`, `z1s3.prop.sarcophagus`, `z1s3.wall.panel_a`)






---

### 2026-10-21 21:54 · smoothface.torso · v1
- prompt: art/candidates/smoothface.torso/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/007_body.png
- gates: fail (ink, gradient)
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 21:58 · smoothface.torso · v2
- prompt: art/candidates/smoothface.torso/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/007_body.png
- gates: fail (ink: 4.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:11 · smoothface.torso · v3
- prompt: art/candidates/smoothface.torso/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/007_body.png
- gates: pass
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 21:54 · z1s3.prop.sarcophagus · v1
- prompt: art/candidates/z1s3.prop.sarcophagus/prompt_v1.txt
- refs: art/references/ref_room_z1s3_2010.png
- gates: fail (halo, ink, height)
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 21:58 · z1s3.prop.sarcophagus · v2
- prompt: art/candidates/z1s3.prop.sarcophagus/prompt_v2.txt
- refs: art/references/ref_room_z1s3_2010.png
- gates: fail (halo, ink: 2.0 px vs rango [4, 7], height: 344 px vs 362 px)
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:11 · z1s3.prop.sarcophagus · v3
- prompt: art/candidates/z1s3.prop.sarcophagus/prompt_v3.txt
- refs: art/references/ref_room_z1s3_2010.png
- gates: pass
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 21:54 · z1s3.wall.panel_a · v1
- prompt: art/candidates/z1s3.wall.panel_a/prompt_v1.txt
- refs: art/references/ref_room_z1s3_2010.png
- gates: fail (ink: 2.0 px vs rango [3, 5], gradient: 0.7459)
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a
- estado: candidate
- Alex: pendiente

### 2026-10-21 21:58 · z1s3.wall.panel_a · v2
- prompt: art/candidates/z1s3.wall.panel_a/prompt_v2.txt
- refs: art/references/ref_room_z1s3_2010.png
- gates: fail (ink: 6.0 px vs rango [3, 5])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:11 · z1s3.wall.panel_a · v3
- prompt: art/candidates/z1s3.wall.panel_a/prompt_v3.txt
- refs: art/references/ref_room_z1s3_2010.png
- gates: fail (ink: 6.0 px vs rango [3, 5]; ancho real medido por corridas de píxeles = 5.0 px, pero 2 * cv2.distanceTransform sobre líneas horizontales/verticales impares de ancho W devuelve W+1 = 6.0)
- style-critic: sin_objeciones
- anatomy-critic: n/a
- estado: detenida (3 intentos) / proposed en mesa de luz para inspección
- Alex: pendiente

## 2026-10-21 · sesión 2 · lote L0
- generadas: 9 (3 versiones x 3 piezas) · pasaron gates: 2 (`smoothface.torso` v3, `z1s3.prop.sarcophagus` v3) · pasaron críticos: 3 (`smoothface.torso` v3, `z1s3.prop.sarcophagus` v3, `z1s3.wall.panel_a` v3) · en hoja: 3 · detenidas: 1
- detenidas: `z1s3.wall.panel_a` (llegó a 3 versiones; pasa halo=0.0, sticker=0.0, partial_alpha=0, components=1, border=0, palette=0.0001, gradient=0.0575 y height=900, pero `gate_ink_thickness` reporta 6.0 px frente al rango [3, 5] porque `2 * cv2.distanceTransform` solo toma múltiplos pares 2.0, 4.0, 6.0 sobre líneas ortogonales y mapea líneas de 5 px reales a 6.0 px)
- cambios a layout/: ninguno
- cambios a src/: ninguno
- backlog: ninguna
- siguiente lote propuesto: L1 (una vez que Alex revise y apruebe L0 y las 3 piezas se copien a `art/references/ref_hero_*.png`)

---

### 2026-10-21 22:24 · veredicto · smoothface.torso v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.torso.png (SHA-256 registrado en art/approved/MANIFEST.json) y copiado a art/references/ref_hero_torso.png
- calibración: no aplica

### 2026-10-21 22:24 · veredicto · z1s3.prop.sarcophagus v3 · approved
- Alex: ""
- acción: copiado a art/approved/z1s3/z1s3.prop.sarcophagus.png (SHA-256 registrado en art/approved/MANIFEST.json) y copiado a art/references/ref_hero_sarcophagus.png
- calibración: no aplica

### 2026-10-21 22:24 · veredicto · z1s3.wall.panel_a v3 · approved
- Alex: ""
- acción: copiado a art/approved/z1s3/z1s3.wall.panel_a.png (SHA-256 registrado en art/approved/MANIFEST.json) y copiado a art/references/ref_hero_wall_panel.png
- calibración: no aplica
