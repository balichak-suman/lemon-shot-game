import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skip The Lemon Shot 🍋 | Reunion Party Game',
  description: 'The ultimate real-time reunion party mini-game app! Answer trivia, vote on spicy superlatives, pass the hot lemon bomb, and skip the lemon shot!',
  keywords: ['party game', 'reunion game', 'skip the lemon shot', 'jackbox style', 'kahoot style', 'drinking game'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍋</text></svg>" />
      </head>
      <body className="antialiased min-h-screen bg-[#071d0e] selection:bg-lemon-400 selection:text-forest-950">
        {children}
      </body>
    </html>
  );
}
