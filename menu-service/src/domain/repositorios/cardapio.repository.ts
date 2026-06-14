import { ItemCardapio } from '../entidades/item-cardapio.entity';

export interface RepositorioCardapio {
  buscarTodos(): Promise<ItemCardapio[]>;
}
