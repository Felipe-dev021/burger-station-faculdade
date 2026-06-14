import { Module } from '@nestjs/common';
import { FinalizarPedidoUseCase } from './application/finalize-order.use-case';
import { ListarPedidosUseCase } from './application/list-orders.use-case';
import { ObservadorPedidoConsole } from './infrastructure/console-order.observer';
import { RepositorioPedidoSqlite } from './infrastructure/sqlite-order.repository';
import { PedidosController } from './presentation/orders.controller';
import { PublicadorPedido } from './domain/order.observer';
import { EstrategiaDescontoPercentual } from './domain/strategies/percentage-discount.strategy';

@Module({
    controllers: [PedidosController],
    providers: [
        {
            provide: RepositorioPedidoSqlite,
            useFactory: async () => RepositorioPedidoSqlite.criar(),
        },
        PublicadorPedido,
        ObservadorPedidoConsole,
        {
            provide: FinalizarPedidoUseCase,
            useFactory: async (
                repositorio: RepositorioPedidoSqlite,
                publicador: PublicadorPedido,
                observador: ObservadorPedidoConsole,
            ) => {
                publicador.inscrever(observador);
                return new FinalizarPedidoUseCase(repositorio, new EstrategiaDescontoPercentual(), publicador);
            },
            inject: [RepositorioPedidoSqlite, PublicadorPedido, ObservadorPedidoConsole],
        },
        {
            provide: ListarPedidosUseCase,
            useFactory: async (repositorio: RepositorioPedidoSqlite) => new ListarPedidosUseCase(repositorio),
            inject: [RepositorioPedidoSqlite],
        },
    ],
})
export class AppModule {}