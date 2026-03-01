import { AlertCategory } from '../types/types';
import { normalize } from './utils';

type Rule = {
  pattern: RegExp;
  weight: number;
};

type RuleSet = Record<AlertCategory, Rule[]>;

const RULES: RuleSet = {
  [AlertCategory.SUSPENDED]: [
    { pattern: /service (is )?suspended/, weight: 5 },
    { pattern: /trains? (are )?not running/, weight: 5 },
    { pattern: /no trains? (are )?running/, weight: 5 },
    { pattern: /\bfully suspended\b/, weight: 6 },
  ],

  [AlertCategory.PART_SUSPENDED]: [
    { pattern: /no trains? between/, weight: 6 },
    { pattern: /suspended between/, weight: 6 },
    { pattern: /\bno\s+(?:[a-z-]+-?bound\s+)?[a-z0-9]+\b.*\bat\b/, weight: 5 },
    { pattern: /partially suspended/, weight: 4 },
    { pattern: /\bskips?\b/, weight: 3 },
  ],

  [AlertCategory.REROUTE]: [
    { pattern: /\b(run|runs|running)\s+via\b/, weight: 4 },
    { pattern: /\brerouted\b/, weight: 4 },
    { pattern: /\bvia the\b/, weight: 2 },
  ],

  [AlertCategory.REDUCED_SERVICE]: [
    { pattern: /terminating at/, weight: 3 },
    { pattern: /last stop (will be|is)/, weight: 3 },
    { pattern: /no express service/, weight: 3 },
  ],

  [AlertCategory.DELAYS]: [
    { pattern: /\bdelays?\b/, weight: 3 },
    { pattern: /running late/, weight: 3 },
    { pattern: /expect.*delay/, weight: 3 },
  ],

  [AlertCategory.ACCESSIBILITY]: [
    { pattern: /\belevator\b/, weight: 3 },
    { pattern: /\bescalator\b/, weight: 3 },
    { pattern: /\baccessibility\b/, weight: 3 },
  ],

  [AlertCategory.PLANNED_WORK]: [
    { pattern: /\bplanned\b/, weight: 2 },
    { pattern: /service change/, weight: 2 },
    { pattern: /\bconstruction\b/, weight: 2 },
    { pattern: /weekend work/, weight: 2 },
  ],

  [AlertCategory.NOTICE]: []
};

const SEVERITY_ORDER: AlertCategory[] = [
  AlertCategory.SUSPENDED,
  AlertCategory.PART_SUSPENDED,
  AlertCategory.REROUTE,
  AlertCategory.REDUCED_SERVICE,
  AlertCategory.DELAYS,
  AlertCategory.ACCESSIBILITY,
  AlertCategory.PLANNED_WORK,
  AlertCategory.NOTICE,
];

export const SEVERITY_RANK: Record<AlertCategory, number> =
SEVERITY_ORDER.reduce((acc, category, index) => {
  acc[category] = index;
  return acc;
}, {} as Record<AlertCategory, number>);

export const classifyAlert = (
  header: string,
  description: string
): AlertCategory => {
  const text = normalize(`${header} ${description}`);

  const scores: Record<AlertCategory, number> = SEVERITY_ORDER.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {} as Record<AlertCategory, number>);

  // Score accumulation
  for (const category of SEVERITY_ORDER) {
    const rules = RULES[category];
    for (const rule of rules) {
      if (rule.pattern.test(text)) {
        scores[category] += rule.weight;
      }
    }
  }

  // Determine best category
  let bestCategory = AlertCategory.NOTICE;
  let bestScore = 0;

  for (const category of SEVERITY_ORDER) {
    const score = scores[category];

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestScore > 0 ? bestCategory : AlertCategory.NOTICE;
};