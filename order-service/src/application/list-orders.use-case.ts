import { RepositorioPedido } from '../domain/order.repository';
import { Pedido } from '../domain/order';

export class ListarPedidosUseCase {
  constructor(private readonly repositorio: RepositorioPedido) {}

  executar(): Pedido[] {
    return this.repositorio.buscarTodos();
  }
}