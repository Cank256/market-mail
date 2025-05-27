import { config } from '../config';
import axios from 'axios';
import { z } from 'zod';

// Define a schema for validation
const PriceItemSchema = z.object({
  product: z.string(),
  unit: z.string(),
  price: z.number().positive()
});

const MarketDataSchema = z.object({
  market: z.string(),
  date: z.date(),
  submitterEmail: z.string().email(),
  priceItems: z.array(PriceItemSchema)
});

type PriceItem = z.infer<typeof PriceItemSchema>;
type MarketData = z.infer<typeof MarketDataSchema>;

/**
 * Parse market price data from an email using regex pattern matching
 */
export async function parseMarketEmail(emailContent: string, fromEmail: string): Promise<MarketData> {
  try {
    // Try regex parsing first
    const result = parseWithRegex(emailContent, fromEmail);
    
    // If OpenAI is enabled and regex parsing failed or found less than 2 items
    if (config.USE_OPENAI && (!result || result.priceItems.length < 2)) {
      return await parseWithOpenAI(emailContent, fromEmail);
    }

    return result;
  } catch (error: any) {
    console.error('Error parsing market email:', error);
    throw new Error(`Failed to parse email content: ${error.message}`);
  }
}

/**
 * Parse the email using regex patterns
 */
function parseWithRegex(emailContent: string, fromEmail: string): MarketData {
  // Extract market name
  const marketMatch = emailContent.match(/Market:\s*([^\n]+)/i);
  const market = marketMatch ? marketMatch[1].trim() : null;

  // Extract date
  const dateMatch = emailContent.match(/Date:\s*([^\n]+)/i);
  let date = new Date();
  if (dateMatch) {
    const dateString = dateMatch[1].trim();
    const parsedDate = new Date(dateString);
    
    if (!isNaN(parsedDate.getTime())) {
      date = parsedDate;
    }
  }

  // Extract price items
  const priceItems: PriceItem[] = [];
  const priceItemRegex = /^([^(\n\r]+?)\s*\(([^)]+)\):\s*([0-9\s]+)/gm;
  
  let match;
  while ((match = priceItemRegex.exec(emailContent)) !== null) {
    const product = match[1].trim();
    const unit = match[2].trim();
    const priceString = match[3].trim().replace(/\s+/g, '');
    const price = parseInt(priceString, 10);

    if (!isNaN(price)) {
      priceItems.push({ product, unit, price });
    }
  }

  // If we couldn't extract required data, throw an error
  if (!market) {
    throw new Error('Could not extract market name from email');
  }

  if (priceItems.length === 0) {
    throw new Error('Could not extract any price items from email');
  }

  // Validate and return the data
  return MarketDataSchema.parse({
    market,
    date,
    submitterEmail: fromEmail,
    priceItems
  });
}

/**
 * Parse the email using OpenAI's function calling API
 */
async function parseWithOpenAI(emailContent: string, fromEmail: string): Promise<MarketData> {
  if (!config.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo-0613',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts structured market price data from emails.'
          },
          {
            role: 'user',
            content: emailContent
          }
        ],
        functions: [
          {
            name: 'extractMarketData',
            description: 'Extract market price data from the email',
            parameters: {
              type: 'object',
              properties: {
                market: {
                  type: 'string',
                  description: 'The name of the market'
                },
                date: {
                  type: 'string',
                  description: 'The date in YYYY-MM-DD format'
                },
                priceItems: {
                  type: 'array',
                  description: 'List of products with their prices',
                  items: {
                    type: 'object',
                    properties: {
                      product: {
                        type: 'string',
                        description: 'The name of the product'
                      },
                      unit: {
                        type: 'string',
                        description: 'The unit of measurement (kg, crate, etc.)'
                      },
                      price: {
                        type: 'number',
                        description: 'The price in local currency'
                      }
                    },
                    required: ['product', 'unit', 'price']
                  }
                }
              },
              required: ['market', 'date', 'priceItems']
            }
          }
        ],
        function_call: { name: 'extractMarketData' }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.choices[0].message.function_call;
    if (result && result.name === 'extractMarketData') {
      const extractedData = JSON.parse(result.arguments);
      
      // Convert the date string to a Date object
      const dateObj = new Date(extractedData.date);
      
      // Validate and return the data
      return MarketDataSchema.parse({
        market: extractedData.market,
        date: dateObj,
        submitterEmail: fromEmail,
        priceItems: extractedData.priceItems
      });
    } else {
      throw new Error('Failed to extract market data with OpenAI');
    }
  } catch (error: any) {
    console.error('Error using OpenAI for parsing:', error);
    throw new Error(`OpenAI parsing failed: ${error.message}`);
  }
}