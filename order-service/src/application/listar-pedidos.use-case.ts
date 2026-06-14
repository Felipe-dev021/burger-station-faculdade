import { RepositorioPedido } from '../domain/repositorios/pedido.repository';
import { Pedido } from '../domain/entidades/pedido.entity';

export class ListarPedidosUseCase {
  constructor(private readonly repositorio: RepositorioPedido) {}

  async executar(): Promise<Pedido[]> {
    return await this.repositorio.buscarTodos();
  }
}
