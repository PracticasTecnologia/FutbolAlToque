// Pantalla de Tabla de Posiciones - MEJORADA con forma reciente y diferencia con líder
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';

export default function StandingsScreen({ navigation }) {
    const { state, getTeam, getStandings } = useGame();
    const standings = getStandings();
    const myTeamId = state.manager?.clubId;
    const myTeam = getTeam(myTeamId);
    const leaderPts = standings.length > 0 ? standings[0].pts : 0;

    // Obtener forma reciente de un equipo (últimos 5 partidos)
    const getTeamForm = (teamId) => {
        const teamMatches = state.fixtures
            .filter(f => f.played && (f.home === teamId || f.away === teamId))
            .sort((a, b) => b.week - a.week)
            .slice(0, 5);

        return teamMatches.map(match => {
            const isHome = match.home === teamId;
            const myGoals = isHome ? match.hg : match.ag;
            const oppGoals = isHome ? match.ag : match.hg;

            if (myGoals > oppGoals) return 'W';
            if (myGoals < oppGoals) return 'L';
            return 'D';
        });
    };

    const getFormColor = (result) => {
        if (result === 'W') return '#10B981';
        if (result === 'L') return '#EF4444';
        return '#F59E0B';
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1A2332', '#0D1117']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.back}>← Volver</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>📊 TABLA</Text>
                        <Text style={styles.subtitle}>{myTeam?.leagueName || 'Liga'}</Text>
                    </View>
                    <View style={{ width: 60 }} />
                </View>

                {/* My Team Quick Stats */}
                <View style={styles.myTeamCard}>
                    <View style={[styles.myTeamBadge, { backgroundColor: myTeam?.color || '#333' }]}>
                        <Text style={styles.myTeamInitial}>{myTeam?.shortName?.charAt(0)}</Text>
                    </View>
                    <View style={styles.myTeamInfo}>
                        <Text style={styles.myTeamName}>{myTeam?.shortName}</Text>
                        <Text style={styles.myTeamPos}>
                            {standings.findIndex(s => s.id === myTeamId) + 1}° lugar
                        </Text>
                    </View>
                    <View style={styles.myTeamStats}>
                        <View style={styles.miniStat}>
                            <Text style={styles.miniStatValue}>
                                {standings.find(s => s.id === myTeamId)?.pts || 0}
                            </Text>
                            <Text style={styles.miniStatLabel}>PTS</Text>
                        </View>
                    </View>
                    {/* Diferencia con líder */}
                    {standings.findIndex(s => s.id === myTeamId) > 0 && (
                        <View style={styles.diffBadge}>
                            <Text style={styles.diffText}>
                                -{leaderPts - (standings.find(s => s.id === myTeamId)?.pts || 0)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Table Header */}
                <View style={styles.tableHead}>
                    <Text style={[styles.colPos, styles.headText]}>#</Text>
                    <Text style={[styles.colTeam, styles.headText]}>Equipo</Text>
                    <Text style={[styles.colForm, styles.headText]}>Forma</Text>
                    <Text style={[styles.colStat, styles.headText]}>PJ</Text>
                    <Text style={[styles.colStat, styles.headText]}>DG</Text>
                    <Text style={[styles.colPts, styles.headText]}>PTS</Text>
                </View>

                {/* Table Body */}
                <FlatList
                    data={standings}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.tableBody}
                    renderItem={({ item, index }) => {
                        const team = getTeam(item.id);
                        const isMine = item.id === myTeamId;
                        const gd = item.gf - item.ga;
                        const isTop = index < 4;
                        const isBottom = index >= standings.length - 3;
                        const form = getTeamForm(item.id);
                        const ptsDiff = leaderPts - item.pts;

                        return (
                            <View style={[
                                styles.row,
                                isMine && styles.myRow,
                            ]}>
                                {/* Position indicator */}
                                <View style={styles.posContainer}>
                                    <View style={[
                                        styles.posIndicator,
                                        isTop && styles.posTop,
                                        isBottom && styles.posBottom,
                                    ]} />
                                    <Text style={[styles.colPos, styles.cell]}>{index + 1}</Text>
                                </View>

                                {/* Team */}
                                <View style={styles.colTeamWrap}>
                                    <View style={[styles.teamBadge, { backgroundColor: team?.color || '#333' }]}>
                                        <Text style={styles.teamBadgeText}>{team?.shortName?.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.teamInfoCol}>
                                        <Text style={[styles.teamName, isMine && styles.myTeamText]} numberOfLines={1}>
                                            {team?.shortName}
                                        </Text>
                                        {index > 0 && (
                                            <Text style={styles.ptsDiffText}>-{ptsDiff}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Recent Form */}
                                <View style={styles.formContainer}>
                                    {form.length > 0 ? (
                                        form.map((result, i) => (
                                            <View
                                                key={i}
                                                style={[styles.formDot, { backgroundColor: getFormColor(result) }]}
                                            />
                                        ))
                                    ) : (
                                        <Text style={styles.noForm}>-</Text>
                                    )}
                                </View>

                                {/* Stats */}
                                <Text style={[styles.colStat, styles.cell]}>{item.p}</Text>
                                <Text style={[styles.colStat, styles.cell, gd > 0 && styles.greenText, gd < 0 && styles.redText]}>
                                    {gd > 0 ? `+${gd}` : gd}
                                </Text>
                                <View style={styles.ptsContainer}>
                                    <Text style={[styles.colPts, styles.cell, styles.ptsText]}>{item.pts}</Text>
                                </View>
                            </View>
                        );
                    }}
                />

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendSection}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendIndicator, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.legendText}>Copa</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendIndicator, { backgroundColor: '#EF4444' }]} />
                            <Text style={styles.legendText}>Descenso</Text>
                        </View>
                    </View>
                    <View style={styles.legendSection}>
                        <Text style={styles.legendTitle}>Forma:</Text>
                        <View style={styles.legendItem}>
                            <View style={[styles.formDotLegend, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.legendText}>V</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.formDotLegend, { backgroundColor: '#F59E0B' }]} />
                            <Text style={styles.legendText}>E</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.formDotLegend, { backgroundColor: '#EF4444' }]} />
                            <Text style={styles.legendText}>D</Text>
                        </View>
                    </View>
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
    back: { color: '#10B981', fontSize: 16, fontWeight: '600' },
    headerCenter: { alignItems: 'center' },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    subtitle: { color: '#6B7280', fontSize: 12, marginTop: 2 },

    myTeamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    myTeamBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    myTeamInitial: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    myTeamInfo: { flex: 1 },
    myTeamName: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    myTeamPos: { color: '#10B981', fontSize: 14, marginTop: 2 },
    myTeamStats: { alignItems: 'flex-end', marginRight: 12 },
    miniStat: { alignItems: 'center' },
    miniStatValue: { color: '#F59E0B', fontSize: 28, fontWeight: 'bold' },
    miniStatLabel: { color: '#6B7280', fontSize: 11 },
    diffBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    diffText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },

    tableHead: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    headText: { color: '#6B7280', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

    tableBody: { paddingBottom: 16 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingRight: 16,
        paddingLeft: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    myRow: {
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
    },

    posContainer: { flexDirection: 'row', alignItems: 'center', width: 36 },
    posIndicator: {
        width: 3,
        height: 24,
        borderRadius: 2,
        backgroundColor: 'transparent',
        marginRight: 8,
    },
    posTop: { backgroundColor: '#10B981' },
    posBottom: { backgroundColor: '#EF4444' },

    cell: { color: '#E5E7EB', fontSize: 13 },
    colPos: { width: 24, textAlign: 'center' },
    colTeam: { flex: 1 },
    colTeamWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    teamBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    teamBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    teamInfoCol: { flex: 1 },
    teamName: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
    myTeamText: { color: '#10B981', fontWeight: 'bold' },
    ptsDiffText: { color: '#6B7280', fontSize: 10, marginTop: 1 },

    // Form column
    colForm: { width: 60, textAlign: 'center' },
    formContainer: {
        width: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 3,
    },
    formDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    noForm: { color: '#6B7280', fontSize: 12 },

    colStat: { width: 28, textAlign: 'center' },
    colPts: { width: 36, textAlign: 'center' },
    ptsContainer: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    ptsText: { color: '#F59E0B', fontWeight: 'bold' },

    greenText: { color: '#10B981' },
    redText: { color: '#EF4444' },

    legend: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    legendSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
    },
    legendTitle: { color: '#6B7280', fontSize: 11, marginRight: 4 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendIndicator: { width: 12, height: 4, borderRadius: 2, marginRight: 6 },
    formDotLegend: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
    legendText: { color: '#6B7280', fontSize: 11 },
});
