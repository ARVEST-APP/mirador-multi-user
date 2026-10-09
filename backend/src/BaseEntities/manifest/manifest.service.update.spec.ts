import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ManifestService } from './manifest.service';
import { Manifest } from './entities/manifest.entity';
import { UpdateManifestDto } from './dto/update-manifest.dto';

describe('ManifestService.update', () => {
  const ID = 4;
  const USER_ID = 12;
  const STORED = {
    id: ID,
    title: 'stored title',
    hash: 'its-folder',
    path: 'its-file.json',
    origin: 'upload',
    idCreator: 2,
    url: null,
  };
  const EDITABLE = {
    title: 'a title',
    description: 'a description',
    thumbnailUrl: 'https://example.org/thumbnail.webp',
    metadata: { creator: 'someone' },
  };
  const update = jest.fn();
  const findOneBy = jest.fn();
  const service = new ManifestService({
    update,
    findOneBy,
  } as unknown as Repository<Manifest>);
  let warn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    update.mockResolvedValue({ affected: 1 });
    findOneBy.mockResolvedValue(STORED);
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates the title, description, thumbnail address and metadata, and no other field of the body', async () => {
    const body = {
      ...EDITABLE,
      id: ID,
      hash: 'another-folder',
      path: 'another-file.json',
      origin: 'link',
      idCreator: 9,
      url: 'https://example.org/manifest.json',
      created_at: '2020-01-01T00:00:00.000Z',
    } as unknown as UpdateManifestDto;

    await expect(service.update(ID, body, USER_ID)).resolves.toBe(STORED);

    expect(update).toHaveBeenCalledWith(ID, EDITABLE);
  });

  it('updates only the fields the body has', async () => {
    await service.update(ID, { id: ID, title: 'a title' }, USER_ID);

    expect(update).toHaveBeenCalledWith(ID, { title: 'a title' });
  });

  it('answers 400 and writes nothing when the body has none of those fields', async () => {
    const body = { id: ID, hash: 'another-folder' };

    await expect(service.update(ID, body, USER_ID)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(update).not.toHaveBeenCalled();
  });

  it('logs one warning naming the user, the manifest and the ignored fields sent with another value', async () => {
    const body = {
      ...EDITABLE,
      id: ID,
      hash: 'another-folder',
      path: STORED.path,
      idCreator: 9,
    } as unknown as UpdateManifestDto;

    await service.update(ID, body, USER_ID);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      `Update of manifest ${ID} by user ${USER_ID}: ignored hash, idCreator, sent with another value than the stored one`,
    );
  });

  it('logs nothing when the other fields are sent back with their stored value', async () => {
    const body = { ...STORED, ...EDITABLE } as unknown as UpdateManifestDto;

    await service.update(ID, body, USER_ID);

    expect(warn).not.toHaveBeenCalled();
  });
});
