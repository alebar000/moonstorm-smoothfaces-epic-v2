---
name: room-layout
description: Crea y edita layout/<room>.layout.json, el archivo que dice dónde va cada pieza aprobada de un cuarto de Smoothface's Epic (posición, plano de profundidad, parallax, hotspot, estado). Usar siempre que haya que colocar, mover, escalar o quitar un objeto de un cuarto, definir el piso caminable, los planos de parallax o las salidas, o cuando Alex diga "el sarcófago más a la izquierda", "esto se ve chico", "que pase por detrás de". Este skill nunca genera ni edita imágenes: solo coordenadas.
---

# room-layout

## Por qué layout y no código

En la primera corrida las posiciones vivían en `WorldData.ts` mezcladas con
lógica, y cada ajuste de arte terminaba tocando el motor. Con el layout en
JSON, Alex puede mover un objeto editando un número, y el motor solo lee.

## Formato `layout/<room>.layout.json`

```json
{
  "room": "z1s3",
  "size": {"w": 2400, "h": 900},
  "camera": {"viewport_w": 1600, "follow": "player", "edge_scroll": true},
  "planes": [
    {"id": "exterior",   "parallax": 0.25},
    {"id": "wall",       "parallax": 0.82},
    {"id": "wall_props", "parallax": 0.88},
    {"id": "floor",      "parallax": 1.00, "y_sort": true},
    {"id": "foreground", "parallax": 1.22},
    {"id": "ribs",       "parallax": 1.35}
  ],
  "walkable": [[120, 640], [2280, 640], [2280, 860], [120, 860]],
  "foot_baseline_y": 820,
  "perspective_scale": {"y_far": 640, "scale_far": 0.90, "y_near": 860, "scale_near": 1.05},
  "objects": [
    {
      "id": "z1s3.prop.sarcophagus",
      "asset": "art/approved/z1s3/z1s3.prop.sarcophagus.png",
      "plane": "floor",
      "x": 260, "y": 822,
      "anchor": "bottom-center",
      "scale": 1.0,
      "sort_y": 822,
      "hotspot": {"from": "alpha", "pad": 6},
      "interact": {"inspect": "dlg.z1s3.sarcophagus.inspect", "grab": null, "talk": null},
      "state": "visible",
      "fx": null
    },
    {
      "id": "z1s3.fx.steam_pipe_a",
      "asset": "art/approved/z1s3/z1s3.wall.steam_pipe.png",
      "plane": "wall_props", "x": 1420, "y": 310, "anchor": "top-left",
      "fx": {"type": "steam_puff", "at": [48, 12], "every_ms": 2200}
    }
  ],
  "exits": [
    {"id": "to_z1s2", "object": "z1s3.wall.bulkhead_door", "target": "z1s2", "spawn": "from_z1s3"}
  ],
  "spawns": {"start": [700, 822], "from_z1s2": [360, 822]}
}
```

Reglas del formato:

- `asset` solo apunta a `art/approved/`. Un objeto cuya pieza no está
  aprobada no entra al layout; se deja en una lista `pending` al final
  del archivo con su `id` y la posición prevista.
- `hotspot: {"from": "alpha"}` significa que el área interactiva se calcula
  del canal alfa del PNG (eso evita "levantar una sección de pared" al
  hacer hover). Solo se usa un rectángulo explícito cuando Alex lo pide.
- Objetos con sombra: la pone el motor a partir de `plane` y de la luz del
  cuarto (`"light": {"x": ..., "y": ...}` opcional). Nunca en el PNG.
- Los objetos interactivos se colocan con `anchor: bottom-center` y
  `sort_y` igual a su `y` de contacto con el piso, salvo que cuelguen de
  la pared (entonces `plane: wall_props` y sin `sort_y`).

## Pasos cuando Alex pide un cambio

1. Leer el layout actual.
2. Cambiar únicamente los campos pedidos. Si Alex dice "más grande", subir
   `scale` en pasos de 0.1 y preguntar en vez de adivinar el tamaño final.
3. Validar: `python pipeline/gates.py layout layout/<room>.layout.json`
   (comprueba que cada `asset` existe en el manifiesto, que ningún objeto
   interactivo del plano `floor` queda fuera del `walkable` ampliado, que
   no hay dos hotspots con solape > 30 %, y que las etiquetas no colisionan).
4. Tomar captura del motor en las tres posiciones de cámara (izquierda,
   centro, derecha) y dejarlas en `review/layout_shots/<room>_<ts>/` para
   que Alex las vea en la hoja de revisión.
5. Entrada en bitácora.

## Lo que este skill no hace

Generar o editar PNG; cambiar `src/`; decidir el estilo. Si un objeto
"no cabe", el problema se devuelve a `one-piece-generator` con un nuevo
`target_height_px`, y pasa de nuevo por el loop.
