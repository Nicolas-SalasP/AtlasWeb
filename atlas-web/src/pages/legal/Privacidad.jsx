import React from 'react';

const Privacidad = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 shadow-sm rounded-lg border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Política de Privacidad y Acuerdo de Procesamiento de Datos (DPA)
        </h1>
        <p className="text-sm text-gray-500 mb-8 border-b pb-4">
          Fecha de última actualización: 24 de Marzo de 2026
        </p>
        
        <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
          <p>
            El presente documento (en adelante, la "Política" o el "DPA") regula el tratamiento, recolección, almacenamiento y protección de los datos personales y comerciales gestionados a través del ecosistema de software provisto por <strong>Tenri Spa</strong> (en adelante, "Tenri", el "Proveedor" o el "Encargado").
          </p>
          <p>
            Este documento es vinculante, forma parte integral de los Términos y Condiciones de Uso, y se somete íntegramente a las disposiciones de la Ley N° 19.628 sobre Protección de la Vida Privada de la República de Chile y estándares internacionales de buenas prácticas (marco GDPR-aligned).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 1: DEFINICIÓN DE ROLES LEGALES</h3>
          <p>
            Para efectos de responsabilidad legal respecto al tratamiento de datos, las partes reconocen la siguiente distinción fundamental:
          </p>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>1.1. Tenri como "Responsable del Tratamiento":</strong> Tenri actúa como Responsable única y exclusivamente respecto a los datos de registro, facturación y contacto del administrador de la cuenta (ej. nombre, RUT de la empresa, correo de acceso a Tenri).
            </li>
            <li>
              <strong>1.2. Tenri como "Encargado del Tratamiento" (Procesador):</strong> Respecto a toda la información ingresada al ERP Contable (ej. nóminas de empleados, facturas de proveedores, RUT de clientes de la empresa, cartolas bancarias, remuneraciones), el Licenciatario (Cliente) es el exclusivo "Responsable del Tratamiento". Tenri actúa meramente como "Encargado", limitándose a proveer la infraestructura técnica para almacenar y procesar dichos datos según las instrucciones automatizadas del Cliente.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 2: CATEGORÍAS DE DATOS RECOPILADOS</h3>
          <p>El Proveedor recopila y procesa las siguientes categorías de datos:</p>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>2.1. Datos de Autenticación y Cuenta:</strong> Correos electrónicos, contraseñas encriptadas (hashing), tokens de sesión (JWT) y direcciones IP recopiladas durante el proceso de Single Sign-On (SSO) entre la plataforma matriz y el ERP.
            </li>
            <li>
              <strong>2.2. Datos Transaccionales y Financieros:</strong> Información comercial y tributaria digitada por el usuario o importada vía integraciones (ej. cartolas bancarias, archivos XML del SII, catálogos de productos y centros de costo).
            </li>
            <li>
              <strong>2.3. Datos de Telemetría:</strong> Registros de auditoría (logs), timestamp de inicio de sesión y acciones ejecutadas dentro del sistema, con fines estrictos de seguridad y depuración de errores.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 3: FINALIDAD Y BASE LEGAL DEL TRATAMIENTO</h3>
          <p><strong>3.1. Finalidades Exclusivas:</strong> Los datos recopilados serán procesados de forma lícita, leal y transparente, con el único fin de:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Provisión del Servicio:</strong> Permitir la autenticación y ejecución de los algoritmos de cálculo del ERP.</li>
            <li><strong>Soporte Técnico:</strong> Facilitar la asistencia técnica solicitada por el Cliente.</li>
            <li><strong>Seguridad Integral:</strong> Detectar, mitigar y prevenir fraudes o accesos no autorizados.</li>
            <li><strong>Cumplimiento Legal:</strong> Emitir la facturación electrónica correspondiente al pago de la suscripción.</li>
          </ul>
          <p>
            <strong>3.2. Base Jurídica del Tratamiento:</strong> El tratamiento de los datos se fundamenta legalmente en: (i) la ejecución del contrato de prestación de servicios SaaS suscrito entre las partes; (ii) el cumplimiento de obligaciones legales y tributarias de Tenri; y (iii) el interés legítimo del Proveedor en garantizar la seguridad de la infraestructura y prevenir el fraude.
          </p>
          <p>
            <strong>3.3. Prohibición de Comercialización:</strong> Tenri declara expresamente que NO vende, arrienda, cede ni comercializa bases de datos, correos electrónicos ni información financiera a terceros o corredores de datos (Data Brokers).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 4: ESTÁNDARES DE SEGURIDAD Y CRIPTOGRAFÍA</h3>
          <p>Tenri implementa medidas de seguridad técnicas y organizativas de nivel empresarial:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Cifrado en Tránsito:</strong> Toda la comunicación se transmite bajo protocolos criptográficos (HTTPS/TLS).</li>
            <li><strong>Cifrado en Reposo (Credenciales):</strong> Contraseñas sometidas a algoritmos de derivación de claves (Bcrypt).</li>
            <li><strong>Protección de API:</strong> Endpoints protegidos mediante validación JWT y mitigación CSRF/XSS.</li>
          </ul>
          <p className="text-sm italic">
            A pesar de estas medidas, el Cliente asume que el riesgo residual en entornos web interconectados no es reducible a cero.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 5: SUB-ENCARGADOS Y TRANSFERENCIA INTERNACIONAL</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>5.1. Uso de Sub-encargados:</strong> Para garantizar la operatividad del Software, Tenri utiliza infraestructura de terceros (ej. proveedores de alojamiento web como cPanel/AWS, pasarelas de pago y servicios SMTP). Tenri se compromete a exigir a todo Sub-encargado la mantención de estándares de seguridad y confidencialidad equivalentes o superiores a los establecidos en este DPA.
            </li>
            <li>
              <strong>5.2. Transferencia Internacional de Datos:</strong> El Licenciatario reconoce y autoriza expresamente que los datos procesados por el ERP pueden ser alojados, respaldados o enrutados a través de servidores ubicados fuera del territorio chileno (transferencia internacional). Tenri garantiza que dichos proveedores de infraestructura en el extranjero cumplen con niveles adecuados de protección de datos acorde a los estándares de la industria.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 6: RETENCIÓN Y DESTRUCCIÓN DE DATOS</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>6.1. Vigencia:</strong> Los datos de operación del ERP serán conservados mientras la suscripción del Cliente se mantenga activa.
            </li>
            <li>
              <strong>6.2. Protocolo de Eliminación Post-Término:</strong> Tras la terminación del servicio, el Cliente dispondrá de treinta (30) días corridos para la exportación de su información. Al transcurrir el día treinta y uno (31), Tenri ejecutará un borrado físico e irreversible (Hard Delete) de las tablas relacionales asociadas al Cliente, sin retener copias ocultas.
            </li>
            <li>
              <strong>6.3. Retención Legal:</strong> Tenri conservará únicamente los datos de facturación e historiales de acceso del administrador de la cuenta por el periodo exigido por la legislación aplicable, exclusivamente para defensa jurídica o cumplimiento normativo.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 7: EJERCICIO DE DERECHOS ARCO</h3>
          <p>
            En conformidad con la Ley N° 19.628, el ejercicio de los derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) se regirá por el siguiente protocolo según el rol de los datos:
          </p>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>7.1. Sobre los Datos de Cuenta (Tenri como Responsable):</strong> El Cliente administrador podrá ejercer sus derechos ARCO sobre sus datos de facturación o registro enviando una solicitud formal al correo oficial de privacidad: <code>legal@tenri.cl</code>. Tenri responderá dentro de los plazos legales establecidos.
            </li>
            <li>
              <strong>7.2. Sobre los Datos del ERP (Tenri como Encargado):</strong> Si un tercero (ej. un empleado, proveedor o cliente del Licenciatario) desea ejercer derechos ARCO sobre información alojada dentro del ERP Contable, <strong>deberá dirigir su solicitud directa y exclusivamente al Licenciatario (Responsable del Tratamiento)</strong>. Si Tenri recibe una solicitud de este tipo de forma directa, se limitará a notificar al Cliente para que este gestione la respuesta. Tenri colaborará técnicamente, en la medida de lo razonable, para que el Cliente pueda cumplir con sus obligaciones legales de rectificación o borrado desde su panel de control.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 8: BRECHAS DE SEGURIDAD (DATA BREACHES)</h3>
          <p>
            En el evento de una vulneración a las barreras de seguridad que comprometa la confidencialidad de los datos del ERP, Tenri notificará al administrador de la cuenta afectada en un plazo no superior a 72 horas desde la confirmación técnica del incidente, detallando la naturaleza de la brecha, los datos posiblemente comprometidos y las medidas de mitigación adoptadas.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 9: MODIFICACIONES AL DPA</h3>
          <p>
            Tenri se reserva el derecho de actualizar este DPA en respuesta a cambios en la legislación o la implementación de nuevas tecnologías. Las modificaciones sustanciales serán notificadas por correo electrónico con anticipación a su entrada en vigencia.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacidad;