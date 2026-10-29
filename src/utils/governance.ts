export function groupsRedirectRequired(pilotEnabled: boolean, pathname: string, search: string): boolean {
  return pilotEnabled && (pathname !== '/access' || new URLSearchParams(search).get('tab') !== 'groups');
}
