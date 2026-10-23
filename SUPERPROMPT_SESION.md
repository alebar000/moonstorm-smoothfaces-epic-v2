# SUPERPROMPT_SESION.md - Como arranca cada sesion

Pegar esto (ajustando el lote) al inicio de cada sesion de agente. Si se usa
`/goal`, el goal es el bloque entero; no se resume.

```
Lee en este orden y no empieces nada hasta terminar de leer:
AGENTS.md, STYLE_BIBLE.md, SLICE.md, PLAN_SLICE2_Y_JUEGO_COMPLETO.md,
BITACORA.md (ultimas 3 entradas), review/review.json, art/approved/MANIFEST.json.

Reporta el estado en tres listas cortas:
- aprobadas (del manifiesto)
- rechazadas desde la ultima sesion, con el motivo literal de Alex
- pendientes de revision (en la hoja, sin veredicto)

Si art/references/ no tiene los archivos que STYLE_BIBLE §1 exige, detente y dimelo.
Si pipeline/palette.json sigue "provisional" y el lote no es P0, detente y dimelo.
Si review.json tiene piezas sin veredicto, detente y dimelo:
no se generan piezas nuevas con piezas viejas sin revisar.

Hoy trabajas SOLO sobre este lote (maximo 8 piezas):
<LOTE>
  - <id_pieza_1>: <descripcion en una linea>
  - <id_pieza_2>: ...
</LOTE>

Para cada pieza, en este orden y sin saltarte pasos:
1. skill one-piece-generator: describe la pieza, genera UNA imagen con las
   referencias, corre pipeline/gates.py. Si falla un gate, regenera (max 3).
2. skill style-critic y skill anatomy-critic sobre la version que paso gates.
   Si alguno devuelve defectos, regenera con los defectos pegados al prompt (max 3 total).
3. Si pasa criticos: dejala en la hoja de revision (skill review-gate, paso "proponer").
4. Si llega a 3 intentos: detente en esa pieza, anota en bitacora, sigue con la siguiente.

No integres NADA al juego ni toques layout/ ni src/ hasta que review.json
tenga el veredicto de Alex para esa pieza.

Al terminar el lote (o al quedarte sin piezas que puedas avanzar):
- skill bitacora: una entrada por pieza.
- skill review-gate: regenera la hoja de contactos y dime la URL local.
- Un resumen de hechos: cuantas generadas, cuantas pasaron gates, cuantas
  pasaron criticos, cuantas en la hoja, cuantas detenidas y por que.
- Ninguna evaluacion de calidad propia. Eso lo decido yo cuando abra la hoja.
```

## Lotes del Slice 1 (`P0` - `L13`) - COMPLETADOS AL 100%

| lote | piezas | estado |
|---|---|---|
| P0 | paletas: `palette_characters.png` y `palette_scenery.png` | **APROBADO** |
| L0 | hero: `smoothface.torso`, `z1s3.prop.sarcophagus`, `z1s3.wall.panel_a` | **APROBADO** |
| L1 | Smoothface: cabeza, ojos x3, cejas x3, boca x3 | **APROBADO** |
| L2 | Smoothface: 2 brazos, 2 manos x3, 2 piernas, 2 zapatos, pantalon, mechon | **APROBADO** |
| L3 | Smoothface: emociones x5, props de mano (lupa, llave) | **APROBADO** |
| L4-L5 | Captain Dread: 22 piezas en dos lotes + `characters/capdread/rig.json` | **APROBADO** |
| L6 | Z1S3 casco: paneles de pared x3, costuras, piso x2, techo/vigas x2 | **APROBADO** |
| L7 | Z1S3 pared: puerta, ojo de buey, poster, mascaras x2, timon, repisa, tuberia | **APROBADO** |
| L8 | Z1S3 muebles: sarcofago, escritorio, TV, pecera, perchero, abrigo, sombrero | **APROBADO** |
| L9 | Z1S3: cama, mesa de noche, lampara, caballete+retrato, bolso de martillos, pegamento, ropa sucia | **APROBADO** |
| L10 | Z1S3 primer plano: mesa de cartas, barco en botella, baul, busto de payaso, muneco vudu, costillas x2 | **APROBADO** |
| L11 | UI: placa de boton, marco de slot, marco de retrato, iconos de accion x3, iconos de mouse x2, pergamino | **APROBADO** |
| L12 | Intro: proscenio, cortina, 4 fondos de escena | **APROBADO** |
| L13 | Animacion, integracion y QA Adversarial Multi-Agente en vivo (`verdict: "sin_objeciones"`) | **COMPLETADO** |

---

## Lotes del Slice 2 (`L15` - `L24`): Cierre del Acto I (Submarino *Substampede* Completo + `Z0`)

**PROXIMO LOTE AL ARRANCAR SESION: `L15` (Nihongo Nohondes Rig - Parte 1)**

