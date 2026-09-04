import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Path } from 'react-konva';
import getStroke from 'perfect-freehand';
import { useCanvasStore } from '../../store/useCanvasStore';
import { BackgroundLayer } from './BackgroundLayer';
import { useNotesStore } from '../../store/useNotesStore';
import { 
  Play, 
  Pause, 
  Sigma, 
  Copy, 
  Trash2, 
  X, 
  Move, 
  Plus, 
  Minus, 
  RotateCcw, 
  RotateCw, 
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  Layers,
  ArrowLeftRight,
  StickyNote
} from 'lucide-react';
import katex from 'katex';

// Convert perfect-freehand points outline to smooth SVG path string
function getSvgPathFromStroke(stroke) {
  if (!stroke || !stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );
  d.push('Z');
  return d.join(' ');
}

// Compute perfect-freehand stroke options based on pen preset
function generateStrokePath(rawPoints, penType, size = 4) {
  if (!rawPoints || rawPoints.length < 2) return '';
  
  let formattedPoints = [];
  if (typeof rawPoints[0] === 'number') {
    for (let i = 0; i < rawPoints.length; i += 2) {
      formattedPoints.push([rawPoints[i], rawPoints[i + 1], 0.5]);
    }
  } else {
    formattedPoints = rawPoints;
  }

  let options = {
    size: size,
    thinning: 0.1,
    smoothing: 0.6,
    streamline: 0.5,
    easing: (t) => t,
    start: { taper: 0, cap: true },
    end: { taper: 0, cap: true },
  };

  if (penType === 'fountain' || penType === 'pen_fine') {
    options = {
      size: Math.max(2, size),
      thinning: 0.65,
      smoothing: 0.55,
      streamline: 0.55,
      easing: (t) => t * (2 - t),
      start: { taper: 8, cap: true },
      end: { taper: 8, cap: true },
    };
  } else if (penType === 'marker' || penType === 'pen_marker') {
    options = {
      size: Math.max(6, size),
      thinning: 0.2,
      smoothing: 0.7,
      streamline: 0.6,
      easing: (t) => t,
      start: { taper: 2, cap: true },
      end: { taper: 2, cap: true },
    };
  } else if (penType === 'neon' || penType === 'pen_neon') {
    options = {
      size: Math.max(4, size),
      thinning: 0.1,
      smoothing: 0.65,
      streamline: 0.55,
      easing: (t) => t,
      start: { taper: 4, cap: true },
      end: { taper: 4, cap: true },
    };
  } else if (penType === 'pencil' || penType === 'pen_pencil') {
    options = {
      size: Math.max(1.5, size * 0.7),
      thinning: 0.35,
      smoothing: 0.45,
      streamline: 0.4,
      easing: (t) => t,
      start: { taper: 4, cap: true },
      end: { taper: 4, cap: true },
    };
  } else if (penType === 'highlighter' || penType === 'pen_highlighter') {
    options = {
      size: Math.max(16, size * 1.3),
      thinning: 0,
      smoothing: 0.8,
      streamline: 0.75,
      easing: (t) => t,
      start: { taper: 0, cap: false },
      end: { taper: 0, cap: false },
    };
  }

  const strokeOutline = getStroke(formattedPoints, options);
  return getSvgPathFromStroke(strokeOutline);
}

