import React, { useState, useEffect } from 'react';

function Clock() {
  // Helper: Format date as HH:MM:SS (24-hour format)
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const [time, setTime] = useState(formatTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center p-5 bg-[var(--color-background-primary)] w-fit rounded-md">
      <div 
        className="font-mono text-6xl font-bold tracking-widest text-[var(--color-text-highlight-coral)] slashed-zero"
      >
        {time}
      </div>
    </div>
  );
}

export default Clock;