import { Pedido } from './order';

export class FabricaPedido {
  static criar(total: number, mesa: number, itens: string): Pedido {
    return new Pedido(Date.now(), total, mesa, 'PENDENTE', itens);
  }
}