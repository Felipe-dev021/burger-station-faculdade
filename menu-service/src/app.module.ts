import { Module } from '@nestjs/common';
import { ListarCardapioUseCase } from './application/list-menu.use-case';
import { RepositorioCardapioEmMemoria } from './infrastructure/in-memory-menu.repository';
import { CardapioController } from './presentation/menu.controller';

@Module({
    controllers: [CardapioController],
    providers: [
        RepositorioCardapioEmMemoria,
        {
            provide: ListarCardapioUseCase,
            useFactory: (repositorio: RepositorioCardapioEmMemoria) => new ListarCardapioUseCase(repositorio),
            inject: [RepositorioCardapioEmMemoria],
        },
    ],
})
export class AppModule {}