| lote | piezas (max 8 por lote) | gate de salida |
|---|---|---|
| **L15** | **Nihongo Nohondes (Parte 1, 8 piezas)**: `nihongo.torso`, `nihongo.head`, `nihongo.headband`, `nihongo.eyes.normal`, `nihongo.eyes.closed`, `nihongo.eyes.squint`, `nihongo.brows.normal`, `nihongo.brows.angry` | aprobados en mesa de luz |
| **L16** | **Nihongo Nohondes (Parte 2, 8 piezas)**: `nihongo.arm_front`, `nihongo.arm_back`, `nihongo.hand_front.fist`, `nihongo.hand_front.open`, `nihongo.leg_front`, `nihongo.leg_back`, `nihongo.shoe_front`, `nihongo.prop.broom_katana` | aprobados; `characters/nihongo/rig.json` (`300 px`) |
| **L17** | **A Baby Rig (8 piezas, ref `ref_design_ababy.png`)**: `ababy.torso`, `ababy.head`, `ababy.bonnet`, `ababy.eyes.normal`, `ababy.eyes.angry`, `ababy.arm_front`, `ababy.arm_back`, `ababy.legs_diaper` | aprobados; `characters/ababy/rig.json` (`270 px`) |
| **L18** | **The Ventriloquist & Rapoleon Rig (8 piezas, ref `ref_design_ventriloquist.png`)**: `ventrilo.torso`, `ventrilo.head_jaw`, `ventrilo.eyes.normal`, `ventrilo.arm_front`, `ventrilo.arm_back`, `ventrilo.dummy_rapoleon`, `ventrilo.legs`, `ventrilo.shoes` | aprobados; `characters/ventriloquist/rig.json` (`340 px`) |
| **L19** | **Z1S2 Salon VIP - Casco, Escalera y Pared (8 piezas, ref `ref_z1s2_lobby_2010.png`)**: `z1s2.wall.panel_a`, `z1s2.wall.panel_b`, `z1s2.floor.planks`, `z1s2.ceiling.arch`, `z1s2.prop.iron_ladder`, `z1s2.wall.cage_lamp`, `z1s2.wall.katana_rack`, `z1s2.wall.samurai_poster` | aprobados; `layout/z1s2.layout.json` v1 |
| **L20** | **Z1S2 Salon VIP - Muebles, Boveda Musical y Primer Plano (8 piezas)**: `z1s2.prop.tufted_sofa`, `z1s2.prop.reed_vases`, `z1s2.prop.candy_vault`, `z1s2.prop.funky_keypad`, `z1s2.item.wooden_helm`, `z1s2.fg.mystery_crate`, `z1s2.fg.rotary_phone`, `z1s2.fg.dollhouse_bindle` | aprobados; `layout/z1s2.layout.json` v2 pasa `gates.py layout` |
| **L21** | **Z1S1 Sala de Maquinas - Casco, Escalera y Pedales (8 piezas, ref `ref_z1s1_machineroom_2010.png`)**: `z1s1.wall.hull_panel`, `z1s1.floor.steel_deck`, `z1s1.ceiling.rivet_arch`, `z1s1.prop.iron_ladder`, `z1s1.wall.book_shelf`, `z1s1.prop.pedal_station_intact`, `z1s1.prop.pedal_station_broken`, `z1s1.item.davinci_blueprint` | aprobados; `layout/z1s1.layout.json` v1 |
| **L22** | **Z1S1 Sala de Maquinas - Maquina Instalada y Sentina (7 piezas)**: `z1s1.prop.perpetual_machine_installed`, `z1s1.fg.toxic_barrels`, `z1s1.fg.broken_toaster`, `z1s1.fg.potato_sacks`, `z1s1.fg.bilge_rat`, `z1s1.fg.hull_ring_left`, `z1s1.fg.hull_ring_right` | aprobados; `layout/z1s1.layout.json` v2 pasa `gates.py layout` |
| **L23** | **Z0 Tributo LolDemo1 Spooky Paper Castle (8 piezas, ref `ref_z0_spook_castle_psd_composite.png`)**: `z0.bg.sky_hills`, `z0.prop.spooky_castle`, `z0.prop.castle_door`, `z0.prop.troll`, `z0.prop.two_faced_sun`, `z0.prop.paper_clouds`, `z0.prop.dead_tree`, `z0.fg.hill_border` | aprobados; `layout/z0.layout.json` pasa `gates.py layout` |
| **L24** | **Integracion de Motor Acto I Completo + QA Adversarial Multi-Agente** (sin arte nuevo): conectar `Z1S3 <-> Z1S2 <-> Z1S1` y `Z0`, sintetizador *Funky Town* (`C5-C5-Bb4-C5`), ensamblaje de 4 piezas + plano, instalacion en `Z1S1` y cinematica de choque contra *Port Machete* | 2 subagentes criticos devuelven `verdict: "sin_objeciones"` |

*(Para los lotes `L25` a `L50` de los Slices 3, 4 y 5 que cubren las Zonas 2 a 6 y el epilogo de Dr. Stache, consultar [`PLAN_SLICE2_Y_JUEGO_COMPLETO.md`](file:///c:/AntiGravityStuff/Moonstorm2/PLAN_SLICE2_Y_JUEGO_COMPLETO.md)).*

## Modo continuo (vale para todas las sesiones)

1. Cada lote de arte termina en la mesa de luz, o bien (si Alex activo ejecucion autonoma con los criticos) tras pasar `gates.py`, `style-critic`, `anatomy-critic` y `approve.py`.
2. Las piezas rechazadas del lote anterior se rehacen PRIMERO dentro del lote nuevo, con el motivo de rechazo pegado al prompt, y cuentan para el maximo de 8.
3. Las notas especificas de cada lote las derivas tu de `STYLE_BIBLE.md`, `SLICE.md`, `PLAN_SLICE2_Y_JUEGO_COMPLETO.md` y las piezas aprobadas.
4. No saltas lotes ni los combinas. Un lote con todas sus piezas aprobadas es la unica puerta al siguiente.
