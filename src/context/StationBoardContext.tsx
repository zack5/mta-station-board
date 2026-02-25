import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface StationBoardContextType {
  clientWidth: number;
  contentWidth: number
  isMobile: boolean;
}

const StationBoardContext = createContext<StationBoardContextType | undefined>(undefined);

export const StationBoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clientWidth, setClientWidth] = useState<number>(0);
  const [contentWidth, setContentWidth] = useState<number>(0);

  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector('header');

    const handleResize = () => {
      if (root) {
        setClientWidth(root.offsetWidth);
      }
      if (header) {
        setContentWidth(header.offsetWidth);
      }
    };

    // Initial measurement
    handleResize();

    // Standard resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = clientWidth <= 800; // Keep in sync with css media query

  return (
    <StationBoardContext.Provider value={{ clientWidth, contentWidth, isMobile }}>
      {children}
    </StationBoardContext.Provider>
  );
};

export const useStationBoardContext = () => {
  const context = useContext(StationBoardContext);
  if (context === undefined) {
    throw new Error('useStationBoardContext must be used within a StationBoardProvider');
  }
  return context;
};