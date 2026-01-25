// Servicio para obtener datos de TheSportsDB
// API gratuita para datos de fútbol

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

// IDs de equipos argentinos en TheSportsDB (hay que buscarlos)
// Estos se actualizarán al hacer la primera búsqueda
let teamCache = {};

// Buscar equipo por nombre
export async function searchTeam(teamName) {
    try {
        const response = await fetch(`${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`);
        const data = await response.json();
        return data.teams?.[0] || null;
    } catch (error) {
        console.error('Error buscando equipo:', error);
        return null;
    }
}

// Obtener jugadores de un equipo por ID
export async function getTeamPlayers(teamId) {
    try {
        const response = await fetch(`${BASE_URL}/lookup_all_players.php?id=${teamId}`);
        const data = await response.json();
        return data.player || [];
    } catch (error) {
        console.error('Error obteniendo jugadores:', error);
        return [];
    }
}

// Mapeo de nombres de equipos locales a nombres en TheSportsDB
const teamNameMapping = {
    river: 'River Plate',
    boca: 'Boca Juniors',
    racing: 'Racing Club',
    independiente: 'Independiente',
    sanlorenzo: 'San Lorenzo',
    velez: 'Velez Sarsfield',
    estudiantes: 'Estudiantes de La Plata',
    talleres: 'Talleres Cordoba',
    lanus: 'Lanus',
    argentinos: 'Argentinos Juniors',
    huracan: 'Huracan',
    central: 'Rosario Central',
    newells: 'Newells Old Boys',
    defensa: 'Defensa y Justicia',
    colon: 'Colon Santa Fe',
    banfield: 'Banfield',
};

// Convertir posición de TheSportsDB a nuestro formato
function convertPosition(position) {
    if (!position) return { position: 'MID', role: 'CM' };

    const pos = position.toLowerCase();

    if (pos.includes('goalkeeper') || pos.includes('keeper')) {
        return { position: 'GK', role: 'GK' };
    }
    if (pos.includes('defender') || pos.includes('back')) {
        if (pos.includes('left')) return { position: 'DEF', role: 'LB' };
        if (pos.includes('right')) return { position: 'DEF', role: 'RB' };
        return { position: 'DEF', role: 'CB' };
    }
    if (pos.includes('midfielder') || pos.includes('midfield')) {
        if (pos.includes('defensive')) return { position: 'MID', role: 'CDM' };
        if (pos.includes('attacking')) return { position: 'MID', role: 'CAM' };
        if (pos.includes('left')) return { position: 'MID', role: 'LW' };
        if (pos.includes('right')) return { position: 'MID', role: 'RW' };
        return { position: 'MID', role: 'CM' };
    }
    if (pos.includes('forward') || pos.includes('striker') || pos.includes('winger')) {
        if (pos.includes('left')) return { position: 'FWD', role: 'LW' };
        if (pos.includes('right')) return { position: 'FWD', role: 'RW' };
        return { position: 'FWD', role: 'ST' };
    }

    return { position: 'MID', role: 'CM' };
}

// Generar stats basadas en posición y un valor base
function generateStats(position, baseRating = 70) {
    const variance = () => Math.floor(Math.random() * 15) - 7; // -7 a +7

    const base = {
        pac: baseRating + variance(),
        sho: baseRating + variance(),
        pas: baseRating + variance(),
        dri: baseRating + variance(),
        def: baseRating + variance(),
        phy: baseRating + variance(),
    };

    // Ajustar según posición
    switch (position) {
        case 'GK':
            base.sho = Math.max(20, base.sho - 40);
            base.dri = Math.max(25, base.dri - 30);
            base.def = Math.max(30, base.def - 20);
            break;
        case 'DEF':
            base.def = Math.min(99, base.def + 15);
            base.phy = Math.min(99, base.phy + 10);
            base.sho = Math.max(30, base.sho - 20);
            break;
        case 'MID':
            base.pas = Math.min(99, base.pas + 10);
            base.dri = Math.min(99, base.dri + 5);
            break;
        case 'FWD':
            base.sho = Math.min(99, base.sho + 15);
            base.pac = Math.min(99, base.pac + 10);
            base.def = Math.max(25, base.def - 25);
            break;
    }

    // Clamp todos los valores
    Object.keys(base).forEach(key => {
        base[key] = Math.max(30, Math.min(99, base[key]));
    });

    return base;
}

// Generar stats de arquero
function generateGKStats(baseRating = 70) {
    const variance = () => Math.floor(Math.random() * 10) - 5;
    return {
        div: baseRating + variance(),
        han: baseRating + variance(),
        kic: baseRating - 10 + variance(),
        ref: baseRating + variance(),
        pos: baseRating + variance(),
    };
}

