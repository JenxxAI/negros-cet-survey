import './globals.css'

export const metadata = {
  title: 'Negros CET Survey — Help Me Build a Free Reviewer',
  description: 'Share your college entrance exam experience and help me build a free reviewer for students in Negros.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
