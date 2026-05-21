import React from 'react';
import LegalLayout, { LegalSection, LegalList, LegalCallout } from '../../components/legal/LegalLayout';
import { ShieldCheck, Building2 } from 'lucide-react';

const Seguridad = ({ embedded = false }) => {
    return (
        <LegalLayout
            embedded={embedded}
            eyebrow="Seguridad"
            title="Política de Seguridad de la Información (ISP)"
            subtitle="Modelo de responsabilidad compartida y controles técnicos, operativos y administrativos implementados por Tenri Spa para salvaguardar la información."
            lastUpdated="24 de Marzo de 2026"
            activeSlug="seguridad"
        >
            <LegalSection title="1. Propósito y alcance" id="art-1">
                <p>
                    El presente documento define los controles técnicos, operativos y administrativos implementados por Tenri Spa para salvaguardar la confidencialidad, integridad y disponibilidad (Tríada CIA) de los datos procesados en el ecosistema Tenri y el ERP Contable. Este documento está alineado con las mejores prácticas de la industria y sirve como garantía de seguridad para nuestros clientes comerciales (B2B).
                </p>
            </LegalSection>

            <LegalSection title="2. Modelo de responsabilidad compartida" id="art-2">
                <p>
                    La seguridad en un entorno de Software as a Service (SaaS) es una responsabilidad conjunta. Tenri Spa garantiza la seguridad <strong>DEL</strong> sistema, mientras que el Cliente es responsable de la seguridad <strong>EN EL</strong> sistema.
                </p>

                <div className="grid md:grid-cols-2 gap-3 mt-4">
                    <LegalCallout
                        color="blue"
                        icon={<ShieldCheck size={16} className="text-blue-600" />}
                        title="Responsabilidad de Tenri Spa (el Proveedor)"
                    >
                        <LegalList>
                            <li><strong>Seguridad de la infraestructura:</strong> Hardening del servidor, mitigación de ataques de red (DDoS), y configuración de firewalls a nivel de centro de datos.</li>
                            <li><strong>Seguridad de la aplicación:</strong> Prevención de inyecciones SQL, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF) y mantenimiento del código fuente.</li>
                            <li><strong>Criptografía y autenticación:</strong> Cifrado de datos en tránsito, hashing de contraseñas y emisión segura de Tokens JWT.</li>
                            <li><strong>Disponibilidad y resiliencia:</strong> Ejecución de respaldos de bases de datos (RPO 24h) y planes de recuperación ante desastres (RTO 48h).</li>
                        </LegalList>
                    </LegalCallout>

                    <LegalCallout
                        color="emerald"
                        icon={<Building2 size={16} className="text-emerald-600" />}
                        title="Responsabilidad del Cliente (el Licenciatario)"
                    >
                        <LegalList>
                            <li><strong>Gestión de credenciales:</strong> Proteger las contraseñas, no compartir cuentas de usuario y revocar el acceso a empleados desvinculados.</li>
                            <li><strong>Matriz de permisos interna:</strong> Asignar correctamente los Roles (RBAC) dentro del ERP para asegurar el Principio de Mínimo Privilegio (ej. no otorgar permisos de administrador a un digitador).</li>
                            <li><strong>Calidad de los datos:</strong> Auditar y validar que los documentos tributarios, cartolas y cálculos ingresados al sistema sean correctos antes de declararlos ante el SII.</li>
                            <li><strong>Seguridad de terminales:</strong> Garantizar que los equipos físicos desde los cuales acceden al ERP estén libres de malware y utilicen redes seguras.</li>
                        </LegalList>
                    </LegalCallout>
                </div>
            </LegalSection>

            <LegalSection title="3. Gestión de identidades y control de accesos (IAM)" id="art-3">
                <LegalList>
                    <li><strong>Autenticación centralizada (SSO):</strong> El acceso al ERP está protegido por una arquitectura de Single Sign-On gestionada por Tenri. Las sesiones se validan mediante JSON Web Tokens (JWT) firmados criptográficamente, con tiempos de expiración definidos para mitigar el secuestro de sesiones.</li>
                    <li><strong>Principio de mínimo privilegio (RBAC):</strong> El ERP cuenta con un Control de Acceso Basado en Roles. Cada usuario posee permisos estrictamente limitados a sus funciones operativas, aislando módulos críticos (como configuración de empresas o anulaciones) de perfiles estándar.</li>
                    <li><strong>Gestión de contraseñas:</strong> Ninguna contraseña se almacena en texto plano. Todas son sometidas a algoritmos de derivación de claves fuertemente salteadas (Bcrypt) antes de ser guardadas en la base de datos.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="4. Criptografía y protección de datos" id="art-4">
                <LegalList>
                    <li><strong>Cifrado en tránsito:</strong> El 100% de la comunicación entre los navegadores de los clientes y los servidores de Tenri fluye a través de túneles encriptados utilizando el protocolo HTTPS con cifrado TLS 1.2 o superior, impidiendo ataques de intermediario (Man-in-the-Middle).</li>
                    <li><strong>Aislamiento de entornos:</strong> Los datos de producción están lógicamente aislados de los entornos de desarrollo y pruebas (Staging). Ningún dato real de clientes es utilizado para pruebas de software.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="5. Ciclo de vida de desarrollo seguro (SDLC) y deploys" id="art-5">
                <p>Tenri Spa no realiza modificaciones directas en los servidores de producción.</p>
                <LegalList>
                    <li><strong>Integración y despliegue continuo (CI/CD):</strong> Todo cambio en el código fuente pasa por repositorios centralizados y versionados (GitHub). Los despliegues a producción se realizan mediante flujos automatizados (GitHub Actions), garantizando la inmutabilidad de la infraestructura.</li>
                    <li><strong>Revisión de código y variables:</strong> Las credenciales de API, llaves criptográficas y datos de conexión a bases de datos nunca se exponen en el código fuente. Se gestionan exclusivamente mediante variables de entorno inyectadas de forma segura (.env).</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="6. Gestión de vulnerabilidades y auditoría" id="art-6">
                <LegalList>
                    <li><strong>Registro de auditoría (logs):</strong> El ERP cuenta con módulos de trazabilidad (Módulo de Auditoría) que registran la hora, el usuario y la acción realizada sobre entidades críticas (como la anulación de facturas o modificaciones de asientos manuales).</li>
                    <li><strong>Hardening del servidor:</strong> El servidor de alojamiento (cPanel/VPS) está configurado para denegar el listado de directorios (Directory Indexing) y ocultar firmas de software para evitar el perfilamiento por parte de atacantes. Las carpetas de subida de archivos de clientes (ej. uploads/logos/) poseen directivas estrictas (.htaccess) que impiden la ejecución de scripts maliciosos.</li>
                    <li><strong>Gestión de parches:</strong> Las dependencias del ecosistema (paquetes de Node/React y Composer/PHP) son monitoreadas y actualizadas periódicamente para mitigar vulnerabilidades conocidas (CVEs).</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="7. Gestión de incidentes de seguridad (Incident Response)" id="art-7">
                <p>
                    Tenri Spa mantiene un protocolo formal de respuesta ante incidentes de seguridad, con el objetivo de contener, analizar y mitigar cualquier evento que comprometa la confidencialidad, integridad o disponibilidad de la información.
                </p>
                <p><strong>Clasificación de incidentes:</strong></p>
                <LegalList>
                    <li><strong>Severidad alta:</strong> Acceso no autorizado, filtración de datos, ejecución de código malicioso.</li>
                    <li><strong>Severidad media:</strong> Intentos de intrusión bloqueados, anomalías en logs.</li>
                    <li><strong>Severidad baja:</strong> Eventos informativos sin impacto operativo.</li>
                </LegalList>
                <p><strong>Fases de respuesta:</strong></p>
                <ol className="list-decimal pl-5 space-y-1.5 text-sm md:text-[15px]">
                    <li>Detección y registro del incidente.</li>
                    <li>Contención inmediata del vector de ataque.</li>
                    <li>Erradicación de la causa raíz.</li>
                    <li>Recuperación del servicio.</li>
                    <li>Análisis post-incidente (RCA).</li>
                </ol>
                <p className="text-xs text-gray-500 italic">
                    <strong>Notificación:</strong> En caso de incidente que afecte datos del cliente, se aplicará lo dispuesto en el DPA, notificando dentro de un plazo máximo de 72 horas desde la confirmación técnica.
                </p>
            </LegalSection>

            <LegalSection title="8. Seguridad en sub-encargados y proveedores" id="art-8">
                <p>Tenri Spa utiliza proveedores externos para la operación del servicio (infraestructura, correo, pagos). Se aplican los siguientes controles:</p>
                <LegalList>
                    <li>Evaluación previa de proveedores basada en reputación y estándares de seguridad.</li>
                    <li>Uso exclusivo de proveedores con cifrado, aislamiento y buenas prácticas de seguridad.</li>
                    <li>Minimización de datos compartidos con terceros.</li>
                    <li>Revisión periódica de dependencias críticas.</li>
                </LegalList>
                <p className="text-xs text-gray-500 italic">El Cliente reconoce que ciertos componentes del servicio dependen de estos terceros, conforme a lo establecido en el SLA y DPA.</p>
            </LegalSection>

            <LegalSection title="9. Controles de disponibilidad y resiliencia" id="art-9">
                <p>Para garantizar la continuidad del servicio, Tenri implementa:</p>
                <LegalList>
                    <li>Arquitectura redundante a nivel lógico (backups + repositorios externos).</li>
                    <li>Monitoreo continuo de servicios críticos.</li>
                    <li>Alertas automáticas ante caídas o degradaciones.</li>
                    <li>Integración con el Plan de Continuidad Operacional (BCP/DRP).</li>
                </LegalList>
                <p className="text-xs text-gray-500 italic">Los objetivos de recuperación (RTO/RPO) se encuentran definidos contractualmente en el SLA y BCP/DRP.</p>
            </LegalSection>

            <LegalSection title="10. Capacitación y concientización interna" id="art-10">
                <p>Tenri Spa se compromete a que cualquier persona con acceso a sistemas productivos:</p>
                <LegalList>
                    <li>Comprenda las políticas de seguridad aplicables.</li>
                    <li>Mantenga confidencialidad sobre credenciales y accesos.</li>
                    <li>Aplique buenas prácticas en el manejo de datos.</li>
                </LegalList>
                <p className="text-sm">El acceso a sistemas críticos está restringido exclusivamente a personal autorizado.</p>
            </LegalSection>

            <LegalSection title="11. Revisión y mejora continua" id="art-11">
                <p>La presente Política de Seguridad será revisada periódicamente para:</p>
                <LegalList>
                    <li>Adaptarse a nuevas amenazas tecnológicas.</li>
                    <li>Incorporar mejoras en arquitectura.</li>
                    <li>Cumplir con cambios regulatorios.</li>
                </LegalList>
                <p className="text-xs text-gray-500 italic">Las actualizaciones relevantes serán comunicadas conforme a los Términos y Condiciones del servicio.</p>
            </LegalSection>
        </LegalLayout>
    );
};

export default Seguridad;
