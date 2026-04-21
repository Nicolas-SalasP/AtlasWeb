import React from 'react';

const Terminos = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 shadow-sm rounded-lg border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          CONTRATO DE TÉRMINOS Y CONDICIONES DE USO Y ACUERDO DE LICENCIA DE SOFTWARE COMO SERVICIO (SaaS)
        </h1>
        <p className="text-sm text-gray-500 mb-8 border-b pb-4">
          FECHA DE ÚLTIMA ACTUALIZACIÓN: 24 de Marzo de 2026.
        </p>
        
        <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
          <p>
            El presente documento constituye un acuerdo legal, vinculante y de adhesión (en adelante, el "Contrato") entre Tenri Spa (en adelante, el "Licenciante", "Proveedor" o "la Empresa") y la persona natural con inicio de actividades comerciales o persona jurídica, debidamente representada, que accede, se registra o utiliza el sistema ERP Contable (en adelante, el "Licenciatario", "Cliente" o "Usuario").
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 1: DEFINICIONES APLICABLES</h3>
          <p>Para la correcta interpretación de este Contrato, se entenderá por:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Software / Sistema:</strong> La plataforma ERP Contable alojada en los dominios y subdominios de tenri.cl.</li>
            <li><strong>Plataforma Matriz (Tenri):</strong> El sistema central de Tenri Spa que gestiona las suscripciones, pagos y la autenticación centralizada (SSO).</li>
            <li><strong>Datos del Licenciatario:</strong> Toda información financiera, contable, tributaria o comercial ingresada, procesada o almacenada por el Usuario dentro del Software.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 2: NATURALEZA COMERCIAL (B2B) Y ALCANCE DE LA LICENCIA</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>2.1. Enfoque Corporativo (B2B):</strong> Las partes declaran que el servicio provisto está destinado principalmente a fines empresariales, comerciales y de gestión administrativa. En consecuencia, el presente Contrato se rige por las normas del Código de Comercio y el Código Civil chileno, asumiendo de buena fe que no existe una relación de consumo asimétrica en los términos previstos por la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
            </li>
            <li>
              <strong>2.2. Otorgamiento y Límites de la Licencia:</strong> El Licenciante otorga al Licenciatario una licencia de uso de software como servicio (SaaS), limitada, no exclusiva, intransferible y revocable. La licencia ampara únicamente el uso del Software a través de las interfaces de usuario (UI) provistas.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 3: FASE DE DESPLIEGUE BETA Y NIVELES DE SERVICIO (SLA)</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>3.1. Condición de Software en Desarrollo:</strong> El Licenciatario reconoce que el Software se encuentra en una fase de despliegue inicial (Beta). Durante esta fase, el Proveedor realizará esfuerzos comercialmente razonables para asegurar la estabilidad, aunque el sistema podría presentar intermitencias o anomalías técnicas temporales.
            </li>
            <li>
              <strong>3.2. Ventanas de Mantenimiento:</strong> El Licenciante podrá interrumpir el acceso al Software para realizar mantenimientos programados o actualizaciones de código. Las interrupciones críticas serán notificadas con antelación, salvo en casos de parches de seguridad de emergencia.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 4: POLÍTICA DE USO ACEPTABLE (AUP) Y TERMINACIÓN DIRECTA</h3>
          <p><strong>4.1. Prohibiciones de Uso:</strong> El Licenciatario se compromete a hacer un uso lícito y razonable del Software. Queda estrictamente prohibido:</p>
          <ul className="list-[lower-alpha] pl-5 space-y-1">
            <li>Registrar operaciones simuladas, facilitar la evasión de impuestos o el lavado de activos.</li>
            <li>Ejecutar herramientas de automatización de pruebas, inyección de código (SQL/XSS), o peticiones masivas (DDoS).</li>
            <li>Realizar ingeniería inversa, descompilación o desensamblaje del código fuente o la arquitectura de bases de datos.</li>
            <li>La reventa, comercialización o sublicenciamiento no autorizado del acceso al Software a terceros.</li>
            <li>El uso abusivo o desproporcionado de los recursos de red o servidor que degrade el rendimiento general de la plataforma para otros usuarios.</li>
          </ul>
          <p>
            <strong>4.2. Terminación por Incumplimiento Grave:</strong> La violación documentada de cualquiera de las disposiciones de esta AUP facultará al Licenciante para la terminación directa, anticipada y sin previo aviso del presente Contrato, procediendo a la suspensión inmediata de las Credenciales del Licenciatario, sin perjuicio de las acciones legales indemnizatorias que correspondan.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 5: LIMITACIÓN DE RESPONSABILIDAD TRIBUTARIA Y CONTABLE</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>5.1. Herramienta de Apoyo, No de Asesoría:</strong> El Software procesa y automatiza cálculos basados en los parámetros ingresados por el Usuario. El Licenciante provee tecnología, no asesoría jurídica, contable ni tributaria.
            </li>
            <li>
              <strong>5.2. Responsabilidad de Validación:</strong> Es responsabilidad del Licenciatario y de su Contador Patrocinante revisar y validar todo reporte, asiento contable, F29 y pre-cálculo de Operación Renta antes de su presentación ante el Servicio de Impuestos Internos (SII) o la Tesorería General de la República (TGR).
            </li>
            <li>
              <strong>5.3. Anomalías en Cálculos (Bugs):</strong> En caso de detectarse errores sistémicos de cálculo atribuibles a la programación del Software, la responsabilidad del Licenciante se limitará a la provisión de un parche correctivo en el menor tiempo técnicamente posible. En la máxima medida permitida por la ley, el Licenciante no asumirá el pago de multas, reajustes o intereses penales derivados de la omisión del Cliente en la validación previa de sus declaraciones.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 6: LIMITACIÓN DE RESPONSABILIDAD CIVIL Y FUERZA MAYOR</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>6.1. Tope de Indemnización:</strong> Salvo en casos donde se determine dolo o culpa grave mediante resolución judicial ejecutoriada, la responsabilidad civil indemnizatoria del Proveedor (contractual o extracontractual) estará limitada al monto equivalente a las tarifas de suscripción efectivamente pagadas por el Licenciatario en los tres (3) meses inmediatamente anteriores al hecho causante del daño. Para suscripciones en periodo de gratuidad o fase Beta, dicho tope se fija en una (1) Unidad de Fomento (UF).
            </li>
            <li>
              <strong>6.2. Exclusión de Daños Indirectos:</strong> Como regla general, el Licenciante no será responsable por lucro cesante, pérdida de utilidades comerciales o pérdida de oportunidades de negocio.
            </li>
            <li>
              <strong>6.3. Eventos de Fuerza Mayor:</strong> El Proveedor queda eximido de responsabilidad por interrupciones del servicio derivadas de causas fuera de su control razonable, incluyendo: caídas en centros de datos de terceros (ej. AWS, cPanel), cortes de la red eléctrica nacional, desastres naturales o exploits de día cero (Zero-Day exploits) imprevisibles.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 7: SEGURIDAD, BACKUPS (RTO/RPO) Y RECUPERACIÓN DE ACCESO</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>7.1. Política de Respaldos:</strong> El Licenciante realiza copias de seguridad de las bases de datos con un Objetivo de Punto de Recuperación (RPO) de 24 horas, y un Objetivo de Tiempo de Recuperación (RTO) estimado en 48 horas para casos de fallas catastróficas de infraestructura. Los respaldos se retienen por un máximo de 15 días corridos.
            </li>
            <li>
              <strong>7.2. Arquitectura SSO y Pérdida de Accesos:</strong> El acceso al ERP depende de la validación en "Tenri". Si el Usuario pierde el acceso a sus credenciales de origen, el Licenciante requerirá un procedimiento estricto de verificación de identidad (ej. validación notarial de representación legal y cruce de RUT de la empresa) previo a realizar cualquier restauración manual de acceso.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 8: RETENCIÓN, SUSPENSIÓN Y EXPORTACIÓN DE DATOS</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>8.1. Propiedad de los Datos:</strong> El Licenciatario conserva la titularidad exclusiva sobre la información ingresada al Software.
            </li>
            <li>
              <strong>8.2. Exportación Estándar:</strong> Ante la terminación regular del Contrato, el Licenciante habilitará un periodo de treinta (30) días corridos en modalidad de "solo lectura", permitiendo al Cliente exportar sus datos contables en formatos estándar (ej. CSV, Excel, PDF).
            </li>
            <li>
              <strong>8.3. Exportación por Incumplimiento de AUP:</strong> En el evento excepcional de terminación anticipada por incumplimiento grave de la Política de Uso Aceptable (Art. 4), el Licenciante denegará el acceso interactivo a la plataforma. No obstante, a fin de no obstaculizar el cumplimiento de las obligaciones tributarias del infractor, el Proveedor facilitará, a petición expresa del Cliente y dentro de un plazo de 72 horas hábiles, una exportación plana (dump en formato CSV) de los registros contables básicos, eximiéndose de proveer configuraciones de interfaz o reportes estructurados.
            </li>
            <li>
              <strong>8.4. Eliminación de Datos:</strong> Transcurrido el periodo aplicable de exportación, el Licenciante procederá a la eliminación segura de las bases de datos.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 9: MODIFICACIÓN DE CONDICIONES Y ACTUALIZACIÓN DE TÉRMINOS</h3>
          <p>
            El Licenciante se reserva el derecho de modificar el presente Contrato, módulos o tarifas aplicables para adaptarse a la evolución tecnológica o legislativa. Todo cambio sustancial será notificado al correo del administrador con al menos quince (15) días de anticipación. Si el Licenciatario no está de acuerdo con las nuevas condiciones, tendrá el derecho irrestricto de cancelar su cuenta y poner término a su suscripción antes de la entrada en vigencia de los cambios, sin penalidad alguna. El uso continuado del servicio vencido el plazo de notificación se entenderá como aceptación expresa, vinculante y tácita de los nuevos términos.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 10: PROPIEDAD INTELECTUAL E INTEGRACIONES EXTERNAS</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>10.1. Derechos Reservados:</strong> El Licenciante retiene los derechos de Propiedad Intelectual sobre el código fuente, la arquitectura y las interfaces del Software.
            </li>
            <li>
              <strong>10.2. Integraciones y Terceros:</strong> Módulos específicos pueden depender de la conexión con APIs de terceros o instituciones estatales. El Licenciante no garantiza la disponibilidad continua, ininterrumpida o libre de errores de estas integraciones externas, y no será responsable si un tercero modifica sus protocolos, impidiendo el funcionamiento de dichos módulos.
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8">ARTÍCULO 11: DISPOSICIONES GENERALES Y JURISDICCIÓN</h3>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <strong>11.1. Totalidad del Acuerdo:</strong> Este Contrato y sus anexos constituyen el acuerdo completo e íntegro entre las partes, sustituyendo cualquier negociación, promesa o acuerdo previo, oral o escrito.
            </li>
            <li>
              <strong>11.2. No Renuncia:</strong> El retraso, omisión o falta de ejercicio por parte del Licenciante de cualquier derecho, facultad o recurso conferido por este Contrato o por la ley, en una o más instancias, no se interpretará ni constituirá una renuncia a dichos derechos, ni impedirá su ejercicio estricto en el futuro.
            </li>
            <li>
              <strong>11.3. Independencia de las Cláusulas:</strong> Si un tribunal competente declarase la nulidad o inaplicabilidad de alguna disposición, dicha declaración no afectará la validez de las cláusulas restantes.
            </li>
            <li>
              <strong>11.4. Jurisdicción:</strong> La validez, interpretación y ejecución de este Contrato se regirán por las leyes de la República de Chile. Para la resolución de controversias, las partes fijan domicilio en la ciudad y comuna de Santiago de Chile, sometiéndose de manera expresa a la jurisdicción de sus Tribunales Ordinarios de Justicia.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Terminos;