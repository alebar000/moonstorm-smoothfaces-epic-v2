# SLICE.md - Alcance del Proyecto por Slices (Slice 1 Completado -> Slice 2 Activo)

Fecha de cierre del Slice 1 (`L0` - `L13`): **23 de octubre de 2026** (`103/103` piezas aprobadas, `verdict: "sin_objeciones"` en QA adversarial en vivo).
Plan maestro completo: ver [`PLAN_SLICE2_Y_JUEGO_COMPLETO.md`](file:///c:/AntiGravityStuff/Moonstorm2/PLAN_SLICE2_Y_JUEGO_COMPLETO.md).

---

## 1. SLICE 1 (`L0` - `L13`) - ESTADO: 100% COMPLETADO Y CERTIFICADO

- **Cuarto**: `Z1S3` (*Captain Dread's Cabin*), panoramico (`2400 x 900 px`), con 3 planos de parallax (`0.85` pared/techo, `1.0` piso/personajes, `1.22` primer plano).
- **Personajes**: **Mr. Smoothface** (`27` piezas aprobadas) y **Captain Dread** (`22` piezas aprobadas).
- **Puzzle Slice 1**: Recoger `hammer_bag`, `portrait_stand` y `glue` en `Z1S3` y ensamblar el prototipo de la **Perpetual Movement Machine** en el inventario.
- **Interfaz y Teatro**: HUD Cutout completo (`L11`, `9` piezas aprobadas) y Teatro de Titeres de Intro de 4 escenas (`L12`, `6` piezas aprobadas).
- **Build entregable**: `PLAY_SMOOTHFACE_MVP.html` y `dist/` verificados con `0` errores en `gates.py layout` y `0` defectos en auditoria adversarial.

---

## 2. SLICE 2 ACTIVO (`L15` - `L24`): Cierre del Acto I - El Submarino *Substampede* Completo (`Z1S3 <-> Z1S2 <-> Z1S1` + `Z0`)

### Que incluye el Slice 2
- **Dos cuartos nuevos del submarino (`2400 x 900 px`, 3 planos de parallax)** conectados en vivo con `Z1S3`:
  - `Z1S2` (*Submarine VIP Lounge*, ref `art/references/ref_z1s2_lobby_2010.png`): Escalera de hierro hacia `Z1S1`, sofa capitoneado, soporte de 3 katanas y poster samurai, **Boveda Musical de Dulces de A Baby** con el teclado sintetizador manchado de chocolate (*Funky Town*: `C5 - C5 - Bb4 - C5`) que guarda el `Ship's Wooden Helm` (`z1s2.item.wooden_helm`), y primer plano con caja misteriosa de ojos brillantes, telefono rotatorio y casa de munecas.
  - `Z1S1` (*Submarine Machine Room*, ref `art/references/ref_z1s1_machineroom_2010.png`): Escalera central desde `Z1S2`, estacion de pedales intacta donde pedalea **The Ventriloquist**, estacion de pedales rota donde se instala la **Perpetual Movement Machine**, y primer plano de sentina con barriles toxicos, tostadora rota, rata y sacos de `"POTATOES"`.
- **Un cuarto tributo historico 2010 (`Z0` - *Spooky Paper Castle* de `LolDemo1`)** accesible desde el Menu Principal.
- **Tres nuevos rigs Cutout articulados** (calibrados con `pipeline/heights.json`):
  - **Nihongo Nohondes** (`300 px`, lotes `L15` y `L16`, 16 piezas): Entrega el `Da Vinci Blueprint` y la pista de los dedos con chocolate.
  - **A Baby** (`270 px`, lote `L17`, 8 piezas, ref `ref_design_ababy.png`): Custodia el sofa y la boveda musical en `Z1S2`.
  - **The Ventriloquist & Rapoleon** (`340 px`, lote `L18`, 8 piezas, ref `ref_design_ventriloquist.png`): Pedalea en `Z1S1` hasta que Smoothface instala la maquina perpetua.
- **Cierre completo del puzzle del Acto I**:
  - Obtener `hammer_bag`, `portrait_stand` y `glue` en `Z1S3` + `davinci_blueprint` de Nihongo en `Z1S2` + `wooden_helm` resolviendo el teclado musical *Funky Town* en `Z1S2` -> ensamblar la **Perpetual Movement Machine** de 4 piezas + plano -> instalarla en el pedal roto de `Z1S1` -> cinematica de choque del *Substampede* contra *Port Machete*.

### Criterio de "terminado" del Slice 2
1. Las 71 piezas de los lotes `L15` a `L23` estan aprobadas en `art/approved/MANIFEST.json` tras pasar `pipeline/gates.py`, `style-critic`, `anatomy-critic` y la mesa de luz.
2. `python pipeline/gates.py layout` pasa con `0` errores y `0` advertencias para `z1s3.layout.json`, `z1s2.layout.json`, `z1s1.layout.json` y `z0.layout.json`.
3. En `L24`, los dos subagentes criticos adversariales (`Adversarial Room and Montaje Critic` y `Adversarial UI and Intro Critic`) auditan las capturas en vivo de los 4 cuartos y devuelven `verdict: "sin_objeciones"` (`0` defectos).

---

## 3. SLICES 3, 4 Y 5 (`L25` - `L50`): Resto de Blackspit Island y Epilogo *Dr. Stache*
- **Slice 3 (`L25` - `L34`)**: Zona 2 (*Port Machete*: `Z2S1` Muelle, `Z2S2` *Chimichanga's Monkey Laundry*), Zona 3 (*Cirque du SoLame*: `Z3S1` Carpa, `Z3S2` Kiosco de Nachos), Zona 4 (*A Baby's Shack*: `Z4S1` Exterior + *Tunnel Boring Machine*, `Z4S2` Dormitorio, `Z4S3` Las 3 Bovedas) y Mapa Interactivo de Blackspit Island.
- **Slice 4 (`L35` - `L44`)**: Zona 5 (*Evil Deeds College*: `Z5S1` Quad, `Z5S2` *Cutter McGreen*, `Z5S3` *Mech-alomaniac*, `Z5S4` *Bruise Li*, `Z5S5` Oficina del Rector + Maquina *Kung FOOM!*) y Zona 6 Parte 1 (*Artificial Thundercano*: `Z6S1` Recepcion *MSA* con *Spooch & Hightower*, `Z6S2` Cabina de Tubos Neumaticos + duelo de rap con *Rapoleon*).
- **Slice 5 (`L45` - `L50`)**: Zona 6 Climax (`Z6S3` *Throne of Horrors* con *Lord Goat & Mocus*, el *Ridiculous Spin* y los 2 finales) + Nivel Epilogo Jugable 2D *The Odd-yssey of Dr. Stache* (**Dr. Morgan Stache** con sus 3 barbas magicas).
