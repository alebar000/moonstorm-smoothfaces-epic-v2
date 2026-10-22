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
2. Listar `art/references/`. Verificar que existen al menos
   `ref_hero_smoothface_flat.png`, `ref_room_z1s3_2010.png` y `ref_palette.png`.
   Si falta alguna, detenerse y avisar.
3. Leer `art/approved/MANIFEST.json`. Las piezas aprobadas más parecidas a
   lo que se va a generar son referencias de **segundo nivel** (misma
   categoría: otra parte del mismo personaje, otro prop del mismo cuarto).
4. Armar el **bloque de estilo** (abajo) y devolverlo al skill que lo pidió,
   junto con la lista de archivos de imagen que deben adjuntarse.

## Bloque de estilo (plantilla; rellenar con el texto real del STYLE_BIBLE)

```
STYLE (non-negotiable, matches the attached reference images exactly):
<párrafo de la sección 2 de STYLE_BIBLE.md, traducido al inglés sin
cambiar ninguna palabra que describa el acabado>
Ink outline ~<N>px, hand-drawn marker, slight pressure variation.
Shading: diagonal pen hatching only in shadow areas. Flat construction-paper
colors from this palette only: <hex list>. Subtle paper fiber texture.
Scissor-cut edges with small straight facets. One isolated object.
Transparent background. No cast shadow baked in.
FORBIDDEN: gradients, glow, bloom, 3D render, airbrush, white sticker
border, any background, any text, more than one object, reinterpreting
the design shown in the sketch reference.
```

## Referencias a adjuntar, según lo que se genera

| se genera | adjuntar siempre | adjuntar además |
|---|---|---|
| parte de Smoothface | hero flat + la capa correspondiente de `ref_hero_smoothface_layers/` | partes aprobadas de Smoothface |
| parte de otro personaje | hero flat + boceto de diseño de ese personaje | partes aprobadas de ese personaje |
| prop o capa de cuarto | hero flat + `ref_room_z1s3_2010.png` | props aprobados del mismo cuarto |
| UI | hero flat + `ref_gui_aguilar.jpg` | UI aprobada |

Nunca más de 5 imágenes de referencia por llamada; si hay más candidatas,
preferir las aprobadas más recientes de la misma categoría.

## Lo que este skill no hace

No opina sobre si el estilo es bueno. No propone cambios al STYLE_BIBLE.
Si el agente cree que una regla del STYLE_BIBLE está causando fallos
repetidos, lo anota en `BACKLOG.md` como observación, con evidencia
(ids de piezas y veredictos), y sigue aplicando la regla.
