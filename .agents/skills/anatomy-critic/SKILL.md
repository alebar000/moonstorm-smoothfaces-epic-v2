---
name: anatomy-critic
description: Crítico de anatomía, conteo de partes y alineación para rigs de personajes y para props con partes de Smoothface's Epic. Devuelve defectos o "sin_objeciones", nunca un puntaje. Usar sobre toda parte de cuerpo, todo rig ensamblado (captura del motor) y todo prop con piezas móviles, después de gates y junto con style-critic. Es el skill que evita "un solo brazo", "ojos fuera de la cara", "pies cortados" y "personajes de alturas distintas".
---

# anatomy-critic

## Dos modos

**Modo pieza** (una parte suelta): verifica que la parte es la que dice ser
y que incluye lo que necesita para articularse.

**Modo rig** (captura del personaje ensamblado en el motor, en pose de
reposo y en un fotograma de caminata): verifica alineación, conteo y
alturas. Este modo corre después de que `rig.json` existe y antes de
proponer el rig a Alex.

## Prompt, modo pieza

```
You see ONE body part or prop part for a paper-cutout character, plus the
reference sheet of that character and meta.json stating what the part is.
Report defects only.
1. Identity & Recognizable Silhouette: is it unmistakably the stated part
   (e.g. a bent coat sleeve with upper arm, elbow bend, forearm, and cuff)?
   Wrong hand/side/state or an unrecognizable featureless cylinder/pill
   that does not read as an arm/limb in context is a blocker.
2. Count: exactly one of that part. Two eyes in an "eye" piece that should
   be a single eye is a defect; a pair is fine only if meta.json says pair.
3. Articulation: does the part extend past its joint enough to overlap
   the neighboring part (shoulder under torso, wrist under sleeve)?
   Missing overlap is major.
4. Cropping: any edge of the part cut off by the image boundary is a blocker.
5. View & Left/Right Facing Direction: must match the exact 3/4 horizontal
   facing direction of the approved character torso/head (`ref_hero_torso.png`
   faces 3/4 RIGHT, so Smoothface's shoes, arms, and hands must point 3/4
   RIGHT, never 3/4 left). Facing the opposite horizontal direction (e.g. a
   shoe pointing left when the character faces right) is a blocker.
6. Paired Part Consistency: when evaluating front/back pairs (e.g.
   `shoe_front` and `shoe_back`), both must share the same design/geometry
   (or be a direct copy) rather than two different shoe designs (blocker).
Output JSON: {"verdict": "rechazar"|"sin_objeciones",
              "defects": [{"zone","what","severity"}]}
```

## Prompt, modo rig

```
You see the assembled character rendered by the game engine (rest pose and
one walk frame) and the reference character. Report defects only.
1. Count: two arms, two hands, two legs, two feet, one head, two eyes,
   two brows, one mouth. Anything else is a blocker.
2. Alignment: eyes inside the face, brows above eyes, mouth below eyes,
   hands at the end of arms, feet at the end of legs. Any part floating,
   overlapping wrongly, or hidden by another part (e.g. collar covering
   the chin) is a blocker.
3. Baseline: both feet touch the same horizontal line. Off by more than
   3% of character height is major.
4. Height: stated height in heights.json vs measured; off by more than
   4% is major. If a second character is in frame, compare their heights
   against heights.json.
5. Walk frame: the moving parts moved and the still parts did not; the
   silhouette still reads as the same character.
Output JSON: {"verdict": "rechazar"|"sin_objeciones",
              "defects": [{"zone","what","severity"}]}
```

## Chequeos automáticos que acompañan al crítico (no lo reemplazan)

`pipeline/gates.py check` ya mide: componentes conectados, recorte por el
borde, altura vs `heights.json`. El crítico ve lo que las métricas no:
si el "brazo" es un brazo.

## Salida

`art/candidates/<id>/critic_anatomy_vN.json`. Mismo circuito de
retroalimentación que `style-critic`. Misma calibración con piezas
aprobadas y rechazadas por Alex.
