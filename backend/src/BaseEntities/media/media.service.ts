import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateMediaDto } from './dto/update-media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { UserGroup } from '../user-group/entities/user-group.entity';
import { Repository } from 'typeorm';
import { CustomLogger } from '../../utils/Logger/CustomLogger.service';
import { differingFields, pickDefined } from '../../utils/objectFields';

// A creation writes CREATION_FIELDS, and `metadata`, which the service builds.
const CREATION_FIELDS = [
  'title',
  'description',
  'path',
  'hash',
  'url',
  'origin',
  'mediaTypes',
  'idCreator',
] as const;

// A new media as the server builds it: a link has no `path`, an upload no
// `url`, and a link without thumbnail no `hash`.
export type NewMedia = Pick<
  Media,
  'title' | 'description' | 'origin' | 'mediaTypes' | 'idCreator'
> &
  Partial<Pick<Media, 'path' | 'url' | 'hash'>>;
// An update writes EDITABLE_FIELDS only. FIXED_FIELDS serves the warning when
// one is sent with another value.
const EDITABLE_FIELDS = [
  'title',
  'description',
  'thumbnailUrl',
  'metadata',
] as const;
const FIXED_FIELDS = [
  'hash',
  'path',
  'origin',
  'idCreator',
  'url',
  'mediaTypes',
];

@Injectable()
export class MediaService {
  private readonly logger = new CustomLogger();
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(newMedia: NewMedia, creatorGroup: UserGroup) {
    try {
      const media = this.mediaRepository.create({
        ...pickDefined(newMedia, CREATION_FIELDS),
        metadata: { creator: creatorGroup.title },
      });
      return await this.mediaRepository.save(media);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while creating the media',
        error,
      );
    }
  }

  async findAll() {
    try {
      return await this.mediaRepository.find();
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while finding all medias',
        error,
      );
    }
  }

  async findOne(id: number) {
    try {
      return await this.mediaRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while finding the media',
        error,
      );
    }
  }
  async update(id: number, updateMediaDto: UpdateMediaDto, userId: number) {
    try {
      const fields = pickDefined(updateMediaDto, EDITABLE_FIELDS);
      if (Object.keys(fields).length === 0) {
        throw new BadRequestException(
          `Nothing to update: send at least one of ${EDITABLE_FIELDS.join(', ')}`,
        );
      }
      const media = await this.mediaRepository.findOne({ where: { id } });

      if (!media) {
        throw new NotFoundException(`Media with ID ${id} not found`);
      }

      const ignored = differingFields(updateMediaDto, media, FIXED_FIELDS);
      if (ignored.length > 0) {
        this.logger.warn(
          `Update of media ${id} by user ${userId}: ignored ${ignored.join(', ')}, sent with another value than the stored one`,
        );
      }
      Object.assign(media, fields);

      await this.mediaRepository.save(media);

      return this.findOne(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while updating the media',
        error,
      );
    }
  }


  async remove(id: number) {
    try {
      const done = await this.mediaRepository.delete(id);
      if (done.affected != 1) throw new NotFoundException(id);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while removing the media',
        error,
      );
    }
  }

  async findMediasByPartialStringAndUserGroup(
    partialString: string,
    userGroupId: number,
  ) {
    try {
      const partialStringLength = partialString.length;
      return await this.mediaRepository
        .createQueryBuilder('media')
        .innerJoin('media.linkMediaGroup', 'linkMediaGroup')
        .innerJoin('linkMediaGroup.user_group', 'userGroup')
        .where('userGroup.id = :id', { id: userGroupId })
        .andWhere('LEFT(media.title, :length) = :partialString', {
          length: partialStringLength,
          partialString,
        })
        .distinct(true)
        .limit(3)
        .getMany();
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        `An error occurred: ${error.message}`,
      );
    }
  }

  async findOwnedMedia(userId) {
    try {
      return await this.mediaRepository.find({
        where: { idCreator: userId },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(`an error occurred`, error);
    }
  }

}
