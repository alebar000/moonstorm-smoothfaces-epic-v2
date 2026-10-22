# STYLE_BIBLE.md — Estilo visual congelado de Smoothface's Epic

Este archivo lo edita solo Alex. El agente lo lee en cada sesión y lo adjunta
(junto con las imágenes de `art/references/`) a cada llamada al generador y a
cada crítico. Si una regla de aquí entra en conflicto con lo que "se ve
mejor", gana la regla: el objetivo es que todo parezca hecho por la misma
mano, no que cada pieza sea la más bonita posible.

Decisiones tomadas por Alex el 2026-10-21. No hay huecos pendientes; las
paletas se aprueban en la sesión 1 (ver §3).

---

## 1. Las dos fuentes, y qué aporta cada una

- **Diseño: los bocetos a lápiz de José David Aguilar (xygvot).** Qué es cada
  personaje, qué ropa lleva, qué proporciones, qué cara. Un boceto define el
  *qué*; si el boceto tiene tricornio, hay tricornio.
- **Construcción: la idea del cutout de Cristián Morales
  (`smoothface-cutout003.psd`).** Cada parte del cuerpo es una pieza de papel
  independiente, recortada con tijera y articulada. Esa idea es la correcta.
  El acabado exacto de ese PSD no es la referencia de acabado; la referencia
  de acabado es la descripción de §2 y el hero asset que Alex apruebe en L0.

Referencias en `art/references/`, con estos nombres exactos:

| archivo | qué es | se adjunta cuando |
|---|---|---|
| `ref_design_smoothface.png` | boceto de Smoothface de Aguilar (o `smoothSplash.png` de LolDemo1) | se genera Smoothface |
| `ref_design_capdread.png` | `capdread001.png` | se genera Captain Dread |
| `ref_cutout_layers/` | capas de `smoothface-cutout003.psd` como PNG sueltos | se genera cualquier parte de cuerpo (plantilla de despiece y de silueta) |
| `ref_room_z1s3_2010.png` | `Z1S3-substampede_captainroom.psd` aplanado | se genera escenario de Z1S3 (composición, no acabado) |
| `ref_gui_aguilar.jpg` | `GUImu003.jpg` | se genera UI |
| `ref_hero_*.png` | **se crea en L0**: el torso, el sarcófago y el panel aprobados por Alex, copiados aquí | siempre, desde L1 |

Hasta que L0 no esté aprobado, el acabado se describe solo con palabras (§2).
Desde L1, el hero aprobado manda sobre las palabras.

## 2. El acabado, en palabras

Cada pieza es un recorte de papel de construcción de un solo color, con una
textura de fibra tan sutil que solo se nota de cerca. Sobre el papel, el
dibujo está hecho a mano con marcador y lápiz, en el estilo de los bocetos
de Aguilar: el contorno es de marcador negro, trazo a mano con variaciones
de presión y algún extremo que se pasa; el sombreado es **lápiz suave**,
gris, con la dirección del trazo visible, aplicado solo en las zonas de
sombra, nunca gradientes digitales ni aerógrafo.

Los bordes del papel se comportan distinto según qué es la pieza:

- **Personajes y sus partes (y las emociones): corte tosco.** Facetas de
  tijera visibles, esquinas donde la tijera cambió de dirección, algún
  borde que no sigue exactamente la tinta. Se nota que lo cortó una mano.
- **Escenario, props y UI: corte limpio.** Preciso, apenas irregular, como
  cortado con cúter sobre una regla. El cuarto es el teatro; los personajes
  son las marionetas.

El grosor de la tinta varía con la profundidad: **grueso en lo que está
adelante, fino en lo que está al fondo** (valores en §3). Esto le da
perspectiva al teatro de papel sin usar desenfoque.

El color del papel también varía: **vivo y saturado en personajes, apagado
y envejecido en escenario.** Dos paletas separadas; un personaje nunca usa
colores de la paleta de escenario ni al revés, salvo la tinta y el lápiz,
que son comunes.

La sombra proyectada es **suave y corta**: la pieza apenas despega del
fondo. La pone el motor; nunca está pintada en el PNG.

Si se ve como una ilustración digital pulida, está mal. Si se ve como una
obra de teatro de papel hecha con tijera, marcador y lápiz por alguien que
dibuja muy bien, está bien.

## 3. Reglas medibles (las verifica `pipeline/gates.py` con `pipeline/rules.json`)

