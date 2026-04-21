import React from 'react';

const SLA = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 shadow-sm rounded-lg border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          ACUERDO DE NIVEL DE SERVICIO (SLA) Y SOPORTE TÉCNICO
        </h1>
        <p className="text-sm text-gray-500 mb-8 border-b pb-4">
          FECHA DE ÚLTIMA ACTUALIZACIÓN: 24 de Marzo de 2026.
        </p>
        
        <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
          <p>
            El presente Acuerdo de Nivel de Servicio (en adelante, el "SLA") es un anexo vinculante a los Términos y Condiciones de Uso del ERP Contable provisto por <strong>Tenri Spa</strong> (en adelante, el "Proveedor"). Este documento establece los compromisos de disponibilidad de la plataforma, los tiempos de respuesta de soporte técnico y las compensaciones aplicables ante eventuales interrupciones.
          </p>
          <p>
            Este SLA entrará en vigencia exclusivamente una vez que la cuenta del Licenciatario haya superado formalmente la fase de "Marcha Blanca" (Beta) y se encuentre bajo una suscripción comercial activa y al día en sus pagos.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 1: COMPROMISO DE DISPONIBILIDAD (UPTIME) Y MEDICIÓN</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>1.1. Nivel de Servicio Objetivo:</strong> Tenri Spa garantiza que la infraestructura central del ERP Contable y sus bases de datos estarán disponibles y operativas con un tiempo de actividad mensual garantizado del <strong>99.8%</strong> (en adelante, el "Uptime Garantizado"), calculado sobre una base de 24 horas al día, 7 días a la semana.
            </li>
            <li>
              <strong>1.2. Definición de Indisponibilidad:</strong> Se entenderá por "Indisponibilidad Constatada" a la pérdida total de conectividad externa o una degradación severa y generalizada que impida el acceso efectivo y el uso de los módulos críticos del Software para la totalidad de los usuarios de una cuenta, excluyendo problemas de red local o de hardware del Licenciatario.
            </li>
            <li>
              <strong>1.3. Fuente Única de Medición:</strong> El cálculo del Uptime Mensual se basará única y exclusivamente en los registros de auditoría (logs) y las herramientas de monitoreo de disponibilidad interno configuradas por Tenri Spa. Estas métricas constituirán la fuente oficial e irrefutable para resolver cualquier controversia sobre el nivel de servicio.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 2: MATRIZ DE SEVERIDAD Y TIEMPOS DE RESPUESTA</h3>
          <p>
            El Proveedor categorizará los incidentes reportados por el Cliente según la siguiente matriz. <strong>Los tiempos de resolución aquí descritos son "objetivos razonables" bajo la modalidad de mejor esfuerzo (<em>best-effort</em>) y no constituyen una garantía contractual rígida que derive en incumplimiento</strong>, salvo lo dispuesto para los Créditos de Servicio por caída de Uptime.
          </p>
          <p>
            El tiempo se contabiliza exclusivamente dentro del <strong>Horario Hábil Comercial (Lunes a Viernes de 09:00 a 18:00 hrs, Hora Oficial de Chile Continental)</strong>, excluyendo días festivos nacionales.
          </p>

          <ul className="list-none pl-0 space-y-4">
            <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="font-bold text-gray-900 mb-1">🔴 Severidad 1 (Crítica): Caída total del sistema.</p>
              <p className="text-sm mb-2">El ERP es inaccesible o existe una interrupción absoluta que impide el inicio de sesión o la facturación.</p>
              <ul className="text-sm space-y-1 pl-5 list-disc">
                <li><strong>Canal Principal:</strong> Ticket a soporte@tenri.cl.</li>
                <li><strong>Canal Secundario de Emergencia:</strong> Contacto alternativo vía portal de estado corporativo (ej. status.tenri.cl) o formulario web de contingencia.</li>
                <li><strong>Tiempo de Respuesta Objetivo:</strong> 2 horas hábiles.</li>
                <li><strong>Tiempo de Resolución Objetivo:</strong> 6 horas hábiles.</li>
              </ul>
            </li>
            
            <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="font-bold text-gray-900 mb-1">🟠 Severidad 2 (Alta):</p>
              <p className="text-sm mb-2">Un módulo central está inoperativo (ej. error 500 al intentar calcular el Formulario 29 o falla sistemática en la creación de asientos contables), pero el resto del ERP sigue funcionando.</p>
              <ul className="text-sm space-y-1 pl-5 list-disc">
                <li><strong>Tiempo de Respuesta Objetivo:</strong> 4 horas hábiles.</li>
                <li><strong>Tiempo de Resolución Objetivo:</strong> 12 a 24 horas hábiles.</li>
              </ul>
            </li>

            <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="font-bold text-gray-900 mb-1">🟡 Severidad 3 (Media):</p>
              <p className="text-sm mb-2">Errores menores o "bugs" en funcionalidades no críticas, problemas de renderizado de interfaz o fallos en generación de reportes secundarios que cuentan con una solución temporal (<em>workaround</em>).</p>
              <ul className="text-sm space-y-1 pl-5 list-disc">
                <li><strong>Tiempo de Respuesta Objetivo:</strong> 24 horas hábiles.</li>
                <li><strong>Tiempo de Resolución Objetivo:</strong> Próximo parche de actualización programado.</li>
              </ul>
            </li>

            <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="font-bold text-gray-900 mb-1">🟢 Severidad 4 (Baja):</p>
              <p className="text-sm mb-2">Consultas generales de uso, dudas sobre configuración, solicitudes de nuevas funcionalidades (<em>Feature Requests</em>) o reportes de errores ortográficos.</p>
              <ul className="text-sm space-y-1 pl-5 list-disc">
                <li><strong>Tiempo de Respuesta Objetivo:</strong> 48 horas hábiles.</li>
                <li><strong>Tiempo de Resolución Objetivo:</strong> Evaluación por el equipo de producto para futuros <em>releases</em>.</li>
              </ul>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 3: VENTANAS DE MANTENIMIENTO</h3>
          <p>
            El Proveedor requiere realizar labores de mantenimiento preventivo, optimización de bases de datos y despliegue de nuevo código (<em>deploys</em>) para garantizar la seguridad y velocidad del Software.
          </p>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>3.1. Mantenimiento Programado:</strong> Se realizará preferentemente fuera del horario laboral estándar, en una ventana designada entre las <strong>01:00 AM y las 05:00 AM (Hora Oficial de Chile Continental)</strong>. Las interrupciones que ocurran dentro de este horario programado no se considerarán como "Indisponibilidad" para el cálculo del Uptime.
            </li>
            <li>
              <strong>3.2. Mantenimiento de Emergencia:</strong> En caso de detectar vulnerabilidades críticas de seguridad (<em>Zero-Day exploits</em>), el Proveedor se reserva el derecho de aplicar parches de emergencia en cualquier momento.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 4: COMPENSACIONES (CRÉDITOS DE SERVICIO)</h3>
          <p>
            Si durante un mes calendario el Proveedor no cumple con el Uptime Garantizado del 99.8%, el Licenciatario tendrá derecho a reclamar una compensación en forma de Créditos de Servicio, los cuales se aplicarán como un descuento en la siguiente factura de suscripción. <strong>Bajo ninguna circunstancia se realizarán reembolsos en dinero en efectivo.</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Uptime entre 99.0% y 99.79%:</strong> Crédito equivalente al <strong>10%</strong> de la tarifa mensual.</li>
            <li><strong>Uptime entre 95.0% y 98.99%:</strong> Crédito equivalente al <strong>20%</strong> de la tarifa mensual.</li>
            <li><strong>Uptime inferior al 95.0%:</strong> Crédito equivalente al <strong>30%</strong> de la tarifa mensual.</li>
          </ul>
          <p className="text-sm italic mt-4">
            <strong>Condición de Reclamo:</strong> Para recibir un Crédito de Servicio, el Cliente debe solicitarlo formalmente vía ticket dentro de los primeros quince (15) días corridos del mes siguiente al incidente, detallando las fechas y horas exactas de la indisponibilidad. El tope máximo de créditos acumulados en un solo mes no excederá el 30% del valor de la suscripción mensual.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 5: EXCLUSIONES DEL SLA (FUERA DE COBERTURA)</h3>
          <p>
            No se considerará "Indisponibilidad Constatada" ni generará derecho a Créditos de Servicio ninguna interrupción, lentitud o falla del Software que sea resultado de:
          </p>
          <ul className="list-[lower-alpha] pl-5 space-y-2">
            <li>Factores fuera del control razonable del Proveedor (Fuerza Mayor), incluyendo fallas catastróficas en el proveedor de nube (ej. caída regional de AWS, cPanel o Data Center), ataques DDoS masivos o cortes de fibra óptica troncal.</li>
            <li>Caídas, latencia o modificaciones de API de integraciones y servicios estatales (ej. el sitio web del Servicio de Impuestos Internos - SII) o pasarelas bancarias.</li>
            <li>Suspensiones de la cuenta por falta de pago o violaciones a la Política de Uso Aceptable (AUP).</li>
            <li>Malas prácticas del usuario, como importación de archivos Excel corruptos, ejecución de scripts de terceros en el navegador, o uso de redes o conexiones a internet inestables por parte del Cliente.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SLA;