import React, { useState, useEffect, useMemo } from 'react';

// API base URL - Now using Astro API routes
const API_BASE = '/api';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Types
interface Visita {
    ip: string;
    punto_venta: string;
    documento: string;
    sucursal: string;
    supervisor: string;
    fecha: string;
    hora: string;
    latitud: string;
    longitud: string;
    empresa: string;
}

interface Filters {
    empresa: 'ambas' | 'multired' | 'servired';
    fecha_inicio: string;
    fecha_fin: string;
    supervisor: string;
}

export default function VisitTracker() {
    const [visitas, setVisitas] = useState<Visita[]>([]);
    const [supervisores, setSupervisores] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        empresa: 'ambas',
        fecha_inicio: getTodayDate(),  // Default to today
        fecha_fin: getTodayDate(),     // Default to today
        supervisor: ''
    });
    const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');

    // Load supervisors on mount
    useEffect(() => {
        fetch(`${API_BASE}/supervisores`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSupervisores(data.data);
                }
            })
            .catch(err => console.error('Error loading supervisores:', err));
    }, []);

    // Load visits on mount
    useEffect(() => {
        fetchVisitas();
    }, []);

    const fetchVisitas = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('empresa', filters.empresa);
            if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
            if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
            if (filters.supervisor) params.append('supervisor', filters.supervisor);

            const response = await fetch(`${API_BASE}/visitas?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setVisitas(data.data);
                if (data.data.length === 0) {
                    setError('No se encontraron visitas. Los datos disponibles son de abril-mayo 2022. Intenta con fechas de ese período o sin filtros de fecha.');
                }
            } else {
                setError(data.error || 'Error al cargar visitas');
            }
        } catch (err) {
            console.error('Error fetching visitas:', err);
            setError('Error de conexión. Verifica que la base de datos esté accesible.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        fetchVisitas();
    };

    const handleClearFilters = () => {
        setFilters({
            empresa: 'ambas',
            fecha_inicio: '',
            fecha_fin: '',
            supervisor: ''
        });
    };

    // Stats
    const stats = useMemo(() => {
        const multired = visitas.filter(v => v.empresa === 'Multired').length;
        const servired = visitas.filter(v => v.empresa === 'Servired').length;
        return { total: visitas.length, multired, servired };
    }, [visitas]);

    return (
        <div className="space-y-6">
            {/* Filter Panel */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex flex-wrap items-end gap-4">
                    {/* Empresa Filter */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
                        <select
                            value={filters.empresa}
                            onChange={(e) => handleFilterChange('empresa', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            <option value="ambas">🏢 Ambas Empresas</option>
                            <option value="multired">🔴 Multired</option>
                            <option value="servired">🟢 Servired</option>
                        </select>
                    </div>

                    {/* Fecha Inicio */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Inicio</label>
                        <input
                            type="date"
                            value={filters.fecha_inicio}
                            onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Fecha Fin */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Fin</label>
                        <input
                            type="date"
                            value={filters.fecha_fin}
                            onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Supervisor Filter */}
                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Supervisor</label>
                        <select
                            value={filters.supervisor}
                            onChange={(e) => handleFilterChange('supervisor', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            <option value="">Todos los supervisores</option>
                            {supervisores.map((sup) => (
                                <option key={sup} value={sup}>{sup}</option>
                            ))}
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Buscar
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-gray-300 font-medium rounded-xl transition"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total Visitas</p>
                            <p className="text-xl font-bold text-white">{stats.total.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-red-400 font-bold">M</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Multired</p>
                            <p className="text-xl font-bold text-red-400">{stats.multired.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-green-400 font-bold">S</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Servired</p>
                            <p className="text-xl font-bold text-green-400">{stats.servired.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('map')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'map'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Mapa
                </button>
                <button
                    onClick={() => setActiveTab('table')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'table'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Tabla ({stats.total.toLocaleString()})
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <p className="text-amber-300 font-medium">Aviso</p>
                        <p className="text-amber-200 text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-96 bg-white/5 rounded-2xl">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Cargando visitas...</p>
                    </div>
                </div>
            ) : (
                <>
                    {activeTab === 'map' && <VisitMap visitas={visitas} />}
                    {activeTab === 'table' && <VisitTable visitas={visitas} />}
                </>
            )}
        </div>
    );
}

// Map Component
function VisitMap({ visitas }: { visitas: Visita[] }) {
    useEffect(() => {
        // Load Leaflet dynamically
        if (typeof window !== 'undefined') {
            import('leaflet').then((L) => {
                // Remove existing map
                const container = document.getElementById('map');
                if (!container) return;

                // Clear previous map instance
                if ((container as any)._leaflet_id) {
                    (container as any)._leaflet_id = null;
                    container.innerHTML = '';
                }

                // Create map centered on Colombia
                const map = L.map('map').setView([3.45, -76.53], 12);

                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);

                // Custom icons
                const multiredIcon = L.divIcon({
                    html: `<div style="background: linear-gradient(135deg, #ef4444, #dc2626); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
                    className: 'custom-marker',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const serviredIcon = L.divIcon({
                    html: `<div style="background: linear-gradient(135deg, #22c55e, #16a34a); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
                    className: 'custom-marker',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                // Add markers
                const bounds: [number, number][] = [];

                visitas.forEach((visita) => {
                    const lat = parseFloat(visita.latitud);
                    const lng = parseFloat(visita.longitud);

                    if (isNaN(lat) || isNaN(lng)) return;

                    bounds.push([lat, lng]);

                    const icon = visita.empresa === 'Multired' ? multiredIcon : serviredIcon;
                    const empresaClass = visita.empresa === 'Multired' ? 'popup-empresa-multired' : 'popup-empresa-servired';

                    const popup = `
            <div style="min-width: 200px;">
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: white;">${visita.punto_venta}</h3>
              <div style="font-size: 12px; space-y: 4px;">
                <p><span style="color: #94a3b8;">Supervisor:</span> <span style="color: white;">${visita.supervisor}</span></p>
                <p><span style="color: #94a3b8;">Sucursal:</span> <span style="color: white;">${visita.sucursal}</span></p>
                <p><span style="color: #94a3b8;">Fecha:</span> <span style="color: white;">${visita.fecha}</span></p>
                <p><span style="color: #94a3b8;">Hora:</span> <span style="color: white;">${visita.hora}</span></p>
                <p><span style="color: #94a3b8;">Empresa:</span> <span class="${empresaClass}">${visita.empresa}</span></p>
              </div>
            </div>
          `;

                    L.marker([lat, lng], { icon })
                        .bindPopup(popup)
                        .addTo(map);
                });

                // Fit bounds if we have markers
                if (bounds.length > 0) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            });
        }
    }, [visitas]);

    return (
        <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div id="map" className="h-[600px] w-full"></div>
        </div>
    );
}

// Table Component
function VisitTable({ visitas }: { visitas: Visita[] }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const filteredVisitas = useMemo(() => {
        if (!search) return visitas;
        const term = search.toLowerCase();
        return visitas.filter(v =>
            v.punto_venta.toLowerCase().includes(term) ||
            v.supervisor.toLowerCase().includes(term) ||
            v.sucursal.toLowerCase().includes(term)
        );
    }, [visitas, search]);

    const paginatedVisitas = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredVisitas.slice(start, start + pageSize);
    }, [filteredVisitas, page]);

    const totalPages = Math.ceil(filteredVisitas.length / pageSize);

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por punto de venta, supervisor o sucursal..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-800/50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Punto de Venta</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Supervisor</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Sucursal</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Hora</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Empresa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginatedVisitas.map((visita, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition">
                                <td className="px-4 py-3 text-sm text-white">{visita.punto_venta}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{visita.supervisor}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{visita.sucursal}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{visita.fecha}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{visita.hora}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${visita.empresa === 'Multired'
                                        ? 'bg-red-500/20 text-red-400 border border-red-400/30'
                                        : 'bg-green-500/20 text-green-400 border border-green-400/30'
                                        }`}>
                                        {visita.empresa}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                <p className="text-sm text-gray-400">
                    Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredVisitas.length)} de {filteredVisitas.length} visitas
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition text-sm"
                    >
                        Anterior
                    </button>
                    <span className="px-3 py-1.5 text-gray-400 text-sm">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition text-sm"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}
