import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'qTest Cycle Builder',
  description: 'Automate qTest test cycle creation from Test Design folders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <h1>qTest Cycle Builder</h1>
        </header>
        <main className="site-main">{children}</main>
      </body>
    </html>
  )
}
