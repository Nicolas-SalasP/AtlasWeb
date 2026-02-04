<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: #1a1a1a; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0; }
        .details { margin: 20px 0; }
        .bank-info { background: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Atlas Digital Tech</h2>
        </div>
        
        <p>Hola <strong>{{ $order->user->name }}</strong>,</p>

        @if($order->payment_method === 'transfer')
            <p>Gracias por tu pedido. Para completarlo, por favor realiza la transferencia bancaria:</p>
            
            <div class="bank-info">
                <h3>Datos de Transferencia</h3>
                <p><strong>Banco:</strong> {{ $bankDetails['bank_name'] ?? 'Banco Estado' }}</p>
                <p><strong>Tipo:</strong> {{ $bankDetails['bank_account_type'] ?? 'Cuenta Rut' }}</p>
                <p><strong>Número:</strong> {{ $bankDetails['bank_account_number'] ?? 'N/A' }}</p>
                <p><strong>RUT:</strong> {{ $bankDetails['bank_rut'] ?? 'N/A' }}</p>
                <p><strong>Correo:</strong> {{ $bankDetails['bank_email'] ?? 'pagos@atlas.cl' }}</p>
            </div>
            <p>Una vez transferido, responde a este correo con el comprobante.</p>
        @else
            <p>¡Tu pago ha sido confirmado exitosamente! Estamos preparando tu pedido.</p>
        @endif

        <div class="details">
            <h3>Detalle del Pedido #{{ $order->id }}</h3>
            <ul>
                @foreach($order->items as $item)
                    <li>
                        {{ $item->product->name }} (x{{ $item->quantity }}) 
                        - ${{ number_format($item->total_line, 0, ',', '.') }}
                    </li>
                @endforeach
            </ul>
            <div class="total">
                Total: ${{ number_format($order->total, 0, ',', '.') }}
            </div>
        </div>

        <div class="footer">
            <p>Gracias por confiar en Atlas Digital Tech.</p>
        </div>
    </div>
</body>
</html>