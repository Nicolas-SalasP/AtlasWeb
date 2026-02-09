<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #0f172a; }
        .content { color: #333; line-height: 1.6; }
        .btn { display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #aaa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ATLAS DIGITAL</div>
        </div>
        
        <div class="content">
            <h2>¡Hola!</h2>
            <p>Te informamos que tu suscripción al servicio <strong>{{ $item->product_name }}</strong> ha finalizado hoy.</p>
            
            <p>Para no perder acceso a tus beneficios y mantener tu servicio activo, por favor renueva tu plan lo antes posible.</p>
            
            <center>
                <a href="{{ url('/catalogo') }}" class="btn">Renovar Suscripción</a>
            </center>
        </div>

        <div class="footer">
            <p>Si ya realizaste el pago, por favor ignora este mensaje.</p>
            &copy; {{ date('Y') }} Atlas Digital Tech. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>