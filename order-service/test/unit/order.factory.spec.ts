import { FabricaPedido } from '../../src/domain/fabricas/pedido.factory';

describe('FabricaPedido', () => {
  it('cria um pedido simples', () => {
    const pedido = FabricaPedido.criar(120, 5, 'Hambúrguer');

    expect(pedido.total).toBe(120);
    expect(pedido.mesa).toBe(5);
    expect(pedido.id).toBeGreaterThan(0);
  });
});
