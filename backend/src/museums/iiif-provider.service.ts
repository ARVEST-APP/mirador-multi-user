/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';


enum NAVIGART_MUSEUMS {
    fracs = "123",
    centrepompidou = "13",
    cnap = "3",
    mamvp = "7",
    picasso = "5",
};

@Injectable()
export class iiifProviderService {

    async search(provider: string, params: URLSearchParams) {
        let provider_prefix: string;
        switch (provider) {
            case "bnf":
                provider_prefix = `https://gallica.bnf.fr/SRU`;
                break;
            case "fracs":
            case "centrepompidou":
            case "cnap":
            case "mamvp":
            case "picasso":
                provider_prefix = `https://api.navigart.fr/${NAVIGART_MUSEUMS[provider]}/artworks`
                break;
            default:
                throw new Error(`${provider} is not part of the accesible iiif manifest providers.`)
        }

        const response = await fetch(`${provider_prefix}?${params}`);

        if (!response.ok) {
            throw new Error(`Erreur ${provider}: ${response.status}`);
        }

        return await response.text();
    }
}
