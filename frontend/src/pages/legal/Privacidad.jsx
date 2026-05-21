import React from 'react';
import LegalLayout, { LegalSection, LegalList } from '../../components/legal/LegalLayout';

const Privacidad = ({ embedded = false }) => {
    return (
        <LegalLayout
            embedded={embedded}
            eyebrow="Privacidad"
            title="Política de Privacidad y Acuerdo de Procesamiento de Datos (DPA)"
            subtitle="Cómo Tenri Spa trata, almacena y protege los datos personales y comerciales gestionados a través de su ecosistema de software."
            lastUpdated="24 de Marzo de 2026"
            activeSlug="privacidad"
        >
            <p>
                El presente documento (en adelante, la "Política" o el "DPA") regula el tratamiento, recolección, almacenamiento y protección de los datos personales y comerciales gestionados a través del ecosistema de software provisto por <strong>Tenri Spa</strong> (en adelante, "Tenri", el "Proveedor" o el "Encargado").
            </p>
            <p>
                Este documento es vinculante, forma parte integral de los Términos y Condiciones de Uso, y se somete íntegramente a las disposiciones de la Ley N° 19.628 sobre Protección de la Vida Privada de la República de Chile y estándares internacionales de buenas prácticas (marco GDPR-aligned).
            </p>

            <LegalSection title="Artículo 1: Definición de roles legales" id="art-1">
                <p>
                    Para efectos de responsabilidad legal respecto al tratamiento de datos, las partes reconocen la siguiente distinción fundamental:
                </p>
                <LegalList type="none">
                    <li><strong>1.1. Tenri como "Responsable del Tratamiento":</strong> Tenri actúa como Responsable única y exclusivamente respecto a los datos de registro, facturación y contacto del administrador de la cuenta (ej. nombre, RUT de la empresa, correo de acceso a Tenri).</li>
                    <li><strong>1.2. Tenri como "Encargado del Tratamiento" (Procesador):</strong> Respecto a toda la información ingresada al ERP Contable (ej. nóminas de empleados, facturas de proveedores, RUT de clientes de la empresa, cartolas bancarias, remuneraciones), el Licenciatario (Cliente) es el exclusivo "Responsable del Tratamiento". Tenri actúa meramente como "Encargado", limitándose a proveer la infraestructura técnica para almacenar y procesar dichos datos según las instrucciones automatizadas del Cliente.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Artículo 2: Categorías de datos recopilados" id="art-2">
                <p>El Proveedor recopila y procesa las siguientes categorías de datos:</p>
                <LegalList type="none">
                    <li><strong>2.1. Datos de autenticación y cuenta:</strong> Correos electrónicos, contraseñas encriptadas (hashing), tokens de sesión (JWT) y direcciones IP recopiladas durante el proceso de Single Sign-On (SSO) entre la plataforma matriz y el ERP.</li>
                    <li><strong>2.2. Datos transaccionales y financieros:</strong> Información comercial y tributaria digitada por el usuario o importada vía integraciones (ej. cartolas bancarias, archivos XML del SII, catálogos de productos y centros de costo).</li>
                    <li><strong>2.3. Datos de telemetría:</strong> Registros de auditoría (logs), timestamp de inicio de sesión y acciones ejecutadas dentro del sistema, con fines estrictos de seguridad y depuración de errores.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Artículo 3: Finalidad y base legal del tratamiento" id="art-3">
                <p><strong>3.1. Finalidades exclusivas:</strong> Los datos recopilados serán procesados de forma lícita, leal y transparente, con el único fin de:</p>
                <LegalList>
                    <li><strong>Provisión del servicio:</strong> Permitir la autenticación y ejecución de los algoritmos de cálculo del ERP.</li>
                    <li><strong>Soporte técnico:</strong> Facilitar la asistencia técnica solicitada por el Cliente.</li>
                    <li><strong>Seguridad integral:</strong> Detectar, mitigar y prevenir fraudes o accesos no autorizados.</li>
                    <li><strong>Cumplimiento legal:</strong> Emitir la facturación electrónica correspondiente al pago de la suscripción.</li>
                </LegalList>
                <p>
                    <strong>3.2. Base jurídica del tratamiento:</strong> El tratamiento de los datos se fundamenta legalmente en: (i) la ejecución del contrato de prestación de servicios SaaS suscrito entre las partes; (ii) el cumplimiento de obligaciones legales y tributarias de Tenri; y (iii) el interés legítimo del Proveedor en garantizar la seguridad de la infraestructura y prevenir el fraude.
                </p>
                <p>
                    <strong>3.3. Prohibición de comercialización:</strong> Tenri declara expresamente que NO vende, arrienda, cede ni comercializa bases de datos, correos electrónicos ni información financiera a terceros o corredores de datos (Data Brokers).
                </p>
            </LegalSection>

            <LegalSection title="Artículo 4: Estándares de seguridad y criptografía" id="art-4">
                <p>Tenri implementa medidas de seguridad técnicas y organizativas de nivel empresarial:</p>
                <LegalList>
                    <li><strong>Cifrado en tránsito:</strong> Toda la comunicación se transmite bajo protocolos criptográficos (HTTPS/TLS).</li>
                    <li><strong>Cifrado en reposo (credenciales):</strong> Contraseñas sometidas a algoritmos de derivación de claves (Bcrypt).</li>
                    <li><strong>Protección de API:</strong> Endpoints protegidos mediante validación JWT y mitigación CSRF/XSS.</li>
                </LegalList>
                <p className="text-xs text-gray-500 italic">
                    A pesar de estas medidas, el Cliente asume que el riesgo residual en entornos web interconectados no es reducible a cero.
                </p>
            </LegalSection>

            <LegalSection title="Artículo 5: Sub-encargados y transferencia internacional" id="art-5">
                <LegalList type="none">
                    <li><strong>5.1. Uso de sub-encargados:</strong> Para garantizar la operatividad del Software, Tenri utiliza infraestructura de terceros (ej. proveedores de alojamiento web como cPanel/AWS, pasarelas de pago y servicios SMTP). Tenri se compromete a exigir a todo Sub-encargado la mantención de estándares de seguridad y confidencialidad equivalentes o superiores a los establecidos en este DPA.</li>
                    <li><strong>5.2. Transferencia internacional de datos:</strong> El Licenciatario reconoce y autoriza expresamente que los datos procesados por el ERP pueden ser alojados, respaldados o enrutados a través de servidores ubicados fuera del territorio chileno (transferencia internacional). Tenri garantiza que dichos proveedores de infraestructura en el extranjero cumplen con niveles adecuados de protección de datos acorde a los estándares de la industria.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Artículo 6: Retención y destrucción de datos" id="art-6">
                <LegalList type="none">
                    <li><strong>6.1. Vigencia:</strong> Los datos de operación del ERP serán conservados mientras la suscripción del Cliente se mantenga activa.</li>
                    <li><strong>6.2. Protocolo de eliminación post-término:</strong> Tras la terminación del servicio, el Cliente dispondrá de treinta (30) días corridos para la exportación de su información. Al transcurrir el día treinta y uno (31), Tenri ejecutará un borrado físico e irreversible (Hard Delete) de las tablas relacionales asociadas al Cliente, sin retener copias ocultas.</li>
                    <li><strong>6.3. Retención legal:</strong> Tenri conservará únicamente los datos de facturación e historiales de acceso del administrador de la cuenta por el periodo exigido por la legislación aplicable, exclusivamente para defensa jurídica o cumplimiento normativo.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Artículo 7: Ejercicio de derechos ARCO" id="art-7">
                <p>
                    En conformidad con la Ley N° 19.628, el ejercicio de los derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) se regirá por el siguiente protocolo según el rol de los datos:
                </p>
                <LegalList type="none">
                    <li><strong>7.1. Sobre los datos de cuenta (Tenri como Responsable):</strong> El Cliente administrador podrá ejercer sus derechos ARCO sobre sus datos de facturación o registro enviando una solicitud formal al correo oficial de privacidad: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-tenri-900">legal@tenri.cl</code>. Tenri responderá dentro de los plazos legales establecidos.</li>
                    <li><strong>7.2. Sobre los datos del ERP (Tenri como Encargado):</strong> Si un tercero (ej. un empleado, proveedor o cliente del Licenciatario) desea ejercer derechos ARCO sobre información alojada dentro del ERP Contable, <strong>deberá dirigir su solicitud directa y exclusivamente al Licenciatario (Responsable del Tratamiento)</strong>. Si Tenri recibe una solicitud de este tipo de forma directa, se limitará a notificar al Cliente para que este gestione la respuesta. Tenri colaborará técnicamente, en la medida de lo razonable, para que el Cliente pueda cumplir con sus obligaciones legales de rectificación o borrado desde su panel de control.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Artículo 8: Brechas de seguridad (Data Breaches)" id="art-8">
                <p>
                    En el evento de una vulneración a las barreras de seguridad que comprometa la confidencialidad de los datos del ERP, Tenri notificará al administrador de la cuenta afectada en un plazo no superior a 72 horas desde la confirmación técnica del incidente, detallando la naturaleza de la brecha, los datos posiblemente comprometidos y las medidas de mitigación adoptadas.
                </p>
            </LegalSection>

            <LegalSection title="Artículo 9: Modificaciones al DPA" id="art-9">
                <p>
                    Tenri se reserva el derecho de actualizar este DPA en respuesta a cambios en la legislación o la implementación de nuevas tecnologías. Las modificaciones sustanciales serán notificadas por correo electrónico con anticipación a su entrada en vigencia.
                </p>
            </LegalSection>
        </LegalLayout>
    );
};

export default Privacidad;
