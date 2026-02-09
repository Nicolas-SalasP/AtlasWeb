import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, User, Mail, Phone,
    Loader2, ShieldCheck, XCircle, AlertTriangle, CheckCircle, Truck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axiosConfig';
import PaymentSelector from '../components/checkout/PaymentSelector';
import { BASE_URL } from '../api/constants';

// --- CONFIGURACIÓN LEAFLET ---
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

// --- DATOS DE CHILE ---
const REGIONES_CHILE = {
    "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
    "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
    "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
    "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
    "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
    "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
    "Metropolitana": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
    "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
    "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
    "Ñuble": ["Chillán", "Chillán Viejo", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
    "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
    "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
    "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
    "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
    "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
    "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos (Ex Navarino)", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

const TARIFAS_ENVIO = {
    "Metropolitana": 3990, "Valparaíso": 5990, "Biobío": 6990, "Arica y Parinacota": 10990,
    "Tarapacá": 10990, "Antofagasta": 8990, "Atacama": 7990, "Coquimbo": 6990,
    "O'Higgins": 5990, "Maule": 6990, "Ñuble": 6990, "La Araucanía": 7990,
    "Los Ríos": 8990, "Los Lagos": 9990, "Aysén": 12990, "Magallanes": 12990
};

// --- UTILIDADES RUT ---
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
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [procesando, setProcesando] = useState(false);
    const [buscandoDireccion, setBuscandoDireccion] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [notification, setNotification] = useState({ show: false, type: 'error', title: '', message: '' });

    // ESTADO DEL FORMULARIO
    const [datos, setDatos] = useState({
        nombre: '', apellido: '', email: '',
        telefono: '',
        rutPersonal: '',
        direccion: '', numero: '', depto: '',
        region: 'Metropolitana',
        comuna: REGIONES_CHILE["Metropolitana"][0],
        tipoDocumento: 'boleta', rutEmpresa: '', razonSocial: '', giro: ''
    });

    const [errorRut, setErrorRut] = useState(false);
    const [costoEnvio, setCostoEnvio] = useState(TARIFAS_ENVIO["Metropolitana"]);
    const [mapCoords, setMapCoords] = useState({ lat: -33.4489, lng: -70.6693 });
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
        setDatos(prev => {
            const nuevosDatos = { ...prev, [name]: value };
            if (name === "region") {
                nuevosDatos.comuna = REGIONES_CHILE[value][0];
                setCostoEnvio(TARIFAS_ENVIO[value] || 7990);
            }
            return nuevosDatos;
        });
    };

    const handleRutChange = (e, fieldName) => {
        const rawValue = e.target.value.replace(/[^0-9kK]/g, '');
        const formatted = formatearRut(rawValue);
        setDatos({ ...datos, [fieldName]: formatted });
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
                shipping_address: `${datos.direccion} #${datos.numero} ${datos.depto ? 'Dpto ' + datos.depto : ''}, ${datos.comuna}, ${datos.region}`,
                customer_data: {
                    nombre: `${datos.nombre} ${datos.apellido}`,
                    rut: rutAValidar,
                    email: datos.email,
                    phone: `+56 ${datos.telefono}`
                }
            };

            const { data } = await api.post('/orders', orderPayload);
            if (isAuthenticated && data.is_guest_checkout) {
                showModal('info', 'Sesión Expirada', 'Tu sesión expiró por seguridad, pero tu compra se procesó correctamente como invitado. Recibirás el comprobante a tu correo.');
            }

            setOrderId(data.order_id);
            clearCart();

        } catch (error) {
            console.error("Error creating order:", error);
            showModal('error', 'Error', 'Ocurrió un problema al crear la orden.');
        } finally {
            setProcesando(false);
        }
    };

    if (orderId) {
        return (
            <div className="min-h-screen pt-28 pb-20 bg-gray-50 flex flex-col items-center">
                <div className="max-w-2xl w-full px-4 text-center">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 mb-8">
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

    if (cart.length === 0) return <div className="min-h-screen pt-24 text-center"><h2 className="text-2xl font-bold">Carrito Vacío</h2><button onClick={() => navigate('/catalogo')} className="underline mt-4">Ir al catálogo</button></div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center gap-2">
                    <Link to="/catalogo" className="text-gray-500 flex items-center gap-1 text-sm font-medium"><ArrowLeft size={16} /> Volver</Link>
                    <span className="text-gray-300">|</span>
                    <h1 className="text-2xl font-bold text-atlas-900">Finalizar Compra</h1>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* FORMULARIO */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. DATOS PERSONALES */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-atlas-900 text-white flex items-center justify-center text-xs">1</span> Datos Personales</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Nombre" name="nombre" value={datos.nombre} onChange={handleChange} icon={<User size={14} />} />
                                <Input label="Apellido" name="apellido" value={datos.apellido} onChange={handleChange} />
                                <Input label="Email" name="email" type="email" value={datos.email} onChange={handleChange} icon={<Mail size={14} />} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                                    <div className="relative flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-atlas-300">
                                        <div className="bg-gray-100 px-3 py-2 text-gray-500 font-bold select-none border-r border-gray-300 flex items-center">
                                            +56
                                        </div>
                                        <input
                                            type="text"
                                            name="telefono"
                                            value={datos.telefono}
                                            onChange={handleChange}
                                            placeholder="912345678"
                                            className="w-full px-4 py-2 outline-none"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <Phone size={14} />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RUT Personal <span className="text-red-500">*</span></label>
                                    <input type="text" value={datos.rutPersonal} onChange={(e) => handleRutChange(e, 'rutPersonal')} placeholder="12.345.678-9" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 outline-none" />
                                </div>
                            </div>
                        </section>

                        {/* 2. DIRECCIÓN (REGIONES DINÁMICAS) */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-atlas-900 text-white flex items-center justify-center text-xs">2</span> Envío</h2>
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="md:col-span-2"><Input label="Calle / Avenida" name="direccion" value={datos.direccion} onChange={handleChange} /></div>
                                <Input label="Número" name="numero" value={datos.numero} onChange={handleChange} />
                                <Input label="Depto" name="depto" value={datos.depto} onChange={handleChange} required={false} />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                                    <div className="relative">
                                        <select name="region" value={datos.region} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white appearance-none cursor-pointer">
                                            {Object.keys(REGIONES_CHILE).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                                    <div className="relative">
                                        <select name="comuna" value={datos.comuna} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white appearance-none cursor-pointer">
                                            {REGIONES_CHILE[datos.region].map(com => <option key={com} value={com}>{com}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex justify-end">
                                    <button type="button" onClick={buscarDireccionEnMapa} disabled={buscandoDireccion} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
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

                        {/* 3. FACTURACIÓN */}
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

                    {/* RESUMEN DERECHA */}
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

                            <button onClick={handleCrearOrden} disabled={procesando} className="w-full bg-atlas-900 text-white font-bold py-4 rounded-xl hover:bg-atlas-800 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                {procesando ? <Loader2 className="animate-spin" /> : 'Confirmar Datos y Pagar'}
                            </button>
                            {errorRut && <p className="text-center text-xs text-red-500 mt-2">RUT Inválido.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL NOTIFICACIONES */}
            {notification.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                        <div className={`p-4 flex justify-center ${notification.type === 'error' ? 'bg-red-50 text-red-500' :
                                notification.type === 'info' ? 'bg-blue-50 text-blue-500' :
                                    'bg-green-50 text-green-500'
                            }`}>
                            {notification.type === 'error' && <XCircle size={48} />}
                            {notification.type === 'info' && <AlertTriangle size={48} />}
                            {notification.type === 'success' && <CheckCircle size={48} />}
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{notification.title}</h3>
                            <p className="text-gray-500 mb-6 text-sm">{notification.message}</p>
                            <button onClick={() => setNotification({ ...notification, show: false })} className="w-full bg-atlas-900 text-white font-bold py-3 rounded-xl hover:bg-atlas-800">Entendido</button>
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
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full ${icon ? 'pl-9' : 'px-4'} py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 outline-none`} />
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        </div>
    </div>
);

export default Checkout;