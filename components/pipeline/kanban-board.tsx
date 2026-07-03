'use client'

import { useState, useCallback } from 'react'
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
import { DealForm } from '@/components/pipeline/deal-form'
import { MOCK_DEALS, PIPELINE_MEMBERS } from '@/lib/mock-pipeline'
import type { Deal, DealStage } from '@/types'

const STAGES: DealStage[] = ['new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost']

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
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

    setDeals(prev => {
      const activeDeal = prev.find(d => d.id === activeId)
      if (!activeDeal) return prev

      // If dropped on a card in the same column, reorder
      if (over && over.id !== activeId) {
        const overId = over.id as string
        const overDeal = prev.find(d => d.id === overId)
        if (overDeal && overDeal.stage === activeDeal.stage) {
          const stageDeals = prev
            .filter(d => d.stage === activeDeal.stage)
            .sort((a, b) => a.position - b.position)
          const oldIdx = stageDeals.findIndex(d => d.id === activeId)
          const newIdx = stageDeals.findIndex(d => d.id === overId)
          if (oldIdx !== -1 && newIdx !== -1) {
            const reordered = arrayMove(stageDeals, oldIdx, newIdx).map((d, i) => ({
              ...d,
              position: i,
            }))
            return prev.map(d => reordered.find(r => r.id === d.id) ?? d)
          }
        }
      }

      // Always normalise positions for all stages (handles cross-column drops too)
      const stageMap = new Map<DealStage, Deal[]>()
      for (const d of prev) {
        const list = stageMap.get(d.stage) ?? []
        list.push(d)
        stageMap.set(d.stage, list)
      }
      const normalised: Deal[] = []
      stageMap.forEach((list) => {
        list.sort((a, b) => a.position - b.position)
        list.forEach((d, i) => normalised.push({ ...d, position: i }))
      })
      return normalised
    })
  }

  function handleAddDeal(stage: DealStage) {
    setEditingDeal(null)
    setDefaultStage(stage)
    setFormOpen(true)
  }

  function handleEditDeal(deal: Deal) {
    setEditingDeal(deal)
    setDefaultStage(deal.stage)
    setFormOpen(true)
  }

  function handleSave(data: {
    title: string
    value: string
    lead_id: string
    assigned_to: string
    stage: DealStage
    deadline: string
  }) {
    const valueNum = parseFloat(data.value.replace(',', '.')) || 0

    if (editingDeal) {
      setDeals(prev =>
        prev.map(d =>
          d.id === editingDeal.id
            ? {
                ...d,
                title: data.title,
                value: valueNum,
                lead_id: data.lead_id || null,
                assigned_to: data.assigned_to || null,
                stage: data.stage,
                deadline: data.deadline ? `${data.deadline}T00:00:00Z` : null,
                updated_at: new Date().toISOString(),
              }
            : d
        )
      )
    } else {
      const stageDeals = deals.filter(d => d.stage === data.stage)
      const newDeal: Deal = {
        id: `d${Date.now()}`,
        workspace_id: 'ws-1',
        title: data.title,
        value: valueNum,
        stage: data.stage,
        lead_id: data.lead_id || null,
        assigned_to: data.assigned_to || null,
        deadline: data.deadline ? `${data.deadline}T00:00:00Z` : null,
        position: stageDeals.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setDeals(prev => [...prev, newDeal])
    }

    setFormOpen(false)
    setEditingDeal(null)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Horizontal scroll container */}
        <div className="flex gap-4 pb-6 overflow-x-auto min-h-0 flex-1 px-1">
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={dealsByStage(stage)}
              onAddDeal={handleAddDeal}
              onEditDeal={handleEditDeal}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeDeal && (
            <DealCard deal={activeDeal} onEdit={() => {}} overlay />
          )}
        </DragOverlay>
      </DndContext>

      <DealForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingDeal(null) }}
        onSave={handleSave}
        deal={editingDeal}
        defaultStage={defaultStage}
      />
    </>
  )
}
