import { useState } from 'react'

/**
 * Full-width newsletter signup section — placed between page content and footer.
 * Industry standard: ASOS, H&M, Zara all use this pattern.
 * This is a marketing section, NOT part of the footer.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section
      className="bg-gray-900 py-14 px-4 sm:px-6 lg:px-8"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
          Stay connected
        </p>
        <h2
          id="newsletter-heading"
          className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight"
        >
          Get exclusive deals & new arrivals
        </h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Join thousands of shoppers. Be the first to know about new products,
          special offers, and style inspiration.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/20 border border-emerald-500/30 px-6 py-3 text-emerald-400 text-sm font-medium">
            <span>✓</span> You're subscribed — thanks!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            aria-label="Newsletter signup"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 rounded-full border border-gray-700 bg-gray-800 px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-gray-600">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}
