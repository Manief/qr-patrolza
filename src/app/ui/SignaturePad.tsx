import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

export interface SignaturePadHandle {
  clear: () => void;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(({ onSave }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    },
  }));

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing = true;
    const rect = e.currentTarget.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  };

  const handleMouseUp = () => {
    drawing = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();
        lastX = x;
        lastY = y;
      }
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        style={{ border: '1px solid #ccc', borderRadius: 8, background: '#fff', touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <div className="flex gap-2 mt-2">
        <button type="button" className="px-3 py-1 rounded bg-primary-500 text-white" onClick={handleSave}>Save Signature</button>
        <button type="button" className="px-3 py-1 rounded bg-gray-300 text-gray-700" onClick={() => ref && (ref as any).current?.clear()}>Clear</button>
      </div>
    </div>
  );
});

export default SignaturePad;
