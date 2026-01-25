// Context para el estado global del juego
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { teams, generateFixtures, getTeam, getTeamsByLeague, getLeagues } from '../data/teams';
import { playerDatabase, calculateOverall, generateYouthPlayer, roleToPosition } from '../data/players';
import { getFormation, defaultTactics } from '../data/formations';

// Importar overrides (se puede editar manualmente)
import playerOverrides from '../data/player_overrides.json';

// Consumo de stamina por nivel de presión (por minuto de juego)
const STAMINA_CONSUMPTION = {
    low: 0.5,
    medium: 0.8,
    high: 1.2,
};

// Aplicar overrides a lista de jugadores
function applyOverrides(players, overrides) {
    if (!overrides || !overrides.overrides) return players;

    return players.map(player => {
        const override = overrides.overrides[player.id];
        if (!override) return player;

        const updated = { ...player };

        if (override.stats) updated.stats = { ...updated.stats, ...override.stats };
        if (override.gkStats) updated.gkStats = { ...updated.gkStats, ...override.gkStats };
        if (override.name) updated.name = override.name;
        if (override.age) updated.age = override.age;
        if (override.position) updated.position = override.position;
        if (override.role) updated.role = override.role;

        // Recalcular overall si se modificaron stats
        if (override.stats || override.gkStats) {
            updated.overall = calculateOverall(updated);
        }
        // O usar override directo de overall
        if (override.overall !== undefined) {
            updated.overall = override.overall;
        }

        return updated;
    });
}

const initialState = {
    manager: null,
    fixtures: [],
    standings: {},
    allPlayers: {},
    tactics: null,
    loading: true,
    dataSource: 'local',
    messages: [],
    transfers: {
        outgoingOffers: [],  // Ofertas que hicimos
        incomingOffers: [],  // Ofertas que recibimos
        transferList: [],    // Jugadores en venta
    },
    playerLeagueId: null,  // Liga del jugador
};

