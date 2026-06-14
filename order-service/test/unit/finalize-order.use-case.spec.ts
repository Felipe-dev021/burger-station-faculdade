import { FinalizarPedidoUseCase } from '../../src/application/finalize-order.use-case';
import { PublicadorPedido } from '../../src/domain/order.observer';
import { EstrategiaDescontoPercentual } from '../../src/domain/strategies/percentage-discount.strategy';
import { RepositorioPedidoEmMemoria } from '../../src/infrastructure/in-memory-order.repository';

describe('FinalizarPedidoUseCase', () => {
  it('salva o pedido finalizado e notifica os observadores', () => {
    const repositorio = new RepositorioPedidoEmMemoria();
    const publicador = new PublicadorPedido();
    const observador = { atualizar: jest.fn() };

    publicador.inscrever(observador);

    const casoDeUso = new FinalizarPedidoUseCase(
      repositorio,
      new EstrategiaDescontoPercentual(),
      publicador,
    );

    const pedido = casoDeUso.executar(150);

    expect(pedido.total).toBe(135);
    expect(repositorio.buscarTodos()).toHaveLength(1);
    expect(observador.atualizar).toHaveBeenCalledWith(pedido);
  });
});