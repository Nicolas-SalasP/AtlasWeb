import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Sparkles, ChevronRight, Mail, ShieldCheck, Scale, Activity, Lock } from 'lucide-react';

const RELATED_DOCS = [
    { path: '/terminos-y-condiciones', label: 'Términos y Condiciones', icon: Scale,       slug: 'terminos' },
    { path: '/politica-privacidad',    label: 'Política de Privacidad',  icon: Lock,        slug: 'privacidad' },
    { path: '/acuerdo-nivel-servicio', label: 'Acuerdo SLA',             icon: Activity,    slug: 'sla' },
    { path: '/seguridad-informacion',  label: 'Política de Seguridad',   icon: ShieldCheck, slug: 'seguridad' },
];

const LegalLayout = ({
    embedded = false,
    eyebrow,
    title,
    subtitle,
    lastUpdated,
    activeSlug,
    children,
}) => {
    const content = (
        <div className={embedded ? '' : 'bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'}>
            {!embedded && (
                <div className="relative bg-gradient-to-br from-tenri-900 via-tenri-800 to-tenri-900 text-white px-6 md:px-10 py-10 md:py-12 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-tenri-500 rounded-full mix-blend-screen filter blur-[100px] opacity-15 transform translate-x-20 -translate-y-20 pointer-events-none"></div>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}></div>

                    <div className="relative z-10">
                        {eyebrow && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 backdrop-blur-sm border border-tenri-500/30 text-tenri-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <Sparkles size={10} /> {eyebrow}
                            </span>
                        )}
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-3 max-w-3xl">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl">
                                {subtitle}
                            </p>
                        )}
                        {lastUpdated && (
                            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-xs text-gray-200">
                                <Calendar size={12} className="text-tenri-300" />
                                <span>
                                    <span className="font-bold">Actualizado:</span> {lastUpdated}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={embedded ? 'px-1 md:px-2 py-4' : 'px-6 md:px-10 py-8 md:py-10'}>
                <div className="legal-prose max-w-none text-gray-700 space-y-5 leading-relaxed">
                    {children}
                </div>

                {!embedded && (
                    <>
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                <FileText size={11} /> Documentos relacionados
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {RELATED_DOCS.filter(d => d.slug !== activeSlug).map(doc => (
                                    <Link
                                        key={doc.slug}
                                        to={doc.path}
                                        className="group flex items-center gap-3 p-3 bg-gray-50 hover:bg-tenri-50 border border-gray-100 hover:border-tenri-200 rounded-xl transition-colors"
                                    >
                                        <div className="w-9 h-9 bg-white border border-gray-200 group-hover:border-tenri-300 rounded-lg flex items-center justify-center shrink-0 text-gray-500 group-hover:text-tenri-700 transition-colors">
                                            <doc.icon size={15} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-tenri-900 flex-1">
                                            {doc.label}
                                        </span>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-tenri-600 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 p-5 bg-gradient-to-br from-tenri-50 to-white border border-tenri-100 rounded-2xl flex items-start gap-3">
                            <div className="w-10 h-10 bg-white border border-tenri-200 rounded-xl flex items-center justify-center shrink-0">
                                <Mail size={16} className="text-tenri-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-tenri-900 text-sm">¿Tienes dudas sobre este documento?</p>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                    Escribenos a <a href="mailto:legal@tenri.cl" className="font-bold text-tenri-700 hover:text-tenri-900 underline">legal@tenri.cl</a> o desde el <Link to="/contacto" className="font-bold text-tenri-700 hover:text-tenri-900 underline">formulario de contacto</Link>.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-5 flex items-center gap-2 text-sm">
                    <Link to="/" className="text-gray-500 hover:text-tenri-900 transition-colors flex items-center gap-1 font-medium">
                        <ArrowLeft size={14} /> Volver al inicio
                    </Link>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">Legal</span>
                </div>

                {content}
            </div>
        </div>
    );
};

export const LegalSection = ({ title, children, id }) => (
    <section id={id} className="scroll-mt-24">
        <h2 className="text-lg md:text-xl font-extrabold text-tenri-900 mt-8 mb-3 tracking-tight">
            {title}
        </h2>
        <div className="space-y-3 text-sm md:text-[15px]">
            {children}
        </div>
    </section>
);

export const LegalCallout = ({ icon, title, children, color = 'gray' }) => {
    const colors = {
        gray:    'bg-gray-50 border-gray-200',
        blue:    'bg-blue-50 border-blue-100',
        emerald: 'bg-emerald-50 border-emerald-100',
        amber:   'bg-amber-50 border-amber-100',
        red:     'bg-red-50 border-red-100',
        violet:  'bg-violet-50 border-violet-100',
    };

    return (
        <div className={`p-4 md:p-5 border rounded-xl ${colors[color] || colors.gray}`}>
            {title && (
                <h4 className="font-black text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    {icon} {title}
                </h4>
            )}
            <div className="text-sm space-y-1.5 text-gray-700">
                {children}
            </div>
        </div>
    );
};

export const LegalList = ({ children, type = 'disc' }) => {
    const styles = {
        disc:  'list-disc pl-5',
        alpha: 'list-[lower-alpha] pl-5',
        roman: 'list-[lower-roman] pl-5',
        none:  'list-none pl-0',
    };
    return <ul className={`${styles[type] || styles.disc} space-y-1.5 text-sm md:text-[15px]`}>{children}</ul>;
};

export default LegalLayout;
