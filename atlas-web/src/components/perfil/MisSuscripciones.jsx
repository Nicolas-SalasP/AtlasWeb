import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, ShoppingBag, ArrowRight, Loader2, Calendar } from 'lucide-react';

const MisSuscripciones = ({ subscription, loading }) => {
    const navigate = useNavigate();

    // Helper para formatear precio
    const formatPrice = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

    if (loading) {
        return (
            <div className="p-12 flex justify-center text-atlas-900">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    // CASO 1: TIENE SUSCRIPCIÓN ACTIVA
    if (subscription?.status === 'active') {
        return (
            <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-bold text-gray-900">Mis Servicios Activos</h2>
                
                {/* Tarjeta de Suscripción */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition-shadow">
                    {/* Barra de estado visual */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{subscription.plan_name}</h3>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        Activo
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">Renovación automática mensual</p>
                            </div>
                            
                            <div className="text-right">
                                <p className="text-2xl font-black text-atlas-900">{formatPrice(subscription.amount || 25000)}<span className="text-sm font-medium text-gray-400">/mes</span></p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                                    <Calendar size={12} /> Próx. cobro: {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Lista de características incluidas */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Características del Plan</h4>
                            <div className="grid md:grid-cols-2 gap-3">
                                {subscription.features?.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> 
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-50 hover:text-atlas-900 transition-colors text-sm">
                                <CreditCard size={16} /> Cambiar Método de Pago
                            </button>
                            <button 
                                onClick={() => navigate('/catalogo')} // Opcional: Ir a ver más servicios
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-atlas-50 text-atlas-900 border border-transparent rounded-lg font-bold hover:bg-atlas-100 transition-colors text-sm"
                            >
                                Ver otros planes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // CASO 2: NO TIENE SUSCRIPCIONES (Empty State)
    return (
        <div className="animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mis Servicios</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-atlas-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={32} className="text-atlas-900" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes suscripciones activas</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Actualmente no cuentas con ningún plan ERP contratado. Explora nuestra tienda para encontrar las herramientas que potenciarán tu negocio.
                </p>
                
                <button 
                    onClick={() => navigate('/catalogo')}
                    className="bg-atlas-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-atlas-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
                >
                    Ir a la Tienda <ArrowRight size={18} />
                </button>
            </div>

            {/* Banner secundario opcional: Beneficios */}
            <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="font-bold text-gray-900 mb-1">Facturación Rápida</p>
                    <p className="text-xs text-gray-500">Emite documentos ante el SII en segundos.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="font-bold text-gray-900 mb-1">Control Total</p>
                    <p className="text-xs text-gray-500">Gestiona tu inventario y ventas fácilmente.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="font-bold text-gray-900 mb-1">Soporte 24/7</p>
                    <p className="text-xs text-gray-500">Ayuda técnica siempre disponible.</p>
                </div>
            </div>
        </div>
    );
};

export default MisSuscripciones;