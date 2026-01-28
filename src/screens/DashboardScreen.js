// Pantalla Dashboard - Hub principal (MEJORADO con historial, racha y próximos rivales)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { formatMoney, getTeam as getTeamData } from '../data/teams';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
    const { state, getTeam, getNextMatch, getPosition, saveGame } = useGame();
    const { manager } = state;

    if (!manager) {
        navigation.replace('Menu');
        return null;
    }

    const team = getTeam(manager.clubId);
    const next = getNextMatch();
    const pos = getPosition();
    const unreadMessages = state.messages?.filter(m => !m.read).length || 0;

    // Obtener últimos 5 partidos jugados
    const getLastMatches = () => {
        return state.fixtures
            .filter(f => f.played && (f.home === manager.clubId || f.away === manager.clubId))
            .sort((a, b) => b.week - a.week)
            .slice(0, 5);
    };

    // Obtener próximos 3 partidos
    const getUpcomingMatches = () => {
        return state.fixtures
            .filter(f => !f.played && (f.home === manager.clubId || f.away === manager.clubId))
            .sort((a, b) => a.week - b.week)
            .slice(0, 3);
    };

    // Calcular racha actual
    const getStreak = () => {
        const lastMatches = getLastMatches();
        if (lastMatches.length === 0) return { type: 'none', count: 0 };

        let streakType = null;
        let count = 0;

        for (const match of lastMatches) {
            const isHome = match.home === manager.clubId;
            const myGoals = isHome ? match.hg : match.ag;
            const oppGoals = isHome ? match.ag : match.hg;

            let result;
            if (myGoals > oppGoals) result = 'W';
            else if (myGoals < oppGoals) result = 'L';
            else result = 'D';

            if (streakType === null) {
                streakType = result;
                count = 1;
            } else if (streakType === result) {
                count++;
            } else {
                break;
            }
        }

        return { type: streakType, count };
    };

    const handleSave = async () => {
        await saveGame();
        Alert.alert('✅ Guardado', 'Partida guardada correctamente');
    };

    const lastMatches = getLastMatches();
    const upcomingMatches = getUpcomingMatches();
    const streak = getStreak();

    const getResultInfo = (match) => {
        const isHome = match.home === manager.clubId;
        const myGoals = isHome ? match.hg : match.ag;
        const oppGoals = isHome ? match.ag : match.hg;
        const opponent = isHome ? getTeam(match.away) : getTeam(match.home);

        if (myGoals > oppGoals) return { icon: '✅', color: '#10B981', text: 'V', opponent, score: `${myGoals}-${oppGoals}` };
        if (myGoals < oppGoals) return { icon: '❌', color: '#EF4444', text: 'D', opponent, score: `${myGoals}-${oppGoals}` };
        return { icon: '🤝', color: '#F59E0B', text: 'E', opponent, score: `${myGoals}-${oppGoals}` };
    };

    const menuItems = [
        { icon: '📊', label: 'Tabla', screen: 'Standings', color: '#3B82F6' },
        { icon: '👥', label: 'Plantilla', screen: 'Squad', color: '#8B5CF6' },
        { icon: '⚽', label: 'Táctica', screen: 'Tactics', color: '#10B981' },
        { icon: '💰', label: 'Fichajes', screen: 'TransferHub', color: '#F59E0B' },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1A2332', '#0D1117']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.teamInfo}
                        onPress={() => navigation.navigate('Manager')}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={[team.color || '#333', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.teamBadge}
                        >
                            <Text style={styles.teamInitial}>{team.shortName?.charAt(0)}</Text>
                        </LinearGradient>
                        <View style={styles.headerText}>
                            <Text style={styles.teamName}>{team.name}</Text>
                            <Text style={styles.dtInfo}>DT: {manager.name} • {team.leagueName}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.inboxBtn}
                            onPress={() => navigation.navigate('Inbox')}
                        >
                            <Text style={styles.inboxIcon}>📩</Text>
                            {unreadMessages > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{unreadMessages}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Budget Bar */}
                <View style={styles.budgetBar}>
                    <View style={styles.budgetItem}>
                        <Text style={styles.budgetLabel}>Presupuesto</Text>
                        <Text style={styles.budgetValue}>{formatMoney(manager.budget)}</Text>
                    </View>
                    <View style={styles.budgetDivider} />
                    <View style={styles.budgetItem}>
                        <Text style={styles.budgetLabel}>Jornada</Text>
                        <Text style={styles.budgetValue}>{manager.week}</Text>
                    </View>
                    <View style={styles.budgetDivider} />
                    <View style={styles.budgetItem}>
                        <Text style={styles.budgetLabel}>Temporada</Text>
                        <Text style={styles.budgetValue}>{manager.season}</Text>
                    </View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Position & Stats Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>📊 Posición en la Liga</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Standings')}>
                                <Text style={styles.cardAction}>Ver tabla →</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.positionContainer}>
                            <View style={styles.positionCircle}>
                                <Text style={styles.positionNumber}>{pos}°</Text>
                            </View>

                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>{manager.matches}</Text>
                                    <Text style={styles.statLabel}>Jugados</Text>
                                </View>
                                <View style={[styles.statCard, styles.statCardWin]}>
                                    <Text style={[styles.statNumber, styles.greenText]}>{manager.wins}</Text>
                                    <Text style={styles.statLabel}>Victorias</Text>
                                </View>
                                <View style={[styles.statCard, styles.statCardDraw]}>
                                    <Text style={[styles.statNumber, styles.yellowText]}>{manager.draws}</Text>
                                    <Text style={styles.statLabel}>Empates</Text>
                                </View>
                                <View style={[styles.statCard, styles.statCardLoss]}>
                                    <Text style={[styles.statNumber, styles.redText]}>{manager.losses}</Text>
                                    <Text style={styles.statLabel}>Derrotas</Text>
                                </View>
                            </View>
                        </View>

                        {/* Recent Form & Streak */}
                        {lastMatches.length > 0 && (
                            <View style={styles.formSection}>
                                <View style={styles.formRow}>
                                    <Text style={styles.formLabel}>Últimos partidos</Text>
                                    <View style={styles.formIcons}>
                                        {lastMatches.map((match, index) => {
                                            const result = getResultInfo(match);
                                            return (
                                                <View
                                                    key={match.id}
                                                    style={[styles.formDot, { backgroundColor: result.color }]}
                                                >
                                                    <Text style={styles.formDotText}>{result.text}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                                {streak.count >= 2 && (
                                    <View style={styles.streakBadge}>
                                        <Text style={styles.streakText}>
                                            {streak.type === 'W' ? '🔥' : streak.type === 'L' ? '📉' : '➡️'}
                                            {' '}{streak.count} {streak.type === 'W' ? 'victorias seguidas' : streak.type === 'L' ? 'derrotas seguidas' : 'empates seguidos'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Next Match Card */}
                    <View style={styles.matchCard}>
                        <Text style={styles.matchCardLabel}>⚽ PRÓXIMO PARTIDO</Text>
                        {next ? (
                            <>
                                <View style={styles.matchTeams}>
                                    <View style={styles.matchTeam}>
                                        <View style={[styles.matchTeamBadge, { backgroundColor: getTeam(next.home)?.color || '#333' }]}>
                                            <Text style={styles.matchTeamInitial}>{getTeam(next.home)?.shortName?.charAt(0)}</Text>
                                        </View>
                                        <Text style={styles.matchTeamName}>{getTeam(next.home)?.shortName}</Text>
                                        {next.home === manager.clubId && <Text style={styles.youTag}>TÚ</Text>}
                                    </View>

                                    <View style={styles.matchVs}>
                                        <Text style={styles.vsText}>VS</Text>
                                        <Text style={styles.matchWeek}>Jornada {next.week}</Text>
                                    </View>

                                    <View style={styles.matchTeam}>
                                        <View style={[styles.matchTeamBadge, { backgroundColor: getTeam(next.away)?.color || '#333' }]}>
                                            <Text style={styles.matchTeamInitial}>{getTeam(next.away)?.shortName?.charAt(0)}</Text>
                                        </View>
                                        <Text style={styles.matchTeamName}>{getTeam(next.away)?.shortName}</Text>
                                        {next.away === manager.clubId && <Text style={styles.youTag}>TÚ</Text>}
                                    </View>
                                </View>

                                <Text style={styles.matchLocation}>
                                    {next.home === manager.clubId ? '🏠 Partido Local' : '✈️ Partido Visitante'}
                                </Text>

                                <TouchableOpacity
                                    style={styles.playBtn}
                                    onPress={() => navigation.navigate('Match', { matchId: next.id })}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#10B981', '#059669']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.playBtnGradient}
                                    >
                                        <Text style={styles.playBtnText}>▶ JUGAR PARTIDO</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.noMatch}>
                                <Text style={styles.noMatchIcon}>🏆</Text>
                                <Text style={styles.noMatchText}>¡Temporada completada!</Text>
                            </View>
                        )}
                    </View>

                    {/* Upcoming Matches */}
                    {upcomingMatches.length > 1 && (
                        <View style={styles.upcomingCard}>
                            <Text style={styles.upcomingTitle}>📅 PRÓXIMOS RIVALES</Text>
                            {upcomingMatches.slice(1).map((match, index) => {
                                const isHome = match.home === manager.clubId;
                                const opponent = isHome ? getTeam(match.away) : getTeam(match.home);
                                return (
                                    <View key={match.id} style={styles.upcomingRow}>
                                        <Text style={styles.upcomingWeek}>J{match.week}</Text>
                                        <View style={[styles.upcomingBadge, { backgroundColor: opponent?.color || '#333' }]}>
                                            <Text style={styles.upcomingBadgeText}>{opponent?.shortName?.charAt(0)}</Text>
                                        </View>
                                        <Text style={styles.upcomingTeam}>{opponent?.shortName}</Text>
                                        <View style={[styles.upcomingLocation, isHome ? styles.homeLocation : styles.awayLocation]}>
                                            <Text style={styles.upcomingLocationText}>{isHome ? 'Casa' : 'Fuera'}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Quick Menu Grid */}
                    <Text style={styles.sectionTitle}>Gestión</Text>
                    <View style={styles.menuGrid}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuCard}
                                onPress={() => navigation.navigate(item.screen)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.menuIconBg, { backgroundColor: `${item.color}20` }]}>
                                    <Text style={styles.menuIcon}>{item.icon}</Text>
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.footerBtn} onPress={handleSave}>
                        <Text style={styles.footerIcon}>💾</Text>
                        <Text style={styles.footerText}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate('Menu')}>
                        <Text style={styles.footerIcon}>🏠</Text>
                        <Text style={styles.footerText}>Menú</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D1117' },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    teamInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    teamBadge: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    teamInitial: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
    headerText: { flex: 1 },
    teamName: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    dtInfo: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    inboxBtn: { position: 'relative', padding: 8 },
    inboxIcon: { fontSize: 26 },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },

    budgetBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
    },
    budgetItem: { flex: 1, alignItems: 'center' },
    budgetLabel: { color: '#6B7280', fontSize: 11, marginBottom: 4 },
    budgetValue: { color: '#10B981', fontSize: 18, fontWeight: 'bold' },
    budgetDivider: { width: 1, backgroundColor: '#374151' },

    content: { flex: 1, paddingHorizontal: 16 },

    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    cardAction: { color: '#10B981', fontSize: 13 },

    positionContainer: { flexDirection: 'row', alignItems: 'center' },
    positionCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#10B981',
        marginRight: 20,
    },
    positionNumber: { color: '#10B981', fontSize: 32, fontWeight: 'bold' },

    statsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statCard: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    statCardWin: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    statCardDraw: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    statCardLoss: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    statNumber: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    statLabel: { color: '#6B7280', fontSize: 11, marginTop: 2 },
    greenText: { color: '#10B981' },
    yellowText: { color: '#F59E0B' },
    redText: { color: '#EF4444' },

    // Form Section
    formSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    formLabel: { color: '#9CA3AF', fontSize: 13 },
    formIcons: { flexDirection: 'row', gap: 6 },
    formDot: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formDotText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
    streakBadge: {
        marginTop: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    streakText: { color: '#F59E0B', fontSize: 13, fontWeight: '600' },

    matchCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
    },
    matchCardLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 16 },
    matchTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
    matchTeam: { alignItems: 'center', flex: 1 },
    matchTeamBadge: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    matchTeamInitial: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
    matchTeamName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    youTag: { color: '#10B981', fontSize: 10, fontWeight: 'bold', marginTop: 4, backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    matchVs: { alignItems: 'center', paddingHorizontal: 20 },
    vsText: { color: '#6B7280', fontSize: 18, fontWeight: 'bold' },
    matchWeek: { color: '#4B5563', fontSize: 11, marginTop: 4 },
    matchLocation: { color: '#9CA3AF', fontSize: 14, marginBottom: 16 },
    playBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
    playBtnGradient: { paddingVertical: 16, alignItems: 'center' },
    playBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    noMatch: { alignItems: 'center', paddingVertical: 20 },
    noMatchIcon: { fontSize: 48, marginBottom: 12 },
    noMatchText: { color: '#9CA3AF', fontSize: 16 },

    // Upcoming Matches
    upcomingCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    upcomingTitle: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
    upcomingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    upcomingWeek: { color: '#6B7280', fontSize: 12, width: 30 },
    upcomingBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    upcomingBadgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
    upcomingTeam: { color: '#FFFFFF', fontSize: 14, flex: 1 },
    upcomingLocation: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    homeLocation: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
    awayLocation: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    upcomingLocationText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

    sectionTitle: { color: '#6B7280', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    menuCard: {
        width: (width - 56) / 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    menuIconBg: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    menuIcon: { fontSize: 26 },
    menuLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    footerBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 14,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    footerIcon: { fontSize: 18 },
    footerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});
