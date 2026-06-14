import { Pedido } from '../domain/order';
import { RepositorioPedido } from '../domain/order.repository';

export class RepositorioPedidoEmMemoria implements RepositorioPedido {
  private readonly pedidos: Pedido[] = [];

  salvar(pedido: Pedido): void {
    this.pedidos.push(pedido);
  }

  buscarTodos(): Pedido[] {
    return [...this.pedidos];
  }
}