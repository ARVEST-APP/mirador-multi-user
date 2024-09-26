import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import fetch from 'node-fetch';
import * as sharp from 'sharp'; // Import sharp

@Injectable()
export class MediaInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { manifestMedias, name } = request.body;

    if (!manifestMedias || !Array.isArray(manifestMedias)) {
      throw new BadRequestException(
        'Manifest media items are required and must be an array.',
      );
    }

    if (!name) {
      throw new BadRequestException('Manifest name is required.');
    }

    // Create the initial structure for the manifest
    const manifestToCreate = {
      '@context': 'https://iiif.io/api/presentation/3/context.json',
      id: '',
      type: 'Manifest',
      label: { en: [name] },
      items: [],
    };

    // Helper function to process each media item
    const fetchMediaForItem = async (media) => {
      try {
        const response = await fetch(media.value, { method: 'GET' });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convert the response to buffer
        const arrayBuffer = await response.arrayBuffer();
        const mediaBuffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('Content-Type');

        // Process image data
        if (contentType && contentType.startsWith('image')) {
          const imageMetadata = await sharp(mediaBuffer).metadata();
          const { width, height } = imageMetadata;

          manifestToCreate.items.push({
            id: media.value,
            type: 'Canvas',
            height,
            width,
            label: { en: ['Image Item'] },
            items: [
              {
                id: `${media.value}/annotation/${Date.now()}`,
                type: 'AnnotationPage',
                items: [
                  {
                    id: `${media.value}/annotation/${Date.now()}`,
                    type: 'Annotation',
                    motivation: 'painting',
                    target: media.value,
                    body: {
                      id: media.value,
                      type: 'Image',
                      format: `Image/${contentType}`,
                      height,
                      width,
                    },
                  },
                ],
              },
            ],
          });
        } else {
          throw new BadRequestException(
            'Unsupported media type or media processing error',
          );
        }
      } catch (error) {
        throw new BadRequestException(`Error fetching media: ${error.message}`);
      }
    };

    await Promise.all(
      manifestMedias.flatMap((item) =>
        item.media.map((media) => fetchMediaForItem(media)),
      ),
    );

    request.body.processedManifest = manifestToCreate;

    return next.handle();
  }
}
