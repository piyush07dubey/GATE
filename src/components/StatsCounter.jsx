import React, { useState, useEffect, useRef } from 'react';

const StatsCounter = ({ end, label, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    const startVal = countRef.current;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentCount = Math.floor(easeProgress * (end - startVal) + startVal);
      setCount(currentCount);
      
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    window.requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return (
    <div className="stat-card" ref={elementRef}>
      <div className="stat-number">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default StatsCounter;
