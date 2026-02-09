import React, { useState, useEffect, useMemo, useCallback } from 'react';

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

interface Props {
    userPerfil: string;
    userLogin: string;
}

export default function VisitTracker({ userPerfil, userLogin }: Props) {
    const [visitas, setVisitas] = useState<Visita[]>([]);
    const [supervisores, setSupervisores] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        empresa: 'ambas',
        fecha_inicio: getTodayDate(),
        fecha_fin: getTodayDate(),
        supervisor: ''
    });
    const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 15;

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
            params.append('perfil', userPerfil);
            params.append('user_login', userLogin);
            if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
            if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
            if (filters.supervisor) params.append('supervisor', filters.supervisor);

            const response = await fetch(`${API_BASE}/visitas?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setVisitas(data.data);
            } else {
                setError(data.message || 'Error al cargar visitas');
            }
        } catch (err) {
            setError('Error de conexión al servidor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchVisitas();
    };

    // Filter and paginate visits
    const filteredVisitas = useMemo(() => {
        if (!search) return visitas;
        const term = search.toLowerCase();
        return visitas.filter(v =>
            v.punto_venta.toLowerCase().includes(term) ||
            v.supervisor.toLowerCase().includes(term) ||
            v.sucursal.toLowerCase().includes(term) ||
            v.documento.toLowerCase().includes(term)
        );
    }, [visitas, search]);

    const paginatedVisitas = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredVisitas.slice(start, start + pageSize);
    }, [filteredVisitas, page]);

    const totalPages = Math.ceil(filteredVisitas.length / pageSize);

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

                    {/* Apply Button */}
                    <button
                        onClick={handleApplyFilters}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Aplicar Filtros
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-xl">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total Visitas</p>
                            <p className="text-2xl font-bold text-blue-400">{stats.total.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-xl">
                        <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-red-400 font-bold text-lg">M</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Multired</p>
                            <p className="text-2xl font-bold text-red-400">{stats.multired.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-xl">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-green-400 font-bold text-lg">S</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Servired</p>
                            <p className="text-2xl font-bold text-green-400">{stats.servired.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
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

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-400">Cargando visitas...</p>
                </div>
            ) : (
                <>
                    {/* Visit List */}
                    <div className="bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Search */}
                        <div className="p-4 border-b border-white/10">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Buscar por punto de venta, supervisor, sucursal o documento..."
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Documento</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Supervisor</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Sucursal</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Hora</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Empresa</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Ubicación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedVisitas.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                No se encontraron visitas
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedVisitas.map((visita, idx) => {
                                            const hasCoords = visita.latitud && visita.longitud &&
                                                visita.latitud !== '0' && visita.longitud !== '0';
                                            return (
                                                <tr key={idx} className="hover:bg-white/5 transition">
                                                    <td className="px-4 py-3 text-sm text-white font-medium">{visita.punto_venta}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-300">{visita.documento}</td>
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
                                                    <td className="px-4 py-3 text-center">
                                                        {hasCoords ? (
                                                            <button
                                                                onClick={() => setSelectedVisita(visita)}
                                                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-xs font-medium hover:from-blue-500 hover:to-blue-400 transition-all flex items-center gap-1 mx-auto shadow-lg shadow-blue-500/20"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                Ver en Mapa
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">Sin ubicación</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                            <p className="text-sm text-gray-400">
                                Mostrando {filteredVisitas.length > 0 ? ((page - 1) * pageSize) + 1 : 0} - {Math.min(page * pageSize, filteredVisitas.length)} de {filteredVisitas.length} visitas
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
                                    Página {page} de {totalPages || 1}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || totalPages === 0}
                                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition text-sm"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Map Modal */}
            {selectedVisita && (
                <MapModal
                    visita={selectedVisita}
                    onClose={() => setSelectedVisita(null)}
                />
            )}
        </div>
    );
}

// Map Modal Component
function MapModal({ visita, onClose }: { visita: Visita; onClose: () => void }) {
    useEffect(() => {
        // Load Leaflet dynamically
        if (typeof window !== 'undefined') {
            import('leaflet').then((L) => {
                const container = document.getElementById('single-map');
                if (!container) return;

                // Clear previous map instance
                if ((container as any)._leaflet_id) {
                    (container as any)._leaflet_id = null;
                    container.innerHTML = '';
                }

                const lat = parseFloat(visita.latitud);
                const lng = parseFloat(visita.longitud);

                if (isNaN(lat) || isNaN(lng)) return;

                // Create map centered on the visit location
                const map = L.map('single-map').setView([lat, lng], 16);

                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);

                // Custom icon
                const icon = L.divIcon({
                    html: `<div style="background: linear-gradient(135deg, ${visita.empresa === 'Multired' ? '#ef4444, #dc2626' : '#22c55e, #16a34a'}); width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.4);"></div>`,
                    className: 'custom-marker',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                // Add marker
                L.marker([lat, lng], { icon })
                    .bindPopup(`
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
                    `, { maxWidth: 300 })
                    .addTo(map)
                    .openPopup();
            });
        }
    }, [visita]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {visita.punto_venta}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {visita.fecha} a las {visita.hora} • {visita.supervisor}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Visit Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-slate-800/30 border-b border-white/10">
                    <div>
                        <p className="text-xs text-gray-400">Documento</p>
                        <p className="text-sm text-white font-medium">{visita.documento}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Sucursal</p>
                        <p className="text-sm text-white font-medium">{visita.sucursal}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Empresa</p>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${visita.empresa === 'Multired'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-green-500/20 text-green-400'
                            }`}>
                            {visita.empresa}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Coordenadas</p>
                        <p className="text-sm text-white font-medium font-mono">{parseFloat(visita.latitud).toFixed(4)}, {parseFloat(visita.longitud).toFixed(4)}</p>
                    </div>
                </div>

                {/* Map */}
                <div id="single-map" className="h-[450px] w-full"></div>
            </div>
        </div>
    );
}
