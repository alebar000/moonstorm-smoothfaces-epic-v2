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

---

### 2026-10-21 22:35 · smoothface.head · v1
- prompt: art/candidates/smoothface.head/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/004_Layer_6_copy.png, art/references/ref_hero_torso.png
- gates: fail (halo: 0.011, ink: 4.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:40 · smoothface.head · v2
- prompt: art/candidates/smoothface.head/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/004_Layer_6_copy.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:46 · smoothface.head · v3
- prompt: art/candidates/smoothface.head/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/004_Layer_6_copy.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9]; pasa halo=0.0, sticker=0.0, partial_alpha=0, components=1, border=0, palette=0.0067, gradient=0.0851 y height=131)
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: detenida (3 intentos) / proposed en mesa de luz para inspección
- Alex: pendiente

### 2026-10-21 22:35 · smoothface.eyes.normal · v1
- prompt: art/candidates/smoothface.eyes.normal/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: fail (sticker: 0.1883, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:40 · smoothface.eyes.normal · v2
- prompt: art/candidates/smoothface.eyes.normal/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:46 · smoothface.eyes.normal · v3
- prompt: art/candidates/smoothface.eyes.normal/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.39 px vs rango [6, 9]; pasa halo=0.0, sticker=0.0, partial_alpha=0, components=2, islands=1, border=0, palette=0.0271, gradient=0.0678 y height=48)
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: detenida (3 intentos) / proposed en mesa de luz para inspección
- Alex: pendiente

### 2026-10-21 22:35 · smoothface.eyes.closed · v1
- prompt: art/candidates/smoothface.eyes.closed/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: fail (halo: 0.0182, sticker: 0.443, palette: 0.0944, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:40 · smoothface.eyes.closed · v2
- prompt: art/candidates/smoothface.eyes.closed/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: fail (sticker: 0.2716, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:46 · smoothface.eyes.closed · v3
- prompt: art/candidates/smoothface.eyes.closed/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9]; pasa halo=0.0, sticker=0.0, partial_alpha=0, components=2, islands=1, border=0, palette=0.0214, gradient=0.1027 y height=48)
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: detenida (3 intentos) / proposed en mesa de luz para inspección
- Alex: pendiente

