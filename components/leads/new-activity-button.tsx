'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ActivityForm, type ActivityFormFields } from '@/components/leads/activity-form'
import { createActivity } from '@/app/(dashboard)/leads/activities-actions'

interface NewActivityButtonProps {
  leadId: string
}

export function NewActivityButton({ leadId }: NewActivityButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSave(data: ActivityFormFields) {
    const result = await createActivity({ leadId, ...data })
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Atividade registrada com sucesso.')
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="w-3 h-3" />
        Registrar atividade
      </Button>
      <ActivityForm open={open} onClose={() => setOpen(false)} onSave={handleSave} />
    </>
  )
}
