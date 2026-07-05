import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/nav'
import { MarketingFooter } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'PipeFlow CRM — Pipeline de vendas visual para times e freelancers',
  description:
    'Organize leads, negócios e atividades num Kanban visual. Aumente sua conversão com o PipeFlow, o CRM feito para times de vendas e freelancers.',
  openGraph: {
    title: 'PipeFlow CRM — Pipeline de vendas visual para times e freelancers',
    description:
      'Organize leads, negócios e atividades num Kanban visual. Aumente sua conversão com o PipeFlow.',
    images: ['/og-image.png'],
  },
}

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
