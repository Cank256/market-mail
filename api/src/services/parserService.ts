import { parseMarketEmail } from './parseMarketEmail';

interface PriceItem {
  product: string;
  unit: string;
  price: number;
}

interface MarketData {
  country: string;
  market: string;
  date: Date;
  submitterEmail: string;
  priceItems: PriceItem[];
  messageId?: string;
  originalRecipient?: string;
  subject?: string;
}

interface PostmarkInboundWebhook {
  FromFull: {
    Email: string;
  };
  TextBody: string;
  Subject: string;
  MessageID: string;
  OriginalRecipient: string;
  // Additional fields omitted for brevity
}

export class ParserService {
  /**
   * Parse an inbound Postmark webhook payload to extract market price data
   * @param webhookPayload The Postmark inbound webhook payload
   * @returns Parsed market data
   */
  static async parse(webhookPayload: PostmarkInboundWebhook): Promise<MarketData> {
    if (!webhookPayload || !webhookPayload.TextBody || !webhookPayload.FromFull?.Email) {
      throw new Error('Invalid webhook payload: missing required fields');
    }

    const emailContent = webhookPayload.TextBody;
    const fromEmail = webhookPayload.FromFull.Email;

    try {
      // Use our existing parsing function to extract market data
      const marketData = await parseMarketEmail(emailContent, fromEmail);
      
      // Add additional metadata from the webhook if needed
      return {
        ...marketData,
        messageId: webhookPayload.MessageID,
        originalRecipient: webhookPayload.OriginalRecipient,
        subject: webhookPayload.Subject
      };
    } catch (error) {
      console.error('Failed to parse market email:', error);
      throw new Error(`Failed to parse email: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Format market data into a readable HTML table
   * @param marketData The parsed market data
   * @returns HTML content with a formatted table
   */
  static formatToHtml(marketData: MarketData): string {
    const tableRows = marketData.priceItems.map(item => {
      return `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.product}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.price}</td>
      </tr>`;
    }).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Market Price Data Processed</h2>
        <p>Thank you for submitting prices for <strong>${marketData.market}</strong> in <strong>${marketData.country}</strong> on <strong>${marketData.date.toDateString()}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Unit</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <p style="margin-top: 20px;">Your contribution helps farmers and traders make informed decisions.</p>
        <p>Access the latest market data at: <a href="https://marketmail.example.com">MarketMail Dashboard</a></p>
      </div>
    `;
  }

  /**
   * Format market data into a plain text table
   * @param marketData The parsed market data
   * @returns Plain text content with a formatted table
   */
  static formatToText(marketData: MarketData): string {
    const header = `COUNTRY: ${marketData.country}\nMARKET: ${marketData.market} - DATE: ${marketData.date.toDateString()}\n\n`;
    const divider = '----------------------------------------\n';
    const tableHeader = 'PRODUCT          UNIT          PRICE\n';
    
    const rows = marketData.priceItems.map(item => {
      // Format each column to have consistent width
      const product = item.product.padEnd(18);
      const unit = item.unit.padEnd(14);
      return `${product}${unit}${item.price}`;
    }).join('\n');

    return `${header}${divider}${tableHeader}${divider}${rows}\n\n${divider}
Thank you for contributing to MarketMail!
Access the dashboard at: https://marketmail.example.com
`;
  }
}