// Distance from point to line segment squared
function distToSegmentSquared(p, v, w) {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return (p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2;
}

// Check if a point is near a polyline / stroke points
function isPointNearStroke(point, rawPoints, threshold) {
  const threshSq = threshold * threshold;
  if (!rawPoints || rawPoints.length < 2) return false;

  if (typeof rawPoints[0] === 'number') {
    for (let i = 0; i < rawPoints.length - 2; i += 2) {
      const v = { x: rawPoints[i], y: rawPoints[i + 1] };
      const w = { x: rawPoints[i + 2], y: rawPoints[i + 3] };
      if (distToSegmentSquared(point, v, w) <= threshSq) return true;
    }
  } else {
    for (let i = 0; i < rawPoints.length - 1; i++) {
      const v = { x: rawPoints[i][0], y: rawPoints[i][1] };
      const w = { x: rawPoints[i + 1][0], y: rawPoints[i + 1][1] };
      if (distToSegmentSquared(point, v, w) <= threshSq) return true;
    }
  }
  return false;
}

// Ray-casting point in polygon check
function isPointInPolygon(p, polygonPoints) {
  let inside = false;
  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = polygonPoints[i][0], yi = polygonPoints[i][1];
    const xj = polygonPoints[j][0], yj = polygonPoints[j][1];
    const intersect = ((yi > p.y) !== (yj > p.y)) && (p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Calculate bounding box of an element (incorporating el.x and el.y)
function getElementBounds(el) {
  const ox = el.x || 0;
  const oy = el.y || 0;

  if (el.points && el.points.length > 0) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    if (typeof el.points[0] === 'number') {
      for (let i = 0; i < el.points.length; i += 2) {
        minX = Math.min(minX, el.points[i]);
        maxX = Math.max(maxX, el.points[i]);
        minY = Math.min(minY, el.points[i + 1]);
        maxY = Math.max(maxY, el.points[i + 1]);
      }
    } else {
      el.points.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    }
    return {
      minX: minX + ox,
      maxX: maxX + ox,
      minY: minY + oy,
      maxY: maxY + oy,
    };
  }

  return {
    minX: ox,
    maxX: ox + (el.width || 100),
    minY: oy,
    maxY: oy + (el.height || 50),
  };
}

// Calculate center point of an element
function getElementCenter(el) {
  const b = getElementBounds(el);
  return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
}

// Geometry helper generators
function getTrianglePoints(w, h) {
  return [w / 2, 0, w, h, 0, h];
}

function getDiamondPoints(w, h) {
  return [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2];
}

function getStarPoints(w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) / 2;
  const innerR = outerR * 0.45;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    pts.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  return pts;
}

export const CanvasStage = ({ stageRef }) => {
  const {
    stagePos,
    setStagePos,
    stageScale,
    setStageScale,
    activeTool,
    setActiveTool,
    activePresetId,
    currentColor,
    currentSize,
    currentOpacity,
    eraserSize = 24,
    shapeFill,
    inkMode = 'permanent',
    strokeStyle = 'solid',
    strokeRoughness = 'clean',
    arrowHead = 'end',
    stickyColor = '#fef08a',
    alignSelectedElements,
    distributeSelectedElements,
    reorderSelectedElements,
    selectedElementIds,
    setSelectedElementIds,
    clearSelection,
    moveSelectedElements,
    scaleSelectedElements,
    rotateSelectedElements,
    commitMoveSelected,
    recolorSelectedElements,
    duplicateSelectedElements,
    deleteSelectedElements,
    elements,
    addElement,
    updateElement,
    deleteElement,
    saveCanvasState,
    loadCanvasState,
    undo,
    redo,
  } = useCanvasStore();

  const { currentNote } = useNotesStore();

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 56,
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [editingStickyId, setEditingStickyId] = useState(null);
  
  // Selection Drag State
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const lastDragPosRef = useRef({ x: 0, y: 0 });


  // Interactive Resizing Handle Drag State
  const [resizingHandle, setResizingHandle] = useState(null);
  const resizeStartRef = useRef(null);

  // Interactive Rotation Handle Drag State
  const [isRotating, setIsRotating] = useState(false);
  const rotateStartRef = useRef(null);

  // Live Disappearing / Hover Ink Strokes
  const [disappearingStrokes, setDisappearingStrokes] = useState([]);
  const animFrameRef = useRef(null);

  // Laser Pointer Live Decaying Trail
  const [laserTrail, setLaserTrail] = useState([]);

  // Smart Eraser Live Cursor Position
  const [eraserPos, setEraserPos] = useState({ x: 0, y: 0, visible: false });
  const erasedDuringDragRef = useRef(new Set());

  // Inline Text Editing State
  const [editingText, setEditingText] = useState(null);
  const textInputRef = useRef(null);

  // Audio memo player state
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const currentAudioRef = useRef(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 56,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
      if (e.shiftKey) {
        setIsShiftPressed(true);
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      // Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          deleteSelectedElements();
        }
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Quick Tool Hotkeys
      if (!e.metaKey && !e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
          case 'h':
            setActiveTool('hand');
            break;
          case 's':
            setActiveTool('lasso_rect');
            break;
          case 'f':
            setActiveTool('lasso_free');
            break;
          case 'p':
            setActiveTool('pen');
            break;
          case 'e':
            setActiveTool('eraser');
            break;
          case 'l':
            setActiveTool('laser');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'r':
            setActiveTool('rect');
            break;
          case 'c':
            setActiveTool('circle');
            break;
          case 'a':
            setActiveTool('arrow');
            break;
          default:
            break;
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') setIsSpacePressed(false);
      if (!e.shiftKey) setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, setActiveTool, selectedElementIds, deleteSelectedElements, clearSelection]);

  // Live Disappearing Ink & Laser Decay Animation Loop
  useEffect(() => {
    const loop = () => {
      const now = performance.now();
      
      // Laser trail decay
      setLaserTrail((prev) => {
        if (!prev.length) return prev;
        const filtered = prev.filter((pt) => now - pt.time < 1100);
        return filtered.length !== prev.length ? filtered : prev;
      });

      // Disappearing Hover Ink decay
      setDisappearingStrokes((prev) => {
        if (!prev.length) return prev;
        const filtered = prev.filter((st) => now - st.createdAt < (st.duration || 1600));
        return filtered.length !== prev.length ? filtered : prev;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Load canvas data when note changes
  useEffect(() => {
    if (currentNote?._id) {
      loadCanvasState(currentNote._id);
    }
  }, [currentNote?._id]);

  // Periodic auto-save
  useEffect(() => {
    if (!currentNote?._id) return;
    const saveTimer = setTimeout(() => {
      if (stageRef?.current) {
        try {
          const thumbnail = stageRef.current.toDataURL({ pixelRatio: 0.3 });
          saveCanvasState(currentNote._id, thumbnail);
        } catch (e) {}
      }
    }, 2000);
    return () => clearTimeout(saveTimer);
  }, [elements, stagePos, stageScale, currentNote?._id]);

  // Wheel Zoom & Pan
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      const scaleBy = 1.05;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      newScale = Math.min(Math.max(0.2, newScale), 4.0);

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setStageScale(newScale);
      setStagePos(newPos);
    } else {
      setStagePos({
        x: stagePos.x - e.evt.deltaX,
        y: stagePos.y - e.evt.deltaY,
      });
    }
  };

  // Convert client stage position to canvas world coordinate
  const getWorldPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    return {
      x: (pos.x - stagePos.x) / stageScale,
      y: (pos.y - stagePos.y) / stageScale,
    };
  }, [stagePos, stageScale]);

  // Compute bounding box for all currently selected elements
  const selectionBoundingBox = useMemo(() => {
    if (!selectedElementIds.length) return null;
    const selectedList = elements.filter((el) => selectedElementIds.includes(el.id));
    if (!selectedList.length) return null;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    selectedList.forEach((el) => {
      const b = getElementBounds(el);
      minX = Math.min(minX, b.minX);
      maxX = Math.max(maxX, b.maxX);
      minY = Math.min(minY, b.minY);
      maxY = Math.max(maxY, b.maxY);
    });

    const padding = 12;
    return {
      x: minX - padding,
      y: minY - padding,
      width: Math.max(30, maxX - minX + padding * 2),
      height: Math.max(30, maxY - minY + padding * 2),
    };
  }, [selectedElementIds, elements]);

  // Smart Eraser Intersection Logic
  const performEraseAt = useCallback(
    (point) => {
      const radius = eraserSize / 2;
      elements.forEach((el) => {
        if (erasedDuringDragRef.current.has(el.id)) return;

        const ox = el.x || 0;
        const oy = el.y || 0;
        const localPoint = { x: point.x - ox, y: point.y - oy };

        let shouldDelete = false;

        if (el.type === 'pen' || el.type === 'highlighter') {
          shouldDelete = isPointNearStroke(localPoint, el.points, radius + (el.size || 4) / 2);
        } else if (['rect', 'circle', 'triangle', 'diamond', 'star'].includes(el.type)) {
          const withinX = localPoint.x >= -radius && localPoint.x <= el.width + radius;
          const withinY = localPoint.y >= -radius && localPoint.y <= el.height + radius;
          shouldDelete = withinX && withinY;
        } else if (el.type === 'line' || el.type === 'arrow') {
          if (el.points && el.points.length >= 4) {
            const v = { x: el.points[0], y: el.points[1] };
            const w = { x: el.points[2], y: el.points[3] };
            shouldDelete = distToSegmentSquared(localPoint, v, w) <= (radius + (el.size || 4) / 2) ** 2;
          }
        } else if (el.type === 'text' || el.type === 'formula' || el.type === 'audio') {
          const w = el.width || 180;
          const h = el.height || 60;
          shouldDelete =
            localPoint.x >= -radius &&
            localPoint.x <= w + radius &&
            localPoint.y >= -radius &&
            localPoint.y <= h + radius;
        }

        if (shouldDelete) {
          erasedDuringDragRef.current.add(el.id);
          deleteElement(el.id);
        }
      });
    },
    [elements, eraserSize, deleteElement]
  );

  // Resize Handle Clicked
  const handleResizeStart = (handleType, e) => {
    e.cancelBubble = true;
    const worldPos = getWorldPos();
    setResizingHandle(handleType);
    resizeStartRef.current = {
      handleType,
      startX: worldPos.x,
      startY: worldPos.y,
      box: selectionBoundingBox,
    };
  };

  // Rotation Handle Clicked
  const handleRotateStart = (e) => {
    e.cancelBubble = true;
    const worldPos = getWorldPos();
    setIsRotating(true);
    const centerX = selectionBoundingBox.x + selectionBoundingBox.width / 2;
    const centerY = selectionBoundingBox.y + selectionBoundingBox.height / 2;
    const initialAngle = Math.atan2(worldPos.y - centerY, worldPos.x - centerX);
    rotateStartRef.current = {
      centerX,
      centerY,
      initialAngle,
      lastAngle: initialAngle,
    };
  };

  // Pointer Down Handler
  const handlePointerDown = (e) => {
    if (activeTool === 'hand' || isSpacePressed || e.evt.button === 1) return;

    const worldPos = getWorldPos();
    const pressure = e.evt.pressure || 0.5;

    // Check if clicking inside active selection box to drag move selected items
    if (selectionBoundingBox && (activeTool.startsWith('lasso') || selectedElementIds.length > 0)) {
      const insideBox =
        worldPos.x >= selectionBoundingBox.x &&
        worldPos.x <= selectionBoundingBox.x + selectionBoundingBox.width &&
        worldPos.y >= selectionBoundingBox.y &&
        worldPos.y <= selectionBoundingBox.y + selectionBoundingBox.height;

      if (insideBox) {
        setIsDraggingSelection(true);
        lastDragPosRef.current = worldPos;
        return;
      }
    }

    if (activeTool === 'text') {
      setEditingText({
        id: `text-${Date.now()}`,
        x: worldPos.x,
        y: worldPos.y,
        text: '',
        fontSize: Math.max(16, currentSize * 4),
        color: currentColor,
        isNew: true,
      });
      return;
    }

    if (activeTool === 'sticky') {
      const newSticky = {
        id: `sticky-${Date.now()}`,
        type: 'sticky',
        x: worldPos.x - 90,
        y: worldPos.y - 90,
        width: 180,
        height: 180,
        color: stickyColor || '#fef08a',
        text: '',
        rotation: (Math.random() * 4) - 2,
      };
      addElement(newSticky);
      setEditingStickyId(newSticky.id);
      return;
    }

    if (activeTool === 'eraser') {
      setIsDrawing(true);
      erasedDuringDragRef.current.clear();
      setEraserPos({ x: worldPos.x, y: worldPos.y, visible: true });
      performEraseAt(worldPos);
      return;
    }

    if (activeTool === 'laser') {
      setIsDrawing(true);
      const newPt = { x: worldPos.x, y: worldPos.y, time: performance.now(), color: currentColor };
      setLaserTrail((prev) => [...prev, newPt]);
      return;
    }

    setIsDrawing(true);

    if (activeTool === 'lasso_rect') {
      clearSelection();
      setCurrentStroke({
        type: 'lasso_rect',
        startX: worldPos.x,
        startY: worldPos.y,
        x: worldPos.x,
        y: worldPos.y,
        width: 0,
        height: 0,
      });
    } else if (activeTool === 'lasso_free') {
      clearSelection();
      setCurrentStroke({
        type: 'lasso_free',
        points: [worldPos.x, worldPos.y],
      });
    } else if (activeTool === 'pen' || activeTool === 'highlighter') {
      const initialPoints = [[worldPos.x, worldPos.y, pressure]];
      const initialPath = generateStrokePath(initialPoints, activePresetId, currentSize);
      setCurrentStroke({
        id: `stroke-${Date.now()}`,
        type: activeTool,
        presetId: activePresetId,
        color: currentColor,
        size: currentSize,
        opacity: activeTool === 'highlighter' ? 0.35 : currentOpacity,
        points: initialPoints,
        pathData: initialPath,
        x: 0,
        y: 0,
        inkMode: inkMode,
      });
    } else if (['rect', 'circle', 'triangle', 'diamond', 'star', 'arrow', 'line', 'capsule', 'cylinder', 'cloud'].includes(activeTool)) {
      setCurrentStroke({
        id: `shape-${Date.now()}`,
        type: activeTool,
        color: currentColor,
        size: currentSize,
        opacity: currentOpacity,
        fill: shapeFill ? `${currentColor}25` : undefined,
        strokeStyle: strokeStyle || 'solid',
        strokeRoughness: strokeRoughness || 'clean',
        arrowHead: arrowHead || 'end',
        startX: worldPos.x,
        startY: worldPos.y,
        x: worldPos.x,
        y: worldPos.y,
        width: 0,
        height: 0,
        points: [worldPos.x, worldPos.y, worldPos.x, worldPos.y],
      });
    }

  };

  // Pointer Move Handler
  const handlePointerMove = (e) => {
    const worldPos = getWorldPos();
    const pressure = e.evt.pressure || 0.5;

    // Handle Interactive Rotation Drag
    if (isRotating && rotateStartRef.current) {
      const { centerX, centerY, lastAngle } = rotateStartRef.current;
      const currentAngle = Math.atan2(worldPos.y - centerY, worldPos.x - centerX);
      let deltaAngle = ((currentAngle - lastAngle) * 180) / Math.PI;

      if (isShiftPressed || e.evt.shiftKey) {
        deltaAngle = Math.round(deltaAngle / 15) * 15;
      }

      if (Math.abs(deltaAngle) >= 0.5) {
        rotateSelectedElements(deltaAngle, centerX, centerY);
        rotateStartRef.current.lastAngle = currentAngle;
      }
      return;
    }

    // Handle Interactive Corner Resize Drag
    if (resizingHandle && resizeStartRef.current) {
      const { box } = resizeStartRef.current;
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      const currentDist = Math.hypot(worldPos.x - centerX, worldPos.y - centerY);
      const startDist = Math.hypot(resizeStartRef.current.startX - centerX, resizeStartRef.current.startY - centerY);
      
      if (startDist > 10) {
        const factor = currentDist / startDist;
        scaleSelectedElements(factor, centerX, centerY);
        resizeStartRef.current.startX = worldPos.x;
        resizeStartRef.current.startY = worldPos.y;
      }
      return;
    }

    // Handle Dragging Selected Elements
    if (isDraggingSelection) {
      const dx = worldPos.x - lastDragPosRef.current.x;
      const dy = worldPos.y - lastDragPosRef.current.y;
      lastDragPosRef.current = worldPos;
      moveSelectedElements(dx, dy);
      return;
    }

    // Update eraser cursor location
    if (activeTool === 'eraser') {
      setEraserPos({ x: worldPos.x, y: worldPos.y, visible: true });
      if (isDrawing) {
        performEraseAt(worldPos);
      }
      return;
    } else {
      if (eraserPos.visible) setEraserPos((p) => ({ ...p, visible: false }));
    }

    if (!isDrawing) return;

    if (activeTool === 'laser') {
      const newPt = { x: worldPos.x, y: worldPos.y, time: performance.now(), color: currentColor };
      setLaserTrail((prev) => [...prev, newPt]);
      return;
    }

    if (!currentStroke) return;

    if (currentStroke.type === 'lasso_rect') {
      const w = worldPos.x - currentStroke.startX;
      const h = worldPos.y - currentStroke.startY;
      setCurrentStroke((prev) => ({
        ...prev,
        x: w < 0 ? prev.startX + w : prev.startX,
        y: h < 0 ? prev.startY + h : prev.startY,
        width: Math.abs(w),
        height: Math.abs(h),
      }));
    } else if (currentStroke.type === 'lasso_free') {
      setCurrentStroke((prev) => ({
        ...prev,
        points: [...prev.points, worldPos.x, worldPos.y],
      }));
    } else if (currentStroke.type === 'pen' || currentStroke.type === 'highlighter') {
      const updatedPoints = [...currentStroke.points, [worldPos.x, worldPos.y, pressure]];
      const updatedPath = generateStrokePath(updatedPoints, currentStroke.presetId, currentStroke.size);
      setCurrentStroke((prev) => ({
        ...prev,
        points: updatedPoints,
        pathData: updatedPath,
      }));
    } else if (['rect', 'circle', 'triangle', 'diamond', 'star'].includes(currentStroke.type)) {
      let w = worldPos.x - currentStroke.startX;
      let h = worldPos.y - currentStroke.startY;
      if (isShiftPressed || e.evt.shiftKey) {
        const side = Math.max(Math.abs(w), Math.abs(h));
        w = w < 0 ? -side : side;
        h = h < 0 ? -side : side;
      }
      setCurrentStroke((prev) => ({
        ...prev,
        x: w < 0 ? prev.startX + w : prev.startX,
        y: h < 0 ? prev.startY + h : prev.startY,
        width: Math.abs(w),
        height: Math.abs(h),
      }));
    } else if (currentStroke.type === 'arrow' || currentStroke.type === 'line') {
      let endX = worldPos.x;
      let endY = worldPos.y;

      if (isShiftPressed || e.evt.shiftKey) {
        const dx = endX - currentStroke.startX;
        const dy = endY - currentStroke.startY;
        const angle = Math.atan2(dy, dx);
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        const dist = Math.hypot(dx, dy);
        endX = currentStroke.startX + dist * Math.cos(snappedAngle);
        endY = currentStroke.startY + dist * Math.sin(snappedAngle);
      }

      setCurrentStroke((prev) => ({
        ...prev,
        points: [prev.startX, prev.startY, endX, endY],
      }));
    }
  };

  // Pointer Up Handler
  const handlePointerUp = () => {
    if (isRotating) {
      setIsRotating(false);
      rotateStartRef.current = null;
      return;
    }

    if (resizingHandle) {
      setResizingHandle(null);
      resizeStartRef.current = null;
      return;
    }

    if (isDraggingSelection) {
      setIsDraggingSelection(false);
      commitMoveSelected();
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'eraser') {
      erasedDuringDragRef.current.clear();
      return;
    }

    if (activeTool === 'laser') return;

    if (currentStroke) {
      // Process Lasso Rect Selection
      if (currentStroke.type === 'lasso_rect') {
        const rx = currentStroke.x;
        const ry = currentStroke.y;
        const rw = currentStroke.width;
        const rh = currentStroke.height;

        if (rw > 5 && rh > 5) {
          const matchedIds = [];
          elements.forEach((el) => {
            const center = getElementCenter(el);
            if (center.x >= rx && center.x <= rx + rw && center.y >= ry && center.y <= ry + rh) {
              matchedIds.push(el.id);
            }
          });
          setSelectedElementIds(matchedIds);
        }
        setCurrentStroke(null);
        return;
      }

      // Process Lasso Freehand Selection
      if (currentStroke.type === 'lasso_free') {
        if (currentStroke.points.length >= 6) {
          const polygon = [];
          for (let i = 0; i < currentStroke.points.length; i += 2) {
            polygon.push([currentStroke.points[i], currentStroke.points[i + 1]]);
          }
          const matchedIds = [];
          elements.forEach((el) => {
            const center = getElementCenter(el);
            if (isPointInPolygon(center, polygon)) {
              matchedIds.push(el.id);
            }
          });
          setSelectedElementIds(matchedIds);
        }
        setCurrentStroke(null);
        return;
      }

      // If Disappearing/Hover Ink mode is active, send to live fading array
      if ((currentStroke.type === 'pen' || currentStroke.type === 'highlighter') && currentStroke.inkMode === 'disappearing') {
        if (currentStroke.points.length > 0) {
          const finalPath = currentStroke.pathData || generateStrokePath(currentStroke.points, currentStroke.presetId, currentStroke.size);
          setDisappearingStrokes((prev) => [
            ...prev,
            {
              ...currentStroke,
              pathData: finalPath,
              createdAt: performance.now(),
              duration: 1600,
            },
          ]);
        }
        setCurrentStroke(null);
        return;
      }

      // Finalize Permanent Drawing Strokes
      if (currentStroke.type === 'pen' || currentStroke.type === 'highlighter') {
        if (currentStroke.points.length > 0) {
          const finalPath = currentStroke.pathData || generateStrokePath(currentStroke.points, currentStroke.presetId, currentStroke.size);
          addElement({
            ...currentStroke,
            pathData: finalPath,
            x: 0,
            y: 0,
          });
        }
      } else if (['rect', 'circle', 'triangle', 'diamond', 'star', 'arrow', 'line'].includes(currentStroke.type)) {
        if (
          (currentStroke.width && currentStroke.width > 2) ||
          (currentStroke.height && currentStroke.height > 2) ||
          (currentStroke.points && Math.hypot(currentStroke.points[2] - currentStroke.points[0], currentStroke.points[3] - currentStroke.points[1]) > 4)
        ) {
          addElement({
            ...currentStroke,
            x: currentStroke.x || 0,
            y: currentStroke.y || 0,
          });
        }
      }
      setCurrentStroke(null);
    }
  };

  // Double click on existing text element to edit
  const handleDoubleClickText = (el) => {
    setEditingText({
      id: el.id,
      x: el.x || 0,
      y: el.y || 0,
      text: el.text || '',
      fontSize: el.fontSize || 20,
      color: el.fill || '#f1f5f9',
      isNew: false,
    });
  };

  // Commit text editing
  const handleSaveText = () => {
    if (!editingText) return;
    if (editingText.text.trim()) {
      if (editingText.isNew) {
        addElement({
          id: editingText.id,
          type: 'text',
          text: editingText.text.trim(),
          x: editingText.x,
          y: editingText.y,
          fontSize: editingText.fontSize,
          fill: editingText.color,
        });
      } else {
        updateElement(editingText.id, {
          text: editingText.text.trim(),
          fontSize: editingText.fontSize,
          fill: editingText.color,
        });
      }
    } else if (!editingText.isNew) {
      deleteElement(editingText.id);
    }
    setEditingText(null);
  };

  // Audio memo player helper
  const handleToggleAudioPlay = (element) => {
    if (playingAudioId === element.id) {
      currentAudioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (element.audioUrl) {
        const audio = new Audio(element.audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => setPlayingAudioId(null);
        audio.play();
        setPlayingAudioId(element.id);
      }
    }
  };

  const isDraggableStage = activeTool === 'hand' || isSpacePressed;

  return (
    <div
      className={`w-full h-full relative overflow-hidden canvas-container ${
        activeTool === 'hand' || isSpacePressed
          ? 'tool-hand cursor-grab active:cursor-grabbing'
          : activeTool === 'eraser'
          ? 'cursor-none'
          : activeTool === 'laser'
          ? 'cursor-crosshair'
          : activeTool === 'text'
          ? 'cursor-text'
          : activeTool.startsWith('lasso')
          ? 'cursor-crosshair'
          : 'cursor-crosshair'
      }`}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={isDraggableStage}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onWheel={handleWheel}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Dynamic Paper & Grid Background Layer */}
        <BackgroundLayer width={dimensions.width} height={dimensions.height} />

        {/* Vector Strokes & Elements Layer */}
        <Layer>
          {elements.map((el) => {
            const isSelected = selectedElementIds.includes(el.id);
            const ox = el.x || 0;
            const oy = el.y || 0;

            // Freehand Pen / Highlighter / Neon
            if (el.type === 'pen' || el.type === 'highlighter') {
              const pathData = el.pathData || generateStrokePath(el.points, el.presetId, el.size);
              const isNeon = el.presetId === 'pen_neon' || el.type === 'neon';

              if (pathData) {
                return (
                  <Path
                    key={el.id}
                    id={el.id}
                    x={ox}
                    y={oy}
                    rotation={el.rotation || 0}
                    data={pathData}
                    fill={el.color}
                    opacity={el.opacity || 1}
                    globalCompositeOperation={el.type === 'highlighter' ? 'screen' : 'source-over'}
                    shadowColor={isNeon ? el.color : isSelected ? '#6366f1' : undefined}
                    shadowBlur={isNeon ? 14 : isSelected ? 8 : 0}
                  />
                );
              }
              const dashArray = el.strokeStyle === 'dashed' ? [8, 8] : el.strokeStyle === 'dotted' ? [3, 6] : undefined;
              return (
                <Line
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  rotation={el.rotation || 0}
                  points={Array.isArray(el.points[0]) ? el.points.flatMap(([x, y]) => [x, y]) : el.points}
                  stroke={el.color}
                  strokeWidth={el.size}
                  opacity={el.opacity || 1}
                  tension={0.45}
                  lineCap="round"
                  lineJoin="round"
                  dash={dashArray}
                  shadowColor={isNeon ? el.color : isSelected ? '#6366f1' : undefined}
                  shadowBlur={isNeon ? 14 : isSelected ? 8 : 0}
                />
              );
            }

            const dashArray = el.strokeStyle === 'dashed' ? [8, 8] : el.strokeStyle === 'dotted' ? [3, 6] : undefined;

            // Rectangle
            if (el.type === 'rect') {
              return (
                <Rect
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  rotation={el.rotation || 0}
                  width={el.width}
                  height={el.height}
                  stroke={el.color}
                  strokeWidth={el.size}
                  fill={el.fill || undefined}
                  opacity={el.opacity || 1}
                  dash={dashArray}
                  cornerRadius={8}
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Terminator Capsule (Pill)
            if (el.type === 'capsule') {
              return (
                <Rect
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  rotation={el.rotation || 0}
                  width={el.width}
                  height={el.height}
                  stroke={el.color}
                  strokeWidth={el.size}
                  fill={el.fill || undefined}
                  opacity={el.opacity || 1}
                  dash={dashArray}
                  cornerRadius={Math.min(el.width, el.height) / 2}
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Database Cylinder
            if (el.type === 'cylinder') {
              const capH = Math.min(24, Math.abs(el.height) * 0.2);
              return (
                <Line
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  rotation={el.rotation || 0}
                  points={[
                    0, capH,
                    0, el.height - capH,
                    el.width / 2, el.height,
                    el.width, el.height - capH,
                    el.width, capH,
                    el.width / 2, 0,
                  ]}
                  closed={true}
                  stroke={el.color}
                  strokeWidth={el.size}
                  fill={el.fill || undefined}
                  opacity={el.opacity || 1}
                  dash={dashArray}
                  lineCap="round"
                  lineJoin="round"
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Cloud Node
            if (el.type === 'cloud') {
              return (
                <Rect
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  rotation={el.rotation || 0}
                  width={el.width}
                  height={el.height}
                  stroke={el.color}
                  strokeWidth={el.size}
                  fill={el.fill || undefined}
                  opacity={el.opacity || 1}
                  dash={dashArray}
                  cornerRadius={Math.min(32, Math.min(el.width, el.height) * 0.35)}
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Circle
            if (el.type === 'circle') {
              return (
                <Circle
                  key={el.id}
                  id={el.id}
                  x={ox + el.width / 2}
                  y={oy + el.height / 2}
                  radius={Math.max(el.width, el.height) / 2}
                  stroke={el.color}
                  strokeWidth={el.size}
                  fill={el.fill || undefined}
                  opacity={el.opacity || 1}
                  dash={dashArray}
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Triangle
            if (el.type === 'triangle') {
              return (
                <Line
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  rotation={el.rotation || 0}
                  points={getTrianglePoints(el.width, el.height)}
                  closed={true}
                  stroke={el.color}
                  strokeWidth={el.size}
                  fill={el.fill || undefined}
                  opacity={el.opacity || 1}
                  dash={dashArray}
                  lineCap="round"
                  lineJoin="round"
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Diamond
            if (el.type === 'diamond') {
              return (
                <Line
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  rotation={el.rotation || 0}
                  points={getDiamondPoints(el.width, el.height)}
                  closed={true}
                  stroke={el.color}
                  strokeWidth={el.size}
                  fill={el.fill || undefined}
                  opacity={el.opacity || 1}
                  dash={dashArray}
                  lineCap="round"
                  lineJoin="round"
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Star
            if (el.type === 'star') {
              return (
                <Line
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  rotation={el.rotation || 0}
                  points={getStarPoints(el.width, el.height)}
                  closed={true}
                  stroke={el.color}
                  strokeWidth={el.size}
                  fill={el.fill || undefined}
                  opacity={el.opacity || 1}
                  dash={dashArray}
                  lineCap="round"
                  lineJoin="round"
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Arrow
            if (el.type === 'arrow') {
              const hasStartArrow = el.arrowHead === 'both';
              const hasEndArrow = el.arrowHead !== 'none';
              return (
                <Arrow
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  points={el.points}
                  stroke={el.color}
                  fill={el.color}
                  strokeWidth={el.size}
                  dash={dashArray}
                  pointerLength={hasEndArrow ? Math.max(8, el.size * 2.5) : 0}
                  pointerWidth={hasEndArrow ? Math.max(8, el.size * 2.5) : 0}
                  pointerAtBeginning={hasStartArrow}
                  opacity={el.opacity || 1}
                  lineCap="round"
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            // Line
            if (el.type === 'line') {
              return (
                <Line
                  key={el.id}
                  id={el.id}
                  x={ox}
                  y={oy}
                  points={el.points}
                  stroke={el.color}
                  strokeWidth={el.size}
                  dash={dashArray}
                  opacity={el.opacity || 1}
                  lineCap="round"
                  shadowColor={isSelected ? '#6366f1' : undefined}
                  shadowBlur={isSelected ? 8 : 0}
                />
              );
            }

            return null;
          })}


          {/* Active Stroke / Shape / Lasso Preview */}
          {currentStroke && (
            <>
              {currentStroke.type === 'lasso_rect' && (
                <Rect
                  x={currentStroke.x}
                  y={currentStroke.y}
                  width={currentStroke.width}
                  height={currentStroke.height}
                  stroke="#818cf8"
                  strokeWidth={1.5 / stageScale}
                  dash={[6 / stageScale, 4 / stageScale]}
                  fill="rgba(99, 102, 241, 0.12)"
                />
              )}

              {currentStroke.type === 'lasso_free' && (
                <Line
                  points={currentStroke.points}
                  stroke="#818cf8"
                  strokeWidth={1.5 / stageScale}
                  dash={[6 / stageScale, 4 / stageScale]}
                  fill="rgba(99, 102, 241, 0.12)"
                  closed={false}
                />
              )}

              {(currentStroke.type === 'pen' || currentStroke.type === 'highlighter') && (
                currentStroke.pathData ? (
                  <Path
                    data={currentStroke.pathData}
                    fill={currentStroke.color}
                    opacity={currentStroke.opacity || 1}
                    globalCompositeOperation={currentStroke.type === 'highlighter' ? 'screen' : 'source-over'}
                    shadowColor={currentStroke.presetId === 'pen_neon' ? currentStroke.color : undefined}
                    shadowBlur={currentStroke.presetId === 'pen_neon' ? 14 : 0}
                  />
                ) : (
                  <Line
                    points={Array.isArray(currentStroke.points[0]) ? currentStroke.points.flatMap(([x, y]) => [x, y]) : currentStroke.points}
                    stroke={currentStroke.color}
                    strokeWidth={currentStroke.size}
                    opacity={currentStroke.opacity || 1}
                    tension={0.45}
                    lineCap="round"
                    lineJoin="round"
                  />
                )
              )}

              {currentStroke.type === 'rect' && (
                <Rect
                  x={currentStroke.x}
                  y={currentStroke.y}
                  width={currentStroke.width}
                  height={currentStroke.height}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.size}
                  fill={currentStroke.fill || undefined}
                  opacity={currentStroke.opacity || 1}
                  cornerRadius={8}
                />
              )}

              {currentStroke.type === 'circle' && (
                <Circle
                  x={currentStroke.x + currentStroke.width / 2}
                  y={currentStroke.y + currentStroke.height / 2}
                  radius={Math.max(currentStroke.width, currentStroke.height) / 2}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.size}
                  fill={currentStroke.fill || undefined}
                  opacity={currentStroke.opacity || 1}
                />
              )}

              {currentStroke.type === 'triangle' && (
                <Line
                  x={currentStroke.x}
                  y={currentStroke.y}
                  points={getTrianglePoints(currentStroke.width, currentStroke.height)}
                  closed={true}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.size}
                  fill={currentStroke.fill || undefined}
                  opacity={currentStroke.opacity || 1}
                />
              )}

              {currentStroke.type === 'diamond' && (
                <Line
                  x={currentStroke.x}
                  y={currentStroke.y}
                  points={getDiamondPoints(currentStroke.width, currentStroke.height)}
                  closed={true}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.size}
                  fill={currentStroke.fill || undefined}
                  opacity={currentStroke.opacity || 1}
                />
              )}

              {currentStroke.type === 'star' && (
                <Line
                  x={currentStroke.x}
                  y={currentStroke.y}
                  points={getStarPoints(currentStroke.width, currentStroke.height)}
                  closed={true}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.size}
                  fill={currentStroke.fill || undefined}
                  opacity={currentStroke.opacity || 1}
                />
              )}

              {currentStroke.type === 'arrow' && (
                <Arrow
                  points={currentStroke.points}
                  stroke={currentStroke.color}
                  fill={currentStroke.color}
                  strokeWidth={currentStroke.size}
                  pointerLength={Math.max(8, currentStroke.size * 2.5)}
                  pointerWidth={Math.max(8, currentStroke.size * 2.5)}
                  opacity={currentStroke.opacity || 1}
                  lineCap="round"
                />
              )}

              {currentStroke.type === 'line' && (
                <Line
                  points={currentStroke.points}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.size}
                  opacity={currentStroke.opacity || 1}
                  lineCap="round"
                />
              )}
            </>
          )}

          {/* Live Hover / Disappearing Ink Layer */}
          {disappearingStrokes.map((st) => {
            const elapsed = performance.now() - st.createdAt;
            const remainingRatio = Math.max(0, 1 - elapsed / (st.duration || 1600));
            return (
              <Path
                key={st.id}
                data={st.pathData}
                fill={st.color}
                opacity={remainingRatio * (st.opacity || 1)}
                shadowColor={st.color}
                shadowBlur={16}
                shadowOpacity={remainingRatio}
              />
            );
          })}

          {/* Active Selection Marquee Bounds, Resize Handles & Rotation Stem */}
          {selectionBoundingBox && (
            <>
              {/* Bounding Box Outline */}
              <Rect
                x={selectionBoundingBox.x}
                y={selectionBoundingBox.y}
                width={selectionBoundingBox.width}
                height={selectionBoundingBox.height}
                stroke="#6366f1"
                strokeWidth={1.5 / stageScale}
                dash={[6 / stageScale, 4 / stageScale]}
                fill="rgba(99, 102, 241, 0.08)"
                cornerRadius={6}
              />

              {/* Rotation Handle Stem & Knob */}
              <Line
                points={[
                  selectionBoundingBox.x + selectionBoundingBox.width / 2,
                  selectionBoundingBox.y,
                  selectionBoundingBox.x + selectionBoundingBox.width / 2,
                  selectionBoundingBox.y - 22 / stageScale,
                ]}
                stroke="#6366f1"
                strokeWidth={1.5 / stageScale}
              />
              <Circle
                x={selectionBoundingBox.x + selectionBoundingBox.width / 2}
                y={selectionBoundingBox.y - 22 / stageScale}
                radius={6 / stageScale}
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth={2 / stageScale}
                onMouseDown={handleRotateStart}
                onTouchStart={handleRotateStart}
              />

              {/* Corner Resize Handles */}
              {/* Top-Left Handle */}
              <Circle
                x={selectionBoundingBox.x}
                y={selectionBoundingBox.y}
                radius={6 / stageScale}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth={2 / stageScale}
                onMouseDown={(e) => handleResizeStart('nw', e)}
                onTouchStart={(e) => handleResizeStart('nw', e)}
              />
              {/* Top-Right Handle */}
              <Circle
                x={selectionBoundingBox.x + selectionBoundingBox.width}
                y={selectionBoundingBox.y}
                radius={6 / stageScale}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth={2 / stageScale}
                onMouseDown={(e) => handleResizeStart('ne', e)}
                onTouchStart={(e) => handleResizeStart('ne', e)}
              />
              {/* Bottom-Left Handle */}
              <Circle
                x={selectionBoundingBox.x}
                y={selectionBoundingBox.y + selectionBoundingBox.height}
                radius={6 / stageScale}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth={2 / stageScale}
                onMouseDown={(e) => handleResizeStart('sw', e)}
                onTouchStart={(e) => handleResizeStart('sw', e)}
              />
              {/* Bottom-Right Handle (Primary Resize Corner) */}
              <Circle
                x={selectionBoundingBox.x + selectionBoundingBox.width}
                y={selectionBoundingBox.y + selectionBoundingBox.height}
                radius={7 / stageScale}
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth={2 / stageScale}
                onMouseDown={(e) => handleResizeStart('se', e)}
                onTouchStart={(e) => handleResizeStart('se', e)}
              />
            </>
          )}

          {/* Glowing Laser Pointer Trail */}
          {laserTrail.length > 1 && (
            <Line
              points={laserTrail.flatMap((p) => [p.x, p.y])}
              stroke={currentColor || '#ff0055'}
              strokeWidth={8}
              lineCap="round"
              lineJoin="round"
              shadowColor={currentColor || '#ff0055'}
              shadowBlur={18}
              shadowOpacity={1}
              opacity={0.9}
            />
          )}

          {/* Laser Pointer Tip Flare */}
          {laserTrail.length > 0 && (
            <Circle
              x={laserTrail[laserTrail.length - 1].x}
              y={laserTrail[laserTrail.length - 1].y}
              radius={7}
              fill="#ffffff"
              shadowColor={currentColor || '#ff0055'}
              shadowBlur={20}
              shadowOpacity={1}
            />
          )}

          {/* Visual Eraser Brush Ring Indicator */}
          {activeTool === 'eraser' && eraserPos.visible && (
            <Circle
              x={eraserPos.x}
              y={eraserPos.y}
              radius={eraserSize / 2}
              stroke="#f43f5e"
              strokeWidth={1.5 / stageScale}
              dash={[4 / stageScale, 4 / stageScale]}
              fill="rgba(244, 63, 94, 0.15)"
              listening={false}
            />
          )}
        </Layer>
      </Stage>

      {/* HTML Overlay for Interactive Typography, LaTeX Formulas, Audio Memos & Selection Action Bar */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          transform: `translate(${stagePos.x}px, ${stagePos.y}px) scale(${stageScale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Floating Selection Action Bar with Resize & Rotate Controls */}
        {selectionBoundingBox && (
          <div
            className="absolute pointer-events-auto z-40 -translate-y-full pb-8 flex items-center gap-1.5"
            style={{
              left: selectionBoundingBox.x,
              top: selectionBoundingBox.y,
            }}
          >
            <div className="glass-panel px-3 py-1.5 rounded-2xl border border-indigo-500/80 shadow-2xl flex items-center gap-2 select-none text-xs text-white backdrop-blur-xl">
              <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-300">
                <Move className="w-3.5 h-3.5" />
                <span>{selectedElementIds.length}</span>
              </span>

              <div className="w-px h-4 bg-slate-700 mx-0.5" />

              {/* Quick Rotate Controls */}
              <div className="flex items-center gap-0.5 bg-slate-900/80 p-0.5 rounded-xl border border-slate-700/60">
                <button
                  onClick={() => rotateSelectedElements(-90)}
                  title="Rotate Left 90°"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => rotateSelectedElements(90)}
                  title="Rotate Right 90°"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Resize Scale Controls */}
              <div className="flex items-center gap-0.5 bg-slate-900/80 p-0.5 rounded-xl border border-slate-700/60">
                <button
                  onClick={() => scaleSelectedElements(0.8)}
                  title="Scale Down (-20%)"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scaleSelectedElements(1.25)}
                  title="Scale Up (+25%)"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-px h-4 bg-slate-700 mx-0.5" />

              {/* Quick Recolor Swatches */}
              <div className="flex items-center gap-1">
                {['#ffffff', '#ff4757', '#ffa502', '#2ed573', '#00d2d3', '#54a0ff', '#5f27cd', '#ff9ff3'].map((c) => (
                  <button
                    key={c}
                    onClick={() => recolorSelectedElements(c)}
                    className="w-4 h-4 rounded-full border border-slate-700 hover:scale-125 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="w-px h-4 bg-slate-700 mx-0.5" />

              {/* Draw.io Alignment & Layer Tools (when 2 or more elements are selected) */}
              {selectedElementIds.length >= 2 && (
                <>
                  <div className="w-px h-4 bg-slate-700 mx-0.5" />
                  <div className="flex items-center gap-0.5 bg-slate-900/80 p-0.5 rounded-xl border border-slate-700/60">
                    <button
                      onClick={() => alignSelectedElements('left')}
                      title="Align Left"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignSelectedElements('center')}
                      title="Align Center"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignSelectedElements('right')}
                      title="Align Right"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignSelectedElements('top')}
                      title="Align Top"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <ArrowUpToLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignSelectedElements('bottom')}
                      title="Align Bottom"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => distributeSelectedElements('horizontal')}
                      title="Distribute Horizontally"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-px h-4 bg-slate-700 mx-0.5" />

                  {/* Layer Reorder */}
                  <div className="flex items-center gap-0.5 bg-slate-900/80 p-0.5 rounded-xl border border-slate-700/60">
                    <button
                      onClick={() => reorderSelectedElements('front')}
                      title="Bring to Front"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-[10px] font-bold"
                    >
                      Front
                    </button>
                    <button
                      onClick={() => reorderSelectedElements('back')}
                      title="Send to Back"
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-[10px] font-bold"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}

              <div className="w-px h-4 bg-slate-700 mx-0.5" />

              {/* Duplicate Button */}
              <button
                onClick={duplicateSelectedElements}
                title="Duplicate (Clone)"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold hidden sm:inline">Clone</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={deleteSelectedElements}
                title="Delete Selected (Delete / Backspace)"
                className="p-1.5 rounded-lg hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Deselect */}
              <button
                onClick={clearSelection}
                title="Deselect (Escape)"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Render Sticky Notes (Excalidraw / Post-it Style) */}
        {elements
          .filter((el) => el.type === 'sticky')
          .map((el) => {
            const isSelected = selectedElementIds.includes(el.id);
            const isEditing = editingStickyId === el.id;

            return (
              <div
                key={el.id}
                onDoubleClick={() => setEditingStickyId(el.id)}
                className={`absolute pointer-events-auto p-3.5 rounded-2xl shadow-xl flex flex-col justify-between transition-all select-none group cursor-move ${
                  isSelected ? 'ring-2 ring-indigo-500 shadow-2xl scale-[1.02]' : 'hover:shadow-2xl hover:scale-[1.01]'
                }`}
                style={{
                  left: el.x || 0,
                  top: el.y || 0,
                  width: `${el.width || 180}px`,
                  minHeight: `${el.height || 180}px`,
                  backgroundColor: el.color || '#fef08a',
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  color: '#0f172a',
                }}
              >
                {/* Pin Head Dot & Actions */}
                <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-black/25 shadow-inner" />
                    <StickyNote className="w-3 h-3 text-slate-700/60" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(el.id);
                    }}
                    className="w-4 h-4 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Sticky Note"
                  >
                    ✕
                  </button>
                </div>

                {/* Sticky Text Editor or Display */}
                {isEditing ? (
                  <textarea
                    autoFocus
                    defaultValue={el.text || ''}
                    onBlur={(e) => {
                      updateElement(el.id, { text: e.target.value });
                      setEditingStickyId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditingStickyId(null);
                    }}
                    placeholder="Type sticky note..."
                    className="w-full flex-1 bg-transparent resize-none outline-none font-sans text-xs font-semibold text-slate-800 placeholder-slate-500/70 leading-relaxed mt-2"
                  />
                ) : (
                  <div className="flex-1 font-sans text-xs font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap mt-2 overflow-y-auto">
                    {el.text || <span className="italic font-normal text-slate-500/60">Double-click to type note...</span>}
                  </div>
                )}
              </div>
            );
          })}


        {/* Render Text Annotations */}
        {elements
          .filter((el) => el.type === 'text')
          .map((el) => {
            const isBeingEdited = editingText?.id === el.id;
            const isSelected = selectedElementIds.includes(el.id);
            if (isBeingEdited) return null;

            return (
              <div
                key={el.id}
                onDoubleClick={() => handleDoubleClickText(el)}
                className={`absolute pointer-events-auto p-2 rounded-xl group cursor-move select-none transition-all max-w-xl ${
                  isSelected ? 'ring-2 ring-indigo-500 bg-indigo-950/30' : 'hover:ring-1 hover:ring-indigo-500/50 hover:bg-slate-800/40'
                }`}
                style={{
                  left: el.x || 0,
                  top: el.y || 0,
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  transformOrigin: '0 0',
                  color: el.fill || '#f1f5f9',
                  fontSize: `${el.fontSize || 20}px`,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.4,
                }}
              >
                {el.text}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(el.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 shadow-md transition-opacity"
                  title="Delete text"
                >
                  ✕
                </button>
              </div>
            );
          })}

        {/* Inline Textarea Editor */}
        {editingText && (
          <div
            className="absolute pointer-events-auto z-50 p-2 rounded-xl bg-slate-950/95 border border-indigo-500 shadow-2xl backdrop-blur-md"
            style={{
              left: editingText.x,
              top: editingText.y,
              minWidth: '220px',
            }}
          >
            <textarea
              ref={textInputRef}
              autoFocus
              value={editingText.text}
              onChange={(e) => setEditingText((prev) => ({ ...prev, text: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditingText(null);
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveText();
                }
              }}
              onBlur={handleSaveText}
              placeholder="Type your note here... (Enter to save, Shift+Enter for new line)"
              rows={Math.max(2, editingText.text.split('\n').length)}
              className="w-full bg-transparent border-none outline-none resize-none text-white leading-relaxed font-sans placeholder-slate-500"
              style={{
                fontSize: `${editingText.fontSize || 20}px`,
                color: editingText.color || '#f1f5f9',
              }}
            />
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              <span>Press <b>Enter</b> to save</span>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSaveText();
                }}
                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px]"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* LaTeX Math Formula Cards */}
        {elements
          .filter((el) => el.type === 'formula')
          .map((el) => {
            let renderedKaTeX = '';
            try {
              renderedKaTeX = katex.renderToString(el.latex, { throwOnError: false, displayMode: true });
            } catch (e) {
              renderedKaTeX = el.latex;
            }

            return (
              <div
                key={el.id}
                className="absolute pointer-events-auto p-3 rounded-2xl glass-panel border border-purple-500/40 shadow-xl select-none group cursor-move"
                style={{ left: el.x || 0, top: el.y || 0 }}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/60 text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1">
                    <Sigma className="w-3.5 h-3.5" /> LaTeX Formula
                  </span>
                  <button
                    onClick={() => deleteElement(el.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
                <div
                  className="text-white text-lg py-1 px-2"
                  dangerouslySetInnerHTML={{ __html: renderedKaTeX }}
                />
              </div>
            );
          })}

        {/* Audio Memo Pins */}
        {elements
          .filter((el) => el.type === 'audio')
          .map((el) => {
            const isThisPlaying = playingAudioId === el.id;
            return (
              <div
                key={el.id}
                className="absolute pointer-events-auto flex items-center gap-3 p-3 rounded-2xl glass-panel border border-rose-500/40 shadow-xl select-none group cursor-move"
                style={{ left: el.x || 0, top: el.y || 0 }}
              >
                <button
                  onClick={() => handleToggleAudioPlay(el)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isThisPlaying
                      ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                      : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                  }`}
                >
                  {isThisPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <h5 className="text-xs font-bold text-white line-clamp-1">{el.title}</h5>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.floor(el.duration / 60)}:{((el.duration % 60) || 0).toString().padStart(2, '0')} min
                  </span>
                </div>
                <button
                  onClick={() => deleteElement(el.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};
