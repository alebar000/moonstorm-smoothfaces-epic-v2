/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Interactive Cutout Room & Hotspot Layout Studio ("Design Engine Mode")
 *
 * Allows dragging, resizing, Z-ordering, switching between background/foreground planes,
 * toggling interactivity (linking/creating/editing Hotspots & Walk Targets), positioning
 * character spawns, and saving official coordinates directly to disk & WorldData.ts.
 */

import {
  HotspotDef,
  ROOM_HOTSPOTS,
  ROOM_OBJECTS,
  SceneObjectDef,
  Z1S3_CHARACTER_SPAWNS,
  serializeZ1S3OfficialLayout,
  applyZ1S3OfficialLayout,
} from '../scenarios/WorldData';

export type StudioLayerFilter =
  | 'all'
  | 'structural'
  | 'wall_props'
  | 'floor_props'
  | 'foreground'
  | 'characters'
  | 'hotspots';

export type StudioSelection =
  | { kind: 'object'; id: string }
  | { kind: 'hotspot'; id: string }
  | { kind: 'character'; id: 'smoothface' | 'cap_dread' }
  | null;

type DragHandle =
  | 'move'
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'rotate'
  | 'walk_target';

export interface StudioHostGame {
  canvas: HTMLCanvasElement;
  cameraX: number;
  mouseX: number;
  mouseY: number;
  player: { x: number; y: number; facing: 1 | -1; isWalking: boolean };
  npcs: Record<string, { x: number; y: number; facing: 1 | -1 }>;
  getRoomWidth(): number;
  computeParallaxOffset(
    parallaxFactor?: number,
    parallaxAnchorX?: number,
    parX?: number,
    parY?: number
  ): { dx: number; dy: number };
  getImgForStudio(key: string): HTMLImageElement | null;
}

const APPROVED_Z1S3_CATALOG: string[] = [
  'z1s3.wall.panel_a',
  'z1s3.wall.panel_b',
  'z1s3.wall.panel_c',
  'z1s3.wall.seam_strip',
  'z1s3.floor.planks_a',
  'z1s3.floor.planks_b',
  'z1s3.ceiling.beam_a',
  'z1s3.ceiling.beam_b',
  'z1s3.wall.door',
  'z1s3.wall.porthole',
  'z1s3.wall.poster',
  'z1s3.wall.mask_a',
  'z1s3.wall.mask_b',
  'z1s3.wall.helm_wheel',
  'z1s3.wall.shelf',
  'z1s3.wall.pipes',
  'z1s3.prop.sarcophagus',
  'z1s3.prop.desk',
  'z1s3.prop.tv',
  'z1s3.prop.fishbowl',
  'z1s3.prop.coat_rack',
  'z1s3.prop.coat',
  'z1s3.prop.hat',
  'z1s3.prop.nightstand',
  'z1s3.prop.glue',
  'z1s3.prop.easel_portrait',
  'z1s3.prop.hammer_bag',
  'z1s3.prop.dirty_laundry',
  'z1s3.prop.lamp',
  'z1s3.prop.bed',
  'z1s3.fg.card_table',
  'z1s3.fg.ship_in_bottle',
  'z1s3.fg.chest',
  'z1s3.fg.clown_bust',
  'z1s3.fg.voodoo_doll',
  'z1s3.fg.hull_rib_left',
  'z1s3.fg.hull_rib_right',
];

export class RoomLayoutStudio {
  public active = false;
  public filter: StudioLayerFilter = 'all';
  public selection: StudioSelection = null;
  public hovered: StudioSelection = null;

  public freezeParallax = true;
  public autoSyncHotspot = true;
  public showAllHotspots = true;
  public lockAspectRatio = true;
  public hiddenObjectIds: Set<string> = new Set();

  private host: StudioHostGame;
  private undoStack: string[] = [];

  // Active drag state
  private isDragging = false;
  private isPanningCamera = false;
  private panStartClientX = 0;
  private panStartCameraX = 0;

  private dragHandle: DragHandle = 'move';
  private dragStartWorldX = 0;
  private dragStartWorldY = 0;
  private dragInitialRect = { x: 0, y: 0, w: 100, h: 100, walkX: 700, walkY: 800, tiltDeg: 0 };
  private dragLinkedHotspotInitial: { id: string; x: number; y: number; w: number; h: number } | null = null;

  constructor(host: StudioHostGame) {
    this.host = host;
    this.injectStudioDom();
    this.bindKeyboardShortcuts();
  }

  public toggleStudio(force?: boolean): void {
    this.active = force !== undefined ? force : !this.active;
    const rootEl = document.getElementById('moonstorm-studio-overlay');
    const topBtn = document.getElementById('btn-open-studio');
    if (rootEl) {
      rootEl.style.display = this.active ? 'block' : 'none';
    }
    if (topBtn) {
      topBtn.classList.toggle('active-toggle', this.active);
    }
    if (this.active) {
      document.getElementById('hud-bottom-box')?.classList.add('dialogue-collapsed');
      const camSlider = document.getElementById('studio-cam-slider') as HTMLInputElement | null;
      const camVal = document.getElementById('studio-cam-val');
      if (camSlider) camSlider.value = String(Math.round(this.host.cameraX));
      if (camVal) camVal.textContent = String(Math.round(this.host.cameraX));
      this.refreshInspectorAndList();
    }
  }

  public classifyObjectLayer(obj: SceneObjectDef): StudioLayerFilter {
    if (obj.inSituSeamless && obj.sortY < 900) {
      return 'structural';
    }
    if (obj.sortY >= 900) {
      return 'foreground';
    }
    if (obj.sortY >= 555 && obj.sortY < 650) {
      return 'wall_props';
    }
    return 'floor_props';
  }

  public isObjectSelectableInFilter(obj: SceneObjectDef): boolean {
    if (this.hiddenObjectIds.has(obj.id)) return false;
    if (this.filter === 'all') return true;
    if (this.filter === 'hotspots' || this.filter === 'characters') return false;
    return this.classifyObjectLayer(obj) === this.filter;
  }

