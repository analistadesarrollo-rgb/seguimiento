/* empty css                                     */
import { f as createComponent, j as renderComponent, r as renderTemplate, i as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CUVSL_N1.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Cuk6Gogf.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const API_BASE$1 = "/api";
const normalizePerfil = (value) => value.trim().toUpperCase();
function PermissionsManager({ userPerfil }) {
  const [profiles, setProfiles] = useState([]);
  const [permissionMap, setPermissionMap] = useState({});
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedViewers, setSelectedViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");
  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE$1}/permisos-visitas`);
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || data.error || "No fue posible cargar los permisos");
        }
        const apiProfiles = (data.profiles || []).map(normalizePerfil).filter(Boolean);
        const groupedPermissions = (data.permissions || []).reduce((acc, row) => {
          const origin = normalizePerfil(row.perfil_origen);
          const viewer = normalizePerfil(row.perfil_visualizador);
          if (!origin || !viewer) {
            return acc;
          }
          if (!acc[origin]) {
            acc[origin] = [];
          }
          if (!acc[origin].includes(viewer)) {
            acc[origin].push(viewer);
          }
          return acc;
        }, {});
        Object.keys(groupedPermissions).forEach((origin) => {
          groupedPermissions[origin].sort();
        });
        const availableProfiles = Array.from(new Set(apiProfiles)).sort();
        setProfiles(availableProfiles);
        setPermissionMap(groupedPermissions);
        const initialOrigin = availableProfiles[0] || "";
        setSelectedOrigin(initialOrigin);
        setSelectedViewers(groupedPermissions[initialOrigin] || []);
        setMessage(null);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Error al cargar permisos");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    loadPermissions();
  }, []);
  useEffect(() => {
    if (!selectedOrigin) {
      return;
    }
    setSelectedViewers(permissionMap[selectedOrigin] || []);
  }, [permissionMap, selectedOrigin]);
  const selectedSummary = useMemo(() => {
    const viewers = permissionMap[selectedOrigin] || [];
    return viewers.length > 0 ? viewers.join(", ") : "Sin perfiles asignados";
  }, [permissionMap, selectedOrigin]);
  const availableViewers = profiles;
  const toggleViewer = (perfil) => {
    const normalized = normalizePerfil(perfil);
    setSelectedViewers((prev) => {
      if (prev.includes(normalized)) {
        return prev.filter((item) => item !== normalized);
      }
      return [...prev, normalized].sort();
    });
  };
  const handleSave = async () => {
    if (!selectedOrigin) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE$1}/permisos-visitas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perfilOrigen: selectedOrigin,
          perfilesPermitidos: selectedViewers
        })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || data.error || "No fue posible guardar los permisos");
      }
      setPermissionMap((prev) => ({
        ...prev,
        [selectedOrigin]: [...selectedViewers].sort()
      }));
      setMessage("Permisos actualizados correctamente");
      setMessageType("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al guardar permisos");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };
  const handleReset = () => {
    setSelectedViewers(permissionMap[selectedOrigin] || []);
    setMessage("Cambios descartados");
    setMessageType("info");
  };
  if (userPerfil !== "APLICACIONES") {
    return null;
  }
  return /* @__PURE__ */ jsxs("section", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-blue-300 mb-2", children: "APLICACIONES" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white", children: "Administración de permisos" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-2 max-w-3xl", children: "Define qué perfiles pueden consultar las visitas generadas por cada perfil. Esta matriz aplica al acceso de consulta, no al perfil que origina la visita." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-medium", children: "Solo visible para APLICACIONES" })
    ] }),
    message && /* @__PURE__ */ jsx("div", { className: `mb-6 rounded-xl border px-4 py-3 text-sm ${messageType === "success" ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200" : messageType === "error" ? "bg-red-500/15 border-red-400/30 text-red-200" : "bg-slate-500/15 border-slate-400/30 text-slate-200"}`, children: message }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-14 text-gray-400", children: "Cargando permisos..." }) : profiles.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/10 bg-slate-800/50 p-6 text-sm text-gray-300", children: "No se encontraron perfiles disponibles para configurar." }) : /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[320px,1fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Perfil origen" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: selectedOrigin,
              onChange: (e) => setSelectedOrigin(e.target.value),
              className: "w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition",
              children: profiles.map((profile) => /* @__PURE__ */ jsx("option", { value: profile, children: profile }, profile))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-slate-900/50 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-gray-400 mb-2", children: "Asignación actual" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white font-medium", children: selectedOrigin || "Sin selección" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-2", children: selectedSummary })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-gray-400", children: "Resumen" }),
          profiles.map((profile) => {
            const viewers = permissionMap[profile] || [];
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-200", children: profile }),
              /* @__PURE__ */ jsxs("span", { className: "text-gray-400", children: [
                viewers.length,
                " permitido(s)"
              ] })
            ] }, profile);
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white", children: "Perfiles autorizados" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Selecciona quién puede consultar las visitas del perfil elegido." })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
            selectedViewers.length,
            " seleccionado(s)"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3", children: availableViewers.map((profile) => {
          const checked = selectedViewers.includes(profile);
          return /* @__PURE__ */ jsxs(
            "label",
            {
              className: `flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${checked ? "bg-blue-500/15 border-blue-400/40 text-white" : "bg-slate-800/60 border-slate-700 text-gray-300 hover:bg-slate-800"}`,
              children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked,
                    onChange: () => toggleViewer(profile),
                    className: "h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: profile })
              ]
            },
            profile
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleSave,
              disabled: saving || !selectedOrigin,
              className: "px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
              children: saving ? "Guardando..." : "Guardar permisos"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleReset,
              disabled: !selectedOrigin,
              className: "px-5 py-2.5 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Descartar cambios"
            }
          )
        ] })
      ] })
    ] })
  ] });
}

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
    fecha_fin: getTodayDate(),
    supervisor: ""
  });
  const [selectedVisita, setSelectedVisita] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;
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
      } else {
        setError(data.message || data.error || data.details || "Error al cargar visitas");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleApplyFilters = () => {
    setPage(1);
    fetchVisitas();
  };
  const filteredVisitas = useMemo(() => {
    if (!search) return visitas;
    const term = search.toLowerCase();
    return visitas.filter(
      (v) => v.punto_venta.toLowerCase().includes(term) || v.supervisor.toLowerCase().includes(term) || v.sucursal.toLowerCase().includes(term) || v.documento.toLowerCase().includes(term)
    );
  }, [visitas, search]);
  const paginatedVisitas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVisitas.slice(start, start + pageSize);
  }, [filteredVisitas, page]);
  const totalPages = Math.ceil(filteredVisitas.length / pageSize);
  const stats = useMemo(() => {
    const multired = visitas.filter((v) => v.empresa === "Multired").length;
    const servired = visitas.filter((v) => v.empresa === "Servired").length;
    return { total: visitas.length, multired, servired };
  }, [visitas]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-4", children: [
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
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleApplyFilters,
          className: "px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" }) }),
            "Aplicar Filtros"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-xl", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📋" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Total Visitas" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-400", children: stats.total.toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-xl", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold text-lg", children: "M" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Multired" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-400", children: stats.multired.toLocaleString() })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-xl", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold text-lg", children: "S" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Servired" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400", children: stats.servired.toLocaleString() })
        ] })
      ] })
    ] }) }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-amber-300 font-medium", children: "Aviso" }),
        /* @__PURE__ */ jsx("p", { className: "text-amber-200 text-sm mt-1", children: error })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Cargando visitas..." })
    ] }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-white/10", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Buscar por punto de venta, supervisor, sucursal o documento...",
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
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Documento" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Supervisor" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Sucursal" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Fecha" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Hora" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Empresa" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider", children: "Ubicación" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: paginatedVisitas.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: 8, className: "px-4 py-12 text-center text-gray-400", children: [
          /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 mx-auto mb-4 text-gray-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }),
          "No se encontraron visitas"
        ] }) }) : paginatedVisitas.map((visita, idx) => {
          const hasCoords = visita.latitud && visita.longitud && visita.latitud !== "0" && visita.longitud !== "0";
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/5 transition", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-white font-medium", children: visita.punto_venta }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.documento }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.supervisor }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.sucursal }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.fecha }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-300", children: visita.hora }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${visita.empresa === "Multired" ? "bg-red-500/20 text-red-400 border border-red-400/30" : "bg-green-500/20 text-green-400 border border-green-400/30"}`, children: visita.empresa }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: hasCoords ? /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setSelectedVisita(visita),
                className: "px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-xs font-medium hover:from-blue-500 hover:to-blue-400 transition-all flex items-center gap-1 mx-auto shadow-lg shadow-blue-500/20",
                children: [
                  /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
                  ] }),
                  "Ver en Mapa"
                ]
              }
            ) : /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Sin ubicación" }) })
          ] }, idx);
        }) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-white/10", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400", children: [
          "Mostrando ",
          filteredVisitas.length > 0 ? (page - 1) * pageSize + 1 : 0,
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
            totalPages || 1
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
              disabled: page === totalPages || totalPages === 0,
              className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition text-sm",
              children: "Siguiente"
            }
          )
        ] })
      ] })
    ] }) }),
    selectedVisita && /* @__PURE__ */ jsx(
      MapModal,
      {
        visita: selectedVisita,
        onClose: () => setSelectedVisita(null)
      }
    )
  ] });
}
function MapModal({ visita, onClose }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import('leaflet').then((L) => {
        const container = document.getElementById("single-map");
        if (!container) return;
        if (container._leaflet_id) {
          container._leaflet_id = null;
          container.innerHTML = "";
        }
        const lat = parseFloat(visita.latitud);
        const lng = parseFloat(visita.longitud);
        if (isNaN(lat) || isNaN(lng)) return;
        const map = L.map("single-map").setView([lat, lng], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        const icon = L.divIcon({
          html: `<div style="background: linear-gradient(135deg, ${visita.empresa === "Multired" ? "#ef4444, #dc2626" : "#22c55e, #16a34a"}); width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.4);"></div>`,
          className: "custom-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([lat, lng], { icon }).bindPopup(`
                        <div style="min-width: 220px;">
                            <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: white;">📍 ${visita.punto_venta}</h3>
                            <div style="font-size: 12px;">
                                <p><span style="color: #94a3b8;">Documento:</span> <span style="color: white;">${visita.documento}</span></p>
                                <p><span style="color: #94a3b8;">Supervisor:</span> <span style="color: white;">${visita.supervisor}</span></p>
                                <p><span style="color: #94a3b8;">Sucursal:</span> <span style="color: white;">${visita.sucursal}</span></p>
                                <p><span style="color: #94a3b8;">Fecha:</span> <span style="color: white;">${visita.fecha} ${visita.hora}</span></p>
                                <p><span style="color: #94a3b8;">Coords:</span> <span style="color: white;">${lat.toFixed(6)}, ${lng.toFixed(6)}</span></p>
                            </div>
                        </div>
                    `, { maxWidth: 300 }).addTo(map).openPopup();
      });
    }
  }, [visita]);
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-white/10 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/50", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-blue-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
          ] }),
          visita.punto_venta
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400 mt-1", children: [
          visita.fecha,
          " a las ",
          visita.hora,
          " • ",
          visita.supervisor
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white",
          children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-slate-800/30 border-b border-white/10", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Documento" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white font-medium", children: visita.documento })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Sucursal" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white font-medium", children: visita.sucursal })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Empresa" }),
        /* @__PURE__ */ jsx("span", { className: `inline-block px-2 py-0.5 text-xs font-medium rounded-full ${visita.empresa === "Multired" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`, children: visita.empresa })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Coordenadas" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-white font-medium font-mono", children: [
          parseFloat(visita.latitud).toFixed(4),
          ", ",
          parseFloat(visita.longitud).toFixed(4)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "single-map", className: "h-[450px] w-full" })
  ] }) });
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
  const userPerfil = user.perfil?.trim().toUpperCase();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dashboard - Seguimiento de Visitas" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen"> <!-- Header with user info --> <header class="bg-white/5 backdrop-blur-lg border-b border-white/10"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"> <div class="flex items-center justify-between"> <div class="flex items-center gap-4"> <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"> <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path> </svg> </div> <div> <h1 class="text-xl font-bold text-white">Seguimiento de Visitas</h1> <p class="text-sm text-gray-400">Multired & Servired</p> </div> </div> <div class="flex items-center gap-4"> <!-- User info --> <div class="text-right hidden sm:block"> <p class="text-sm font-medium text-white">${user.nombre}</p> <p class="text-xs text-gray-400">${user.perfil}</p> </div> <div class="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> </div> <!-- Logout button --> <button id="logoutBtn" class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition text-sm flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path> </svg> <span class="hidden sm:inline">Cerrar Sesión</span> </button> </div> </div> </div> </header> <!-- Main content --> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> ${userPerfil === "APLICACIONES" && renderTemplate`<div class="mb-8"> ${renderComponent($$result2, "PermissionsManager", PermissionsManager, { "client:load": true, "userPerfil": userPerfil, "client:component-hydration": "load", "client:component-path": "C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/components/PermissionsManager", "client:component-export": "default" })} </div>`} ${renderComponent($$result2, "VisitTracker", VisitTracker, { "client:load": true, "userPerfil": user.perfil, "userLogin": user.login, "client:component-hydration": "load", "client:component-path": "C:/xampp/htdocs/visitas_maps/seguimiento_super_Astro/src/components/VisitTracker", "client:component-export": "default" })} </div> </main> ` })} `;
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
