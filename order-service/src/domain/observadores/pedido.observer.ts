import { Pedido } from '../entidades/pedido.entity';

export interface ObservadorPedido {
  atualizar(pedido: Pedido): void;
}

export class PublicadorPedido {
  private readonly observadores: ObservadorPedido[] = [];

  inscrever(observador: ObservadorPedido): void {
    this.observadores.push(observador);
  }

  notificar(pedido: Pedido): void {
    for (const observador of this.observadores) {
      observador.atualizar(pedido);
    }
  }
}
