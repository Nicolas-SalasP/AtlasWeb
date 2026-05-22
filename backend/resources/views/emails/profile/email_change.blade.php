<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de correo - Tenri</title>
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
        }
        .header {
            background-color: #1A3626;
            padding: 30px 20px;
            text-align: center;
        }
        .content {
            padding: 40px 30px;
            color: #4b5563;
            line-height: 1.6;
            font-size: 16px;
            text-align: center;
        }
        .content h2 { color: #1A3626; font-size: 22px; margin-bottom: 10px; font-weight: bold; }
        .code-box {
            display: inline-block;
            background-color: #f0fdf4;
            border: 2px solid #1A3626;
            border-radius: 12px;
            padding: 18px 40px;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #1A3626;
            margin: 24px 0;
        }
        .security-notice {
            font-size: 13px;
            color: #6b7280;
            margin-top: 24px;
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            text-align: left;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #F3F4F6;
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td class="header">
                    <img src="https://tenri.cl/assets/email/logo-main.png" alt="TENRI" width="120" style="display:block; margin: 0 auto;">
                    <p style="color: #88C0A0; margin-top: 12px; font-size: 13px; letter-spacing: 1px;">VERIFICACIÓN DE CORREO</p>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h2>Confirma tu nuevo correo</h2>
                    <p>Ingresa el siguiente código en la aplicación para confirmar el cambio de dirección de correo electrónico.</p>

                    <div class="code-box">{{ $code }}</div>

                    <p style="font-size: 13px; color: #9ca3af; margin-top: 4px;">
                        Este código es válido por <strong>15 minutos</strong>.
                    </p>

                    <div class="security-notice">
                        <strong>¿No solicitaste este cambio?</strong><br>
                        Si no iniciaste esta solicitud, ignora este mensaje. Tu correo actual no será modificado.
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
