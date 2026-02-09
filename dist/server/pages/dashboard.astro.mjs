/* empty css                                     */
import { f as createComponent, j as renderComponent, r as renderTemplate, i as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CUVSL_N1.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Cuk6Gogf.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const API_BASE = "/api";
const getTodayDate = () => {
  const today = /* @__PURE__ */ new Date();
  return today.toISOString().split("T")[0];
};
function VisitTracker({ userPerfil, userLogin }) {
  const [visitas, setVisitas] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    empresa: "ambas",
    fecha_inicio: getTodayDate(),
    // Default to today
    fecha_fin: getTodayDate(),
    // Default to today
    supervisor: ""
  });
  const [activeTab, setActiveTab] = useState("map");
  useEffect(() => {
    fetch(`${API_BASE}/supervisores`).then((res) => res.json()).then((data) => {
      if (data.success) {
        setSupervisores(data.data);
      }
    }).catch((err) => console.error("Error loading supervisores:", err));
  }, []);
  useEffect(() => {
    fetchVisitas();
  }, []);
  const fetchVisitas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("empresa", filters.empresa);
      params.append("perfil", userPerfil);
      params.append("user_login", userLogin);
      if (filters.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
      if (filters.fecha_fin) params.append("fecha_fin", filters.fecha_fin);
      if (filters.supervisor) params.append("supervisor", filters.supervisor);
      const response = await fetch(`${API_BASE}/visitas?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setVisitas(data.data);
        if (data.data.length === 0) {
          setError("No se encontraron visitas. Los datos disponibles son de abril-mayo 2022. Intenta con fechas de ese período o sin filtros de fecha.");
        }
      } else {
        setError(data.error || "Error al cargar visitas");
      }
    } catch (err) {
      console.error("Error fetching visitas:", err);
      setError("Error de conexión. Verifica que la base de datos esté accesible.");
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleApplyFilters = () => {
    fetchVisitas();
  };
  const handleClearFilters = () => {
    setFilters({
      empresa: "ambas",
      fecha_inicio: "",
      fecha_fin: "",
      supervisor: ""
    });
  };
  const stats = useMemo(() => {
    const multired = visitas.filter((v) => v.empresa === "Multired").length;
    const servired = visitas.filter((v) => v.empresa === "Servired").length;
    return { total: visitas.length, multired, servired };
  }, [visitas]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[180px]", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Empresa" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filters.empresa,
              onChange: (e) => handleFilterChange("empresa", e.target.value),
              className: "w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition",
              children: [
                /* @__PURE__ */ jsx("option", { value: "ambas", children: "🏢 Ambas Empresas" }),
                /* @__PURE__ */ jsx("option", { value: "multired", children: "🔴 Multired" }),
                /* @__PURE__ */ jsx("option", { value: "servired", children: "🟢 Servired" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[180px]", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Fecha Inicio" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: filters.fecha_inicio,
              onChange: (e) => handleFilterChange("fecha_inicio", e.target.value),
              className: "w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[180px]", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Fecha Fin" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: filters.fecha_fin,
              onChange: (e) => handleFilterChange("fecha_fin", e.target.value),
              className: "w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[220px]", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Supervisor" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filters.supervisor,
              onChange: (e) => handleFilterChange("supervisor", e.target.value),
              className: "w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Todos los supervisores" }),
                supervisores.map((sup) => /* @__PURE__ */ jsx("option", { value: sup, children: sup }, sup))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleApplyFilters,
              className: "px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }),
                "Buscar"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleClearFilters,
              className: "px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-gray-300 font-medium rounded-xl transition",
              children: "Limpiar"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-blue-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Total Visitas" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-white", children: stats.total.toLocaleString() })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold", children: "M" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Multired" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-red-400", children: stats.multired.toLocaleString() })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold", children: "S" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Servired" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-green-400", children: stats.servired.toLocaleString() })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("map"),
          className: `px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === "map" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-800 text-gray-400 hover:bg-slate-700"}`,
          children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" }) }),
            "Mapa"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("table"),
          className: `px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === "table" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-800 text-gray-400 hover:bg-slate-700"}`,
          children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" }) }),
            "Tabla (",
            stats.total.toLocaleString(),
            ")"
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-amber-300 font-medium", children: "Aviso" }),
        /* @__PURE__ */ jsx("p", { className: "text-amber-200 text-sm mt-1", children: error })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-96 bg-white/5 rounded-2xl", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Cargando visitas..." })
    ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      activeTab === "map" && /* @__PURE__ */ jsx(VisitMap, { visitas }),
      activeTab === "table" && /* @__PURE__ */ jsx(VisitTable, { visitas })
    ] })
  ] });
}
function VisitMap({ visitas }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import('leaflet').then((L) => {
        const container = document.getElementById("map");
        if (!container) return;
        if (container._leaflet_id) {
          container._leaflet_id = null;
          container.innerHTML = "";
        }
        const map = L.map("map").setView([3.45, -76.53], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        const multiredIcon = L.divIcon({
          html: `<div style="background: linear-gradient(135deg, #ef4444, #dc2626); width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;"></div>`,
          className: "custom-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const serviredIcon = L.divIcon({
          html: `<div style="background: linear-gradient(135deg, #22c55e, #16a34a); width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;"></div>`,
          className: "custom-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const puntoVentaMap = /* @__PURE__ */ new Map();
        visitas.forEach((visita) => {
          const key = visita.punto_venta.trim().toUpperCase();
          if (!puntoVentaMap.has(key)) {
            puntoVentaMap.set(key, []);
          }
          puntoVentaMap.get(key).push(visita);
        });
        console.log("Total puntos de venta únicos:", puntoVentaMap.size);
        console.log("Puntos:", Array.from(puntoVentaMap.keys()));
        const bounds = [];
        puntoVentaMap.forEach((visitasEnPunto, key) => {
          const visitaConCoords = visitasEnPunto.find((v) => {
            const lat2 = parseFloat(v.latitud);
            const lng2 = parseFloat(v.longitud);
            return !isNaN(lat2) && !isNaN(lng2) && v.latitud !== "" && v.longitud !== "" && v.latitud !== "0" && v.longitud !== "0" && lat2 !== 0 && lng2 !== 0;
          });
          if (!visitaConCoords) {
            console.log(`❌ Punto EXCLUIDO (sin coords válidas): "${key}" - ${visitasEnPunto.length} visitas`);
            return;
          }
          const lat = parseFloat(visitaConCoords.latitud);
          const lng = parseFloat(visitaConCoords.longitud);
          console.log(`✅ Punto AGREGADO: "${key}" - coords: [${lat}, ${lng}] - ${visitasEnPunto.length} visitas`);
          bounds.push([lat, lng]);
          const icon = visitaConCoords.empresa === "Multired" ? multiredIcon : serviredIcon;
          const visitasList = visitasEnPunto.map(
            (v) => `<div style="padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span style="color: #94a3b8;">📅</span> ${v.fecha} ${v.hora} 
                            <span style="color: ${v.empresa === "Multired" ? "#f87171" : "#4ade80"};">(${v.empresa})</span>
                        </div>`
          ).join("");
          const popup = `
            <div style="min-width: 250px; max-height: 300px;">
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: white; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">
                📍 ${visitaConCoords.punto_venta}
              </h3>
              <div style="font-size: 12px; margin-bottom: 8px;">
                <p><span style="color: #94a3b8;">Supervisor:</span> <span style="color: white;">${visitaConCoords.supervisor}</span></p>
                <p><span style="color: #94a3b8;">Sucursal:</span> <span style="color: white;">${visitaConCoords.sucursal}</span></p>
              </div>
              <div style="font-size: 11px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px; max-height: 150px; overflow-y: auto;">
                <p style="color: #60a5fa; font-weight: 600; margin-bottom: 4px;">📋 ${visitasEnPunto.length} Visita(s):</p>
                ${visitasList}
              </div>
            </div>
          `;
          L.marker([lat, lng], { icon }).bindPopup(popup, { maxWidth: 300 }).addTo(map);
        });
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
        console.log(`Mapa: ${puntoVentaMap.size} puntos de venta únicos de ${visitas.length} visitas totales`);
      });
    }
  }, [visitas]);
  return /* @__PURE__ */ jsx("div", { className: "bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl", children: /* @__PURE__ */ jsx("div", { id: "map", className: "h-[600px] w-full" }) });
}
function VisitTable({ visitas }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const filteredVisitas = useMemo(() => {
    if (!search) return visitas;
    const term = search.toLowerCase();
    return visitas.filter(
      (v) => v.punto_venta.toLowerCase().includes(term) || v.supervisor.toLowerCase().includes(term) || v.sucursal.toLowerCase().includes(term)
    );
  }, [visitas, search]);
  const paginatedVisitas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVisitas.slice(start, start + pageSize);
  }, [filteredVisitas, page]);
  const totalPages = Math.ceil(filteredVisitas.length / pageSize);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-white/10", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Buscar por punto de venta, supervisor o sucursal...",
          value: search,
          onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          },
          className: "w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-800/50", children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Punto de Venta" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Supervisor" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Sucursal" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Fecha" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Hora" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Empresa" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: paginatedVisitas.map((visita, idx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/5 transition", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white", children: visita.punto_venta }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.supervisor }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.sucursal }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.fecha }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.hora }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${visita.empresa === "Multired" ? "bg-red-500/20 text-red-400 border border-red-400/30" : "bg-green-500/20 text-green-400 border border-green-400/30"}`, children: visita.empresa }) })
      ] }, idx)) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-white/10", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400", children: [
        "Mostrando ",
        (page - 1) * pageSize + 1,
        " - ",
        Math.min(page * pageSize, filteredVisitas.length),
        " de ",
        filteredVisitas.length,
        " visitas"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPage((p) => Math.max(1, p - 1)),
            disabled: page === 1,
            className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition text-sm",
            children: "Anterior"
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "px-3 py-1.5 text-gray-400 text-sm", children: [
          "Página ",
          page,
          " de ",
          totalPages
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
            disabled: page === totalPages,
            className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition text-sm",
            children: "Siguiente"
          }
        )
      ] })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  const sessionCookie = Astro2.cookies.get("session");
  let user = null;
  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch {
      return Astro2.redirect("/login");
    }
  } else {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dashboard - Seguimiento de Visitas" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen"> <!-- Header with user info --> <header class="bg-white/5 backdrop-blur-lg border-b border-white/10"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"> <div class="flex items-center justify-between"> <div class="flex items-center gap-4"> <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path> </svg> </div> <div> <h1 class="text-xl font-bold text-white">Seguimiento de Visitas</h1> <p class="text-sm text-gray-400">Multired & Servired</p> </div> </div> <div class="flex items-center gap-4"> <!-- User info --> <div class="text-right hidden sm:block"> <p class="text-sm font-medium text-white">${user.nombre}</p> <p class="text-xs text-gray-400">${user.perfil}</p> </div> <div class="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> </div> <!-- Logout button --> <button id="logoutBtn" class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition text-sm flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path> </svg> <span class="hidden sm:inline">Cerrar Sesión</span> </button> </div> </div> </div> </header> <!-- Main content --> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> ${renderComponent($$result2, "VisitTracker", VisitTracker, { "client:load": true, "userPerfil": user.perfil, "userLogin": user.login, "client:component-hydration": "load", "client:component-path": "C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/components/VisitTracker", "client:component-export": "default" })} </div> </main> ` })} `;
}, "C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/pages/dashboard.astro", void 0);

const $$file = "C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Dashboard,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
