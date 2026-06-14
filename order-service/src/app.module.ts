import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PedidosController } from './presentation/orders.controller';
import { RepositorioPedidoPostgres } from './infrastructure/postgres-order.repository';

@Module({
  controllers: [PedidosController],
  providers: [
    {
      provide: RepositorioPedidoPostgres,
      useFactory: async () => {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL de Pedidos não configurada!');
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
        const repo = new RepositorioPedidoPostgres(pool);
        await repo.garantirTabela();
        return repo;
      },
    },
  ],
})
export class AppModule {}