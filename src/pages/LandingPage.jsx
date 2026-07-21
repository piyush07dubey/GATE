import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiEdit3, FiUsers, FiVideo } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Hero3D from '../components/Hero3D';
import StatsCounter from '../components/StatsCounter';
import { subjects } from '../data/seedData';
import SubjectCard from '../components/SubjectCard';

gsap.registerPlugin(ScrollTrigger);

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
    const featureCards = featuresRef.current.children;
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
            <h1 ref={titleRef} className="huge-title" style={{ marginBottom: 'var(--space-lg)' }}>
              MASTER CONCEPTS.<br/>
              <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--color-accent)' }}>NOT FORMULAS.</span>
            </h1>
            
            <p ref={subtitleRef} style={{ fontSize: '1.5rem', maxWidth: '600px', marginBottom: 'var(--space-xl)', color: 'var(--color-text-secondary)' }}>
              A brutalist, data-driven platform for GATE CSE. Analyze 30 years of PYQs, execute interactive whiteboards, and leverage community knowledge.
            </p>
            
            <div ref={ctaRef} style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <Link to="/subjects" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                INITIALIZE SYLLABUS <FiArrowRight />
              </Link>
              <Link to="/auth" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                AUTHENTICATE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (Minimal) */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-lg) 0', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
          <div style={{ flex: 1, borderRight: '1px solid var(--color-border)', paddingRight: 'var(--space-lg)' }}>
            <StatsCounter end={14} label="CORE SUBJECTS" duration={2000} />
          </div>
          <div style={{ flex: 1, borderRight: '1px solid var(--color-border)', paddingRight: 'var(--space-lg)' }}>
            <StatsCounter end={1500} label="PYQ VECTORS" suffix="+" duration={2500} />
          </div>
          <div style={{ flex: 1 }}>
            <StatsCounter end={5000} label="ACTIVE NODES" suffix="+" duration={3000} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <h2 className="title-mono" style={{ marginBottom: 'var(--space-2xl)' }}>// SYSTEM CAPABILITIES</h2>
          
          <div className="grid-2" ref={featuresRef}>
            <div className="card-solid">
              <FiBookOpen style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: 'var(--space-md)' }} />
              <h3 style={{ textTransform: 'uppercase' }}>Structured Query Bank</h3>
              <p>Meticulously parsed and categorized previous year questions spanning decades. Filter by conceptual vectors and computational difficulty.</p>
            </div>
            
            <div className="card-solid">
              <FiEdit3 style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: 'var(--space-md)' }} />
              <h3 style={{ textTransform: 'uppercase' }}>Excalidraw Runtime</h3>
              <p>Integrated state-of-the-art vector drawing canvas. Draft DFA states, memory maps, and architectural diagrams directly in the browser.</p>
            </div>
            
            <div className="card-solid">
              <FiUsers style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: 'var(--space-md)' }} />
              <h3 style={{ textTransform: 'uppercase' }}>Distributed Notes</h3>
              <p>Access high-entropy cheat sheets, master theorems, and algorithm pseudo-codes maintained by top percentile nodes.</p>
            </div>
            
            <div className="card-solid">
              <FiVideo style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: 'var(--space-md)' }} />
              <h3 style={{ textTransform: 'uppercase' }}>Verified Origins</h3>
              <p>Aggregated pointers to optimal video lectures and theoretical documentation. Minimizing search time, maximizing comprehension.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Preview Section */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-2xl)' }}>
            <div>
              <h2 className="title-mono" style={{ marginBottom: 'var(--space-sm)' }}>// INDEXED DOMAINS</h2>
              <h3 style={{ fontSize: '2.5rem', textTransform: 'uppercase' }}>Master by Subject</h3>
            </div>
            <Link to="/subjects" className="btn btn-ghost">DUMP ALL SUBJECTS <FiArrowRight /></Link>
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
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>
              INITIALIZE YOUR<br/>TRAINING PIPELINE.
            </h2>
            <Link to="/auth" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
              BOOT SEQUENCE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
