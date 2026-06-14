import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Permite que o frontend aceda à API
  await app.listen(process.env.PORT || 3002);
}
bootstrap();