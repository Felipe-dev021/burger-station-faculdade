import { ItemCardapio } from '../domain/menu-item';
import { RepositorioCardapio } from '../domain/menu.repository';

export class ListarCardapioUseCase {
  constructor(private readonly repositorio: RepositorioCardapio) {}

  executar(): ItemCardapio[] {
    return this.repositorio.buscarTodos();
  }
}