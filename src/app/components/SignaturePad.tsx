import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

export interface SignaturePadHandle {
  getDataUrl: () => string | null
  clear: () => void
}

const SignaturePad = forwardRef<SignaturePadHandle, { onChange?: (hasSignature: boolean) => void }>(
  function SignaturePad({ onChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const drawing = useRef(false)
    const hasDrawn = useRef(false)
    const [isEmpty, setIsEmpty] = useState(true)

    function getContext() {
      const canvas = canvasRef.current
      if (!canvas) return null
      return canvas.getContext('2d')
    }

    function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      const ctx = getContext()
      if (!ctx) return
      drawing.current = true
      const { x, y } = getPoint(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      canvasRef.current?.setPointerCapture(e.pointerId)
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (!drawing.current) return
      const ctx = getContext()
      if (!ctx) return
      const { x, y } = getPoint(e)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#14181B'
      ctx.lineTo(x, y)
      ctx.stroke()
      if (!hasDrawn.current) {
        hasDrawn.current = true
        setIsEmpty(false)
        onChange?.(true)
      }
    }

    function handlePointerUp() {
      drawing.current = false
    }

    function handleClear() {
      const canvas = canvasRef.current
      const ctx = getContext()
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      hasDrawn.current = false
      setIsEmpty(true)
      onChange?.(false)
    }

    useImperativeHandle(ref, () => ({
      getDataUrl: () => (isEmpty || !canvasRef.current ? null : canvasRef.current.toDataURL('image/png')),
      clear: handleClear,
    }))

    return (
      <div>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-48 bg-white border border-surface-border rounded-control touch-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-slate-400">Firmá con el dedo o el mouse dentro del recuadro.</p>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Limpiar
          </button>
        </div>
      </div>
    )
  },
)

export default SignaturePad
