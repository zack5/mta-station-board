import type { AlertActivePeriod, AlertInfo, TrainInfo } from '../types/types';
import { AlertCategory } from '../types/types';

const normalize = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\[[a-z0-9]+\]/g, "") // remove [N], [R], etc
    .replace(/\s+/g, " ")
    .trim();
}

const classifyAlert = (header: string, description: string): AlertCategory => {
  const text = normalize(`${header} ${description}`);

  if (
    /no trains? between/.test(text) ||
    /suspended between/.test(text) ||
    /skips/.test(text) ||
    /partially suspended/.test(text)
  ) {
    return AlertCategory.PART_SUSPENDED;
  }

  if (
    /service (is )?suspended/.test(text) ||
    /trains? (are )?not running/.test(text) ||
    /no trains? (are )?running/.test(text)
  ) {
    return AlertCategory.SUSPENDED;
  }

  if (
    /running via/.test(text) ||
    /rerouted/.test(text) ||
    /via the/.test(text)
  ) {
    return AlertCategory.REROUTE;
  }

  if (
    /terminating at/.test(text) ||
    /last stop (will be|is)/.test(text) ||
    /no express service/.test(text)
  ) {
    return AlertCategory.REDUCED_SERVICE;
  }

  if (
    /delay?/.test(text)
  ) {
    return AlertCategory.DELAYS;
  }

  if (
    /elevator/.test(text) ||
    /escalator/.test(text) ||
    /accessibility/.test(text)
  ) {
    return AlertCategory.ACCESSIBILITY;
  }

  if (
    /planned/.test(text) ||
    /service change/.test(text) ||
    /construction/.test(text)
  ) {
    return AlertCategory.PLANNED_WORK;
  }

  return AlertCategory.NOTICE;
};

const AlertPriority: Record<AlertCategory, number> = {
  [AlertCategory.SUSPENDED]: 100,
  [AlertCategory.PART_SUSPENDED]: 90,
  [AlertCategory.DELAYS]: 80,
  [AlertCategory.REROUTE]: 70,
  [AlertCategory.REDUCED_SERVICE]: 60,
  [AlertCategory.ACCESSIBILITY]: 50,
  [AlertCategory.PLANNED_WORK]: 40,
  [AlertCategory.NOTICE]: 10,
};

/**
 * Extracts the English string from a GTFS TranslatedString object
 */
const getTranslation = (translated: any): string => {
  if (!translated?.translation) return "";
  const en = translated.translation.find((t: any) => t.language === "en");
  return en ? en.text : translated.translation[0]?.text || "";
};

export function processMtaAlerts(
  trains: Record<string, TrainInfo[]>,
  rawAlertEntities: any[]
): Record<string, AlertInfo[]> {
  const stopAlertsMap: Record<string, AlertInfo[]> = {};
  const now = Math.floor(Date.now() / 1000);

  // Initialize the map with the same keys as the trains map
  const stopIds = Object.keys(trains);
  stopIds.forEach((id) => (stopAlertsMap[id] = []));

  rawAlertEntities.forEach((entity) => {
    const alert = entity.alert;
    if (!alert) return;

    const affectedLines = Array.from(new Set<string>(
      alert.informedEntity
        ?.map((ie: any) => ie.routeId)
        .filter((id: string | undefined): id is string => !!id)
    ));

    // Determine Category
    const header = getTranslation(alert.headerText);
    const description = getTranslation(alert.descriptionText);
    const category = classifyAlert(header, description)

    // Parse Active Periods
    const activePeriods: AlertActivePeriod[] = (alert.activePeriod || []).map((p: any) => ({
      start: p.start,
      end: p.end,
      isCurrent: p.start <= now && (!p.end || p.end >= now),
    }));

    // Filter out alerts that haven't started yet and aren't in the 'advance notice' window
    const isVisible = activePeriods.some(p => p.isCurrent)// || (p.start - now < 3600)); 
    if (!isVisible) return;

    const alertInfo: AlertInfo = {
      id: entity.id,
      header,
      description,
      category,
      activePeriods,
      affectedLines
    };

    // 3. Match Alert to our Stop IDs
    stopIds.forEach((targetStopId) => {
      // Strip 'N' or 'S' to get the base station ID (e.g., G29)
      const baseStationId = targetStopId.replace(/[NS]$/i, "");
      
      // Get all unique lines currently at this stop (e.g., ['G', 'F'])
      const linesAtStop = Array.from(new Set(trains[targetStopId].map(t => t.line)));

      const isRelevant = alert.informedEntity?.some((ie: any) => {
        const matchesRoute = linesAtStop.includes(ie.routeId);
        const matchesStop = ie.stopId && baseStationId === ie.stopId.replace(/[NS]$/i, "");
        return matchesRoute || matchesStop;
      });

      if (isRelevant) {
        stopAlertsMap[targetStopId].push(alertInfo);
      }
    });
  });

  Object.values(stopAlertsMap).forEach(alerts => {
    alerts.sort((a, b) => 
      AlertPriority[b.category] - AlertPriority[a.category]
    );
  });

  return stopAlertsMap;
}