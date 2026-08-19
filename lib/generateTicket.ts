export function generateTicket(orderData: {
  client: string;
  phone: string;
  address: string;
  type: string;
  items: string;
  total: number;
  date?: string;
}) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor permite las ventanas emergentes para generar el comprobante.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Comprobante de Venta - Minimarket Pamela</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 15px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          .flex { display: flex; justify-content: space-between; }
          font-size-sm { font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin: 0;">MINIMARKET PAMELA</h2>
          <p style="font-size: 10px; margin: 2px 0;">RUC: 20600000001</p>
          <p style="font-size: 10px; margin: 2px 0;">San Martín de Porres, Lima</p>
        </div>
        
        <div class="line"></div>
        
        <p style="font-size: 11px; margin: 4px 0;"><strong>Fecha:</strong> ${orderData.date || new Date().toLocaleDateString()}</p>
        <p style="font-size: 11px; margin: 4px 0;"><strong>Cliente:</strong> ${orderData.client}</p>
        <p style="font-size: 11px; margin: 4px 0;"><strong>Teléfono:</strong> ${orderData.phone}</p>
        <p style="font-size: 11px; margin: 4px 0;"><strong>Tipo:</strong> ${orderData.type}</p>
        <p style="font-size: 11px; margin: 4px 0;"><strong>Dirección:</strong> ${orderData.address}</p>

        <div class="line"></div>
        
        <p style="font-size: 11px;" class="bold">DETALLE DE COMPRA:</p>
        <p style="font-size: 11px; white-space: pre-line;">${orderData.items}</p>
        
        <div class="line"></div>
        
        <div class="flex bold" style="font-size: 14px;">
          <span>TOTAL:</span>
          <span>S/ ${Number(orderData.total || 0).toFixed(2)}</span>
        </div>

        <div class="line"></div>
        
        <div class="center" style="font-size: 10px; margin-top: 15px;">
          <p>¡Gracias por tu compra vecina(o)!</p>
          <p>Conserve este ticket para cualquier cambio.</p>
        </div>

        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}