import { Module } from '@nestjs/common';
import { Pool } from 'pg';

@Module({
  controllers: [],
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL do Cardápio não configurada!');
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

        // Cria a tabela de itens do cardápio com coluna de ESTOQUE se não existir
        pool.query(`
          CREATE TABLE IF NOT EXISTS cardapio (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            preco REAL NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            estoque INT NOT NULL DEFAULT 10
          );
        `);
        return pool;
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class AppModule {}