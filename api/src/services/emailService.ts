import { config } from '../config';
import { ServerClient } from 'postmark';

interface EmailOptions {
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  replyTo?: string;
  tag?: string;
  messageStream?: string;
  trackOpens?: boolean;
  trackLinks?: string;
  metadata?: Record<string, string>;
}

export class EmailService {
  private static client: ServerClient;

  /**
   * Initialize the Postmark client
   */
  static initialize(): void {
    if (!EmailService.client) {
      EmailService.client = new ServerClient(config.POSTMARK_SERVER_TOKEN);
    }
  }

  /**
   * Send an email using Postmark
   * @param options Email sending options
   * @returns The result from Postmark API
   */
  static async sendEmail(options: EmailOptions): Promise<any> {
    // Initialize client if not already done
    if (!EmailService.client) {
      EmailService.initialize();
    }

    // Verify required configuration
    if (!config.POSTMARK_SERVER_TOKEN) {
      throw new Error('Postmark server token is not configured');
    }

    try {
      const response = await EmailService.client.sendEmail({
        From: 'marketmail@example.com',
        To: options.to,
        Subject: options.subject,
        TextBody: options.textBody,
        HtmlBody: options.htmlBody,
        ReplyTo: options.replyTo,
        Tag: options.tag,
        MessageStream: options.messageStream,
        TrackOpens: options.trackOpens,
        TrackLinks: options.trackLinks as any,
        Metadata: options.metadata
      });

      return response;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Send a confirmation email with the formatted market data
   * @param to Recipient email address
   * @param subject Email subject
   * @param htmlContent HTML content of the email
   * @param textContent Plain text content of the email
   * @returns The result from Postmark API
   */
  static async sendConfirmation(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<any> {
    return await EmailService.sendEmail({
      to,
      subject,
      htmlBody: htmlContent,
      textBody: textContent,
      tag: 'market-confirmation',
      trackOpens: true
    });
  }

  /**
   * Send an error notification to a user when their submission had issues
   * @param to Recipient email address
   * @param error Error message or reason for failure
   * @returns The result from Postmark API
   */
  static async sendErrorNotification(to: string, error: string): Promise<any> {
    const subject = 'Unable to Process Your Market Price Submission';
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>We Couldn't Process Your Market Price Submission</h2>
        <p>We encountered an issue while trying to process your recent market price submission:</p>
        <div style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #e74c3c; margin: 15px 0;">
          <p style="margin: 0;"><strong>Error:</strong> ${error}</p>
        </div>
        <h3>Submission Format</h3>
        <p>Please ensure your submission follows this format:</p>
        <pre style="background-color: #f8f8f8; padding: 15px; font-family: monospace;">
Market: [Market Name]
Date: [YYYY-MM-DD]

[Product Name] ([Unit]): [Price]
[Product Name] ([Unit]): [Price]
...
        </pre>
        <p>Example:</p>
        <pre style="background-color: #f8f8f8; padding: 15px; font-family: monospace;">
Market: Kampala Central Market
Date: 2023-09-15

Maize (kg): 1200
Beans (kg): 3500
Tomatoes (crate): 45000
        </pre>
        <p>Please try submitting your data again with the correct format.</p>
        <p>Need help? Reply to this email and we'll assist you.</p>
      </div>
    `;
    
    const textBody = `
We Couldn't Process Your Market Price Submission

We encountered an issue while trying to process your recent market price submission:

Error: ${error}

Submission Format
----------------
Please ensure your submission follows this format:

Market: [Market Name]
Date: [YYYY-MM-DD]

[Product Name] ([Unit]): [Price]
[Product Name] ([Unit]): [Price]
...

Example:
Market: Kampala Central Market
Date: 2023-09-15

Maize (kg): 1200
Beans (kg): 3500
Tomatoes (crate): 45000

Please try submitting your data again with the correct format.
Need help? Reply to this email and we'll assist you.
    `;
    
    return await EmailService.sendEmail({
      to,
      subject,
      htmlBody,
      textBody,
      tag: 'market-error',
      trackOpens: true
    });
  }
}