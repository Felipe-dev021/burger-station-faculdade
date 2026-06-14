import { ItemCardapio } from '../domain/entidades/item-cardapio.entity';
import { RepositorioCardapio } from '../domain/repositorios/cardapio.repository';

export class RepositorioCardapioEmMemoria implements RepositorioCardapio {
  async buscarTodos(): Promise<ItemCardapio[]> {
    return [
      new ItemCardapio(1, 'Gourmet House Burger', 34.90, 'Lanches', 15),
      new ItemCardapio(2, 'Batata Rústica com Alecrim', 18.90, 'Acompanhamentos', 20),
      new ItemCardapio(3, 'Suco Natural de Frutas', 9.50, 'Bebidas', 8),
      new ItemCardapio(4, 'Salada Caesar', 22.00, 'Saladas', 12),
      new ItemCardapio(5, 'Petit Gâteau', 15.00, 'Sobremesas', 10)
    ];
  }
}
