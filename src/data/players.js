// Base de datos de jugadores reales - Liga Argentina 2025/2026
// Stats tipo FIFA: PAC, SHO, PAS, DRI, DEF, PHY
// Arqueros: DIV, HAN, KIC, REF, POS

import { players as realPlayersList } from './players_real';

// Posiciones y roles
export const POSITIONS = { GK: 'Portero', DEF: 'Defensor', MID: 'Mediocampista', FWD: 'Delantero' };
export const ROLES = { GK: 'Arquero', CB: 'Central', LB: 'Lat.Izq', RB: 'Lat.Der', CDM: 'Med.Def', CM: 'Med.Cen', CAM: 'Med.Ofe', LW: 'Ext.Izq', RW: 'Ext.Der', ST: 'Delantero' };
export const roleToPosition = { GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', CDM: 'MID', CM: 'MID', CAM: 'MID', LW: 'MID', RW: 'MID', ST: 'FWD' };
export const STAT_NAMES = { pac: 'Ritmo', sho: 'Disparo', pas: 'Pase', dri: 'Regate', def: 'Defensa', phy: 'Físico' };
export const GK_STAT_NAMES = { div: 'Zambullida', han: 'Manos', kic: 'Saque', ref: 'Reflejos', pos: 'Posición' };

// Cálculo de overall por posición
export function calculateOverall(player) {
    const { position, stats, gkStats } = player;
    if (position === 'GK' && gkStats) return Math.round((gkStats.div + gkStats.han + gkStats.ref + gkStats.pos) / 4);
    if (!stats) return 60;
    switch (position) {
        case 'DEF': return Math.round(stats.def * 0.30 + stats.phy * 0.25 + stats.pac * 0.20 + stats.pas * 0.15 + stats.dri * 0.10);
        case 'MID': return Math.round(stats.pas * 0.25 + stats.dri * 0.25 + stats.def * 0.15 + stats.sho * 0.15 + stats.pac * 0.10 + stats.phy * 0.10);
        case 'FWD': return Math.round(stats.sho * 0.30 + stats.pac * 0.25 + stats.dri * 0.20 + stats.pas * 0.15 + stats.phy * 0.10);
        default: return Math.round((stats.pac + stats.sho + stats.pas + stats.dri + stats.def + stats.phy) / 6);
    }
}

// Calcular overall en posición diferente (penalización)
export function calculateOverallInPosition(player, targetRole) {
    const targetPosition = roleToPosition[targetRole] || targetRole;
    if (player.position === targetPosition) return player.overall;
    if (player.position === 'GK' && targetPosition !== 'GK') return Math.round(player.overall * 0.4);
    if (player.position !== 'GK' && targetPosition === 'GK') return Math.round(player.overall * 0.3);
    const penalties = { 'DEF': { 'MID': 0.85, 'FWD': 0.65 }, 'MID': { 'DEF': 0.80, 'FWD': 0.80 }, 'FWD': { 'DEF': 0.60, 'MID': 0.75 } };
    return Math.round(player.overall * (penalties[player.position]?.[targetPosition] || 0.7));
}

// Convertir valor string "€2.50m" a número
const parseMarketValue = (valueStr) => {
    if (!valueStr || valueStr === '-') return 500000; // Default 500k

    const cleanVal = valueStr.replace('€', '').trim();
    if (cleanVal.includes('m')) {
        return parseFloat(cleanVal.replace('m', '')) * 1000000;
    } else if (cleanVal.includes('k')) {
        return parseFloat(cleanVal.replace('k', '')) * 1000;
    }
    return 500000;
};

// Convertir la lista plana de players_real.js al formato playerDatabase (agrupado por equipo)
const buildPlayerDatabase = () => {
    const db = {};

    realPlayersList.forEach(p => {
        // Asegurar que el equipo existe en el objeto
        if (!db[p.teamId]) {
            db[p.teamId] = [];
        }

        // Usar directamente el role que viene de players_real.js
        // El archivo players_real.js ya asigna roles correctamente (GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST)
        const playerObj = {
            id: p.id,
            name: p.name,
            age: p.age,
            position: p.position,  // GK, DF, MF, FW
            role: p.role,          // GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST - YA VIENE CALCULADO
            stats: p.stats,
            gkStats: p.gkStats,    // YA VIENE CALCULADO para arqueros
            stamina: 100,
            overall: p.rating,      // Usamos el rating pre-calculado
            nationality: p.nationality || p.nat,
            marketValue: parseMarketValue(p.value), // Valor de mercado numérico
            valueString: p.value,   // Valor original como string
        };

        db[p.teamId].push(playerObj);
    });

    return db;
};

// ============================================
// BASE DE DATOS GENERADA
// ============================================

export const playerDatabase = buildPlayerDatabase();

// Generador de canteranos
export const youthFirstNames = ['Matías', 'Nicolás', 'Agustín', 'Facundo', 'Lautaro', 'Thiago', 'Valentín', 'Benjamín', 'Joaquín', 'Tomás', 'Lucas', 'Martín', 'Santiago', 'Franco', 'Bruno', 'Nahuel'];
export const youthLastNames = ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'García', 'Pérez', 'Sánchez', 'Romero', 'Díaz', 'Torres', 'Álvarez', 'Ruiz', 'Hernández', 'Medina', 'Castro'];

export function generateYouthPlayer(teamId, existingIds) {
    const firstName = youthFirstNames[Math.floor(Math.random() * youthFirstNames.length)];
    const lastName = youthLastNames[Math.floor(Math.random() * youthLastNames.length)];
    const roles = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const position = roleToPosition[role];

    let idNum = 1;
    let id = `${teamId}_y${idNum}`;
    while (existingIds.includes(id)) { idNum++; id = `${teamId}_y${idNum}`; }

    const age = 16 + Math.floor(Math.random() * 3);
    const potential = 60 + Math.floor(Math.random() * 25);
    const current = Math.max(50, potential - 15 + Math.floor(Math.random() * 10));

    const v = () => Math.floor(Math.random() * 12) - 6;
    const stats = { pac: current + v(), sho: current + v(), pas: current + v(), dri: current + v(), def: current + v(), phy: current + v() };
    Object.keys(stats).forEach(k => stats[k] = Math.max(35, Math.min(99, stats[k])));

    const gkStats = position === 'GK' ? { div: current + v(), han: current + v(), kic: current - 10 + v(), ref: current + v(), pos: current + v() } : null;

    const player = { id, name: `${firstName} ${lastName}`, age, position, role, stats, gkStats, stamina: 100, potential, isYouth: true };
    player.overall = calculateOverall(player);
    return player;
}

// Fallback para compatibilidad
export const fallbackPlayerDatabase = playerDatabase;
