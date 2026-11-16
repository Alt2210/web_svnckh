import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { routeFromHash } from './auth-callback';

export function navigate(path: string, replace = false) {
  const hash = path === '/' ? '#/' : `#${path}`;
  if (replace) { history.replaceState(null, '', hash); window.dispatchEvent(new HashChangeEvent('hashchange')); }
  else window.location.hash = hash;
}
const currentRoute = () => routeFromHash(window.location.hash);
const RouteContext = createContext('/');
export function Router({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const change = () => { setRoute(currentRoute()); };
    window.addEventListener('hashchange', change);
    window.addEventListener('popstate', change);
    return () => { window.removeEventListener('hashchange', change); window.removeEventListener('popstate', change); };
  }, []);
  useEffect(() => { if (window.location.hash.startsWith('#/')) window.scrollTo(0, 0); }, [route.split('?')[0]]);
  return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>;
}
export const useRoute = () => useContext(RouteContext);
