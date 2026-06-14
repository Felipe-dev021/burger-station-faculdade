import { Pedido } from '../entidades/pedido.entity';

export interface RepositorioPedido {
  salvar(pedido: Pedido): Promise<void>;
  buscarTodos(): Promise<Pedido[]>;
}
