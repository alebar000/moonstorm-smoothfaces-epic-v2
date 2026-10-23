---
name: one-piece-generator
description: Genera UNA pieza de arte (una parte del cuerpo, un prop, una capa de escenario, un elemento de UI) para Smoothface's Epic, aislada y con referencias, y la pasa por los gates automáticos. Usar para cualquier petición de crear, generar, rehacer, corregir o "mejorar" arte del juego, aunque la petición hable de "los brazos" o "el cuarto": se descompone en piezas y se genera una por una. Nunca generar hojas, sheets, poses múltiples ni cuartos completos.
---

# one-piece-generator

## Por qué una pieza por llamada

Las hojas de piezas fallan en bloque: una mano mal dibujada obliga a
regenerar la hoja entera, y la hoja nueva ya no se parece a la anterior.
Una pieza por llamada permite rechazar una mano y conservar las otras once.

## Entradas

- `piece_id` con el formato `<categoria>.<nombre>[.<variante>]`, por ejemplo
  `smoothface.hand_front.fist`, `capdread.head`, `z1s3.prop.desk`,
  `z1s3.wall.panel_a`, `ui.action_icon.grab`.
- Una descripción en una línea de lo que es (la da Alex o `SLICE.md`).

## Pasos

### 1. Describir la pieza antes de generar (escribir esto en `meta.json`)

Para una parte de cuerpo: qué parte, de qué personaje, vista (siempre
frontal 3/4 como el hero), estado (puño, abierta, agarrando), hacia dónde
apunta, qué ropa la cubre, qué color de la paleta, qué tamaño relativo
según `pipeline/heights.json` y el `rig.json` del personaje (si existe),
dónde va el pivote.

Para un prop o capa: qué objeto, de qué material (en términos de papel y
marcador, no de materiales reales: "papel marrón con rayado para la madera"),
qué vista, qué tamaño relativo a Smoothface (fracción), si tiene partes que
se mueven por separado (entonces son piezas separadas y se declaran aquí).

Si la descripción no cabe en 6 líneas, la pieza es demasiado compleja:
dividirla en dos `piece_id`.

Formato de `art/candidates/<piece_id>/meta.json`:

```json
{
  "id": "smoothface.hand_front.fist",
  "category": "smoothface",
  "kind": "body_part" | "prop" | "wall" | "floor" | "foreground" | "ui" | "emotion",
  "what": "front (right) hand, closed fist, seen from 3/4 front, cuff of coat sleeve overlaps wrist",
  "target_height_px": 72,
  "height_fraction_of_smoothface": null,
  "pivot_hint": "wrist at top-center",
  "allowed_islands": 0,
  "references": ["art/references/ref_hero_smoothface_flat.png", "..."],
  "versions": {"v1": "prompt_v1.txt"},
  "status": "candidate"
}
```

### 2. Pedir el bloque de estilo al skill `style-bible`

Obtener el bloque de estilo y la lista de referencias a adjuntar. Guardar el
prompt completo en `art/candidates/<piece_id>/prompt_vN.txt`. El prompt
tiene exactamente esta forma:

```
<bloque de estilo del skill style-bible>

PIECE: <piece_id>
WHAT: <descripción del paso 1, en inglés>
SIZE: <alto o ancho objetivo en px a escala 1.0>, centered, with ~8% margin
PIVOT HINT: <dónde articula, para que la pieza incluya esa zona>
<si es una corrección: FIX FROM PREVIOUS VERSION: <defectos literales de
críticos o de Alex>, keep everything else identical>
```

### 3. Generar

Una sola llamada al generador de imágenes con el prompt y las referencias.
Guardar la salida como `art/candidates/<piece_id>/vN_raw.png`. Si el
generador no soporta fondo transparente, pedir fondo verde plano `#00FF00`
(no blanco: el blanco se confunde con el papel) y quitarlo en el paso 4.

### 4. Limpiar y normalizar

```
python pipeline/gates.py normalize art/candidates/<piece_id>/vN_raw.png \
    --out art/candidates/<piece_id>/vN.png --key 00FF00 \
    --meta art/candidates/<piece_id>/meta.json
```
Esto quita el fondo plano, recorta al bounding box con margen y re-escala a
la altura objetivo. No hace nada "creativo".

### 5. Gates

```
python pipeline/gates.py check art/candidates/<piece_id>/vN.png \
    --meta art/candidates/<piece_id>/meta.json \
    --out art/candidates/<piece_id>/gates_vN.json
```
Si `overall` es `fail`: leer qué gate falló, ajustar el prompt (no el
asset) y regenerar como vN+1. Máximo 3 versiones en total por pieza,
contando las que fallan en críticos. Al llegar al límite: detenerse,
registrar en bitácora, pasar a la siguiente pieza.

### 6. Entregar a críticos

Pasar la versión que pasó gates a `style-critic` y `anatomy-critic`. Si
ambos devuelven `sin_objeciones`, el skill `review-gate` la propone a Alex.

## Lo que este skill nunca hace

- Recortar un objeto de un fondo o de una hoja existente (regla 2 de AGENTS.md).
- Retocar píxeles a mano en Python para "arreglar" un ojo o un borde. Si
  está mal, se regenera. El retoque manual produjo los ojos desalineados
  y los halos de la primera corrida.
- Tocar `art/approved/`.
- Integrar al motor o al layout.
