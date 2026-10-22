---
name: review-gate
description: Mueve piezas de Smoothface's Epic entre candidatas, la hoja de revisión humana (review/) y las carpetas approved/ o rejected/, según los veredictos que Alex escribe en review/review.json. Usar cuando una pieza pasó gates y críticos y hay que "proponérsela a Alex", cuando Alex dice "ya revisé", "aprobé", "rechacé", o pide ver la hoja de revisión, y al cierre de cada sesión para regenerar la hoja. Es el único skill que escribe en art/approved/.
---

# review-gate

## Por qué existe

La aprobación humana es el único veredicto que cuenta (AGENTS.md, regla 4).
Este skill hace que esa aprobación sea un archivo (`review/review.json`),
no una frase en un chat, y que lo aprobado quede en una carpeta que nadie
vuelve a tocar.

## Dos acciones

### A. Proponer (al terminar el loop de una pieza)

1. Verificar que existen `gates_vN.json` con `overall: pass`,
   `critic_style_vN.json` y `critic_anatomy_vN.json` con `sin_objeciones`
   (anatomy puede faltar solo si `kind` es `wall`, `floor` o `ui`).
2. Actualizar `meta.json`: `"status": "proposed"`, `"proposed_version": "vN"`.
3. Comprobar que la hoja no tenga más de 8 piezas en estado `proposed`.
   Si tiene 8, no proponer más; registrar en bitácora "lote lleno" y
   detener la generación de esa sesión.
4. Al cierre: arrancar o refrescar la hoja

   ```
   python review/review_server.py --root <raíz del repo>
   ```
   y dar a Alex la URL (`http://localhost:8765`). La hoja muestra cada
   pieza junto a sus referencias y a las piezas aprobadas vecinas, con
   Aprobar / Rechazar y un campo de motivo.

### B. Aplicar veredictos (cuando Alex dice que revisó)

1. Leer `review/review.json`. Formato:

   ```json
   {"reviews": [
     {"id": "smoothface.hand_front.fist", "version": "v2",
      "verdict": "approved" | "rejected", "reason": "texto libre de Alex",
      "ts": "2026-10-21T09:12:00"}
   ]}
   ```
2. Ejecutar `python pipeline/approve.py` que, por cada veredicto nuevo:
   - `approved`: copia `vN.png` a `art/approved/<category>/<id>.png`,
     calcula SHA-256, lo agrega a `art/approved/MANIFEST.json` con
     fecha, versión, hash y la ruta del `meta.json`; marca el archivo
     de solo lectura; pone `status: approved` en `meta.json`.
   - `rejected`: mueve la carpeta de la pieza a `art/rejected/<id>_vN/`
     con el motivo en `rejection.txt`; deja en `art/candidates/<id>/`
     el `meta.json` con `status: rejected` y el motivo, para que
     `one-piece-generator` lo pegue en la siguiente versión.
3. Escribir en bitácora una línea por veredicto, con el motivo literal
   de Alex (sin parafrasear: el motivo literal es lo que calibra a los
   críticos).
4. Si Alex rechazó algo que los críticos dejaron pasar, abrir la
   calibración de ese crítico (ver su SKILL.md) antes de generar más
   piezas de esa categoría.

## Reglas

- Nunca escribir en `review/review.json`. Lo escribe la hoja, lo escribe Alex.
- Nunca mover algo a `approved/` sin un veredicto `approved` en el JSON.
- Nunca borrar de `approved/`. Un reemplazo entra como nueva versión en
  el manifiesto; la anterior se mueve a `art/approved/_superseded/`.
- Si `review.json` tiene un veredicto para una versión que ya no es la
  última (Alex aprobó v2 pero hay v3), aplicar sobre la versión que Alex
  vio y descartar v3; anotar en bitácora.
