import React, { useState, useEffect } from 'react';

function Clock() {
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
    // Reduced to text-4xl to match the Playlist title size
    <div 
      className="font-mono text-4xl font-bold text-[#FFD1D1]"
    >
      {time}
    </div>
  );
}

export default Clock;