function reducer(state, action) {
    switch (action.type) {
        case 'LOAD':
            return { ...action.payload, loading: false };

        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'SET_PLAYERS':
            return { ...state, allPlayers: action.players, dataSource: action.source };

        case 'NEW_GAME': {
            const team = getTeam(action.teamId);
            const playerLeagueId = team.leagueId;
            // Generate fixtures ONLY for the player's league
            const fixtures = generateFixtures(playerLeagueId);
            // Standings only for player's league
            const leagueTeams = getTeamsByLeague(playerLeagueId);
            const standings = {};
            leagueTeams.forEach(t => {
                standings[t.id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
            });

            // Mensaje de bienvenida
            const welcomeMessage = {
                id: Date.now(),
                sender: 'Junta Directiva',
                subject: 'Bienvenido al Club',
                body: `Bienvenido a ${team.name}. Esperamos grandes cosas de ti esta temporada. Tu objetivo es consolidar el equipo.`,
                read: false,
                date: new Date().toLocaleDateString(),
                type: 'info'
            };

            // Cargar jugadores de la base de datos local con overrides aplicados
            const allPlayers = {};
            teams.forEach(t => {
                const basePlayers = playerDatabase[t.id] || [];
                allPlayers[t.id] = applyOverrides([...basePlayers], playerOverrides);
            });

            // Configurar táctica inicial
            const myPlayers = allPlayers[action.teamId] || [];
            const formation = getFormation('4-4-2');
            const lineup = autoSelectLineup(myPlayers, formation);
            const substitutes = myPlayers
                .filter(p => !lineup.includes(p.id))
                .slice(0, 7)
                .map(p => p.id);

            const tactics = {
                ...defaultTactics,
                formation: '4-4-2',
                pressure: 'medium',
                captain: lineup[0] || null,
                lineup,
                substitutes,
            };

            return {
                ...state,
                manager: {
                    name: action.name,
                    clubId: action.teamId,
                    budget: team.budget,
                    week: 1,
                    season: 1,
                    matches: 0, wins: 0, draws: 0, losses: 0,
                },
                fixtures,
                standings,
                allPlayers,
                tactics,
                loading: false,
                messages: [welcomeMessage],
                dataSource: 'local',
                playerLeagueId,
                transfers: {
                    outgoingOffers: [],
                    incomingOffers: [],
                    transferList: [],
                },
            };
        }

        case 'UPDATE_TACTICS':
            return {
                ...state,
                tactics: { ...state.tactics, ...action.tactics }
            };

        case 'SET_LINEUP':
            return {
                ...state,
                tactics: {
                    ...state.tactics,
                    lineup: action.lineup,
                    substitutes: action.substitutes
                }
            };

        case 'SET_FORMATION': {
            const formation = getFormation(action.formation);
            const myPlayers = state.allPlayers[state.manager.clubId] || [];
            const lineup = autoSelectLineup(myPlayers, formation);
            const substitutes = myPlayers
                .filter(p => !lineup.includes(p.id))
                .slice(0, 7)
                .map(p => p.id);

            return {
                ...state,
                tactics: {
                    ...state.tactics,
                    formation: action.formation,
                    lineup,
                    substitutes
                }
            };
        }

        case 'MAKE_SUBSTITUTION': {
            const { playerOut, playerIn } = action;
            const newLineup = state.tactics.lineup.map(id =>
                id === playerOut ? playerIn : id
            );
            const newSubs = state.tactics.substitutes.filter(id => id !== playerIn);
            if (playerOut) newSubs.push(playerOut);

            return {
                ...state,
                tactics: {
                    ...state.tactics,
                    lineup: newLineup,
                    substitutes: newSubs,
                    subsUsed: (state.tactics.subsUsed || 0) + 1
                }
            };
        }

        case 'UPDATE_STAMINA': {
            const { teamId, staminaChanges } = action;
            const updatedPlayers = state.allPlayers[teamId].map(p => {
                if (staminaChanges[p.id] !== undefined) {
                    return { ...p, stamina: Math.max(0, Math.min(100, staminaChanges[p.id])) };
                }
                return p;
            });

            return {
                ...state,
                allPlayers: {
                    ...state.allPlayers,
                    [teamId]: updatedPlayers
                }
            };
        }

        case 'RECOVER_STAMINA': {
            const teamId = state.manager.clubId;
            const updatedPlayers = state.allPlayers[teamId].map(p => ({
                ...p,
                stamina: Math.min(100, (p.stamina || 100) + 30)
            }));

            return {
                ...state,
                allPlayers: {
                    ...state.allPlayers,
                    [teamId]: updatedPlayers
                }
            };
        }

        case 'PLAY_MATCH': {
            const { id, hg, ag } = action;
            const fixtures = state.fixtures.map(f =>
                f.id === id ? { ...f, played: true, hg, ag } : f
            );
            const fix = state.fixtures.find(f => f.id === id);
            const standings = { ...state.standings };

            const home = standings[fix.home];
            const away = standings[fix.away];
            home.p++; away.p++;
            home.gf += hg; home.ga += ag;
            away.gf += ag; away.ga += hg;

            if (hg > ag) { home.w++; home.pts += 3; away.l++; }
            else if (ag > hg) { away.w++; away.pts += 3; home.l++; }
            else { home.d++; away.d++; home.pts++; away.pts++; }

            let manager = state.manager;
            if (fix.home === manager.clubId || fix.away === manager.clubId) {
                const isHome = fix.home === manager.clubId;
                const won = isHome ? hg > ag : ag > hg;
                const draw = hg === ag;
                manager = {
                    ...manager,
                    matches: manager.matches + 1,
                    wins: manager.wins + (won ? 1 : 0),
                    draws: manager.draws + (draw ? 1 : 0),
                    losses: manager.losses + (!won && !draw ? 1 : 0),
                };
            }

            const tactics = { ...state.tactics, subsUsed: 0 };

            return { ...state, fixtures, standings, manager, tactics };
        }

        case 'NEXT_WEEK':
            return { ...state, manager: { ...state.manager, week: state.manager.week + 1 } };

        case 'TRANSFER_PLAYER': {
            const { fromTeam, toTeam, playerId, price } = action;
            const allPlayers = { ...state.allPlayers };

            const playerIndex = allPlayers[fromTeam].findIndex(p => p.id === playerId);
            if (playerIndex === -1) return state;

            const player = { ...allPlayers[fromTeam][playerIndex] };

            allPlayers[fromTeam] = allPlayers[fromTeam].filter(p => p.id !== playerId);
            allPlayers[toTeam] = [...allPlayers[toTeam], player];

            let manager = state.manager;
            if (toTeam === manager.clubId) {
                manager = { ...manager, budget: manager.budget - price };
            } else if (fromTeam === manager.clubId) {
                manager = { ...manager, budget: manager.budget + price };
            }

            return { ...state, allPlayers, manager };
        }

        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [action.message, ...state.messages]
            };

        case 'READ_MESSAGE':
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === action.id ? { ...msg, read: true } : msg
                )
            };

        // Simular todos los partidos de la jornada actual (excepto el del jugador)
        case 'SIMULATE_WEEK': {
            const week = state.manager.week;
            const myClub = state.manager.clubId;

            // Find all matches for this week that aren't played and don't involve player
            const weekMatches = state.fixtures.filter(f =>
                f.week === week && !f.played && f.home !== myClub && f.away !== myClub
            );

            if (weekMatches.length === 0) return state;

            let fixtures = [...state.fixtures];
            let standings = { ...state.standings };

            weekMatches.forEach(match => {
                // Simple simulation based on team reputation
                const homeTeam = getTeam(match.home);
                const awayTeam = getTeam(match.away);
                const homeStrength = (homeTeam?.rep || 50) + 10; // Home advantage
                const awayStrength = awayTeam?.rep || 50;
                const total = homeStrength + awayStrength;

                // Generate goals based on strength
                const homeExpected = (homeStrength / total) * 3;
                const awayExpected = (awayStrength / total) * 2.5;

                const hg = Math.floor(Math.random() * (homeExpected + 1.5));
                const ag = Math.floor(Math.random() * (awayExpected + 1.5));

                // Update fixture
                fixtures = fixtures.map(f =>
                    f.id === match.id ? { ...f, played: true, hg, ag } : f
                );

                // Update standings
                const home = { ...standings[match.home] };
                const away = { ...standings[match.away] };

                home.p++; away.p++;
                home.gf += hg; home.ga += ag;
                away.gf += ag; away.ga += hg;

                if (hg > ag) { home.w++; home.pts += 3; away.l++; }
                else if (ag > hg) { away.w++; away.pts += 3; home.l++; }
                else { home.d++; away.d++; home.pts++; away.pts++; }

                standings[match.home] = home;
                standings[match.away] = away;
            });

            return { ...state, fixtures, standings };
        }

        // Transfer system actions
        case 'MAKE_TRANSFER_OFFER': {
            const { playerId, playerTeamId, offerAmount } = action;
            const offer = {
                id: Date.now(),
                playerId,
                playerTeamId,
                offerAmount,
                status: 'pending',
                date: new Date().toISOString(),
            };
            return {
                ...state,
                transfers: {
                    ...state.transfers,
                    outgoingOffers: [...state.transfers.outgoingOffers, offer]
                }
            };
        }

        case 'RESPOND_TO_OFFER': {
            const { offerId, response, counterOffer } = action;
            const outgoing = state.transfers.outgoingOffers.map(o => {
                if (o.id === offerId) {
                    return { ...o, status: response, counterOffer };
                }
                return o;
            });
            return {
                ...state,
                transfers: { ...state.transfers, outgoingOffers: outgoing }
            };
        }

        case 'ADD_TO_TRANSFER_LIST': {
            const { playerId, askingPrice } = action;
            const newList = [...state.transfers.transferList, { playerId, askingPrice }];
            return {
                ...state,
                transfers: { ...state.transfers, transferList: newList }
            };
        }

        case 'REMOVE_FROM_TRANSFER_LIST': {
            const filtered = state.transfers.transferList.filter(t => t.playerId !== action.playerId);
            return {
                ...state,
                transfers: { ...state.transfers, transferList: filtered }
            };
        }

        default:
            return state;
    }
}

