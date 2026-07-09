export type World = 'home' | 'power-platform' | 'entra-id' | 'purview' | 'monitoring' | 'configuration';

// Plain startsWith() false-matches sibling routes that share a prefix (e.g.
// '/dashboard/purview' matching '/dashboard/purview-something') — require the
// match to end exactly at a path segment boundary.
function matchesPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getActiveWorld(pathname: string): World {
  if (pathname === '/dashboard')                          return 'home';
  if (matchesPath(pathname, '/dashboard/entra-id'))        return 'entra-id';
  if (matchesPath(pathname, '/dashboard/power-platform'))  return 'power-platform';
  if (matchesPath(pathname, '/dashboard/purview'))         return 'purview';
  if (
    matchesPath(pathname, '/dashboard/activity') ||
    matchesPath(pathname, '/dashboard/dataverse-logs')
  )                                                        return 'monitoring';
  if (matchesPath(pathname, '/dashboard/settings'))        return 'configuration';
  return 'power-platform';
}
