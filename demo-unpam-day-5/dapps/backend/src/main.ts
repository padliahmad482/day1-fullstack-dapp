import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Tugas Day-4 - Ahmad Padli - 231011401999')
    .setDescription(
      'API untuk Simple Storage dApp - Dokumentasi Backend NestJS',
    )
    .setVersion('1.0')
    .addTag('blockchain')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