// Auto-seleccionar 11 titulares basado en formación
function autoSelectLineup(players, formation) {
    const lineup = [];
    const usedPlayers = new Set();

    formation.positions.forEach(pos => {
        const candidates = players
            .filter(p => !usedPlayers.has(p.id))
            .filter(p => isCompatibleRole(p.role, pos.role))
            .sort((a, b) => {
                const aScore = (a.overall || 60) * ((a.stamina || 100) / 100);
                const bScore = (b.overall || 60) * ((b.stamina || 100) / 100);
                return bScore - aScore;
            });

        if (candidates.length > 0) {
            lineup.push(candidates[0].id);
            usedPlayers.add(candidates[0].id);
        } else {
            const any = players.find(p => !usedPlayers.has(p.id));
            if (any) {
                lineup.push(any.id);
                usedPlayers.add(any.id);
            }
        }
    });

    return lineup;
}

function isCompatibleRole(playerRole, positionRole) {
    const compat = {
        'GK': ['GK'],
        'CB': ['CB'],
        'LB': ['LB', 'RB'],
        'RB': ['RB', 'LB'],
        'CDM': ['CDM', 'CM'],
        'CM': ['CM', 'CDM', 'CAM'],
        'CAM': ['CAM', 'CM', 'LW', 'RW'],
        'LW': ['LW', 'RW', 'CAM', 'ST'],
        'RW': ['RW', 'LW', 'CAM', 'ST'],
        'ST': ['ST', 'CAM', 'LW', 'RW']
    };
    return compat[playerRole]?.includes(positionRole) || playerRole === positionRole;
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => { loadGame(); }, []);

    useEffect(() => {
        if (state.manager && !state.loading) saveGame();
    }, [state.manager, state.fixtures, state.tactics, state.allPlayers]);

    const loadGame = async () => {
        try {
            const data = await AsyncStorage.getItem('gameState');
            if (data) {
                const parsed = JSON.parse(data);
                // Re-aplicar overrides a jugadores cargados
                if (parsed.allPlayers) {
                    Object.keys(parsed.allPlayers).forEach(teamId => {
                        parsed.allPlayers[teamId] = applyOverrides(parsed.allPlayers[teamId], playerOverrides);
                    });
                }
                dispatch({ type: 'LOAD', payload: parsed });
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        } catch (e) {
            console.error('Error loading game:', e);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const saveGame = async () => {
        try {
            await AsyncStorage.setItem('gameState', JSON.stringify({
                manager: state.manager,
                fixtures: state.fixtures,
                standings: state.standings,
                allPlayers: state.allPlayers,
                tactics: state.tactics,
                dataSource: state.dataSource,
                messages: state.messages,
            }));
        } catch (e) {
            console.error('Error saving game:', e);
        }
    };

    const getNextMatch = () => {
        if (!state.manager) return null;
        return state.fixtures.find(f =>
            !f.played && (f.home === state.manager.clubId || f.away === state.manager.clubId)
        );
    };

    const getStandings = () => {
        return Object.entries(state.standings)
            .map(([id, s]) => ({ id, ...s }))
            .sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    };

    const getPosition = () => {
        const sorted = getStandings();
        return sorted.findIndex(s => s.id === state.manager?.clubId) + 1;
    };

    const getMyPlayers = () => {
        if (!state.manager) return [];
        return state.allPlayers[state.manager.clubId] || [];
    };

    const getPlayer = (playerId) => {
        for (const players of Object.values(state.allPlayers)) {
            const player = players.find(p => p.id === playerId);
            if (player) return player;
        }
        return null;
    };

    const getLineupWithPlayers = () => {
        if (!state.tactics) return [];
        return state.tactics.lineup.map(id => getPlayer(id)).filter(Boolean);
    };

    const getSubstitutesWithPlayers = () => {
        if (!state.tactics) return [];
        return state.tactics.substitutes.map(id => getPlayer(id)).filter(Boolean);
    };

    const consumeStamina = (minutes) => {
        if (!state.manager || !state.tactics) return;

        const pressure = state.tactics.pressure || 'medium';
        const consumption = STAMINA_CONSUMPTION[pressure] * minutes;

        const staminaChanges = {};
        state.tactics.lineup.forEach(playerId => {
            const player = getPlayer(playerId);
            if (player) {
                staminaChanges[playerId] = (player.stamina || 100) - consumption;
            }
        });

        dispatch({
            type: 'UPDATE_STAMINA',
            teamId: state.manager.clubId,
            staminaChanges
        });
    };

    const recoverSubsStamina = () => {
        if (!state.manager || !state.tactics) return;

        const staminaChanges = {};
        state.tactics.substitutes.forEach(playerId => {
            const player = getPlayer(playerId);
            if (player) {
                staminaChanges[playerId] = Math.min(100, (player.stamina || 100) + 5);
            }
        });

        if (Object.keys(staminaChanges).length > 0) {
            dispatch({
                type: 'UPDATE_STAMINA',
                teamId: state.manager.clubId,
                staminaChanges
            });
        }
    };
    /* Removed extra closing brace */

    const addMessage = (sender, subject, body, type = 'info') => {
        const message = {
            id: Date.now(),
            sender,
            subject,
            body,
            read: false,
            date: new Date().toLocaleDateString(),
            type
        };
        dispatch({ type: 'ADD_MESSAGE', message });
    };

    const markMessageAsRead = (id) => {
        dispatch({ type: 'READ_MESSAGE', id });
    };

    return (
        <GameContext.Provider value={{
            state,
            dispatch,
            teams,
            getTeam,
            getNextMatch,
            getStandings,
            getPosition,
            saveGame,
            getMyPlayers,
            getPlayer,
            getLineupWithPlayers,
            getSubstitutesWithPlayers,
            consumeStamina,
            recoverSubsStamina,
            STAMINA_CONSUMPTION,
            addMessage,
            markMessageAsRead,
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be inside GameProvider');
    return ctx;
}
