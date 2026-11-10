import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as sharp from 'sharp';
import * as request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { LinkMediaGroupController } from '../LinkModules/link-media-group/link-media-group.controller';
import { LinkMediaGroupService } from '../LinkModules/link-media-group/link-media-group.service';
import { LinkManifestGroupController } from '../LinkModules/link-manifest-group/link-manifest-group.controller';
import { LinkManifestGroupService } from '../LinkModules/link-manifest-group/link-manifest-group.service';

// Through a real Nest application, so that the forms go through FileInterceptor
// and multer as in production.
describe('Upload forms', () => {
  const CALLER = 7;
  const createMedia = jest.fn().mockResolvedValue({ id: 1 });
  const createManifest = jest.fn().mockResolvedValue({ id: 2 });

  let app: INestApplication;
  let startDir: string;
  let workDir: string;
  let image: Buffer;

  // Brackets in a value or a file name are allowed: only field names are limited.
  const userGroup = JSON.stringify({ id: 70, title: 'group foo[bar]' });
  const routes = [
    {
      url: '/link-media-group/media/upload',
      create: createMedia,
      file: () => ({ content: image, name: 'scan[1].png' }),
    },
    {
      url: '/link-manifest-group/manifest/upload',
      create: createManifest,
      file: () => ({ content: Buffer.from('{}'), name: 'scan[1].json' }),
    },
  ];

  beforeAll(async () => {
    // The upload folder is relative to the working directory.
    startDir = process.cwd();
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-forms-'));
    process.chdir(workDir);

    image = await sharp({
      create: { width: 2, height: 2, channels: 3, background: '#ffffff' },
    })
      .png()
      .toBuffer();

    const module = await Test.createTestingModule({
      controllers: [LinkMediaGroupController, LinkManifestGroupController],
      providers: [
        { provide: LinkMediaGroupService, useValue: { createMedia } },
        { provide: LinkManifestGroupService, useValue: { createManifest } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: CALLER };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.chdir(startDir);
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each(routes)('POST $url', ({ url, create, file }) => {
    const upload = () =>
      request(app.getHttpServer()).post(url).field('idCreator', `${CALLER}`);

    it('accepts the form the frontends send, with brackets in a value and in the file name', async () => {
      const { content, name } = file();

      await upload()
        .field('user_group', userGroup)
        .attach('file', content, name)
        .expect(201);

      expect(create).toHaveBeenCalledTimes(1);
      expect(create.mock.calls[0][0].title).toBe(name);
    });

    it.each(['user[name]', 'list[]', 'list[999999999]'])(
      'refuses a field named %s',
      async (fieldName) => {
        const { content, name } = file();

        const answer = await upload()
          .field(fieldName, '1')
          .attach('file', content, name);

        expect(answer.status).toBeGreaterThanOrEqual(400);
        expect(create).not.toHaveBeenCalled();
      },
    );

    it('refuses more than ten fields', async () => {
      let form = upload();
      for (let i = 0; i < 10; i++) {
        form = form.field(`field${i}`, '1');
      }
      const { content, name } = file();

      await form.attach('file', content, name).expect(400);

      expect(create).not.toHaveBeenCalled();
    });
  });
});
