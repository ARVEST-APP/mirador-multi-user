import { IsOptional } from 'class-validator';
import { ManifestGroupRights } from '../../../enum/rights';
import { Manifest } from '../../../BaseEntities/manifest/entities/manifest.entity';

export class CreateLinkGroupManifestDto {
  // Optional and ignored: the creator of a manifest is always its admin.
  @IsOptional()
  rights?: ManifestGroupRights;

  @IsOptional()
  manifest: Manifest;

  // Optional: the creator is always the logged in user. Another user's id is
  // refused with a 403.
  @IsOptional()
  idCreator?: number;

  title: string;

  url: string;

  path: string;
}
