import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SubjectCard = ({ subject, delay = 0 }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [delay]);

  return (
    <Link
      to={`/pyq/${subject.id}`}
      className="subject-card"
      ref={cardRef}
    >
      <div className="subject-icon">
        {subject.icon}
      </div>
      <h3 style={{ textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>{subject.name}</h3>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', marginBottom: 'var(--space-md)' }}>
        [{subject.questionCount} Qs] // [{subject.syllabus.length} TOPICS]
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', minHeight: '60px' }}>
        {subject.description}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {subject.syllabus.slice(0, 2).map((topic, index) => (
          <span key={index} className="badge">
            {topic}
          </span>
        ))}
        {subject.syllabus.length > 2 && (
          <span className="badge">
            +{subject.syllabus.length - 2}
          </span>
        )}
      </div>
    </Link>
  );
};

export default SubjectCard;
