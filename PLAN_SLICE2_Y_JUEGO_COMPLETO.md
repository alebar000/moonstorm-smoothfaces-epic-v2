# PLAN DE PRODUCCION CUTOUT: SLICE 2 (ACTO I COMPLETO) Y HOJA DE RUTA DEL JUEGO COMPLETO (SLICES 2-5)

**Fecha**: 23 de octubre de 2026
**Estado del Slice 1 (`L0` - `L13`)**: **100% COMPLETADO Y CERTIFICADO (`verdict: "sin_objeciones"`)**
- `103/103` piezas Cutout aprobadas en `art/approved/MANIFEST.json` (`2` paletas + `27` Smoothface + `22` Captain Dread + `37` Z1S3 + `9` UI L11 + `6` Intro L12).
- `python pipeline/gates.py layout layout/z1s3.layout.json`: `0` errores, `0` advertencias.
- Auditoria adversarial multi-agente en vivo (`Adversarial Room and Montaje Critic` + `Adversarial UI and Intro Critic`): `0` defectos en las 11 capturas en vivo de `review/layout_shots/live_engine_qa/`.

---

## 1. Reglas de Gobernanza para Todos los Slices (`L15` - `L50`)

Todo el desarrollo futuro mantiene intacta la disciplina del pipeline `Moonstorm2`:
1. **1 pieza por llamada (`one-piece-generator`)**: Jamas generar escenas pre-compuestas ni hojas de multiples sprites en una sola imagen. Cada elemento del cuarto o articulacion de personaje se genera en su propio PNG RGBA aislado.
2. **Maximo 8 piezas por lote (`Lk`)**: Ningun lote supera las 8 piezas para garantizar revision detallada en la mesa de luz (`review/index.html`) y gates estrictos.
3. **Gates Automaticos + Criticos IA antes de Mesa de Luz**:
   - `python pipeline/gates.py piece <png> <tipo> <id>` valida dimensiones, canal alfa limpio (`edge_halo`), cero texto accidental (`ocr_text`), desviacion de paleta (`palette_drift`) y proporciones (`height_ratio`).
   - `style-critic` y `anatomy-critic` auditan textura de papel rasgado, borde oscuro irregular, sombras internas y anatomia caricaturesca 2010 antes de proponer la pieza en `review/review.json`.
4. **Cero Em-Dashes**: Prohibido el caracter em-dash en codigo, dialogos, prompts y documentacion.
5. **QA Adversarial Multi-Agente al Cierre de Cada Slice**: Ningun Slice se da por terminado hasta que el motor en vivo pase una ronda completa con `0` defectos ante dos subagentes criticos independientes (Montaje/Cuartos y UI/Puzzles).

---

## 2. SLICE 2: Cierre del Acto I - El Submarino *Substampede* Completo (`Z1S3 <-> Z1S2 <-> Z1S1` + `Z0`)

