
const CURRENCY_MAP: Record<string, { currency: string; symbol: string; rate: number }> = {
    'BJ': { currency: 'XOF', symbol: 'CFA', rate: 1 },
    'CI': { currency: 'XOF', symbol: 'CFA', rate: 1 },
    'SN': { currency: 'XOF', symbol: 'CFA', rate: 1 },
    'TG': { currency: 'XOF', symbol: 'CFA', rate: 1 },
    'ML': { currency: 'XOF', symbol: 'CFA', rate: 1 },
    'BF': { currency: 'XOF', symbol: 'CFA', rate: 1 },
    'NE': { currency: 'XOF', symbol: 'CFA', rate: 1 },
    'FR': { currency: 'EUR', symbol: '€', rate: 0.0015 },
    'US': { currency: 'USD', symbol: '$', rate: 0.0016 },
    'DEFAULT': { currency: 'XOF', symbol: 'CFA', rate: 1 },
};

export interface PriceInfo {
    currency: string;
    symbol: string;
    amount: number;
}

export const getCurrencyInfo = async (): Promise<{ currency: string; symbol: string; rate: number }> => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        return CURRENCY_MAP[countryCode] || CURRENCY_MAP['DEFAULT'];
    } catch (error) {
        console.error('[BookAIO] Erreur détection IP:', error);
        return CURRENCY_MAP['DEFAULT'];
    }
};

export const formatPrice = (amountFcfa: number, rate: number, symbol: string): string => {
    const converted = Math.ceil(amountFcfa * rate);
    return `${converted.toLocaleString()} ${symbol}`;
};