| regla | valor | tolerancia |
|---|---|---|
| Lienzo de juego | 1600 × 900 vista; cuartos de 2400 px de ancho | — |
| Alto de Smoothface de pie | 315 px (35 % de 900) | ±4 % (`pipeline/heights.json`) |
| Tinta, personajes y primer plano | 6–9 px a escala 1.0 | gate `ink` por `kind` |
| Tinta, muebles y props de piso | 4–7 px | |
| Tinta, pared y fondo | 3–5 px | |
| Paletas | 12 colores personajes + 12 escenario, en `pipeline/palette.json` | ≤ 8 % de píxeles fuera de paleta (ΔE ≤ 18) |
| Paleta provisional | mientras `palette.json` diga `"status": "provisional"`, el gate reporta pero no rechaza | — |
| Sombreado | lápiz: gradientes suaves permitidos hasta 40 % del área opaca; más es aerógrafo | gate `gradient` |
| Fondo | alfa 0 fuera de la pieza | 0 píxeles con alfa parcial lejos del borde |
| Halo / borde sticker | ningún píxel claro (lum > 225) en el anillo exterior ni en la banda de borde | ≤ 0.3 % anillo, ≤ 15 % banda |
| Componentes | 1 componente conectado en alfa | islas solo si `allowed_islands` > 0 en `meta.json` |
| Sombra proyectada | no en el PNG; en layout: `"shadow": {"offset": [3, 4], "blur": 6, "opacity": 0.35}` | — |
| Textura de papel | sutil | contraste ≤ 6 % |
| Tamaño mínimo de objeto interactivo | 70 px en su lado mayor | — |

Cómo se aprueban las paletas (sesión 1, antes de L0): el agente extrae 12
colores dominantes de los bocetos coloreados de Aguilar y del hero
provisional para personajes, y 12 de `ref_room_z1s3_2010.png` desaturada
un 25 % para escenario; genera dos muestras `palette_characters.png` y
`palette_scenery.png` y las deja en la mesa de luz. Alex aprueba o corrige
los hex a mano. Al aprobar, `palette.json` pasa a `"status": "approved"` y
el gate empieza a rechazar.

## 4. Tabla de alturas

De la planta de los pies a la coronilla, sin sombrero. Misma `foot_baseline`
en todos los sprites de un personaje. Valores en `pipeline/heights.json`.

| personaje | alto (px) | nota |
|---|---|---|
| Mr. Smoothface | 315 | referencia 1.0 |
| Captain Dread | 330 | más alto y más ancho |
| (slice 2) A Baby | 270 | bajo y ancho |
| (slice 2) Nihongo Nohondes | 300 | |
| (slice 2) The Ventriloquist | 340 | delgado |

Props: altura relativa en `meta.json` como fracción de Smoothface
(escritorio 0.55, sarcófago 1.15, puerta de mamparo 1.3, cama 0.7,
mesa de cartas de primer plano 0.5).

## 5. Despiece estándar de un personaje (el rig)

Cada parte es un PNG aislado, generado por separado, con el pivote declarado
en `rig.json`. Orden de dibujado de atrás hacia adelante:

```
01 brazo_trasero      07 cabeza
02 mano_trasera       08 boca (variantes: cerrada, hablando_a, hablando_b)
03 pierna_trasera     09 ojos (variantes: normal, cerrados, entrecerrados)
04 pierna_delantera   10 cejas (variantes: normal, enojado, sorprendido)
05 zapato_trasero     11 pelo / sombrero / mechón
06 zapato_delantero   12 brazo_delantero
   torso (entre 06 y 07) 13 mano_delantera (variantes: puño, abierta, agarrando)
```

Emociones (nube de garabatos, rayos, signo de pregunta, bombilla, gota de
sudor) son recortes aparte, nunca pintados dentro de una parte del cuerpo.

Smoothface: el despiece sigue las capas de `ref_cutout_layers/` (shoes,
pants, body, head, eyes, brows, arm, hand, movs) y se completa hasta tener
**dos** brazos y **dos** manos. La cara, las proporciones y la ropa salen
del boceto de Aguilar; no se inventa una anatomía nueva.

## 6. Lista negra (va literal en todo prompt)

- Gradientes digitales, glow, bloom, lens flare, 3D, "render", "octane", "unreal", aerógrafo.
- Bordes blancos tipo sticker.
- Sombras proyectadas dentro del asset.
- Fondos: ningún asset trae pared, piso ni "ambiente".
- Texto dentro de las imágenes (salvo carteles del juego, declarados en `meta.json`).
- Más de un objeto por imagen.
- Reinterpretar el diseño del boceto.
- Colores de la paleta equivocada (personaje con tonos de escenario o al revés).

## 7. Historial

| fecha | cambio | motivo |
|---|---|---|
| 2026-10-20 | creado con huecos | reinicio v2 |
| 2026-10-21 | huecos llenados con las decisiones de Alex: diseño Aguilar + construcción cutout; borde tosco/limpio; tinta por profundidad; lápiz; dos paletas; 35 %; sombra suave; textura sutil | ronda de decisiones |
