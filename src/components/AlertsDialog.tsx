import { Dialog } from "radix-ui";

import type { AlertInfo } from '../types/types';

import { getAlertImage, getAlertTitle } from '../utils/utils';
const RouteText = ({ text }: { text: string }) => {
  // 1. (?:\[([A-Z0-9])\]) -> Matches [A], captures A, removes brackets.
  // 2. |                  -> OR
  // 3. (?<=^|[\s/])       -> Lookbehind: Must be preceded by start, space, or slash.
  //    ([A-Z0-9])         -> Capture the route.
  //    (?=$|[\s/])        -> Lookahead: Must be followed by end, space, or slash.
  const routeRegex = /(?:\[([A-Z0-9])\])|(?<=^|[\s/])([A-Z0-9])(?=$|[\s/])/g;

  const parts = text.split(routeRegex);

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
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">
            Happening now
          </Dialog.Title>
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