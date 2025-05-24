import { generateReport } from '../../src/services/report';
import { MarketPrice } from '../../src/models/MarketPrice';

describe('Report Generation', () => {
    let mockData;

    beforeEach(() => {
        mockData = [
            { market: 'Nakasero', date: new Date('2025-05-24'), price: 1800, item: 'Maize' },
            { market: 'Nakasero', date: new Date('2025-05-24'), price: 2900, item: 'Beans' },
            { market: 'Nakasero', date: new Date('2025-05-24'), price: 9500, item: 'Tomatoes' },
        ];
    });

    it('should generate a report with correct price deltas', () => {
        const report = generateReport(mockData);
        expect(report).toHaveProperty('market');
        expect(report.market).toBe('Nakasero');
        expect(report.prices).toHaveLength(3);
        expect(report.prices[0]).toHaveProperty('item', 'Maize');
        expect(report.prices[0]).toHaveProperty('price', 1800);
    });

    it('should handle empty data gracefully', () => {
        const report = generateReport([]);
        expect(report).toHaveProperty('market');
        expect(report.market).toBe('Nakasero');
        expect(report.prices).toHaveLength(0);
    });

    it('should calculate price deltas correctly', () => {
        const previousData = [
            { market: 'Nakasero', date: new Date('2025-05-17'), price: 1700, item: 'Maize' },
            { market: 'Nakasero', date: new Date('2025-05-17'), price: 2800, item: 'Beans' },
            { market: 'Nakasero', date: new Date('2025-05-17'), price: 9000, item: 'Tomatoes' },
        ];
        const report = generateReport(mockData, previousData);
        expect(report.prices[0]).toHaveProperty('delta', 100);
        expect(report.prices[1]).toHaveProperty('delta', 100);
        expect(report.prices[2]).toHaveProperty('delta', 500);
    });
});