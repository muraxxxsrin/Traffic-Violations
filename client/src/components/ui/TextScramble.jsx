'use client';
import { useEffect, useState, useRef, useCallback } from 'react';

export function TextScramble({
  children,
  duration = 1.0,
  speed = 0.05,
  characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEF',
  className,
  autoTriggerInterval = 30000,
}) {
  const [displayText, setDisplayText] = useState(children);
  const isScrambling = useRef(false);
  const timerRef = useRef(null);

  const startScramble = useCallback(() => {
    if (isScrambling.current) return;
    isScrambling.current = true;

    let frame = 0;
    const totalFrames = duration / speed;
    const originalText = children.split('');

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      setDisplayText(
        originalText.map((char, i) => {
          if (char === ' ') return ' ';
          if (progress > i / originalText.length) return char;
          return characterSet[Math.floor(Math.random() * characterSet.length)];
        }).join('')
      );

      if (frame >= totalFrames) {
        clearInterval(interval);
        isScrambling.current = false;
      }
    }, speed * 1000);
  }, [children, duration, speed, characterSet]);

  useEffect(() => {
    startScramble();
    timerRef.current = setInterval(startScramble, autoTriggerInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startScramble, autoTriggerInterval]);

  return (
    <span
      className={className}
      onMouseEnter={startScramble}
      style={{ cursor: 'default' }}
    >
      {displayText}
    </span>
  );
}
