import { Dialog } from "radix-ui";

import type { AlertInfo } from '../types/types';

import { getAlertImage, getAlertTitle, parseRouteText } from '../utils/utils';

/** Above arrival stack / motion layers and other in-app overlays (e.g. station selector). */
const DIALOG_Z_BASE = 10_000;

const RouteText = ({ text }: { text: string }) => {
  const parts = parseRouteText(text);

  return (
    <span>
      {parts.map((part, index) => {
        if (!part) return null;

        const isRoute = /^[A-Z0-9]$/.test(part);

        if (isRoute) {
          return (
            <img
              key={index}
              src={`/lines/${part.toLowerCase()}.svg`}
              alt={part}
              className="inline-route"
              style={{ height: '1.2em', verticalAlign: 'middle' }}
            />
          );
        }

        return part;
      })}
    </span>
  );
};

interface AlertsDialogProps {
  alerts: AlertInfo[];
}

export default function AlertsDialog({
  alerts
}: AlertsDialogProps) {
  if (!alerts || !alerts[0]) {
    return <></>
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="alerts-button">
          <img
            src={getAlertImage(alerts[0])}
            alt={getAlertImage(alerts[0])}
          />
          <span>{`${getAlertTitle(alerts[0])} ›`}</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" style={{ zIndex: DIALOG_Z_BASE }} />
        <Dialog.Content
          className="DialogContent"
          style={{ zIndex: DIALOG_Z_BASE + 1 }}
        >
          <Dialog.Title className="DialogTitle">
            Happening now
          </Dialog.Title>
          <Dialog.Description>
            Current service alerts affecting this station.
          </Dialog.Description>
          <hr />
          <div className="alerts-container">
            {alerts.map((alert, index) => (
              <div key={alert.id || index} className="alert-item">
                <div className="alert-header">
                  <img
                    src={getAlertImage(alert)}
                    alt={getAlertImage(alert)}
                  />
                  <h3>{getAlertTitle(alert)}</h3>
                </div>
                <RouteText text={alert.header}/>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
};