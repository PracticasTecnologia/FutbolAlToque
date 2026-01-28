// Datos de los equipos de la Liga Argentina
// Con soporte para overrides desde team_overrides.json
import teamOverrides from './team_overrides.json';

const argTeams = [
    // Los 5 Grandes
    { id: 'river', name: 'River Plate', shortName: 'RIV', color: '#E4002B', budget: 50000000, rep: 90 },
    { id: 'boca', name: 'Boca Juniors', shortName: 'BOC', color: '#0033A0', budget: 48000000, rep: 88 },
    { id: 'racing', name: 'Racing Club', shortName: 'RAC', color: '#75AADB', budget: 30000000, rep: 78 },
    { id: 'independiente', name: 'Independiente', shortName: 'IND', color: '#E4002B', budget: 28000000, rep: 76 },
    { id: 'sanlorenzo', name: 'San Lorenzo', shortName: 'SLO', color: '#0033A0', budget: 25000000, rep: 74 },

    // Históricos y Competitivos
    { id: 'velez', name: 'Vélez Sarsfield', shortName: 'VEL', color: '#0033A0', budget: 22000000, rep: 72 },
    { id: 'estudiantes', name: 'Estudiantes LP', shortName: 'ELP', color: '#E4002B', budget: 20000000, rep: 70 },
    { id: 'talleres', name: 'Talleres', shortName: 'TAL', color: '#0033A0', budget: 18000000, rep: 68 },
    { id: 'lanus', name: 'Lanús', shortName: 'LAN', color: '#800020', budget: 17000000, rep: 66 },
    { id: 'argentinos', name: 'Argentinos Jrs', shortName: 'ARG', color: '#E4002B', budget: 15000000, rep: 65 },
    { id: 'huracan', name: 'Huracán', shortName: 'HUR', color: '#FFFFFF', budget: 14000000, rep: 63 },
    { id: 'central', name: 'Rosario Central', shortName: 'CEN', color: '#0033A0', budget: 15000000, rep: 65 },
    { id: 'newells', name: "Newell's Old Boys", shortName: 'NOB', color: '#E4002B', budget: 14000000, rep: 64 },
    { id: 'defensa', name: 'Defensa y Justicia', shortName: 'DYJ', color: '#006400', budget: 12000000, rep: 62 },
    { id: 'banfield', name: 'Banfield', shortName: 'BAN', color: '#006400', budget: 12000000, rep: 60 },
    { id: 'colon', name: 'Colón', shortName: 'COL', color: '#E4002B', budget: 13000000, rep: 61 },

    // Nuevos Equipos Temporada 2026
    { id: 'belgrano', name: 'Belgrano', shortName: 'BEL', color: '#6897BB', budget: 14000000, rep: 64 },
    { id: 'atletico', name: 'Atlético Tucumán', shortName: 'ATU', color: '#87CEEB', budget: 11000000, rep: 60 },
    { id: 'godoycruz', name: 'Godoy Cruz', shortName: 'GOD', color: '#000080', budget: 12000000, rep: 62 },
    { id: 'gimnasia', name: 'Gimnasia LP', shortName: 'GELP', color: '#000080', budget: 11000000, rep: 63 },
    { id: 'union', name: 'Unión', shortName: 'UNI', color: '#FF0000', budget: 10000000, rep: 60 },
    { id: 'platense', name: 'Platense', shortName: 'PLA', color: '#A52A2A', budget: 9000000, rep: 58 },
    { id: 'tigre', name: 'Tigre', shortName: 'TIG', color: '#0000FF', budget: 10000000, rep: 60 },
    { id: 'sarmiento', name: 'Sarmiento', shortName: 'SAR', color: '#008000', budget: 7000000, rep: 55 },
    { id: 'centralcordoba', name: 'Central Córdoba', shortName: 'CCO', color: '#000000', budget: 6000000, rep: 54 },
    { id: 'barracas', name: 'Barracas Central', shortName: 'BAR', color: '#FF0000', budget: 8000000, rep: 56 },
    { id: 'instituto', name: 'Instituto', shortName: 'INS', color: '#FF0000', budget: 9000000, rep: 59 },
    { id: 'riestra', name: 'Deportivo Riestra', shortName: 'RIE', color: '#000000', budget: 5000000, rep: 50 },
    { id: 'independienteriv', name: 'Ind. Rivadavia', shortName: 'CSIR', color: '#000080', budget: 6000000, rep: 53 },
];

