import { Pedido } from './order';

export interface RepositorioPedido {
  salvar(pedido: Pedido): void;
  buscarTodos(): Pedido[];
}