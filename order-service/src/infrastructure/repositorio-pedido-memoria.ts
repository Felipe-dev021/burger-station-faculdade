import { Pedido } from '../domain/entidades/pedido.entity';
import { RepositorioPedido } from '../domain/repositorios/pedido.repository';

export class RepositorioPedidoEmMemoria implements RepositorioPedido {
  private readonly pedidos: Pedido[] = [];

  async salvar(pedido: Pedido): Promise<void> {
    this.pedidos.push(pedido);
  }

  async buscarTodos(): Promise<Pedido[]> {
    return this.pedidos;
  }

  async atualizarStatus(id: number, status: string): Promise<void> {
    const pedido = this.pedidos.find(p => p.id === id);
    if (pedido) pedido.status = status as any;
  }
}