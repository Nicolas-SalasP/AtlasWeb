import React from 'react';
import LegalLayout, { LegalSection, LegalList, LegalCallout } from '../../components/legal/LegalLayout';
import { AlertCircle, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const SLA = ({ embedded = false }) => {
    return (
        <LegalLayout
            embedded={embedded}
            eyebrow="SLA"
            title="Acuerdo de Nivel de Servicio (SLA) y Soporte Técnico"
            subtitle="Compromisos de disponibilidad, tiempos de respuesta de soporte y compensaciones aplicables a la suscripción del ERP Tenri."
            lastUpdated="24 de Marzo de 2026"
            activeSlug="sla"
        >
            <p>
                El presente Acuerdo de Nivel de Servicio (en adelante, el "SLA") es un anexo vinculante a los Términos y Condiciones de Uso del ERP Contable provisto por <strong>Tenri Spa</strong> (en adelante, el "Proveedor"). Este documento establece los compromisos de disponibilidad de la plataforma, los tiempos de respuesta de soporte técnico y las compensaciones aplicables ante eventuales interrupciones.
            </p>
            <p>
                Este SLA entrará en vigencia exclusivamente una vez que la cuenta del Licenciatario haya superado formalmente la fase de "Marcha Blanca" (Beta) y se encuentre bajo una suscripción comercial activa y al día en sus pagos.
            </p>

            <LegalSection title="Artículo 1: Compromiso de disponibilidad (Uptime) y medición" id="art-1">
                <LegalList type="none">
                    <li><strong>1.1. Nivel de servicio objetivo:</strong> Tenri Spa garantiza que la infraestructura central del ERP Contable y sus bases de datos estarán disponibles y operativas con un tiempo de actividad mensual garantizado del <strong>99.8%</strong> (en adelante, el "Uptime Garantizado"), calculado sobre una base de 24 horas al día, 7 días a la semana.</li>
                    <li><strong>1.2. Definición de indisponibilidad:</strong> Se entenderá por "Indisponibilidad Constatada" a la pérdida total de conectividad externa o una degradación severa y generalizada que impida el acceso efectivo y el uso de los módulos críticos del Software para la totalidad de los usuarios de una cuenta, excluyendo problemas de red local o de hardware del Licenciatario.</li>
                    <li><strong>1.3. Fuente única de medición:</strong> El cálculo del Uptime Mensual se basará única y exclusivamente en los registros de auditoría (logs) y las herramientas de monitoreo de disponibilidad interno configuradas por Tenri Spa. Estas métricas constituirán la fuente oficial e irrefutable para resolver cualquier controversia sobre el nivel de servicio.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Artículo 2: Matriz de severidad y tiempos de respuesta" id="art-2">
                <p>
                    El Proveedor categorizará los incidentes reportados por el Cliente según la siguiente matriz. <strong>Los tiempos de resolución aquí descritos son "objetivos razonables" bajo la modalidad de mejor esfuerzo (<em>best-effort</em>) y no constituyen una garantía contractual rígida que derive en incumplimiento</strong>, salvo lo dispuesto para los Créditos de Servicio por caída de Uptime.
                </p>
                <p>
                    El tiempo se contabiliza exclusivamente dentro del <strong>horario hábil comercial (Lunes a Viernes de 09:00 a 18:00 hrs, Hora Oficial de Chile Continental)</strong>, excluyendo días festivos nacionales.
                </p>

                <div className="space-y-3 mt-4">
                    <LegalCallout
                        color="red"
                        icon={<AlertCircle size={16} className="text-red-600" />}
                        title="Severidad 1 (Crítica) — Caída total del sistema"
                    >
                        <p>El ERP es inaccesible o existe una interrupción absoluta que impide el inicio de sesión o la facturación.</p>
                        <LegalList>
                            <li><strong>Canal principal:</strong> Ticket a soporte@tenri.cl.</li>
                            <li><strong>Canal secundario de emergencia:</strong> Contacto alternativo vía portal de estado corporativo (ej. status.tenri.cl) o formulario web de contingencia.</li>
                            <li><strong>Tiempo de respuesta objetivo:</strong> 2 horas hábiles.</li>
                            <li><strong>Tiempo de resolución objetivo:</strong> 6 horas hábiles.</li>
                        </LegalList>
                    </LegalCallout>

                    <LegalCallout
                        color="amber"
                        icon={<AlertTriangle size={16} className="text-amber-600" />}
                        title="Severidad 2 (Alta)"
                    >
                        <p>Un módulo central está inoperativo (ej. error 500 al intentar calcular el Formulario 29 o falla sistemática en la creación de asientos contables), pero el resto del ERP sigue funcionando.</p>
                        <LegalList>
                            <li><strong>Tiempo de respuesta objetivo:</strong> 4 horas hábiles.</li>
                            <li><strong>Tiempo de resolución objetivo:</strong> 12 a 24 horas hábiles.</li>
                        </LegalList>
                    </LegalCallout>

                    <LegalCallout
                        color="violet"
                        icon={<Clock size={16} className="text-violet-600" />}
                        title="Severidad 3 (Media)"
                    >
                        <p>Errores menores o "bugs" en funcionalidades no críticas, problemas de renderizado de interfaz o fallos en generación de reportes secundarios que cuentan con una solución temporal (<em>workaround</em>).</p>
                        <LegalList>
                            <li><strong>Tiempo de respuesta objetivo:</strong> 24 horas hábiles.</li>
                            <li><strong>Tiempo de resolución objetivo:</strong> Próximo parche de actualización programado.</li>
                        </LegalList>
                    </LegalCallout>

                    <LegalCallout
                        color="emerald"
                        icon={<CheckCircle size={16} className="text-emerald-600" />}
                        title="Severidad 4 (Baja)"
                    >
                        <p>Consultas generales de uso, dudas sobre configuración, solicitudes de nuevas funcionalidades (<em>Feature Requests</em>) o reportes de errores ortográficos.</p>
                        <LegalList>
                            <li><strong>Tiempo de respuesta objetivo:</strong> 48 horas hábiles.</li>
                            <li><strong>Tiempo de resolución objetivo:</strong> Evaluación por el equipo de producto para futuros <em>releases</em>.</li>
                        </LegalList>
                    </LegalCallout>
                </div>
            </LegalSection>

            <LegalSection title="Artículo 3: Ventanas de mantenimiento" id="art-3">
                <p>
                    El Proveedor requiere realizar labores de mantenimiento preventivo, optimización de bases de datos y despliegue de nuevo código (<em>deploys</em>) para garantizar la seguridad y velocidad del Software.
                </p>
                <LegalList type="none">
                    <li><strong>3.1. Mantenimiento programado:</strong> Se realizará preferentemente fuera del horario laboral estándar, en una ventana designada entre las <strong>01:00 AM y las 05:00 AM (Hora Oficial de Chile Continental)</strong>. Las interrupciones que ocurran dentro de este horario programado no se considerarán como "Indisponibilidad" para el cálculo del Uptime.</li>
                    <li><strong>3.2. Mantenimiento de emergencia:</strong> En caso de detectar vulnerabilidades críticas de seguridad (<em>Zero-Day exploits</em>), el Proveedor se reserva el derecho de aplicar parches de emergencia en cualquier momento.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Artículo 4: Compensaciones (Créditos de Servicio)" id="art-4">
                <p>
                    Si durante un mes calendario el Proveedor no cumple con el Uptime Garantizado del 99.8%, el Licenciatario tendrá derecho a reclamar una compensación en forma de Créditos de Servicio, los cuales se aplicarán como un descuento en la siguiente factura de suscripción. <strong>Bajo ninguna circunstancia se realizarán reembolsos en dinero en efectivo.</strong>
                </p>
                <LegalList>
                    <li><strong>Uptime entre 99.0% y 99.79%:</strong> Crédito equivalente al <strong>10%</strong> de la tarifa mensual.</li>
                    <li><strong>Uptime entre 95.0% y 98.99%:</strong> Crédito equivalente al <strong>20%</strong> de la tarifa mensual.</li>
                    <li><strong>Uptime inferior al 95.0%:</strong> Crédito equivalente al <strong>30%</strong> de la tarifa mensual.</li>
                </LegalList>
                <p className="text-xs text-gray-500 italic">
                    <strong>Condición de reclamo:</strong> Para recibir un Crédito de Servicio, el Cliente debe solicitarlo formalmente vía ticket dentro de los primeros quince (15) días corridos del mes siguiente al incidente, detallando las fechas y horas exactas de la indisponibilidad. El tope máximo de créditos acumulados en un solo mes no excederá el 30% del valor de la suscripción mensual.
                </p>
            </LegalSection>

            <LegalSection title="Artículo 5: Exclusiones del SLA (fuera de cobertura)" id="art-5">
                <p>
                    No se considerará "Indisponibilidad Constatada" ni generará derecho a Créditos de Servicio ninguna interrupción, lentitud o falla del Software que sea resultado de:
                </p>
                <LegalList type="alpha">
                    <li>Factores fuera del control razonable del Proveedor (Fuerza Mayor), incluyendo fallas catastróficas en el proveedor de nube (ej. caída regional de AWS, cPanel o Data Center), ataques DDoS masivos o cortes de fibra óptica troncal.</li>
                    <li>Caídas, latencia o modificaciones de API de integraciones y servicios estatales (ej. el sitio web del Servicio de Impuestos Internos - SII) o pasarelas bancarias.</li>
                    <li>Suspensiones de la cuenta por falta de pago o violaciones a la Política de Uso Aceptable (AUP).</li>
                    <li>Malas prácticas del usuario, como importación de archivos Excel corruptos, ejecución de scripts de terceros en el navegador, o uso de redes o conexiones a internet inestables por parte del Cliente.</li>
                </LegalList>
            </LegalSection>
        </LegalLayout>
    );
};

export default SLA;
