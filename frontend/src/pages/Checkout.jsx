import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, User, Mail, Phone, Loader2, ShieldCheck,
    XCircle, AlertTriangle, CheckCircle, Truck, MapPin, Star,
    X, Building2, CreditCard, Lock, ChevronRight, ArrowRight,
    Sparkles, Package, FileText, ChevronDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axiosConfig';
import PaymentSelector from '../components/checkout/PaymentSelector';
import { BASE_URL } from '../api/constants';
import Terminos from './legal/Terminos';
import Privacidad from './legal/Privacidad';
import SLA from './legal/SLA';
import { REGIONES_CHILE, TARIFAS_ENVIO } from '../api/chileData';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterAutomatically({ lat, lng }) {
    const map = useMap();
    useEffect(() => { map.setView([lat, lng], 15); }, [lat, lng]);
    return null;
}

const formatearRut = (rut) => {
    const valor = (rut || '').replace(/[.-]/g, '');
    if (valor === '') return '';
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1).toUpperCase();
    return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (cuerpo.length > 0 ? "-" : "") + dv;
};

const validarRutChileno = (rut) => {
    if (!rut || rut.trim().length < 8) return false;
    const valor = rut.replace(/[.-]/g, '');
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1).toUpperCase();
    if (!/^\d+$/.test(cuerpo)) return false;
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const dvCalculado = 11 - resto;
    const dvEsperado = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'K' : dvCalculado.toString();
    return dv === dvEsperado;
};

const formatPrice = (amount) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
}).format(amount || 0);

