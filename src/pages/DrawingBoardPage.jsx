import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiSave, FiDownload, FiTrash2, FiShare2, FiImage,
  FiFolder, FiEdit3, FiZoomIn, FiZoomOut,
  FiMousePointer, FiEdit, FiSquare, FiCircle, FiType, FiMinus
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DRAWINGS_KEY = 'codex_drawings';
const BRAND = 'CODEX';

const COLORS = [
  '#ccff00', '#ffffff', '#ff3333', '#00e5ff', '#ffea00',
  '#8b5cf6', '#ff6b6b', '#4ecdc4', '#ffffff', '#a0a0a0',
];

const TOOLS = [
  { id: 'select', label: 'Select', icon: FiMousePointer },
  { id: 'pencil', label: 'Pencil', icon: FiEdit },
  { id: 'line', label: 'Line', icon: FiMinus },
  { id: 'rect', label: 'Rectangle', icon: FiSquare },
  { id: 'circle', label: 'Circle', icon: FiCircle },
  { id: 'text', label: 'Text', icon: FiType },
];

const DrawingBoardPage = () => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#ccff00');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [drawings, setDrawings] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingName, setDrawingName] = useState('Untitled Diagram');
  const [isEditing, setIsEditing] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState([]);
  const [showSavedMenu, setShowSavedMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const allDrawings = historyIndex >= 0
      ? history.slice(0, historyIndex + 1)
      : history;

    allDrawings.forEach(d => drawShape(ctx, d));

    if (currentDrawing) {
      drawShape(ctx, currentDrawing);
    }

    ctx.restore();
  }, [history, historyIndex, currentDrawing, zoom, pan]);

  const drawShape = (ctx, d) => {
    ctx.strokeStyle = d.color;
    ctx.lineWidth = d.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (d.type === 'pencil') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = d.width;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = d.width;
    }

    switch (d.type) {
      case 'pencil':
        if (d.points && d.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(d.points[0].x, d.points[0].y);
          for (let i = 1; i < d.points.length; i++) {
            ctx.lineTo(d.points[i].x, d.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'line':
        if (d.start && d.end) {
          ctx.beginPath();
          ctx.moveTo(d.start.x, d.start.y);
          ctx.lineTo(d.end.x, d.end.y);
          ctx.stroke();
        }
        break;

      case 'rect':
        if (d.start && d.end) {
          const w = d.end.x - d.start.x;
          const h = d.end.y - d.start.y;
          ctx.strokeRect(d.start.x, d.start.y, w, h);
        }
        break;

      case 'circle':
        if (d.start && d.end) {
          const rx = Math.abs(d.end.x - d.start.x) / 2;
          const ry = Math.abs(d.end.y - d.start.y) / 2;
          const cx = d.start.x + (d.end.x - d.start.x) / 2;
          const cy = d.start.y + (d.end.y - d.start.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;

      case 'arrow':
        if (d.start && d.end) {
          const headLen = 15;
          const angle = Math.atan2(d.end.y - d.start.y, d.end.x - d.start.x);
          ctx.beginPath();
          ctx.moveTo(d.start.x, d.start.y);
          ctx.lineTo(d.end.x, d.end.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(d.end.x, d.end.y);
          ctx.lineTo(
            d.end.x - headLen * Math.cos(angle - Math.PI / 6),
            d.end.y - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(d.end.x, d.end.y);
          ctx.lineTo(
            d.end.x - headLen * Math.cos(angle + Math.PI / 6),
            d.end.y - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
        break;

      case 'text':
        if (d.text) {
          ctx.font = `${d.width * 5}px "Space Mono", monospace`;
          ctx.fillStyle = d.color;
          ctx.fillText(d.text, d.start.x, d.start.y);
        }
        break;

      case 'image':
        if (d.img && d.start && d.end) {
          const w = d.end.x - d.start.x;
          const h = d.end.y - d.start.y;
          ctx.drawImage(d.img, d.start.x, d.start.y, w, h);
        }
        break;

      default:
        break;
    }

    ctx.globalCompositeOperation = 'source-over';
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  };

  const handlePointerDown = (e) => {
    if (spacePressed || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (tool === 'select') return;

    const point = getCanvasPoint(e);

    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newShape = {
          type: 'text',
          start: point,
          text,
          color,
          width: strokeWidth,
        };
        setCurrentDrawing(newShape);
        setIsDrawing(true);
      }
      return;
    }

    setIsDrawing(true);

    if (tool === 'pencil') {
      setCurrentDrawing({
        type: tool,
        points: [point],
        color,
        width: strokeWidth,
      });
    } else {
      setCurrentDrawing({
        type: tool,
        start: point,
        end: point,
        color,
        width: strokeWidth,
      });
    }
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing || !currentDrawing) return;

    const point = getCanvasPoint(e);

    setCurrentDrawing(prev => {
      if (prev.type === 'pencil') {
        return {
          ...prev,
          points: [...prev.points, point],
        };
      }
      return {
        ...prev,
        end: point,
      };
    });
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing || !currentDrawing) return;

    const validShape =
      currentDrawing.type === 'pencil'
        ? currentDrawing.points && currentDrawing.points.length > 1
        : currentDrawing.start && currentDrawing.end;

    if (validShape) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(currentDrawing);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.2), 5));
  };

  const handleKeyDown = (e) => {
    if (e.code === 'Space' && !e.repeat) {
      setSpacePressed(true);
      e.preventDefault();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === 'Space') {
      setSpacePressed(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [history, historyIndex]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const saved = localStorage.getItem(DRAWINGS_KEY);
    if (saved) {
      try {
        setSavedDrawings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved drawings:', e);
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = containerRef.current?.clientWidth || 800;
    canvas.height = containerRef.current?.clientHeight || 600;
    redrawCanvas();
  }, []);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setHistory([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  };

  const handleSave = useCallback(() => {
    const shapes = historyIndex >= 0 ? history.slice(0, historyIndex + 1) : history;
    const drawing = {
      id: Date.now().toString(),
      name: drawingName || 'Untitled Diagram',
      shapes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [drawing, ...savedDrawings];
    localStorage.setItem(DRAWINGS_KEY, JSON.stringify(updated));
    setSavedDrawings(updated);
    toast.success(`${BRAND} drawing saved!`);
    setIsEditing(false);
  }, [history, historyIndex, drawingName, savedDrawings]);

  const handleLoad = useCallback((drawing) => {
    if (drawing.shapes && drawing.shapes.length > 0) {
      setHistory(drawing.shapes);
      setHistoryIndex(drawing.shapes.length - 1);
    } else {
      setHistory([]);
      setHistoryIndex(-1);
    }
    setDrawingName(drawing.name);
    setShowSavedMenu(false);
    toast.success(`Loaded: ${drawing.name}`);
  }, []);

  const handleClear = useCallback(() => {
    if (window.confirm('Clear the current canvas? This cannot be undone.')) {
      setHistory([]);
      setHistoryIndex(-1);
      toast.success('Canvas cleared');
    }
  }, []);

  const handleExport = useCallback(async (format) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const filename = `${drawingName.replace(/[^a-z0-9]/gi, '_')}`;
      let blob;

      if (format === 'png') {
        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      } else if (format === 'json') {
        const shapes = historyIndex >= 0 ? history.slice(0, historyIndex + 1) : history;
        const data = JSON.stringify({ name: drawingName, shapes, zoom, pan }, null, 2);
        blob = new Blob([data], { type: 'application/json' });
      } else {
        toast.error('Unsupported export format');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
      console.error(err);
    }
  }, [drawingName, history, historyIndex, zoom, pan]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const maxSize = 300;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width / zoom - w) / 2 - pan.x / zoom;
        const y = (canvas.height / zoom - h) / 2 - pan.y / zoom;

        const newShape = {
          type: 'image',
          start: { x, y },
          end: { x: x + w, y: y + h },
          img,
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newShape);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        toast.success('Image added');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleShare = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      await navigator.share?.({
        title: drawingName,
        text: `Check out my ${BRAND} diagram`,
        files: [new File([blob], 'diagram.png', { type: 'image/png' })],
      }) || navigator.clipboard.writeText(url);
      toast.success('Share link copied!');
    } catch {
      toast.success('Share ready');
    }
  };

  const cursorStyle = isPanning || spacePressed
    ? 'grab'
    : tool === 'select'
      ? 'default'
      : 'crosshair';

  return (
    <div className="drawing-board-page">
      <div className="drawing-toolbar">
        <div className="drawing-toolbar-left">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <FiEdit3 style={{ color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: 'var(--text-lg)', margin: 0, fontFamily: 'var(--font-mono)' }}>{BRAND}</h2>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
              {isEditing ? 'Editing...' : (user ? 'Auto-saved to browser' : 'Sign in to save to profile')}
            </p>
          </div>
          {isEditing && (
            <input
              type="text"
              className="input"
              value={drawingName}
              onChange={(e) => setDrawingName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              autoFocus
              style={{
                padding: '4px 8px',
                fontSize: 'var(--text-sm)',
                width: '200px',
                background: 'var(--color-bg-input)',
              }}
            />
          )}
        </div>

        <div className="drawing-toolbar-right">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSavedMenu(!showSavedMenu)}>
            <FiFolder /> Load
          </button>
          {showSavedMenu && (
            <div ref={menuRef} style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '4px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              zIndex: 50,
              minWidth: '250px',
              maxHeight: '300px',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}>
              {savedDrawings.length === 0 ? (
                <div style={{ padding: 'var(--space-md)', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
                  No saved drawings yet
                </div>
              ) : (
                savedDrawings.map(d => (
                  <div
                    key={d.id}
                    onClick={() => handleLoad(d)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-input)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 'var(--text-sm)' }}>{d.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          <button className="btn btn-ghost btn-sm" onClick={handleUndo} disabled={historyIndex < 0}>
            ↩ Undo
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            ↪ Redo
          </button>

          <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {TOOLS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className="btn btn-ghost btn-sm"
                  style={{
                    borderRadius: 0,
                    borderRight: '1px solid var(--color-border)',
                    background: tool === t.id ? 'var(--color-bg-input)' : 'transparent',
                    color: tool === t.id ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    padding: '6px 10px',
                  }}
                  onClick={() => setTool(t.id)}
                  title={t.label}
                >
                  <Icon />
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '20px',
                  height: '20px',
                  background: c,
                  border: color === c ? '2px solid white' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {strokeWidth}px
            </span>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              style={{ width: '60px', accentColor: 'var(--color-accent)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.min(z * 1.2, 5))}>
              <FiZoomIn />
            </button>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', minWidth: '40px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.max(z / 1.2, 0.2))}>
              <FiZoomOut />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
              Reset
            </button>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
            <FiImage /> Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <button className="btn btn-ghost btn-sm" onClick={handleClear}>
            <FiTrash2 /> Clear
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(!isEditing)}>
            <FiEdit3 /> {isEditing ? 'Done' : 'Rename'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleShare}>
            <FiShare2 /> Share
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleExport('png')}>
            <FiDownload /> PNG
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleExport('json')}>
            JSON
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            <FiSave /> Save
          </button>
        </div>
      </div>

      <div className="drawing-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: cursorStyle,
            touchAction: 'none',
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onWheel={handleWheel}
        />
      </div>
    </div>
  );
};

export default DrawingBoardPage;
