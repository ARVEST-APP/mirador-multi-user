import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as sharp from 'sharp';
import {
  getPeerTubeVideoDetails,
  getPeerTubeVideoID, getVideoDuration,
  getYoutubeJson,
  getYouTubeVideoID,
  isImage,
  isPeerTubeVideo,
  isYouTubeVideo
} from "./utils";

@Injectable()
export class MediaInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { manifestMedias, title, manifestThumbnail } = request.body;
    if (!manifestMedias || !Array.isArray(manifestMedias)) {
      throw new BadRequestException(
        'Manifest media items are required and must be an array.',
      );
    }

    if (!title) {
      throw new BadRequestException('Manifest title is required.');
    }
    // Create the initial structure for the manifest
    const manifestToCreate = {
      '@context': 'https://iiif.io/api/presentation/3/context.json',
      id: '',
      type: 'Manifest',
      label: { en: [title] },
      items: [],
      thumbnail: {
        ['@id']: manifestThumbnail,
        service: {
          ['@context']: manifestThumbnail,
          ['@id']: manifestThumbnail,
          profile: manifestThumbnail,
        },
      },
    };

    const fetchMediaForItem = async (media) => {
      try {
        const url = media.value.replace(
          /^(http|https):\/\/localhost:\d+\//,
          '$1://caddy/',
        );
        let videoId: string | null = null;
        let youtubeJson = null;
        let peertubeVideoJson = null;
        switch (true) {
          case isYouTubeVideo(url):
            videoId = getYouTubeVideoID(url);
            if (videoId) {
              youtubeJson = await getYoutubeJson(url);
              const videoDuration = await getVideoDuration(url);
              const timeStamp = Date.now();
              const timeStamp2 = Date.now();
              const timeStamp3 = Date.now();
              const height = youtubeJson.height;
              const width = youtubeJson.width;
              const duration = videoDuration;
              console.log('youtubeJson');
              console.log(youtubeJson);
              manifestToCreate.items.push({
                id: `https://example.org/${timeStamp}/canvas/${timeStamp2}`,
                type: 'Canvas',
                height,
                width,
                duration,
                label: { en: ['Image Item'] },
                items: [
                  {
                    id: `https://example.org/${timeStamp}/canvas/${timeStamp2}/annotation-page/${timeStamp3}`,
                    type: 'AnnotationPage',
                    items: [
                      {
                        id: `https://example.org/${timeStamp}/annotation/${Date.now()}`,
                        type: 'Annotation',
                        motivation: 'painting',
                        target: `https://example.org/${timeStamp}/canvas/${timeStamp2}`,
                        body: {
                          id: media.value,
                          type: 'Video',
                          format: `Video/MPG`,
                          height,
                          width,
                          duration,
                        },
                      },
                    ],
                  },
                ],
              });
            }
            break;
          case await isPeerTubeVideo(url):
            videoId = getPeerTubeVideoID(url);
            if (videoId) {
              peertubeVideoJson = await getPeerTubeVideoDetails(url, videoId);
              const timeStamp = Date.now();
              const timeStamp2 = Date.now();
              const timeStamp3 = Date.now();
              const defaultHeight = 480;
              const defaultWidth = 854;

              const height =
                peertubeVideoJson.streamingPlaylists?.[0]?.files?.[0]?.height ||
                defaultHeight;
              const width =
                peertubeVideoJson.streamingPlaylists?.[0]?.files?.[0]?.width ||
                defaultWidth;

              const duration = peertubeVideoJson.duration;
              console.log('height');
              console.log(height);
              console.log('width');
              console.log(width);
              console.log('peertubeVideoJson');
              console.log(peertubeVideoJson);
              manifestToCreate.items.push({
                id: `https://example.org/${timeStamp}/canvas/${timeStamp2}`,
                type: 'Canvas',
                height,
                width,
                duration,
                label: { en: ['Image Item'] },
                items: [
                  {
                    id: `https://example.org/${timeStamp}/canvas/${timeStamp2}/annotation-page/${timeStamp3}`,
                    type: 'AnnotationPage',
                    items: [
                      {
                        id: `https://example.org/${timeStamp}/annotation/${Date.now()}`,
                        type: 'Annotation',
                        motivation: 'painting',
                        target: `https://example.org/${timeStamp}/canvas/${timeStamp2}`,
                        body: {
                          id: media.value,
                          type: 'Video',
                          format: `Video/MPG`,
                          height,
                          width,
                          duration,
                        },
                      },
                    ],
                  },
                ],
              });
            }
            break;
          case await isImage(url):
            const response = await fetch(`${url}`, { method: 'GET' });
            const arrayBuffer = await response.arrayBuffer();
            const mediaBuffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('Content-Type');
            const imageMetadata = await sharp(mediaBuffer).metadata();
            const { width, height } = imageMetadata;
            const timeStamp = Date.now();
            const timeStamp2 = Date.now();
            const timeStamp3 = Date.now();
            manifestToCreate.items.push({
              id: `https://example.org/${timeStamp}/canvas/${timeStamp2}`,
              type: 'Canvas',
              height,
              width,
              label: { en: ['Image Item'] },
              items: [
                {
                  id: `https://example.org/${timeStamp}/canvas/${timeStamp2}/annotation-page/${timeStamp3}`,
                  type: 'AnnotationPage',
                  items: [
                    {
                      id: `https://example.org/${timeStamp}/annotation/${Date.now()}`,
                      type: 'Annotation',
                      motivation: 'painting',
                      target: `https://example.org/${timeStamp}/canvas/${timeStamp2}`,
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
          default:
            throw new UnsupportedMediaTypeException(
              'media type is not supported',
            );
            break;
        }
      } catch (error) {
        console.error('error details:', error);
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
