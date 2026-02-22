import { useEffect, useMemo, useState } from 'react';
import Select, { type StylesConfig } from 'react-select';

import stationsData from '../generated/stations.json';

import type { StationInfoData } from '../types/types';

interface StationOption {
  value: string;
  label: string;
  optionLabel: string;
}

interface StationSelectorProps {
  stationId: string;
  onStationChange: (id: string) => void;
}

export function StationSelector({ stationId, onStationChange }: StationSelectorProps) {
  const stations = stationsData as StationInfoData;

  const options = useMemo(() => {
    return Object.entries(stations).map(([id, info]) => ({
      value: id,
      label: info.stopName,
      optionLabel: info.displayName
    }));
  }, []);

  const [clientWidth, setClientWidth] = useState<number>(0);
  const [surfaceWidth, setSurfaceWidth] = useState<number>(0);
  const isDesktop = clientWidth > 800; // Keep in sync with css media query

  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector('header');
    
    const handleResize = () => {
      if (root) {
        setClientWidth(root.offsetWidth);
      }
      if (header) {
        setSurfaceWidth(header.offsetWidth);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentOption = options.find((opt) => opt.value === stationId);

  const customStyles: StylesConfig<StationOption, false> = {
    // 1. Remove the "box" and match h1 height
    control: (base) => ({
      ...base,
      background: "none",
      border: "none",
      boxShadow: "none",
      minHeight: "0", 
      cursor: "pointer",
    }),
    // 2. Inherit h1 typography (Size, Weight, Color)
    singleValue: (base) => ({
      ...base,
      color: "inherit",
      fontSize: "inherit",
      fontWeight: "inherit",
      margin: 0,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: 0,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      fontSize: "1rem", 
      fontWeight: "normal",
      backgroundColor: "var(--color-background, #1a1a1a)", 
      width: "max-content",
      maxWidth: surfaceWidth
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected 
        ? "var(--color-accent,rgb(76, 76, 76))" 
        : isFocused 
        ? "#333" 
        : "transparent",
    
      color: isSelected ? "#fff" : "var(--color-text, #fff)",
    
      cursor: "pointer",
      fontSize: isDesktop ? "1.5rem" : "1rem",
    
      ":active": {
        backgroundColor: "var(--color-accent, #27ae60)",
      },
    }),
    input: (base) => ({
        ...base,
        // Use your text variable so it matches the H1
        color: "var(--color-text, #fff)",
      }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <h1>
      <Select<StationOption, false>
        placeholder="Select a station"
        value={currentOption}
        styles={customStyles}
        options={options} 
        onChange={(opt) => onStationChange(opt?.value || '')}
        components={{ 
          IndicatorSeparator: null
        }}
        formatOptionLabel={(option, { context }) => {
          return (context === 'menu') ? option.optionLabel : option.label;
        }}
      />
    </h1>
  );
}
