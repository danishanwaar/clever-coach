import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signatureData: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  width = 400,
  height = 200,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const isDrawingRef = useRef(false);

  // Initialize canvas only once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size only once
    canvas.width = width;
    canvas.height = height;

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []); // Empty dependency array - only run once

  // Handle drawing events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getPoint = (e: MouseEvent | Touch) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const startDrawing = (e: MouseEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      setIsDrawing(true);
      const point = getPoint(e);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    };

    const draw = (e: MouseEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const point = getPoint(e);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    };

    const stopDrawing = (e: MouseEvent) => {
      e.preventDefault();
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        const signatureData = canvas.toDataURL('image/png');
        setHasSignature(true);
        onSignatureChange(signatureData);
      }
    };

    // Touch events
    const startDrawingTouch = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      isDrawingRef.current = true;
      setIsDrawing(true);
      const point = getPoint(touch);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    };

    const drawTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const touch = e.touches[0];
      const point = getPoint(touch);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    };

    const stopDrawingTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        const signatureData = canvas.toDataURL('image/png');
        setHasSignature(true);
        onSignatureChange(signatureData);
      }
    };

    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawingTouch);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawingTouch);
      canvas.removeEventListener('touchmove', drawTouch);
      canvas.removeEventListener('touchend', stopDrawingTouch);
    };
  }, [onSignatureChange]);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange(null);
  }, [onSignatureChange]);

  return (
    <div className={`signature-pad-container ${className}`}>
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair block"
          style={{ 
            width: `${width}px`, 
            height: `${height}px`,
            display: 'block'
          }}
        />
      </div>
      <div className="mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Signature
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
