import { ItemCardapio } from '../domain/menu-item';
import { RepositorioCardapio } from '../domain/menu.repository';

export class RepositorioCardapioEmMemoria implements RepositorioCardapio {
  buscarTodos(): ItemCardapio[] {
    return [
      new ItemCardapio(1, 'Hamburguer', 25),
      new ItemCardapio(2, 'Batata Frita', 12),
      new ItemCardapio(3, 'Refrigerante', 8),
      new ItemCardapio(4, 'Salada Fresh', 18),
      new ItemCardapio(5, 'Wrap Premium', 22),
      new ItemCardapio(6, 'Cheesecake', 16),
    ];
  }
}