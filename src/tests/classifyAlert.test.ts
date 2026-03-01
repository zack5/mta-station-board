import { describe, it, expect } from 'vitest';
import { AlertCategory } from '../types/types';
import { classifyAlert } from '../utils/alertUtils';

describe('classifyAlert', () => {
  // 1. PART_SUSPENDED (Highest Priority)
  describe('PART_SUSPENDED', () => {
    it('detects "no trains between"', () => {
      const result = classifyAlert('Service Alert', 'There are no trains between Kings Hwy and Church Av');
      expect(result).toBe(AlertCategory.PART_SUSPENDED);
    });

    it('detects "suspended between"', () => {
      const result = classifyAlert('Partial Suspension', 'Service is suspended between 96 St and 145 St');
      expect(result).toBe(AlertCategory.PART_SUSPENDED);
    });

    it('detects "skips"', () => {
      const result = classifyAlert('Express to Local', 'The A train skips 50 St');
      expect(result).toBe(AlertCategory.PART_SUSPENDED);
    });

    it('detects "partially suspended"', () => {
      const result = classifyAlert('Alert', 'Service is partially suspended');
      expect(result).toBe(AlertCategory.PART_SUSPENDED);
    });

    it('detects "no... bound"', () => {
      const result = classifyAlert('Alert', 'In Lower Manhattan and Brooklyn, no Queens-bound A at Spring St, Canal St, Chambers St, Fulton St and High St');
      expect(result).toBe(AlertCategory.PART_SUSPENDED);
    });
  });

  // 2. SUSPENDED
  describe('SUSPENDED', () => {
    it('detects full service suspension', () => {
      const result = classifyAlert('Service Suspended', 'Service is suspended on the J line');
      expect(result).toBe(AlertCategory.SUSPENDED);
    });

    it('detects "trains not running"', () => {
      const result = classifyAlert('Severe Weather', 'Trains are not running due to flooding');
      expect(result).toBe(AlertCategory.SUSPENDED);
    });

    it('detects "no trains running"', () => {
      const result = classifyAlert('Alert', 'No trains running at this time');
      expect(result).toBe(AlertCategory.SUSPENDED);
    });
  });

  // 3. REROUTE
  describe('REROUTE', () => {
    it('detects "running via"', () => {
      const result = classifyAlert('Route Change', 'Southbound trains are running via the F line');
      expect(result).toBe(AlertCategory.REROUTE);
    });

    it('detects "runs via"', () => {
      const result = classifyAlert('Route Change', 'In Manhattan and Queens, R runs via Roosevelt Island F in both directions between 57 St-7 Av and 36 St');
      expect(result).toBe(AlertCategory.REROUTE);
    });

    it('detects "rerouted"', () => {
      const result = classifyAlert('Reroute', 'Trains are rerouted');
      expect(result).toBe(AlertCategory.REROUTE);
    });
  });

  // 4. REDUCED_SERVICE
  describe('REDUCED_SERVICE', () => {
    it('detects "terminating at"', () => {
      const result = classifyAlert('Short Turn', 'Trains are terminating at Bowling Green');
      expect(result).toBe(AlertCategory.REDUCED_SERVICE);
    });

    it('detects "no express service"', () => {
      const result = classifyAlert('Local Only', 'There is no express service');
      expect(result).toBe(AlertCategory.REDUCED_SERVICE);
    });
  });

  // 5. DELAYS
  describe('DELAYS', () => {
    it('detects simple delays', () => {
      const result = classifyAlert('Delays', 'Southbound trains are running with delays');
      expect(result).toBe(AlertCategory.DELAYS);
    });
  });

  // 6. ACCESSIBILITY
  describe('ACCESSIBILITY', () => {
    it('detects elevator outages', () => {
      const result = classifyAlert('Elevator Outage', 'The elevator at 14 St is out of service');
      expect(result).toBe(AlertCategory.ACCESSIBILITY);
    });

    it('detects escalator issues', () => {
      const result = classifyAlert('Escalator', 'Escalator 345 is under repair');
      expect(result).toBe(AlertCategory.ACCESSIBILITY);
    });
  });

  // 7. PLANNED_WORK
  describe('PLANNED_WORK', () => {
    it('detects planned maintenance', () => {
      const result = classifyAlert('Planned Work', 'Service change expected next week');
      expect(result).toBe(AlertCategory.PLANNED_WORK);
    });

    it('detects construction', () => {
      const result = classifyAlert('Construction', 'Station construction is ongoing');
      expect(result).toBe(AlertCategory.PLANNED_WORK);
    });
  });

  // 8. NOTICE (Fallback)
  describe('NOTICE', () => {
    it('falls back to NOTICE for unrecognized text', () => {
      const result = classifyAlert('Update', 'Please mask up');
      expect(result).toBe(AlertCategory.NOTICE);
    });
  });

  // 9. EDGE CASES & PRECEDENCE
  describe('Precedence & Edge Cases', () => {
    it('prioritizes PART_SUSPENDED over SUSPENDED', () => {
      // Logic: It matches "suspended between" (PART) before "service is suspended" (FULL)
      const text = 'Service is suspended between 3rd Ave and 5th Ave';
      const result = classifyAlert('Alert', text);
      expect(result).toBe(AlertCategory.PART_SUSPENDED);
    });

    it('is case insensitive', () => {
      // Assuming your normalize function handles lowercasing
      const result = classifyAlert('DELAYS', 'TRAINS ARE DELAYED');
      expect(result).toBe(AlertCategory.DELAYS);
    });

    it('handles empty strings gracefully', () => {
      const result = classifyAlert('', '');
      expect(result).toBe(AlertCategory.NOTICE);
    });
  });
});