import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateManifestDto } from './dto/create-manifest.dto';
import { UpdateManifestDto } from './dto/update-manifest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Manifest } from './entities/manifest.entity';
import { Repository } from 'typeorm';
import { CustomLogger } from '../../utils/Logger/CustomLogger.service';
import { differingFields, pickDefined } from '../../utils/objectFields';

// An update writes EDITABLE_FIELDS only. FIXED_FIELDS serves the warning when
// one is sent with another value.
const EDITABLE_FIELDS = [
  'title',
  'description',
  'thumbnailUrl',
  'metadata',
] as const;
const FIXED_FIELDS = ['hash', 'path', 'origin', 'idCreator', 'url'];

@Injectable()
export class ManifestService {
  private readonly logger = new CustomLogger();

  constructor(
    @InjectRepository(Manifest)
    private readonly manifestRepository: Repository<Manifest>,
  ) {}

  async create(createManifestDto: CreateManifestDto) {
    try {
      const manifest = this.manifestRepository.create({ ...createManifestDto });
      return await this.manifestRepository.save(manifest);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        `an error occurred while creating manifest, ${error.message}`,
      );
    }
  }

  findAll() {
    return `This action returns all manifest`;
  }

  async findOne(manifestId: number) {
    try {
      return await this.manifestRepository.findOneBy({ id: manifestId });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        `an error occurred while finding manifest with id ${manifestId}`,
        error.message,
      );
    }
  }

  async update(
    id: number,
    updateManifestDto: UpdateManifestDto,
    userId: number,
  ) {
    try {
      const fields = pickDefined(updateManifestDto, EDITABLE_FIELDS);
      if (Object.keys(fields).length === 0) {
        throw new BadRequestException(
          `Nothing to update: send at least one of ${EDITABLE_FIELDS.join(', ')}`,
        );
      }
      const stored = await this.findOne(id);
      if (!stored) throw new NotFoundException(id);
      const ignored = differingFields(updateManifestDto, stored, FIXED_FIELDS);
      if (ignored.length > 0) {
        this.logger.warn(
          `Update of manifest ${id} by user ${userId}: ignored ${ignored.join(', ')}, sent with another value than the stored one`,
        );
      }
      const done = await this.manifestRepository.update(id, fields);
      if (done.affected != 1) throw new NotFoundException(id);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        `An error occurred while updating the manifest with id ${id}`,
        error.message,
      );
    }
  }

  async remove(id: number) {
    try {
      const done = await this.manifestRepository.delete(id);
      if (done.affected != 1) throw new NotFoundException(id);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        `An error occured while removing manifest with id : ${id}`,
        error.message,
      );
    }
  }

  async findOwnedManifests(userId) {
    try {
      return await this.manifestRepository.find({
        where: { idCreator: userId },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(`an error occurred`, error);
    }
  }

  async findManifestsByPartialStringAndUserGroup(
    partialString: string,
    userGroupId: number,
  ) {
    try {
      const partialStringLength = partialString.length;
      return await this.manifestRepository
        .createQueryBuilder('manifest')
        .innerJoin('manifest.linkManifestGroup', 'linkManifestGroup')
        .innerJoin('linkManifestGroup.user_group', 'userGroup')
        .where('userGroup.id = :id', { id: userGroupId })
        .andWhere('LEFT(manifest.title, :length) = :partialString', {
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
}
