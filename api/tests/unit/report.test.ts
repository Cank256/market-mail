import { ReportService } from '../../src/services/report';
import { MarketPrice } from '../../src/models/MarketPrice';

describe('Report Generation', () => {
    let mockData;

    beforeEach(() => {
        mockData = [
            {
                market: 'Nakasero',
                date: new Date('2025-05-24'),
                submitterEmail: 'test@example.com',
                priceItems: [
                    { product: 'Maize', unit: 'kg', price: 1800 },
                    { product: 'Beans', unit: 'kg', price: 2900 },
                    { product: 'Tomatoes', unit: 'crate', price: 9500 }
                ]
            }
        ];
    });

    it('should generate a market summary with correct data', async () => {
        // Mock the MarketPrice.findWithOptions method
        jest.spyOn(MarketPrice, 'findWithOptions').mockResolvedValue(mockData);
        
        const startDate = new Date('2025-05-24');
        const endDate = new Date('2025-05-24');
        
        const summary = await ReportService.generateMarketSummary('Nakasero', startDate, endDate);
        
        expect(summary).toHaveProperty('market', 'Nakasero');
        expect(summary).toHaveProperty('totalSubmissions', 1);
        expect(summary).toHaveProperty('uniqueProducts', 3);
        expect(summary.products).toHaveLength(3);
        expect(summary.products[0]).toHaveProperty('product', 'Maize');
        expect(summary.products[0]).toHaveProperty('averagePrice', 1800);
    });

    it('should handle empty data gracefully', async () => {
        // Mock empty data
        jest.spyOn(MarketPrice, 'findWithOptions').mockResolvedValue([]);
        
        const startDate = new Date('2025-05-24');
        const endDate = new Date('2025-05-24');
        
        await expect(ReportService.generateMarketSummary('Nakasero', startDate, endDate))
            .rejects.toThrow('No data found for market Nakasero in the specified date range');
    });
});