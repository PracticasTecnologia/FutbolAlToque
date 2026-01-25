// Pantalla de Partido - Simulación con stamina y velocidad configurable
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, Alert, BackHandler, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';

// Speed configurations (ms per game minute)
const SPEED_CONFIG = {
    normal: 600,    // 45 min = 27 seconds
    fast: 350,      // 45 min = ~16 seconds
    turbo: 150,     // 45 min = ~7 seconds
};

export default function MatchScreen({ navigation, route }) {
    const { matchId } = route.params;
    const {
        state, getTeam, getPlayer, getLineupWithPlayers, getSubstitutesWithPlayers,
        dispatch, consumeStamina, recoverSubsStamina, STAMINA_CONSUMPTION
    } = useGame();

    const match = state.fixtures.find(f => f.id === matchId);
    const home = match ? getTeam(match.home) : null;
    const away = match ? getTeam(match.away) : null;
    const isHomeTeam = match?.home === state.manager?.clubId;

    const [status, setStatus] = useState('ready');
    const [min, setMin] = useState(0);
    const [hg, setHg] = useState(0);
    const [ag, setAg] = useState(0);
    const [events, setEvents] = useState([]);
    const [paused, setPaused] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);
    const [selectedOut, setSelectedOut] = useState(null);
    const [stats, setStats] = useState({ homePoss: 50, awayPoss: 50, homeShots: 0, awayShots: 0 });
    const [matchSpeed, setMatchSpeed] = useState('fast');

    const timer = useRef(null);
    const staminaTimer = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const lineup = getLineupWithPlayers();
    const substitutes = getSubstitutesWithPlayers();
    const subsUsed = state.tactics?.subsUsed || 0;
    const maxSubs = 5;
    const pressure = state.tactics?.pressure || 'medium';

    // Pulse animation for live indicator
    useEffect(() => {
        if (status === 'first' || status === 'second') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [status]);

    // BLOQUEAR NAVEGACIÓN DURANTE PARTIDO EN CURSO
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (status === 'end' || status === 'ready') return;
            e.preventDefault();
            Alert.alert(
                '¿Abandonar partido?',
                'Si sales ahora, perderás el partido 3-0. ¿Estás seguro?',
                [
                    { text: 'Continuar jugando', style: 'cancel' },
                    {
                        text: 'Abandonar',
                        style: 'destructive',
                        onPress: () => {
                            clearInterval(timer.current);
                            clearInterval(staminaTimer.current);
                            const finalHg = isHomeTeam ? 0 : 3;
                            const finalAg = isHomeTeam ? 3 : 0;
                            dispatch({ type: 'PLAY_MATCH', id: matchId, hg: finalHg, ag: finalAg });
                            dispatch({ type: 'SIMULATE_WEEK' });
                            dispatch({ type: 'NEXT_WEEK' });
                            dispatch({ type: 'RECOVER_STAMINA' });
                            navigation.dispatch(e.data.action);
                        },
                    },
                ]
            );
        });
        return unsubscribe;
    }, [navigation, status, isHomeTeam, matchId]);

    // Android back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (status !== 'end' && status !== 'ready') {
                Alert.alert('¿Abandonar partido?', 'Si sales ahora, perderás 3-0.', [
                    { text: 'Continuar', style: 'cancel' },
                    {
                        text: 'Abandonar', style: 'destructive',
                        onPress: () => {
                            clearInterval(timer.current);
                            clearInterval(staminaTimer.current);
                            const finalHg = isHomeTeam ? 0 : 3;
                            const finalAg = isHomeTeam ? 3 : 0;
                            dispatch({ type: 'PLAY_MATCH', id: matchId, hg: finalHg, ag: finalAg });
                            dispatch({ type: 'SIMULATE_WEEK' });
                            dispatch({ type: 'NEXT_WEEK' });
                            dispatch({ type: 'RECOVER_STAMINA' });
                            navigation.goBack();
                        },
                    },
                ]);
                return true;
            }
            return false;
        });
        return () => backHandler.remove();
    }, [status, isHomeTeam, matchId]);

    // Stamina consumption
    useEffect(() => {
        if ((status === 'first' || status === 'second') && !paused) {
            const staminaInterval = SPEED_CONFIG[matchSpeed] * 2;
            staminaTimer.current = setInterval(() => {
                consumeStamina(2);
                recoverSubsStamina();
            }, staminaInterval);
        } else {
            clearInterval(staminaTimer.current);
        }
        return () => clearInterval(staminaTimer.current);
    }, [status, paused, matchSpeed]);

    // Match timer
    useEffect(() => {
        if ((status === 'first' || status === 'second') && !paused) {
            timer.current = setInterval(() => {
                setMin(m => {
                    const next = m + 1;
                    const avgStamina = lineup.reduce((acc, p) => acc + (p?.stamina || 100), 0) / lineup.length;
                    const eventChance = 0.1 * (avgStamina / 100);
                    if (Math.random() < eventChance) generateEvent(next);
                    updateStats();

                    if (status === 'first' && next >= 45) {
                        clearInterval(timer.current);
                        setStatus('half');
                        addEvent(45, '⏸️', 'Fin del primer tiempo', 'system');
                    } else if (status === 'second' && next >= 90) {
                        clearInterval(timer.current);
                        setStatus('end');
                        addEvent(90, '🏁', '¡Final del partido!', 'system');
                    }
                    return next;
                });
            }, SPEED_CONFIG[matchSpeed]);
        } else {
            clearInterval(timer.current);
        }
        return () => clearInterval(timer.current);
    }, [status, paused, lineup, matchSpeed]);

    const addEvent = (minute, icon, text, type) => {
        setEvents(prev => [...prev, { minute, icon, text, type, id: Date.now() }]);
    };

    const generateEvent = (minute) => {
        const rand = Math.random();
        const isHome = Math.random() < 0.5;
        const team = isHome ? home : away;

        // Get players for both teams
        const myTeamPlayers = lineup;
        const opponentTeamId = isHomeTeam ? match.away : match.home;
        const opponentPlayers = state.allPlayers[opponentTeamId] || [];

        // Determine which team's players to use based on event
        const isMyTeamEvent = (isHome && isHomeTeam) || (!isHome && !isHomeTeam);
        const teamPlayers = isMyTeamEvent ? myTeamPlayers : opponentPlayers;

        const avgStamina = lineup.reduce((acc, p) => acc + (p?.stamina || 100), 0) / lineup.length;
        const staminaBonus = avgStamina / 100;

        // Get a random player name, preferring attackers for goals
        const getRandomPlayer = (players, preferAttackers = false) => {
            if (!players || players.length === 0) return 'Jugador';

            if (preferAttackers) {
                const attackers = players.filter(p => ['ST', 'LW', 'RW', 'CAM', 'CF'].includes(p.role));
                if (attackers.length > 0 && Math.random() < 0.7) {
                    return attackers[Math.floor(Math.random() * attackers.length)]?.name || 'Jugador';
                }
            }
            return players[Math.floor(Math.random() * players.length)]?.name || 'Jugador';
        };

        if (rand < 0.25) {
            const goalChance = isMyTeamEvent ? 0.5 + (staminaBonus * 0.2) : 0.5;
            if (Math.random() < goalChance) {
                const scorer = getRandomPlayer(teamPlayers, true);
                if (isHome) setHg(g => g + 1);
                else setAg(g => g + 1);
                addEvent(minute, '⚽', `${minute}' ¡GOOOOL de ${team?.shortName}! ${scorer}`, isHome ? 'home' : 'away');
            }
        } else if (rand < 0.6) {
            setStats(s => ({
                ...s,
                homeShots: s.homeShots + (isHome ? 1 : 0),
                awayShots: s.awayShots + (isHome ? 0 : 1),
            }));
        } else if (rand < 0.75) {
            const carded = getRandomPlayer(teamPlayers);
            addEvent(minute, '🟨', `${minute}' Tarjeta amarilla - ${carded}`, isHome ? 'home' : 'away');
        } else if (rand < 0.78) {
            const carded = getRandomPlayer(teamPlayers);
            addEvent(minute, '🟥', `${minute}' ¡TARJETA ROJA! - ${carded}`, isHome ? 'home' : 'away');
        }
    };

    const updateStats = () => {
        const avgStamina = lineup.reduce((acc, p) => acc + (p?.stamina || 100), 0) / lineup.length;
        const staminaFactor = avgStamina / 100;
        setStats(s => {
            const homePossBase = isHomeTeam ? 50 + (staminaFactor * 10) : 50 - (staminaFactor * 5);
            const homePoss = Math.max(35, Math.min(65, homePossBase + (Math.random() * 10 - 5)));
            return { ...s, homePoss: Math.round(homePoss), awayPoss: Math.round(100 - homePoss) };
        });
    };

    const startMatch = () => {
        setStatus('first');
        addEvent(0, '🏟️', '¡Comienza el partido!', 'system');
    };

    const startSecondHalf = () => {
        setStatus('second');
        addEvent(45, '🏟️', '¡Comienza el segundo tiempo!', 'system');
    };

    const finishMatch = () => {
        dispatch({ type: 'PLAY_MATCH', id: matchId, hg, ag });
        dispatch({ type: 'SIMULATE_WEEK' });
        dispatch({ type: 'NEXT_WEEK' });
        dispatch({ type: 'RECOVER_STAMINA' });
        navigation.goBack();
    };

    const makeSubstitution = (playerIn) => {
        if (selectedOut && playerIn) {
            dispatch({ type: 'MAKE_SUBSTITUTION', playerOut: selectedOut.id, playerIn: playerIn.id });
            addEvent(min, '🔄', `Cambio: Sale ${selectedOut.name}, entra ${playerIn.name}`, 'sub');
            setSelectedOut(null);
            setShowSubModal(false);
        }
    };

    const getStaminaColor = (stamina) => {
        if (stamina >= 70) return '#10B981';
        if (stamina >= 40) return '#F59E0B';
        return '#EF4444';
    };

    const cycleSpeed = () => {
        const speeds = ['normal', 'fast', 'turbo'];
        const current = speeds.indexOf(matchSpeed);
        setMatchSpeed(speeds[(current + 1) % speeds.length]);
    };

    if (!match || !home || !away) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.error}>Partido no encontrado</Text>
            </SafeAreaView>
        );
    }

    const myTeamScore = isHomeTeam ? hg : ag;
    const oppTeamScore = isHomeTeam ? ag : hg;
    const isWinning = myTeamScore > oppTeamScore;
    const isLosing = myTeamScore < oppTeamScore;

    return (
        <View style={styles.container}>
            {/* Gradient Background based on match status */}
            <LinearGradient
                colors={isWinning ? ['#064E3B', '#0D1117'] : isLosing ? ['#7F1D1D', '#0D1117'] : ['#1E3A5F', '#0D1117']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    {status !== 'end' && status !== 'ready' && (
                        <Animated.View style={[styles.liveIndicator, { opacity: pulseAnim }]}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>EN VIVO</Text>
                        </Animated.View>
                    )}
                    <View style={styles.timeContainer}>
                        <Text style={styles.headerMin}>{min}'</Text>
                        <Text style={styles.halfText}>
                            {status === 'first' ? '1T' : status === 'second' ? '2T' : status === 'half' ? 'Descanso' : ''}
                        </Text>
                    </View>
                    {(status === 'first' || status === 'second') && (
                        <TouchableOpacity onPress={cycleSpeed} style={styles.speedBtn}>
                            <Text style={styles.speedText}>
                                {matchSpeed === 'normal' ? '1x' : matchSpeed === 'fast' ? '2x' : '3x'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Scoreboard */}
                <View style={styles.scoreBoard}>
                    <View style={styles.teamSection}>
                        <View style={[styles.teamBadge, { backgroundColor: home.color || '#333' }]}>
                            <Text style={styles.teamInitials}>{home.shortName?.charAt(0)}</Text>
                        </View>
                        <Text style={styles.teamName}>{home.shortName}</Text>
                        {isHomeTeam && <View style={styles.myTeamIndicator}><Text style={styles.myTeamText}>TÚ</Text></View>}
                    </View>

                    <View style={styles.scoreSection}>
                        <Text style={styles.score}>{hg}</Text>
                        <Text style={styles.scoreDivider}>:</Text>
                        <Text style={styles.score}>{ag}</Text>
                    </View>

                    <View style={styles.teamSection}>
                        <View style={[styles.teamBadge, { backgroundColor: away.color || '#333' }]}>
                            <Text style={styles.teamInitials}>{away.shortName?.charAt(0)}</Text>
                        </View>
                        <Text style={styles.teamName}>{away.shortName}</Text>
                        {!isHomeTeam && <View style={styles.myTeamIndicator}><Text style={styles.myTeamText}>TÚ</Text></View>}
                    </View>
                </View>

                {/* Stats Bar */}
                {status !== 'ready' && (
                    <View style={styles.statsBar}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.homePoss}%</Text>
                            <View style={styles.possessionBar}>
                                <View style={[styles.possessionFill, { width: `${stats.homePoss}%`, backgroundColor: '#10B981' }]} />
                            </View>
                            <Text style={styles.statValue}>{stats.awayPoss}%</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>{stats.homeShots}</Text>
                            <Text style={styles.statLabelCenter}>Tiros</Text>
                            <Text style={styles.statLabel}>{stats.awayShots}</Text>
                        </View>
                    </View>
                )}

                {/* Team Stamina */}
                {status !== 'ready' && status !== 'end' && isHomeTeam && (
                    <View style={styles.staminaCard}>
                        <View style={styles.staminaHeader}>
                            <Text style={styles.staminaLabel}>Energía del equipo</Text>
                            <Text style={styles.pressureLabel}>
                                {pressure === 'high' ? '🔥 Alta' : pressure === 'medium' ? '⚡ Media' : '🛡️ Baja'}
                            </Text>
                        </View>
                        {(() => {
                            const avgStamina = Math.round(lineup.reduce((acc, p) => acc + (p?.stamina || 100), 0) / Math.max(1, lineup.length));
                            return (
                                <View style={styles.staminaBarContainer}>
                                    <View style={[styles.staminaBarFill, { width: `${avgStamina}%`, backgroundColor: getStaminaColor(avgStamina) }]} />
                                    <Text style={styles.staminaValue}>{avgStamina}%</Text>
                                </View>
                            );
                        })()}
                    </View>
                )}

                {/* Events Feed */}
                <ScrollView style={styles.eventsFeed} contentContainerStyle={styles.eventsContent}>
                    {events.slice().reverse().map(e => (
                        <View key={e.id} style={[
                            styles.eventCard,
                            e.type === 'home' && styles.eventHome,
                            e.type === 'away' && styles.eventAway,
                            e.type === 'sub' && styles.eventSub,
                            e.type === 'system' && styles.eventSystem,
                        ]}>
                            <Text style={styles.eventIcon}>{e.icon}</Text>
                            <Text style={styles.eventText}>{e.text}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    {status === 'ready' && (
                        <TouchableOpacity style={styles.primaryBtn} onPress={startMatch}>
                            <LinearGradient colors={['#10B981', '#059669']} style={styles.btnGradient}>
                                <Text style={styles.primaryBtnText}>⚽ COMENZAR PARTIDO</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {(status === 'first' || status === 'second') && (
                        <View style={styles.matchControls}>
                            <TouchableOpacity style={[styles.controlBtn, paused && styles.pausedBtn]} onPress={() => setPaused(!paused)}>
                                <Text style={styles.controlBtnText}>{paused ? '▶️ Reanudar' : '⏸️ Pausar'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.controlBtn, styles.subBtn, subsUsed >= maxSubs && styles.disabledBtn]}
                                onPress={() => subsUsed < maxSubs && setShowSubModal(true)}
                                disabled={subsUsed >= maxSubs}
                            >
                                <Text style={styles.controlBtnText}>🔄 Cambios ({subsUsed}/{maxSubs})</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {status === 'half' && (
                        <View style={styles.halfTimeContainer}>
                            <Text style={styles.halfTimeTitle}>⏸️ ENTRETIEMPO</Text>
                            <View style={styles.halfTimeStats}>
                                <Text style={styles.halfTimeStatText}>Posesión: {stats.homePoss}% - {stats.awayPoss}%</Text>
                                <Text style={styles.halfTimeStatText}>Tiros: {stats.homeShots} - {stats.awayShots}</Text>
                            </View>
                            <TouchableOpacity style={styles.primaryBtn} onPress={startSecondHalf}>
                                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.btnGradient}>
                                    <Text style={styles.primaryBtnText}>▶️ SEGUNDO TIEMPO</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {status === 'end' && (
                        <View style={styles.endContainer}>
                            <Text style={styles.endTitle}>
                                {isWinning ? '🏆 ¡VICTORIA!' : isLosing ? '😔 Derrota' : '🤝 Empate'}
                            </Text>
                            <TouchableOpacity style={styles.primaryBtn} onPress={finishMatch}>
                                <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.btnGradient}>
                                    <Text style={styles.primaryBtnText}>✓ FINALIZAR</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Substitution Modal - Simplified */}
                <Modal visible={showSubModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {selectedOut ? `Elegir reemplazo para ${selectedOut.name}` : '¿Quién sale del campo?'}
                            </Text>

                            <FlatList
                                data={selectedOut ? substitutes : lineup}
                                keyExtractor={item => item?.id || Math.random().toString()}
                                numColumns={2}
                                contentContainerStyle={styles.playerGrid}
                                renderItem={({ item }) => {
                                    if (!item) return null;
                                    const stamina = item.stamina || 100;
                                    return (
                                        <TouchableOpacity
                                            style={styles.playerCard}
                                            onPress={() => selectedOut ? makeSubstitution(item) : setSelectedOut(item)}
                                        >
                                            <View style={[styles.playerCardBadge, { backgroundColor: getStaminaColor(stamina) }]}>
                                                <Text style={styles.playerCardOverall}>{item.overall}</Text>
                                            </View>
                                            <Text style={styles.playerCardName} numberOfLines={1}>{item.name.split(' ').pop()}</Text>
                                            <Text style={styles.playerCardRole}>{item.role}</Text>
                                            <View style={styles.playerCardStamina}>
                                                <View style={[styles.miniStaminaBar, { width: `${stamina}%`, backgroundColor: getStaminaColor(stamina) }]} />
                                            </View>
                                            <Text style={styles.playerCardStaminaText}>{stamina}%</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />

                            <View style={styles.modalActions}>
                                {selectedOut && (
                                    <TouchableOpacity style={styles.modalBackBtn} onPress={() => setSelectedOut(null)}>
                                        <Text style={styles.modalBtnText}>← Volver</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowSubModal(false); setSelectedOut(null); }}>
                                    <Text style={styles.modalBtnText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D1117' },
    safeArea: { flex: 1 },
    error: { color: '#EF4444', textAlign: 'center', marginTop: 50, fontSize: 16 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 16,
    },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', position: 'absolute', left: 20 },
    liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginRight: 6 },
    liveText: { color: '#EF4444', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
    timeContainer: { alignItems: 'center' },
    headerMin: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
    halfText: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
    speedBtn: { position: 'absolute', right: 20, backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    speedText: { color: '#10B981', fontSize: 14, fontWeight: 'bold' },

    scoreBoard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    teamSection: { flex: 1, alignItems: 'center' },
    teamBadge: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    teamInitials: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    teamName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    myTeamIndicator: { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
    myTeamText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
    scoreSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
    score: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold' },
    scoreDivider: { color: '#6B7280', fontSize: 36, marginHorizontal: 8 },

    statsBar: {
        marginHorizontal: 16,
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
    },
    statItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    statValue: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', width: 45, textAlign: 'center' },
    statLabel: { color: '#9CA3AF', fontSize: 12, width: 45, textAlign: 'center' },
    statLabelCenter: { color: '#6B7280', fontSize: 11, textAlign: 'center' },
    possessionBar: { flex: 1, height: 6, backgroundColor: '#374151', borderRadius: 3, marginHorizontal: 10, overflow: 'hidden' },
    possessionFill: { height: '100%', borderRadius: 3 },

    staminaCard: {
        marginHorizontal: 16,
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    staminaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    staminaLabel: { color: '#9CA3AF', fontSize: 12 },
    pressureLabel: { color: '#F59E0B', fontSize: 12 },
    staminaBarContainer: { height: 24, backgroundColor: '#1F2937', borderRadius: 12, overflow: 'hidden', justifyContent: 'center' },
    staminaBarFill: { height: '100%', borderRadius: 12, position: 'absolute', left: 0 },
    staminaValue: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },

    eventsFeed: { flex: 1, marginTop: 12 },
    eventsContent: { paddingHorizontal: 16, paddingBottom: 12 },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    eventHome: { borderLeftColor: '#10B981' },
    eventAway: { borderLeftColor: '#EF4444' },
    eventSub: { borderLeftColor: '#3B82F6' },
    eventSystem: { borderLeftColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.1)' },
    eventIcon: { fontSize: 20, marginRight: 12 },
    eventText: { flex: 1, color: '#E5E7EB', fontSize: 13 },

    controlsContainer: { padding: 16 },
    primaryBtn: { borderRadius: 16, overflow: 'hidden' },
    btnGradient: { paddingVertical: 16, alignItems: 'center' },
    primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

    matchControls: { flexDirection: 'row', gap: 12 },
    controlBtn: { flex: 1, backgroundColor: '#374151', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    pausedBtn: { backgroundColor: '#059669' },
    subBtn: { backgroundColor: '#2563EB' },
    disabledBtn: { backgroundColor: '#1F2937', opacity: 0.5 },
    controlBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

    halfTimeContainer: { alignItems: 'center' },
    halfTimeTitle: { color: '#F59E0B', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    halfTimeStats: { marginBottom: 20 },
    halfTimeStatText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 4 },

    endContainer: { alignItems: 'center' },
    endTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1F2937', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '75%' },
    modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
    playerGrid: { paddingBottom: 12 },
    playerCard: {
        flex: 1,
        margin: 6,
        padding: 12,
        backgroundColor: '#374151',
        borderRadius: 16,
        alignItems: 'center',
        maxWidth: '48%',
    },
    playerCardBadge: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    playerCardOverall: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    playerCardName: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    playerCardRole: { color: '#9CA3AF', fontSize: 11, marginBottom: 8 },
    playerCardStamina: { width: '100%', height: 4, backgroundColor: '#1F2937', borderRadius: 2, overflow: 'hidden' },
    miniStaminaBar: { height: '100%' },
    playerCardStaminaText: { color: '#9CA3AF', fontSize: 10, marginTop: 4 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
    modalBackBtn: { flex: 1, backgroundColor: '#4B5563', padding: 14, borderRadius: 12, alignItems: 'center' },
    modalCancelBtn: { flex: 1, backgroundColor: 'rgba(239,68,68,0.2)', padding: 14, borderRadius: 12, alignItems: 'center' },
    modalBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
