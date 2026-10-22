# SUPERPROMPT_SESION.md — Cómo arranca cada sesión

Pegar esto (ajustando el lote) al inicio de cada sesión de agente. Si se usa
`/goal`, el goal es el bloque entero; no se resume.

```
Lee en este orden y no empieces nada hasta terminar de leer:
AGENTS.md, STYLE_BIBLE.md, SLICE.md, BITACORA.md (últimas 3 entradas),
review/review.json, art/approved/MANIFEST.json.

Reporta el estado en tres listas cortas:
- aprobadas (del manifiesto)
- rechazadas desde la última sesión, con el motivo literal de Alex
- pendientes de revisión (en la hoja, sin veredicto)

Si art/references/ no tiene los archivos que STYLE_BIBLE §1 exige, detente y dímelo.
Si pipeline/palette.json sigue "provisional" y el lote no es P0, detente y dímelo.
Si review.json tiene piezas sin veredicto, detente y dímelo:
no se generan piezas nuevas con piezas viejas sin revisar.

Hoy trabajas SOLO sobre este lote (máximo 8 piezas):
<LOTE>
  - <id_pieza_1>: <descripción en una línea>
  - <id_pieza_2>: ...
</LOTE>

Para cada pieza, en este orden y sin saltarte pasos:
1. skill one-piece-generator: describe la pieza, genera UNA imagen con las
   referencias, corre pipeline/gates.py. Si falla un gate, regenera (máx 3).
2. skill style-critic y skill anatomy-critic sobre la versión que pasó gates.
   Si alguno devuelve defectos, regenera con los defectos pegados al prompt (máx 3 total).
3. Si pasa críticos: déjala en la hoja de revisión (skill review-gate, paso "proponer").
4. Si llega a 3 intentos: detente en esa pieza, anota en bitácora, sigue con la siguiente.

No integres NADA al juego ni toques layout/ ni src/ hasta que review.json
tenga el veredicto de Alex para esa pieza.

Al terminar el lote (o al quedarte sin piezas que puedas avanzar):
- skill bitacora: una entrada por pieza.
- skill review-gate: regenera la hoja de contactos y dime la URL local.
- Un resumen de hechos: cuántas generadas, cuántas pasaron gates, cuántas
  pasaron críticos, cuántas en la hoja, cuántas detenidas y por qué.
- Ninguna evaluación de calidad propia. Eso lo decido yo cuando abra la hoja.
```

## Lotes sugeridos para el slice 1 (en orden)

| lote | piezas | gate de salida |
|---|---|---|
| P0 | paletas: extraer 12 colores de personajes y 12 de escenario de las referencias (k-means sobre bocetos coloreados / cuarto 2010 desaturado 25 %), dejar `palette_characters.png` y `palette_scenery.png` en la mesa de luz | Alex aprueba o corrige hex; `palette.json` pasa a `approved` |
| L0 | hero: `smoothface.torso`, `z1s3.prop.sarcophagus`, `z1s3.wall.panel_a` | los 3 aprobados por Alex. Si no, se ajusta STYLE_BIBLE y se repite L0 |
| L1 | Smoothface: cabeza, ojos ×3, cejas ×3, boca ×3 | aprobados |
| L2 | Smoothface: 2 brazos, 2 manos ×3, 2 piernas, 2 zapatos, pantalón, mechón | aprobados; `rig.json` ensamblado y visto por Alex en el motor |
| L3 | Smoothface: emociones ×5, props de mano (lupa, llave) | aprobados |
| L4–L5 | Captain Dread: mismo despiece en dos lotes | aprobados; rig en motor |
| L6 | Z1S3 casco: paneles de pared ×3, costuras, piso ×2, techo/vigas ×2 | aprobados; `layout/z1s3.layout.json` v1 |
| L7 | Z1S3 pared: puerta, ojo de buey, póster, máscaras ×2, timón, repisa, tubería | aprobados; layout v2 |
| L8 | Z1S3 muebles: sarcófago (ya), escritorio, TV, pecera, perchero, abrigo, sombrero | aprobados; layout v3 |
| L9 | Z1S3: cama, mesa de noche, lámpara, caballete+retrato, bolso de martillos, pegamento, ropa sucia | aprobados; puzzle cableado |
| L10 | Z1S3 primer plano: mesa de cartas, barco en botella, baúl, busto de payaso, muñeco vudú, costillas ×2 | aprobados; parallax visto por Alex |
| L11 | UI: placa de botón, marco de slot, marco de retrato, iconos de acción ×3, iconos de mouse ×2, pergamino | aprobados |
| L12 | Intro: proscenio, cortina, 4 fondos de escena | aprobados |
| L13 | Animación e integración (tarea de motor, sin arte nuevo) | Alex juega el build |
| L14 | Playtest con amigos | hoja de observación llena |

## Modo continuo (vale para todas las sesiones desde L0)

1. Cada lote termina en la mesa de luz, nunca en integración. Al dejar las
   piezas en la hoja, te detienes y dices "Lote Lk en la mesa".
2. Cuando Alex escriba "ya revisé" (y nada más), haces en este orden sin
   pedir confirmación: approve.py, bitácora de veredictos, calibración de
   críticos si Alex rechazó algo que ellos dejaron pasar, commit y push, y
   arrancas el siguiente lote de la tabla.
3. Las piezas rechazadas del lote anterior se rehacen PRIMERO dentro del
   lote nuevo, con el motivo de Alex pegado al prompt, y cuentan para el
   máximo de 8.
4. Las notas específicas de cada lote las derivas tú de STYLE_BIBLE.md,
   SLICE.md, la tabla de lotes y las piezas aprobadas. No esperes que Alex
   las escriba. Si un lote exige una decisión que no está en esos archivos
   (los colores de un personaje nuevo, la posición de un objeto en el
   layout), haces UNA pregunta corta con una propuesta por defecto y sigues
   con lo demás del lote mientras esperas.
5. No saltas lotes ni los combinas. Un lote con todas sus piezas aprobadas
   es la única puerta al siguiente.
6. Te detienes y esperas a Alex, fuera de la mesa de luz, solo en cuatro
   casos: una pieza llegó a 3 versiones; crees que una regla de
   STYLE_BIBLE.md hace imposible una pieza (lo propones en el chat, con
   evidencia, y no la cambias); L13, porque toca src/; y L14, porque son
   personas.
7. Si Alex escribe cualquier otra cosa que no sea "ya revisé", eso es
   prioridad sobre la tabla: lo atiendes, lo anotas, y vuelves al lote.

