
export interface BankInfo {
    id: string;
    name: string;
    brandColor: string;
    textColor: string;
    logoType: 'text' | 'svg';
    logoContent: string;
}

export const SUPPORTED_BANKS: BankInfo[] = [
    {
        id: 'bca',
        name: 'Bank Central Asia',
        brandColor: '#005dab',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'BCA'
    },
    {
        id: 'mandiri',
        name: 'Bank Mandiri',
        brandColor: '#003d79',
        textColor: '#ffc220',
        logoType: 'text',
        logoContent: 'mandiri'
    },
    {
        id: 'bni',
        name: 'Bank Negara Indonesia',
        brandColor: '#005e6a',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'BNI'
    },
    {
        id: 'bri',
        name: 'Bank Rakyat Indonesia',
        brandColor: '#00529c',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'BRI'
    },
    {
        id: 'bsi',
        name: 'Bank Syariah Indonesia',
        brandColor: '#00a491',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'BSI'
    },
    {
        id: 'cimb',
        name: 'CIMB Niaga',
        brandColor: '#da251c',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'CIMB NIAGA'
    },
    {
        id: 'permata',
        name: 'Permata Bank',
        brandColor: '#afc045',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'Permata'
    },
    {
        id: 'dana',
        name: 'DANA',
        brandColor: '#008ced',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'DANA'
    },
    {
        id: 'ovo',
        name: 'OVO',
        brandColor: '#4d2a86',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'OVO'
    },
    {
        id: 'gopay',
        name: 'GoPay',
        brandColor: '#00bbd3',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'gopay'
    },
    {
        id: 'shopeepay',
        name: 'ShopeePay',
        brandColor: '#ee4d2d',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'ShopeePay'
    },
    {
        id: 'linkaja',
        name: 'LinkAja',
        brandColor: '#e12127',
        textColor: '#ffffff',
        logoType: 'text',
        logoContent: 'LinkAja!'
    }
];

export const getBankById = (id: string) => SUPPORTED_BANKS.find(b => b.id === id);

export const getBankByName = (name: string) => {
    if (!name) return null;
    const lowerName = name.toLowerCase();
    return SUPPORTED_BANKS.find(b =>
        b.name.toLowerCase().includes(lowerName) ||
        b.id.toLowerCase() === lowerName ||
        b.logoContent.toLowerCase() === lowerName
    );
};