const isServiceItem = (item) => {
    const id = String(item?.id ?? '');
    return id.startsWith('service-') || item?.type === 'service' || item?.is_service === true;
};

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate(); // eslint-disable-line no-unused-vars

    const [procesando, setProcesando] = useState(false);
    const [buscandoDireccion, setBuscandoDireccion] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [notification, setNotification] = useState({ show: false, type: 'error', title: '', message: '' });
    const [legalModal, setLegalModal] = useState({ open: false, type: '' });

    const [datos, setDatos] = useState({
        nombre: '', email: '',
        telefono: '', rutPersonal: '',
        direccion: '', numero: '', depto: '',
        region: "Metropolitana",
        comuna: "Santiago",
        tipoDocumento: 'boleta', rutEmpresa: '', razonSocial: '', giro: '',
        notas: '',
        accept_terms: false
    });

    const [errorRut, setErrorRut] = useState(false);
    const [costoEnvio, setCostoEnvio] = useState(TARIFAS_ENVIO["Metropolitana"]);
    const [mapCoords, setMapCoords] = useState({ lat: -33.4489, lng: -70.6693 });
    const [misDirecciones, setMisDirecciones] = useState([]);
    const [misEmpresas, setMisEmpresas] = useState([]);
    const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState(null);
    const [empresaSeleccionadaId, setEmpresaSeleccionadaId] = useState('nueva');

    const comunasDisponibles = REGIONES_CHILE[datos.region] || [];

    useEffect(() => {
        if (isAuthenticated && user) {
            let cleanPhone = user.phone || '';
            if (cleanPhone.startsWith('+56')) {
                cleanPhone = cleanPhone.substring(3).trim();
            }

            setDatos(prev => ({
                ...prev,
                nombre: user.name || '',
                email: user.email || '',
                telefono: cleanPhone,
                rutPersonal: user.rut ? formatearRut(user.rut) : ''
            }));

            const fetchDatosUsuario = async () => {
                try {
                    const [resDir, resEmp] = await Promise.all([
                        api.get('/addresses').catch(() => ({ data: [] })),
                        api.get('/billing-profiles').catch(() => ({ data: [] })),
                    ]);

                    if (resDir.data && resDir.data.length > 0) {
                        setMisDirecciones(resDir.data);
                    }

                    if (resEmp.data && resEmp.data.length > 0) {
                        setMisEmpresas(resEmp.data);
                        const defaultEmp = resEmp.data.find(e => e.is_default) || resEmp.data[0];
                        setEmpresaSeleccionadaId(defaultEmp.id.toString());
                        setDatos(prev => ({
                            ...prev,
                            rutEmpresa: defaultEmp.rut,
                            razonSocial: defaultEmp.business_name,
                            giro: defaultEmp.business_line
                        }));
                    }
                } catch (_error) { console.error("Error cargando perfil:", error); }
            };
            fetchDatosUsuario();
        }
    }, [isAuthenticated, user]);

    const seleccionarDireccion = (addr) => {
        setDireccionSeleccionadaId(addr.id);
        const regionValida = REGIONES_CHILE[addr.region] ? addr.region : "Metropolitana";

        setDatos(prev => ({
            ...prev,
            direccion: addr.address,
            numero: addr.number,
            depto: addr.depto || '',
            region: regionValida,
            comuna: addr.commune
        }));

        setCostoEnvio(TARIFAS_ENVIO[regionValida] || 7990);
        buscarDireccionEnMapaAutomatico(addr.address, addr.number, addr.commune, regionValida);
    };

    const handleSeleccionarEmpresa = (e) => {
        const id = e.target.value;
        setEmpresaSeleccionadaId(id);

        if (id === 'nueva') {
            setDatos(prev => ({ ...prev, rutEmpresa: '', razonSocial: '', giro: '' }));
        } else {
            const emp = misEmpresas.find(e => e.id.toString() === id);
            if (emp) {
                setDatos(prev => ({
                    ...prev,
                    rutEmpresa: emp.rut,
                    razonSocial: emp.business_name,
                    giro: emp.business_line
                }));
            }
        }
    };

    const getCartImage = (item) => {
        if (!item.images || item.images.length === 0) return null;
        const cover = item.images.find(img => !!img.is_cover) || item.images[0];
        return `${BASE_URL}${cover.url}`;
    };

    const allServices = useMemo(() => cart.length > 0 && cart.every(isServiceItem), [cart]);

    const totales = useMemo(() => {
        const subtotalBruto = getCartTotal();
        const envio = allServices ? 0 : (costoEnvio || 0);
        const totalBruto = subtotalBruto + envio;
        const neto = Math.round(totalBruto / 1.19);
        const iva = totalBruto - neto;

        return { subtotalBruto, envio, totalBruto, neto, iva };
    }, [getCartTotal, costoEnvio, cart, allServices]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setDatos(prev => ({ ...prev, [name]: checked }));
            return;
        }

        if (['direccion', 'numero', 'region', 'comuna'].includes(name)) {
            setDireccionSeleccionadaId(null);
        }
        if (['rutEmpresa', 'razonSocial', 'giro'].includes(name)) {
            setEmpresaSeleccionadaId('nueva');
        }

        setDatos(prev => {
            const nuevosDatos = { ...prev, [name]: value };
            if (name === "region") {
                nuevosDatos.comuna = REGIONES_CHILE[value] ? REGIONES_CHILE[value][0] : '';
                setCostoEnvio(TARIFAS_ENVIO[value] || 7990);
            }
            return nuevosDatos;
        });
    };

    const handleRutChange = (e, fieldName) => {
        const rawValue = e.target.value.replace(/[^0-9kK]/g, '');
        const formatted = formatearRut(rawValue);
        setDatos(prev => ({ ...prev, [fieldName]: formatted }));
        setErrorRut(formatted.length > 8 && !validarRutChileno(formatted));
    };

    const showModal = (type, title, message) => setNotification({ show: true, type, title, message });

    const buscarDireccionEnMapa = async () => {
        if (!datos.direccion || !datos.comuna) {
            showModal('info', 'Faltan datos', 'Ingresá calle y comuna para buscar.');
            return;
        }
        setBuscandoDireccion(true);
        const query = `${datos.direccion} ${datos.numero}, ${datos.comuna}, ${datos.region}, Chile`;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                setMapCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            } else {
                showModal('info', 'No encontrada', 'No encontramos la dirección exacta. Revisá los datos.');
            }
        } catch (_e) {
            showModal('error', 'Error', 'Error de conexión con el mapa.');
        } finally {
            setBuscandoDireccion(false);
        }
    };

    const buscarDireccionEnMapaAutomatico = async (calle, num, comuna, region) => {
        const query = `${calle} ${num}, ${comuna}, ${region}, Chile`;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                setMapCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            }
        } catch (_e) { /* silent */ }
    };

    const handleCrearOrden = async () => {
        const rutAValidar = datos.tipoDocumento === 'factura' ? datos.rutEmpresa : datos.rutPersonal;

        if (!validarRutChileno(rutAValidar)) {
            showModal('error', 'RUT inválido', `El RUT de ${datos.tipoDocumento} no es válido.`);
            return;
        }
        if (!datos.telefono) {
            showModal('error', 'Falta teléfono', 'Por favor ingresá un número de contacto.');
            return;
        }
        if (!allServices && (!datos.direccion || !datos.numero)) {
            showModal('error', 'Falta dirección', 'Ingresá calle y número de la dirección de envío.');
            return;
        }
        if (!datos.accept_terms) {
            showModal('error', 'Términos requeridos', 'Debés aceptar los términos para continuar.');
            return;
        }

        setProcesando(true);
        try {
            const shippingAddress = allServices
                ? 'Servicio digital · sin envío físico'
                : `${datos.direccion} ${datos.numero ? '#' + datos.numero : ''}${datos.depto ? ' Dpto ' + datos.depto : ''}, ${datos.comuna}, ${datos.region}`;

            const orderPayload = {
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                shipping_cost: totales.envio,
                shipping_address: shippingAddress,
                customer_data: {
                    nombre: datos.nombre,
                    rut: rutAValidar,
                    email: datos.email,
                    phone: `+56 ${datos.telefono}`,
                    region: datos.region,
                    tipo_documento: datos.tipoDocumento === 'factura' ? 'Factura' : 'Boleta',
                    ...(datos.tipoDocumento === 'factura' && {
                        razon_social: datos.razonSocial,
                        giro: datos.giro
                    })
                },
                notes: datos.notas,
                terms_accepted: true
            };

            const { data } = await api.post('/orders', orderPayload);
            if (isAuthenticated && data.is_guest_checkout) {
                showModal('info', 'Sesión expirada', 'Tu sesión expiró por seguridad, pero tu compra se procesó correctamente como invitado.');
            }
            const newOrderId = data.order?.id ?? data.order_id;
            if (!newOrderId) {
                showModal('error', 'Error al procesar', 'La orden se creó pero no recibimos su identificador. Contactá soporte.');
                return;
            }
            setOrderId(newOrderId);
            clearCart();
        } catch (_error) {
            console.error(error);
            const body = error.response?.data;
            let msg = body?.message || 'Ocurrió un problema al crear la orden.';
            if (body?.errors) {
                msg = Object.values(body.errors).flat().join(' ');
            }
            if (body?.debug) {
                msg += ` [${body.debug.exception}: ${body.debug.error} @ ${body.debug.file}]`;
            }
            showModal('error', 'Error al procesar', msg);
        } finally {
            setProcesando(false);
        }
    };

    if (orderId) {
        return (
            <div className="min-h-screen pt-28 pb-20 bg-gray-50 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-6 text-center animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <CheckCircle size={28} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 mb-3">
                            <Sparkles size={10} /> Orden creada
                        </span>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">¡Datos recibidos!</h2>
                        <p className="text-gray-500 text-sm">Orden <span className="font-mono font-bold text-gray-900">#{orderId}</span> generada correctamente.</p>
                        <p className="text-gray-500 text-sm mt-1">Elegí cómo querés pagar:</p>
                    </div>
                    <PaymentSelector orderId={orderId} />
                    <div className="text-center mt-6">
                        <button
                            onClick={() => navigate('/catalogo')}
                            className="text-gray-500 hover:text-tenri-900 text-sm font-medium underline"
                        >
                            Volver al catálogo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-gray-50">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 md:p-12 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Package size={28} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Tu carrito está vacío</h2>
                    <p className="text-gray-500 text-sm mb-6">Agregá productos al carrito para continuar con la compra.</p>
                    <button
                        onClick={() => navigate('/catalogo')}
                        className="inline-flex items-center gap-2 bg-tenri-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-tenri-800 transition-all shadow-md text-sm group"
                    >
                        Explorar catálogo
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20 relative">

            {legalModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
                        <div className="flex justify-between items-center p-4 sm:px-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg md:text-xl font-extrabold text-gray-800 tracking-tight">
                                {legalModal.type === 'terminos' && 'Términos y Condiciones'}
                                {legalModal.type === 'privacidad' && 'Política de Privacidad'}
                                {legalModal.type === 'sla' && 'Acuerdo de Nivel de Servicio'}
                            </h2>
                            <button
                                onClick={() => setLegalModal({ open: false, type: '' })}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto w-full relative document-modal-content">
                            {legalModal.type === 'terminos' && <Terminos embedded />}
                            {legalModal.type === 'privacidad' && <Privacidad embedded />}
                            {legalModal.type === 'sla' && <SLA embedded />}
                        </div>
                        <div className="p-4 sm:px-6 border-t border-gray-200 bg-white flex justify-end">
                            <button
                                onClick={() => setLegalModal({ open: false, type: '' })}
                                className="bg-tenri-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-tenri-800 transition-colors shadow-md text-sm"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-6 flex items-center gap-3">
                    <Link to="/catalogo" className="text-gray-500 flex items-center gap-1 text-sm font-medium hover:text-tenri-900 transition-colors">
                        <ArrowLeft size={14} /> Volver
                    </Link>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">Carrito</span>
                    <ChevronRight size={12} className="text-gray-300" />
                    <span className="text-sm text-tenri-900 font-bold">Finalizar compra</span>
                </div>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-tenri-50 text-tenri-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-tenri-100 mb-3">
                        <Sparkles size={10} /> Último paso
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Finalizar compra</h1>
                    <p className="text-gray-500 text-sm mt-1">Completá tus datos y elegí cómo pagar.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

                    <div className="lg:col-span-7 space-y-5">

                        <SectionCard step={1} title="Datos personales" icon={<User size={16} />}>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <FormInput label="Nombre y apellido" name="nombre" value={datos.nombre} onChange={handleChange} icon={<User size={14} />} required />
                                </div>
                                <FormInput label="Email" name="email" type="email" value={datos.email} onChange={handleChange} icon={<Mail size={14} />} required />
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Teléfono <span className="text-red-500 normal-case">*</span></label>
                                    <div className="relative flex rounded-xl bg-gray-50 border border-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-tenri-300 focus-within:bg-white transition-all">
                                        <div className="px-3 py-3 text-gray-500 font-bold select-none border-r border-gray-200 flex items-center bg-white text-sm">+56</div>
                                        <input
                                            type="text"
                                            name="telefono"
                                            value={datos.telefono}
                                            onChange={handleChange}
                                            placeholder="912345678"
                                            className="w-full px-4 py-3 outline-none bg-transparent text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                                        RUT personal <span className="text-red-500 normal-case">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={datos.rutPersonal}
                                        onChange={(e) => handleRutChange(e, 'rutPersonal')}
                                        placeholder="12.345.678-9"
                                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 border focus:bg-white focus:ring-2 outline-none transition-all text-sm ${errorRut ? 'border-red-200 focus:ring-red-200' : 'border-gray-100 focus:ring-tenri-300'}`}
                                    />
                                    {errorRut && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle size={12} /> RUT inválido</p>}
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard step={2} title={allServices ? 'Datos de contacto' : 'Envío'} icon={allServices ? <Sparkles size={16} /> : <Truck size={16} />}>

                            {allServices && (
                                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-emerald-800">
                                    <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                                    <div className="text-xs leading-relaxed">
                                        <span className="font-bold">Tu pedido es un servicio digital.</span> No requiere envío físico — recibirás los detalles por correo. La dirección abajo es <span className="font-bold">opcional</span> (sirve para tu registro de facturación).
                                    </div>
                                </div>
                            )}

                            {isAuthenticated && misDirecciones.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                        <MapPin size={11} /> Dirección guardada
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {misDirecciones.map(addr => (
                                            <button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => seleccionarDireccion(addr)}
                                                className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative ${direccionSeleccionadaId === addr.id ? 'bg-tenri-50 border-tenri-500 ring-1 ring-tenri-500' : 'bg-white border-gray-100 hover:border-tenri-200 hover:shadow-sm'}`}
                                            >
                                                <div className={`p-2 rounded-lg shrink-0 ${direccionSeleccionadaId === addr.id ? 'bg-tenri-200 text-tenri-800' : 'bg-gray-100 text-gray-500'}`}>
                                                    <MapPin size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 justify-between">
                                                        <span className="font-bold text-gray-900 text-sm truncate">{addr.alias}</span>
                                                        {addr.is_default && <Star size={10} className="text-yellow-500 fill-yellow-500 shrink-0" />}
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{addr.address} #{addr.number}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{addr.commune}, {addr.region}</p>
                                                </div>
                                                {direccionSeleccionadaId === addr.id && (
                                                    <div className="absolute top-2 right-2 text-tenri-600">
                                                        <CheckCircle size={14} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative flex py-4 items-center">
                                        <div className="flex-grow border-t border-gray-100"></div>
                                        <span className="flex-shrink-0 mx-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">O ingresá otra</span>
                                        <div className="flex-grow border-t border-gray-100"></div>
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <FormInput label="Calle / Avenida" name="direccion" value={datos.direccion} onChange={handleChange} required={!allServices} />
                                </div>
                                <FormInput label="Número" name="numero" value={datos.numero} onChange={handleChange} required={!allServices} />
                                <FormInput label="Depto / Casa" name="depto" value={datos.depto} onChange={handleChange} required={false} />
                                <FormSelect label="Región" name="region" value={datos.region} onChange={handleChange} options={Object.keys(REGIONES_CHILE)} required={!allServices} />
                                <FormSelect label="Comuna" name="comuna" value={datos.comuna} onChange={handleChange} options={comunasDisponibles} required={!allServices} />
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Notas del pedido <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
                                    <textarea
                                        name="notas"
                                        value={datos.notas}
                                        onChange={handleChange}
                                        placeholder="Ej: dejar en portería, llamar al llegar..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none transition-all resize-none h-20 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={buscarDireccionEnMapa}
                                        disabled={buscandoDireccion}
                                        className="bg-tenri-50 text-tenri-900 hover:bg-tenri-100 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-tenri-100 disabled:opacity-50"
                                    >
                                        {buscandoDireccion ? (
                                            <><Loader2 size={14} className="animate-spin" /> Buscando...</>
                                        ) : (
                                            <><Search size={14} /> Ubicar en el mapa</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="w-full h-56 md:h-64 rounded-2xl overflow-hidden border border-gray-100 relative z-0 shadow-sm">
                                <MapContainer center={[mapCoords.lat, mapCoords.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <RecenterAutomatically lat={mapCoords.lat} lng={mapCoords.lng} />
                                    <Marker position={[mapCoords.lat, mapCoords.lng]}>
                                        <Popup>{datos.direccion || 'Tu dirección'}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </SectionCard>

                        <SectionCard step={3} title="Documento tributario" icon={<FileText size={16} />}>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {[
                                    { value: 'boleta', label: 'Boleta', desc: 'Compra personal' },
                                    { value: 'factura', label: 'Factura', desc: 'Compra empresa' },
                                ].map(tipo => (
                                    <label
                                        key={tipo.value}
                                        className={`border rounded-xl p-3 md:p-4 cursor-pointer transition-all ${datos.tipoDocumento === tipo.value ? 'border-tenri-500 bg-tenri-50/50 ring-1 ring-tenri-500' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <input
                                                type="radio"
                                                name="tipoDocumento"
                                                value={tipo.value}
                                                checked={datos.tipoDocumento === tipo.value}
                                                onChange={handleChange}
                                                className="accent-tenri-900 w-4 h-4 mt-0.5"
                                            />
                                            <div>
                                                <span className="font-bold text-gray-900 text-sm block">{tipo.label}</span>
                                                <span className="text-[11px] text-gray-500">{tipo.desc}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {datos.tipoDocumento === 'factura' && (
                                <div className="space-y-4 bg-gradient-to-br from-gray-50 to-white p-4 md:p-5 rounded-xl border-l-4 border-tenri-300 animate-in fade-in">
                                    {isAuthenticated && misEmpresas.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                                                <Building2 size={11} /> Empresa
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={empresaSeleccionadaId}
                                                    onChange={handleSeleccionarEmpresa}
                                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 cursor-pointer focus:ring-2 focus:ring-tenri-300 outline-none transition-all text-sm font-medium pr-10 appearance-none"
                                                >
                                                    {misEmpresas.map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.business_name} ({emp.rut})</option>
                                                    ))}
                                                    <option value="nueva">+ Ingresar otra empresa</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}
                                    <div className={`space-y-4 transition-all duration-300 ${empresaSeleccionadaId !== 'nueva' && misEmpresas.length > 0 ? 'opacity-60 pointer-events-none' : ''}`}>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">RUT empresa <span className="text-red-500 normal-case">*</span></label>
                                            <input
                                                type="text"
                                                value={datos.rutEmpresa}
                                                onChange={(e) => handleRutChange(e, 'rutEmpresa')}
                                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-tenri-300 text-sm"
                                                placeholder="76.xxx.xxx-x"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormInput label="Razón social" name="razonSocial" value={datos.razonSocial} onChange={handleChange} bgLight />
                                            <FormInput label="Giro" name="giro" value={datos.giro} onChange={handleChange} bgLight />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">

                            <div className="flex items-baseline justify-between mb-5">
                                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Resumen del pedido</h2>
                                <span className="text-xs text-gray-500 font-bold">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                            </div>

                            <div className="space-y-3 max-h-56 overflow-y-auto pr-2 mb-5 custom-scrollbar">
                                {cart.map(item => {
                                    const img = getCartImage(item);
                                    return (
                                        <div key={item.id} className="flex gap-3 items-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                                {img ? (
                                                    <img src={img} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <Package size={18} className="text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-sm min-w-0">
                                                <p className="font-bold text-gray-800 line-clamp-2 leading-tight">{item.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">x{item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm shrink-0">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                                <SummaryRow label="Subtotal productos" value={formatPrice(totales.subtotalBruto)} />
                                {allServices ? (
                                    <SummaryRow
                                        label={
                                            <span className="flex items-center gap-1.5">
                                                <Sparkles size={12} className="text-tenri-500" /> Servicio digital
                                            </span>
                                        }
                                        value={<span className="text-emerald-600 font-bold text-xs">Sin envío</span>}
                                    />
                                ) : (
                                    <SummaryRow
                                        label={
                                            <span className="flex items-center gap-1.5">
                                                <Truck size={12} className="text-gray-400" /> Envío · {datos.region}
                                            </span>
                                        }
                                        value={formatPrice(totales.envio)}
                                    />
                                )}
                                <div className="text-[10px] text-gray-400 font-medium pt-1 italic">
                                    Incluye IVA — Neto {formatPrice(totales.neto)} · IVA {formatPrice(totales.iva)}
                                </div>
                            </div>

                            <div className="flex justify-between items-baseline border-t-2 border-gray-100 mt-4 pt-4 mb-5">
                                <span className="text-base font-extrabold text-gray-900">Total</span>
                                <span className="text-2xl md:text-3xl font-black text-tenri-900 tracking-tight">{formatPrice(totales.totalBruto)}</span>
                            </div>

                            <label className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    id="accept_terms"
                                    name="accept_terms"
                                    checked={datos.accept_terms}
                                    onChange={handleChange}
                                    className="mt-0.5 w-4 h-4 text-tenri-900 border-gray-300 rounded focus:ring-tenri-500 cursor-pointer accent-tenri-900"
                                />
                                <span className="text-[11px] text-gray-600 leading-relaxed select-none">
                                    Acepto los{' '}
                                    <button type="button" onClick={() => setLegalModal({ open: true, type: 'terminos' })} className="font-bold text-tenri-700 hover:text-tenri-900 underline">
                                        Términos
                                    </button>
                                    ,{' '}
                                    <button type="button" onClick={() => setLegalModal({ open: true, type: 'privacidad' })} className="font-bold text-tenri-700 hover:text-tenri-900 underline">
                                        Privacidad
                                    </button>
                                    {' '}y el{' '}
                                    <button type="button" onClick={() => setLegalModal({ open: true, type: 'sla' })} className="font-bold text-tenri-700 hover:text-tenri-900 underline">
                                        SLA
                                    </button>.
                                </span>
                            </label>

                            <button
                                onClick={handleCrearOrden}
                                disabled={procesando || !datos.accept_terms}
                                className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg group ${procesando || !datos.accept_terms
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-tenri-900 text-white hover:bg-tenri-800 hover:-translate-y-0.5 shadow-tenri-900/20'
                                    }`}
                            >
                                {procesando ? (
                                    <><Loader2 className="animate-spin" size={18} /> Procesando...</>
                                ) : (
                                    <>
                                        Continuar al pago
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-bold">
                                <span className="flex items-center gap-1"><Lock size={10} /> Pago seguro</span>
                                <span className="text-gray-200">|</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={10} /> Webpay verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {notification.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className={`p-5 flex justify-center relative ${notification.type === 'error' ? 'bg-red-50 text-red-500' : notification.type === 'info' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            {notification.type === 'error' && <XCircle size={44} />}
                            {notification.type === 'info' && <AlertTriangle size={44} />}
                            {notification.type === 'success' && <CheckCircle size={44} />}
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white/40"
                                aria-label="Cerrar"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="text-lg font-extrabold text-gray-900 mb-1 tracking-tight">{notification.title}</h3>
                            <p className="text-gray-500 mb-5 text-sm leading-relaxed">{notification.message}</p>
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                className="w-full bg-tenri-900 text-white font-bold py-3 rounded-xl hover:bg-tenri-800 transition-colors text-sm"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SectionCard = ({ step, title, icon, children }) => (
    <section className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-base md:text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2.5 tracking-tight">
            <span className="w-7 h-7 rounded-full bg-tenri-900 text-white flex items-center justify-center text-xs font-black">
                {step}
            </span>
            <span className="text-tenri-700">{icon}</span>
            {title}
        </h2>
        {children}
    </section>
);

const FormInput = ({ label, name, type = "text", placeholder, value, onChange, required = true, icon = null, bgLight = false }) => (
    <div className="w-full">
        <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
            {label} {required && <span className="text-red-500 normal-case">*</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full ${icon ? 'pl-9' : 'px-4'} py-3 rounded-xl ${bgLight ? 'bg-white' : 'bg-gray-50'} border border-gray-100 focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none transition-all text-sm`}
            />
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        </div>
    </div>
);

const FormSelect = ({ label, name, value, onChange, options, required = true }) => (
    <div className="w-full">
        <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
            {label} {required && <span className="text-red-500 normal-case">*</span>}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 appearance-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none transition-all text-sm pr-10"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
    </div>
);

const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between items-center text-gray-600">
        <span>{label}</span>
        <span className="font-bold text-gray-900">{value}</span>
    </div>
);

export default Checkout;
