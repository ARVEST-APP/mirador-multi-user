import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinkMetadataFormatGroupController } from './link-metadata-format-group.controller';
import { LinkMetadataFormatGroupService } from './link-metadata-format-group.service';
import { LinkMetadataFormatGroup } from './entities/link-metadata-format-group.entity';
import { CreateLinkMetadataFormatGroupDto } from './dto/create-link-metadata-format-group.dto';
import { MetadataFormatService } from '../../BaseEntities/metadata-format/metadata-format.service';
import { MetadataFormat } from '../../BaseEntities/metadata-format/entities/metadata-format.entity';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';

describe('LinkMetadataFormatGroupController: creating a metadata format', () => {
  const CALLER = 7;
  const OTHER_USER = 8;
  const FORMAT = { title: 'a title', metadata: [{ term: 'creator' }] };

  const save = jest.fn(async (format) => ({ ...format, id: 700 }));
  const groupService = {
    findUserPersonalGroup: jest.fn(async () => ({ id: 70 })),
  };
  const service = new LinkMetadataFormatGroupService(
    {} as Repository<LinkMetadataFormatGroup>,
    new MetadataFormatService({
      save,
    } as unknown as Repository<MetadataFormat>),
    groupService as unknown as UserGroupService,
  );
  const controller = new LinkMetadataFormatGroupController(service);
  const createFormat = (body: object) =>
    controller.create(
      { ...FORMAT, ...body } as CreateLinkMetadataFormatGroupDto,
      { user: { sub: CALLER } },
    );

  let warn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(service, 'create').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("saves the title and metadata with the caller as creator, in the caller's personal group, and no other field of the body", async () => {
    await createFormat({ id: 800 });

    expect(save).toHaveBeenCalledWith({ ...FORMAT, creatorId: CALLER });
    expect(groupService.findUserPersonalGroup).toHaveBeenCalledWith(CALLER);
    expect(service.create).toHaveBeenCalledWith(
      { ...FORMAT, creatorId: CALLER, id: 700 },
      { id: 70 },
    );
  });

  it('answers 403, saves nothing and logs one warning when the body names another creator', async () => {
    await expect(
      (async () => createFormat({ creatorId: OTHER_USER }))(),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(save).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      `Creation of a metadata format refused: user ${CALLER} names user ${OTHER_USER} as owner`,
    );
  });
});
