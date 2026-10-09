import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class manifestCreationDto {
  // Optional: the creator is always the logged in user. Another user's id is
  // refused with a 403.
  @IsOptional()
  @IsNumber()
  idCreator?: number;
  @IsString()
  manifestThumbnail: string;
  @IsObject()
  processedManifest: any;
  @IsString()
  title: string;
  hash: string;
}
