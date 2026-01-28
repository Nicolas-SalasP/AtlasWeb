import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, AlertCircle, MapPin, Truck, Search, User, Mail, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- CONFIGURACIÓN DEL MAPA ---
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

// --- UTILIDADES ---
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

const TARIFAS_ENVIO = {
    "Metropolitana": 3990, "Valparaíso": 5990, "Biobío": 6990,
    "Antofagasta": 8990, "Magallanes": 12990, "Otra": 7990
};

const Checkout = () => {
    const { cartItems, cartTotal } = useCart();
    const [procesando, setProcesando] = useState(false);
    const [buscandoDireccion, setBuscandoDireccion] = useState(false);

    // ESTADO COMPLETO DEL FORMULARIO
    const [datos, setDatos] = useState({
        // Datos Personales
        nombre: '', apellido: '', email: '', telefono: '', rutPersonal: '',
        // Dirección
        direccion: '', numero: '', depto: '', region: 'Metropolitana', comuna: '',
        // Facturación
        tipoDocumento: 'boleta', rutEmpresa: '', razonSocial: '', giro: ''
    });

    const [errorRut, setErrorRut] = useState(false);
    const [costoEnvio, setCostoEnvio] = useState(TARIFAS_ENVIO["Metropolitana"]);
    const [mapCoords, setMapCoords] = useState({ lat: -33.4489, lng: -70.6693 }); // Stgo Centro por defecto

    // Totales
    const totalProductos = cartTotal;
    const totalConEnvio = totalProductos + costoEnvio;
    const neto = Math.round(totalConEnvio / 1.19);
    const iva = totalConEnvio - neto;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatos({ ...datos, [name]: value });

        if (name === "region") {
            setCostoEnvio(TARIFAS_ENVIO[value] || TARIFAS_ENVIO["Otra"]);
        }
    };

    // Handler Genérico para formatear cualquier RUT (Personal o Empresa)
    const handleRutChange = (e, fieldName) => {
        const rawValue = e.target.value.replace(/[^0-9kK]/g, '');
        const formatted = formatearRut(rawValue);
        setDatos({ ...datos, [fieldName]: formatted });

        // Validación visual simple (solo rojo si está mal y es largo)
        if (formatted.length > 8 && !validarRutChileno(formatted)) {
            setErrorRut(true);
        } else {
            setErrorRut(false);
        }
    };

    const buscarDireccionEnMapa = async () => {
        if (!datos.direccion || !datos.comuna) {
            alert("Ingresa Calle y Comuna para buscar.");
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
                alert("Dirección no encontrada exacta. Intenta ajustar la búsqueda.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setBuscandoDireccion(false);
        }
    };

    const handlePago = (e) => {
        e.preventDefault();

        // Validar el RUT que corresponda según el documento
        const rutAValidar = datos.tipoDocumento === 'factura' ? datos.rutEmpresa : datos.rutPersonal;

        if (!validarRutChileno(rutAValidar)) {
            alert(`El RUT ingresado (${datos.tipoDocumento}) no es válido.`);
            return;
        }

        setProcesando(true);

        // --- AQUÍ ARMAMOS EL PEDIDO PARA EL BACKEND ---
        const ordenFinal = {
            cliente: {
                nombre: datos.nombre,
                apellido: datos.apellido,
                email: datos.email,
                telefono: datos.telefono,
                rut: rutAValidar
            },
            envio: {
                direccion: `${datos.direccion} #${datos.numero} ${datos.depto ? 'Dpto ' + datos.depto : ''}`,
                comuna: datos.comuna,
                region: datos.region,
                coordenadas: mapCoords
            },
            facturacion: {
                tipo: datos.tipoDocumento,
                ...(datos.tipoDocumento === 'factura' && {
                    razonSocial: datos.razonSocial,
                    giro: datos.giro,
                    rutEmpresa: datos.rutEmpresa
                })
            },
            items: cartItems.map(item => ({
                id: item.id,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.quantity
            })),
            totales: {
                neto,
                iva,
                envio: costoEnvio,
                total: totalConEnvio
            }
        };

        console.log("📦 ORDEN LISTA PARA ENVIAR AL BACKEND:", ordenFinal);

        // Simulación
        setTimeout(() => {
            setProcesando(false);
            alert("¡Orden Creada! Revisa la consola (F12) para ver los datos JSON.");
        }, 2000);
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="bg-gray-50 min-h-screen pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8 flex items-center gap-2">
                    <Link to="/catalogo" className="text-gray-500 hover:text-atlas-900 flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Volver
                    </Link>
                    <span className="text-gray-300">|</span>
                    <h1 className="text-2xl font-bold text-atlas-900">Finalizar Compra</h1>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* COLUMNA IZQUIERDA */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. DATOS PERSONALES (NUEVO BLOQUE COMPLETO) */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-atlas-900 text-white flex items-center justify-center text-xs">1</span>
                                Datos Personales
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Nombre" name="nombre" value={datos.nombre} onChange={handleChange} icon={<User size={14} />} />
                                <Input label="Apellido" name="apellido" value={datos.apellido} onChange={handleChange} />
                                <Input label="Email" name="email" placeholder="contacto@gmail.com" type="email" value={datos.email} onChange={handleChange} icon={<Mail size={14} />} />
                                <Input label="Teléfono" name="telefono" placeholder="+56912345678" type="tel" value={datos.telefono} onChange={handleChange} icon={<Phone size={14} />} />

                                {/* RUT PERSONAL SIEMPRE VISIBLE PARA IDENTIFICACIÓN */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RUT Personal <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={datos.rutPersonal}
                                        onChange={(e) => handleRutChange(e, 'rutPersonal')}
                                        placeholder="12.345.678-9"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. DIRECCIÓN */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-atlas-900 text-white flex items-center justify-center text-xs">2</span>
                                Dirección de Envío
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="md:col-span-2">
                                    <Input label="Calle / Avenida" name="direccion" value={datos.direccion} onChange={handleChange} />
                                </div>
                                <Input label="Número" name="numero" value={datos.numero} onChange={handleChange} />
                                <Input label="Depto (Opcional)" name="depto" value={datos.depto} onChange={handleChange} required={false} />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                                    <select name="region" value={datos.region} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white">
                                        {Object.keys(TARIFAS_ENVIO).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                                    </select>
                                </div>
                                <Input label="Comuna" name="comuna" value={datos.comuna} onChange={handleChange} />

                                <div className="md:col-span-2 flex justify-end">
                                    <button type="button" onClick={buscarDireccionEnMapa} disabled={buscandoDireccion} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                                        {buscandoDireccion ? 'Buscando...' : <><Search size={16} /> Ubicar en Mapa</>}
                                    </button>
                                </div>
                            </div>

                            {/* MAPA */}
                            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 relative z-0">
                                <MapContainer center={[mapCoords.lat, mapCoords.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <RecenterAutomatically lat={mapCoords.lat} lng={mapCoords.lng} />
                                    <Marker position={[mapCoords.lat, mapCoords.lng]}>
                                        <Popup>{datos.direccion} {datos.numero}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </section>

                        {/* 3. DOCUMENTO TRIBUTARIO */}
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-atlas-900 text-white flex items-center justify-center text-xs">3</span>
                                Facturación
                            </h2>
                            <div className="flex gap-4 mb-6">
                                {/* Opciones Boleta/Factura */}
                                {['boleta', 'factura'].map(tipo => (
                                    <label key={tipo} className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${datos.tipoDocumento === tipo ? 'border-atlas-500 bg-blue-50 ring-1 ring-atlas-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="tipoDocumento" value={tipo} checked={datos.tipoDocumento === tipo} onChange={handleChange} className="accent-atlas-900 w-4 h-4" />
                                            <span className="font-bold text-gray-700 capitalize">{tipo}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* SI ES FACTURA, PEDIMOS DATOS EMPRESA */}
                            {datos.tipoDocumento === 'factura' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 border-l-4 border-atlas-300 pl-4 bg-gray-50 p-4 rounded-r-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">RUT Empresa <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={datos.rutEmpresa}
                                            onChange={(e) => handleRutChange(e, 'rutEmpresa')}
                                            placeholder="76.123.456-K"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 outline-none"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input label="Razón Social" name="razonSocial" value={datos.razonSocial} onChange={handleChange} />
                                        <Input label="Giro Comercial" name="giro" value={datos.giro} onChange={handleChange} />
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* COLUMNA DERECHA: RESUMEN */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-28">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <p className="font-bold text-gray-800 line-clamp-2">{item.nombre}</p>
                                            <p className="text-gray-500">x{item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-sm">
                                            ${(item.precio * item.quantity).toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2"><Truck size={14} /> Envío ({datos.region})</span>
                                    <span className="font-medium text-atlas-900">${costoEnvio.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Subtotal Neto</span>
                                    <span>${neto.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IVA (19%)</span>
                                    <span>${iva.toLocaleString('es-CL')}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-200 mt-4 pt-4 mb-6">
                                <span className="text-lg font-bold text-gray-900">Total Final</span>
                                <span className="text-2xl font-bold text-atlas-900">${totalConEnvio.toLocaleString('es-CL')}</span>
                            </div>

                            <button
                                onClick={handlePago}
                                disabled={procesando}
                                className="w-full bg-atlas-900 text-white font-bold py-4 rounded-xl hover:bg-atlas-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {procesando ? 'Procesando...' : <><CreditCard size={20} /> Pagar Ahora</>}
                            </button>

                            {errorRut && <p className="text-center text-xs text-red-500 mt-2">Revisa que el RUT ingresado sea válido.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente Input Helper
const Input = ({ label, name, type = "text", placeholder, value, onChange, required = true, icon = null }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                className={`w-full ${icon ? 'pl-9' : 'px-4'} py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 outline-none transition-all`}
            />
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        </div>
    </div>
);

export default Checkout;