import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timerId: ReturnType<typeof setInterval> = setInterval(() => {
      setTime(new Date());
    }, 990);

    return () => clearInterval(timerId);
  }, []);

  const hours = (time.getHours() % 12 || 12).toString();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const hoursMinutes = `${hours}:${minutes}`;
  
  const seconds: string = `:${time.getSeconds().toString().padStart(2, '0')}`;

  return (
    <div className="clock">
      <span className="text-bold">{hoursMinutes}</span>
      <span className="text-light">{seconds}</span>
    </div>
  );
};

export default Clock;
