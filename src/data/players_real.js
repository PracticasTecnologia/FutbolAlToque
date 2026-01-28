import { teams } from './teams';
import { argentinaSquads } from './leagues/argentina';
import { spainSquads } from './leagues/spain';
import { englandSquads } from './leagues/england';
import { italySquads } from './leagues/italy';
import { germanySquads } from './leagues/germany';
import { franceSquads } from './leagues/france';
import { brazilSquads } from './leagues/brazil';

// Mapeo de posiciones de Transfermarkt a códigos del juego
const positionMap = {
    'Goalkeeper': 'GK',
    'Centre-Back': 'DF',
    'Left-Back': 'DF',
    'Right-Back': 'DF',
    'Defensive Midfield': 'MF',
    'Central Midfield': 'MF',
    'Attacking Midfield': 'MF',
    'Left Midfield': 'MF',
    'Right Midfield': 'MF',
    'Left Winger': 'MF',
    'Right Winger': 'MF',
    'Centre-Forward': 'FW',
    'Second Striker': 'FW',
};

// Mapeo de posiciones a roles FIFA
const roleMap = {
    'Goalkeeper': 'GK',
    'Centre-Back': 'CB',
    'Left-Back': 'LB',
    'Right-Back': 'RB',
    'Defensive Midfield': 'CDM',
    'Central Midfield': 'CM',
    'Attacking Midfield': 'CAM',
    'Left Midfield': 'LM',
    'Right Midfield': 'RM',
    'Left Winger': 'LW',
    'Right Winger': 'RW',
    'Centre-Forward': 'ST',
    'Second Striker': 'ST',
};

// Conversor de valor de mercado a Rating (0-99)
const calculateRating = (valueStr, age) => {
    let value = 0;
    if (!valueStr || valueStr === '-') return 62;

    const cleanVal = valueStr.replace('€', '').trim();
    if (cleanVal.includes('m')) {
        value = parseFloat(cleanVal.replace('m', '')) * 1000000;
    } else if (cleanVal.includes('k')) {
        value = parseFloat(cleanVal.replace('k', '')) * 1000;
    }

    let rating = 58; // Base

    if (value > 15000000) rating = 85;
    else if (value > 10000000) rating = 82;
    else if (value > 7000000) rating = 79;
    else if (value > 5000000) rating = 77;
    else if (value > 3000000) rating = 74;
    else if (value > 2000000) rating = 72;
    else if (value > 1000000) rating = 70;
    else if (value > 500000) rating = 67;
    else if (value > 200000) rating = 64;
    else if (value > 100000) rating = 62;
    else rating = 60;

    // Ajuste por edad (veteranos valor bajo pero rating alto por experiencia)
    if (age > 34 && value > 100000) rating += 4;
    else if (age > 32 && value > 100000) rating += 2;

    // Jóvenes promesas
    if (age < 21 && value > 1000000) rating += 1;

    return Math.min(94, Math.max(55, rating));
};

// Generador de Stats FIFA basado en posición y rating
const generateStats = (role, rating, age) => {
    const base = rating;
    const v = () => Math.floor(Math.random() * 6) - 3; // Variación pequeña

    let s = { pac: base, sho: base, pas: base, dri: base, def: base, phy: base };

    switch (role) {
        case 'GK':
            // Para arqueros usamos gkStats, pero también generamos stats base bajos
            s = { pac: 45 + v(), sho: 25 + v(), pas: 50 + v(), dri: 35 + v(), def: 30 + v(), phy: 70 + v() };
            break;
        case 'CB':
            s.def = base + 5 + v();
            s.phy = base + 3 + v();
            s.pac = base - 8 + v();
            s.pas = base - 5 + v();
            s.dri = base - 12 + v();
            s.sho = base - 20 + v();
            break;
        case 'LB':
        case 'RB':
            s.def = base + 2 + v();
            s.pac = base + 5 + v();
            s.pas = base - 3 + v();
            s.dri = base - 5 + v();
            s.sho = base - 15 + v();
            s.phy = base - 2 + v();
            break;
        case 'CDM':
            s.def = base + 5 + v();
            s.phy = base + 3 + v();
            s.pas = base + v();
            s.pac = base - 5 + v();
            s.dri = base - 5 + v();
            s.sho = base - 10 + v();
            break;
        case 'CM':
            s.pas = base + 3 + v();
            s.dri = base + v();
            s.def = base - 3 + v();
            s.sho = base - 5 + v();
            s.pac = base - 3 + v();
            s.phy = base - 2 + v();
            break;
        case 'CAM':
            s.pas = base + 5 + v();
            s.dri = base + 5 + v();
            s.sho = base + v();
            s.pac = base - 2 + v();
            s.def = base - 15 + v();
            s.phy = base - 8 + v();
            break;
        case 'LM':
        case 'RM':
        case 'LW':
        case 'RW':
            s.pac = base + 8 + v();
            s.dri = base + 5 + v();
            s.pas = base + v();
            s.sho = base - 3 + v();
            s.def = base - 20 + v();
            s.phy = base - 8 + v();
            break;
        case 'ST':
            s.sho = base + 8 + v();
            s.pac = base + 3 + v();
            s.dri = base + 2 + v();
            s.pas = base - 8 + v();
            s.def = base - 25 + v();
            s.phy = base + v();
            break;
    }

    // Limitar stats
    Object.keys(s).forEach(k => {
        s[k] = Math.min(99, Math.max(35, s[k]));
    });

    // Ajustes por edad
    if (age > 33) { s.pac = Math.max(40, s.pac - 8); }
    if (age < 21) { s.pac = Math.min(95, s.pac + 3); s.phy = Math.max(40, s.phy - 5); }

    return s;
};

