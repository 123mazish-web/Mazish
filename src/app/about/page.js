'use client'

import React from 'react'
import { Send, Phone, MessageSquare, MapPin, Inbox, Compass, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const handleSubmitContact = (e) => {
    e.preventDefault()
    alert('Message received. Our luxury concierge team will respond within 24 hours.')
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-300">
      {/* Editorial Header */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-center border-b border-zinc-900">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-[10px] font-semibold text-amber-500 tracking-[0.4em] uppercase">
            Our Legacy & Identity
          </span>
          <h1 className="font-luxury text-4xl sm:text-6xl text-white tracking-widest leading-tight">
            THE MAZISH IDENTITY
          </h1>
          <div className="h-[1px] w-20 bg-amber-500/30 mx-auto"></div>
          <p className="text-zinc-400 text-base font-light leading-relaxed max-w-2xl mx-auto">
            Mazish was founded to bridge the gap between global luxury and Bangladeshi statement wear. We represent the pinnacle of curated elegance.
          </p>
        </div>
      </section>

      {/* Brand Vision Editorial */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <span className="text-amber-500 text-xs tracking-widest font-semibold uppercase">The Statement</span>
          <h2 className="font-luxury text-3xl sm:text-4xl text-white tracking-wider">Beyond Sunglasses</h2>
          <p className="text-zinc-400 font-light text-sm leading-relaxed">
            While we launch with our signature, handcrafted sunglasses collection, Mazish is engineered to be a holistic hub of fashion and luxury in Bangladesh. Sunglasses are just the introductory chapter.
          </p>
          <p className="text-zinc-500 font-light text-sm leading-relaxed">
            Our designers are currently collaborating with top artisans to create limited-edition streetwear capsules, bespoke accessory lines, and high-fashion essentials. Every piece carries the Mazish emblem of quality and exclusivity.
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-white font-bold border-b border-amber-500 pb-2">
              Explore Roadmap
              <Compass size={14} className="text-amber-500" />
            </div>
          </div>
        </div>

        <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-900/40">
          <img
            src="/images/sunglasses-2.png"
            alt="Mazish Brand Editorial"
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 border-t border-zinc-900 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-amber-500 text-xs tracking-widest font-semibold uppercase">Concierge</span>
            <h2 className="font-luxury text-3xl sm:text-5xl text-white tracking-wider">Get in Touch</h2>
            <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
              <div className="space-y-6">
                <h3 className="font-luxury text-2xl text-white tracking-wide">Direct Access</h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed max-w-sm">
                  Our customer care and order confirmation suite is available 24/7. Reach out directly for customization or fast delivery requests.
                </p>
              </div>

              <div className="space-y-4 text-sm font-light">
                <a
                  href="https://www.instagram.com/123mazish/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-amber-500/30 transition-colors"
                >
                  <MessageSquare size={20} className="text-amber-500" />
                  <div>
                    <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider">Instagram Connect</h4>
                    <p className="text-zinc-400 text-xs mt-0.5">Follow and direct message us on Instagram</p>
                  </div>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61590005602732"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-amber-500/30 transition-colors"
                >
                  <MessageSquare size={20} className="text-amber-500" />
                  <div>
                    <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider">Facebook Customer Care</h4>
                    <p className="text-zinc-400 text-xs mt-0.5">Follow and message our Facebook page</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Form */}
            <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-900 p-8 rounded-2xl">
              <form onSubmit={handleSubmitContact} className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase border-b border-zinc-850 pb-4">
                  Send a Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="Your Email"
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write details about your query..."
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 text-zinc-950 font-bold uppercase tracking-widest text-xs py-4 rounded-full hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                >
                  Send Message
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
