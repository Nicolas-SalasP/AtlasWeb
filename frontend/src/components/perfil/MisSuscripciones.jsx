import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, ShoppingBag, ArrowRight, Loader2, Calendar, ArrowUpRight, Lock, Sparkles } from 'lucide-react';

const ERP_URL = 'https://erp.tenri.cl';

const formatPrice = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

const MisSuscripciones = ({ subscription, loading }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 text-tenri-900">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">Cargando suscripción...</span>
            </div>
        );
    }

    if (subscription?.status === 'active') {
        const features = Array.isArray(subscription.features) ? subscription.features : [];

        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Suscripción ERP</h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{subscription.plan_name || 'Plan ERP'}</h3>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Activo
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">Acceso completo al sistema ERP</p>
                            </div>

                            <div className="text-left md:text-right">
                                <p className="text-2xl md:text-3xl font-black text-tenri-900">
                                    {formatPrice(subscription.amount || 25000)}
                                    <span className="text-sm font-medium text-gray-400">/mes</span>
                                </p>
                                {subscription.next_billing_date && (
                                    <p className="text-xs text-gray-500 mt-1 flex items-center md:justify-end gap-1">
                                        <Calendar size={11} /> Próx. cobro: {new Date(subscription.next_billing_date).toLocaleDateString('es-CL')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {features.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4 md:p-5 mb-6 border border-gray-100">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Características del plan</h4>
                                <div className="grid md:grid-cols-2 gap-2.5">
                                    {features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                                            <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <a
                                href={ERP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-tenri-900 text-white rounded-xl font-bold hover:bg-tenri-800 transition-colors text-sm shadow-md group"
                            >
                                Acceder al ERP
                                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                            <button
                                onClick={() => navigate('/catalogo')}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-tenri-300 text-gray-700 hover:text-tenri-900 rounded-xl font-bold transition-colors text-sm"
                            >
                                Ver otros planes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">Suscripción ERP</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-100">
                    <Lock size={28} className="text-amber-600" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 mb-4">
                    <Sparkles size={10} /> Sin licencia activa
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Activá tu acceso al ERP</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Comprá una licencia desde la tienda para empezar a usar el sistema de gestión completo.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate('/catalogo')}
                        className="bg-tenri-900 text-white px-7 py-3 rounded-xl font-bold shadow-md hover:bg-tenri-800 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm group"
                    >
                        Ver planes disponibles
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/contacto?servicio=erp')}
                        className="bg-white border border-gray-200 hover:border-tenri-300 text-gray-700 hover:text-tenri-900 font-bold px-7 py-3 rounded-xl transition-all text-sm"
                    >
                        Solicitar cotización
                    </button>
                </div>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <CreditCard size={16} />
                    </div>
                    <p className="font-bold text-gray-900 mb-1 text-sm">Facturación SII</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Emití documentos electrónicos certificados.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <ShoppingBag size={16} />
                    </div>
                    <p className="font-bold text-gray-900 mb-1 text-sm">Control total</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Inventario, ventas y reportes en tiempo real.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                        <CheckCircle size={16} />
                    </div>
                    <p className="font-bold text-gray-900 mb-1 text-sm">Soporte 24/7</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Ayuda técnica siempre disponible.</p>
                </div>
            </div>
        </div>
    );
};

export default MisSuscripciones;
