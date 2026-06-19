export default function DashboardPage(): React.JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bem-vindo ao PipeFlow CRM
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Leads Ativos', value: '0' },
          { label: 'Negócios Abertos', value: '0' },
          { label: 'Receita do Mês', value: 'R$ 0' },
          { label: 'Taxa de Conversão', value: '0%' },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
