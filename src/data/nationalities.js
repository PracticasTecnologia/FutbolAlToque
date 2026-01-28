// Nacionalidades de jugadores - Banderas emoji por país
// La mayoría de jugadores de la Liga Argentina son argentinos

export const NATIONALITIES = {
    ARG: { name: 'Argentina', flag: '🇦🇷' },
    BRA: { name: 'Brasil', flag: '🇧🇷' },
    URU: { name: 'Uruguay', flag: '🇺🇾' },
    PAR: { name: 'Paraguay', flag: '🇵🇾' },
    CHI: { name: 'Chile', flag: '🇨🇱' },
    COL: { name: 'Colombia', flag: '🇨🇴' },
    ECU: { name: 'Ecuador', flag: '🇪🇨' },
    PER: { name: 'Perú', flag: '🇵🇪' },
    VEN: { name: 'Venezuela', flag: '🇻🇪' },
    BOL: { name: 'Bolivia', flag: '🇧🇴' },
    MEX: { name: 'México', flag: '🇲🇽' },
    ESP: { name: 'España', flag: '🇪🇸' },
    ITA: { name: 'Italia', flag: '🇮🇹' },
    FRA: { name: 'Francia', flag: '🇫🇷' },
    GER: { name: 'Alemania', flag: '🇩🇪' },
    ENG: { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    USA: { name: 'Estados Unidos', flag: '🇺🇸' },
    PAN: { name: 'Panamá', flag: '🇵🇦' },
    CRC: { name: 'Costa Rica', flag: '🇨🇷' },
    HON: { name: 'Honduras', flag: '🇭🇳' },
    NIG: { name: 'Nigeria', flag: '🇳🇬' },
    GHA: { name: 'Ghana', flag: '🇬🇭' },
    SEN: { name: 'Senegal', flag: '🇸🇳' },
    CMR: { name: 'Camerún', flag: '🇨🇲' },
    POR: { name: 'Portugal', flag: '🇵🇹' },
    NED: { name: 'Países Bajos', flag: '🇳🇱' },
    BEL: { name: 'Bélgica', flag: '🇧🇪' },
    CRO: { name: 'Croacia', flag: '🇭🇷' },
    MAR: { name: 'Marruecos', flag: '🇲🇦' },
    JPN: { name: 'Japón', flag: '🇯🇵' },
    KOR: { name: 'Corea del Sur', flag: '🇰🇷' },
    CAN: { name: 'Canadá', flag: '🇨🇦' },
    SUI: { name: 'Suiza', flag: '🇨🇭' },
    AUT: { name: 'Austria', flag: '🇦🇹' },
    TUR: { name: 'Turquía', flag: '🇹🇷' },
    RUS: { name: 'Rusia', flag: '🇷🇺' },
    UKR: { name: 'Ucrania', flag: '🇺🇦' },
    SCO: { name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    WAL: { name: 'Gales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    POL: { name: 'Polonia', flag: '🇵🇱' },
    SWE: { name: 'Suecia', flag: '🇸🇪' },
    DEN: { name: 'Dinamarca', flag: '🇩🇰' },
    NOR: { name: 'Noruega', flag: '🇳🇴' },
    GRE: { name: 'Grecia', flag: '🇬🇷' },
    CZE: { name: 'República Checa', flag: '🇨🇿' },
    SRB: { name: 'Serbia', flag: '🇷🇸' },
    IVC: { name: 'Costa de Marfil', flag: '🇨🇮' },
    EGY: { name: 'Egipto', flag: '🇪🇬' },
    ALG: { name: 'Argelia', flag: '🇩🇿' },
    MLI: { name: 'Malí', flag: '🇲🇱' },
    CMR: { name: 'Camerún', flag: '🇨🇲' },
    GHA: { name: 'Ghana', flag: '🇬🇭' },
    NIG: { name: 'Nigeria', flag: '🇳🇬' },
    SEN: { name: 'Senegal', flag: '🇸🇳' },
};

// Mapeo de nombres en inglés (Transfermarkt) a códigos internos
const COUNTRY_TO_CODE = {
    'Argentina': 'ARG',
    'Brazil': 'BRA', 'Brasil': 'BRA',
    'Spain': 'ESP', 'España': 'ESP',
    'England': 'ENG', 'Inglaterra': 'ENG',
    'Italy': 'ITA', 'Italia': 'ITA',
    'France': 'FRA', 'Francia': 'FRA',
    'Germany': 'GER', 'Alemania': 'GER',
    'Chile': 'CHI',
    'Colombia': 'COL',
    'Uruguay': 'URU',
    'Paraguay': 'PAR',
    'Peru': 'PER',
    'Ecuador': 'ECU',
    'Venezuela': 'VEN',
    'Bolivia': 'BOL',
    'Mexico': 'MEX',
    'United States': 'USA',
    'Portugal': 'POR',
    'Netherlands': 'NED',
    'Belgium': 'BEL',
    'Croatia': 'CRO',
    'Morocco': 'MAR',
    'Japan': 'JPN',
    'Korea, South': 'KOR',
    'Canada': 'CAN',
    'Switzerland': 'SUI',
    'Austria': 'AUT',
    'Turkey': 'TUR',
    'Russia': 'RUS',
    'Ukraine': 'UKR',
    'Scotland': 'SCO',
    'Wales': 'WAL',
    'Poland': 'POL',
    'Sweden': 'SWE',
    'Denmark': 'DEN',
    'Norway': 'NOR',
    'Greece': 'GRE',
    'Czech Republic': 'CZE',
    'Serbia': 'SRB',
    'Cote d\'Ivoire': 'IVC',
    'Egypt': 'EGY',
    'Algeria': 'ALG',
    'Mali': 'MLI',
    'Cameroon': 'CMR',
    'Ghana': 'GHA',
    'Nigeria': 'NIG',
    'Senegal': 'SEN',
    'Panama': 'PAN',
    'Costa Rica': 'CRC',
    'Honduras': 'HON',
};

// Jugadores conocidos con su nacionalidad (mapeo por nombre)
// La mayoría son argentinos por defecto
export const KNOWN_NATIONALITIES = {
    // ... (Mantenemos los manuales por si acaso)
    'Franco Armani': 'ARG',
    'Paulo Díaz': 'CHI',
    'Juan Fernando Quintero': 'COL',
};

// Función para obtener la nacionalidad de un jugador
export const getPlayerNationality = (playerName, scrapedNat) => {
    // 1. Si tenemos el dato real del scraper, usarlo
    if (scrapedNat) {
        // Limpiar espacios extra
        const cleanNat = scrapedNat.trim();
        const code = COUNTRY_TO_CODE[cleanNat];
        if (code && NATIONALITIES[code]) {
            return NATIONALITIES[code];
        }
    }

    // 2. Buscar en manuales
    const knownNat = KNOWN_NATIONALITIES[playerName];
    if (knownNat) return NATIONALITIES[knownNat];

    // 3. Por defecto, devolvemos un objeto genérico o Argentina
    // Si la liga del jugador no es argentina, esto podría ser raro.
    // Lo ideal sería recibir también la liga o el equipo, pero por ahora...
    return NATIONALITIES.ARG;
};

// Función para obtener solo la bandera
export const getPlayerFlag = (playerName, scrapedNat) => {
    return getPlayerNationality(playerName, scrapedNat).flag;
};
