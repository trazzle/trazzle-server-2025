import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DiscordsService {
  private readonly logger = new Logger(DiscordsService.name);
  private readonly discordWebhookUrl: string | undefined;
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.discordWebhookUrl = this.configService.get<string>('app.discordWebhook');
  }
  async sendAlert(errorResponseBody: Record<string, any>) {
    if (!this.discordWebhookUrl) {
      return;
    }

    const embed = {
      title: '🚨 Server Error Alert 🚨',
      color: 16711680, // Red color
      fields: [
        { name: 'Status Code', value: `${errorResponseBody.statusCode}`, inline: true },
        { name: 'Method', value: errorResponseBody.method, inline: true },
        { name: 'Path', value: errorResponseBody.path, inline: false },
        {
          name: 'Message',
          value: Array.isArray(errorResponseBody.message)
            ? errorResponseBody.message.join(', ')
            : `${errorResponseBody.message}`,
          inline: false,
        },
        { name: 'Timestamp', value: errorResponseBody.timestamp, inline: false },
      ],
    };

    const payload = {
      embeds: [embed],
    };

    try {
      await firstValueFrom(this.http.post(this.discordWebhookUrl, payload));
      this.logger.log('Discord alert sent successfully');
    } catch (error) {
      // 실패 시 로깅만 하고 무시
      this.logger.warn('Failed to send Discord alert:', error);
    }
  }
}
