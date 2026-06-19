import { Module } from '@nestjs/common';

import { iiifProviderController } from './iiif-provider.controller';
import { iiifProviderService } from './iiif-provider.service';

@Module({
    controllers: [iiifProviderController],
    providers: [iiifProviderService],
})
export class iiifProviderModule { }

