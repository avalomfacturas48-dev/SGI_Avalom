'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import cookie from 'js-cookie'
import { toast } from 'sonner'

interface ImportClientsProps {
  onSuccess?: () => void
}

export function ImportClients({ onSuccess }: ImportClientsProps) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      const res = await fetch('/api/import-clients', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${cookie.get('token') ?? ''}`,
        },
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Error en importación')

      toast.success(body.message)
      onSuccess?.()        // <-- aquí llamamos al callback
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'No se pudo importar')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={onFileChange}
        disabled={loading}
      />
      <Button
        variant="outline"
        onClick={handleButtonClick}
        disabled={loading}
      >
        {loading ? 'Importando…' : 'Importar Clientes'}
      </Button>
    </>
  )
}
