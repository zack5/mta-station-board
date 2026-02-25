import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { type StylesConfig } from 'react-select';
import { matchSorter } from 'match-sorter';

import { useStationBoardContext } from '../context/StationBoardContext';

import stationsData from '../generated/stations.json';

import type { StationInfoData } from '../types/types';

interface StationOption {
  value: string;
  label: string;
  optionLabel: string;
  searchLabel: string;
}

const getLineIcons = (label: string) => {
  // Regex looks for content inside (...) 
  // e.g., "145 St (A,B,C,D)" -> "A,B,C,D"
  const match = label.match(/\(([^)]+)\)$/);
  if (!match) return [];    
  return match[1].split(',').map(line => line.trim());
};

const customFilterOption = (
  option: { data: StationOption & { searchLabel: string } }, 
  rawInput: string
) => {
  const cleanedInput = rawInput.replace(/\s+/g, '').toLowerCase();
  if (!cleanedInput) return true;

  // matchSorter now just looks at the pre-baked string
  const matches = matchSorter([option.data], cleanedInput, {
    keys: ['searchLabel'],
    threshold: matchSorter.rankings.CONTAINS,
  });

  return matches.length > 0;
};

interface StationSelectorProps {
  stationId: string;
}

export function StationSelector({ stationId }: StationSelectorProps) {
  const stations = stationsData as StationInfoData;

  const options = useMemo(() => {
    return Object.entries(stations).map(([id, info]) => ({
      value: id,
      label: info.stopName,
      optionLabel: info.displayName,
      searchLabel: info.displayName.replace(/\s+/g, '').toLowerCase()
    })).sort((a, b) => a.optionLabel.localeCompare(b.optionLabel));
  }, []);

  const { contentWidth, isMobile } = useStationBoardContext();
  const isDesktop = !isMobile;

  const navigate = useNavigate();

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
      marginBlock: "-0.15em",
      width: "100%"
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
      minWidth: 0,
      flexWrap: 'nowrap'
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      fontSize: "1rem", 
      fontWeight: "normal",
      backgroundColor: "var(--color-background, #1a1a1a)", 
      width: "max-content",
      maxWidth: contentWidth
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
    <h1 style={{maxWidth: contentWidth - (isDesktop ? 150 : 0)}}>
      <Select<StationOption, false>
        placeholder="Select a station"
        value={currentOption}
        styles={customStyles}
        maxMenuHeight={800}
        options={options} 
        onChange={(opt) => navigate(opt ? `/station/${opt.value}` : '/')}
        components={{ 
          IndicatorSeparator: null
        }}
        filterOption={customFilterOption}
        formatOptionLabel={(option, { context }) => {
            if (context === 'value') return option.label; // Shown when selected
          
            const lines = getLineIcons(option.optionLabel);
            // Remove the (A,B,C) part from the text so it's not redundant
            const cleanLabel = option.optionLabel.split('(')[0].trim();
          
            return (
              <div className='station-selector-label-container'>
                <span>{cleanLabel}</span>
                {lines.map((line) => (
                  <img 
                    key={line}
                    src={`/lines/${line.toLowerCase()}.svg`} 
                    alt={line}
                  />
                ))}
              </div>
            );
          }}
      />
    </h1>
  );
}