  private getObjectScreenRectInWorld(obj: SceneObjectDef): { x: number; y: number; w: number; h: number } {
    if (this.freezeParallax) {
      return { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
    }
    const parX = ((this.host.mouseX - this.host.canvas.width * 0.5) / this.host.canvas.width) * -14;
    const parY = ((this.host.mouseY - this.host.canvas.height * 0.5) / this.host.canvas.height) * -8;
    const pFactor = obj.parallaxFactor ?? 1.0;
    const anchorX = obj.parallaxAnchorX ?? obj.x + obj.w * 0.5;
    const { dx, dy } = this.host.computeParallaxOffset(pFactor, anchorX, parX, parY);
    return { x: obj.x + dx, y: obj.y + dy, w: obj.w, h: obj.h };
  }

  private getHotspotScreenRectInWorld(h: HotspotDef): { x: number; y: number; w: number; h: number } {
    if (this.freezeParallax) {
      return { x: h.x, y: h.y, w: h.w, h: h.h };
    }
    const parX = ((this.host.mouseX - this.host.canvas.width * 0.5) / this.host.canvas.width) * -14;
    const parY = ((this.host.mouseY - this.host.canvas.height * 0.5) / this.host.canvas.height) * -8;
    const pFactor = h.parallaxFactor ?? 1.0;
    const anchorX = h.parallaxAnchorX ?? h.x + h.w * 0.5;
    const { dx, dy } = this.host.computeParallaxOffset(pFactor, anchorX, parX, parY);
    return { x: h.x + dx, y: h.y + dy, w: h.w, h: h.h };
  }

  private getCharacterRect(id: 'smoothface' | 'cap_dread'): { x: number; y: number; w: number; h: number } {
    if (id === 'smoothface') {
      const p = this.host.player;
      return { x: Math.round(p.x - 95), y: Math.round(p.y - 285), w: 190, h: 285 };
    }
    const d = this.host.npcs.cap_dread;
    return { x: Math.round(d.x - 85), y: Math.round(d.y - 330), w: 170, h: 330 };
  }

  private getActiveSelectionRect(): { x: number; y: number; w: number; h: number; walkX?: number; walkY?: number } | null {
    if (!this.selection) return null;
    if (this.selection.kind === 'object') {
      const obj = ROOM_OBJECTS.Z1S3.find((o) => o.id === this.selection!.id);
      if (!obj) return null;
      const r = this.getObjectScreenRectInWorld(obj);
      const linkedH = obj.hotspotId ? ROOM_HOTSPOTS.Z1S3.find((h) => h.id === obj.hotspotId) : undefined;
      return { ...r, walkX: linkedH?.walkX, walkY: linkedH?.walkY };
    }
    if (this.selection.kind === 'hotspot') {
      const h = ROOM_HOTSPOTS.Z1S3.find((item) => item.id === this.selection!.id);
      if (!h) return null;
      const r = this.getHotspotScreenRectInWorld(h);
      return { ...r, walkX: h.walkX, walkY: h.walkY };
    }
    if (this.selection.kind === 'character') {
      return this.getCharacterRect(this.selection.id);
    }
    return null;
  }

  private hitTestHandles(
    worldX: number,
    worldY: number
  ): DragHandle | null {
    const rect = this.getActiveSelectionRect();
    if (!rect) return null;

    // 1. Check Walk Target Pin first if visible
    if (rect.walkX !== undefined && rect.walkY !== undefined) {
      const distWalk = Math.hypot(worldX - rect.walkX, worldY - rect.walkY);
      if (distWalk <= 14) {
        return 'walk_target';
      }
    }

    // 2. Check circular Rotation Handle above top-center for objects
    if (this.selection?.kind === 'object') {
      const rotHx = rect.x + rect.w * 0.5;
      const rotHy = rect.y - 26;
      if (Math.hypot(worldX - rotHx, worldY - rotHy) <= 11) {
        return 'rotate';
      }
    }

    // 3. Check 8 resize handles for objects & hotspots (characters are move-only)
    if (this.selection?.kind !== 'character') {
      const pts: Array<{ h: DragHandle; x: number; y: number }> = [
        { h: 'nw', x: rect.x, y: rect.y },
        { h: 'n', x: rect.x + rect.w * 0.5, y: rect.y },
        { h: 'ne', x: rect.x + rect.w, y: rect.y },
        { h: 'e', x: rect.x + rect.w, y: rect.y + rect.h * 0.5 },
        { h: 'se', x: rect.x + rect.w, y: rect.y + rect.h },
        { h: 's', x: rect.x + rect.w * 0.5, y: rect.y + rect.h },
        { h: 'sw', x: rect.x, y: rect.y + rect.h },
        { h: 'w', x: rect.x, y: rect.y + rect.h * 0.5 },
      ];
      for (const p of pts) {
        if (Math.abs(worldX - p.x) <= 9 && Math.abs(worldY - p.y) <= 9) {
          return p.h;
        }
      }
    }

    // 3. Check inside bounding box
    if (
      worldX >= rect.x &&
      worldX <= rect.x + rect.w &&
      worldY >= rect.y &&
      worldY <= rect.y + rect.h
    ) {
      return 'move';
    }
    return null;
  }

  public hitTestAt(worldX: number, worldY: number): StudioSelection {
    // Mode: Hotspots only
    if (this.filter === 'hotspots') {
      for (let i = ROOM_HOTSPOTS.Z1S3.length - 1; i >= 0; i--) {
        const h = ROOM_HOTSPOTS.Z1S3[i];
        const r = this.getHotspotScreenRectInWorld(h);
        if (worldX >= r.x && worldX <= r.x + r.w && worldY >= r.y && worldY <= r.y + r.h) {
          return { kind: 'hotspot', id: h.id };
        }
      }
      return null;
    }

    // Mode: Characters only
    if (this.filter === 'characters') {
      for (const cid of ['smoothface', 'cap_dread'] as const) {
        const r = this.getCharacterRect(cid);
        if (worldX >= r.x && worldX <= r.x + r.w && worldY >= r.y && worldY <= r.y + r.h) {
          return { kind: 'character', id: cid };
        }
      }
      return null;
    }

    // In 'all' mode, also check characters if clicked near their body
    if (this.filter === 'all') {
      for (const cid of ['smoothface', 'cap_dread'] as const) {
        const r = this.getCharacterRect(cid);
        if (
          worldX >= r.x + 25 &&
          worldX <= r.x + r.w - 25 &&
          worldY >= r.y + 20 &&
          worldY <= r.y + r.h
        ) {
          // Check if a foreground object is in front of the character
          const fgHit = ROOM_OBJECTS.Z1S3.filter(
            (o) => o.sortY > 850 && !o.inSituSeamless && this.isObjectSelectableInFilter(o)
          ).find((o) => {
            const or = this.getObjectScreenRectInWorld(o);
            return worldX >= or.x && worldX <= or.x + or.w && worldY >= or.y && worldY <= or.y + or.h;
          });
          if (!fgHit) {
            return { kind: 'character', id: cid };
          }
        }
      }
    }

    // Sort candidate objects by sortY descending so topmost object is picked first!
    // In 'all' mode, prioritize non-structural props over huge wall/floor panels unless no prop is hit.
    const candidates = ROOM_OBJECTS.Z1S3.filter((o) => this.isObjectSelectableInFilter(o));
    const sorted = [...candidates].sort((a, b) => {
      if (this.filter === 'all') {
        const aStruct = a.inSituSeamless ? 0 : 1;
        const bStruct = b.inSituSeamless ? 0 : 1;
        if (aStruct !== bStruct) return bStruct - aStruct;
      }
      return b.sortY - a.sortY;
    });

    for (const obj of sorted) {
      const r = this.getObjectScreenRectInWorld(obj);
      if (worldX >= r.x && worldX <= r.x + r.w && worldY >= r.y && worldY <= r.y + r.h) {
        return { kind: 'object', id: obj.id };
      }
    }
    return null;
  }

  public pushUndoSnapshot(): void {
    const snap = JSON.stringify(
      serializeZ1S3OfficialLayout(
        this.host.player.x,
        this.host.player.y,
        this.host.player.facing,
        this.host.npcs.cap_dread.x,
        this.host.npcs.cap_dread.y,
        this.host.npcs.cap_dread.facing
      )
    );
    if (this.undoStack.length === 0 || this.undoStack[this.undoStack.length - 1] !== snap) {
      this.undoStack.push(snap);
      if (this.undoStack.length > 35) {
        this.undoStack.shift();
      }
    }
  }

  public undo(): void {
    const prev = this.undoStack.pop();
    if (!prev) {
      this.showToast('No hay mas cambios para deshacer.');
      return;
    }
    const parsed = JSON.parse(prev);
    applyZ1S3OfficialLayout(parsed);
    if (parsed.characters?.smoothface) {
      this.host.player.x = parsed.characters.smoothface.x;
      this.host.player.y = parsed.characters.smoothface.y;
      this.host.player.facing = parsed.characters.smoothface.facing;
    }
    if (parsed.characters?.cap_dread) {
      this.host.npcs.cap_dread.x = parsed.characters.cap_dread.x;
      this.host.npcs.cap_dread.y = parsed.characters.cap_dread.y;
      this.host.npcs.cap_dread.facing = parsed.characters.cap_dread.facing;
    }
    this.refreshInspectorAndList();
    this.showToast('↩️ Cambio deshecho');
  }

  public onMouseDown(e: MouseEvent, worldX: number, worldY: number): boolean {
    if (!this.active) return false;

    // Right-click or Middle-click pans the camera horizontally!
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      this.isPanningCamera = true;
      this.panStartClientX = e.clientX;
      this.panStartCameraX = this.host.cameraX;
      return true;
    }

    if (e.button !== 0) return true;

    // Check if clicking a handle on the currently selected item
    const handle = this.hitTestHandles(worldX, worldY);
    if (handle && this.selection) {
      this.pushUndoSnapshot();
      this.isDragging = true;
      this.dragHandle = handle;
      this.dragStartWorldX = worldX;
      this.dragStartWorldY = worldY;
      this.captureDragInitialState();
      return true;
    }

    // Otherwise hit-test for a new selection
    const hit = this.hitTestAt(worldX, worldY);
    this.selection = hit;
    this.refreshInspectorAndList();

    if (hit) {
      this.pushUndoSnapshot();
      this.isDragging = true;
      this.dragHandle = 'move';
      this.dragStartWorldX = worldX;
      this.dragStartWorldY = worldY;
      this.captureDragInitialState();
    }
    return true;
  }

