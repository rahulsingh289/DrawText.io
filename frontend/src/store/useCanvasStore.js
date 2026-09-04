import { create } from 'zustand';
import { api } from '../services/api';

export const PEN_PRESETS = [
  { id: 'pen_fine', name: 'Precision Pen', tool: 'pen', size: 3, opacity: 1, type: 'fountain' },
  { id: 'pen_medium', name: 'Ballpoint', tool: 'pen', size: 5, opacity: 1, type: 'ballpoint' },
  { id: 'pen_marker', name: 'Marker', tool: 'pen', size: 10, opacity: 0.9, type: 'marker' },
  { id: 'pen_neon', name: 'Neon Glow', tool: 'pen', size: 6, opacity: 1, type: 'neon' },
  { id: 'pen_pencil', name: 'Pencil', tool: 'pen', size: 2, opacity: 0.85, type: 'pencil' },
  { id: 'pen_highlighter', name: 'Highlighter', tool: 'highlighter', size: 24, opacity: 0.4, type: 'highlighter' },
  { id: 'tool_eraser', name: 'Smart Eraser', tool: 'eraser', size: 24, opacity: 1, type: 'eraser' },
  { id: 'tool_laser', name: 'Laser Pointer', tool: 'laser', size: 8, opacity: 1, type: 'laser' },
];

export const PALETTE_COLORS = [
  '#ffffff',
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#818cf8',
  '#c084fc',
  '#f472b6',
  '#94a3b8',
  '#0f172a',
];

export const DEFAULT_PRESET_COLORS = {
  pen_fine: '#38bdf8',
  pen_medium: '#ffffff',
  pen_marker: '#fb923c',
  pen_neon: '#4ade80',
  pen_pencil: '#94a3b8',
  pen_highlighter: '#facc15',
  tool_eraser: '#f43f5e',
  tool_laser: '#f43f5e',
};

export const STICKY_COLORS = [
  '#fef08a', // Pastel Yellow
  '#bae6fd', // Pastel Sky
  '#fecdd3', // Pastel Rose
  '#bbf7d0', // Pastel Mint
  '#e9d5ff', // Pastel Lavender
  '#fed7aa', // Pastel Peach
];

