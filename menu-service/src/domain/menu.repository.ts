import { ItemCardapio } from './menu-item';

export interface RepositorioCardapio {
  buscarTodos(): ItemCardapio[];
}