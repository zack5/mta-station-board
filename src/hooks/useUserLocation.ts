import { useState } from "react";
import type { UserLocationState } from "../types/types";

export function useUserLocation() {
  const [userLocationState, setUserLocationState] = useState<UserLocationState>({
    location: null,
    error: null,
    loading: false,
  });

  const getUserLocation = (callback?: (state: UserLocationState) => void) => {
    if (!navigator.geolocation) {
      setUserLocationState((prev) => { 
        const newState = { 
          ...prev,
          loading: false,
          error: 'Geolocation not supported' 
        };
        callback?.(newState);
        return newState;
      });
      return;
    }

    setUserLocationState((prev) => { 
      const newState = { 
        ...prev,
        loading: true, 
        error: null 
      };
      return newState;
    });

    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        setUserLocationState((prev) => {
          const newState = {
            ...prev,
            location: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            },
            loading: false,
            error: null,
          };
          callback?.(newState);
          return newState;
        });
      },
      (err: GeolocationPositionError) => {
        setUserLocationState((prev) => {
          const newState = {
            ...prev,
            loading: false,
            error: err.message
          };
          callback?.(newState);
          return newState;
        });
      }
    );
  };

  return { userLocationState, getUserLocation };
}