import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Bpcl9KYY.mjs';
import { manifest } from './manifest_Cnoit40X.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/login.astro.mjs');
const _page2 = () => import('./pages/api/auth/logout.astro.mjs');
const _page3 = () => import('./pages/api/auth/session.astro.mjs');
const _page4 = () => import('./pages/api/permisos-visitas.astro.mjs');
const _page5 = () => import('./pages/api/supervisores.astro.mjs');
const _page6 = () => import('./pages/api/visitas.astro.mjs');
const _page7 = () => import('./pages/dashboard.astro.mjs');
const _page8 = () => import('./pages/login.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/auth/login.ts", _page1],
    ["src/pages/api/auth/logout.ts", _page2],
    ["src/pages/api/auth/session.ts", _page3],
    ["src/pages/api/permisos-visitas.ts", _page4],
    ["src/pages/api/supervisores.ts", _page5],
    ["src/pages/api/visitas.ts", _page6],
    ["src/pages/dashboard.astro", _page7],
    ["src/pages/login.astro", _page8],
    ["src/pages/index.astro", _page9]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/dist/client/",
    "server": "file:///C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
{
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
