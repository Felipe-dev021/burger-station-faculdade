import { Pool } from 'pg';
import { ItemCardapio } from '../domain/entidades/item-cardapio.entity';
import { RepositorioCardapio } from '../domain/repositorios/cardapio.repository';

export class RepositorioCardapioPostgres implements RepositorioCardapio {
  constructor(private readonly pool: Pool) {}

  async buscarTodos(): Promise<ItemCardapio[]> {
    const { rows } = await this.pool.query('SELECT * FROM cardapio ORDER BY id ASC');
    
    // Se o banco estiver vazio, insere alguns itens iniciais para demonstração
    if (rows.length === 0) {
      await this.semearDados();
      const retry = await this.pool.query('SELECT * FROM cardapio ORDER BY id ASC');
      return retry.rows.map(r => new ItemCardapio(r.id, r.nome, r.preco, r.categoria, r.estoque));
    }

    return rows.map(r => new ItemCardapio(r.id, r.nome, r.preco, r.categoria, r.estoque));
  }

  private async semearDados(): Promise<void> {
    const itens = [
      ['Gourmet House Burger', 34.90, 'Lanches', 15],
      ['Batata Rústica com Alecrim', 18.90, 'Acompanhamentos', 20],
      ['Suco Natural de Frutas', 9.50, 'Bebidas', 8],
      ['Salada Caesar', 22.00, 'Saladas', 12],
      ['Petit Gâteau', 15.00, 'Sobremesas', 10]
    ];

    for (const [nome, preco, categoria, estoque] of itens) {
      await this.pool.query(
        'INSERT INTO cardapio (nome, preco, categoria, estoque) VALUES ($1, $2, $3, $4)',
        [nome, preco, categoria, estoque]
      );
    }
  }
}
