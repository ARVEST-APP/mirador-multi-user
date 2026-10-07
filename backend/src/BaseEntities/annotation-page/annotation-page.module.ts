import { Module } from '@nestjs/common';
import { AnnotationPageService } from './annotation-page.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnotationPage } from './entities/annotation-page.entity';

@Module({
  providers: [AnnotationPageService],
  imports: [TypeOrmModule.forFeature([AnnotationPage])],
  exports: [AnnotationPageService],
})
export class AnnotationPageModule {}
