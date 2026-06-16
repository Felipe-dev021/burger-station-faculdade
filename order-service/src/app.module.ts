import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PedidosController } from './presentation/pedidos.controller';
import { RepositorioPedidoPostgres } from './infrastructure/repositorio-pedido-postgres';
import { FinalizarPedidoUseCase } from './application/finalizar-pedido.use-case';
import { ListarPedidosUseCase } from './application/listar-pedidos.use-case';
import { MudarStatusPedidoUseCase } from './application/mudar-status-pedido.use-case';
import { PublicadorPedido } from './domain/observadores/pedido.observer';
import { ObservadorPedidoConsole } from './infrastructure/observador-pedido-console';
import { RepositorioPedidoLogDecorator } from './domain/repositorios/pedido.repository.log-decorator';

@Module({
  controllers: [PedidosController],
  providers: [
    {
      provide: 'RepositorioPedido',
      useFactory: async () => {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL de Pedidos não configurada!');
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
        const repoReal = new RepositorioPedidoPostgres(pool);
        await repoReal.garantirTabela();
        return new RepositorioPedidoLogDecorator(repoReal);
      },
    },
    {
      provide: PublicadorPedido,
      useFactory: () => {
        const publicador = new PublicadorPedido();
        publicador.inscrever(new ObservadorPedidoConsole());
        return publicador;
      },
    },
    {
      provide: FinalizarPedidoUseCase,
      useFactory: (repo: any, pub: PublicadorPedido) => {
        return new FinalizarPedidoUseCase(repo, pub);
      },
      inject: ['RepositorioPedido', PublicadorPedido],
    },
    {
      provide: ListarPedidosUseCase,
      useFactory: (repo: any) => {
        return new ListarPedidosUseCase(repo);
      },
      inject: ['RepositorioPedido'],
    },
    {
      provide: MudarStatusPedidoUseCase,
      useFactory: (repo: any) => {
        return new MudarStatusPedidoUseCase(repo);
      },
      inject: ['RepositorioPedido'],
    },
  ],
})
export class AppModule {}