import { FabricaPedido } from '../../src/domain/order.factory';

describe('FabricaPedido', () => {
  it('cria um pedido simples', () => {
    const pedido = FabricaPedido.criar(120);

    expect(pedido.total).toBe(120);
    expect(pedido.id).toBeGreaterThan(0);
  });
});