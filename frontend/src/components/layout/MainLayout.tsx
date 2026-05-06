import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { NewsletterSection } from './NewsletterSection'
import { Footer } from './Footer'
import { BackToTop } from '../ui/BackToTop'

/**
 * Main layout structure (industry standard):
 *
 * ┌─────────────────────────────┐
 * │  Sticky Navbar              │  ← always visible
 * ├─────────────────────────────┤
 * │  Page content (Outlet)      │  ← route-specific
 * ├─────────────────────────────┤
 * │  Newsletter section         │  ← full-width marketing (ASOS/H&M pattern)
 * ├─────────────────────────────┤
 * │  Footer                     │  ← navigation + legal only
 * └─────────────────────────────┘
 */
export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <NewsletterSection />
      <Footer />
      <BackToTop />
    </div>
  )
}
