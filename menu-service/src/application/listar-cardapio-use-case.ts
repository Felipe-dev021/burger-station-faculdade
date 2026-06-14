import { RepositorioCardapio } from '../domain/repositorios/cardapio.repository';
import { ItemCardapio } from '../domain/entidades/item-cardapio.entity';

export class ListarCardapioUseCase {
  constructor(private readonly repositorio: RepositorioCardapio) {}

  async executar(): Promise<ItemCardapio[]> {
    return await this.repositorio.buscarTodos();
  }
}
