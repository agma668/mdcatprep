'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, Sparkles, Zap, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'raast' | 'bank'>('easypaisa');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentPhone, setStudentPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const plans = [
    {
      id: 'medical-pass',
      name: 'Medical Full Season Pass',
      badge: 'Most Popular for MDCAT / NUMS',
      price: 'Rs. 2,999',
      originalPrice: 'Rs. 6,000',
      duration: 'Valid till Nov 2026 Exam',
      description: 'Complete PMDC MDCAT (UHS, SZABMU, KMU, DUHS) + NUMS Paper-II Psychology & Master Notes.',
      features: [
        'All Biology, Chemistry, Physics & English Question Banks',
        'NUMS 50-MCQ Psychological Test & Aptitude Bank',
        'Timed CBT Mock Tests with Provincial Merit Predictor',
        'Adaptive Mistake Notebook & Active Recall SRS',
        'High-Yield Master Concept Notes Reader',
      ],
      highlight: true,
    },
    {
      id: 'engineering-pass',
      name: 'Engineering NET Master Pass',
      badge: 'NUST, GIKI & LUMS',
      price: 'Rs. 2,500',
      originalPrice: 'Rs. 5,000',
      duration: 'Valid for NET Series 1-4',
      description: 'Advanced mathematics, engineering physics, chemistry and computer science for top engineering universities.',
      features: [
        'Advanced Calculus, Algebra & Trigonometry Bank',
        'Engineering Physics & Chemistry CBT Drills',
        'Full-Length NUST NET Timed Mock Simulators',
        'Formula Quick-Sheets & Past Paper Solutions',
        'Adaptive Weakness Targeter',
      ],
      highlight: false,
    },
    {
      id: 'usat-pass',
      name: 'HEC USAT & Regional Quota Pack',
      badge: 'USAT-M, USAT-E & Quotas',
      price: 'Rs. 1,500',
      originalPrice: 'Rs. 3,000',
      duration: 'Valid for 1 Year',
      description: 'Essential quantitative, verbal, and essay preparation for HEC Undergraduate Admissions and regional medical seats.',
      features: [
        'HEC USAT Quantitative & Verbal Reasoning Banks',
        'Balochistan & FATA Quota Exam Sample Drills',
        'Essay Composition & Grammar Modules',
        'Timed Aptitude Test Simulators',
      ],
      highlight: false,
    },
    {
      id: 'pma-pass',
      name: 'PMA & Defence Initial Pass',
      badge: 'PMA Long Course & ISSB',
      price: 'Rs. 1,500',
      originalPrice: 'Rs. 3,000',
      duration: 'Valid for 1 Year',
      description: 'Computerized initial intelligence tests and ISSB psychological preparation matrices.',
      features: [
        'Verbal & Non-Verbal Intelligence Matrix Banks',
        'Initial Academic Test (Math, English, GK, Islamiyat)',
        'ISSB Word Association & Picture Story Guide',
      ],
      highlight: false,
    },
    {
      id: 'all-access',
      name: 'Apex All-Access Lifetime Pass',
      badge: 'Ultimate Value',
      price: 'Rs. 5,999',
      originalPrice: 'Rs. 15,000',
      duration: 'Lifetime Access (All Tracks)',
      description: 'Zero restrictions. Full access to every single question bank, mock test, master note, and future update across all 5 tracks.',
      features: [
        'All Medical, Engineering, Defence & USAT Portals',
        'Unlimited Full-Length Mock Exams & Rank Predictor',
        'Priority AI Doubt Solving & Support',
        'All Future Exam Additions Included',
      ],
      highlight: true,
    },
  ];

  const handleEnroll = (planName: string) => {
    setSelectedPlan(planName);
    setIsModalOpen(true);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Navbar Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent animate-pulse"></span>
              APEX PAKISTAN
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/exams" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Explore Portals
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold shadow">
              Student Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Official Season Passes & Enrollment
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Invest in Your Admission, Not Expensive Academies
        </h1>
        <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-2xl mx-auto">
          Physical academies charge Rs. 30,000 to Rs. 70,000 for crowded classes and printed notes. Get the nation&apos;s apex question banks, timed CBT mock tests, and master notes at a fraction of the cost.
        </p>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-card border rounded-3xl p-8 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                plan.highlight ? 'border-accent shadow-accent/10 ring-2 ring-accent/20' : 'border-border'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow">
                  Recommended Best Seller
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                    {plan.badge}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{plan.duration}</span>
                </div>

                <h3 className="text-2xl font-extrabold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-border">
                  <span className="text-4xl font-black text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground line-through font-semibold">{plan.originalPrice}</span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What&apos;s Included:</div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleEnroll(plan.name)}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? 'bg-accent text-accent-foreground hover:opacity-90 shadow-accent/20'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted border border-border'
                }`}
              >
                <span>Enroll in Season Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ & Trust Section */}
      <section className="bg-card/40 border-t border-border py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-bold">Secure Local Payments in Pakistan</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            We support EasyPaisa, JazzCash, Raast Instant QR, and direct Bank Wire transfers across all major Pakistani banks. Instant digital activation upon receipt verification.
          </p>
        </div>
      </section>

      {/* Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSubmitted(false);
              }}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground text-sm font-bold"
            >
              ✕
            </button>

            {!submitted ? (
              <div>
                <div className="mb-6">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Secure Enrollment</span>
                  <h3 className="text-2xl font-extrabold text-foreground mt-1">{selectedPlan}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete your details below to receive payment instructions and instant portal activation.
                  </p>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Muhammad Ali"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">WhatsApp / Mobile Number (For Pass Activation)</label>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'easypaisa', name: 'EasyPaisa Mobile' },
                        { id: 'jazzcash', name: 'JazzCash Wallet' },
                        { id: 'raast', name: 'Raast Instant QR' },
                        { id: 'bank', name: 'Bank Transfer' },
                      ].map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                            paymentMethod === m.id
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border bg-background text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs uppercase tracking-wider shadow hover:opacity-90 transition-opacity"
                  >
                    Confirm & View Payment Instructions →
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-2xl font-bold">Enrollment Request Received!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Thank you, <span className="font-bold text-foreground">{studentName}</span>. Please send payment to our official merchant account and WhatsApp the screenshot confirmation to activate your pass instantly.
                </p>
                <div className="bg-background border border-border rounded-xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Account Title:</span> <span className="font-bold">Apex Pakistan Educational</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">EasyPaisa / JazzCash:</span> <span className="font-bold font-mono">0300-9876543</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Raast ID:</span> <span className="font-bold font-mono">APEX-PAKISTAN-EDU</span></div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSubmitted(false);
                  }}
                  className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider hover:bg-muted"
                >
                  Close & Return
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Apex Pakistan Educational Network. All rights reserved.</p>
      </footer>
    </div>
  );
}
