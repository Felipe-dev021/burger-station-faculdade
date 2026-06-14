import { EstrategiaTaxaFixa } from '../../src/domain/estrategias/fixed-fee.strategy';
import { EstrategiaDescontoPercentual } from '../../src/domain/estrategias/percentage-discount.strategy';

describe('Estrategias de precificacao', () => {
  it('aplica 10% de desconto para pedidos acima do limite', () => {
    const estrategia = new EstrategiaDescontoPercentual();

    expect(estrategia.calcular(150)).toBe(15);
  });

  it('aplica uma taxa fixa para a regra de entrega', () => {
    const estrategia = new EstrategiaTaxaFixa();

    expect(estrategia.calcular(80)).toBe(5);
  });
});
