import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { countryCodes, formatPhoneNumber } from '../utils/phoneCodes'; // Asegúrate de ajustar la ruta
import api from '../api/axiosConfig';

const Contacto = () => {
    const [searchParams] = useSearchParams();
    
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        countryCode: '+56',
        telefono: '',
        asunto: 'consulta',
        mensaje: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const servicioSolicitado = searchParams.get('servicio');
        if (servicioSolicitado) {
            setFormData(prev => ({ ...prev, asunto: servicioSolicitado }));
        }
    }, [searchParams]);

    // --- MANEJADORES CON SANITIZACIÓN ESTRICTA ---

    const handleNameChange = (e) => {
        const sanitized = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setFormData({ ...formData, nombre: sanitized.slice(0, 50) });
    };

    const handlePhoneChange = (e) => {
        const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
        const formatted = formatPhoneNumber(e.target.value, selectedCountry?.mask);
        setFormData({ ...formData, telefono: formatted });
    };

    const handleCountryCodeChange = (e) => {
        setFormData({ ...formData, countryCode: e.target.value, telefono: '' });
    };

    const handleTextChange = (e) => {
        const sanitized = e.target.value.replace(/[<>]/g, '');
        setFormData({ ...formData, [e.target.name]: sanitized.slice(0, 255) });
    };

    const handleEmailChange = (e) => {
        setFormData({ ...formData, email: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            ...formData,
            telefono: formData.telefono ? `${formData.countryCode} ${formData.telefono}` : ''
        };

        try {
            await api.post('/contacto', payload);
            
            setIsSuccess(true);
            setFormData({ nombre: '', email: '', countryCode: '+56', telefono: '', asunto: 'consulta', mensaje: '' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Hubo un error al enviar el mensaje. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- VISTA DE ÉXITO (MENSAJE ENVIADO) ---
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-spa-gray pt-28 pb-20 px-4 flex items-center justify-center">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl text-center max-w-2xl w-full border border-gray-100 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 size={50} className="text-green-500" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-tenri-900 mb-6">¡Mensaje Enviado!</h2>
                    <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                        Hemos recibido tu solicitud correctamente. <strong className="text-tenri-800">Pronto nos contactaremos contigo</strong> al correo electrónico o número de teléfono que nos proporcionaste para dar seguimiento a tu caso.
                    </p>
                    <button 
                        onClick={() => setIsSuccess(false)}
                        className="bg-tenri-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-tenri-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Enviar otro mensaje
                    </button>
                </div>
            </div>
        );
    }

    // --- VISTA DEL FORMULARIO ---
    return (
        <div className="min-h-screen bg-spa-gray pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-tenri-300/20 text-tenri-800 rounded-full text-sm font-bold mb-4">
                        <MessageSquare size={16} /> Hablemos
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-tenri-900 mb-4">Ponte en Contacto</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        ¿Tienes un proyecto en mente o necesitas soporte técnico? Llena el formulario y nuestro equipo te responderá a la brevedad.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
                    
                    {/* Panel Lateral */}
                    <div className="bg-tenri-900 text-white p-8 md:p-12 lg:w-2/5 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-tenri-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-20 -translate-y-20"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-8 text-white">Información de<br/>Contacto</h3>
                            <div className="space-y-8">
                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-tenri-300/20 transition-colors">
                                        <MapPin className="text-tenri-300" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white mb-1">Ubicación</p>
                                        <p className="text-gray-300 text-sm leading-relaxed">Providencia, Región Metropolitana<br/>Santiago, Chile</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-tenri-300/20 transition-colors">
                                        <Phone className="text-tenri-300" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white mb-1">Llámanos</p>
                                        <p className="text-gray-300 text-sm">+56 9 3709 4271</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-tenri-300/20 transition-colors">
                                        <Mail className="text-tenri-300" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white mb-1">Correo Electrónico</p>
                                        <p className="text-gray-300 text-sm">contacto@tenri.cl</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                            <p className="text-tenri-300 font-bold mb-2">Horario de atención</p>
                            <p className="text-gray-300 text-sm leading-relaxed">Lunes a Viernes<br/>09:00 a 18:00 hrs</p>
                        </div>
                    </div>

                    {/* Área del Formulario */}
                    <div className="p-8 md:p-12 lg:w-3/5 bg-white relative">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Completo <span className="text-red-500">*</span></label>
                                    <input 
                                        required
                                        type="text" 
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleNameChange}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none transition-all"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico <span className="text-red-500">*</span></label>
                                    <input 
                                        required
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleEmailChange}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none transition-all"
                                        placeholder="juan@empresa.com"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono <span className="text-gray-400 font-normal">(Opcional)</span></label>
                                    <div className="flex">
                                        <select 
                                            value={formData.countryCode}
                                            onChange={handleCountryCodeChange}
                                            className="w-28 px-2 py-3 bg-gray-50 border border-gray-200 border-r-0 rounded-l-xl focus:bg-white outline-none cursor-pointer text-sm font-medium"
                                        >
                                            {countryCodes.map(c => (
                                                <option key={c.code} value={c.code}>{c.country} ({c.code})</option>
                                            ))}
                                        </select>
                                        <input 
                                            type="tel" 
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handlePhoneChange}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-r-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none transition-all"
                                            placeholder="9 0000 0000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Motivo de Contacto <span className="text-red-500">*</span></label>
                                    <select 
                                        name="asunto"
                                        value={formData.asunto}
                                        onChange={handleTextChange}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="consulta">Consulta General</option>
                                        <option value="desarrollo">Desarrollo Web / Software</option>
                                        <option value="redes">Redes & Infraestructura</option>
                                        <option value="seguridad">Seguridad y CCTV</option>
                                        <option value="soporte">Soporte Técnico</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Detalles del Proyecto <span className="text-red-500">*</span></label>
                                    <span className={`text-xs font-bold ${formData.mensaje.length >= 255 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {formData.mensaje.length} / 255
                                    </span>
                                </div>
                                <textarea 
                                    required
                                    name="mensaje"
                                    value={formData.mensaje}
                                    onChange={handleTextChange}
                                    rows="5"
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none transition-all resize-none"
                                    placeholder="Cuéntanos un poco sobre lo que necesitas (Máx 255 caracteres)..."
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || formData.mensaje.length > 255}
                                    className="w-full sm:w-auto px-8 bg-tenri-800 text-white font-bold py-4 rounded-xl hover:bg-tenri-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? 'Enviando...' : (
                                        <>
                                            Enviar Mensaje <Send size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-6 pt-6 border-t border-gray-100">
                                Al hacer clic en enviar, confirmas que aceptas nuestra Política de Privacidad. Tus datos serán utilizados exclusivamente para contactarte en relación a esta solicitud.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacto;