import { FinalizarPedidoUseCase } from '../../src/application/finalizar-pedido.use-case';
import { PublicadorPedido } from '../../src/domain/observadores/pedido.observer';
import { EstrategiaDescontoPercentual } from '../../src/domain/estrategias/percentage-discount.strategy';
import { RepositorioPedidoEmMemoria } from '../../src/infrastructure/repositorio-pedido-memoria';

describe('FinalizarPedidoUseCase', () => {
  it('salva o pedido finalizado e notifica os observadores', async () => {
    const repositorio = new RepositorioPedidoEmMemoria();
    const publicador = new PublicadorPedido();
    const observador = { atualizar: jest.fn() };

    publicador.inscrever(observador);

    const casoDeUso = new FinalizarPedidoUseCase(
      repositorio,
      publicador,
    );

    const pedido = await casoDeUso.executar(150, 1, 'Item Teste', new EstrategiaDescontoPercentual());

    expect(pedido.total).toBe(135);
    expect(await repositorio.buscarTodos()).toHaveLength(1);
    expect(observador.atualizar).toHaveBeenCalledWith(pedido);
  });
});
