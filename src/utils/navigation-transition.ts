const COOKIE = 'governance-navigation';
const STATE = 'data-navigation-state';
const DESTINATION = 'data-navigation-destination';
const STARTED = 'data-navigation-started';
const sections = {
  overview: 'Overview',
  policies: 'Governance Policy',
  termlists: 'Confidential Terms',
  groups: 'Groups & Membership',
  audit: 'Audit Log',
  finance: 'Cost & Usage',
};

function clearMarker() {
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

export function resetNavigation() {
  const root = document.documentElement;
  for (const name of [STATE, DESTINATION, STARTED, 'data-navigation-collapsed'])
    root.removeAttribute(name);
  root.style.removeProperty('--navigation-title');
  clearMarker();
}

export function finishNavigation() {
  const root = document.documentElement;
  if (root.getAttribute(STATE) !== 'incoming') return;
  const started = root.getAttribute(STARTED);
  clearMarker();
  root.setAttribute(STATE, 'finishing');
  window.setTimeout(
    () => {
      if (root.getAttribute(STARTED) === started) resetNavigation();
    },
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150,
  );
}

export function installNavigationProgress() {
  let timeout: ReturnType<typeof setTimeout>;
  const click = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[data-navigation-destination]')
        : null;
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self'))
      return;
    const destination = anchor.dataset.navigationDestination;
    if (!destination || !Object.hasOwn(sections, destination)) return;
    const url = new URL(anchor.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    const root = document.documentElement;
    document.cookie = `${COOKIE}=${destination}; Path=/; Max-Age=15; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    root.setAttribute(STATE, 'outgoing');
    root.setAttribute(DESTINATION, destination);
    root.setAttribute(STARTED, String(Date.now()));
    clearTimeout(timeout);
    timeout = setTimeout(resetNavigation, 15000);
  };
  const restored = (event: PageTransitionEvent) => {
    if (event.persisted) resetNavigation();
  };
  const revealError = () => {
    if (document.querySelector('[role="alert"], .state-error, .state-warning')) finishNavigation();
  };
  const observer = new MutationObserver(revealError);
  observer.observe(document.body, { childList: true, subtree: true });
  revealError();
  document.addEventListener('click', click);
  window.addEventListener('pageshow', restored);
  return () => {
    clearTimeout(timeout);
    observer.disconnect();
    document.removeEventListener('click', click);
    window.removeEventListener('pageshow', restored);
  };
}

export function navigationBootstrapScript(app: 'gateway' | 'groups') {
  return `(function(){try{
    var match=document.cookie.match(/(?:^|;\\s*)governance-navigation=([^;]*)/);
    var labels=${JSON.stringify(sections)};
    var destination=match&&match[1];
    var path=location.pathname;
    if(!destination||!Object.hasOwn(labels,destination))return;
    var groups=${app === 'groups'};
    var valid=groups?destination==="groups"&&/(?:^|\\/)(?:access|login|auth\\/openid\\/callback)(?:\\/|$)/.test(path):destination!=="groups"&&/^\\/admin(?:\\/|$)/.test(path);
    if(!valid){document.cookie="governance-navigation=; Path=/; Max-Age=0; SameSite=Lax";return;}
    var root=document.documentElement,started=String(Date.now());
    root.setAttribute("data-navigation-state","incoming");
    root.setAttribute("data-navigation-destination",destination);
    root.setAttribute("data-navigation-started",started);
    var collapsed=false;try{collapsed=localStorage.getItem("gateway-admin:sidebar-collapsed")==="true"}catch{}
    root.setAttribute("data-navigation-collapsed",String(collapsed));
    root.style.setProperty("--navigation-title",JSON.stringify(labels[destination]));
    setTimeout(function(){if(root.getAttribute("data-navigation-started")===started){
      ["data-navigation-state","data-navigation-destination","data-navigation-started","data-navigation-collapsed"].forEach(function(name){root.removeAttribute(name)});
      root.style.removeProperty("--navigation-title");
      document.cookie="governance-navigation=; Path=/; Max-Age=0; SameSite=Lax";
    }},15000);
  }catch{}})()`;
}
