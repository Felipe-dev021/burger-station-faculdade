import { Pool } from 'pg';
import { Pedido } from '../domain/order';

export class RepositorioPedidoPostgres {
  constructor(private readonly pool: Pool) {}

  async garantirTabela(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id BIGINT PRIMARY KEY,
        total REAL NOT NULL,
        mesa INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        itens TEXT NOT NULL
      );
    `);
  }

  async salvar(pedido: Pedido): Promise<void> {
    const query = 'INSERT INTO pedidos (id, total, mesa, status, itens) VALUES ($1, $2, $3, $4, $5)';
    await this.pool.query(query, [pedido.id, pedido.total, pedido.mesa, pedido.status, pedido.itens]);
  }

  async buscarTodos(): Promise<Pedido[]> {
    const { rows } = await this.pool.query('SELECT * FROM pedidos ORDER BY id DESC');
    return rows.map(r => new Pedido(Number(r.id), Number(r.total), r.mesa, r.status, r.itens));
  }

  async atualizarStatus(id: number, status: string): Promise<void> {
    await this.pool.query('UPDATE pedidos SET status = $1 WHERE id = $2', [status, id]);
  }
}