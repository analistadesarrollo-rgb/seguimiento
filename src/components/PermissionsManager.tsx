import React, { useEffect, useMemo, useState } from 'react';

interface PermissionRow {
    perfil_origen: string;
    perfil_visualizador: string;
}

interface ApiResponse {
    success: boolean;
    profiles?: string[];
    permissions?: PermissionRow[];
    message?: string;
    error?: string;
}

interface Props {
    userPerfil: string;
}

const API_BASE = '/api';

const normalizePerfil = (value: string) => value.trim().toUpperCase();

export default function PermissionsManager({ userPerfil }: Props) {
    const [profiles, setProfiles] = useState<string[]>([]);
    const [permissionMap, setPermissionMap] = useState<Record<string, string[]>>({});
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [selectedViewers, setSelectedViewers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

    useEffect(() => {
        const loadPermissions = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${API_BASE}/permisos-visitas`);
                const data: ApiResponse = await response.json();

                if (!data.success) {
                    throw new Error(data.message || data.error || 'No fue posible cargar los permisos');
                }

                const apiProfiles = (data.profiles || [])
                    .map(normalizePerfil)
                    .filter(Boolean);

                const groupedPermissions = (data.permissions || []).reduce<Record<string, string[]>>((acc, row) => {
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

                Object.keys(groupedPermissions).forEach(origin => {
                    groupedPermissions[origin].sort();
                });

                const availableProfiles = Array.from(new Set(apiProfiles)).sort();

                setProfiles(availableProfiles);
                setPermissionMap(groupedPermissions);

                const initialOrigin = availableProfiles[0] || '';
                setSelectedOrigin(initialOrigin);
                setSelectedViewers(groupedPermissions[initialOrigin] || []);
                setMessage(null);
            } catch (error) {
                setMessage(error instanceof Error ? error.message : 'Error al cargar permisos');
                setMessageType('error');
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
        return viewers.length > 0 ? viewers.join(', ') : 'Sin perfiles asignados';
    }, [permissionMap, selectedOrigin]);

    const availableViewers = profiles;

    const toggleViewer = (perfil: string) => {
        const normalized = normalizePerfil(perfil);

        setSelectedViewers(prev => {
            if (prev.includes(normalized)) {
                return prev.filter(item => item !== normalized);
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
            const response = await fetch(`${API_BASE}/permisos-visitas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    perfilOrigen: selectedOrigin,
                    perfilesPermitidos: selectedViewers
                })
            });

            const data: ApiResponse = await response.json();

            if (!data.success) {
                throw new Error(data.message || data.error || 'No fue posible guardar los permisos');
            }

            setPermissionMap(prev => ({
                ...prev,
                [selectedOrigin]: [...selectedViewers].sort()
            }));

            setMessage('Permisos actualizados correctamente');
            setMessageType('success');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Error al guardar permisos');
            setMessageType('error');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setSelectedViewers(permissionMap[selectedOrigin] || []);
        setMessage('Cambios descartados');
        setMessageType('info');
    };

    if (userPerfil !== 'APLICACIONES') {
        return null;
    }

    return (
        <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-300 mb-2">APLICACIONES</p>
                    <h2 className="text-2xl font-bold text-white">Administración de permisos</h2>
                    <p className="text-sm text-gray-400 mt-2 max-w-3xl">
                        Define qué perfiles pueden consultar las visitas generadas por cada perfil. Esta matriz aplica al acceso de consulta, no al perfil que origina la visita.
                    </p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-medium">
                    Solo visible para APLICACIONES
                </div>
            </div>

            {message && (
                <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${messageType === 'success'
                    ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
                    : messageType === 'error'
                        ? 'bg-red-500/15 border-red-400/30 text-red-200'
                        : 'bg-slate-500/15 border-slate-400/30 text-slate-200'
                    }`}>
                    {message}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-14 text-gray-400">
                    Cargando permisos...
                </div>
            ) : profiles.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-slate-800/50 p-6 text-sm text-gray-300">
                    No se encontraron perfiles disponibles para configurar.
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Perfil origen</label>
                            <select
                                value={selectedOrigin}
                                onChange={(e) => setSelectedOrigin(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                                {profiles.map(profile => (
                                    <option key={profile} value={profile}>
                                        {profile}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Asignación actual</p>
                            <p className="text-sm text-white font-medium">{selectedOrigin || 'Sin selección'}</p>
                            <p className="text-sm text-gray-400 mt-2">{selectedSummary}</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Resumen</p>
                            {profiles.map(profile => {
                                const viewers = permissionMap[profile] || [];

                                return (
                                    <div key={profile} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-gray-200">{profile}</span>
                                        <span className="text-gray-400">{viewers.length} permitido(s)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Perfiles autorizados</h3>
                                <p className="text-sm text-gray-400">Selecciona quién puede consultar las visitas del perfil elegido.</p>
                            </div>
                            <span className="text-xs text-gray-400">
                                {selectedViewers.length} seleccionado(s)
                            </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {availableViewers.map(profile => {
                                const checked = selectedViewers.includes(profile);

                                return (
                                    <label
                                        key={profile}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${checked
                                            ? 'bg-blue-500/15 border-blue-400/40 text-white'
                                            : 'bg-slate-800/60 border-slate-700 text-gray-300 hover:bg-slate-800'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleViewer(profile)}
                                            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="font-medium">{profile}</span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || !selectedOrigin}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Guardando...' : 'Guardar permisos'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={!selectedOrigin}
                                className="px-5 py-2.5 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Descartar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}