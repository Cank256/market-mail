export const validateMarketEmail = (data: any): boolean => {
    const requiredFields = ['Market', 'Date', 'Maize (kg)', 'Beans (kg)', 'Tomatoes (crate)'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            return false;
        }
    }
    
    // Additional validation logic can be added here
    return true;
};

export const validateMarketPriceData = (data: any): boolean => {
    const priceFields = ['Maize (kg)', 'Beans (kg)', 'Tomatoes (crate)'];
    
    for (const field of priceFields) {
        if (typeof data[field] !== 'number' || data[field] < 0) {
            return false;
        }
    }
    
    return true;
};