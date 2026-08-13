export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-neutral-50 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} Airbnb Clone. Built for a fullstack assignment — not affiliated with Airbnb, Inc.</p>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Sitemap</span>
        </div>
      </div>
    </footer>
  );
}