### 2026-10-21 22:35 · smoothface.eyes.squint · v1
- prompt: art/candidates/smoothface.eyes.squint/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: fail (ink: 5.6 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:40 · smoothface.eyes.squint · v2
- prompt: art/candidates/smoothface.eyes.squint/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: fail (ink: 5.6 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:46 · smoothface.eyes.squint · v3
- prompt: art/candidates/smoothface.eyes.squint/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/005_Layer_8_copy.png, art/references/ref_hero_torso.png
- gates: pass
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 22:35 · smoothface.brows.normal · v1
- prompt: art/candidates/smoothface.brows.normal/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/006_Layer_7_copy.png, art/references/ref_hero_torso.png
- gates: fail (halo: 0.0057, ink: 5.6 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:40 · smoothface.brows.normal · v2
- prompt: art/candidates/smoothface.brows.normal/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/006_Layer_7_copy.png, art/references/ref_hero_torso.png
- gates: pass
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 22:35 · smoothface.brows.angry · v1
- prompt: art/candidates/smoothface.brows.angry/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/006_Layer_7_copy.png, art/references/ref_hero_torso.png
- gates: fail (gradient: 0.6205 vs max 0.40)
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:40 · smoothface.brows.angry · v2
- prompt: art/candidates/smoothface.brows.angry/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/006_Layer_7_copy.png, art/references/ref_hero_torso.png
- gates: pass
- style-critic: rechazar: "Every pixel in the asset is semi-transparent (maximum alpha 203 out of 255, mean alpha 138, with zero fully opaque pixels), making the eyebrows appear as a washed-out translucent grey instead of the solid opaque black marker cutout (#1a1612 / #000000) in the reference."; "The brow interiors are filled with semi-transparent diagonal hatching stripes rather than the solid, uniform black marker fill of ref_cutout_layers/006_Layer_7_copy.png."
- anatomy-critic: sin_objeciones
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:47 · smoothface.brows.angry · v3
- prompt: art/candidates/smoothface.brows.angry/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/006_Layer_7_copy.png, art/references/ref_hero_torso.png
- gates: pass
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 22:35 · smoothface.brows.surprised · v1
- prompt: art/candidates/smoothface.brows.surprised/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/006_Layer_7_copy.png, art/references/ref_hero_torso.png
- gates: pass
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 22:35 · smoothface.mouth.closed · v1
- prompt: art/candidates/smoothface.mouth.closed/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/004_Layer_6_copy.png, art/references/ref_hero_torso.png
- gates: fail (sticker: 0.1588, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:40 · smoothface.mouth.closed · v2
- prompt: art/candidates/smoothface.mouth.closed/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/004_Layer_6_copy.png, art/references/ref_hero_torso.png
- gates: fail (sticker: 0.1891, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 22:46 · smoothface.mouth.closed · v3
- prompt: art/candidates/smoothface.mouth.closed/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/004_Layer_6_copy.png, art/references/ref_hero_torso.png
- gates: pass
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

## 2026-10-21 · sesión 3 · lote L1
- generadas: 22 (sobre 8 piezas del lote) · pasaron gates: 5 (`smoothface.brows.surprised` v1, `smoothface.brows.normal` v2, `smoothface.brows.angry` v3, `smoothface.eyes.squint` v3, `smoothface.mouth.closed` v3) · pasaron críticos: 8 (`sin_objeciones` en las 8 piezas; `style-critic` rechazó `smoothface.brows.angry` v2 por alfa parcial y se corrigió en v3) · en hoja: 8 · detenidas: 3
- detenidas: `smoothface.head` (3 intentos; v3 pasa todos los gates salvo `ink: 4.0 px` vs `[6, 9]` a 131 px de alto), `smoothface.eyes.normal` (3 intentos; v3 pasa todos los gates salvo `ink: 4.39 px` vs `[6, 9]` a 48 px de alto), `smoothface.eyes.closed` (3 intentos; v3 pasa todos los gates salvo `ink: 4.0 px` vs `[6, 9]` a 48 px de alto)
- cambios a layout/: ninguno
- cambios a src/: ninguno
- backlog: ninguna
- siguiente lote propuesto: L2 (incluyendo primero cualquier pieza rechazada de L1 y las variantes `smoothface.mouth.talk_a` / `smoothface.mouth.talk_b` si Alex decide mantener bocas visibles)

### 2026-10-21 23:32 · mejora de revisión · review/review_sheet.html
- Alex: "There is no way for me to tell those are good body pieces by themselves, dissasembled / I need to see them all together, interchangeable whenee rrequiered"
- acción: se integró un panel de **Marioneta ensamblada e intercambiable** directamente en `review/review_sheet.html` (`http://localhost:8765`) que monta en tiempo real a escala 1:1 el torso aprobado (`smoothface.torso`) junto con `smoothface.head`, las 3 variantes de ojos (`normal`, `squint`, `closed`), las 3 variantes de cejas (`normal`, `angry`, `surprised`), `smoothface.mouth.closed` y el cuerpo inferior/brazo de 2010 como contexto, con botones y atajos (`1/2/3` ojos, `Q/W/E` cejas) para intercambiar expresiones al vuelo, arrastrar piezas con el mouse y sincronizar automáticamente la variante activa al hacer clic en la lista izquierda. Además se generó `review/layout_shots/L1_smoothface_expressions/01_expression_grid.png` en la pestaña de mosaico.

---

### 2026-10-21 23:35 · veredicto · smoothface.brows.angry v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.brows.angry.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-21 23:35 · veredicto · smoothface.brows.normal v2 · rejected
- Alex: "exactly the same as angry, has to be different"
- acción: movido a art/rejected/smoothface.brows.normal_v2/ ; siguiente versión v3 con FIX: cejas en arco relajado/neutro horizontal claramente diferenciadas del ceño en V agudo de smoothface.brows.angry y del arco alto de smoothface.brows.surprised
- calibración: style-critic dejó pasar; recalibrado `.agents/skills/style-critic/SKILL.md` agregando el punto 8 (Variant differentiation: comparar contra las variantes hermanas aprobadas de la misma parte y reportar `blocker` si la silueta o ángulo es casi idéntico a otra variante)

### 2026-10-21 23:35 · veredicto · smoothface.brows.surprised v1 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.brows.surprised.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-21 23:35 · veredicto · smoothface.eyes.closed v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.eyes.closed.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-21 23:35 · veredicto · smoothface.eyes.normal v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.eyes.normal.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-21 23:35 · veredicto · smoothface.eyes.squint v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.eyes.squint.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-21 23:35 · veredicto · smoothface.head v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.head.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-21 23:36 · veredicto · smoothface.mouth.closed v3 · rejected
- Alex: "why a mouth? His mouth should be permanently covered"
- acción: movido a art/rejected/smoothface.mouth.closed_v3/ y descartada la categoría `smoothface.mouth.*` por instrucción de Alex ("done, no mouth plz"): la boca de Mr. Smoothface permanece siempre cubierta por el cuello alto de `smoothface.torso`
- calibración: no aplica


---

### 2026-10-21 23:48 · smoothface.brows.normal · v3
- prompt: art/candidates/smoothface.brows.normal/prompt_v3.txt
- refs: art/approved/smoothface/smoothface.brows.angry.png, art/approved/smoothface/smoothface.brows.surprised.png, art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/006_Layer_7_copy.png, art/references/ref_hero_torso.png
- gates: pass
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 23:47 · smoothface.arm_front · v1
- prompt: art/candidates/smoothface.arm_front/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/009_arm.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.8 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:51 · smoothface.arm_front · v2
- prompt: art/candidates/smoothface.arm_front/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/009_arm.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.39 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:56 · smoothface.arm_front · v3
- prompt: art/candidates/smoothface.arm_front/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/009_arm.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.39 px vs rango [6, 9]; halo: 0.0, off_palette: 0.0, components: 1, height: 90 px ok)
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 23:45 · smoothface.arm_back · v1
- prompt: art/candidates/smoothface.arm_back/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/009_arm.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:50 · smoothface.arm_back · v2
- prompt: art/candidates/smoothface.arm_back/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/009_arm.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:57 · smoothface.arm_back · v3
- prompt: art/candidates/smoothface.arm_back/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/009_arm.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9]; halo: 0.0, off_palette: 0.0, components: 1, height: 86 px ok)
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 23:45 · smoothface.pants · v1
- prompt: art/candidates/smoothface.pants/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (halo: 0.0109, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:48 · smoothface.pants · v2
- prompt: art/candidates/smoothface.pants/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:56 · smoothface.pants · v3
- prompt: art/candidates/smoothface.pants/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9]; halo: 0.0, off_palette: 0.0, components: 1, height: 69 px ok)
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 23:47 · smoothface.leg_front · v1
- prompt: art/candidates/smoothface.leg_front/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:50 · smoothface.leg_front · v2
- prompt: art/candidates/smoothface.leg_front/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:57 · smoothface.leg_front · v3
- prompt: art/candidates/smoothface.leg_front/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (ink: 4.0 px vs rango [6, 9]; halo: 0.0, off_palette: 0.0, components: 1, height: 58 px ok)
- style-critic: sin_objeciones (1 minor: bottom trouser cuff tapers slightly inward)
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 23:47 · smoothface.leg_back · v1
- prompt: art/candidates/smoothface.leg_back/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (halo: 0.0054, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:51 · smoothface.leg_back · v2
- prompt: art/candidates/smoothface.leg_back/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.0 px vs rango [6, 9]; halo: 0.0025 ok, off_palette: 0.0032 ok, components: 1, height: 58 px ok)
- style-critic: sin_objeciones
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 23:57 · smoothface.leg_back · v3
- prompt: art/candidates/smoothface.leg_back/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/003_pants.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.0 px vs rango [6, 9]; arte descartado a favor de v2 por bucle interno generado antes de HTTP 429 RESOURCE_EXHAUSTED en la API de imagen)
- style-critic: n/a
- anatomy-critic: n/a
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:45 · smoothface.shoe_front · v1
- prompt: art/candidates/smoothface.shoe_front/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/002_shoes.png, art/references/ref_hero_torso.png
- gates: fail (halo: 0.0072, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:50 · smoothface.shoe_front · v2
- prompt: art/candidates/smoothface.shoe_front/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/002_shoes.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.8 px vs rango [6, 9]; halo: 0.0, off_palette: 0.0, components: 1, height: 47 px ok)
- style-critic: sin_objeciones (1 minor: charcoal grey fill #4f4d4c instead of #000000 so outline remains distinct)
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

### 2026-10-21 23:56 · smoothface.shoe_front · v3
- prompt: art/candidates/smoothface.shoe_front/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/002_shoes.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.0 px vs rango [6, 9]; HTTP 429 RESOURCE_EXHAUSTED impidió reintento adicional; se propone v2 por mayor grosor de línea 2.8 px y mejor correspondencia con shoe_back)
- style-critic: n/a
- anatomy-critic: n/a
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:45 · smoothface.shoe_back · v1
- prompt: art/candidates/smoothface.shoe_back/prompt_v1.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/002_shoes.png, art/references/ref_hero_torso.png
- gates: fail (halo: 0.0101, ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:48 · smoothface.shoe_back · v2
- prompt: art/candidates/smoothface.shoe_back/prompt_v2.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/002_shoes.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.0 px vs rango [6, 9])
- style-critic: n/a (no pasó gates)
- anatomy-critic: n/a (no pasó gates)
- estado: candidate
- Alex: pendiente

