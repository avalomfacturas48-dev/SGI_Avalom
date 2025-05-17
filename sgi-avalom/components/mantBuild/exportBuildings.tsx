'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import cookie from 'js-cookie'
import { toast } from 'sonner'

export function ExportBuildings() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/export-buildings', {
        headers: { Authorization: `Bearer ${cookie.get('token') ?? ''}` },
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'edificios.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error(err)
      toast.error('No se pudo generar el reporte de edificios.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? 'Generando…' : 'Exportar Edificios'}
    </Button>
  )
}
