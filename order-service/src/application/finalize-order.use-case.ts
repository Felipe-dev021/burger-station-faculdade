import { FabricaPedido } from '../domain/order.factory';
import { PublicadorPedido } from '../domain/order.observer';
import { RepositorioPedido } from '../domain/order.repository';
import { Pedido } from '../domain/order';
import { EstrategiaPrecificacao } from '../domain/strategies/pricing.strategy';

export class FinalizarPedidoUseCase {
  constructor(
    private readonly repositorio: RepositorioPedido,
    private readonly estrategia: EstrategiaPrecificacao,
    private readonly publicador: PublicadorPedido,
  ) {}

  async executar(total: number, mesa: number, itens: string): Promise<Pedido> {
    const pedido = FabricaPedido.criar(total, mesa, itens);
    const desconto = this.estrategia.calcular(total);
    
    pedido.total = total - desconto;

    await this.repositorio.salvar(pedido);
    this.publicador.notificar(pedido);

    return pedido;
  }
}