const espTeams = [
    { id: 'realmadrid', name: 'Real Madrid', shortName: 'RMA', color: '#FFFFFF', budget: 850000000, rep: 99 },
    { id: 'barcelona', name: 'FC Barcelona', shortName: 'FCB', color: '#A50044', budget: 650000000, rep: 96 },
    { id: 'atletico', name: 'Atlético de Madrid', shortName: 'ATM', color: '#CB3524', budget: 400000000, rep: 90 },
    { id: 'seville', name: 'Sevilla FC', shortName: 'SEV', color: '#D40000', budget: 200000000, rep: 82 },
    { id: 'betis', name: 'Real Betis', shortName: 'BET', color: '#0BB363', budget: 180000000, rep: 80 },
    { id: 'realsociedad', name: 'Real Sociedad', shortName: 'RSO', color: '#0067B1', budget: 170000000, rep: 81 },
    { id: 'villarreal', name: 'Villarreal CF', shortName: 'VIL', color: '#F5E216', budget: 160000000, rep: 80 },
    { id: 'valencia', name: 'Valencia CF', shortName: 'VAL', color: '#000000', budget: 120000000, rep: 78 },
    { id: 'athletic', name: 'Athletic Club', shortName: 'ATH', color: '#EE2523', budget: 220000000, rep: 83 },
    { id: 'girona', name: 'Girona FC', shortName: 'GIR', color: '#CE1126', budget: 100000000, rep: 79 },
];

