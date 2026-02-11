export interface QuoteItem {
    id: string;
    text: string;
    textArabic?: string;
    author: string;
    category: 'quran' | 'international';
}

export const QUOTES_LIBRARY: QuoteItem[] = [
    // Al-Quran Quotes about Marriage
    {
        id: 'quran-1',
        textArabic: 'سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا مِمَّا تُنبِتُ الْأَرْضُ وَمِنْ أَنفُسِهِمْ وَمِمَّا لَا يَعْلَمُونَ',
        text: 'Maha Suci Tuhan yang telah menciptakan pasangan-pasangan semuanya, baik dari apa yang ditumbuhkan oleh bumi dan dari diri mereka maupun dari apa yang tidak mereka ketahui.',
        author: 'QS. Yasin: 36',
        category: 'quran'
    },
    {
        id: 'quran-2',
        textArabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
        text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
        author: 'QS. Ar-Rum: 21',
        category: 'quran'
    },
    {
        id: 'quran-3',
        textArabic: 'هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ',
        text: 'Mereka adalah pakaian bagimu, dan kamu adalah pakaian bagi mereka.',
        author: 'QS. Al-Baqarah: 187',
        category: 'quran'
    },
    {
        id: 'quran-4',
        textArabic: 'وَأَنكِحُوا الْأَيَامَىٰ مِنكُمْ وَالصَّالِحِينَ مِنْ عِبَادِكُمْ وَإِمَائِكُمْ',
        text: 'Dan nikahkanlah orang-orang yang masih membujang di antara kamu, dan juga orang-orang yang layak (menikah) dari hamba-hamba sahayamu yang laki-laki dan perempuan.',
        author: 'QS. An-Nur: 32',
        category: 'quran'
    },
    {
        id: 'quran-5',
        textArabic: 'وَعَاشِرُوهُنَّ بِالْمَعْرُوفِ',
        text: 'Dan bergaullah dengan mereka (istri-istrimu) secara patut.',
        author: 'QS. An-Nisa: 19',
        category: 'quran'
    },
    {
        id: 'quran-6',
        textArabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
        text: 'Ya Tuhan kami, anugerahkanlah kepada kami istri-istri kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami imam bagi orang-orang yang bertakwa.',
        author: 'QS. Al-Furqan: 74',
        category: 'quran'
    },
    {
        id: 'quran-7',
        textArabic: 'وَاللَّهُ جَعَلَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا',
        text: 'Dan Allah menjadikan bagimu pasangan (suami atau istri) dari jenis kamu sendiri.',
        author: 'QS. An-Nahl: 72',
        category: 'quran'
    },
    {
        id: 'quran-8',
        textArabic: 'فَانكِحُوا مَا طَابَ لَكُم مِّنَ النِّسَاءِ',
        text: 'Maka nikahilah perempuan (lain) yang kamu senangi.',
        author: 'QS. An-Nisa: 3',
        category: 'quran'
    },
    {
        id: 'quran-9',
        textArabic: 'وَلَهُنَّ مِثْلُ الَّذِي عَلَيْهِنَّ بِالْمَعْرُوفِ',
        text: 'Dan mereka (para istri) mempunyai hak yang seimbang dengan kewajibannya menurut cara yang patut.',
        author: 'QS. Al-Baqarah: 228',
        category: 'quran'
    },
    {
        id: 'quran-10',
        textArabic: 'وَخَلَقْنَاكُمْ أَزْوَاجًا',
        text: 'Dan Kami menciptakan kamu berpasang-pasangan.',
        author: 'QS. An-Naba: 8',
        category: 'quran'
    },
    // International Famous Quotes
    {
        id: 'intl-1',
        text: 'A successful marriage requires falling in love many times, always with the same person.',
        author: 'Mignon McLaughlin',
        category: 'international'
    },
    {
        id: 'intl-2',
        text: 'The greatest thing you\'ll ever learn is just to love and be loved in return.',
        author: 'Nat King Cole',
        category: 'international'
    },
    {
        id: 'intl-3',
        text: 'Love is composed of a single soul inhabiting two bodies.',
        author: 'Aristotle',
        category: 'international'
    },
    {
        id: 'intl-4',
        text: 'Whatever our souls are made of, his and mine are the same.',
        author: 'Emily Brontë',
        category: 'international'
    },
    {
        id: 'intl-5',
        text: 'In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.',
        author: 'Maya Angelou',
        category: 'international'
    }
];
