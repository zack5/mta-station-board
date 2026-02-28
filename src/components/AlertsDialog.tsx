import { Dialog } from "radix-ui";

import type { AlertInfo } from '../types/types';

import { getAlertImage, getAlertTitle } from '../utils/utils';

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
          <span>Alerts ›</span>
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
                <p>{alert.header}</p>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
};