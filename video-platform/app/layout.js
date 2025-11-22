import './globals.css'

export const metadata = {
  title: 'WebVid - Your Video Platform',
  description: 'Upload, share, and watch videos for free',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}