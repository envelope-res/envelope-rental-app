import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(0, 217, 159)',
  width,
  height,
  maxOpacity = 0.3,
  style,
  ...props
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    const toRGBA = (c) => {
      if (typeof window === 'undefined') return 'rgba(0, 0, 0,';
      const cvs = document.createElement('canvas');
      cvs.width = cvs.height = 1;
      const ctx = cvs.getContext('2d');
      if (!ctx) return 'rgba(0,217,159,';
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback((canvas, w, h) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const cols = Math.ceil(w / (squareSize + gridGap));
    const rows = Math.ceil(h / (squareSize + gridGap));
    const squares = new Float32Array(cols * rows);
    for (let i = 0; i < squares.length; i++) squares[i] = Math.random() * maxOpacity;
    return { cols, rows, squares, dpr };
  }, [squareSize, gridGap, maxOpacity]);

  const updateSquares = useCallback((squares, deltaTime) => {
    for (let i = 0; i < squares.length; i++) {
      if (Math.random() < flickerChance * deltaTime) squares[i] = Math.random() * maxOpacity;
    }
  }, [flickerChance, maxOpacity]);

  const drawGrid = useCallback((ctx, w, h, cols, rows, squares, dpr) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ctx.fillStyle = `${memoizedColor}${squares[i * rows + j]})`;
        ctx.fillRect(
          i * (squareSize + gridGap) * dpr,
          j * (squareSize + gridGap) * dpr,
          squareSize * dpr,
          squareSize * dpr
        );
      }
    }
  }, [memoizedColor, squareSize, gridGap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext('2d') ?? null;
    let rafId = null;
    let resizeObs = null;
    let intersectObs = null;
    let gridParams = null;

    if (canvas && container && ctx) {
      const updateSize = () => {
        const w = width || container.clientWidth;
        const h = height || container.clientHeight;
        setCanvasSize({ width: w, height: h });
        gridParams = setupCanvas(canvas, w, h);
      };
      updateSize();

      let lastTime = 0;
      const animate = (time) => {
        if (!isInView || !gridParams) return;
        const dt = (time - lastTime) / 1000;
        lastTime = time;
        updateSquares(gridParams.squares, dt);
        drawGrid(ctx, canvas.width, canvas.height, gridParams.cols, gridParams.rows, gridParams.squares, gridParams.dpr);
        rafId = requestAnimationFrame(animate);
      };

      resizeObs = new ResizeObserver(updateSize);
      resizeObs.observe(container);

      intersectObs = new IntersectionObserver(
        ([entry]) => setIsInView(entry.isIntersecting),
        { threshold: 0 }
      );
      intersectObs.observe(canvas);

      if (isInView) rafId = requestAnimationFrame(animate);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (resizeObs) resizeObs.disconnect();
      if (intersectObs) intersectObs.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', ...style }} {...props}>
      <canvas
        ref={canvasRef}
        style={{ pointerEvents: 'none', width: canvasSize.width, height: canvasSize.height }}
      />
    </div>
  );
}
