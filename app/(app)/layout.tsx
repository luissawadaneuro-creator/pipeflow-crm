export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 shrink-0 border-r border-border bg-card px-4 py-6">
        <div className="mb-8 flex items-center gap-2">
          <span className="text-xl font-bold text-primary">PipeFlow</span>
        </div>
        <nav className="space-y-1">
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Leads', href: '/leads' },
            { label: 'Pipeline', href: '/pipeline' },
            { label: 'Configurações', href: '/settings' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
