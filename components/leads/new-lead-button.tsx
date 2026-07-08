'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LeadForm, type LeadFormFields } from '@/components/leads/lead-form'
import { createLead } from '@/app/(dashboard)/leads/actions'
import type { Member } from '@/types'

interface NewLeadButtonProps {
  members: Member[]
}

export function NewLeadButton({ members }: NewLeadButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSave(data: LeadFormFields) {
    const result = await createLead(data)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Lead criado com sucesso.')
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="shrink-0">
        <Plus className="w-4 h-4 mr-1.5" />
        Novo lead
      </Button>
      <LeadForm open={open} onClose={() => setOpen(false)} onSave={handleSave} members={members} />
    </>
  )
}
