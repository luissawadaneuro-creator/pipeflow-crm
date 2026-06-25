import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps {
  breadcrumb?: string
}

export function Header({ breadcrumb }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6">
      <div className="text-sm text-muted-foreground">
        {breadcrumb ?? 'PipeFlow CRM'}
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
