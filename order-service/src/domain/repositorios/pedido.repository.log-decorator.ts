import { Pedido } from '../entidades/pedido.entity';
import { RepositorioPedido } from './pedido.repository';

export class RepositorioPedidoLogDecorator implements RepositorioPedido {
  constructor(private readonly decorado: RepositorioPedido) {}

  async salvar(pedido: Pedido): Promise<void> {
    console.log(`[LOG] Salvando pedido #${pedido.id} no banco...`);
    await this.decorado.salvar(pedido);
    console.log(`[LOG] Pedido #${pedido.id} salvo com sucesso!`);
  }

  async buscarTodos(): Promise<Pedido[]> {
    console.log(`[LOG] Buscando todos os pedidos...`);
    const resultados = await this.decorado.buscarTodos();
    console.log(`[LOG] Foram encontrados ${resultados.length} pedidos.`);
    return resultados;
  }
}
