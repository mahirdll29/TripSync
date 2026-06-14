import Link from "next/link"
import { Plane, Users, Star, Building2, ArrowRight, Sparkles } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-accent flex items-center justify-center">
              <Plane size={16} className="text-white -rotate-45" />
            </div>
            <span className="text-lg font-bold text-text-primary">TripSync</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover hover:shadow-accent transition-all active:scale-[0.97]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,107,53,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(0,201,167,0.06)_0%,transparent_50%)]" />
        <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-accent-soft border border-accent/20 rounded-full text-xs font-medium text-accent">
            <Sparkles size={12} /> Stop losing hotel links in group chats
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-text-primary leading-[1.1] mb-6 max-w-3xl mx-auto">
            Plan group trips
            <br />
            <span className="text-accent">without the chaos</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            One shared space for all hotel recommendations. Organize by city,
            shortlist your favorites, and never lose a booking link again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent rounded-[var(--radius-md)] text-base font-semibold text-white hover:bg-accent-hover hover:shadow-accent transition-all active:scale-[0.97]"
            >
              Start Planning <ArrowRight size={16} />
            </Link>
          </div>

          {/* Animated plane path */}
          <div className="mt-16 relative max-w-2xl mx-auto h-32">
            <svg viewBox="0 0 600 100" className="w-full h-full" fill="none">
              <path
                d="M50 80 Q150 10 300 50 Q450 90 550 20"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeDasharray="8 6"
                opacity="0.3"
              />
              <circle cx="50" cy="80" r="4" fill="var(--color-accent)" opacity="0.5" />
              <circle cx="300" cy="50" r="4" fill="var(--color-teal)" opacity="0.5" />
              <circle cx="550" cy="20" r="4" fill="var(--color-accent)" opacity="0.5" />
              <text x="40" y="98" fill="var(--color-text-tertiary)" fontSize="10">Delhi</text>
              <text x="280" y="70" fill="var(--color-text-tertiary)" fontSize="10">Nainital</text>
              <text x="530" y="15" fill="var(--color-text-tertiary)" fontSize="10">Rishikesh</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-12">
            Everything your group trip needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Building2 size={22} className="text-accent" />,
                title: "Organize Hotels",
                description:
                  "Add hotels by city. Auto-detect Agoda, MakeMyTrip, Airbnb and more from URLs. Keep notes and prices together.",
              },
              {
                icon: <Users size={22} className="text-teal" />,
                title: "Collaborate in Real Time",
                description:
                  "Share one invite link. Everyone adds their finds. No more scrolling through 100 WhatsApp messages.",
              },
              {
                icon: <Star size={22} className="text-warning" />,
                title: "Personal Shortlists",
                description:
                  "Star your favorites without affecting the group list. Compare across trips in your private shortlist.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-bg-surface border border-border-default rounded-[var(--radius-lg)] hover:border-border-strong transition-all"
              >
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-bg-surface-hover flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create a trip",
                desc: "Name it, pick an emoji, you're live.",
              },
              {
                step: "02",
                title: "Share the link",
                desc: "One invite link — paste it in your group chat.",
              },
              {
                step: "03",
                title: "Collect & compare",
                desc: "Everyone drops hotel links. Star your favorites.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-soft text-accent font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to plan your next trip?
          </h2>
          <p className="text-text-secondary mb-8">
            Free forever. No credit card required.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent rounded-[var(--radius-md)] text-base font-semibold text-white hover:bg-accent-hover hover:shadow-accent transition-all active:scale-[0.97]"
          >
            Sign up with Google <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between text-xs text-text-tertiary">
          <p>© 2025 TripSync. Built with ❤️ for travelers.</p>
          <div className="flex items-center gap-2">
            <Plane size={12} className="text-accent" />
            <span>TripSync</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
