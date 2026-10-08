import "./globals.css";
export const metadata = { title: "Chief of Staff · Brown Sugar Bakery", robots: { index: false, follow: false } };
export const viewport = { width: "device-width", initialScale: 1 };
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="bar">Life is sweet</div>
        <header className="nav">
          <a className="brand" href="/">Chief of Staff</a>
          <nav><a href="/">Latest</a><a href="/search">History</a></nav>
        </header>
        {children}
        <footer className="foot">Life is sweet<span>Made in Chicago · Since 2004</span></footer>
      </body>
    </html>
  );
}