export const useCanvasStore = create((set, get) => ({
  // Viewport transformation
  stagePos: { x: 0, y: 0 },
  stageScale: 1,
  
  // Active Tool state
  activeTool: 'pen', // 'pen', 'highlighter', 'eraser', 'laser', 'hand', 'lasso_rect', 'lasso_free', 'rect', 'circle', 'triangle', 'diamond', 'star', 'arrow', 'line', 'capsule', 'cylinder', 'cloud', 'sticky', 'text', 'formula', 'audio'
  activePresetId: 'pen_fine',
  activeShapeType: 'rect', // 'rect', 'circle', 'triangle', 'diamond', 'star', 'arrow', 'line', 'capsule', 'cylinder', 'cloud', 'sticky'
  activeLassoType: 'lasso_rect', // 'lasso_rect' or 'lasso_free'
  currentColor: '#38bdf8',
  currentSize: 4,
  currentOpacity: 1,

  // Excalidraw & Draw.io Diagramming Settings
  strokeStyle: 'solid', // 'solid', 'dashed', 'dotted'
  strokeRoughness: 'clean', // 'clean' (crisp CAD) | 'sketch' (Excalidraw hand-drawn organic)
  arrowHead: 'end', // 'none', 'end', 'both'
  stickyColor: '#fef08a',

  // Quick favorite color slots (3 fast switch wells)
  quickColorSlots: ['#ffffff', '#38bdf8', '#fb923c'],

  // Per-tool remembered colors
  presetColors: { ...DEFAULT_PRESET_COLORS },

  // Selected Elements (for Lasso / Multi-select)
  selectedElementIds: [],

  // Canvas elements array
  elements: [],
  history: [[]],
  historyStep: 0,

  // Background Settings
  backgroundSettings: {
    template: 'grid', // 'blank', 'grid', 'dots', 'ruled'
    backgroundColor: '#12141c',
    gridColor: '#262a3b',
    spacing: 'medium', // 'small' (20px), 'medium' (36px), 'large' (54px)
  },

  // Pen & Tool settings
  eraserSize: 24,
  shapeFill: false, // whether shapes have translucent fill
  inkMode: 'permanent', // 'permanent' (stays forever) | 'disappearing' (temporary live hover mark)

  // Modals & Floating Popovers
  isBackgroundPopoverOpen: false,
  isFormulaModalOpen: false,
  isAudioRecorderOpen: false,
  isShareModalOpen: false,

  // Collaborators live state
  collaborators: [], // { id, name, position, color }
  laserPoints: [], // Temporary live laser points

  // Actions
  setStagePos: (pos) => set({ stagePos: pos }),
  setStageScale: (scale) => set({ stageScale: Math.min(Math.max(0.2, scale), 4.0) }),
  
  zoomIn: () => set((state) => ({ stageScale: Math.min(4.0, state.stageScale * 1.2) })),
  zoomOut: () => set((state) => ({ stageScale: Math.max(0.2, state.stageScale / 1.2) })),
  resetZoom: () => set({ stageScale: 1, stagePos: { x: 0, y: 0 } }),

  setStrokeStyle: (style) => set({ strokeStyle: style }),
  setStrokeRoughness: (roughness) => set({ strokeRoughness: roughness }),
  setArrowHead: (head) => set({ arrowHead: head }),
  setStickyColor: (color) => set({ stickyColor: color }),


  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },

  setActivePreset: (presetId) => {
    const preset = PEN_PRESETS.find((p) => p.id === presetId);
    const { presetColors } = get();
    const toolColor = presetColors[presetId] || '#ffffff';

    if (preset) {
      set({
        activePresetId: presetId,
        activeTool: preset.tool,
        currentColor: toolColor,
        currentSize: preset.size,
        currentOpacity: preset.opacity,
      });
    }
  },

  setCurrentColor: (color) => {
    const { activePresetId, presetColors, selectedElementIds, quickColorSlots } = get();
    const updatedPresetColors = { ...presetColors, [activePresetId]: color };
    
    // Auto-update quick color slots if not already in them
    let updatedSlots = [...quickColorSlots];
    if (!updatedSlots.includes(color)) {
      updatedSlots = [color, updatedSlots[0], updatedSlots[1]];
    }

    set({
      currentColor: color,
      presetColors: updatedPresetColors,
      quickColorSlots: updatedSlots,
    });

    // If elements are selected, recolor them as well
    if (selectedElementIds.length > 0) {
      get().recolorSelectedElements(color);
    }
  },

  setActiveShapeType: (shapeType) => set({ activeShapeType: shapeType, activeTool: shapeType }),
  setActiveLassoType: (lassoType) => set({ activeLassoType: lassoType, activeTool: lassoType }),

  setCurrentSize: (size) => {
    set({ currentSize: size });
    const { selectedElementIds } = get();
    if (selectedElementIds.length > 0) {
      const { elements, history, historyStep } = get();
      const newElements = elements.map((el) =>
        selectedElementIds.includes(el.id) ? { ...el, size } : el
      );
      set({ elements: newElements });
    }
  },

  setCurrentOpacity: (opacity) => set({ currentOpacity: opacity }),
  setEraserSize: (size) => set({ eraserSize: size }),
  setShapeFill: (fill) => set({ shapeFill: fill }),
  setInkMode: (mode) => set({ inkMode: mode }),
  toggleInkMode: () => set((state) => ({ inkMode: state.inkMode === 'permanent' ? 'disappearing' : 'permanent' })),

  // Selection Actions
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  clearSelection: () => set({ selectedElementIds: [] }),
  
  moveSelectedElements: (dx, dy) => {
    const { elements, selectedElementIds } = get();
    if (!selectedElementIds.length) return;
    const newElements = elements.map((el) => {
      if (!selectedElementIds.includes(el.id)) return el;
      return {
        ...el,
        x: (el.x || 0) + dx,
        y: (el.y || 0) + dy,
      };
    });
    set({ elements: newElements });
  },

  scaleSelectedElements: (scaleFactor, originX, originY) => {
    const { elements, selectedElementIds, history, historyStep } = get();
    if (!selectedElementIds.length) return;

    let ox = originX;
    let oy = originY;
    if (ox === undefined || oy === undefined) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      elements.filter((el) => selectedElementIds.includes(el.id)).forEach((el) => {
        const elX = el.x || 0;
        const elY = el.y || 0;
        const w = el.width || 100;
        const h = el.height || 50;
        minX = Math.min(minX, elX);
        maxX = Math.max(maxX, elX + w);
        minY = Math.min(minY, elY);
        maxY = Math.max(maxY, elY + h);
      });
      ox = (minX + maxX) / 2;
      oy = (minY + maxY) / 2;
    }

    const newElements = elements.map((el) => {
      if (!selectedElementIds.includes(el.id)) return el;

      const elX = el.x || 0;
      const elY = el.y || 0;
      const newX = ox + (elX - ox) * scaleFactor;
      const newY = oy + (elY - oy) * scaleFactor;

      if (el.points && el.points.length > 0) {
        let scaledPoints = [];
        if (typeof el.points[0] === 'number') {
          scaledPoints = el.points.map((v) => v * scaleFactor);
        } else {
          scaledPoints = el.points.map(([px, py, p]) => [px * scaleFactor, py * scaleFactor, p]);
        }
        return {
          ...el,
          x: newX,
          y: newY,
          points: scaledPoints,
          pathData: null,
          size: Math.max(1, (el.size || 4) * scaleFactor),
        };
      }

      if (el.type === 'text') {
        return {
          ...el,
          x: newX,
          y: newY,
          fontSize: Math.max(10, Math.round((el.fontSize || 20) * scaleFactor)),
        };
      }

      return {
        ...el,
        x: newX,
        y: newY,
        width: Math.max(10, (el.width || 50) * scaleFactor),
        height: Math.max(10, (el.height || 50) * scaleFactor),
        size: Math.max(1, (el.size || 4) * scaleFactor),
      };
    });

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyStep: newHistory.length - 1 });
  },

  rotateSelectedElements: (angleDeg, originX, originY) => {
    const { elements, selectedElementIds, history, historyStep } = get();
    if (!selectedElementIds.length) return;

    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let ox = originX;
    let oy = originY;
    if (ox === undefined || oy === undefined) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      elements.filter((el) => selectedElementIds.includes(el.id)).forEach((el) => {
        const elX = el.x || 0;
        const elY = el.y || 0;
        const w = el.width || 100;
        const h = el.height || 50;
        minX = Math.min(minX, elX);
        maxX = Math.max(maxX, elX + w);
        minY = Math.min(minY, elY);
        maxY = Math.max(maxY, elY + h);
      });
      ox = (minX + maxX) / 2;
      oy = (minY + maxY) / 2;
    }

    const newElements = elements.map((el) => {
      if (!selectedElementIds.includes(el.id)) return el;

      const elX = el.x || 0;
      const elY = el.y || 0;
      const dx = elX - ox;
      const dy = elY - oy;
      const newX = ox + dx * cos - dy * sin;
      const newY = oy + dx * sin + dy * cos;

      if (el.points && el.points.length > 0) {
        let rotatedPoints = [];
        if (typeof el.points[0] === 'number') {
          for (let i = 0; i < el.points.length; i += 2) {
            const px = el.points[i];
            const py = el.points[i + 1];
            const rx = px * cos - py * sin;
            const ry = px * sin + py * cos;
            rotatedPoints.push(rx, ry);
          }
        } else {
          rotatedPoints = el.points.map(([px, py, p]) => [
            px * cos - py * sin,
            px * sin + py * cos,
            p,
          ]);
        }
        return {
          ...el,
          x: newX,
          y: newY,
          points: rotatedPoints,
          pathData: null,
        };
      }

      return {
        ...el,
        x: newX,
        y: newY,
        rotation: ((el.rotation || 0) + angleDeg) % 360,
      };
    });

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyStep: newHistory.length - 1 });
  },

  commitMoveSelected: () => {
    const { elements, history, historyStep } = get();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(elements);
    set({ history: newHistory, historyStep: newHistory.length - 1 });
  },

  recolorSelectedElements: (color) => {
    const { elements, selectedElementIds, history, historyStep } = get();
    if (!selectedElementIds.length) return;
    const newElements = elements.map((el) =>
      selectedElementIds.includes(el.id)
        ? { ...el, color, fill: el.fill ? `${color}25` : el.type === 'text' ? color : undefined }
        : el
    );
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyStep: newHistory.length - 1 });
  },

  duplicateSelectedElements: () => {
    const { elements, selectedElementIds, history, historyStep } = get();
    if (!selectedElementIds.length) return;
    const newClones = [];
    const newSelectedIds = [];

    elements.forEach((el) => {
      if (selectedElementIds.includes(el.id)) {
        const newId = `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        newSelectedIds.push(newId);
        newClones.push({
          ...el,
          id: newId,
          x: (el.x || 0) + 35,
          y: (el.y || 0) + 35,
        });
      }
    });

    const newElements = [...elements, ...newClones];
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    set({
      elements: newElements,
      selectedElementIds: newSelectedIds,
      history: newHistory,
      historyStep: newHistory.length - 1,
    });
  },

  // Align Selected Elements (Draw.io / Figma Style)
  alignSelectedElements: (alignment) => {
    const { elements, selectedElementIds, history, historyStep } = get();
    if (selectedElementIds.length < 2) return;

    const selected = elements.filter((el) => selectedElementIds.includes(el.id));
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    selected.forEach((el) => {
      const x = el.x || 0;
      const y = el.y || 0;
      const w = el.width || 100;
      const h = el.height || 50;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + w);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + h);
    });

    const newElements = elements.map((el) => {
      if (!selectedElementIds.includes(el.id)) return el;
      const w = el.width || 100;
      const h = el.height || 50;
      let newX = el.x || 0;
      let newY = el.y || 0;

      if (alignment === 'left') newX = minX;
      else if (alignment === 'center') newX = minX + (maxX - minX) / 2 - w / 2;
      else if (alignment === 'right') newX = maxX - w;
      else if (alignment === 'top') newY = minY;
      else if (alignment === 'middle') newY = minY + (maxY - minY) / 2 - h / 2;
      else if (alignment === 'bottom') newY = maxY - h;

      return { ...el, x: newX, y: newY };
    });

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyStep: newHistory.length - 1 });
  },

  // Distribute Selected Elements evenly
  distributeSelectedElements: (axis) => {
    const { elements, selectedElementIds, history, historyStep } = get();
    if (selectedElementIds.length < 3) return;

    const selected = elements
      .filter((el) => selectedElementIds.includes(el.id))
      .sort((a, b) => (axis === 'horizontal' ? (a.x || 0) - (b.x || 0) : (a.y || 0) - (b.y || 0)));

    const first = selected[0];
    const last = selected[selected.length - 1];

    if (axis === 'horizontal') {
      const totalSpan = (last.x || 0) - (first.x || 0);
      const step = totalSpan / (selected.length - 1);
      const posMap = new Map();
      selected.forEach((el, idx) => {
        posMap.set(el.id, (first.x || 0) + idx * step);
      });
      const newElements = elements.map((el) =>
        posMap.has(el.id) ? { ...el, x: posMap.get(el.id) } : el
      );
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newElements);
      set({ elements: newElements, history: newHistory, historyStep: newHistory.length - 1 });
    } else {
      const totalSpan = (last.y || 0) - (first.y || 0);
      const step = totalSpan / (selected.length - 1);
      const posMap = new Map();
      selected.forEach((el, idx) => {
        posMap.set(el.id, (first.y || 0) + idx * step);
      });
      const newElements = elements.map((el) =>
        posMap.has(el.id) ? { ...el, y: posMap.get(el.id) } : el
      );
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newElements);
      set({ elements: newElements, history: newHistory, historyStep: newHistory.length - 1 });
    }
  },

  // Z-Index Layer Reordering (Bring to Front, Send to Back)
  reorderSelectedElements: (action) => {
    const { elements, selectedElementIds, history, historyStep } = get();
    if (!selectedElementIds.length) return;

    const selected = elements.filter((el) => selectedElementIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedElementIds.includes(el.id));

    let newElements = [];
    if (action === 'front') {
      newElements = [...unselected, ...selected];
    } else if (action === 'back') {
      newElements = [...selected, ...unselected];
    } else {
      newElements = [...elements];
    }

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyStep: newHistory.length - 1 });
  },

  // Export Diagram Scene as JSON
  exportDiagramJSON: (noteTitle = 'drawtext-diagram') => {
    const { elements, backgroundSettings, stagePos, stageScale } = get();
    const diagramData = {
      type: 'drawtext-diagram',
      version: 1,
      source: 'DrawText Whiteboard Studio',
      timestamp: new Date().toISOString(),
      viewport: { ...stagePos, zoom: stageScale },
      backgroundSettings,
      elements,
    };
    const blob = new Blob([JSON.stringify(diagramData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${noteTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.drawtext.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Import Diagram Scene JSON
  importDiagramJSON: (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!parsed || !Array.isArray(parsed.elements)) {
        throw new Error('Invalid DrawText diagram JSON structure');
      }
      const { history, historyStep } = get();
      const newElements = parsed.elements;
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newElements);

      set({
        elements: newElements,
        history: newHistory,
        historyStep: newHistory.length - 1,
        selectedElementIds: [],
        ...(parsed.backgroundSettings ? { backgroundSettings: parsed.backgroundSettings } : {}),
        ...(parsed.viewport ? { stagePos: { x: parsed.viewport.x || 0, y: parsed.viewport.y || 0 }, stageScale: parsed.viewport.zoom || 1 } : {}),
      });
      return { success: true, count: newElements.length };
    } catch (err) {
      console.error('Failed to import diagram JSON:', err);
      return { success: false, error: err.message };
    }
  },

  deleteSelectedElements: () => {
    const { elements, selectedElementIds, history, historyStep } = get();
    if (!selectedElementIds.length) return;
    const newElements = elements.filter((el) => !selectedElementIds.includes(el.id));
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    set({
      elements: newElements,
      selectedElementIds: [],
      history: newHistory,
      historyStep: newHistory.length - 1,
    });
  },


  setBackgroundSettings: (settings) =>
    set((state) => ({
      backgroundSettings: { ...state.backgroundSettings, ...settings },
    })),

  setBackgroundPopoverOpen: (open) => set({ isBackgroundPopoverOpen: open }),
  setFormulaModalOpen: (open) => set({ isFormulaModalOpen: open }),
  setAudioRecorderOpen: (open) => set({ isAudioRecorderOpen: open }),
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),

  // Elements & History Mutations
  setElements: (elements) => set({ elements }),

  addElement: (element) => {
    const { elements, history, historyStep } = get();
    const newElements = [...elements, element];
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);

    set({
      elements: newElements,
      history: newHistory,
      historyStep: newHistory.length - 1,
    });
  },

  updateElement: (id, updates) => {
    const { elements, history, historyStep } = get();
    const newElements = elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);

    set({
      elements: newElements,
      history: newHistory,
      historyStep: newHistory.length - 1,
    });
  },

  deleteElement: (id) => {
    const { elements, history, historyStep } = get();
    const newElements = elements.filter((el) => el.id !== id);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);

    set({
      elements: newElements,
      history: newHistory,
      historyStep: newHistory.length - 1,
    });
  },

  undo: () => {
    const { historyStep, history } = get();
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      set({
        historyStep: prevStep,
        elements: history[prevStep],
      });
    }
  },

  redo: () => {
    const { historyStep, history } = get();
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      set({
        historyStep: nextStep,
        elements: history[nextStep],
      });
    }
  },

  clearBoard: () => {
    const { history, historyStep } = get();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([]);
    set({
      elements: [],
      history: newHistory,
      historyStep: newHistory.length - 1,
    });
  },

  // Save Canvas state to server
  saveCanvasState: async (noteId, thumbnailDataUrl) => {
    const { elements, stagePos, stageScale } = get();
    try {
      await api.put(`/canvas/${noteId}`, {
        elements,
        viewport: { x: stagePos.x, y: stagePos.y, zoom: stageScale },
        thumbnail: thumbnailDataUrl || '',
      });
    } catch (err) {
      // Local storage fallback
      try {
        localStorage.setItem(`canvas_${noteId}`, JSON.stringify({ elements, stagePos, stageScale }));
      } catch (e) {}
    }
  },

  // Load Canvas state from server
  loadCanvasState: async (noteId) => {
    try {
      const res = await api.get(`/canvas/${noteId}`);
      if (res.data?.success && res.data.data) {
        const { elements, viewport } = res.data.data;
        const loadedElements = elements || [];
        set({
          elements: loadedElements,
          history: [loadedElements],
          historyStep: 0,
          stagePos: { x: viewport?.x || 0, y: viewport?.y || 0 },
          stageScale: viewport?.zoom || 1,
        });
        return;
      }
    } catch (err) {
      // Check local storage fallback
      const saved = localStorage.getItem(`canvas_${noteId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          set({
            elements: parsed.elements || [],
            history: [parsed.elements || []],
            historyStep: 0,
            stagePos: parsed.stagePos || { x: 0, y: 0 },
            stageScale: parsed.stageScale || 1,
          });
          return;
        } catch (e) {}
      }
    }

    // Default blank initial elements
    set({
      elements: [],
      history: [[]],
      historyStep: 0,
      stagePos: { x: 0, y: 0 },
      stageScale: 1,
    });
  },
}));