### 2.1 Alcance Funcional del Slice 2
- **3 Cuartos Interconectados del Submarino *Substampede*** (todos a `2400 x 900 px` con 3 planos de parallax):
  1. `Z1S3` (*Captain Dread's Cabin*): Ya completado en Slice 1; ahora su puerta derecha conecta en vivo con `Z1S2`.
  2. `Z1S2` (*Submarine VIP Lounge*): Basado en el boceto original de Aguilar (`art/references/ref_z1s2_lobby_2010.png`). Incluye la escalera vertical de hierro hacia `Z1S1`, el sofa capitoneado donde duerme **A Baby**, la pared con soporte de 3 katanas y poster ukiyo-e de **Nihongo Nohondes**, la **Boveda Musical de Dulces de A Baby** con el sintetizador manchado de chocolate (*Funky Town*: `C5 - C5 - Bb4 - C5`) que guarda el `Ship's Wooden Helm` de repuesto, y el primer plano con la caja misteriosa de ojos brillantes, telefono rotatorio y casa de munecas.
  3. `Z1S1` (*Submarine Machine Room*): Basado en el boceto y PSD de 8 capas de Aguilar (`art/references/ref_z1s1_machineroom_2010.png`). Incluye la escalera vertical desde `Z1S2`, la estacion de pedales con **The Ventriloquist (Janus Vertrolikwoski & Rapoleon)**, la estacion de pedales rota donde se instala la **Perpetual Movement Machine**, y la sentina en primer plano con barriles toxicos, tostadora rota, ratas y sacos de `"POTATOES"`.
- **1 Cuarto Tributo Jugable (`Z0` - *Spooky Paper Castle* de `LolDemo1`)**: Basado en el PSD original de 28 capas `test-spook_castle.psd` (`art/references/ref_z0_spook_castle_psd_composite.png`), accesible desde el Menu Principal como modo historico 2010.
- **3 Nuevos Rigs Cutout Completos** (alturas calibradas en `pipeline/heights.json`):
  - **Nihongo Nohondes** (`300 px`): Conserje obsesionado con los samurais que odia el pescado; entrega el `Da Vinci Blueprint` y la pista de los dedos achocolatados de A Baby.
  - **A Baby** (`270 px`, ref `ref_design_ababy.png`): Gorila-bebe musculoso en panal y gorro de bebe que custodia su boveda de dulces.
  - **The Ventriloquist & Rapoleon** (`340 px`, ref `ref_design_ventriloquist.png`): Janus Vertrolikwoski con su microfono de diadema y su muneco **Rapoleon** atrapado pedaleando el submarino.
- **Cadena Completa de Puzzles del Acto I**:
  1. Recoger `hammer_bag`, `portrait_stand` y `glue` en `Z1S3`.
  2. Hablar con **Nihongo Nohondes** en `Z1S2` para obtener el `davinci_blueprint` y descubrir que A Baby usa una melodia de 4 notas con dedos llenos de chocolate.
  3. Inspeccionar y tocar el teclado musical de la boveda en `Z1S2` (`C5 - C5 - Bb4 - C5`, *Funky Town*) para abrir la boveda de A Baby y obtener el `Ship's Wooden Helm` (`z1s2.item.wooden_helm`).
  4. Combinar los 4 ingredientes + `davinci_blueprint` en el inventario para ensamblar la **Perpetual Movement Machine Completa**.
  5. Bajar por la escalera a `Z1S1`, usar la **Perpetual Movement Machine** en la estacion de pedales rota (`z1s1.prop.pedal_station_broken`), liberar al Ventrilocuo y disparar la cinematica de cierre del Acto I (el *Substampede* acelera a velocidad supersonica y se estrella contra el muelle de *Port Machete*).

### 2.2 Tabla Detallada de Lotes del Slice 2 (`L15` - `L24`, 71 piezas nuevas)

| Lote | Objetivo | Piezas (`id` exacto, max 8 por lote) | Referencia Base / Gate de Salida |
| :--- | :--- | :--- | :--- |
| **L15** | **Nihongo Nohondes Rig (Parte 1: Torso, Cabeza y Rostro)** (8 piezas) | 1. `nihongo.torso` (kimono de conserje remendado con delantal)<br>2. `nihongo.head` (cabeza caricaturesca angulosa con barba incipiente)<br>3. `nihongo.headband` (hachimaki de papel blanco con circulo rojo descentrado)<br>4. `nihongo.eyes.normal`<br>5. `nihongo.eyes.closed`<br>6. `nihongo.eyes.squint`<br>7. `nihongo.brows.normal`<br>8. `nihongo.brows.angry` | Paleta `palette_characters.png` + boceto `Z1S2` |
| **L16** | **Nihongo Nohondes Rig (Parte 2: Extremidades y Props)** (8 piezas) | 1. `nihongo.arm_front`<br>2. `nihongo.arm_back`<br>3. `nihongo.hand_front.fist`<br>4. `nihongo.hand_front.open`<br>5. `nihongo.leg_front`<br>6. `nihongo.leg_back`<br>7. `nihongo.shoe_front` (sandalia geta de madera sobre calcetin blanco)<br>8. `nihongo.prop.broom_katana` (escoba con mango de katana) | `characters/nihongo/rig.json` calibrado a `300 px` en `heights.json` |
| **L17** | **A Baby Rig Completo** (8 piezas) | 1. `ababy.torso` (torso masivo con proporciones de gorila en camiseta corta)<br>2. `ababy.head` (cabeza de bebe malhumorado con mandibula pesada)<br>3. `ababy.bonnet` (gorrito de bebe de papel con lazo)<br>4. `ababy.eyes.normal`<br>5. `ababy.eyes.angry`<br>6. `ababy.arm_front` (brazo musculoso apoyado en nudillos)<br>7. `ababy.arm_back`<br>8. `ababy.legs_diaper` (piernas cortas con panal blanco e imperdible gigante) | `art/references/ref_design_ababy.png`; `characters/ababy/rig.json` calibrado a `270 px` |
| **L18** | **The Ventriloquist & Rapoleon Rig Completo** (8 piezas) | 1. `ventrilo.torso` (chaleco a cuadros y camisa arrugada de locutor)<br>2. `ventrilo.head_jaw` (cabeza alargada con barbilla cuadrada gigante y microfono de diadema)<br>3. `ventrilo.eyes.normal`<br>4. `ventrilo.arm_front`<br>5. `ventrilo.arm_back`<br>6. `ventrilo.dummy_rapoleon` (muneco Rapoleon con bicornio napoleonico y cadena de oro)<br>7. `ventrilo.legs` (piernas largas dobladas para pedalear)<br>8. `ventrilo.shoes` (zapatos de vestir desgastados) | `art/references/ref_design_ventriloquist.png`; `characters/ventriloquist/rig.json` calibrado a `340 px` |
| **L19** | **Z1S2 Salon VIP: Casco, Escalera y Pared** (8 piezas) | 1. `z1s2.wall.panel_a` (panel curvo de casco oxidado izquierdo)<br>2. `z1s2.wall.panel_b` (panel central con remaches)<br>3. `z1s2.floor.planks` (piso de tablones y placas metalicas)<br>4. `z1s2.ceiling.arch` (arco superior del casco con remaches)<br>5. `z1s2.prop.iron_ladder` (escalera vertical de hierro a la izquierda hacia `Z1S1`)<br>6. `z1s2.wall.cage_lamp` (lampara enjaulada de mamparo)<br>7. `z1s2.wall.katana_rack` (soporte mural con 3 katanas de madera/papel)<br>8. `z1s2.wall.samurai_poster` (poster ukiyo-e de samurai enmarcado) | `art/references/ref_z1s2_lobby_2010.png`; `layout/z1s2.layout.json` v1 |
| **L20** | **Z1S2 Salon VIP: Muebles, Boveda Musical y Primer Plano** (8 piezas) | 1. `z1s2.prop.tufted_sofa` (sofa capitoneado de dos plazas en el centro)<br>2. `z1s2.prop.reed_vases` (jarrones de ceramica con juncos secos)<br>3. `z1s2.prop.candy_vault` (boveda blindada de dulces de A Baby con puerta circular)<br>4. `z1s2.prop.funky_keypad` (teclado sintetizador con manchas de chocolate en 3 teclas)<br>5. `z1s2.item.wooden_helm` (timon de madera de repuesto dentro de la boveda)<br>6. `z1s2.fg.mystery_crate` (caja de carton abierta en primer plano con dos ojos brillantes)<br>7. `z1s2.fg.rotary_phone` (telefono rotatorio negro gigante en primer plano)<br>8. `z1s2.fg.dollhouse_bindle` (casa de munecas y atado de vagabundo en primer plano) | `layout/z1s2.layout.json` v2 validado por `gates.py layout` |
| **L21** | **Z1S1 Sala de Maquinas: Casco, Escalera y Estaciones de Pedal** (8 piezas) | 1. `z1s1.wall.hull_panel` (pared circular de sala de maquinas con tuberias)<br>2. `z1s1.floor.steel_deck` (cubierta metalica remachada con rejillas)<br>3. `z1s1.ceiling.rivet_arch` (arco superior de acero con valvulas)<br>4. `z1s1.prop.iron_ladder` (escalera vertical central que sube a `Z1S2`)<br>5. `z1s1.wall.book_shelf` (repisa alta con manuales de ingenieria atados)<br>6. `z1s1.prop.pedal_station_intact` (bicicleta estatica de pedales conectada a engranajes)<br>7. `z1s1.prop.pedal_station_broken` (estacion de pedales rota con cadena suelta)<br>8. `z1s1.item.davinci_blueprint` (plano sepia estilo Da Vinci de la maquina perpetua) | `art/references/ref_z1s1_machineroom_2010.png`; `layout/z1s1.layout.json` v1 |
| **L22** | **Z1S1 Sala de Maquinas: Maquina Instalada y Sentina en Primer Plano** (7 piezas) | 1. `z1s1.prop.perpetual_machine_installed` (maquina de movimiento perpetuo armada sobre el pedal)<br>2. `z1s1.fg.toxic_barrels` (barriles abollados con liquido verde en la sentina)<br>3. `z1s1.fg.broken_toaster` (tostadora/horno oxidado en la sentina)<br>4. `z1s1.fg.potato_sacks` (sacos de arpillera rotulados `"POTATOES"`)<br>5. `z1s1.fg.bilge_rat` (rata de sentina cutout espiando entre barriles)<br>6. `z1s1.fg.hull_ring_left` (anillo estructural curvo izquierdo en primer plano)<br>7. `z1s1.fg.hull_ring_right` (anillo estructural curvo derecho en primer plano) | `layout/z1s1.layout.json` v2 validado por `gates.py layout` |
| **L23** | **Z0 Tributo LolDemo1: Spooky Paper Castle** (8 piezas) | 1. `z0.bg.sky_hills` (cielo nocturno y colinas de papel en capas)<br>2. `z0.prop.spooky_castle` (castillo embrujado chueco de `test-spook_castle.psd`)<br>3. `z0.prop.castle_door` (porton de madera con aldaba)<br>4. `z0.prop.troll` (Troll guardabosques cutout de `LolDemo1`)<br>5. `z0.prop.two_faced_sun` (sol giratorio de dos caras colgado de un hilo)<br>6. `z0.prop.paper_clouds` (nubes de carton colgadas con cordel)<br>7. `z0.prop.dead_tree` (arbol seco retorcido)<br>8. `z0.fg.hill_border` (silueta de colina y piedras en primer plano) | `art/references/ref_z0_spook_castle_psd_composite.png`; `layout/z0.layout.json` |
| **L24** | **Integracion de Motor Acto I Completo + QA Adversarial Multi-Agente** (0 piezas nuevas) | - Navegacion continua `Z1S3 <-> Z1S2 <-> Z1S1` y acceso a `Z0`<br>- Modal interactivo del sintetizador *Funky Town* (`C5-C5-Bb4-C5`) con audio WebAudio<br>- Receta de 5 partes (`hammer_bag + portrait_stand + glue + wooden_helm + davinci_blueprint`)<br>- Cinematica del choque del *Substampede* contra *Port Machete*<br>- Auditoria en vivo por 2 subagentes criticos hasta `verdict: "sin_objeciones"` | Build `PLAY_SMOOTHFACE_ACT1.html` certificado con `0` defectos |

---

## 3. Hoja de Ruta del Juego Completo: Slices 3, 4 y 5 (`L25` - `L50`)

Una vez certificado el Slice 2 (`L24`), el resto de **Blackspit Island** y el epilogo de **Dr. Stache** ya tienen toda su logica, dialogos y cadenas de puzzles codificados en `src/data/WorldData.ts` y documentados en `.agents/skills/sparkle-zone-and-puzzle-builder/SKILL.md`. Su produccion de arte Cutout se divide en 3 Slices adicionales siguiendo exactamente la misma arquitectura:

### 3.1 SLICE 3: Acto II Parte 1 - *Port Machete*, *Cirque du SoLame* y *A Baby's Shack* (`L25` - `L34`)
- **L25**: Rig Cutout de **The Bearded Lady (Barbara)** + **Chimichanga the Monkey** (8 piezas).
- **L26**: **Z2S1 (*Port Machete Docks*)** (`2400 x 900 px`, 8 piezas): Muelle de madera, proa del *Substampede* incrustada humeando, farola, gaviotas de papel, letrero hacia la lavanderia.
- **L27**: **Z2S2 (*Chimichanga's Monkey Laundry*)** (`2400 x 900 px`, 8 piezas): Lavanderia destartalada, jaula del mono, tendedero de ropa pirata, tabla de planchar, botella de *Extra-Spicy Chimichanga Sauce*.
- **L28**: Rigs Cutout de **The Air Guitars** + **Zoncho the Mime** + **The Mariachi Commando** (8 piezas combinadas por sub-rigs modulares).
- **L29**: **Z3S1 (*Cirque du SoLame Main Tent*)** (`2400 x 900 px`, 8 piezas): Carpa de circo remendada, escenario de los *Air Guitars*, amplificador desconectado, jaula invisible de Zoncho, cartel de premios.
- **L30**: **Z3S2 (*Circus Food Booth & Security*)** (`2400 x 900 px`, 8 piezas): Kiosco de nachos del *Mariachi Commando*, sombrero blindado, dispensador de queso fundido, taquilla.
- **L31**: **Z4S1 (*Outside A Baby's Shack*)** (`2400 x 900 px`, 8 piezas): Cabana en el pantano, **Tunnel Boring Machine (TBM)** averiada, letrero de prohibido el paso.
- **L32**: **Z4S2 (*A Baby's Bedroom*)** (`2400 x 900 px`, 8 piezas): Cuna gigante de hierro, movil de herramientas peligrosas, pizarra con pistas de las 3 bovedas.
- **L33**: **Z4S3 (*The Three Vaults Room*)** (`2400 x 900 px`, 8 piezas): Las 3 bovedas de seguridad (Combustible, Llave de Ignicion y Planos de Excavacion) + acertijo de apertura.
- **L34**: **Integracion de Motor Zonas 2, 3 y 4 + Mapa Interactivo de Blackspit Island (`ref_2010_island_map.png`) + QA Adversarial**.

### 3.2 SLICE 4: Acto II Parte 2 - *Evil Deeds College* y *Artificial Thundercano (Entrada y Tubos)* (`L35` - `L44`)
- **L35**: Rigs Cutout de los 3 Profesores (**Cutter McGreen**, **Mech-alomaniac** y **Bruise Li**) + **The Dean / Rector** (8 piezas).
- **L36**: **Z5S1 (*Evil Deeds College Quad*)** (`2400 x 900 px`, 8 piezas): Patio gotico de carton, estatua del fundador con bigote tachado, puertas a los 3 laboratorios y a la oficina del Rector.
- **L37**: **Z5S2 (*Botany Lab - Cutter McGreen*)** (`2400 x 900 px`, 8 piezas): Invernadero carnivoro, planta mutante devoradora, tijeras de podar gigantes, fertilizante toxico.
- **L38**: **Z5S3 (*Robotics Lab - Mech-alomaniac*)** (`2400 x 900 px`, 8 piezas): Taller de tostadoras asesinas, brazo robotico, bobina Tesla, bateria sobrecargada.
- **L39**: **Z5S4 (*Martial Arts Dojo - Bruise Li*)** (`2400 x 900 px`, 8 piezas): Dojo de carton, muneco de entrenamiento de madera, gong, tablon irrompible.
- **L40**: **Z5S5 (*The Dean's Office & Kung FOOM! Machine*)** (`2400 x 900 px`, 8 piezas): Escritorio del Rector, diploma de supervillano, y la maquina Rube Goldberg **Kung FOOM!** que combina los 3 proyectos estudiantiles.
- **L41**: Rigs Cutout de **Spooch & Hightower** (*Minion Shipping Agency*) (8 piezas).
- **L42**: **Z6S1 (*Thundercano Entrance - Minion Shipping Agency*)** (`2400 x 900 px`, 8 piezas): Recepcion volcanica burocratica, mostrador de envios de secuaces, bascula de paquetes, sello oficial.
- **L43**: **Z6S2 (*Pneumatic Tube Booth & Rap Battle*)** (`2400 x 900 px`, 8 piezas): Cabina de tubos neumaticos gigantes, consola de enrutamiento, microfono de grabacion para el duelo de rimas contra **Rapoleon**.
- **L44**: **Integracion de Motor Zonas 5 y 6 (Parte 1) + Sistema de Rimas de Rapoleon + QA Adversarial**.

### 3.3 SLICE 5: Acto III Climax (*Throne of Horrors*) + Epilogo Jugable *The Odd-yssey of Dr. Stache* (`L45` - `L50`)
- **L45**: Rigs Cutout de **Lord Goat** y **Mocus** (8 piezas).
- **L46**: **Z6S3 (*Throne of Horrors - Inner Sanctum*)** (`2400 x 900 px`, 8 piezas): Salon del trono volcanico de la **MGWDBTTGPnP**, trono de cuernos, jaula colgante, pedestal del *Ridiculous Spin*, palanca de autodestruccion para los 2 finales canonicos.
- **L47**: Rigs Cutout de **Dr. Morgan Stache** (`315 px`) con sus 3 barbas magicas intercambiables (**Barba de Leonardo da Vinci** planeador/engranes, **Barba de Barbanegra** trabuco/gancho, **Barba de Rasputin** escudo/rayo hipnotico) (8 piezas).
- **L48**: **Escenario Epilogo 2D Action-Platformer (*The Odd-yssey of Dr. Stache*)** (8 piezas): Plataformas de laboratorio steampunk de papel, engranes moviles, mechas-secuaces y boss rig del **Mecha-Smoothface**.
- **L49**: **UI Extra Canonica 2010 (`Evil Agenda` de logros + Creditos Interactivos de MoonStorm Studios)** (6 piezas).
- **L50**: **Integracion Final de las 6 Zonas + Epilogo *Dr. Stache* + QA Adversarial Multi-Agente del Juego Completo (`v2.0-full-release`)**.

---

## 4. Estado de Referencias Listas en `art/references/` para Arrancar `L15`

Las siguientes referencias originales de 2010 ya estan copiadas y verificadas en `c:\AntiGravityStuff\Moonstorm2\art\references\` para que la proxima sesion arranque directamente en el **Lote L15**:
- `art/references/ref_z1s1_machineroom_2010.png` (Boceto original de Aguilar para `Z1S1`)
- `art/references/ref_z1s2_lobby_2010.png` (Boceto original de Aguilar para `Z1S2`)
- `art/references/ref_design_ababy.png` (Boceto original de Aguilar para **A Baby**)
- `art/references/ref_design_ventriloquist.png` (Boceto original de Aguilar para **The Ventriloquist & Rapoleon**)
- `art/references/palette_characters.png` y `art/references/palette_scenery.png` (Paletas aprobadas P0)
- `pipeline/heights.json` (Alturas ya configuradas: `smoothface: 315`, `capdread: 330`, `ababy: 270`, `nihongo: 300`, `ventriloquist: 340`)
