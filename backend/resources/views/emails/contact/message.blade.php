<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacto Tenri SpA</title>
    <style>
        /* Tipografía y fondo exterior */
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #F3F4F6; padding: 40px 0; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        
        /* Encabezado Verde Oscuro Original (#1A3626) */
        .header { background-color: #1A3626; padding: 40px 20px 30px 20px; text-align: center; }
        /* Imagen responsiva fijada directamente al TD */
        .header img { display: block; margin: 0 auto; max-width: 100%; width: 180px; height: auto; }
        .header-subtitle { color: #88C0A0; margin: 15px 0 0 0; font-size: 14px; }
        
        /* Contenido y Textos */
        .content { padding: 40px 30px; color: #4b5563; line-height: 1.6; font-size: 15px; }
        .content h1 { color: #1A3626; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: bold; }
        
        /* Tabla de Datos (Estilo Limpio) */
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .data-table td { padding: 10px 0; border-bottom: 1px solid #F3F4F6; }
        .label { font-weight: bold; color: #4b5563; width: 30%; }
        .value { color: #111827; }
        .value a { color: #4A8B63; text-decoration: none; }
        
        /* Caja de Mensaje Crema Original (#F5F0E6) */
        .message-title { color: #1A3626; font-size: 16px; margin-top: 30px; margin-bottom: 10px; font-weight: bold; }
        .message-box { background-color: #F5F0E6; padding: 20px; border-radius: 8px; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
        
        /* Footer */
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #F3F4F6; }
        .footer a { color: #4A8B63; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td class="header">
                    <img src="https://tenri.cl/assets/email/logo-main.png" alt="TENRI">
                    <p class="header-subtitle">Respaldo de requerimiento desde el sitio web</p>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h1>Detalles del Contacto</h1>
                    <p style="margin-top: 0;">Hola <strong>{{ $data['nombre'] }}</strong>, hemos recibido tu consulta. Un especialista de nuestro equipo se pondrá en contacto contigo pronto.</p>
                    
                    <table class="data-table">
                        <tr>
                            <td class="label">Asunto:</td>
                            <td class="value" style="text-transform: capitalize;">{{ $data['asunto'] }}</td>
                        </tr>
                        <tr>
                            <td class="label">Correo:</td>
                            <td class="value"><a href="mailto:{{ $data['email'] }}">{{ $data['email'] }}</a></td>
                        </tr>
                        <tr>
                            <td class="label">Teléfono:</td>
                            <td class="value">{{ !empty($data['telefono']) ? $data['telefono'] : 'No proporcionado' }}</td>
                        </tr>
                    </table>

                    <div class="message-title">Mensaje enviado:</div>
                    <div class="message-box">{{ $data['mensaje'] }}</div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p style="margin-top: 0; margin-bottom: 8px; line-height: 1.5;">Este mensaje fue enviado desde el formulario de contacto de <strong>TENRI</strong>.<br>Hemos enviado una copia a nuestro equipo y a tu correo como respaldo.</p>
                    <p style="margin: 0;">© {{ date('Y') }} Tenri SpA | <a href="https://tenri.cl">www.tenri.cl</a></p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>