  private captureDragInitialState(): void {
    this.dragLinkedHotspotInitial = null;
    if (!this.selection) return;

    if (this.selection.kind === 'object') {
      const obj = ROOM_OBJECTS.Z1S3.find((o) => o.id === this.selection!.id);
      if (obj) {
        const linkedH = obj.hotspotId
          ? ROOM_HOTSPOTS.Z1S3.find((h) => h.id === obj.hotspotId)
          : undefined;
        this.dragInitialRect = {
          x: obj.x,
          y: obj.y,
          w: obj.w,
          h: obj.h,
          walkX: linkedH?.walkX ?? 700,
          walkY: linkedH?.walkY ?? 800,
          tiltDeg: obj.tiltDeg || 0,
        };
        if (linkedH && this.autoSyncHotspot) {
          // Only auto-move hotspot if it belongs to a single object or matches this object
          const sharedCount = ROOM_OBJECTS.Z1S3.filter((o) => o.hotspotId === linkedH.id).length;
          if (sharedCount <= 1) {
            this.dragLinkedHotspotInitial = {
              id: linkedH.id,
              x: linkedH.x,
              y: linkedH.y,
              w: linkedH.w,
              h: linkedH.h,
            };
          }
        }
      }
    } else if (this.selection.kind === 'hotspot') {
      const h = ROOM_HOTSPOTS.Z1S3.find((item) => item.id === this.selection!.id);
      if (h) {
        this.dragInitialRect = {
          x: h.x,
          y: h.y,
          w: h.w,
          h: h.h,
          walkX: h.walkX,
          walkY: h.walkY,
          tiltDeg: 0,
        };
      }
    } else if (this.selection.kind === 'character') {
      const target =
        this.selection.id === 'smoothface' ? this.host.player : this.host.npcs.cap_dread;
      this.dragInitialRect = {
        x: target.x,
        y: target.y,
        w: 180,
        h: 310,
        walkX: target.x,
        walkY: target.y,
        tiltDeg: 0,
      };
    }
  }

  public onMouseMove(e: MouseEvent, worldX: number, worldY: number): boolean {
    if (!this.active) return false;

    if (this.isPanningCamera) {
      const rect = this.host.canvas.getBoundingClientRect();
      const scaleX = this.host.canvas.width / rect.width;
      const dx = (e.clientX - this.panStartClientX) * scaleX;
      const maxCam = Math.max(0, this.host.getRoomWidth() - 1600);
      this.host.cameraX = Math.max(0, Math.min(maxCam, Math.round(this.panStartCameraX - dx)));
      const camSlider = document.getElementById('studio-cam-slider') as HTMLInputElement | null;
      const camVal = document.getElementById('studio-cam-val');
      if (camSlider) camSlider.value = String(this.host.cameraX);
      if (camVal) camVal.textContent = String(this.host.cameraX);
      return true;
    }

    if (this.isDragging && this.selection) {
      const dx = Math.round(worldX - this.dragStartWorldX);
      const dy = Math.round(worldY - this.dragStartWorldY);
      this.applyDragDelta(dx, dy, e.shiftKey);
      this.syncInspectorInputsOnly();
      return true;
    }

    // Update hover cursor and hover highlight
    const handle = this.hitTestHandles(worldX, worldY);
    if (handle) {
      const cursorMap: Record<DragHandle, string> = {
        move: 'move',
        nw: 'nwse-resize',
        se: 'nwse-resize',
        ne: 'nesw-resize',
        sw: 'nesw-resize',
        n: 'ns-resize',
        s: 'ns-resize',
        e: 'ew-resize',
        w: 'ew-resize',
        rotate: 'grab',
        walk_target: 'crosshair',
      };
      this.host.canvas.style.cursor = cursorMap[handle];
      this.hovered = this.selection;
      return true;
    }

    this.hovered = this.hitTestAt(worldX, worldY);
    this.host.canvas.style.cursor = this.hovered ? 'grab' : 'default';
    return true;
  }

