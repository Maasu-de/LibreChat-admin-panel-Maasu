import { useRouteContext } from '@tanstack/react-router';

export function usePilotMode(): boolean {
  return useRouteContext({ from: '/_app' }).pilotEnabled;
}