### 2026-10-21 23:58 · smoothface.shoe_back · v3
- prompt: art/candidates/smoothface.shoe_back/prompt_v3.txt
- refs: art/references/ref_design_smoothface.png, art/references/ref_cutout_layers/002_shoes.png, art/references/ref_hero_torso.png
- gates: fail (ink: 2.0 px vs rango [6, 9]; halo: 0.0, off_palette: 0.0, components: 1, height: 47 px ok)
- style-critic: sin_objeciones (1 minor: charcoal grey fill #57504e instead of #000000)
- anatomy-critic: sin_objeciones
- estado: proposed
- Alex: pendiente

## 2026-10-22 · sesión 3 · lote L2a (con reintento L1 smoothface.brows.normal v3)
- generadas: 22 (1 pieza reintentada de L1 + 7 piezas de L2a × 3 versiones) · pasaron gates: 1 (`smoothface.brows.normal` v3 con `ink: 7.5 px`) · pasaron críticos: 8 (`sin_objeciones` en las 8 piezas tanto en `style-critic` como en `anatomy-critic`) · en hoja: 8 · detenidas en v3 por `gate_ink_thickness`: 7
- detenidas: `smoothface.arm_front` (v3: `ink: 4.39 px` vs `[6, 9]` a 90 px de alto), `smoothface.arm_back` (v3: `ink: 4.0 px` vs `[6, 9]` a 86 px de alto), `smoothface.pants` (v3: `ink: 4.0 px` vs `[6, 9]` a 69 px de alto), `smoothface.leg_front` (v3: `ink: 4.0 px` vs `[6, 9]` a 58 px de alto), `smoothface.leg_back` (v2/v3: `ink: 2.0 px` vs `[6, 9]` a 58 px de alto), `smoothface.shoe_front` (v2/v3: `ink: 2.8 px` vs `[6, 9]` a 47 px de alto), `smoothface.shoe_back` (v3: `ink: 2.0 px` vs `[6, 9]` a 47 px de alto). Todas pasan `halo`, `sticker`, `partial_alpha`, `components`, `border`, `palette`, `gradient` y `height`. Además la API `gemini-3.1-flash-image` reportó HTTP 429 `RESOURCE_EXHAUSTED` al cierre de v3.
- cambios a layout/: se añadió `review/layout_shots/l2a_full_puppet_preview/smoothface_l2a_rig_grid.png` y se conectaron las 7 piezas de L2a + `smoothface.brows.normal` v3 a la marioneta interactiva en `review/review_sheet.html` (eliminando la fila de boca).
- cambios a src/: ninguno
- backlog: ninguna
- siguiente lote propuesto: L2b (`smoothface.hand_front.open`, `smoothface.hand_front.fist`, `smoothface.hand_front.point`, `smoothface.hand_back.open`, `smoothface.hand_back.fist`, `smoothface.hand_back.point`, `smoothface.hair_tuft`)


---

### 2026-10-22 07:41 · veredicto · smoothface.arm_front v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.arm_front.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-22 07:41 · veredicto · smoothface.brows.normal v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.brows.normal.png (SHA-256 registrado en art/approved/MANIFEST.json); lote L1 queda 100 % aprobado
- calibración: no aplica

### 2026-10-22 07:41 · veredicto · smoothface.leg_back v2 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.leg_back.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-22 07:41 · veredicto · smoothface.leg_front v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.leg_front.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-22 07:41 · veredicto · smoothface.pants v3 · approved
- Alex: ""
- acción: copiado a art/approved/smoothface/smoothface.pants.png (SHA-256 registrado en art/approved/MANIFEST.json)
- calibración: no aplica

### 2026-10-22 07:42 · veredicto · smoothface.shoe_back v3 · rejected
- Alex: "Esto deberia estar viendo a la derecha 3/4, en lugar de a la izquierda 3/4. Y mejor si lo copias, no quiero dos zapatos diferentes."
- acción: movido a art/rejected/smoothface.shoe_back_v3/ ; siguiente versión v4 orientada 3/4 a la derecha y copiada idéntica entre `shoe_front` y `shoe_back`
- calibración: anatomy-critic dejó pasar zapatos orientados 3/4 a la izquierda cuando `smoothface.torso` mira 3/4 a la derecha; recalibrado `.agents/skills/anatomy-critic/SKILL.md` en puntos 5 (`View & Left/Right Facing Direction`: orientación horizontal contraria al torso aprobado es `blocker`) y 6 (`Paired Part Consistency`: zapatos par deben compartir exactamente el mismo diseño/copia)

### 2026-10-22 07:42 · veredicto · smoothface.shoe_front v2 · rejected
- Alex: "Ver lo que escribi en el otro"
- acción: movido a art/rejected/smoothface.shoe_front_v2/ ; siguiente versión v3 orientada 3/4 a la derecha y compartida con `smoothface.shoe_back`
- calibración: cubierta por la recalibración de `.agents/skills/anatomy-critic/SKILL.md` (puntos 5 y 6)

### 2026-10-22 07:42 · veredicto · smoothface.arm_back v3 · rejected
- Alex: "No entiendo este brazo. Hace falta el brazo del fondo y la mano, pero no en esta posicion."
- acción: movido a art/rejected/smoothface.arm_back_v3/ ; siguiente versión v4 con silueta clara de brazo doblado en 3/4 hacia la derecha (hombro, codo doblado, antebrazo y puño de manga coherente con `smoothface.arm_front`) y posicionado emergiendo detrás del costado derecho del abrigo junto con su mano (`hand_back`)
- calibración: anatomy-critic dejó pasar un cilindro vertical sin codo ni lectura de brazo; recalibrado `.agents/skills/anatomy-critic/SKILL.md` en punto 1 (`Identity & Recognizable Silhouette`: cilindro sin lectura anatómica de brazo doblado es `blocker`)
