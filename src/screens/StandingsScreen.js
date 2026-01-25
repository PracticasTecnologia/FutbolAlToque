// Pantalla de Tabla de Posiciones - Rediseñada
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
                </View>

                {/* Table Header */}
                <View style={styles.tableHead}>
                    <Text style={[styles.colPos, styles.headText]}>#</Text>
                    <Text style={[styles.colTeam, styles.headText]}>Equipo</Text>
                    <Text style={[styles.colStat, styles.headText]}>PJ</Text>
                    <Text style={[styles.colStat, styles.headText]}>G</Text>
                    <Text style={[styles.colStat, styles.headText]}>E</Text>
                    <Text style={[styles.colStat, styles.headText]}>P</Text>
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
                                    <Text style={[styles.teamName, isMine && styles.myTeamText]} numberOfLines={1}>
                                        {team?.shortName}
                                    </Text>
                                </View>

                                {/* Stats */}
                                <Text style={[styles.colStat, styles.cell]}>{item.p}</Text>
                                <Text style={[styles.colStat, styles.cell, styles.greenText]}>{item.w}</Text>
                                <Text style={[styles.colStat, styles.cell, styles.grayText]}>{item.d}</Text>
                                <Text style={[styles.colStat, styles.cell, styles.redText]}>{item.l}</Text>
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
                    <View style={styles.legendItem}>
                        <View style={[styles.legendIndicator, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.legendText}>Clasificación Copa</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendIndicator, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.legendText}>Zona de Descenso</Text>
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
    myTeamStats: { alignItems: 'flex-end' },
    miniStat: { alignItems: 'center' },
    miniStatValue: { color: '#F59E0B', fontSize: 28, fontWeight: 'bold' },
    miniStatLabel: { color: '#6B7280', fontSize: 11 },

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
    teamName: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
    myTeamText: { color: '#10B981', fontWeight: 'bold' },
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
    grayText: { color: '#6B7280' },

    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendIndicator: { width: 12, height: 4, borderRadius: 2, marginRight: 8 },
    legendText: { color: '#6B7280', fontSize: 12 },
});
