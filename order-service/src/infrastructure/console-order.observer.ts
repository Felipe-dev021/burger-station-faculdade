import { Pedido } from '../domain/order';
import { ObservadorPedido } from '../domain/order.observer';

export class ObservadorPedidoConsole implements ObservadorPedido {
  atualizar(pedido: Pedido): void {
    console.log(`Pedido finalizado: ${pedido.id} - ${pedido.total}`);
  }
}