import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { BackToTop } from '../ui/BackToTop'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
