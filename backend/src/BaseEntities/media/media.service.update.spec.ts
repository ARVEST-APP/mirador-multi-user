import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';
import { UpdateMediaDto } from './dto/update-media.dto';

describe('MediaService.update', () => {
  const ID = 4;
  const USER_ID = 12;
  const stored = () => ({
    id: ID,
    title: 'stored title',
    description: 'stored description',
    hash: 'its-folder',
    path: 'its-file.png',
    origin: 'upload',
    mediaTypes: 'image',
    idCreator: 2,
    url: null,
  });
  const EDITABLE = {
    title: 'a title',
    description: 'a description',
    thumbnailUrl: 'https://example.org/thumbnail.webp',
    metadata: { creator: 'someone' },
  };
  const save = jest.fn();
  const findOne = jest.fn();
  const service = new MediaService({
    save,
    findOne,
    findOneBy: jest.fn(),
  } as unknown as Repository<Media>);
  let warn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    findOne.mockImplementation(async () => stored());
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
      path: 'another-file.png',
      origin: 'link',
      mediaTypes: 'video',
      idCreator: 9,
      url: 'https://example.org/image.png',
    } as unknown as UpdateMediaDto;

    await service.update(ID, body, USER_ID);

    expect(save).toHaveBeenCalledWith({ ...stored(), ...EDITABLE });
  });

  it('answers 400 and writes nothing when the body has none of those fields', async () => {
    const body = { id: ID, hash: 'another-folder' } as UpdateMediaDto;

    await expect(service.update(ID, body, USER_ID)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(save).not.toHaveBeenCalled();
  });

  it('logs one warning naming the user, the media and the ignored fields sent with another value', async () => {
    const body = {
      ...EDITABLE,
      id: ID,
      hash: 'another-folder',
      path: stored().path,
      mediaTypes: 'video',
    } as unknown as UpdateMediaDto;

    await service.update(ID, body, USER_ID);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      `Update of media ${ID} by user ${USER_ID}: ignored hash, mediaTypes, sent with another value than the stored one`,
    );
  });

  it('logs nothing when the other fields are sent back with their stored value', async () => {
    const body = { ...stored(), ...EDITABLE } as unknown as UpdateMediaDto;

    await service.update(ID, body, USER_ID);

    expect(warn).not.toHaveBeenCalled();
  });
});
