import { Pedido } from '../domain/entidades/pedido.entity';
import { RepositorioPedido } from '../domain/repositorios/pedido.repository';

export class RepositorioPedidoEmMemoria implements RepositorioPedido {
  private readonly pedidos: Pedido[] = [];

  async salvar(pedido: Pedido): Promise<void> {
    this.pedidos.push(pedido);
  }

  async buscarTodos(): Promise<Pedido[]> {
    return [...this.pedidos];
  }
}
