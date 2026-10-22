# AGENTS.md - Reglas del agente para Smoothface's Epic v2

Este archivo se lee completo al inicio de cada sesión. Si alguna instrucción
de una tarea contradice algo de aquí, gana este archivo y se pregunta a Alex.

## Por qué existe

En la primera corrida (oct 2026) el juego se rompió por tres causas, todas de
gobernanza y ninguna de código: nadie congeló el estilo visual, el agente tenía
permiso de regenerar cualquier asset cuando se le pedía corregir uno, y los
críticos sintéticos aprobaban con 9.6/10 cosas que el director rechazaba de
plano. Estas reglas existen para que eso no vuelva a pasar.

## Las reglas

1. **Una pieza por llamada al generador de imágenes.** Nunca hojas, nunca
   "sheets" de poses, nunca "el cuarto completo". Cada llamada produce un
   objeto, una parte del cuerpo o una capa, aislado sobre fondo transparente
   (o fondo plano que se eliminará), con las referencias adjuntas.
2. **Nunca recortar un objeto de una imagen compuesta.** Los objetos nacen
   aislados. Si solo existe dentro de un fondo pintado, se regenera aislado;
   no se recorta.
3. **Nunca tocar `art/approved/`.** Lo que está ahí está aprobado por Alex y es
   de solo lectura. Si una corrección exige cambiar un asset aprobado, detenerse,
   explicar por qué, y esperar respuesta. Una pieza aprobada se reemplaza
   solo con una nueva versión que pase el loop completo y que Alex apruebe
   explícitamente como reemplazo.
4. **Los críticos no dan puntajes.** `style-critic` y `anatomy-critic`
   devuelven defectos o "sin objeciones". Ningún número, ninguna escala.
   La única aprobación válida es la que Alex escribe en `review/review.json`
   a través de la hoja de revisión. "Sin objeciones" de un crítico no es
   aprobación; es permiso para mostrarle la pieza a Alex.
5. **Tres rondas fallidas sobre la misma pieza → detenerse.** Resumir en la
   bitácora qué se intentó, qué dijo cada crítico y qué dijo Alex, y preguntar.
   No intentar una cuarta vez "con otro enfoque" sin autorización.
6. **El motor no se toca para resolver problemas de arte.** Si un asset no
   encaja, el problema es el asset o `layout/*.json`, no el código. Cambios al
   motor (`src/`) solo cuando la tarea del día es explícitamente de motor.
7. **El alcance está en `SLICE.md` y no se amplía a mitad de loop.** Toda idea
   nueva, de Alex o del agente, va a `BACKLOG.md` con fecha. Se decide al cierre
   del slice.
8. **Todo queda en `BITACORA.md`** con el formato del skill `bitacora`: pieza,
   prompt exacto, referencias usadas, resultado de gates, veredicto de
   críticos, decisión de Alex. Sin bitácora no hubo trabajo.
9. **Lotes de máximo 8 piezas** llegan a la hoja de revisión por sesión. Alex
   revisa dos veces al día, diez minutos. No acumular 40 cosas.
10. **Nada de jerga técnica dentro del juego.** Los textos del juego son del
    universo del juego. "9-slice", "60 FPS", "Z1S3", "rig", "LMB/RMB" no
    existen para el jugador.
11. **Reportar con hechos, no con adjetivos.** "Generé 6 piezas, 4 pasaron
    gates, 2 están en la hoja de revisión" sí. "Quedó espectacular" no.
    El agente no sabe si quedó bien; eso lo sabe Alex.
12. **`..\moonstorm` es estrictamente de solo lectura.** El repositorio vecino
    (`..\moonstorm`, congelado en el tag `v0-pilot-2026-10-20`) jamás se modifica
    ni se escribe en él; solo puede leerse si hace falta consultar algo del
    piloto (por ejemplo, una pieza rechazada del piloto para calibrar `style-critic`
    o `anatomy-critic`).
13. **Cero em-dashes.** Nunca usar el carácter em-dash en código, documentación,
    mensajes de commit ni respuestas. Usar guiones simples (`-`), dos puntos (`:`),
    punto y coma (`;`) o paréntesis.

## Estructura de carpetas que el agente respeta

```
STYLE_BIBLE.md          estilo congelado; solo Alex lo edita
SLICE.md                alcance congelado del slice actual
BACKLOG.md              ideas y cambios diferidos
BITACORA.md             registro obligatorio
SUPERPROMPT_SESION.md   cómo arranca cada sesión
art/references/         imágenes hero elegidas por Alex (solo lectura)
art/candidates/<id>/    v1.png, v2.png, meta.json, gates_vN.json, critic_vN.json
art/approved/<cat>/     piezas aprobadas + MANIFEST.json (solo lectura)
art/rejected/<id>/      versiones rechazadas con motivo
review/review.json      veredictos de Alex (lo escribe la hoja de revisión)
layout/<room>.layout.json   posición, plano y parallax de cada objeto
pipeline/               gates.py, approve.py, collect_references.py, heights.json, palette.json
.agents/skills/         un skill por trabajo
src/                    motor TS + Canvas existente (no se toca hasta L13)
..\moonstorm/           piloto v0 congelado (SOLO LECTURA)
```

## Orden de producción (no se altera)

1. Hero assets: un torso de Smoothface, un sarcófago, un panel de pared.
   Nada más se genera hasta que los tres estén en `art/approved/`.
2. Smoothface completo, parte por parte, con las máscaras del PSD de 2010
   como plantilla de silueta.
3. Captain Dread, mismo protocolo, misma tabla de alturas.
4. Cuarto Z1S3 por capas, aprobando cada capa antes de la siguiente:
   casco vacío → piso → props de pared → muebles → primer plano.
5. UI e intro con el mismo micro-loop; las marionetas de la intro son los
   rigs ya aprobados, sin arte nuevo.
6. Integración, animación, FX, audio. QA funcional con Playwright aquí sí.
