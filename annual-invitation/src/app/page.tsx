"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    guests: "0",
    dietary: "",
    attending: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setRsvpOpen(false);
      setSubmitted(false);
      setFormData({ name: "", email: "", department: "", guests: "0", dietary: "", attending: "" });
    }, 3000);
  };

  const eventDetails = [
    {
      icon: "📅",
      label: "Date",
      value: "Saturday, March 28, 2026",
    },
    {
      icon: "🕖",
      label: "Time",
      value: "7:00 PM - 11:30 PM",
    },
    {
      icon: "📍",
      label: "Venue",
      value: "The Grand Ballroom, Marriott Hotel",
    },
    {
      icon: "👔",
      label: "Dress Code",
      value: "Black Tie / Formal Evening Wear",
    },
  ];

  const highlights = [
    {
      title: "Gala Dinner",
      description: "A curated five-course dinner with fine wines and gourmet delicacies prepared by award-winning chefs.",
      image: "/images/dinner-table.jpg",
      fallback: "https://placehold.co/600x400/1a2a4a/d4a843/png?text=Gala+Dinner",
    },
    {
      title: "Awards Ceremony",
      description: "Celebrating outstanding achievements, milestones, and the exceptional contributions of our team members.",
      image: "/images/team-celebration.jpg",
      fallback: "https://placehold.co/600x400/1a2a4a/d4a843/png?text=Awards+Ceremony",
    },
    {
      title: "Live Entertainment",
      description: "Enjoy live music, DJ performances, a dance floor, and surprise entertainment acts throughout the evening.",
      image: "/images/confetti.jpg",
      fallback: "https://placehold.co/600x400/1a2a4a/d4a843/png?text=Live+Entertainment",
    },
  ];

  const timeline = [
    { time: "7:00 PM", event: "Arrival & Welcome Cocktails", desc: "Red carpet welcome with champagne and hors d'oeuvres" },
    { time: "7:45 PM", event: "Opening Address", desc: "Welcome speech by the CEO and leadership team" },
    { time: "8:15 PM", event: "Gala Dinner", desc: "Five-course dinner with wine pairings" },
    { time: "9:15 PM", event: "Awards Ceremony", desc: "Recognizing excellence and celebrating milestones" },
    { time: "10:00 PM", event: "Live Entertainment & Dancing", desc: "Live band, DJ, and open dance floor" },
    { time: "11:30 PM", event: "Grand Finale", desc: "Closing toast and farewell" },
  ];

  return (
    <div className="min-h-screen bg-navy">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-celebration.jpg"
            alt="Elegant celebration venue with warm lighting"
            fill
            className="object-cover"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/1920x1080/1a2a4a/d4a843/png?text=Annual+Celebration";
            }}
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        {/* Sparkle decorations */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-gold-light rounded-full animate-sparkle" />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-gold rounded-full animate-sparkle delay-300" />
        <div className="absolute bottom-40 left-32 w-1 h-1 bg-gold-light rounded-full animate-sparkle delay-500" />
        <div className="absolute top-60 right-40 w-2 h-2 bg-gold rounded-full animate-sparkle delay-700" />
        <div className="absolute bottom-60 right-16 w-1.5 h-1.5 bg-gold-light rounded-full animate-sparkle delay-200" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-gold-light tracking-widest uppercase text-sm mb-6 animate-fade-in opacity-0 delay-100 font-mono">
            You Are Cordially Invited
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 animate-fade-in-up opacity-0 delay-200">
            <span className="animate-shimmer">Annual</span>
          </h1>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-light mb-2 animate-fade-in-up opacity-0 delay-300 text-cream">
            Employee Celebration
          </h2>
          <h3 className="text-2xl md:text-4xl font-bold animate-fade-in-up opacity-0 delay-400 text-gold">
            Gala 2026
          </h3>

          <div className="divider-gold w-48 mx-auto my-8 animate-fade-in opacity-0 delay-500" />

          <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-10 animate-fade-in opacity-0 delay-500 leading-relaxed">
            An evening of elegance, recognition, and celebration honoring
            <span className="text-gold font-semibold"> our most valuable asset — you.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in opacity-0 delay-600">
            <button
              onClick={() => setRsvpOpen(true)}
              className="gold-gradient text-navy font-bold px-10 py-4 rounded-full text-lg tracking-wide hover:scale-105 transition-transform duration-300 shadow-lg shadow-gold/20"
            >
              RSVP Now
            </button>
            <a
              href="#details"
              className="border-2 border-gold/50 text-gold px-10 py-4 rounded-full text-lg tracking-wide hover:border-gold hover:bg-gold/10 transition-all duration-300"
            >
              View Details
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-gold/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-gold rounded-full animate-fade-in" />
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section id="details" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold-light tracking-widest uppercase text-sm mb-3 font-mono">
              Event Details
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-cream mb-4">
              Mark Your Calendar
            </h2>
            <div className="divider-gold w-32 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventDetails.map((detail, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 text-center hover:border-gold/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{detail.icon}</div>
                <p className="text-gold text-sm uppercase tracking-wider mb-2 font-mono">
                  {detail.label}
                </p>
                <p className="text-cream text-lg font-medium">{detail.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 px-4 bg-navy-light/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold-light tracking-widest uppercase text-sm mb-3 font-mono">
              What Awaits You
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-cream mb-4">
              Evening Highlights
            </h2>
            <div className="divider-gold w-32 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl overflow-hidden group hover:border-gold/40 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = item.fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-light to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gold mb-3">{item.title}</h3>
                  <p className="text-cream/70 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold-light tracking-widest uppercase text-sm mb-3 font-mono">
              Schedule
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-cream mb-4">
              Evening Timeline
            </h2>
            <div className="divider-gold w-32 mx-auto" />
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/0 via-gold/50 to-gold/0" />

            {timeline.map((item, index) => (
              <div
                key={index}
                className={`relative flex items-start mb-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-1/2 bg-gold rounded-full border-4 border-navy z-10 mt-2" />

                {/* Content */}
                <div
                  className={`ml-16 md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  }`}
                >
                  <span className="text-gold font-mono text-sm tracking-wider">
                    {item.time}
                  </span>
                  <h3 className="text-xl font-bold text-cream mt-1">{item.event}</h3>
                  <p className="text-cream/60 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/confetti.jpg"
            alt="Festive celebration atmosphere with confetti"
            fill
            className="object-cover opacity-20"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/1920x600/1a2a4a/d4a843/png?text=Join+Us";
            }}
          />
          <div className="absolute inset-0 bg-navy/80" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-gold-light tracking-widest uppercase text-sm mb-3 font-mono">
            Don&apos;t Miss Out
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6">
            Reserve Your Spot
          </h2>
          <p className="text-cream/70 text-lg mb-10 leading-relaxed">
            Join your colleagues for an unforgettable evening of celebration, recognition,
            and connection. Please RSVP by <span className="text-gold font-semibold">March 15, 2026</span>.
          </p>
          <button
            onClick={() => setRsvpOpen(true)}
            className="gold-gradient text-navy font-bold px-12 py-5 rounded-full text-xl tracking-wide hover:scale-105 transition-transform duration-300 shadow-lg shadow-gold/20"
          >
            RSVP Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gold/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold text-lg font-semibold mb-2">Annual Employee Celebration 2026</p>
          <p className="text-cream/50 text-sm mb-4">
            For questions or special accommodations, please contact HR at{" "}
            <span className="text-gold/80">events@company.com</span>
          </p>
          <p className="text-cream/30 text-xs">
            &copy; 2026 Company Inc. All rights reserved.
          </p>
        </div>
      </footer>

      {/* RSVP Modal */}
      {rsvpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-3xl max-w-lg w-full max-h-screen overflow-y-auto p-8 border border-gold/30">
            {!submitted ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gold">RSVP</h3>
                    <p className="text-cream/60 text-sm">Annual Celebration 2026</p>
                  </div>
                  <button
                    onClick={() => setRsvpOpen(false)}
                    className="text-cream/50 hover:text-cream text-2xl transition-colors"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-gold/80 text-sm mb-1.5 font-mono uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-navy/50 border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold focus:outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-gold/80 text-sm mb-1.5 font-mono uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-navy/50 border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold focus:outline-none transition-colors"
                      placeholder="your.email@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gold/80 text-sm mb-1.5 font-mono uppercase tracking-wider">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-navy/50 border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold focus:outline-none transition-colors"
                    >
                      <option value="">Select Department</option>
                      <option value="engineering">Engineering</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                      <option value="hr">Human Resources</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                      <option value="design">Design</option>
                      <option value="product">Product</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gold/80 text-sm mb-1.5 font-mono uppercase tracking-wider">
                      Will You Attend? *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="attending"
                          value="yes"
                          required
                          onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
                          className="accent-gold"
                        />
                        <span className="text-cream">Yes, I&apos;ll be there!</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="attending"
                          value="no"
                          onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
                          className="accent-gold"
                        />
                        <span className="text-cream">Regretfully, no</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gold/80 text-sm mb-1.5 font-mono uppercase tracking-wider">
                      Additional Guests
                    </label>
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="w-full bg-navy/50 border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold focus:outline-none transition-colors"
                    >
                      <option value="0">No additional guests</option>
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gold/80 text-sm mb-1.5 font-mono uppercase tracking-wider">
                      Dietary Requirements
                    </label>
                    <input
                      type="text"
                      value={formData.dietary}
                      onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                      className="w-full bg-navy/50 border border-gold/20 rounded-xl px-4 py-3 text-cream focus:border-gold focus:outline-none transition-colors"
                      placeholder="Vegetarian, vegan, allergies, etc."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full gold-gradient text-navy font-bold py-4 rounded-xl text-lg tracking-wide hover:scale-[1.02] transition-transform duration-300 mt-2"
                  >
                    Confirm RSVP
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-2xl font-bold text-gold mb-3">Thank You!</h3>
                <p className="text-cream/70 text-lg">
                  Your RSVP has been received. We look forward to celebrating with you!
                </p>
                <p className="text-cream/50 text-sm mt-4">
                  A confirmation email will be sent to your inbox shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
