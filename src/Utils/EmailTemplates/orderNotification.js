/**
 * Email template for order notifications sent to administrators
 */

const getOrderNotificationTemplate = (datos_de_orden) => {
  return `
    <style>
      .modal-content {
        font-family: 'Arial', sans-serif;
        color: #333;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .modal-content h2 {
        color: #2c3e50;
        border-bottom: 2px solid #ecf0f1;
        padding-bottom: 10px;
      }
      .modal-content h3 {
        margin-top: 20px;
        color: #2980b9;
      }
      .modal-content p {
        line-height: 1.6;
        margin: 5px 0;
      }
      .modal-content ul {
        list-style: none;
        padding: 0;
      }
      .modal-content li {
        background: #ecf0f1;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
      }
      .modal-content strong {
        color: #34495e;
      }
    </style>
  
    <div class="modal-content">
      <h2>Detalles de la Orden</h2>
      <p><strong>Número de Movimiento:</strong> ${datos_de_orden.movimiento_numero}</p>
      
      <h3>Datos del Cliente</h3>
      <p><strong>Nombre:</strong> ${datos_de_orden.datos_cliente.nombre_completo}</p>
      <p><strong>DNI:</strong> ${datos_de_orden.datos_cliente.dni}</p>
      <p><strong>Dirección:</strong> ${datos_de_orden.datos_cliente.direccion}</p>
      <p><strong>CP:</strong> ${datos_de_orden.datos_cliente.cp}</p>
      <p><strong>Celular:</strong> ${datos_de_orden.datos_cliente.celular}</p>
      <p><strong>Email:</strong> ${datos_de_orden.datos_cliente.email}</p>
      
      <h3>Productos</h3>
      <ul>
        ${datos_de_orden.productos.map(p => `
          <li>
            <p><strong>SKU:</strong> ${p.sku}</p>
            <p><strong>Descripción:</strong> ${p.descripcion}</p>
            <p><strong>Precio:</strong> $${p.precio}</p>
            <p><strong>Cantidad:</strong> ${p.cantidad_seleccionada}</p>
          </li>
        `).join('')}
      </ul>
      
      <h3>Opción de Entrega</h3>
      ${datos_de_orden.opcion_de_entrega.retira_en_local.toLowerCase() == 'no' 
        ?
          `<div>
            <p><strong>Dirección:</strong> ${datos_de_orden.opcion_de_entrega.direccion}</p>
            <p><strong>CP:</strong> ${datos_de_orden.opcion_de_entrega.cp}</p>
          </div>`
        
        : `<p><strong>Retira en Local</strong></p>`
      }
      
      <h3>Forma de Pago</h3>
      <p><strong>Abona en:</strong> ${datos_de_orden.abona_en}</p>
    </div>
  `;
};

module.exports = getOrderNotificationTemplate;