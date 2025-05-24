import { parseMarketEmail } from '../../src/parseMarketEmail';

describe('parseMarketEmail', () => {
    it('should correctly parse a valid market email', () => {
        const emailBody = `
            Market: Nakasero
            Date: 2025-05-24
            Maize (kg): 1800
            Beans (kg): 2900
            Tomatoes (crate): 9500
        `;

        const expectedOutput = {
            market: 'Nakasero',
            date: new Date('2025-05-24'),
            prices: {
                maize: 1800,
                beans: 2900,
                tomatoes: 9500,
            },
        };

        const result = parseMarketEmail(emailBody);
        expect(result).toEqual(expectedOutput);
    });

    it('should return null for an invalid email format', () => {
        const invalidEmailBody = `
            Invalid format
        `;

        const result = parseMarketEmail(invalidEmailBody);
        expect(result).toBeNull();
    });

    it('should handle missing fields gracefully', () => {
        const emailBody = `
            Market: Nakasero
            Date: 2025-05-24
            Maize (kg): 1800
        `;

        const expectedOutput = {
            market: 'Nakasero',
            date: new Date('2025-05-24'),
            prices: {
                maize: 1800,
                beans: undefined,
                tomatoes: undefined,
            },
        };

        const result = parseMarketEmail(emailBody);
        expect(result).toEqual(expectedOutput);
    });
});