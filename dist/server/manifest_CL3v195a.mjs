import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DTnezbXL.mjs';
import 'es-module-lexer';
import { n as decodeKey } from './chunks/astro/server_CUVSL_N1.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/login.ts","pathname":"/api/auth/login","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/logout","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/logout\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"logout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/logout.ts","pathname":"/api/auth/logout","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/session","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/session\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"session","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/session.ts","pathname":"/api/auth/session","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/supervisores","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/supervisores\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"supervisores","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/supervisores.ts","pathname":"/api/supervisores","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/visitas","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/visitas\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"visitas","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/visitas.ts","pathname":"/api/visitas","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"document.getElementById(\"logoutBtn\")?.addEventListener(\"click\",async()=>{try{await fetch(\"/api/auth/logout\",{method:\"POST\"}),window.location.href=\"/login\"}catch{window.location.href=\"/login\"}});\n"}],"styles":[{"type":"external","src":"/_astro/dashboard.DmQJs_Qm.css"},{"type":"inline","content":"@import\"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\";*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:#ffffff1a;border-radius:4px}::-webkit-scrollbar-thumb{background:#ffffff4d;border-radius:4px}::-webkit-scrollbar-thumb:hover{background:#ffffff80}.leaflet-popup-content-wrapper{background:#0f172af2;color:#fff;border-radius:12px;box-shadow:0 10px 40px #0000004d}.leaflet-popup-tip{background:#0f172af2}.leaflet-popup-content{margin:12px 16px;line-height:1.6}.popup-empresa-multired{color:#f87171;font-weight:600}.popup-empresa-servired{color:#4ade80;font-weight:600}\n"}],"routeData":{"route":"/dashboard","isIndex":false,"type":"page","pattern":"^\\/dashboard\\/?$","segments":[[{"content":"dashboard","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dashboard.astro","pathname":"/dashboard","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"fetch(\"/api/auth/session\").then(t=>t.json()).then(t=>{t.authenticated&&(window.location.href=\"/dashboard\")});document.getElementById(\"loginForm\")?.addEventListener(\"submit\",async t=>{t.preventDefault();const n=t.target,r=n.querySelector(\"#login\").value,a=n.querySelector(\"#password\").value,e=document.getElementById(\"errorMsg\"),s=document.getElementById(\"submitBtn\"),o=document.getElementById(\"btnText\"),i=document.getElementById(\"btnSpinner\");e?.classList.add(\"hidden\"),s?.setAttribute(\"disabled\",\"true\"),o?.classList.add(\"hidden\"),i?.classList.remove(\"hidden\");try{const d=await(await fetch(\"/api/auth/login\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({login:r,password:a})})).json();d.success?window.location.href=\"/dashboard\":e&&(e.textContent=d.error||\"Error al iniciar sesión\",e.classList.remove(\"hidden\"))}catch{e&&(e.textContent=\"Error de conexión. Intente nuevamente.\",e.classList.remove(\"hidden\"))}finally{s?.removeAttribute(\"disabled\"),o?.classList.remove(\"hidden\"),i?.classList.add(\"hidden\")}});\n"}],"styles":[{"type":"external","src":"/_astro/dashboard.DmQJs_Qm.css"},{"type":"inline","content":"@import\"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\";*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:#ffffff1a;border-radius:4px}::-webkit-scrollbar-thumb{background:#ffffff4d;border-radius:4px}::-webkit-scrollbar-thumb:hover{background:#ffffff80}.leaflet-popup-content-wrapper{background:#0f172af2;color:#fff;border-radius:12px;box-shadow:0 10px 40px #0000004d}.leaflet-popup-tip{background:#0f172af2}.leaflet-popup-content{margin:12px 16px;line-height:1.6}.popup-empresa-multired{color:#f87171;font-weight:600}.popup-empresa-servired{color:#4ade80;font-weight:600}\n"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/dashboard.DmQJs_Qm.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/pages/dashboard.astro",{"propagation":"none","containsHead":true}],["C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/pages/login.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/api/auth/login@_@ts":"pages/api/auth/login.astro.mjs","\u0000@astro-page:src/pages/api/auth/logout@_@ts":"pages/api/auth/logout.astro.mjs","\u0000@astro-page:src/pages/api/auth/session@_@ts":"pages/api/auth/session.astro.mjs","\u0000@astro-page:src/pages/api/supervisores@_@ts":"pages/api/supervisores.astro.mjs","\u0000@astro-page:src/pages/api/visitas@_@ts":"pages/api/visitas.astro.mjs","\u0000@astro-page:src/pages/dashboard@_@astro":"pages/dashboard.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_CL3v195a.mjs","C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/components/VisitTracker":"_astro/VisitTracker.CUo4_K0O.js","@astrojs/react/client.js":"_astro/client.BuOr9PT5.js","/astro/hoisted.js?q=0":"_astro/hoisted.DZzbY2ZM.js","/astro/hoisted.js?q=1":"_astro/hoisted.1WFojUjf.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/dashboard.DmQJs_Qm.css","/favicon.svg","/_astro/client.BuOr9PT5.js","/_astro/index.CVf8TyFT.js","/_astro/leaflet-src.DoEXxWUO.js","/_astro/VisitTracker.CUo4_K0O.js"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"4CW4rSSBkUO+ZYV/47uNQvcREeJjMNdMjcmlCpObdaA=","experimentalEnvGetSecretEnabled":false});

export { manifest };
