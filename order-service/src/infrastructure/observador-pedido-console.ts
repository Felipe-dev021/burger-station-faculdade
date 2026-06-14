import { Pedido } from '../domain/entidades/pedido.entity';
import { ObservadorPedido } from '../domain/observadores/pedido.observer';

export class ObservadorPedidoConsole implements ObservadorPedido {
  atualizar(pedido: Pedido): void {
    console.log(`[NOTIFICAÇÃO] Pedido #${pedido.id} atualizado. Mesa: ${pedido.mesa}, Total: R$ ${pedido.total.toFixed(2)}`);
  }
}
