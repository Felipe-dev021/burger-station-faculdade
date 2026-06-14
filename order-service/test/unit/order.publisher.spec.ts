import { Pedido } from '../../src/domain/order';
import { PublicadorPedido } from '../../src/domain/order.observer';

describe('PublicadorPedido', () => {
  it('notifica observadores inscritos quando um pedido e finalizado', () => {
    const publicador = new PublicadorPedido();
    const observador = { atualizar: jest.fn() };
    const pedido = new Pedido(1, 95);

    publicador.inscrever(observador);
    publicador.notificar(pedido);

    expect(observador.atualizar).toHaveBeenCalledWith(pedido);
  });
});