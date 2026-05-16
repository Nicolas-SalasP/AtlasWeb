import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { countryCodes, formatPhoneNumber } from '../utils/phoneCodes';
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
            const msg = error.response?.data?.message || 'Hubo un error al enviar el mensaje. Intenta de nuevo.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 flex items-center justify-center">
                <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl text-center max-w-2xl w-full border border-gray-100 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
                        <CheckCircle2 size={50} className="text-emerald-500" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-tenri-900 mb-5 tracking-tight">¡Mensaje enviado!</h2>
                    <p className="text-gray-600 mb-10 text-base md:text-lg leading-relaxed">
                        Recibimos tu solicitud. Te contactaremos a la brevedad al correo o teléfono que nos proporcionaste para dar seguimiento a tu caso.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="bg-tenri-900 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-tenri-800 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            Enviar otro mensaje
                        </button>
                        <Link
                            to="/"
                            className="bg-white border border-gray-200 hover:border-tenri-300 text-gray-700 hover:text-tenri-900 font-bold py-3.5 px-7 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-tenri-50 text-tenri-700 rounded-full text-xs font-black uppercase tracking-widest border border-tenri-100 mb-5">
                        <MessageSquare size={12} /> Hablemos
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Ponte en contacto
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        ¿Tienes un proyecto en mente o necesitas soporte técnico? Llena el formulario y nuestro equipo te responderá a la brevedad.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row">

                    <div className="bg-gradient-to-br from-tenri-900 via-tenri-800 to-tenri-900 text-white p-8 md:p-10 lg:w-2/5 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-tenri-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 transform translate-x-20 -translate-y-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                        }}></div>

                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-tenri-500/30 text-tenri-300 text-[10px] font-black uppercase tracking-widest mb-4">
                                <Sparkles size={10} /> Tenri
                            </span>
                            <h3 className="text-2xl md:text-3xl font-extrabold mb-8 text-white tracking-tight leading-tight">
                                Información de<br/>contacto
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 group">
                                    <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-tenri-300/20 transition-colors">
                                        <MapPin size={18} className="text-tenri-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-tenri-300 mb-1">Ubicación</p>
                                        <p className="text-gray-200 text-sm leading-relaxed">Providencia, Región Metropolitana<br/>Santiago, Chile</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-tenri-300/20 transition-colors">
                                        <Phone size={18} className="text-tenri-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-tenri-300 mb-1">Teléfono</p>
                                        <p className="text-gray-200 text-sm">+56 9 3709 4271</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-tenri-300/20 transition-colors">
                                        <Mail size={18} className="text-tenri-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-tenri-300 mb-1">Correo</p>
                                        <p className="text-gray-200 text-sm">contacto@tenri.cl</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex items-start gap-3">
                            <Clock size={16} className="text-tenri-300 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-tenri-300 font-bold text-xs uppercase tracking-widest mb-1">Horario de atención</p>
                                <p className="text-gray-200 text-sm leading-relaxed">Lunes a Viernes · 09:00 a 18:00 hrs</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 lg:w-3/5 bg-white relative">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Nombre completo <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleNameChange}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-tenri-300 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Correo electrónico <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleEmailChange}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-tenri-300 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="juan@empresa.com"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Teléfono <span className="text-gray-400 normal-case font-normal">(opcional)</span></label>
                                    <div className="flex">
                                        <select
                                            value={formData.countryCode}
                                            onChange={handleCountryCodeChange}
                                            className="w-28 px-2 py-3 bg-gray-50 border border-gray-100 border-r-0 rounded-l-xl focus:bg-white outline-none cursor-pointer text-xs font-bold"
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
                                            className="w-full px-4 py-3 bg-gray-50 rounded-r-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-tenri-300 focus:border-transparent outline-none transition-all text-sm"
                                            placeholder="9 0000 0000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Motivo de contacto <span className="text-red-500">*</span></label>
                                    <select
                                        name="asunto"
                                        value={formData.asunto}
                                        onChange={handleTextChange}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-tenri-300 focus:border-transparent outline-none transition-all cursor-pointer text-sm"
                                    >
                                        <option value="consulta">Consulta general</option>
                                        <option value="desarrollo">Desarrollo web / Software</option>
                                        <option value="redes">Redes & Infraestructura</option>
                                        <option value="seguridad">Seguridad y CCTV</option>
                                        <option value="soporte">Soporte técnico</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500">Detalles del proyecto <span className="text-red-500">*</span></label>
                                    <span className={`text-[10px] font-bold ${formData.mensaje.length >= 255 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {formData.mensaje.length} / 255
                                    </span>
                                </div>
                                <textarea
                                    required
                                    name="mensaje"
                                    value={formData.mensaje}
                                    onChange={handleTextChange}
                                    rows="5"
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-tenri-300 focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
                                    placeholder="Cuéntanos un poco sobre lo que necesitas..."
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || formData.mensaje.length > 255}
                                    className="w-full sm:w-auto px-8 bg-tenri-900 text-white font-bold py-4 rounded-xl hover:bg-tenri-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? 'Enviando...' : (
                                        <>
                                            Enviar mensaje
                                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100 leading-relaxed">
                                Al enviar este formulario aceptás nuestra <Link to="/politica-privacidad" className="text-tenri-600 hover:text-tenri-900 underline">política de privacidad</Link>. Tus datos serán utilizados exclusivamente para contactarte en relación a esta solicitud.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacto;
