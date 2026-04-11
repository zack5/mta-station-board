import React from 'react';

const LastUpdateTime: React.FC<{ lastReceivedAt: Date | null }> = ({ lastReceivedAt }) => {
  const hours = lastReceivedAt ? (lastReceivedAt.getHours() % 12 || 12).toString() : '00';
  const minutes = lastReceivedAt ? lastReceivedAt.getMinutes().toString().padStart(2, '0') : '00';
  const seconds: string = lastReceivedAt ? `${lastReceivedAt.getSeconds().toString().padStart(2, '0')}` : ':00';
  const hoursMinutesSeconds = `Last updated ${hours}:${minutes}:${seconds}`;
  
  return (
    <div className="last-update-time">
      {lastReceivedAt && <span className="text-light">{hoursMinutesSeconds}</span>}
    </div>
  );
};

export default LastUpdateTime;
