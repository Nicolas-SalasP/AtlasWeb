import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Loader2, Save, Plus, X, CheckCircle,
    AlertCircle, Layers, DollarSign
} from 'lucide-react';

const CATEGORIAS_MODULOS = [
    { label: 'General',        keys: ['dashboard', 'dashboard.ejecutivo', 'empresa.perfil', 'glosario'] },
    { label: 'Comercial',      keys: ['clientes', 'cotizaciones'] },
    { label: 'Compras',        keys: ['facturas.manual', 'facturas.historial', 'facturas.auditoria', 'dte.emision', 'documentos.anulacion', 'proveedores'] },
    { label: 'Tesorería',      keys: ['tesoreria.cartola', 'tesoreria.conciliacion', 'tesoreria.nomina'] },
    { label: 'Contabilidad',   keys: ['contabilidad.plan_cuentas', 'contabilidad.libro_mayor', 'contabilidad.asientos', 'contabilidad.visor', 'contabilidad.reclasificador'] },
    { label: 'Activos',        keys: ['activos_fijos'] },
    { label: 'Inventario',     keys: ['inventario.productos', 'inventario.bodegas', 'inventario.movimientos', 'inventario.kardex', 'inventario.lotes', 'inventario.reservas', 'inventario.valorizacion', 'inventario.tomas_fisicas'] },
    { label: 'Tributario',     keys: ['tributario.renta', 'tributario.mapeo_sii', 'tributario.f29'] },
    { label: 'Administración', keys: ['usuarios.gestion', 'roles.gestion'] },
    { label: 'Enterprise',     keys: ['integraciones.api', 'white_label', 'modulos.custom'] },
];

const FORM_VACIO = {
    name: '', slug: '', price_uf: '', price_label: '',
    description: '', duration_days: 30, is_popular: false, module_keys: [],
};