// Generar gkStats para arqueros
const generateGKStats = (rating, age) => {
    const v = () => Math.floor(Math.random() * 4) - 2;
    let gk = {
        div: rating + v(),
        han: rating - 2 + v(),
        kic: rating - 8 + v(),
        ref: rating + 2 + v(),
        pos: rating + v(),
    };

    // Veteranos tienen mejor posicionamiento
    if (age > 33) {
        gk.pos += 3;
        gk.ref -= 2;
    }

    Object.keys(gk).forEach(k => {
        gk[k] = Math.min(99, Math.max(50, gk[k]));
    });

    return gk;
};

// ============================================
// DATOS REALES EXTRAÍDOS DE TRANSFERMARKT (Enero 2026)
// Incluye posiciones REALES de cada jugador
// ============================================

// ============================================
// DATOS REALES EXTRAÍDOS DE TRANSFERMARKT (Enero 2026)
// Incluye posiciones REALES de cada jugador
// ============================================

// (Los datos ahora se cargan desde src/data/leagues/)

// Función para generar la base de datos completa
export const getAllPlayers = () => {
    let allPlayers = [];
    let idCounter = 1;

    teams.forEach(team => {
        // Primero buscar en raw_squads (datos manuales de equipos grandes)
        // Luego en las ligas importadas
        let playersData = argentinaSquads[team.id] ||
            spainSquads[team.id] ||
            englandSquads[team.id] ||
            italySquads[team.id] ||
            germanySquads[team.id] ||
            franceSquads[team.id] ||
            brazilSquads[team.id] || [];

        // Si no hay datos, generar plantel básico
        if (playersData.length === 0) {
            const positions = [
                { pos: 'Goalkeeper', count: 2 },
                { pos: 'Centre-Back', count: 4 },
                { pos: 'Left-Back', count: 2 },
                { pos: 'Right-Back', count: 2 },
                { pos: 'Defensive Midfield', count: 2 },
                { pos: 'Central Midfield', count: 3 },
                { pos: 'Attacking Midfield', count: 2 },
                { pos: 'Right Winger', count: 2 },
                { pos: 'Left Winger', count: 2 },
                { pos: 'Centre-Forward', count: 3 },
            ];

            let playerNum = 1;
            positions.forEach(p => {
                for (let i = 0; i < p.count; i++) {
                    const baseVal = 300 + Math.floor(Math.random() * 700); // 300k - 1M
                    playersData.push({
                        name: `${team.shortName} Jugador ${playerNum++}`,
                        pos: p.pos,
                        val: `€${baseVal}k`,
                        age: 20 + Math.floor(Math.random() * 12)
                    });
                }
            });
        }

        playersData.forEach(p => {
            const role = roleMap[p.pos] || 'CM';
            const position = positionMap[p.pos] || 'MF';
            const rating = calculateRating(p.val, p.age);
            const stats = generateStats(role, rating, p.age);
            const gkStats = role === 'GK' ? generateGKStats(rating, p.age) : null;

            allPlayers.push({
                id: `p${idCounter++}`,
                name: p.name,
                teamId: team.id,
                position: position,
                role: role,
                age: p.age,
                rating: rating,
                stats: stats,
                gkStats: gkStats,
                value: p.val,
                stamina: 100,
                nationality: p.nat || 'Unknown'
            });
        });
    });

    return allPlayers;
};

// Exportar directamente la lista
export const players = getAllPlayers();
