import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiEdit3, FiUsers, FiVideo, FiZap, FiCheck, FiStar, FiTarget } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Hero3D from '../components/Hero3D';
import StatsCounter from '../components/StatsCounter';
import { subjects } from '../data/seedData';
import SubjectCard from '../components/SubjectCard';

gsap.registerPlugin(ScrollTrigger);

const PLATFORM_FEATURES = [
  {
    icon: '✦',
    title: 'Real PYQ Solutions',
    desc: 'Every question comes with step-by-step solutions extracted directly from PYQ books — not AI-generated guesses.',
    color: 'var(--color-accent)',
  },
  {
    icon: '⚡',
    title: 'Instant Answer Check',
    desc: 'Submit your answer and instantly see if you got it right, with a detailed explanation of the correct approach.',
    color: 'var(--color-accent-cyan)',
  },
  {
    icon: '◈',
    title: 'Subject-wise Filtering',
    desc: 'Filter by subject, year, difficulty, and topic. Practice exactly what you need — like Testbook but free.',
    color: '#a855f7',
  },
  {
    icon: '⬡',
    title: 'Drawing Board',
    desc: 'Sketch DFA diagrams, memory maps, tree structures, and computation graphs directly in the browser with our powerful Drawing Board.',
    color: 'var(--color-accent-green)',
  },
];

const WHY_GATEFORGE = [
  { label: 'Step-by-step PYQ solutions', has: true },
  { label: 'Instant answer verification', has: true },
  { label: 'Subject-wise filtering', has: true },
  { label: 'Drawing board for diagrams', has: true },
  { label: 'Community notes & discussions', has: true },
  { label: 'Curated video lecture links', has: true },
  { label: '30 years of GATE PYQs', has: true },
];

const LandingPage = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);

  const featuredSubjects = subjects.slice(0, 4);

  useEffect(() => {
    // Hero Entrance Animation
    const tl = gsap.timeline();

    tl.fromTo(titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
    )
    .fromTo(subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    )
    .fromTo(ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );

    // Scroll Animations for Features
    if (featuresRef.current) {
      const featureCards = Array.from(featuresRef.current.children);
      gsap.fromTo(featureCards,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="landing-page" style={{ position: 'relative' }}>

      {/* Hero Section */}
      <section className="section" ref={heroRef} style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <Hero3D />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '800px' }}>
            {/* Badge */}
            <div ref={titleRef} style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)',
                borderRadius: '20px', padding: '0.35rem 1rem', marginBottom: 'var(--space-md)',
              }}>
                <FiZap style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                  GATE CSE 2025 — 1500+ PYQs WITH SOLUTIONS
                </span>
              </div>

              <h1 className="huge-title" style={{ marginBottom: 'var(--space-lg)' }}>
                FORGE YOUR<br />
                <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--color-accent)' }}>GATE RANK.</span>
              </h1>
            </div>

            <p ref={subtitleRef} style={{ fontSize: '1.25rem', maxWidth: '580px', marginBottom: 'var(--space-xl)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              GATEForge is your all-in-one GATE CSE prep platform — 30 years of PYQs with real book solutions, instant answer checking, Drawing Board, and community notes. Inspired by Testbook, built better.
            </p>

            <div ref={ctaRef} style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link to="/pyq/all" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                START PRACTICE <FiArrowRight />
              </Link>
              <Link to="/subjects" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                BROWSE SUBJECTS
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: 'var(--space-xl)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {[1,2,3,4,5].map(i => <FiStar key={i} style={{ color: '#facc15', fontSize: '0.875rem', fill: '#facc15' }} />)}
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Top-rated by GATE 2024 qualifiers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiTarget style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Official GATE PYQ book answers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-lg) 0', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
          <div style={{ flex: 1, borderRight: '1px solid var(--color-border)', paddingRight: 'var(--space-lg)', minWidth: '120px' }}>
            <StatsCounter end={14} label="CORE SUBJECTS" duration={2000} />
          </div>
          <div style={{ flex: 1, borderRight: '1px solid var(--color-border)', paddingRight: 'var(--space-lg)', minWidth: '120px' }}>
            <StatsCounter end={1500} label="PYQ QUESTIONS" suffix="+" duration={2500} />
          </div>
          <div style={{ flex: 1, borderRight: '1px solid var(--color-border)', paddingRight: 'var(--space-lg)', minWidth: '120px' }}>
            <StatsCounter end={30} label="YEARS OF GATE" suffix="+" duration={2000} />
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <StatsCounter end={5000} label="ACTIVE STUDENTS" suffix="+" duration={3000} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="title-mono" style={{ marginBottom: 'var(--space-sm)' }}>// PLATFORM CAPABILITIES</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', textTransform: 'uppercase' }}>Everything You Need<br />to Crack GATE</h2>
          </div>

          <div className="grid-2" ref={featuresRef}>
            {PLATFORM_FEATURES.map((feat, i) => (
              <div key={i} className="card-solid" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '2rem', color: feat.color, marginBottom: 'var(--space-md)', fontFamily: 'var(--font-mono)' }}>
                  {feat.icon}
                </div>
                <h3 style={{ textTransform: 'uppercase', marginBottom: 'var(--space-sm)', color: 'var(--color-text-primary)' }}>
                  {feat.title}
                </h3>
                <p style={{ marginBottom: 0 }}>{feat.desc}</p>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                  background: `linear-gradient(90deg, ${feat.color}, transparent)`,
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why GATEForge — Platform Comparison */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-2xl)', alignItems: 'center' }}>
            <div>
              <div className="title-mono" style={{ marginBottom: 'var(--space-sm)' }}>// WHY GATEFORGE</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>
                Built for Serious<br />GATE Aspirants
              </h2>
              <p style={{ marginBottom: 'var(--space-xl)' }}>
                Unlike other platforms, GATEForge gives you real PYQ book answers — not generic explanations.
                Practice with confidence knowing every answer is verified from official sources.
              </p>
              <Link to="/pyq/all" className="btn btn-primary">
                PRACTICE NOW <FiArrowRight />
              </Link>
            </div>

            <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
              <div style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                GATEForge Includes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {WHY_GATEFORGE.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: item.has ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,51,51,0.1)',
                      border: `1px solid ${item.has ? 'var(--color-accent-green)' : 'var(--color-accent-red)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiCheck style={{ fontSize: '12px', color: item.has ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Preview Section */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <div className="title-mono" style={{ marginBottom: 'var(--space-sm)' }}>// ALL SUBJECTS</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', textTransform: 'uppercase' }}>Master by Subject</h2>
            </div>
            <Link to="/subjects" className="btn btn-ghost">ALL SUBJECTS <FiArrowRight /></Link>
          </div>

          <div className="grid-4">
            {featuredSubjects.map((subject, index) => (
              <SubjectCard key={subject.id} subject={subject} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ padding: 'var(--space-4xl) 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="title-mono" style={{ marginBottom: 'var(--space-md)' }}>// START YOUR JOURNEY</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>
              GATE 2027 IS<br />APPROACHING FAST.
            </h2>
            <p style={{ textAlign: 'center', margin: '0 auto var(--space-xl)', maxWidth: '500px' }}>
              Join thousands of aspirants who trust GATEForge for serious GATE CSE preparation.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/pyq/all" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
                START PRACTICE <FiArrowRight />
              </Link>
              <Link to="/auth" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
                CREATE ACCOUNT
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
