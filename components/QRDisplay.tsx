'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props {
  value: string
  size?: number
}

export default function QRDisplay({ value, size = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
  }, [value, size])

  return (
    <div className="rounded-2xl overflow-hidden bg-white p-3 inline-block shadow-lg">
      <canvas ref={canvasRef} />
    </div>
  )
}
