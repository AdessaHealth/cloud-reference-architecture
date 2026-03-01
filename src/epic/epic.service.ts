import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EpicService implements OnModuleInit {
  private readonly logger = new Logger(EpicService.name);
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  private readonly fhirBaseUrl = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';
  private readonly authUrl = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize';
  private readonly tokenUrl = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.clientId = this.configService.get<string>('EPIC_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('EPIC_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>('EPIC_REDIRECT_URI');
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'patient/*.read',
      state: 'secure-state-string',
    });
    return `${this.authUrl}?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<any> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
    });
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await firstValueFrom(
      this.httpService.post(this.tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }),
    );
    return response.data;
  }
}
