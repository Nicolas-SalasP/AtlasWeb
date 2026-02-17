import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, User, Mail, Phone,
    Loader2, ShieldCheck, XCircle, AlertTriangle, CheckCircle, Truck, MapPin, Star, X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axiosConfig';
import PaymentSelector from '../components/checkout/PaymentSelector';
import { BASE_URL } from '../api/constants';
import { regiones } from '../api/chileData';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterAutomatically({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 15);
    }, [lat, lng]);
    return null;
}

const TARIFAS_ENVIO = {
    "Metropolitana": 3990, "Valparaíso": 5990, "Biobío": 6990, "Arica y Parinacota": 10990,
    "Tarapacá": 10990, "Antofagasta": 8990, "Atacama": 7990, "Coquimbo": 6990,
    "O'Higgins": 5990, "Maule": 6990, "Ñuble": 6990, "La Araucanía": 7990,
    "Los Ríos": 8990, "Los Lagos": 9990, "Aysén": 12990, "Magallanes": 12990
};

const formatearRut = (rut) => {
    let valor = rut.replace(/[.-]/g, '');
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
    let dvEsperado = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'K' : dvCalculado.toString();
    return dv === dvEsperado;
};

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [procesando, setProcesando] = useState(false);
    const [buscandoDireccion, setBuscandoDireccion] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [notification, setNotification] = useState({ show: false, type: 'error', title: '', message: '' });

    const regionInicial = regiones.find(r => r.nombre === 'Metropolitana') || regiones[0];
    const comunaInicial = regionInicial ? regionInicial.comunas[0] : '';

    const [datos, setDatos] = useState({
        nombre: '', apellido: '', email: '',
        telefono: '',
        rutPersonal: '',
        direccion: '', numero: '', depto: '',
        region: regionInicial.nombre,
        comuna: comunaInicial,
        tipoDocumento: 'boleta', rutEmpresa: '', razonSocial: '', giro: ''
    });

    const [errorRut, setErrorRut] = useState(false);
    const [costoEnvio, setCostoEnvio] = useState(TARIFAS_ENVIO[regionInicial.nombre] || 7990);
    const [mapCoords, setMapCoords] = useState({ lat: -33.4489, lng: -70.6693 });
    const [misDirecciones, setMisDirecciones] = useState([]);
    const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState(null);

    const regionObjeto = regiones.find(r => r.nombre === datos.region);
    const comunasDisponibles = regionObjeto ? regionObjeto.comunas : [];

    useEffect(() => {
        if (isAuthenticated && user) {
            setDatos(prev => ({
                ...prev,
                nombre: user.name || '',
                email: user.email || '',
                rutPersonal: user.rut ? formatearRut(user.rut) : ''
            }));

            const fetchMisDirecciones = async () => {
                try {
                    const res = await api.get('/addresses');
                    if (res.data && res.data.length > 0) {
                        setMisDirecciones(res.data);
                    }
                } catch (error) {
                    console.error(error);
                }
            };
            fetchMisDirecciones();
        }
    }, [isAuthenticated, user]);

    const seleccionarDireccion = (addr) => {
        setDireccionSeleccionadaId(addr.id);

        const regionExiste = regiones.find(r => r.nombre === addr.region);
        const regionValida = regionExiste ? addr.region : regionInicial.nombre;

        setDatos(prev => ({
            ...prev,
            direccion: addr.address,
            numero: addr.number,
            depto: addr.depto || '',
            region: regionValida,
            comuna: addr.commune
        }));

        if (TARIFAS_ENVIO[regionValida]) {
            setCostoEnvio(TARIFAS_ENVIO[regionValida]);
        }

        buscarDireccionEnMapaAutomatico(addr.address, addr.number, addr.commune, regionValida);
    };

    const getCartImage = (item) => {
        if (!item.images || item.images.length === 0) return "https://placehold.co/100?text=No+Img";
        const cover = item.images.find(img => img.is_cover == 1) || item.images[0];
        return `${BASE_URL}${cover.url}`;
    };

    const subtotal = getCartTotal();
    const totalConEnvio = subtotal + costoEnvio;
    const neto = Math.round(totalConEnvio / 1.19);
    const iva = totalConEnvio - neto;

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (['direccion', 'numero', 'region', 'comuna'].includes(name)) {
            setDireccionSeleccionadaId(null);
        }

        setDatos(prev => {
            const nuevosDatos = { ...prev, [name]: value };

            if (name === "region") {
                const nuevaRegion = regiones.find(r => r.nombre === value);
                nuevosDatos.comuna = nuevaRegion ? nuevaRegion.comunas[0] : '';
                setCostoEnvio(TARIFAS_ENVIO[value] || 7990);
            }
            return nuevosDatos;
        });
    };

    const handleRutChange = (e, fieldName) => {
        const rawValue = e.target.value.replace(/[^0-9kK]/g, '');
        const formatted = formatearRut(rawValue);
        setDatos(prev => ({ ...prev, [fieldName]: formatted }));
        if (formatted.length > 8 && !validarRutChileno(formatted)) setErrorRut(true);
        else setErrorRut(false);
    };

    const showModal = (type, title, message) => {
        setNotification({ show: true, type, title, message });
    };

    const buscarDireccionEnMapa = async () => {
        if (!datos.direccion || !datos.comuna) {
            showModal('info', 'Faltan Datos', 'Ingresa Calle y Comuna para buscar.');
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
                showModal('info', 'No encontrada', 'No encontramos la dirección exacta.');
            }
        } catch (e) {
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
        } catch (e) { }
    };

    const handleCrearOrden = async (e) => {
        e.preventDefault();
        const rutAValidar = datos.tipoDocumento === 'factura' ? datos.rutEmpresa : datos.rutPersonal;

        if (!validarRutChileno(rutAValidar)) {
            showModal('error', 'RUT Inválido', `RUT de ${datos.tipoDocumento} no válido.`);
            return;
        }

        if (!datos.telefono) {
            showModal('error', 'Falta Teléfono', 'Por favor ingresa un número de contacto.');
            return;
        }

        setProcesando(true);

        try {
            const orderPayload = {
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                shipping_cost: costoEnvio,
                shipping_address: `${datos.direccion} ${datos.numero ? '#' + datos.numero : ''} ${datos.depto ? 'Dpto ' + datos.depto : ''}, ${datos.comuna}, ${datos.region}`,
                customer_data: {
                    nombre: `${datos.nombre} ${datos.apellido}`,
                    rut: rutAValidar,
                    email: datos.email,
                    phone: `+56 ${datos.telefono}`
                }
            };

            const { data } = await api.post('/orders', orderPayload);
            if (isAuthenticated && data.is_guest_checkout) {
                showModal('info', 'Sesión Expirada', 'Tu sesión expiró por seguridad, pero tu compra se procesó correctamente como invitado.');
            }

            setOrderId(data.order_id);
            clearCart();

        } catch (error) {
            console.error(error);
            showModal('error', 'Error', 'Ocurrió un problema al crear la orden.');
        } finally {
            setProcesando(false);
        }
    };

    if (orderId) {
        return (
            <div className="min-h-screen pt-28 pb-20 bg-gray-50 flex flex-col items-center">
                <div className="max-w-2xl w-full px-4 text-center">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 mb-8 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">¡Datos Recibidos!</h2>
                        <p className="text-gray-500">Orden #{orderId} generada.</p>
                    </div>
                    <PaymentSelector orderId={orderId} />
                    <button onClick={() => window.location.href = '/catalogo'} className="mt-8 text-gray-400 hover:text-atlas-900 text-sm font-medium underline">
                        Cancelar y volver al catálogo
                    </button>
                </div>
            </div>
        );
    }

    if (cart.length === 0) return <div className="min-h-screen pt-24 text-center flex flex-col items-center justify-center"><h2 className="text-2xl font-bold mb-4">Carrito Vacío</h2><button onClick={() => navigate('/catalogo')} className="text-atlas-900 underline">Ir al catálogo</button></div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center gap-2">
                    <Link to="/catalogo" className="text-gray-500 flex items-center gap-1 text-sm font-medium hover:text-atlas-900 transition-colors"><ArrowLeft size={16} /> Volver</Link>
                    <span className="text-gray-300">|</span>
                    <h1 className="text-2xl font-bold text-atlas-900">Finalizar Compra</h1>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-6">

                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-atlas-900 text-white flex items-center justify-center text-xs">1</span> Datos Personales</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Nombre" name="nombre" value={datos.nombre} onChange={handleChange} icon={<User size={14} />} />
                                <Input label="Apellido" name="apellido" value={datos.apellido} onChange={handleChange} />
                                <Input label="Email" name="email" type="email" value={datos.email} onChange={handleChange} icon={<Mail size={14} />} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                                    <div className="relative flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-atlas-300">
                                        <div className="bg-gray-100 px-3 py-2 text-gray-500 font-bold select-none border-r border-gray-300 flex items-center">+56</div>
                                        <input type="text" name="telefono" value={datos.telefono} onChange={handleChange} placeholder="912345678" className="w-full px-4 py-2 outline-none" />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Phone size={14} /></div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RUT Personal <span className="text-red-500">*</span></label>
                                    <input type="text" value={datos.rutPersonal} onChange={(e) => handleRutChange(e, 'rutPersonal')} placeholder="12.345.678-9" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 outline-none" />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-atlas-900 text-white flex items-center justify-center text-xs">2</span> Envío</h2>

                            {isAuthenticated && misDirecciones.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <MapPin size={16} className="text-atlas-500" /> Usar una dirección guardada:
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {misDirecciones.map(addr => (
                                            <button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => seleccionarDireccion(addr)}
                                                className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative ${direccionSeleccionadaId === addr.id
                                                        ? 'bg-atlas-50 border-atlas-500 ring-1 ring-atlas-500 shadow-sm'
                                                        : 'bg-white border-gray-200 hover:border-atlas-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-full ${direccionSeleccionadaId === addr.id ? 'bg-atlas-200 text-atlas-800' : 'bg-gray-100 text-gray-500'}`}>
                                                    <MapPin size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <span className="font-bold text-gray-900 text-sm">{addr.alias}</span>
                                                        {addr.is_default && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{addr.address} #{addr.number}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{addr.commune}, {addr.region}</p>
                                                </div>
                                                {direccionSeleccionadaId === addr.id && (
                                                    <div className="absolute top-2 right-2 text-atlas-600"><CheckCircle size={14} /></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative flex py-5 items-center">
                                        <div className="flex-grow border-t border-gray-200"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">O ingresa otra dirección</span>
                                        <div className="flex-grow border-t border-gray-200"></div>
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="md:col-span-2"><Input label="Calle / Avenida" name="direccion" value={datos.direccion} onChange={handleChange} /></div>
                                <Input label="Número" name="numero" value={datos.numero} onChange={handleChange} />
                                <Input label="Depto" name="depto" value={datos.depto} onChange={handleChange} required={false} />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                                    <div className="relative">
                                        <select name="region" value={datos.region} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white appearance-none cursor-pointer transition-colors focus:ring-2 focus:ring-atlas-300 outline-none">
                                            {regiones.map(r => <option key={r.nombre} value={r.nombre}>{r.nombre}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                                    <div className="relative">
                                        <select name="comuna" value={datos.comuna} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white appearance-none cursor-pointer transition-colors focus:ring-2 focus:ring-atlas-300 outline-none">
                                            {comunasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex justify-end">
                                    <button type="button" onClick={buscarDireccionEnMapa} disabled={buscandoDireccion} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 transition-all active:scale-95 shadow-sm">
                                        {buscandoDireccion ? 'Buscando...' : <><Search size={16} /> Ubicar en Mapa</>}
                                    </button>
                                </div>
                            </div>
                            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 relative z-0">
                                <MapContainer center={[mapCoords.lat, mapCoords.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <RecenterAutomatically lat={mapCoords.lat} lng={mapCoords.lng} />
                                    <Marker position={[mapCoords.lat, mapCoords.lng]}><Popup>{datos.direccion}</Popup></Marker>
                                </MapContainer>
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-atlas-900 text-white flex items-center justify-center text-xs">3</span> Facturación</h2>
                            <div className="flex gap-4 mb-6">
                                {['boleta', 'factura'].map(tipo => (
                                    <label key={tipo} className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${datos.tipoDocumento === tipo ? 'border-atlas-500 bg-blue-50 ring-1 ring-atlas-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="tipoDocumento" value={tipo} checked={datos.tipoDocumento === tipo} onChange={handleChange} className="accent-atlas-900 w-4 h-4" />
                                            <span className="font-bold text-gray-700 capitalize">{tipo}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {datos.tipoDocumento === 'factura' && (
                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border-l-4 border-atlas-300 animate-in fade-in">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">RUT Empresa <span className="text-red-500">*</span></label><input type="text" value={datos.rutEmpresa} onChange={(e) => handleRutChange(e, 'rutEmpresa')} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none" placeholder="76.xxx.xxx-x" /></div>
                                    <div className="grid md:grid-cols-2 gap-4"><Input label="Razón Social" name="razonSocial" value={datos.razonSocial} onChange={handleChange} /><Input label="Giro" name="giro" value={datos.giro} onChange={handleChange} /></div>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-28">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen</h2>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-50 rounded-md border border-gray-100 p-1"><img src={getCartImage(item)} alt={item.name} className="w-full h-full object-contain" /></div>
                                        <div className="flex-1 text-sm"><p className="font-bold text-gray-800 line-clamp-2">{item.name}</p><p className="text-gray-500">x{item.quantity}</p></div>
                                        <p className="font-bold text-gray-900 text-sm">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Truck size={14} /> Envío ({datos.region})</span><span className="font-medium text-atlas-900">${costoEnvio.toLocaleString('es-CL')}</span></div>
                                <div className="flex justify-between"><span>Neto</span><span>${neto.toLocaleString('es-CL')}</span></div>
                                <div className="flex justify-between"><span>IVA (19%)</span><span>${iva.toLocaleString('es-CL')}</span></div>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-200 mt-4 pt-4 mb-6"><span className="text-lg font-bold text-gray-900">Total</span><span className="text-2xl font-bold text-atlas-900">${totalConEnvio.toLocaleString('es-CL')}</span></div>

                            <button onClick={handleCrearOrden} disabled={procesando} className="w-full bg-atlas-900 text-white font-bold py-4 rounded-xl hover:bg-atlas-800 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95">
                                {procesando ? <Loader2 className="animate-spin" /> : 'Confirmar Datos y Pagar'}
                            </button>
                            {errorRut && <p className="text-center text-xs text-red-500 mt-2">RUT Inválido.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {notification.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className={`p-4 flex justify-between items-start ${notification.type === 'error' ? 'bg-red-50 text-red-500' : notification.type === 'info' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                            <div className="flex justify-center w-full">
                                {notification.type === 'error' && <XCircle size={48} />}
                                {notification.type === 'info' && <AlertTriangle size={48} />}
                                {notification.type === 'success' && <CheckCircle size={48} />}
                            </div>
                            <button onClick={() => setNotification({ ...notification, show: false })} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{notification.title}</h3>
                            <p className="text-gray-500 mb-6 text-sm">{notification.message}</p>
                            <button onClick={() => setNotification({ ...notification, show: false })} className="w-full bg-atlas-900 text-white font-bold py-3 rounded-xl hover:bg-atlas-800 transition-colors">Entendido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Input = ({ label, name, type = "text", placeholder, value, onChange, required = true, icon = null }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full ${icon ? 'pl-9' : 'px-4'} py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 outline-none transition-all`} />
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        </div>
    </div>
);

export default Checkout;