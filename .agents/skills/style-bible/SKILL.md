---
name: style-bible
description: Carga el estilo visual congelado de Smoothface's Epic (STYLE_BIBLE.md + imágenes de art/references/) y lo convierte en el bloque de prompt que acompaña toda generación de arte y toda crítica. Usar siempre, antes de cualquier llamada al generador de imágenes, de cualquier crítico visual, y cuando alguien pregunte "cómo se ve" o "qué estilo" tiene algo del juego. Si otro skill de arte corre sin este, está mal.
---

# style-bible

## Qué hace

Este skill no genera nada. Prepara el contexto de estilo para que todos los
demás skills de arte hablen del mismo estilo. Existe porque en la primera
corrida cada prompt describía el estilo con palabras distintas y el resultado
fue una colección de piezas que "no parecían familia".

## Pasos

1. Leer `STYLE_BIBLE.md` completo. Si hay algún `[[ ]]` sin llenar,
   detenerse y avisar a Alex; no improvisar valores.
2. Listar `art/references/`. Verificar que existen `ref_cutout_layers/`,
   `ref_design_smoothface.png`, `ref_design_capdread.png` y
   `ref_room_z1s3_2010.png`. Si falta alguna, detenerse y avisar. Desde L1,
   verificar además `ref_hero_*.png` (los tres aprobados en L0).
3. Leer `art/approved/MANIFEST.json`. Las piezas aprobadas más parecidas a
   lo que se va a generar son referencias de **segundo nivel** (misma
   categoría: otra parte del mismo personaje, otro prop del mismo cuarto).
4. Armar el **bloque de estilo** (abajo) y devolverlo al skill que lo pidió,
   junto con la lista de archivos de imagen que deben adjuntarse.

## Bloque de estilo (se arma con §2 y §3 de STYLE_BIBLE.md; varía por `kind`)

```
STYLE (non-negotiable, matches the attached references):
Hand-drawn construction-paper cutout. Each piece is ONE flat color of
construction paper with a very subtle fiber texture, cut out with scissors.
Design and proportions come from the attached pencil sketch by the original
artist; do not reinterpret it. Outline: black marker, hand-drawn, visible
pressure variation, some strokes overshoot corners. Shading: SOFT PENCIL
only, grey, visible stroke direction, only in shadow areas. No digital
gradients, no airbrush, no glow, no 3D.
<si kind es body_part o emotion:>
EDGE: rough scissor cut, visible straight facets and corners where the
scissors turned; the cut does not perfectly follow the ink.
INK: thick marker, ~7 px at game scale.
COLOR: vivid, saturated construction paper, ONLY from this character
palette: <hex list characters + ink + pencil>.
<si kind es prop, wall, floor, foreground o ui:>
EDGE: clean, precise cut, as if with a craft knife along a ruler.
INK: <wall: thin pen ~4 px | prop/floor/ui: medium marker ~5 px |
foreground: thick marker ~7 px> at game scale.
COLOR: muted, aged construction paper, ONLY from this scenery palette:
<hex list scenery + ink + pencil>.
One isolated object, transparent background (or flat #00FF00 if
transparency is unsupported). No cast shadow baked in.
FORBIDDEN: gradients, glow, bloom, 3D render, airbrush, white sticker
border, any background, any text, more than one object, colors from the
other palette, reinterpreting the sketch.
```

## Referencias a adjuntar, según lo que se genera

| se genera | adjuntar siempre | adjuntar además |
|---|---|---|
| parte de Smoothface | `ref_design_smoothface.png` + la capa correspondiente de `ref_cutout_layers/` + `ref_hero_torso.png` | partes aprobadas de Smoothface |
| parte de otro personaje | boceto de diseño de ese personaje + `ref_hero_torso.png` | partes aprobadas de ese personaje |
| prop o capa de cuarto | `ref_hero_sarcophagus.png` o `ref_hero_wall_panel.png` + `ref_room_z1s3_2010.png` | props aprobados del mismo cuarto |
| UI | `ref_hero_wall_panel.png` + `ref_gui_aguilar.jpg` | UI aprobada |
| L0 (sin hero todavía) | el boceto de diseño (personaje) o `ref_room_z1s3_2010.png` (escenario); el acabado va solo en palabras | — |

Nunca más de 5 imágenes de referencia por llamada; si hay más candidatas,
preferir las aprobadas más recientes de la misma categoría.

## Lo que este skill no hace

No opina sobre si el estilo es bueno. No propone cambios al STYLE_BIBLE.
Si el agente cree que una regla del STYLE_BIBLE está causando fallos
repetidos, lo anota en `BACKLOG.md` como observación, con evidencia
(ids de piezas y veredictos), y sigue aplicando la regla.
