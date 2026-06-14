// @ts-ignore
import initSqlJs from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';
import { Pedido } from '../domain/order';
import { RepositorioPedido } from '../domain/order.repository';

// Declarações para acalmar o compilador TypeScript caso as tipagens globais falhem
declare const require: any;
declare const Buffer: any;

export class RepositorioPedidoSqlite implements RepositorioPedido {
  private constructor(
    private readonly bancoDeDados: any,
    private readonly caminhoArquivo: string,
  ) {}

  static async criar(): Promise<RepositorioPedidoSqlite> {
    const SQL = await initSqlJs({
      locateFile: (arquivo: string) => require.resolve(`sql.js/dist/${arquivo}`),
    });

    const pastaDados = path.join((process as any).cwd(), 'data');
    fs.mkdirSync(pastaDados, { recursive: true });

    const caminhoArquivo = path.join(pastaDados, 'burgerstation.sqlite');
    const bancoDeDados = fs.existsSync(caminhoArquivo)
      ? new SQL.Database(fs.readFileSync(caminhoArquivo))
      : new SQL.Database();

    const repositorio = new RepositorioPedidoSqlite(bancoDeDados, caminhoArquivo);
    repositorio.garantirTabela();
    return repositorio;
  }

  salvar(pedido: Pedido): void {
    const instrucao = this.bancoDeDados.prepare('INSERT INTO orders (id, total) VALUES (?, ?)');
    instrucao.run([pedido.id, pedido.total]);
    instrucao.free();
    this.persistir();
  }

  buscarTodos(): Pedido[] {
    const instrucao = this.bancoDeDados.prepare('SELECT id, total FROM orders ORDER BY id');
    const pedidos: Pedido[] = [];

    while (instrucao.step()) {
      const linha = instrucao.getAsObject();
      pedidos.push(new Pedido(Number(linha.id), Number(linha.total)));
    }

    instrucao.free();
    return pedidos;
  }

  private garantirTabela(): void {
    const instrucao = this.bancoDeDados.prepare(
      'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, total REAL NOT NULL)',
    );
    instrucao.run();
    instrucao.free();
    this.persistir();
  }

  private persistir(): void {
    const bytes = this.bancoDeDados.export();
    fs.writeFileSync(this.caminhoArquivo, Buffer.from(bytes));
  }
}