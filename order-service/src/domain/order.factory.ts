import { Pedido } from './order';

export class FabricaPedido {
  static criar(total: number): Pedido {
    return new Pedido(Date.now(), total);
  }
}