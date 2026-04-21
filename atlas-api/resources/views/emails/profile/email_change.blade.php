<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificación</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e3a8a; font-size: 24px; margin: 0;">Tenri Spa</h1>
        </div>

        <h2 style="color: #333333; font-size: 20px; text-align: center;">Verificación de Cambio de Correo</h2>
        
        <p style="color: #555555; font-size: 16px; line-height: 1.5; text-align: center;">
            Has solicitado cambiar la dirección de correo electrónico asociada a tu cuenta. Para confirmar este cambio, por favor ingresa el siguiente código de 6 dígitos:
        </p>

        <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 5px;">
                {{ $code }}
            </span>
        </div>

        <p style="color: #777777; font-size: 14px; text-align: center; margin-top: 20px;">
            Este código expirará en 10 minutos. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
        </p>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">

        <p style="color: #999999; font-size: 12px; text-align: center; margin: 0;">
            &copy; {{ date('Y') }} Tenri Spa. Todos los derechos reservados.
        </p>
    </div>
</body>
</html>