import { IsEnum, IsOptional } from 'class-validator';
import { MediaGroupRights } from '../../../enum/rights';

export class AddMediaToGroupDto {
  userGroupId: number;

  mediasId: number[];

  @IsOptional()
  @IsEnum(MediaGroupRights)
  rights?: MediaGroupRights;
}
