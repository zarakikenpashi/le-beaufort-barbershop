import { useState, useRef, useEffect, useCallback } from 'react';

export const ScratchCard = ({
  width = 300,
  height = 300,
  image,
  finishPercent = 50,
  onComplete,
  brushSize = 20,
  fadeOutOnComplete = true,
  customBrush,
  customCheckZone,
  children,
}) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isCompleteRef = useRef(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Default scratch texture image
    const defaultTexture = '/ui.png';

    // Draw initial scratch layer with base color
    ctx.fillStyle = customBrush?.color || '#E0E0E0';
    ctx.fillRect(0, 0, width, height);

    // Add texture
    const textureImg = new Image();
    textureImg.crossOrigin = 'anonymous';
    textureImg.src = customBrush?.image || defaultTexture;
    
    textureImg.onload = () => {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.drawImage(textureImg, 0, 0, width, height);
      ctx.globalCompositeOperation = 'destination-out';
    };

    textureImg.onerror = () => {
      // Fallback to solid color if image fails to load
      ctx.globalCompositeOperation = 'destination-out';
    };
  }, [width, height, customBrush]);

  // Check scratch percentage
  const checkScratchPercentage = useCallback(() => {
    if (isCompleteRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparent = 0;
    const total = pixels.length / 4;

    // Check custom zone if provided
    let checkZone = { x: 0, y: 0, width: canvas.width, height: canvas.height };
    if (customCheckZone) {
      const dpr = window.devicePixelRatio || 1;
      checkZone = {
        x: customCheckZone.x * dpr,
        y: customCheckZone.y * dpr,
        width: customCheckZone.width * dpr,
        height: customCheckZone.height * dpr,
      };
    }

    for (let i = 0; i < pixels.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % canvas.width;
      const y = Math.floor(pixelIndex / canvas.width);

      if (
        x >= checkZone.x &&
        x < checkZone.x + checkZone.width &&
        y >= checkZone.y &&
        y < checkZone.y + checkZone.height
      ) {
        if (pixels[i + 3] < 128) {
          transparent++;
        }
      }
    }

    const percentage = (transparent / total) * 100;

    if (percentage >= finishPercent) {
      isCompleteRef.current = true;
      setIsComplete(true);
      
      if (onComplete) {
        onComplete({
          percentage,
          canvas: canvas,
        });
      }
    }
  }, [finishPercent, onComplete, customCheckZone]);

  // Scratch function
  const scratch = useCallback((x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.arc(
      (x - rect.left) * scaleX / (window.devicePixelRatio || 1),
      (y - rect.top) * scaleY / (window.devicePixelRatio || 1),
      brushSize,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [brushSize]);

  // Event handlers
  const handlePointerDown = useCallback((e) => {
    if (isCompleteRef.current) return;
    setIsScratching(true);
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    scratch(clientX, clientY);
  }, [scratch]);

  const handlePointerMove = useCallback((e) => {
    if (!isScratching || isCompleteRef.current) return;
    e.preventDefault();
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    scratch(clientX, clientY);
  }, [isScratching, scratch]);

  const handlePointerUp = useCallback(() => {
    if (isScratching) {
      setIsScratching(false);
      setTimeout(checkScratchPercentage, 100);
    }
  }, [isScratching, checkScratchPercentage]);

  // Setup global event listeners
  useEffect(() => {
    if (isScratching) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);

      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isScratching, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        userSelect: 'none',
        touchAction: 'none',
        border:"4px solid #c7c6cf",
        padding:"12px",
        borderRadius:"8px"
      }}
    >
      {/* Content underneath */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {image ? (
          <img
            src={image}
            alt="Scratch card content"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />
        ) : (
          children
        )}
      </div>

      {/* Scratch canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: isScratching ? 'grabbing' : 'grab',
          opacity: isComplete && fadeOutOnComplete ? 0 : 1,
          transition: fadeOutOnComplete ? 'opacity 0.3s ease-out' : 'none',
          pointerEvents: isComplete ? 'none' : 'auto',
        }}
      />
    </div>
  );
};