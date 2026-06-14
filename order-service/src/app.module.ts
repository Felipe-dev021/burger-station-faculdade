import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PedidosController } from './presentation/pedidos.controller';
import { RepositorioPedidoPostgres } from './infrastructure/repositorio-pedido-postgres';
import { FinalizarPedidoUseCase } from './application/finalizar-pedido.use-case';
import { PublicadorPedido } from './domain/observadores/pedido.observer';

import { RepositorioPedidoLogDecorator } from './domain/repositorios/pedido.repository.log-decorator';

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
    PublicadorPedido,
    {
      provide: FinalizarPedidoUseCase,
      useFactory: (repo: RepositorioPedidoPostgres, pub: PublicadorPedido) => {
        // Aplicação do Padrão Decorator
        const repoComLog = new RepositorioPedidoLogDecorator(repo);
        return new FinalizarPedidoUseCase(repoComLog, pub);
      },
      inject: [RepositorioPedidoPostgres, PublicadorPedido],
    },
  ],
})
export class AppModule {}
