<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vinculación de Órdenes</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #0ea5e9; /* Un color azul profesional, puedes ajustarlo a tu marca */
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 32px 24px;
        }
        .otp-box {
            background-color: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 6px;
            padding: 16px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 4px;
            color: #0f172a;
            margin: 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 24px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .warning {
            font-size: 13px;
            color: #94a3b8;
            margin-top: 24px;
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tenri Spa</h1>
        </div>
        
        <div class="content">
            <h2>Vincula tus compras anteriores</h2>
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para vincular las compras asociadas a este correo electrónico con tu nueva cuenta de usuario.</p>
            <p>Para completar este proceso de forma segura, por favor ingresa el siguiente código de validación en la plataforma:</p>
            
            <div class="otp-box">
                <p class="otp-code">{{ $otp }}</p>
            </div>
            
            <p><strong>Importante:</strong> Este código es de un solo uso y expirará en <strong>15 minutos</strong> por motivos de seguridad.</p>
            
            <div class="warning">
                <p>Si no te has registrado recientemente en Tenri Spa ni has solicitado vincular órdenes históricas, puedes ignorar este correo de forma segura. Tus datos están protegidos y nadie más puede acceder a ellos sin este código.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Tenri Spa. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>