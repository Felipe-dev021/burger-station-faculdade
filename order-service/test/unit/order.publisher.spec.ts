import { Pedido } from '../../src/domain/entidades/pedido.entity';
import { PublicadorPedido } from '../../src/domain/observadores/pedido.observer';

describe('PublicadorPedido', () => {
  it('notifica observadores inscritos quando um pedido e finalizado', () => {
    const publicador = new PublicadorPedido();
    const observador = { atualizar: jest.fn() };
    const pedido = new Pedido(1, 95, 10, 'PENDENTE', 'Item');

    publicador.inscrever(observador);
    publicador.notificar(pedido);

    expect(observador.atualizar).toHaveBeenCalledWith(pedido);
  });
});
