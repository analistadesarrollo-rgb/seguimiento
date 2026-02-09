import { f as createComponent, h as addAttribute, k as renderHead, l as renderSlot, r as renderTemplate, i as createAstro } from './astro/server_CUVSL_N1.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                             */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="description" content="Sistema de seguimiento de visitas a puntos de venta"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><!-- Leaflet CSS --><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""><!-- Leaflet MarkerCluster CSS --><link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"><link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css">${renderHead()}</head> <body class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
