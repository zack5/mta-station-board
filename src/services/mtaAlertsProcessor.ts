import type { AlertActivePeriod, AlertInfo, TrainInfo } from '../types/types';
import { AlertSeverity } from '../types/types';

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

    // Determine affected lines
    const affectedLines = Array.from(new Set<string>(
      alert.informedEntity
        ?.map((ie: any) => ie.routeId)
        .filter((id: string | undefined): id is string => !!id)
    ));

    // Determine Severity using Mercury Extensions
    const mercury = (alert as any)[".mercury_alert"] || alert.mercuryAlert;
    const sortOrder = parseInt(mercury?.sort_order) || 0;
    
    let severity = AlertSeverity.WARNING;
    if (mercury?.is_planned || mercury?.alert_type?.includes("Planned")) {
      severity = AlertSeverity.MAINTENANCE;
    } else if (sortOrder >= 30 || mercury?.alert_type?.includes("Suspended")) {
      severity = AlertSeverity.SEVERE;
    }

    // Parse Active Periods
    const activePeriods: AlertActivePeriod[] = (alert.activePeriod || []).map((p: any) => ({
      start: p.start,
      end: p.end,
      isCurrent: p.start <= now && (!p.end || p.end >= now),
    }));

    // Filter out alerts that haven't started yet and aren't in the 'advance notice' window
    const isVisible = activePeriods.some(p => p.isCurrent || (p.start - now < 3600)); 
    if (!isVisible) return;

    const alertInfo: AlertInfo = {
      id: entity.id,
      header: getTranslation(alert.headerText),
      description: getTranslation(alert.descriptionText),
      severity,
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

  return stopAlertsMap;
}