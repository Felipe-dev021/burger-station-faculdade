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

  executar(total: number): Pedido {
    const pedido = FabricaPedido.criar(total);
    const desconto = this.estrategia.calcular(total);
    const pedidoFinalizado = new Pedido(pedido.id, total - desconto);

    this.repositorio.salvar(pedidoFinalizado);
    this.publicador.notificar(pedidoFinalizado);

    return pedidoFinalizado;
  }
}