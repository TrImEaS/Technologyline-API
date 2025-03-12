/**
 * Email template for order confirmations sent to customers
 */

const getOrderConfirmationTemplate = (datos_de_orden) => {
  return `
    <style>
      .email-container {
        font-family: 'Arial', sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #2c3e50;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .content {
        background-color: #ffffff;
        padding: 20px;
        border: 1px solid #e1e1e1;
        border-radius: 0 0 8px 8px;
      }
      .message-box {
        background-color: #f8f9fa;
        border-left: 4px solid #2c3e50;
        padding: 15px;
        margin: 20px 0;
      }
      .product-item {
        background-color: #f8f9fa;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
      }
      .section {
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        padding: 20px;
        font-size: 12px;
        color: #666;
      }

      .footer_img {
        max-width: 150px;
        height: auto;
        margin-top: 15px;
        display: block;
        margin-left: auto;
        margin-right: auto;
        filter: brightness(0) invert(1);
      }
    </style>

    <div class="email-container">
      <div class="header">
        <h1>¡Recibimos tu pedido!</h1>
      </div>
      
      <div class="content">
        <div class="message-box">
          <p>Estimado/a ${datos_de_orden.datos_cliente.nombre_completo},</p>
          <p>Hemos recibido tu solicitud de pedido correctamente. En breve, un representante de ventas se pondrá en contacto contigo para finalizar la compra y coordinar los detalles.</p>
        </div>

        <div class="section">
          <h2>Resumen del Pedido #${datos_de_orden.movimiento_numero}</h2>
          
          <h3>Productos Solicitados</h3>
          ${datos_de_orden.productos.map(p => `
            <div class="product-item">
              <p><strong>${p.descripcion}</strong></p>
              <p>Cantidad: ${p.cantidad_seleccionada}</p>
              <p>Precio unitario: $${p.precio}</p>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h3>Método de Entrega</h3>
          ${datos_de_orden.opcion_de_entrega.retira_en_local.toLowerCase() === 'no' 
            ? `<p>Envío a domicilio: ${datos_de_orden.opcion_de_entrega.direccion}, CP: ${datos_de_orden.opcion_de_entrega.cp}</p>`
            : `<p>Retiro en sucursal</p>`
          }
        </div>

        <div class="section">
          <h3>Forma de Pago Seleccionada</h3>
          <p>${datos_de_orden.abona_en}</p>
        </div>

        <div class="message-box">
          <p><strong>Próximos pasos:</strong></p>
          <p>1. Un representante te contactará para confirmar el pedido, solicitarte el pago y coordinar la entrega.</p>
          <p>2. Verificamos tu pago y derivaremos tu pedido a logistica (dentro de lo pactado en el punto 1).</p>
          <p>3. Estar en el lugar de entrega dentro de la fecha y horario pactados, de no estar en el lugar y horario acordado. pueden aplicarse cargos de una nueva entrega.</p>
          <p>4. Recibi tu pedido (No se entregaran paquetes a menores de 18 años, de no encontrarse el titular, dejar una autorización firmada con: nombre, apellido y DNI de la persona que reciba).</p>
        </div>
      </div>

      <div class="footer">
        <p>Este es un correo automático, por favor no responder.</p>
        <p>${datos_de_orden.company} - Todos los derechos reservados</p>
        <img class='footer_img' src={datos_de_orden.footer_img}/>
      </div>
    </div>
  `;
};

module.exports = getOrderConfirmationTemplate;