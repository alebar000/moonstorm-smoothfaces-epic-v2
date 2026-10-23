---
name: style-critic
description: Crítico adversario de estilo para Smoothface's Epic. Compara una pieza candidata contra las referencias aprobadas y devuelve una lista de defectos o "sin_objeciones", nunca un puntaje. Usar sobre toda pieza que pasó pipeline/gates.py y antes de mostrársela a Alex; usar también si Alex pregunta "por qué esto no parece de la misma familia". No usar para aprobar: este skill solo puede rechazar o abstenerse.
---

# style-critic

## Por qué no da puntajes

En la primera corrida el crítico sintético dio 9.66/10 a un build que el
director rechazó por completo. Un número crea la ilusión de medida; una
lista de defectos obliga a mirar. Este crítico tiene prohibido aprobar:
"sin_objeciones" solo significa "no encontré nada que impida mostrársela a
Alex".

## Entradas

- La pieza candidata (`art/candidates/<id>/vN.png`).
- Las referencias que el skill `style-bible` indica para esa categoría,
  incluidas las piezas aprobadas vecinas.
- `meta.json` de la pieza (qué debería ser).

## Prompt del crítico

Correr en un subagente separado, con visión, que NO haya visto el prompt de
generación (si vio el prompt, tiende a confirmar que se cumplió).

```
You are a hostile art director. You are shown REFERENCE images (approved,
hand-cut construction-paper cutouts with hand-drawn marker ink and pen
hatching) and ONE CANDIDATE image that claims to belong to the same set.
Your job is to find every reason the candidate was NOT cut by the same
person with the same scissors, the same marker, and the same paper.

Check in this order and report each as a defect if it fails:
1. Ink: outline thickness vs reference (thinner/thicker/uneven), line
   quality (digital-smooth vs hand-drawn), broken or missing outlines.
2. Palette: any color not present in the references; any gradient,
   glow, soft shading, or airbrush.
3. Paper: edge character (scissor facets vs smooth vector curve),
   texture presence, any white or light sticker halo.
4. Shadow: any cast shadow baked into the asset (must be none).
5. Scale: proportions vs the size stated in meta.json and vs neighboring
   approved pieces (e.g. a hand vs the approved torso).
6. Design fidelity: does it match what meta.json says it is? Did it add,
   remove, or reinterpret anything?
7. Isolation: exactly one object, nothing of a background, no text.
8. Variant differentiation: if the piece is a state or expression variant
   (e.g. .normal, .angry, .surprised, .closed, .squint, .fist, .open, .grab),
   compare it directly against all sibling variants of the same part. If its
   angle, silhouette, or expression is nearly identical to another variant,
   report it as a "blocker".

Output ONLY this JSON, no prose:
{
  "verdict": "rechazar" | "sin_objeciones",
  "defects": [
    {"zone": "<where, e.g. left edge / outline / fingers>",
     "what": "<one sentence, concrete, comparable to the reference>",
     "severity": "blocker" | "major" | "minor"}
  ]
}
Rules: any "blocker" or "major" forces "rechazar". Do not give scores.
Do not praise. Do not suggest how to fix; just name what is wrong.
If you find nothing, say so with an empty defects list.
```

## Salida

Guardar en `art/candidates/<id>/critic_style_vN.json`. Si `rechazar`,
devolver los defectos textuales al skill `one-piece-generator` para que
los pegue en `FIX FROM PREVIOUS VERSION`.

## Calibración (hacer una vez, al inicio del proyecto)

Antes de confiar en este crítico, correrlo sobre 6 piezas: 3 aprobadas por
Alex y 3 rechazadas por Alex (de `art/rejected/`; las primeras pueden salir
del piloto v0). Debe rechazar las 3 rechazadas. Si aprueba alguna, ajustar
el prompt (más estricto en la categoría donde falló) y repetir. Registrar
el resultado en bitácora. Repetir la calibración cada vez que Alex rechace
algo que este crítico dejó pasar: ese es el único feedback que mejora al
crítico.
