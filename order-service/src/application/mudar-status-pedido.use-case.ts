import { RepositorioPedido } from '../domain/repositorios/pedido.repository';

export class MudarStatusPedidoUseCase {
  constructor(private readonly repositorio: RepositorioPedido) {}

  async executar(id: number, status: string): Promise<void> {
    await this.repositorio.atualizarStatus(id, status);
  }
}