// Calcular overall según posición
export function calculateOverall(player) {
    const { position, stats, gkStats } = player;

    if (position === 'GK' && gkStats) {
        return Math.round((gkStats.div + gkStats.han + gkStats.ref + gkStats.pos) / 4);
    }

    if (!stats) return 60;

    switch (position) {
        case 'DEF':
            return Math.round(
                stats.def * 0.30 +
                stats.phy * 0.25 +
                stats.pac * 0.20 +
                stats.pas * 0.15 +
                stats.dri * 0.10
            );
        case 'MID':
            return Math.round(
                stats.pas * 0.25 +
                stats.dri * 0.25 +
                stats.def * 0.15 +
                stats.sho * 0.15 +
                stats.pac * 0.10 +
                stats.phy * 0.10
            );
        case 'FWD':
            return Math.round(
                stats.sho * 0.30 +
                stats.pac * 0.25 +
                stats.dri * 0.20 +
                stats.pas * 0.15 +
                stats.phy * 0.10
            );
        default:
            return Math.round(
                (stats.pac + stats.sho + stats.pas + stats.dri + stats.def + stats.phy) / 6
            );
    }
}

// Convertir jugador de API a nuestro formato
function convertPlayer(apiPlayer, teamId) {
    const posData = convertPosition(apiPlayer.strPosition);
    const age = apiPlayer.dateBorn
        ? new Date().getFullYear() - new Date(apiPlayer.dateBorn).getFullYear()
        : 25;

    // Estimar rating base por descripción o usar default
    const baseRating = 65 + Math.floor(Math.random() * 15); // 65-80 random

    const stats = generateStats(posData.position, baseRating);
    const gkStats = posData.position === 'GK' ? generateGKStats(baseRating + 5) : null;

    const player = {
        id: `api_${apiPlayer.idPlayer}`,
        apiId: apiPlayer.idPlayer,
        name: apiPlayer.strPlayer,
        age,
        position: posData.position,
        role: posData.role,
        stats,
        gkStats,
        stamina: 100,
        nationality: apiPlayer.strNationality || 'Argentina',
        photo: apiPlayer.strCutout || apiPlayer.strThumb || null,
    };

    player.overall = calculateOverall(player);

    return player;
}

// Obtener y convertir todos los jugadores de un equipo
export async function fetchTeamPlayersFromAPI(localTeamId) {
    const teamName = teamNameMapping[localTeamId];
    if (!teamName) {
        console.log(`No hay mapeo para el equipo: ${localTeamId}`);
        return null;
    }

    // Buscar equipo en cache o API
    let team = teamCache[localTeamId];
    if (!team) {
        team = await searchTeam(teamName);
        if (team) {
            teamCache[localTeamId] = team;
        }
    }

    if (!team) {
        console.log(`No se encontró el equipo: ${teamName}`);
        return null;
    }

    // Obtener jugadores
    const apiPlayers = await getTeamPlayers(team.idTeam);
    if (!apiPlayers || apiPlayers.length === 0) {
        console.log(`No se encontraron jugadores para: ${teamName}`);
        return null;
    }

    // Convertir jugadores
    const players = apiPlayers.map(p => convertPlayer(p, localTeamId));

    // Ordenar por overall
    players.sort((a, b) => b.overall - a.overall);

    return players;
}

// Importar todos los equipos
export async function importAllTeamsFromAPI(onProgress) {
    const results = {};
    const teamIds = Object.keys(teamNameMapping);

    for (let i = 0; i < teamIds.length; i++) {
        const teamId = teamIds[i];
        if (onProgress) {
            onProgress(teamId, i + 1, teamIds.length);
        }

        const players = await fetchTeamPlayersFromAPI(teamId);
        if (players && players.length > 0) {
            results[teamId] = players;
        }

        // Esperar un poco para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
}

// Aplicar overrides desde JSON
export function applyOverrides(players, overrides) {
    if (!overrides || !overrides.overrides) return players;

    return players.map(player => {
        const override = overrides.overrides[player.id] || overrides.overrides[player.apiId];
        if (!override) return player;

        const updated = { ...player };

        if (override.stats) {
            updated.stats = { ...updated.stats, ...override.stats };
        }
        if (override.gkStats) {
            updated.gkStats = { ...updated.gkStats, ...override.gkStats };
        }
        if (override.overall !== undefined) {
            updated.overall = override.overall;
        } else {
            updated.overall = calculateOverall(updated);
        }
        if (override.name) updated.name = override.name;
        if (override.age) updated.age = override.age;
        if (override.position) updated.position = override.position;
        if (override.role) updated.role = override.role;

        return updated;
    });
}
