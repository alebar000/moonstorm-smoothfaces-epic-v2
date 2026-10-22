# STYLE_BIBLE.md - Estilo visual congelado de Smoothface's Epic

Este archivo lo edita solo Alex. El agente lo lee en cada sesión y lo adjunta
(junto con las imágenes de `art/references/`) a cada llamada al generador y a
cada crítico. Si una regla de aquí entra en conflicto con lo que "se ve
mejor", gana la regla: el objetivo es que todo parezca hecho por la misma
mano, no que cada pieza sea la más bonita posible.

Las partes entre `[[ ]]` las completa Alex antes de la primera sesión.
Mientras haya un `[[ ]]` sin llenar, no se genera nada.

---

## 1. Las referencias (la verdad, por encima de cualquier adjetivo)

Copiar en `art/references/` y nombrar exactamente así:

| archivo | qué es | para qué se usa |
|---|---|---|
| `ref_hero_smoothface_flat.png` | `smoothface-cutout003.psd` aplanado, de Cristián Morales | referencia maestra de estilo: tinta, papel, sombra, color |
| `ref_hero_smoothface_layers/` | las capas del mismo PSD como PNG sueltos | plantilla de silueta y de despiece del rig |
| `ref_room_z1s3_2010.png` | `Z1S3-substampede_captainroom.psd` aplanado | referencia de cómo se pinta un cuarto en este estilo |
| `ref_sketch_capdread.png` | `capdread001.png` de José David Aguilar | diseño del personaje (no el estilo de acabado) |
| `ref_sketch_[[otro]].png` | [[boceto adicional si hace falta]] | diseño |
| `ref_gui_aguilar.jpg` | `GUImu003.jpg` | diseño de interfaz |
| `ref_palette.png` | [[muestra de 12 colores recortada de las referencias]] | paleta; también en `pipeline/palette.json` |

Regla de oro para prompts: las referencias de **estilo** (fila 1–3) van en
toda llamada. Las de **diseño** (bocetos) van solo cuando se genera ese
personaje o esa interfaz. Un boceto a lápiz define *qué* es el personaje;
nunca define *cómo* se termina.

## 2. Descripción del estilo en palabras (para humanos y para el prompt)

Papel de construcción de colores planos, recortado con tijera: los bordes
no son perfectamente lisos, tienen pequeñas esquinas rectas donde la tijera
cambió de dirección. Cada pieza es una forma de papel de un solo color con
textura sutil de fibra. Sobre el papel, un contorno de marcador negro grueso,
dibujado a mano, con ligeras variaciones de presión y alguna línea que se
pasa de la esquina. Sombreado con rayado diagonal a pluma (hatching) solo en
las zonas de sombra, nunca gradientes suaves. Cada recorte proyecta una
sombra dura, desplazada, como si estuviera pegado a unos milímetros del
fondo. Nada de brillo, nada de degradados, nada de aerógrafo, nada de
"render". Si se ve como una ilustración digital pulida, está mal. Si se ve
como una obra de teatro de papel hecha por un niño muy talentoso con un
marcador Sharpie, está bien.

[[Alex: ajustá este párrafo hasta que lo leas y pienses "sí, eso es".]]

## 3. Reglas medibles (las verifica `pipeline/gates.py`)

| regla | valor | tolerancia |
|---|---|---|
| Resolución de trabajo | 1 px = 1 px de juego a escala 1.0; alto de personaje de pie = ver `pipeline/heights.json` | ±4 % |
| Grosor de línea de tinta | [[6]] px a escala 1.0 | 4–9 px |
| Paleta | los [[12]] colores de `pipeline/palette.json` | ≤ 8 % de píxeles fuera de paleta (tolerancia ΔE [[18]]) |
| Fondo | alfa 0 fuera de la pieza | 0 píxeles con alfa parcial fuera del borde de tinta |
| Halo | ningún píxel claro (luminancia > 225) con alfa > 0 en el borde exterior | ≤ 0.3 % del perímetro |
| Componentes | 1 componente conectado en el canal alfa | se permiten islas < 0.05 % del área si son intencionales (ej. gota) y están declaradas en `meta.json` |
| Sombra proyectada | NO se dibuja en el asset; la pone el motor | 0 sombras en el PNG |
| Textura de papel | sí, sutil | contraste de textura ≤ [[6]] % |
| Tamaño mínimo | ningún objeto interactivo mide menos de [[90]] px en su lado mayor | - |

## 4. Tabla de alturas (lo que rompió la primera vez)

Todos los personajes se miden de la planta de los pies a la coronilla, sin
sombrero. La línea de pies (`foot_baseline`) es la misma coordenada en todos
los sprites de un mismo personaje. Valores en `pipeline/heights.json`.

| personaje | alto de pie (px, escala 1.0) | nota |
|---|---|---|
| Mr. Smoothface | [[420]] | referencia 1.0 |
| Captain Dread | [[440]] | un poco más alto, más ancho |
| (slice 2) A Baby | [[360]] | bajo y ancho |
| (slice 2) Nihongo Nohondes | [[400]] | |
| (slice 2) The Ventriloquist | [[450]] | delgado |

Props: la altura relativa se declara en `meta.json` como fracción de la
altura de Smoothface (ej. escritorio = 0.55, sarcófago = 1.15, puerta = 1.3).

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

Smoothface en particular: el despiece sigue las capas de
`ref_hero_smoothface_layers/` (shoes, pants, body, head, eyes, brows, arm,
hand, movs). Se generan las partes que faltan para tener **dos** brazos y
**dos** manos; no se inventa una anatomía nueva.

## 6. Lo que está prohibido (lista negra para el prompt)

- Gradientes, glow, bloom, lens flare, 3D, "render", "octane", "unreal".
- Bordes blancos tipo sticker.
- Sombras proyectadas dibujadas dentro del asset.
- Fondos: ningún asset trae fondo, ni pared, ni piso, ni "ambiente".
- Texto dentro de las imágenes (salvo carteles del juego, declarados).
- Más de un objeto por imagen.
- Reinterpretar el diseño: si el boceto tiene tricornio, hay tricornio.

## 7. Historial de cambios a este archivo

| fecha | cambio | motivo |
|---|---|---|
| 2026-10-20 | creado con huecos `[[ ]]` | reinicio v2 |