const AdminPlanes = () => {
    const [planes, setPlanes] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(null);
    const [planActivo, setPlanActivo] = useState(null);
    const [toast, setToast] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [form, setForm] = useState(FORM_VACIO);
    const [creando, setCreando] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/erp-plans');
            setPlanes(res.data.planes.map(p => ({ ...p, module_keys: p.module_keys || [], costo_operacional: p.costo_operacional || {}, dirty: false })));
            setAllModules(res.data.all_modules);
            if (res.data.planes.length > 0 && !planActivo) setPlanActivo(res.data.planes[0].id);
        } catch {
            showToast('error', 'No se pudieron cargar los planes.');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const setCosto = (planId, key, valor) => {
        setPlanes(prev => prev.map(p => {
            if (p.id !== planId) return p;
            const num = parseInt(valor.replace(/[^0-9]/g, ''), 10) || 0;
            return {
                ...p,
                dirty: true,
                costo_operacional: { ...p.costo_operacional, [key]: num },
            };
        }));
    };

    const getCostoTotal = (plan) => {
        return plan.module_keys.reduce((sum, k) => sum + (plan.costo_operacional?.[k] || 0), 0);
    };

    const toggleModulo = (planId, key) => {
        setPlanes(prev => prev.map(p => {
            if (p.id !== planId) return p;
            const tiene = p.module_keys.includes(key);
            return {
                ...p,
                dirty: true,
                module_keys: tiene ? p.module_keys.filter(k => k !== key) : [...p.module_keys, key],
            };
        }));
    };

    const guardarPlan = async (plan) => {
        setGuardando(plan.id);
        try {
            await api.put(`/admin/erp-plans/${plan.id}`, { module_keys: plan.module_keys, costo_operacional: plan.costo_operacional });
            setPlanes(prev => prev.map(p => p.id === plan.id ? { ...p, dirty: false } : p));
            showToast('success', `"${plan.name}" actualizado y sincronizado con el ERP.`);
        } catch {
            showToast('error', 'Error al guardar. Intentá de nuevo.');
        } finally {
            setGuardando(null);
        }
    };

    const handleFormChange = (field, value) => {
        let next = { ...form, [field]: value };
        if (field === 'name' && !form.slug) {
            next.slug = 'erp-' + value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        if (field === 'price_uf') {
            const uf = parseFloat(value);
            if (!isNaN(uf)) {
                next.price_label = uf === 0 ? 'Gratis' : `${uf} UF/mes`;
            }
        }
        setForm(next);
    };

    const toggleFormModulo = (key) => {
        setForm(prev => ({
            ...prev,
            module_keys: prev.module_keys.includes(key)
                ? prev.module_keys.filter(k => k !== key)
                : [...prev.module_keys, key],
        }));
    };

    const crearPlan = async () => {
        if (!form.name || !form.slug) {
            showToast('error', 'Nombre y slug son obligatorios.');
            return;
        }
        setCreando(true);
        try {
            const uf = parseFloat(form.price_uf) || 0;
            const ufInfo = await api.get('/indicadores/uf').catch(() => ({ data: { uf: 40307 } }));
            const price = Math.round(uf * (ufInfo.data?.uf || 40307));

            await api.post('/admin/services', {
                name:          form.name,
                slug:          form.slug,
                tipo:          'erp',
                price,
                price_uf:      form.price_uf,
                price_label:   form.price_label,
                duration_days: form.duration_days,
                description:   form.description,
                features:      [],
                module_keys:   form.module_keys,
                is_active:     true,
                is_popular:    form.is_popular,
            });

            showToast('success', `Plan "${form.name}" creado.`);
            setDrawerOpen(false);
            setForm(FORM_VACIO);
            setLoading(true);
            await fetchData();
        } catch {
            showToast('error', 'Error al crear el plan.');
        } finally {
            setCreando(false);
        }
    };

    const planSeleccionado = planes.find(p => p.id === planActivo);

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={20} /> Cargando planes...
        </div>
    );

    return (
        <div className="p-4 md:p-6">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium
                    ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.message}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Layers size={20} className="text-tenri-900" /> Planes ERP
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Modificar módulos actualiza a todos los usuarios con ese plan en el ERP.
                    </p>
                </div>
                <button
                    onClick={() => { setForm(FORM_VACIO); setDrawerOpen(true); }}
                    className="flex items-center gap-2 bg-tenri-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-tenri-800 transition-colors"
                >
                    <Plus size={16} /> Nuevo plan
                </button>
            </div>

            <div className="flex gap-6 flex-col lg:flex-row">
                {/* Selector de plan */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {planes.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setPlanActivo(plan.id)}
                                className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 transition-colors
                                    ${planActivo === plan.id ? 'bg-gray-50 border-l-4 border-l-tenri-900' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-semibold ${planActivo === plan.id ? 'text-tenri-900' : 'text-gray-800'}`}>
                                            {plan.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{plan.price_label}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-gray-400">{plan.module_keys.length} mód.</span>
                                        {plan.dirty && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Sin guardar</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor de módulos */}
                {planSeleccionado && (
                    <div className="flex-1">
                        <div className="bg-white rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div>
                                    <h2 className="font-bold text-gray-900">{planSeleccionado.name}</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {planSeleccionado.module_keys.length} de {allModules.length} módulos activos
                                    </p>
                                    {(() => {
                                        const costo = getCostoTotal(planSeleccionado);
                                        const precio = planSeleccionado.price || 0;
                                        const margen = precio > 0 ? Math.round(((precio - costo) / precio) * 100) : null;
                                        return costo > 0 && (
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-red-500">Costo: ${costo.toLocaleString('es-CL')}/mes</span>
                                                {margen !== null && (
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${margen >= 50 ? 'bg-green-100 text-green-700' : margen >= 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        Margen {margen}%
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                                <button
                                    onClick={() => guardarPlan(planSeleccionado)}
                                    disabled={!planSeleccionado.dirty || guardando === planSeleccionado.id}
                                    className="flex items-center gap-2 bg-tenri-900 text-white px-4 py-2 rounded-lg text-sm font-medium
                                        hover:bg-tenri-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {guardando === planSeleccionado.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    Guardar y sincronizar
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {CATEGORIAS_MODULOS.map(({ label, keys }) => {
                                    const modulosCat = allModules.filter(m => keys.includes(m.key));
                                    if (modulosCat.length === 0) return null;
                                    const activos = modulosCat.filter(m => planSeleccionado.module_keys.includes(m.key)).length;

                                    return (
                                        <div key={label} className="border border-gray-100 rounded-lg overflow-hidden">
                                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                                                <span className="text-sm font-semibold text-gray-700">{label}</span>
                                                <span className="text-xs text-gray-400">{activos}/{modulosCat.length}</span>
                                            </div>
                                            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {modulosCat.map(m => {
                                                    const activo = planSeleccionado.module_keys.includes(m.key);
                                                    return (
                                                        <div key={m.key} className="flex items-center gap-2">
                                                            <label className="flex items-center gap-2 cursor-pointer group flex-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={activo}
                                                                    onChange={() => toggleModulo(planSeleccionado.id, m.key)}
                                                                    className="w-4 h-4 rounded accent-tenri-900 cursor-pointer flex-shrink-0"
                                                                />
                                                                <span className="text-sm text-gray-700 group-hover:text-gray-900">{m.label}</span>
                                                            </label>
                                                            {activo && (
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    <span className="text-xs text-gray-400">$</span>
                                                                    <input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        value={(planSeleccionado.costo_operacional?.[m.key] || 0).toLocaleString('es-CL')}
                                                                        onChange={e => setCosto(planSeleccionado.id, m.key, e.target.value)}
                                                                        className="w-24 text-xs border border-gray-200 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-tenri-900"
                                                                        placeholder="0"
                                                                        title="Costo mensual de este módulo en CLP"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Drawer nuevo plan */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Nuevo plan ERP</h2>
                            <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nombre del plan *</label>
                                    <input
                                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tenri-200"
                                        value={form.name}
                                        onChange={e => handleFormChange('name', e.target.value)}
                                        placeholder="ERP Pyme Ultra"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Slug *</label>
                                    <input
                                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tenri-200"
                                        value={form.slug}
                                        onChange={e => handleFormChange('slug', e.target.value)}
                                        placeholder="erp-pyme-ultra"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Precio en UF/mes</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tenri-200"
                                        value={form.price_uf}
                                        onChange={e => handleFormChange('price_uf', e.target.value)}
                                        placeholder="4.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Label de precio</label>
                                    <input
                                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tenri-200"
                                        value={form.price_label}
                                        onChange={e => handleFormChange('price_label', e.target.value)}
                                        placeholder="4.5 UF/mes"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Descripción</label>
                                    <textarea
                                        rows={2}
                                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tenri-200 resize-none"
                                        value={form.description}
                                        onChange={e => handleFormChange('description', e.target.value)}
                                        placeholder="Para PYMEs que necesitan..."
                                    />
                                </div>
                                <div className="col-span-2 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_popular"
                                        checked={form.is_popular}
                                        onChange={e => handleFormChange('is_popular', e.target.checked)}
                                        className="w-4 h-4 accent-tenri-900"
                                    />
                                    <label htmlFor="is_popular" className="text-sm text-gray-700 cursor-pointer">
                                        Marcar como plan popular (destacado)
                                    </label>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                                    Módulos habilitados ({form.module_keys.length} seleccionados)
                                </p>
                                <div className="space-y-3">
                                    {CATEGORIAS_MODULOS.map(({ label, keys }) => {
                                        const modulosCat = allModules.filter(m => keys.includes(m.key));
                                        if (modulosCat.length === 0) return null;
                                        return (
                                            <div key={label} className="border border-gray-100 rounded-lg overflow-hidden">
                                                <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600">{label}</div>
                                                <div className="px-3 py-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {modulosCat.map(m => (
                                                        <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={form.module_keys.includes(m.key)}
                                                                onChange={() => toggleFormModulo(m.key)}
                                                                className="w-3.5 h-3.5 accent-tenri-900"
                                                            />
                                                            <span className="text-xs text-gray-700">{m.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={crearPlan}
                                disabled={creando}
                                className="w-full flex items-center justify-center gap-2 bg-tenri-900 text-white py-2.5 rounded-lg text-sm font-medium
                                    hover:bg-tenri-800 disabled:opacity-50 transition-colors"
                            >
                                {creando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Crear plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlanes;