  public onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.refreshInspectorAndList();
    }
    this.isPanningCamera = false;
  }

  private applyDragDelta(dx: number, dy: number, shiftKey: boolean): void {
    if (!this.selection) return;
    const init = this.dragInitialRect;

    if (this.dragHandle === 'rotate' && this.selection.kind === 'object') {
      const obj = ROOM_OBJECTS.Z1S3.find((o) => o.id === this.selection!.id);
      if (obj) {
        const cx = init.x + init.w * 0.5;
        const cy = init.y + init.h * 0.5;
        const curWorldX = this.dragStartWorldX + dx;
        const curWorldY = this.dragStartWorldY + dy;
        let deg = (Math.atan2(curWorldY - cy, curWorldX - cx) * 180) / Math.PI + 90;
        if (deg > 180) deg -= 360;
        if (deg < -180) deg += 360;
        if (shiftKey) {
          deg = Math.round(deg / 5) * 5;
        } else {
          deg = Math.round(deg);
        }
        obj.tiltDeg = deg;
      }
      return;
    }

    if (this.dragHandle === 'walk_target') {
      const newWalkX = Math.max(80, Math.min(2320, Math.round(init.walkX + dx)));
      const newWalkY = Math.max(680, Math.min(885, Math.round(init.walkY + dy)));
      if (this.selection.kind === 'hotspot') {
        const h = ROOM_HOTSPOTS.Z1S3.find((item) => item.id === this.selection!.id);
        if (h) {
          h.walkX = newWalkX;
          h.walkY = newWalkY;
        }
      } else if (this.selection.kind === 'object') {
        const obj = ROOM_OBJECTS.Z1S3.find((o) => o.id === this.selection!.id);
        const h = obj?.hotspotId
          ? ROOM_HOTSPOTS.Z1S3.find((item) => item.id === obj.hotspotId)
          : undefined;
        if (h) {
          h.walkX = newWalkX;
          h.walkY = newWalkY;
        }
      }
      return;
    }

    if (this.selection.kind === 'character') {
      const target =
        this.selection.id === 'smoothface' ? this.host.player : this.host.npcs.cap_dread;
      target.x = Math.round(init.x + dx);
      target.y = Math.round(init.y + dy);
      Z1S3_CHARACTER_SPAWNS[this.selection.id].x = target.x;
      Z1S3_CHARACTER_SPAWNS[this.selection.id].y = target.y;
      if (this.selection.id === 'cap_dread') {
        const h = ROOM_HOTSPOTS.Z1S3.find((item) => item.id === 'z1s3_cap_dread');
        if (h) {
          h.x = Math.round(target.x - h.w * 0.5);
          h.y = Math.round(target.y - h.h);
        }
      }
      return;
    }

    // Compute new (x, y, w, h) for object or hotspot
    let nx = init.x;
    let ny = init.y;
    let nw = init.w;
    let nh = init.h;
    const aspect = init.w / Math.max(1, init.h);
    const keepRatio =
      this.selection.kind === 'object' ? this.lockAspectRatio && !shiftKey : shiftKey;

    if (this.dragHandle === 'move') {
      nx = init.x + dx;
      ny = init.y + dy;
    } else {
      if (this.dragHandle.includes('e')) nw = Math.max(16, init.w + dx);
      if (this.dragHandle.includes('s')) nh = Math.max(16, init.h + dy);
      if (this.dragHandle.includes('w')) {
        const maxDx = init.w - 16;
        const clampedDx = Math.min(maxDx, dx);
        nx = init.x + clampedDx;
        nw = init.w - clampedDx;
      }
      if (this.dragHandle.includes('n')) {
        const maxDy = init.h - 16;
        const clampedDy = Math.min(maxDy, dy);
        ny = init.y + clampedDy;
        nh = init.h - clampedDy;
      }

      if (keepRatio && ['nw', 'ne', 'se', 'sw'].includes(this.dragHandle)) {
        nh = Math.max(16, Math.round(nw / aspect));
        if (this.dragHandle.includes('n')) {
          ny = init.y + (init.h - nh);
        }
      }
    }

    nx = Math.round(nx);
    ny = Math.round(ny);
    nw = Math.round(nw);
    nh = Math.round(nh);

    if (this.selection.kind === 'object') {
      const obj = ROOM_OBJECTS.Z1S3.find((o) => o.id === this.selection!.id);
      if (obj) {
        obj.x = nx;
        obj.y = ny;
        obj.w = nw;
        obj.h = nh;
        if (this.dragLinkedHotspotInitial) {
          const lh = ROOM_HOTSPOTS.Z1S3.find((h) => h.id === this.dragLinkedHotspotInitial!.id);
          if (lh) {
            lh.x = Math.round(this.dragLinkedHotspotInitial.x + (nx - init.x));
            lh.y = Math.round(this.dragLinkedHotspotInitial.y + (ny - init.y));
            lh.w = Math.max(16, Math.round(this.dragLinkedHotspotInitial.w + (nw - init.w)));
            lh.h = Math.max(16, Math.round(this.dragLinkedHotspotInitial.h + (nh - init.h)));
          }
        }
      }
    } else if (this.selection.kind === 'hotspot') {
      const h = ROOM_HOTSPOTS.Z1S3.find((item) => item.id === this.selection!.id);
      if (h) {
        h.x = nx;
        h.y = ny;
        h.w = nw;
        h.h = nh;
      }
    }
  }

  public renderOverlay(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    // 1. Draw Walkbox reference border
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(150, 730, this.host.getRoomWidth() - 300, 125);
    ctx.setLineDash([]);

    // 2. Draw all interactive hotspots if showAllHotspots or filter === 'hotspots'
    if (this.showAllHotspots || this.filter === 'hotspots') {
      for (const h of ROOM_HOTSPOTS.Z1S3) {
        const isSelected =
          (this.selection?.kind === 'hotspot' && this.selection.id === h.id) ||
          (this.selection?.kind === 'object' &&
            ROOM_OBJECTS.Z1S3.find((o) => o.id === this.selection!.id)?.hotspotId === h.id);
        const r = this.getHotspotScreenRectInWorld(h);
        ctx.save();
        ctx.strokeStyle = isSelected
          ? '#00ffcc'
          : this.filter === 'hotspots'
          ? 'rgba(255, 207, 86, 0.85)'
          : 'rgba(255, 207, 86, 0.35)';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(r.x, r.y, r.w, r.h);

        if (this.filter === 'hotspots' || isSelected) {
          ctx.fillStyle = isSelected ? 'rgba(0, 255, 204, 0.12)' : 'rgba(255, 207, 86, 0.08)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
          ctx.setLineDash([]);
          ctx.font = 'bold 12px "Crimson Pro", serif';
          ctx.fillStyle = '#181210';
          ctx.fillRect(r.x, r.y - 18, Math.min(r.w, 190), 18);
          ctx.fillStyle = isSelected ? '#00ffcc' : '#ffcf56';
          ctx.fillText(`🎯 ${h.name.slice(0, 26)}`, r.x + 4, r.y - 5);
        }
        ctx.restore();
      }
    }

    // 3. Draw Hovered item outline
    if (
      this.hovered &&
      (!this.selection ||
        this.hovered.kind !== this.selection.kind ||
        this.hovered.id !== this.selection.id)
    ) {
      let hr: { x: number; y: number; w: number; h: number } | null = null;
      let label = '';
      if (this.hovered.kind === 'object') {
        const o = ROOM_OBJECTS.Z1S3.find((item) => item.id === this.hovered!.id);
        if (o) {
          hr = this.getObjectScreenRectInWorld(o);
          label = `${o.id} (${o.x}, ${o.y})`;
        }
      } else if (this.hovered.kind === 'hotspot') {
        const h = ROOM_HOTSPOTS.Z1S3.find((item) => item.id === this.hovered!.id);
        if (h) {
          hr = this.getHotspotScreenRectInWorld(h);
          label = `[Hotspot] ${h.name}`;
        }
      } else if (this.hovered.kind === 'character') {
        hr = this.getCharacterRect(this.hovered.id);
        label = `[Character] ${this.hovered.id}`;
      }
      if (hr) {
        ctx.save();
        ctx.strokeStyle = 'rgba(94, 242, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(hr.x, hr.y, hr.w, hr.h);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(20, 15, 13, 0.9)';
        ctx.fillRect(hr.x, Math.max(4, hr.y - 22), Math.max(150, label.length * 7.2), 20);
        ctx.fillStyle = '#5ef2ff';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(label, hr.x + 6, Math.max(18, hr.y - 7));
        ctx.restore();
      }
    }

    // 4. Draw Active Selection Gizmo (Solid frame + 8 Resize Handles + Walk Target Pin)
    const selRect = this.getActiveSelectionRect();
    if (selRect && this.selection) {
      ctx.save();
      ctx.strokeStyle = '#ffcf56';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(selRect.x, selRect.y, selRect.w, selRect.h);

      // Coordinate Pill above selected item
      const title = `${this.selection.id}  [x:${selRect.x}, y:${selRect.y}, w:${selRect.w}, h:${selRect.h}]`;
      const pillW = Math.max(210, title.length * 7.5 + 16);
      const pillX = Math.max(10, Math.min(this.host.getRoomWidth() - pillW - 10, selRect.x));
      const pillY = Math.max(75, selRect.y - 28);
      ctx.fillStyle = '#181210';
      ctx.fillRect(pillX, pillY, pillW, 24);
      ctx.strokeStyle = '#ffcf56';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pillX, pillY, pillW, 24);
      ctx.fillStyle = '#ffe89e';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(title, pillX + 8, pillY + 16);

      // 8 Resize Handles (if object or hotspot)
      if (this.selection.kind !== 'character') {
        const handles = [
          [selRect.x, selRect.y],
          [selRect.x + selRect.w * 0.5, selRect.y],
          [selRect.x + selRect.w, selRect.y],
          [selRect.x + selRect.w, selRect.y + selRect.h * 0.5],
          [selRect.x + selRect.w, selRect.y + selRect.h],
          [selRect.x + selRect.w * 0.5, selRect.y + selRect.h],
          [selRect.x, selRect.y + selRect.h],
          [selRect.x, selRect.y + selRect.h * 0.5],
        ];
        for (const [hx, hy] of handles) {
          ctx.fillStyle = '#ffcf56';
          ctx.fillRect(hx - 6, hy - 6, 12, 12);
          ctx.strokeStyle = '#181210';
          ctx.lineWidth = 2;
          ctx.strokeRect(hx - 6, hy - 6, 12, 12);
        }

        // Draw circular Rotation Handle above top-center for objects
        if (this.selection.kind === 'object') {
          const rx = selRect.x + selRect.w * 0.5;
          const ry = selRect.y - 26;
          ctx.strokeStyle = '#ffcf56';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx, selRect.y);
          ctx.lineTo(rx, ry);
          ctx.stroke();

          ctx.fillStyle = '#5ef2ff';
          ctx.beginPath();
          ctx.arc(rx, ry, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#181210';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw tethered Walk Target Pin if available
      if (selRect.walkX !== undefined && selRect.walkY !== undefined) {
        const cx = selRect.x + selRect.w * 0.5;
        const cy = selRect.y + selRect.h * 0.5;
        ctx.strokeStyle = '#00ff99';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(selRect.walkX, selRect.walkY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target pin diamond/circle
        ctx.fillStyle = '#00ff99';
        ctx.beginPath();
        ctx.arc(selRect.walkX, selRect.walkY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#181210';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#181210';
        ctx.fillRect(selRect.walkX + 12, selRect.walkY - 11, 142, 20);
        ctx.strokeStyle = '#00ff99';
        ctx.lineWidth = 1;
        ctx.strokeRect(selRect.walkX + 12, selRect.walkY - 11, 142, 20);
        ctx.fillStyle = '#00ff99';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Walk (${selRect.walkX}, ${selRect.walkY})`, selRect.walkX + 17, selRect.walkY + 3);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private bindKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        this.toggleStudio();
        return;
      }
      if (!this.active) return;

      // Ignore arrow keys if typing inside an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.saveOfficialCoordinates();
        return;
      }

      if (this.selection && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        this.pushUndoSnapshot();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        this.captureDragInitialState();
        this.dragHandle = 'move';
        this.applyDragDelta(dx, dy, false);
        this.syncInspectorInputsOnly();
      }
    });
  }

  private injectStudioDom(): void {
    const existing = document.getElementById('moonstorm-studio-overlay');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'moonstorm-studio-overlay';
    wrapper.style.display = 'none';
    wrapper.innerHTML = `
      <!-- Top Studio Filter & Camera Bar -->
      <div class="studio-top-bar">
        <div class="studio-brand">🛠️ MOONSTORM STUDIO</div>
        <div class="studio-filter-tabs" id="studio-filter-tabs">
          <button class="studio-tab active" data-filter="all">Todo</button>
          <button class="studio-tab" data-filter="structural">Fondo / Casco</button>
          <button class="studio-tab" data-filter="wall_props">Props Pared</button>
          <button class="studio-tab" data-filter="floor_props">Muebles y Puzzle</button>
          <button class="studio-tab" data-filter="foreground">Primer Plano</button>
          <button class="studio-tab" data-filter="characters">Personajes</button>
          <button class="studio-tab" data-filter="hotspots">🎯 Hotspots</button>
        </div>

        <div class="studio-cam-group">
          <label>Cam X: <strong id="studio-cam-val">240</strong></label>
          <input type="range" id="studio-cam-slider" min="0" max="800" step="1" value="240" />
        </div>

        <div class="studio-toggles">
          <label title="Congela el parallax del mouse/camara para alinear con precision 1:1">
            <input type="checkbox" id="studio-chk-freeze" checked /> 1:1 Sin Parallax
          </label>
          <label title="Al mover o escalar un prop visual, mueve automaticamente su Hotspot interactivo">
            <input type="checkbox" id="studio-chk-sync-hs" checked /> 🔗 Sync Hotspot
          </label>
          <label title="Muestra los rectangulos punteados de todos los Hotspots interactivos">
            <input type="checkbox" id="studio-chk-show-hs" checked /> Ver Hotspots
          </label>
        </div>

        <div class="studio-actions">
          <button id="studio-btn-undo" class="studio-btn" title="Deshacer (Ctrl+Z)">↩️ Deshacer</button>
          <button id="studio-btn-save" class="studio-btn studio-btn-save" title="Guardar como coordenadas iniciales oficiales en WorldData.ts y layout.json (Ctrl+S)">💾 Guardar Oficial</button>
          <button id="studio-btn-close" class="studio-btn studio-btn-exit" title="Volver al juego (F2)">✕ Jugar</button>
        </div>
      </div>

      <!-- Right Dock Inspector & Layer List -->
      <aside class="studio-right-dock">
        <div class="studio-panel-section" id="studio-inspector-box">
          <div class="studio-section-title">PROPIEDADES DEL ELEMENTO</div>
          <div id="studio-inspector-content" class="studio-inspector-empty">
            Haz clic sobre cualquier objeto, personaje o hotspot en pantalla para moverlo o editar sus propiedades.
          </div>
        </div>

        <div class="studio-panel-section studio-add-bar">
          <select id="studio-catalog-select" class="studio-select">
            ${APPROVED_Z1S3_CATALOG.map((k) => `<option value="${k}">${k}</option>`).join('')}
          </select>
          <button id="studio-btn-spawn" class="studio-btn-sm">+ Agregar Pieza</button>
        </div>

        <div class="studio-panel-section studio-list-section">
          <div class="studio-section-title">
            <span>LISTA EN CAPA ACTIVA</span>
            <span id="studio-list-count">0</span>
          </div>
          <div id="studio-layer-list" class="studio-layer-list"></div>
        </div>
      </aside>

      <div id="studio-toast" class="studio-toast" style="display:none;"></div>
    `;

    document.getElementById('stage-container')?.appendChild(wrapper);

    // Filter tabs
    wrapper.querySelectorAll('.studio-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filter = (btn as HTMLElement).dataset.filter as StudioLayerFilter;
        wrapper.querySelectorAll('.studio-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.refreshInspectorAndList();
      });
    });

    // Camera slider
    const camSlider = document.getElementById('studio-cam-slider') as HTMLInputElement;
    const camVal = document.getElementById('studio-cam-val')!;
    camSlider?.addEventListener('input', () => {
      this.host.cameraX = Number(camSlider.value);
      camVal.textContent = String(this.host.cameraX);
    });

    // Checkboxes
    document.getElementById('studio-chk-freeze')?.addEventListener('change', (e) => {
      this.freezeParallax = (e.target as HTMLInputElement).checked;
    });
    document.getElementById('studio-chk-sync-hs')?.addEventListener('change', (e) => {
      this.autoSyncHotspot = (e.target as HTMLInputElement).checked;
    });
    document.getElementById('studio-chk-show-hs')?.addEventListener('change', (e) => {
      this.showAllHotspots = (e.target as HTMLInputElement).checked;
    });

    // Top buttons
    document.getElementById('studio-btn-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('studio-btn-save')?.addEventListener('click', () =>
      this.saveOfficialCoordinates()
    );
    document.getElementById('studio-btn-close')?.addEventListener('click', () =>
      this.toggleStudio(false)
    );

    // Spawn piece from catalog
    document.getElementById('studio-btn-spawn')?.addEventListener('click', () => {
      const sel = document.getElementById('studio-catalog-select') as HTMLSelectElement;
      const imageKey = sel.value;
      this.spawnCatalogPiece(imageKey);
    });
  }

  private spawnCatalogPiece(imageKey: string): void {
    this.pushUndoSnapshot();
    const suffix = Math.floor(100 + Math.random() * 899);
    const id = `${imageKey}_${suffix}`;
    const img = this.host.getImgForStudio(imageKey);
    const w = img && img.naturalWidth > 0 ? Math.min(360, Math.round(img.naturalWidth * 0.5)) : 160;
    const h = img && img.naturalHeight > 0 ? Math.min(360, Math.round(img.naturalHeight * 0.5)) : 160;
    const x = Math.round(this.host.cameraX + 700 - w * 0.5);
    const y = 480;

    const isStructural = imageKey.includes('.wall.panel') || imageKey.includes('.floor.') || imageKey.includes('.ceiling.');
    const isFg = imageKey.includes('.fg.');
    const isWallProp = imageKey.includes('.wall.');

    const newObj: SceneObjectDef = {
      id,
      imageKey,
      x,
      y,
      w,
      h,
      sortY: isFg ? 921 : isStructural ? 110 : isWallProp ? 561 : 725,
      parallaxFactor: isFg ? 1.14 : isStructural ? 0.85 : isWallProp ? 0.88 : 1.0,
      inSituSeamless: isStructural,
    };
    ROOM_OBJECTS.Z1S3.push(newObj);
    this.selection = { kind: 'object', id: newObj.id };
    this.refreshInspectorAndList();
    this.showToast(`➕ Pieza agregada: ${id}`);
  }

  public refreshInspectorAndList(): void {
    this.renderInspector();
    this.renderLayerList();
  }

  private syncInspectorInputsOnly(): void {
    if (!this.selection) return;
    const setVal = (id: string, v: number | string) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el && document.activeElement !== el) el.value = String(v);
    };
    if (this.selection.kind === 'object') {
      const o = ROOM_OBJECTS.Z1S3.find((item) => item.id === this.selection!.id);
      if (!o) return;
      setVal('st-inp-x', o.x);
      setVal('st-inp-y', o.y);
      setVal('st-inp-w', o.w);
      setVal('st-inp-h', o.h);
      setVal('st-inp-sorty', o.sortY);
      setVal('st-inp-tilt', o.tiltDeg || 0);
      setVal('st-rng-tilt', o.tiltDeg || 0);
      setVal('st-inp-rotx', o.rotateXDeg || 0);
      setVal('st-rng-rotx', o.rotateXDeg || 0);
      setVal('st-inp-roty', o.rotateYDeg || 0);
      const lh = o.hotspotId ? ROOM_HOTSPOTS.Z1S3.find((h) => h.id === o.hotspotId) : undefined;
      if (lh) {
        setVal('st-inp-hx', lh.x);
        setVal('st-inp-hy', lh.y);
        setVal('st-inp-hw', lh.w);
        setVal('st-inp-hh', lh.h);
        setVal('st-inp-walkx', lh.walkX);
        setVal('st-inp-walky', lh.walkY);
      }
    } else if (this.selection.kind === 'hotspot') {
      const h = ROOM_HOTSPOTS.Z1S3.find((item) => item.id === this.selection!.id);
      if (!h) return;
      setVal('st-inp-hx', h.x);
      setVal('st-inp-hy', h.y);
      setVal('st-inp-hw', h.w);
      setVal('st-inp-hh', h.h);
      setVal('st-inp-walkx', h.walkX);
      setVal('st-inp-walky', h.walkY);
    } else if (this.selection.kind === 'character') {
      const c = this.selection.id === 'smoothface' ? this.host.player : this.host.npcs.cap_dread;
      setVal('st-inp-cx', Math.round(c.x));
      setVal('st-inp-cy', Math.round(c.y));
    }
  }

  private renderInspector(): void {
    const box = document.getElementById('studio-inspector-content');
    if (!box) return;

    if (!this.selection) {
      box.className = 'studio-inspector-empty';
      box.innerHTML =
        'Haz clic sobre cualquier objeto, personaje o hotspot en el escenario (o en la lista inferior) para moverlo, escalarlo o cambiar su capa.';
      return;
    }

    box.className = 'studio-inspector-body';

    if (this.selection.kind === 'character') {
      const cid = this.selection.id;
      const charState = cid === 'smoothface' ? this.host.player : this.host.npcs.cap_dread;
      box.innerHTML = `
        <div class="st-header-tag">👤 PERSONAJE: ${cid.toUpperCase()}</div>
        <div class="st-grid-2">
          <label>Pos X <input type="number" id="st-inp-cx" value="${Math.round(charState.x)}" /></label>
          <label>Pos Y (Pies) <input type="number" id="st-inp-cy" value="${Math.round(charState.y)}" /></label>
        </div>
        <div class="st-row">
          <label>Mirando hacia:
            <select id="st-inp-cfacing" class="studio-select">
              <option value="1" ${charState.facing === 1 ? 'selected' : ''}>Derecha (+1)</option>
              <option value="-1" ${charState.facing === -1 ? 'selected' : ''}>Izquierda (-1)</option>
            </select>
          </label>
        </div>
      `;
      const bindChar = () => {
        this.pushUndoSnapshot();
        const nx = Number((document.getElementById('st-inp-cx') as HTMLInputElement).value);
        const ny = Number((document.getElementById('st-inp-cy') as HTMLInputElement).value);
        const nf = Number((document.getElementById('st-inp-cfacing') as HTMLSelectElement).value) as 1 | -1;
        charState.x = nx;
        charState.y = ny;
        charState.facing = nf;
        Z1S3_CHARACTER_SPAWNS[cid].x = nx;
        Z1S3_CHARACTER_SPAWNS[cid].y = ny;
        Z1S3_CHARACTER_SPAWNS[cid].facing = nf;
      };
      box.querySelectorAll('input, select').forEach((el) => el.addEventListener('change', bindChar));
      return;
    }

    if (this.selection.kind === 'hotspot') {
      const h = ROOM_HOTSPOTS.Z1S3.find((item) => item.id === this.selection!.id);
      if (!h) return;
      box.innerHTML = `
        <div class="st-header-tag">🎯 HOTSPOT: ${h.id}</div>
        <div class="st-row">
          <label>Nombre en Pantalla
            <input type="text" id="st-inp-hname" value="${h.name.replace(/"/g, '&quot;')}" />
          </label>
        </div>
        <div class="st-grid-4">
          <label>X <input type="number" id="st-inp-hx" value="${h.x}" /></label>
          <label>Y <input type="number" id="st-inp-hy" value="${h.y}" /></label>
          <label>W <input type="number" id="st-inp-hw" value="${h.w}" /></label>
          <label>H <input type="number" id="st-inp-hh" value="${h.h}" /></label>
        </div>
        <div class="st-grid-3">
          <label>Walk X (🎯) <input type="number" id="st-inp-walkx" value="${h.walkX}" /></label>
          <label>Walk Y (🎯) <input type="number" id="st-inp-walky" value="${h.walkY}" /></label>
          <label>Cursor
            <select id="st-inp-hcursor" class="studio-select">
              <option value="pointer" ${h.cursor === 'pointer' ? 'selected' : ''}>Look (pointer)</option>
              <option value="grab" ${h.cursor === 'grab' ? 'selected' : ''}>Take/Use (grab)</option>
              <option value="talk" ${h.cursor === 'talk' ? 'selected' : ''}>Talk (talk)</option>
              <option value="exit" ${h.cursor === 'exit' ? 'selected' : ''}>Exit (exit)</option>
            </select>
          </label>
        </div>
      `;
      const bindHs = () => {
        this.pushUndoSnapshot();
        h.name = (document.getElementById('st-inp-hname') as HTMLInputElement).value;
        h.x = Number((document.getElementById('st-inp-hx') as HTMLInputElement).value);
        h.y = Number((document.getElementById('st-inp-hy') as HTMLInputElement).value);
        h.w = Math.max(16, Number((document.getElementById('st-inp-hw') as HTMLInputElement).value));
        h.h = Math.max(16, Number((document.getElementById('st-inp-hh') as HTMLInputElement).value));
        h.walkX = Number((document.getElementById('st-inp-walkx') as HTMLInputElement).value);
        h.walkY = Number((document.getElementById('st-inp-walky') as HTMLInputElement).value);
        h.cursor = (document.getElementById('st-inp-hcursor') as HTMLSelectElement).value as HotspotDef['cursor'];
        this.renderLayerList();
      };
      box.querySelectorAll('input, select').forEach((el) => el.addEventListener('change', bindHs));
      return;
    }

    // Selected: SceneObjectDef
    const obj = ROOM_OBJECTS.Z1S3.find((o) => o.id === this.selection!.id);
    if (!obj) return;
    const linkedH = obj.hotspotId ? ROOM_HOTSPOTS.Z1S3.find((h) => h.id === obj.hotspotId) : undefined;
    const planeRole = this.getPlanePresetKey(obj);

    box.innerHTML = `
      <div class="st-header-tag">🖼️ OBJETO: ${obj.id}</div>
      <div class="st-grid-4">
        <label>X <input type="number" id="st-inp-x" value="${obj.x}" /></label>
        <label>Y <input type="number" id="st-inp-y" value="${obj.y}" /></label>
        <label>W <input type="number" id="st-inp-w" value="${obj.w}" /></label>
        <label>H <input type="number" id="st-inp-h" value="${obj.h}" /></label>
      </div>

      <div class="st-row st-check-row">
        <label><input type="checkbox" id="st-chk-ratio" ${this.lockAspectRatio ? 'checked' : ''} /> 🔒 Proporcion</label>
        <label><input type="checkbox" id="st-chk-flipx" ${obj.flipX ? 'checked' : ''} /> ↔️ Flip X</label>
        <label><input type="checkbox" id="st-chk-flipy" ${obj.flipY ? 'checked' : ''} /> ↕️ Flip Y</label>
      </div>

      <div class="st-rot-box">
        <div class="st-rot-row">
          <span class="st-rot-lbl">🔄 Rotar (°)</span>
          <input type="range" id="st-rng-tilt" min="-180" max="180" step="1" value="${obj.tiltDeg || 0}" />
          <input type="number" id="st-inp-tilt" min="-180" max="180" value="${obj.tiltDeg || 0}" />
        </div>
        <div class="st-rot-row">
          <span class="st-rot-lbl">📐 Rotate X (°)</span>
          <input type="range" id="st-rng-rotx" min="-80" max="80" step="1" value="${obj.rotateXDeg || 0}" />
          <input type="number" id="st-inp-rotx" min="-80" max="80" value="${obj.rotateXDeg || 0}" />
        </div>
        <div class="st-rot-row">
          <span class="st-rot-lbl">📐 Rotate Y (°)</span>
          <input type="range" id="st-rng-roty" min="-80" max="80" step="1" value="${obj.rotateYDeg || 0}" />
          <input type="number" id="st-inp-roty" min="-80" max="80" value="${obj.rotateYDeg || 0}" />
          <button id="st-btn-rot-reset" class="studio-btn-xs" title="Resetear todos los angulos a 0°">0°</button>
        </div>
      </div>

      <div class="st-row">
        <label>Rol de Capa / Plano:
          <select id="st-sel-plane" class="studio-select">
            <option value="wall" ${planeRole === 'wall' ? 'selected' : ''}>Fondo: Pared / Techo (sortY 100, par 0.85)</option>
            <option value="floor" ${planeRole === 'floor' ? 'selected' : ''}>Fondo: Piso (sortY 550, par 1.00)</option>
            <option value="wall_prop" ${planeRole === 'wall_prop' ? 'selected' : ''}>Prop de Pared (sortY 561, par 0.88)</option>
            <option value="floor_prop" ${planeRole === 'floor_prop' ? 'selected' : ''}>Mueble / Prop Piso (sortY 725, par 1.00)</option>
            <option value="fg_prop" ${planeRole === 'fg_prop' ? 'selected' : ''}>Primer Plano (sortY 920, par 1.14)</option>
            <option value="rib" ${planeRole === 'rib' ? 'selected' : ''}>Costilla Exterior (sortY 940, par 1.20)</option>
          </select>
        </label>
      </div>

      <div class="st-grid-3">
        <label>Orden Z (sortY) <input type="number" id="st-inp-sorty" value="${obj.sortY}" /></label>
        <label>Parallax <input type="number" id="st-inp-par" step="0.02" value="${obj.parallaxFactor ?? 1.0}" /></label>
        <div class="st-z-btns">
          <button id="st-btn-z-down" class="studio-btn-xs" title="Enviar atras (-1)">⬇️ Z-</button>
          <button id="st-btn-z-up" class="studio-btn-xs" title="Traer adelante (+1)">⬆️ Z+</button>
        </div>
      </div>

      <hr class="st-divider" />

      <div class="st-row">
        <label>🎯 Interactividad (Fondo vs. Interactuable):
          <select id="st-sel-hotspot" class="studio-select">
            <option value="">(Solo Fondo / Sin Hotspot)</option>
            ${ROOM_HOTSPOTS.Z1S3.map(
              (h) =>
                `<option value="${h.id}" ${obj.hotspotId === h.id ? 'selected' : ''}>${h.id} - ${h.name}</option>`
            ).join('')}
            <option value="__CREATE_NEW__">➕ Crear Nuevo Hotspot para este Objeto...</option>
          </select>
        </label>
      </div>

      ${
        linkedH
          ? `
        <div class="st-hotspot-subbox">
          <div class="st-row">
            <label>Nombre Hotspot: <input type="text" id="st-inp-hname" value="${linkedH.name.replace(/"/g, '&quot;')}" /></label>
          </div>
          <div class="st-grid-4">
            <label>HX <input type="number" id="st-inp-hx" value="${linkedH.x}" /></label>
            <label>HY <input type="number" id="st-inp-hy" value="${linkedH.y}" /></label>
            <label>HW <input type="number" id="st-inp-hw" value="${linkedH.w}" /></label>
            <label>HH <input type="number" id="st-inp-hh" value="${linkedH.h}" /></label>
          </div>
          <div class="st-grid-3">
            <label>Walk X <input type="number" id="st-inp-walkx" value="${linkedH.walkX}" /></label>
            <label>Walk Y <input type="number" id="st-inp-walky" value="${linkedH.walkY}" /></label>
            <button id="st-btn-snap-hs" class="studio-btn-xs" title="Iguala la caja del Hotspot al tamano del Prop">📐 Ajustar al Prop</button>
          </div>
        </div>
      `
          : ''
      }

      <div class="st-obj-footer">
        <button id="st-btn-dup" class="studio-btn-sm">📋 Duplicar</button>
        <button id="st-btn-del" class="studio-btn-sm studio-btn-danger">🗑️ Quitar Objeto</button>
      </div>
    `;

    // Bind numeric inputs
    const updateObjFromInputs = () => {
      this.pushUndoSnapshot();
      obj.x = Number((document.getElementById('st-inp-x') as HTMLInputElement).value);
      obj.y = Number((document.getElementById('st-inp-y') as HTMLInputElement).value);
      obj.w = Math.max(16, Number((document.getElementById('st-inp-w') as HTMLInputElement).value));
      obj.h = Math.max(16, Number((document.getElementById('st-inp-h') as HTMLInputElement).value));
      obj.sortY = Number((document.getElementById('st-inp-sorty') as HTMLInputElement).value);
      obj.parallaxFactor = Number((document.getElementById('st-inp-par') as HTMLInputElement).value);
      if (linkedH && document.getElementById('st-inp-hx')) {
        linkedH.name = (document.getElementById('st-inp-hname') as HTMLInputElement).value;
        linkedH.x = Number((document.getElementById('st-inp-hx') as HTMLInputElement).value);
        linkedH.y = Number((document.getElementById('st-inp-hy') as HTMLInputElement).value);
        linkedH.w = Math.max(16, Number((document.getElementById('st-inp-hw') as HTMLInputElement).value));
        linkedH.h = Math.max(16, Number((document.getElementById('st-inp-hh') as HTMLInputElement).value));
        linkedH.walkX = Number((document.getElementById('st-inp-walkx') as HTMLInputElement).value);
        linkedH.walkY = Number((document.getElementById('st-inp-walky') as HTMLInputElement).value);
      }
      this.renderLayerList();
    };

    ['st-inp-x', 'st-inp-y', 'st-inp-w', 'st-inp-h', 'st-inp-sorty', 'st-inp-par', 'st-inp-hname', 'st-inp-hx', 'st-inp-hy', 'st-inp-hw', 'st-inp-hh', 'st-inp-walkx', 'st-inp-walky'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', updateObjFromInputs);
    });

    document.getElementById('st-chk-ratio')?.addEventListener('change', (e) => {
      this.lockAspectRatio = (e.target as HTMLInputElement).checked;
    });
    document.getElementById('st-chk-flipx')?.addEventListener('change', (e) => {
      this.pushUndoSnapshot();
      obj.flipX = (e.target as HTMLInputElement).checked;
    });
    document.getElementById('st-chk-flipy')?.addEventListener('change', (e) => {
      this.pushUndoSnapshot();
      obj.flipY = (e.target as HTMLInputElement).checked;
    });

    const bindAnglePair = (rngId: string, inpId: string, prop: 'tiltDeg' | 'rotateXDeg' | 'rotateYDeg') => {
      const rng = document.getElementById(rngId) as HTMLInputElement | null;
      const inp = document.getElementById(inpId) as HTMLInputElement | null;
      rng?.addEventListener('input', () => {
        const v = Number(rng.value);
        obj[prop] = v;
        if (inp) inp.value = String(v);
      });
      inp?.addEventListener('change', () => {
        this.pushUndoSnapshot();
        const v = Number(inp.value);
        obj[prop] = v;
        if (rng) rng.value = String(v);
      });
    };
    bindAnglePair('st-rng-tilt', 'st-inp-tilt', 'tiltDeg');
    bindAnglePair('st-rng-rotx', 'st-inp-rotx', 'rotateXDeg');
    bindAnglePair('st-rng-roty', 'st-inp-roty', 'rotateYDeg');

    document.getElementById('st-btn-rot-reset')?.addEventListener('click', () => {
      this.pushUndoSnapshot();
      obj.tiltDeg = 0;
      obj.rotateXDeg = 0;
      obj.rotateYDeg = 0;
      this.refreshInspectorAndList();
    });

    document.getElementById('st-sel-plane')?.addEventListener('change', (e) => {
      this.pushUndoSnapshot();
      const val = (e.target as HTMLSelectElement).value;
      if (val === 'wall') {
        obj.sortY = 100;
        obj.parallaxFactor = 0.85;
        obj.inSituSeamless = true;
      } else if (val === 'floor') {
        obj.sortY = 550;
        obj.parallaxFactor = 1.0;
        obj.inSituSeamless = true;
      } else if (val === 'wall_prop') {
        obj.sortY = 561;
        obj.parallaxFactor = 0.88;
        obj.inSituSeamless = false;
      } else if (val === 'floor_prop') {
        obj.sortY = 725;
        obj.parallaxFactor = 1.0;
        obj.inSituSeamless = false;
      } else if (val === 'fg_prop') {
        obj.sortY = 920;
        obj.parallaxFactor = 1.14;
        obj.inSituSeamless = false;
      } else if (val === 'rib') {
        obj.sortY = 940;
        obj.parallaxFactor = 1.2;
        obj.inSituSeamless = true;
      }
      this.refreshInspectorAndList();
    });

    document.getElementById('st-btn-z-down')?.addEventListener('click', () => {
      this.pushUndoSnapshot();
      obj.sortY -= 1;
      this.refreshInspectorAndList();
    });
    document.getElementById('st-btn-z-up')?.addEventListener('click', () => {
      this.pushUndoSnapshot();
      obj.sortY += 1;
      this.refreshInspectorAndList();
    });

    document.getElementById('st-sel-hotspot')?.addEventListener('change', (e) => {
      this.pushUndoSnapshot();
      const val = (e.target as HTMLSelectElement).value;
      if (val === '__CREATE_NEW__') {
        const newHid = `z1s3_custom_${obj.id.replace(/[^a-z0-9]/gi, '_')}`;
        const newHs: HotspotDef = {
          id: newHid,
          name: obj.id,
          x: obj.x,
          y: obj.y,
          w: obj.w,
          h: obj.h,
          walkX: Math.max(200, Math.min(2200, Math.round(obj.x + obj.w * 0.5))),
          walkY: 795,
          cursor: 'pointer',
          parallaxFactor: obj.parallaxFactor ?? 1.0,
        };
        ROOM_HOTSPOTS.Z1S3.push(newHs);
        obj.hotspotId = newHid;
        this.showToast(`🎯 Hotspot creado: ${newHid}`);
      } else {
        obj.hotspotId = val || undefined;
      }
      this.refreshInspectorAndList();
    });

    document.getElementById('st-btn-snap-hs')?.addEventListener('click', () => {
      if (!linkedH) return;
      this.pushUndoSnapshot();
      linkedH.x = obj.x;
      linkedH.y = obj.y;
      linkedH.w = obj.w;
      linkedH.h = obj.h;
      linkedH.parallaxFactor = obj.parallaxFactor ?? 1.0;
      this.refreshInspectorAndList();
      this.showToast('📐 Hotspot ajustado al rectangulo del prop');
    });

    document.getElementById('st-btn-dup')?.addEventListener('click', () => {
      this.pushUndoSnapshot();
      const copy: SceneObjectDef = {
        ...obj,
        id: `${obj.id}_copy_${Math.floor(10 + Math.random() * 89)}`,
        x: obj.x + 40,
        y: obj.y + 20,
      };
      ROOM_OBJECTS.Z1S3.push(copy);
      this.selection = { kind: 'object', id: copy.id };
      this.refreshInspectorAndList();
    });

    document.getElementById('st-btn-del')?.addEventListener('click', () => {
      this.pushUndoSnapshot();
      const idx = ROOM_OBJECTS.Z1S3.findIndex((o) => o.id === obj.id);
      if (idx >= 0) {
        ROOM_OBJECTS.Z1S3.splice(idx, 1);
        this.selection = null;
        this.refreshInspectorAndList();
        this.showToast(`🗑️ Objeto eliminado: ${obj.id}`);
      }
    });
  }

  private getPlanePresetKey(obj: SceneObjectDef): string {
    if (obj.sortY >= 935) return 'rib';
    if (obj.sortY >= 890) return 'fg_prop';
    if (obj.inSituSeamless && obj.sortY < 300) return 'wall';
    if (obj.inSituSeamless && obj.sortY >= 300) return 'floor';
    if (obj.sortY >= 555 && obj.sortY < 650) return 'wall_prop';
    return 'floor_prop';
  }

  private renderLayerList(): void {
    const listEl = document.getElementById('studio-layer-list');
    const countEl = document.getElementById('studio-list-count');
    if (!listEl || !countEl) return;
    listEl.innerHTML = '';

    if (this.filter === 'hotspots') {
      countEl.textContent = String(ROOM_HOTSPOTS.Z1S3.length);
      for (const h of ROOM_HOTSPOTS.Z1S3) {
        const row = document.createElement('div');
        const isSel = this.selection?.kind === 'hotspot' && this.selection.id === h.id;
        row.className = `studio-list-item ${isSel ? 'selected' : ''}`;
        row.innerHTML = `
          <span class="st-item-badge">🎯</span>
          <div class="st-item-meta">
            <strong>${h.name}</strong>
            <small>${h.id} (${h.x}, ${h.y}, ${h.w}x${h.h})</small>
          </div>
        `;
        row.addEventListener('click', () => {
          this.selection = { kind: 'hotspot', id: h.id };
          this.focusCameraOnX(h.x + h.w * 0.5);
          this.refreshInspectorAndList();
        });
        listEl.appendChild(row);
      }
      return;
    }

    if (this.filter === 'characters') {
      countEl.textContent = '2';
      for (const cid of ['smoothface', 'cap_dread'] as const) {
        const c = cid === 'smoothface' ? this.host.player : this.host.npcs.cap_dread;
        const row = document.createElement('div');
        const isSel = this.selection?.kind === 'character' && this.selection.id === cid;
        row.className = `studio-list-item ${isSel ? 'selected' : ''}`;
        row.innerHTML = `
          <span class="st-item-badge">👤</span>
          <div class="st-item-meta">
            <strong>${cid === 'smoothface' ? 'Mr. Smoothface' : 'Captain Dread'}</strong>
            <small>Spawn (${Math.round(c.x)}, ${Math.round(c.y)})</small>
          </div>
        `;
        row.addEventListener('click', () => {
          this.selection = { kind: 'character', id: cid };
          this.focusCameraOnX(c.x);
          this.refreshInspectorAndList();
        });
        listEl.appendChild(row);
      }
      return;
    }

    const objs = ROOM_OBJECTS.Z1S3.filter((o) =>
      this.filter === 'all' ? true : this.classifyObjectLayer(o) === this.filter
    );
    countEl.textContent = String(objs.length);

    for (const o of [...objs].sort((a, b) => b.sortY - a.sortY)) {
      const row = document.createElement('div');
      const isSel = this.selection?.kind === 'object' && this.selection.id === o.id;
      const isHidden = this.hiddenObjectIds.has(o.id);
      row.className = `studio-list-item ${isSel ? 'selected' : ''} ${isHidden ? 'muted' : ''}`;
      const roleIcon = o.hotspotId ? '🎯' : o.inSituSeamless ? '🧱' : '🖼️';
      row.innerHTML = `
        <span class="st-item-badge" title="${o.hotspotId ? 'Interactuable' : 'Fondo'}">${roleIcon}</span>
        <div class="st-item-meta">
          <strong>${o.id.replace('z1s3.', '')}</strong>
          <small>x:${o.x} y:${o.y} (${o.w}x${o.h}) · z:${o.sortY}</small>
        </div>
        <button class="st-eye-btn" title="Ocultar/Mostrar temporalmente">${isHidden ? '🚫' : '👁️'}</button>
      `;
      row.addEventListener('click', (ev) => {
        if ((ev.target as HTMLElement).classList.contains('st-eye-btn')) {
          if (this.hiddenObjectIds.has(o.id)) {
            this.hiddenObjectIds.delete(o.id);
          } else {
            this.hiddenObjectIds.add(o.id);
          }
          this.refreshInspectorAndList();
          return;
        }
        this.selection = { kind: 'object', id: o.id };
        this.focusCameraOnX(o.x + o.w * 0.5);
        this.refreshInspectorAndList();
      });
      listEl.appendChild(row);
    }
  }

  private focusCameraOnX(worldX: number): void {
    const maxCam = Math.max(0, this.host.getRoomWidth() - 1600);
    this.host.cameraX = Math.max(0, Math.min(maxCam, Math.round(worldX - 650)));
    const camSlider = document.getElementById('studio-cam-slider') as HTMLInputElement | null;
    const camVal = document.getElementById('studio-cam-val');
    if (camSlider) camSlider.value = String(this.host.cameraX);
    if (camVal) camVal.textContent = String(this.host.cameraX);
  }

  public async saveOfficialCoordinates(): Promise<void> {
    const payload = serializeZ1S3OfficialLayout(
      Math.round(this.host.player.x),
      Math.round(this.host.player.y),
      this.host.player.facing,
      Math.round(this.host.npcs.cap_dread.x),
      Math.round(this.host.npcs.cap_dread.y),
      this.host.npcs.cap_dread.facing
    );

    // 1. Always persist in localStorage immediately
    try {
      localStorage.setItem('moonstorm_z1s3_official_layout_v1', JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }

    // 2. Send to Vite / Studio backend server to write official files on disk
    try {
      const resp = await fetch('/api/save-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload, null, 2),
      });
      if (resp.ok) {
        this.showToast('✅ Coordenadas oficiales guardadas en WorldData.ts y layout/z1s3.layout.json!');
        return;
      }
    } catch {
      // Fallback if running from static file://
    }

    this.showToast('💾 Guardado en navegador (localStorage).');
  }

  private showToast(msg: string): void {
    const el = document.getElementById('studio-toast');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    window.clearTimeout((el as unknown as { _t?: number })._t);
    (el as unknown as { _t?: number })._t = window.setTimeout(() => {
      el.style.display = 'none';
    }, 3200);
  }
}
