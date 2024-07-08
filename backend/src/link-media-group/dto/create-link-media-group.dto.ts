import { MediaGroupRights } from '../../enum/media-group-rights';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Media } from '../../media/entities/media.entity';
import { UserGroup } from '../../user-group/entities/user-group.entity';

export class CreateLinkMediaGroupDto {
  @IsEnum(MediaGroupRights)
  @IsNotEmpty()
  rights: MediaGroupRights;

  media: Media;

  user_group: UserGroup;
}
