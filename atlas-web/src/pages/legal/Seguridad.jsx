import React from 'react';

const Seguridad = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 shadow-sm rounded-lg border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Política de Seguridad de la Información (ISP) y Modelo de Responsabilidad Compartida
        </h1>
        <p className="text-sm text-gray-500 mb-8 border-b pb-4">
          Fecha de última actualización: 24 de Marzo de 2026
        </p>
        
        <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mt-8">1. PROPÓSITO Y ALCANCE</h3>
          <p>
            El presente documento define los controles técnicos, operativos y administrativos implementados por Tenri Spa para salvaguardar la confidencialidad, integridad y disponibilidad (Tríada CIA) de los datos procesados en el ecosistema Tenri y el ERP Contable. Este documento está alineado con las mejores prácticas de la industria y sirve como garantía de seguridad para nuestros clientes comerciales (B2B).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">2. MODELO DE RESPONSABILIDAD COMPARTIDA</h3>
          <p>
            La seguridad en un entorno de Software as a Service (SaaS) es una responsabilidad conjunta. Tenri Spa garantiza la seguridad <strong>DEL</strong> sistema, mientras que el Cliente es responsable de la seguridad <strong>EN EL</strong> sistema.
          </p>
          
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">🛡️ Responsabilidad de Tenri Spa (El Proveedor):</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Seguridad de la Infraestructura:</strong> Hardening del servidor, mitigación de ataques de red (DDoS), y configuración de firewalls a nivel de centro de datos.</li>
                <li><strong>Seguridad de la Aplicación:</strong> Prevención de inyecciones SQL, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF) y mantenimiento del código fuente.</li>
                <li><strong>Criptografía y Autenticación:</strong> Cifrado de datos en tránsito, hashing de contraseñas y emisión segura de Tokens JWT.</li>
                <li><strong>Disponibilidad y Resiliencia:</strong> Ejecución de respaldos de bases de datos (RPO 24h) y planes de recuperación ante desastres (RTO 48h).</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">🏢 Responsabilidad del Cliente (El Licenciatario):</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Gestión de Credenciales:</strong> Proteger las contraseñas, no compartir cuentas de usuario y revocar el acceso a empleados desvinculados.</li>
                <li><strong>Matriz de Permisos Interna:</strong> Asignar correctamente los Roles (RBAC) dentro del ERP para asegurar el Principio de Mínimo Privilegio (ej. no otorgar permisos de administrador a un digitador).</li>
                <li><strong>Calidad de los Datos:</strong> Auditar y validar que los documentos tributarios, cartolas y cálculos ingresados al sistema sean correctos antes de declararlos ante el SII.</li>
                <li><strong>Seguridad de Terminales:</strong> Garantizar que los equipos físicos desde los cuales acceden al ERP estén libres de malware y utilicen redes seguras.</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8">3. GESTIÓN DE IDENTIDADES Y CONTROL DE ACCESOS (IAM)</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Autenticación Centralizada (SSO):</strong> El acceso al ERP está protegido por una arquitectura de Single Sign-On gestionada por Tenri. Las sesiones se validan mediante JSON Web Tokens (JWT) firmados criptográficamente, con tiempos de expiración definidos para mitigar el secuestro de sesiones.</li>
            <li><strong>Principio de Mínimo Privilegio (RBAC):</strong> El ERP cuenta con un Control de Acceso Basado en Roles. Cada usuario posee permisos estrictamente limitados a sus funciones operativas, aislando módulos críticos (como configuración de empresas o anulaciones) de perfiles estándar.</li>
            <li><strong>Gestión de Contraseñas:</strong> Ninguna contraseña se almacena en texto plano. Todas son sometidas a algoritmos de derivación de claves fuertemente salteadas (Bcrypt) antes de ser guardadas en la base de datos.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">4. CRIPTOGRAFÍA Y PROTECCIÓN DE DATOS</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Cifrado en Tránsito:</strong> El 100% de la comunicación entre los navegadores de los clientes y los servidores de Tenri fluye a través de túneles encriptados utilizando el protocolo HTTPS con cifrado TLS 1.2 o superior, impidiendo ataques de intermediario (Man-in-the-Middle).</li>
            <li><strong>Aislamiento de Entornos:</strong> Los datos de producción están lógicamente aislados de los entornos de desarrollo y pruebas (Staging). Ningún dato real de clientes es utilizado para pruebas de software.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">5. CICLO DE VIDA DE DESARROLLO SEGURO (SDLC) Y DEPLOYS</h3>
          <p>Tenri Spa no realiza modificaciones directas en los servidores de producción.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Integración y Despliegue Continuo (CI/CD):</strong> Todo cambio en el código fuente pasa por repositorios centralizados y versionados (GitHub). Los despliegues a producción se realizan mediante flujos automatizados (GitHub Actions), garantizando la inmutabilidad de la infraestructura.</li>
            <li><strong>Revisión de Código y Variables:</strong> Las credenciales de API, llaves criptográficas y datos de conexión a bases de datos nunca se exponen en el código fuente. Se gestionan exclusivamente mediante variables de entorno inyectadas de forma segura (.env).</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">6. GESTIÓN DE VULNERABILIDADES Y AUDITORÍA</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Registro de Auditoría (Logs):</strong> El ERP cuenta con módulos de trazabilidad (Módulo de Auditoría) que registran la hora, el usuario y la acción realizada sobre entidades críticas (como la anulación de facturas o modificaciones de asientos manuales).</li>
            <li><strong>Hardening del Servidor:</strong> El servidor de alojamiento (cPanel/VPS) está configurado para denegar el listado de directorios (Directory Indexing) y ocultar firmas de software para evitar el perfilamiento por parte de atacantes. Las carpetas de subida de archivos de clientes (ej. uploads/logos/) poseen directivas estrictas (.htaccess) que impiden la ejecución de scripts maliciosos.</li>
            <li><strong>Gestión de Parches:</strong> Las dependencias del ecosistema (paquetes de Node/React y Composer/PHP) son monitoreadas y actualizadas periódicamente para mitigar vulnerabilidades conocidas (CVEs).</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">7. GESTIÓN DE INCIDENTES DE SEGURIDAD (INCIDENT RESPONSE)</h3>
          <p>Tenri Spa mantiene un protocolo formal de respuesta ante incidentes de seguridad, con el objetivo de contener, analizar y mitigar cualquier evento que comprometa la confidencialidad, integridad o disponibilidad de la información.</p>
          <div className="space-y-2 mt-4">
            <p><strong>Clasificación de Incidentes:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Severidad Alta:</strong> Acceso no autorizado, filtración de datos, ejecución de código malicioso.</li>
              <li><strong>Severidad Media:</strong> Intentos de intrusión bloqueados, anomalías en logs.</li>
              <li><strong>Severidad Baja:</strong> Eventos informativos sin impacto operativo.</li>
            </ul>
            <p className="mt-4"><strong>Fases de Respuesta:</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Detección y registro del incidente.</li>
              <li>Contención inmediata del vector de ataque.</li>
              <li>Erradicación de la causa raíz.</li>
              <li>Recuperación del servicio.</li>
              <li>Análisis post-incidente (RCA).</li>
            </ol>
            <p className="mt-2 text-sm italic">
              <strong>Notificación:</strong> En caso de incidente que afecte datos del cliente, se aplicará lo dispuesto en el DPA, notificando dentro de un plazo máximo de 72 horas desde la confirmación técnica.
            </p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mt-8">8. SEGURIDAD EN SUB-ENCARGADOS Y PROVEEDORES</h3>
          <p>Tenri Spa utiliza proveedores externos para la operación del servicio (infraestructura, correo, pagos). Se aplican los siguientes controles:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Evaluación previa de proveedores basada en reputación y estándares de seguridad.</li>
            <li>Uso exclusivo de proveedores con cifrado, aislamiento y buenas prácticas de seguridad.</li>
            <li>Minimización de datos compartidos con terceros.</li>
            <li>Revisión periódica de dependencias críticas.</li>
          </ul>
          <p className="text-sm italic mt-2">El Cliente reconoce que ciertos componentes del servicio dependen de estos terceros, conforme a lo establecido en el SLA y DPA.</p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">9. CONTROLES DE DISPONIBILIDAD Y RESILIENCIA</h3>
          <p>Para garantizar la continuidad del servicio, Tenri implementa:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Arquitectura redundante a nivel lógico (backups + repositorios externos).</li>
            <li>Monitoreo continuo de servicios críticos.</li>
            <li>Alertas automáticas ante caídas o degradaciones.</li>
            <li>Integración con el Plan de Continuidad Operacional (BCP/DRP).</li>
          </ul>
          <p className="text-sm italic mt-2">Los objetivos de recuperación (RTO/RPO) se encuentran definidos contractualmente en el SLA y BCP/DRP.</p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">10. CAPACITACIÓN Y CONCIENTIZACIÓN INTERNA</h3>
          <p>Tenri Spa se compromete a que cualquier persona con acceso a sistemas productivos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Comprenda las políticas de seguridad aplicables.</li>
            <li>Mantenga confidencialidad sobre credenciales y accesos.</li>
            <li>Aplique buenas prácticas en el manejo de datos.</li>
          </ul>
          <p className="text-sm mt-2">El acceso a sistemas críticos está restringido exclusivamente a personal autorizado.</p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">11. REVISIÓN Y MEJORA CONTINUA</h3>
          <p>La presente Política de Seguridad será revisada periódicamente para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Adaptarse a nuevas amenazas tecnológicas.</li>
            <li>Incorporar mejoras en arquitectura.</li>
            <li>Cumplir con cambios regulatorios.</li>
          </ul>
          <p className="text-sm italic mt-2">Las actualizaciones relevantes serán comunicadas conforme a los Términos y Condiciones del servicio.</p>

        </div>
      </div>
    </div>
  );
};

export default Seguridad;