<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - Tenri</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #F3F4F6; padding: 20px 0; }
        .main { 
            background-color: #ffffff; 
            margin: 0 auto; 
            width: 100%; 
            max-width: 600px; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            position: relative;
        }
        
        .header { 
            background-color: #1A3626; 
            padding: 20px 20px; 
            text-align: center;
            position: relative;
        }

        .mapache-absolute {
            position: absolute;
            top: 300px;
            right: 85px;
            transform: translateX(-50%);
            width: 180px;
            height: auto;
            z-index: 10;
        }

        .content { padding: 60px 30px 40px 30px; color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center; }
        .content h2 { color: #1A3626; font-size: 22px; margin-bottom: 20px; font-weight: bold; }
        
        .btn { 
            display: inline-block; 
            background-color: #1A3626; 
            color: #ffffff !important; 
            text-decoration: none; 
            padding: 15px 35px; 
            border-radius: 10px; 
            font-weight: bold; 
            margin: 20px 0; 
        }

        /* Nuevos estilos para la zona de seguridad y enlaces crudos */
        .security-notice { font-size: 13px; color: #6b7280; margin-top: 30px; background-color: #f9fafb; padding: 15px; border-radius: 8px; text-align: left; }
        .security-notice a { color: #1A3626; font-weight: bold; text-decoration: underline; }
        .raw-link-box { word-break: break-all; color: #4A8B63; font-size: 11px; margin-top: 10px; padding: 10px; background-color: #f0fdf4; border-radius: 6px; text-align: left; border: 1px solid #dcfce7; }

        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #F3F4F6; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td class="header">
                    <img src="https://tenri.cl/assets/email/logo-main.png" alt="TENRI" class="mapache-absolute">
                    
                    <p style="color: #88C0A0; margin-top: 50px; font-size: 14px; letter-spacing: 1px;">SISTEMA DE RECUPERACIÓN</p>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h2>¿Olvidaste tu clave?</h2>
                    <p>No te preocupes, haz clic en el botón de abajo para configurar una nueva contraseña y volver a tu cuenta.</p>
                    
                    <a href="{{ $url }}" class="btn">Restablecer Contraseña</a>

                    <p style="font-size: 13px; color: #9ca3af; margin-top: 10px;">
                        Este enlace de recuperación es válido por <strong>60 minutos</strong>.
                    </p>

                    <div class="security-notice">
                        <strong>¿No solicitaste este cambio?</strong><br>
                        Si tú no iniciaste esta recuperación, es posible que alguien esté intentando acceder a tu cuenta. Te recomendamos iniciar sesión inmediatamente y actualizar tu clave, o <a href="https://tenri.cl/contacto">contactar a soporte</a>.
                    </div>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">

                    <div style="text-align: left;">
                        <p style="font-size: 12px; color: #6b7280; margin: 0;">Si tienes problemas haciendo clic en el botón "Restablecer Contraseña", copia y pega la siguiente URL en tu navegador web:</p>
                        <div class="raw-link-box">
                            {{ $url }}
                        </div>
                    </div>

                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>© {{ date('Y') }} Tenri SpA | <a href="https://tenri.cl" style="color: #4A8B63; text-decoration: none;">www.tenri.cl</a></p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>