const engTeams = [
    { id: 'mancity', name: 'Manchester City', shortName: 'MCI', color: '#6CABDD', budget: 950000000, rep: 98 },
    { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', color: '#EF0107', budget: 600000000, rep: 92 },
    { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', color: '#C8102E', budget: 700000000, rep: 94 },
    { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', color: '#034694', budget: 600000000, rep: 90 },
    { id: 'manutd', name: 'Manchester United', shortName: 'MUN', color: '#DA291C', budget: 650000000, rep: 91 },
    { id: 'tottenham', name: 'Tottenham', shortName: 'TOT', color: '#132257', budget: 400000000, rep: 88 },
    { id: 'newcastle', name: 'Newcastle United', shortName: 'NEW', color: '#241F20', budget: 500000000, rep: 85 },
    { id: 'astonvilla', name: 'Aston Villa', shortName: 'AVL', color: '#95BWE5', budget: 250000000, rep: 82 },
    { id: 'westham', name: 'West Ham', shortName: 'WHU', color: '#7A263A', budget: 200000000, rep: 80 },
    { id: 'brighton', name: 'Brighton', shortName: 'BHA', color: '#0057B8', budget: 180000000, rep: 79 },
];

const itaTeams = [
    { id: 'inter', name: 'Inter Milan', shortName: 'INT', color: '#0068A8', budget: 350000000, rep: 92 },
    { id: 'milan', name: 'AC Milan', shortName: 'ACM', color: '#FB090B', budget: 300000000, rep: 91 },
    { id: 'juventus', name: 'Juventus', shortName: 'JUV', color: '#000000', budget: 320000000, rep: 93 },
    { id: 'napoli', name: 'Napoli', shortName: 'NAP', color: '#003C82', budget: 200000000, rep: 88 },
    { id: 'roma', name: 'AS Roma', shortName: 'ROM', color: '#8E1F2F', budget: 180000000, rep: 86 },
    { id: 'atalanta', name: 'Atalanta', shortName: 'ATA', color: '#1E71B8', budget: 150000000, rep: 84 },
    { id: 'lazio', name: 'Lazio', shortName: 'LAZ', color: '#87D8F7', budget: 140000000, rep: 83 },
    { id: 'fiorentina', name: 'Fiorentina', shortName: 'FIO', color: '#4F2E7D', budget: 120000000, rep: 80 },
];

const gerTeams = [
    { id: 'bayern', name: 'Bayern Munich', shortName: 'FCB', color: '#DC052D', budget: 600000000, rep: 97 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', shortName: 'B04', color: '#E32221', budget: 300000000, rep: 90 },
    { id: 'dortmund', name: 'Borussia Dortmund', shortName: 'BVB', color: '#FDE100', budget: 350000000, rep: 92 },
    { id: 'leipzig', name: 'RB Leipzig', shortName: 'RBL', color: '#DD0741', budget: 280000000, rep: 89 },
    { id: 'stuttgart', name: 'VfB Stuttgart', shortName: 'VFB', color: '#E32221', budget: 150000000, rep: 82 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', shortName: 'SGE', color: '#E1000F', budget: 140000000, rep: 81 },
];

const fraTeams = [
    { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', color: '#004171', budget: 700000000, rep: 95 },
    { id: 'monaco', name: 'AS Monaco', shortName: 'ASM', color: '#E83234', budget: 200000000, rep: 85 },
    { id: 'marseille', name: 'Olympique Marseille', shortName: 'OM', color: '#009DDC', budget: 180000000, rep: 86 },
    { id: 'lyon', name: 'Olympique Lyon', shortName: 'OL', color: '#DA291C', budget: 150000000, rep: 84 },
    { id: 'lille', name: 'LOSC Lille', shortName: 'LOSC', color: '#E01E13', budget: 120000000, rep: 80 },
    { id: 'lens', name: 'RC Lens', shortName: 'RCL', color: '#FFD100', budget: 100000000, rep: 78 },
];

const braTeams = [
    { id: 'flamengo', name: 'Flamengo', shortName: 'FLA', color: '#C3281E', budget: 150000000, rep: 88 },
    { id: 'palmeiras', name: 'Palmeiras', shortName: 'PAL', color: '#006437', budget: 130000000, rep: 87 },
    { id: 'saopaulo', name: 'São Paulo', shortName: 'SAO', color: '#FE0000', budget: 90000000, rep: 84 },
    { id: 'corinthians', name: 'Corinthians', shortName: 'COR', color: '#000000', budget: 85000000, rep: 83 },
    { id: 'atleticomineiro', name: 'Atlético Mineiro', shortName: 'CAM', color: '#000000', budget: 80000000, rep: 82 },
    { id: 'fluminense', name: 'Fluminense', shortName: 'FLU', color: '#9F022D', budget: 70000000, rep: 80 },
    { id: 'gremio', name: 'Grêmio', shortName: 'GRE', color: '#0D80BF', budget: 75000000, rep: 81 },
    { id: 'internacional', name: 'Internacional', shortName: 'INT', color: '#E40513', budget: 75000000, rep: 81 },
    { id: 'botafogo', name: 'Botafogo', shortName: 'BOT', color: '#000000', budget: 100000000, rep: 83 },
];

const baseTeams = [
    ...argTeams.map(t => ({ ...t, leagueId: 'ARG', leagueName: 'Liga Profesional' })),
    ...espTeams.map(t => ({ ...t, leagueId: 'ESP', leagueName: 'La Liga' })),
    ...engTeams.map(t => ({ ...t, leagueId: 'ENG', leagueName: 'Premier League' })),
    ...itaTeams.map(t => ({ ...t, leagueId: 'ITL', leagueName: 'Serie A' })),
    ...gerTeams.map(t => ({ ...t, leagueId: 'GER', leagueName: 'Bundesliga' })),
    ...fraTeams.map(t => ({ ...t, leagueId: 'FRA', leagueName: 'Ligue 1' })),
    ...braTeams.map(t => ({ ...t, leagueId: 'BRA', leagueName: 'Brasileirão' })),
];

// Aplicar overrides
function applyTeamOverrides(teams) {
    if (!teamOverrides || !teamOverrides.overrides) return teams;

    return teams.map(team => {
        const override = teamOverrides.overrides[team.id];
        if (!override) return team;

        return {
            ...team,
            ...override,
            // Mantener ID siempre
            id: team.id
        };
    });
}

export const teams = applyTeamOverrides(baseTeams);

// Formato de dinero
export const formatMoney = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
};

// Obtener equipo por ID
export const getTeam = (id) => teams.find(t => t.id === id);

// Obtener equipos por liga
export const getTeamsByLeague = (leagueId) => teams.filter(t => t.leagueId === leagueId);

// Obtener todas las ligas disponibles
export const getLeagues = () => {
    const leagues = new Map();
    teams.forEach(t => {
        if (!leagues.has(t.leagueId)) {
            leagues.set(t.leagueId, { id: t.leagueId, name: t.leagueName });
        }
    });
    return Array.from(leagues.values());
};

// Generar fixtures round-robin para UNA liga específica
export const generateLeagueFixtures = (leagueId) => {
    const leagueTeams = getTeamsByLeague(leagueId);
    const fixtures = [];
    let id = 0;
    
    // Mezclar equipos para variedad
    const shuffled = [...leagueTeams].sort(() => 0.5 - Math.random());
    const numTeams = shuffled.length;
    
    // Round-robin scheduling algorithm
    // Primera vuelta
    for (let round = 0; round < numTeams - 1; round++) {
        for (let match = 0; match < numTeams / 2; match++) {
            const home = (round + match) % (numTeams - 1);
            let away = (numTeams - 1 - match + round) % (numTeams - 1);
            
            if (match === 0) {
                away = numTeams - 1;
            }
            
            fixtures.push({
                id: `${leagueId}_f${id++}`,
                week: round + 1,
                leagueId,
                home: shuffled[home].id,
                away: shuffled[away].id,
                played: false,
                hg: 0,
                ag: 0,
            });
        }
    }
    
    // Segunda vuelta (invertir local/visitante)
    const firstRoundCount = fixtures.length;
    for (let i = 0; i < firstRoundCount; i++) {
        const f = fixtures[i];
        fixtures.push({
            id: `${leagueId}_f${id++}`,
            week: f.week + numTeams - 1,
            leagueId,
            home: f.away,
            away: f.home,
            played: false,
            hg: 0,
            ag: 0,
        });
    }
    
    return fixtures;
};

// Generar fixtures para todas las ligas (legacy compatibility)
export const generateFixtures = (playerLeagueId = null) => {
    // Si se especifica una liga, solo generar para esa
    if (playerLeagueId) {
        return generateLeagueFixtures(playerLeagueId);
    }
    
    // Generar para todas las ligas
    const allFixtures = [];
    const leagues = getLeagues();
    
    leagues.forEach(league => {
        const leagueFixtures = generateLeagueFixtures(league.id);
        allFixtures.push(...leagueFixtures);
    });
    
    return allFixtures;
};
