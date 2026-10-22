---
name: bitacora
description: Escribe las entradas de BITACORA.md de Smoothface's Epic en el formato obligatorio (una entrada por pieza, por veredicto de Alex, por cambio de layout o de alcance, y un cierre por sesión). Usar al terminar cada pieza, al aplicar veredictos, al cerrar cualquier sesión y siempre que alguien pregunte "qué pasó con", "por qué se rechazó", "cuántas van". Si una sesión termina sin entradas de bitácora, no terminó.
---

# bitacora

## Por qué el formato es rígido

La bitácora es el único registro que sobrevive al cierre de un chat. En la
primera corrida el transcript perdió historia y nadie pudo reconstruir qué
prompt produjo qué pieza. Aquí el prompt se cita por archivo, el veredicto
se cita literal, y nada se resume con adjetivos.

## Formato de entrada por pieza

```
### <YYYY-MM-DD HH:MM> · <piece_id> · <vN>
- prompt: art/candidates/<id>/prompt_vN.txt
- refs: <lista de archivos adjuntados>
- gates: <pass|fail> (<nombre del gate que falló, si alguno>)
- style-critic: <sin_objeciones | rechazar: "<defecto 1>"; "<defecto 2>">
- anatomy-critic: <sin_objeciones | rechazar: "..." | n/a>
- estado: <candidate | proposed | approved | rejected | detenida (3 intentos)>
- Alex: <"motivo literal" | pendiente>
```

## Formato de cierre de sesión

```
## <YYYY-MM-DD> · sesión <n> · lote <Lk>
- generadas: <n> · pasaron gates: <n> · pasaron críticos: <n> · en hoja: <n> · detenidas: <n>
- detenidas: <id> (<por qué, una línea>)
- cambios a layout/: <archivo y campos, o "ninguno">
- cambios a src/: <"ninguno" salvo tarea de motor>
- backlog: <ideas anotadas, o "ninguna">
- siguiente lote propuesto: <Lk+1 o "repetir Lk: <piezas>">
```

## Formato de veredicto humano

```
### <YYYY-MM-DD HH:MM> · veredicto · <piece_id> <vN> · <approved|rejected>
- Alex: "<motivo literal, sin editar>"
- acción: <copiado a approved/... | movido a rejected/... ; siguiente versión con FIX: ...>
- calibración: <"no aplica" | "style-critic dejó pasar; recalibrar antes de L<k>">
```

## Reglas

- Entradas solo al final del archivo. Nunca editar entradas anteriores.
- Sin adjetivos de calidad ("quedó lindo", "mucho mejor"). Hechos y citas.
- Un hecho que no está en bitácora se considera no ocurrido en la
  siguiente sesión; el agente no "recuerda" nada que no esté aquí o en
  los JSON del pipeline.
