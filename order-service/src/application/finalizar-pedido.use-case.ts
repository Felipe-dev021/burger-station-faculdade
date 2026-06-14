import { FabricaPedido } from '../domain/fabricas/pedido.factory';
import { PublicadorPedido } from '../domain/observadores/pedido.observer';
import { RepositorioPedido } from '../domain/repositorios/pedido.repository';
import { Pedido } from '../domain/entidades/pedido.entity';
import { EstrategiaPrecificacao } from '../domain/estrategias/pricing.strategy';

export class FinalizarPedidoUseCase {
  constructor(
    private readonly repositorio: RepositorioPedido,
    private readonly publicador: PublicadorPedido,
  ) {}

  async executar(total: number, mesa: number, itens: string, estrategia: EstrategiaPrecificacao): Promise<Pedido> {
    const pedido = FabricaPedido.criar(total, mesa, itens);
    const desconto = estrategia.calcular(total);
    
    pedido.total = total - desconto;

    await this.repositorio.salvar(pedido);
    this.publicador.notificar(pedido);

    return pedido;
  }
}
