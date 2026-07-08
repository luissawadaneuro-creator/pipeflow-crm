'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from '@/components/pipeline/kanban-column'
import { DealCard } from '@/components/pipeline/deal-card'
import { DealForm, type DealFormFields } from '@/components/pipeline/deal-form'
import { createDeal, updateDeal, updateDealStage } from '@/app/(dashboard)/pipeline/actions'
import type { DealWithLead } from '@/lib/supabase/queries'
import type { DealStage, Lead, Member } from '@/types'

const STAGES: DealStage[] = ['new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost']

interface KanbanBoardProps {
  initialDeals: DealWithLead[]
  leads: Lead[]
  members: Member[]
}

export function KanbanBoard({ initialDeals, leads, members }: KanbanBoardProps) {
  const router = useRouter()
  const [deals, setDeals] = useState<DealWithLead[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<DealWithLead | null>(null)
  const [defaultStage, setDefaultStage] = useState<DealStage>('new_lead')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeDeal = activeId ? deals.find(d => d.id === activeId) ?? null : null

  const dealsByStage = useCallback(
    (stage: DealStage) =>
      deals
        .filter(d => d.stage === stage)
        .sort((a, b) => a.position - b.position),
    [deals],
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string

    const activeDeal = deals.find(d => d.id === activeId)
    if (!activeDeal) return

    // over is a column (stage) or a card
    const overStage = STAGES.includes(overId as DealStage)
      ? (overId as DealStage)
      : deals.find(d => d.id === overId)?.stage

    if (!overStage || activeDeal.stage === overStage) return

    setDeals(prev =>
      prev.map(d =>
        d.id === activeId ? { ...d, stage: overStage, position: 9999 } : d
      )
    )
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)

    const activeId = active.id as string
    const activeDeal = deals.find(d => d.id === activeId)
    if (!activeDeal) return

    let next = deals

    // If dropped on a card in the same column, reorder
    if (over && over.id !== activeId) {
      const overId = over.id as string
      const overDeal = deals.find(d => d.id === overId)
      if (overDeal && overDeal.stage === activeDeal.stage) {
        const stageDeals = deals
          .filter(d => d.stage === activeDeal.stage)
          .sort((a, b) => a.position - b.position)
        const oldIdx = stageDeals.findIndex(d => d.id === activeId)
        const newIdx = stageDeals.findIndex(d => d.id === overId)
        if (oldIdx !== -1 && newIdx !== -1) {
          const reordered = arrayMove(stageDeals, oldIdx, newIdx).map((d, i) => ({
            ...d,
            position: i,
          }))
          next = deals.map(d => reordered.find(r => r.id === d.id) ?? d)
        }
      }
    }

    // Always normalise positions for all stages (handles cross-column drops too)
    const stageMap = new Map<DealStage, DealWithLead[]>()
    for (const d of next) {
      const list = stageMap.get(d.stage) ?? []
      list.push(d)
      stageMap.set(d.stage, list)
    }
    const normalised: DealWithLead[] = []
    stageMap.forEach((list) => {
      list.sort((a, b) => a.position - b.position)
      list.forEach((d, i) => normalised.push({ ...d, position: i }))
    })

    const originalById = new Map(deals.map(d => [d.id, d]))
    const changed = normalised.filter(d => {
      const original = originalById.get(d.id)
      return original && (original.stage !== d.stage || original.position !== d.position)
    })

    setDeals(normalised)

    if (changed.length > 0) {
      updateDealStage(changed.map(d => ({ id: d.id, stage: d.stage, position: d.position }))).then(
        (result) => {
          if (result.error) {
            toast.error(result.error)
            router.refresh()
          }
        }
      )
    }
  }

  function handleAddDeal(stage: DealStage) {
    setEditingDeal(null)
    setDefaultStage(stage)
    setFormOpen(true)
  }

  function handleEditDeal(deal: DealWithLead) {
    setEditingDeal(deal)
    setDefaultStage(deal.stage)
    setFormOpen(true)
  }

  async function handleSave(data: DealFormFields) {
    const result = editingDeal
      ? await updateDeal(editingDeal.id, data)
      : await createDeal(data)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(editingDeal ? 'Negócio atualizado com sucesso.' : 'Negócio criado com sucesso.')
    setFormOpen(false)
    setEditingDeal(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Horizontal scroll container */}
        <div className="flex gap-4 pb-3 overflow-x-auto min-h-0 flex-1 px-1 kanban-scroll">
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={dealsByStage(stage)}
              onAddDeal={handleAddDeal}
              onEditDeal={handleEditDeal}
              members={members}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeDeal && (
            <DealCard deal={activeDeal} onEdit={() => {}} overlay members={members} />
          )}
        </DragOverlay>
      </DndContext>

      <DealForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingDeal(null) }}
        onSave={handleSave}
        deal={editingDeal}
        defaultStage={defaultStage}
        leads={leads}
        members={members}
      />
    </div>
  )
}
