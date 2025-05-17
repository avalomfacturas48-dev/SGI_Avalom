'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'  // ajusta la ruta si tu Button está en otro lugar

export function ExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/export-clients')
      if (!res.ok) throw new Error('Error al generar PDF')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'clientes.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('No se pudo generar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center space-x-2"
    >
      {loading ? 'Generando…' : 'Exportar Clientes'}
    </Button>
  )
}
