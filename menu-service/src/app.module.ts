import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { CardapioController } from './presentation/cardapio.controller';
import { ListarCardapioUseCase } from './application/listar-cardapio-use-case';
import { RepositorioCardapioPostgres } from './infrastructure/repositorio-cardapio-postgres';

@Module({
  controllers: [CardapioController],
  providers: [
    {
      provide: RepositorioCardapioPostgres,
      useFactory: async () => {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL do Cardápio não configurada!');
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

        await pool.query(`
          CREATE TABLE IF NOT EXISTS cardapio (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            preco REAL NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            estoque INT NOT NULL DEFAULT 10
          );
        `);
        return new RepositorioCardapioPostgres(pool);
      },
    },
    {
      provide: ListarCardapioUseCase,
      useFactory: (repo: RepositorioCardapioPostgres) => {
        return new ListarCardapioUseCase(repo);
      },
      inject: [RepositorioCardapioPostgres],
    },
  ],
})
export class AppModule {}