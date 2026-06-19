/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { iiifProviderService } from './iiif-provider.service';

@Controller('iiif-provider')
export class iiifProviderController {
    constructor(private readonly iiifProviderService: iiifProviderService) { }

    @Post('/search')
    search(@Body() { provider, params }: { provider: string, params: string }) {
        return this.iiifProviderService.search(provider, new URLSearchParams(params));
    }
}

