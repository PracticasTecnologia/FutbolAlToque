// Pantalla de Plantilla - Lista de jugadores con stats FIFA
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { POSITIONS, roleToPosition, STAT_NAMES, GK_STAT_NAMES, calculateOverallInPosition, ROLES } from '../data/players';
import { getPlayerFlag } from '../data/nationalities';

export default function SquadScreen({ navigation }) {
    const { state, getMyPlayers, getTeam } = useGame();
    const [filter, setFilter] = useState('ALL');
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const myPlayers = getMyPlayers();
    const team = getTeam(state.manager?.clubId);

    const filteredPlayers = filter === 'ALL'
        ? myPlayers
        : myPlayers.filter(p => (p.position || roleToPosition[p.role]) === filter);

    const getPositionColor = (position) => {
        if (position === 'GK') return '#FFD700';
        if (position === 'DEF' || position === 'DF') return '#3498DB';
        if (position === 'MID' || position === 'MF') return '#2ECC71';
        if (position === 'FWD' || position === 'FW') return '#E74C3C';
        return '#8B949E'; // Color por defecto si no hay posición
    };

    const getStatColor = (value) => {
        if (value >= 80) return '#238636';
        if (value >= 70) return '#84CC16';
        if (value >= 60) return '#F0B429';
        if (value >= 50) return '#F97316';
        return '#F85149';
    };

    const getStaminaColor = (stamina) => {
        if (stamina >= 70) return '#238636';
        if (stamina >= 40) return '#F0B429';
        return '#F85149';
    };

    const renderPlayer = ({ item }) => {
        const position = item.position || roleToPosition[item.role];
        const stamina = item.stamina || 100;
        const flag = getPlayerFlag(item.name, item.nationality);
        const roleName = ROLES[item.role] || item.role;

        return (
            <TouchableOpacity
                style={styles.playerCard}
                onPress={() => setSelectedPlayer(item)}
            >
                <View style={[styles.playerBadge, { backgroundColor: getPositionColor(position) }]}>
                    <Text style={styles.playerOverall}>{item.overall || '?'}</Text>
                    <Text style={styles.playerRole}>{item.role}</Text>
                </View>
                <View style={styles.playerInfo}>
                    <View style={styles.playerNameRow}>
                        <Text style={styles.playerFlag}>{flag}</Text>
                        <Text style={styles.playerName}>{item.name}</Text>
                    </View>
                    <View style={styles.playerMeta}>
                        <Text style={styles.playerAge}>{item.age} años</Text>
                        <Text style={styles.playerRoleName}>• {roleName}</Text>
                        {item.isYouth && <Text style={styles.youthBadge}>🌟</Text>}
                        {item.potential && <Text style={styles.potentialBadge}>⬆️ {item.potential}</Text>}
                    </View>
                    {/* Barra de stamina */}
                    <View style={styles.staminaBar}>
                        <View style={[styles.staminaFill, { width: `${stamina}%`, backgroundColor: getStaminaColor(stamina) }]} />
                    </View>
                </View>
                <Text style={styles.playerArrow}>›</Text>
            </TouchableOpacity>
        );
    };

    const renderStatBar = (name, value) => (
        <View style={styles.statRow} key={name}>
            <Text style={styles.statName}>{name}</Text>
            <View style={styles.statBarBg}>
                <View style={[styles.statBar, { width: `${value}%`, backgroundColor: getStatColor(value) }]} />
            </View>
            <Text style={[styles.statNum, { color: getStatColor(value) }]}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>PLANTILLA</Text>
                <Text style={styles.count}>{myPlayers.length}</Text>
            </View>

            {/* Filtros */}
            <View style={styles.filters}>
                {['ALL', 'GK', 'DF', 'MF', 'FW'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterBtn, filter === f && styles.filterActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f === 'ALL' ? 'Todos' : f === 'DF' ? 'Defensa' : f === 'MF' ? 'Medio' : f === 'FW' ? 'Ataque' : f === 'GK' ? 'Arquero' : f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Stats del equipo */}
            <View style={styles.teamStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {myPlayers.length > 0 ? Math.round(myPlayers.reduce((acc, p) => acc + (p.overall || 60), 0) / myPlayers.length) : 0}
                    </Text>
                    <Text style={styles.statLabel}>Media</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {myPlayers.length > 0 ? Math.round(myPlayers.reduce((acc, p) => acc + (p.age || 25), 0) / myPlayers.length) : 0}
                    </Text>
                    <Text style={styles.statLabel}>Edad</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {myPlayers.length > 0 ? Math.round(myPlayers.reduce((acc, p) => acc + (p.stamina || 100), 0) / myPlayers.length) : 0}%
                    </Text>
                    <Text style={styles.statLabel}>Forma</Text>
                </View>
            </View>

            {/* Lista de jugadores */}
            <FlatList
                data={filteredPlayers.sort((a, b) => (b.overall || 0) - (a.overall || 0))}
                keyExtractor={item => item.id}
                renderItem={renderPlayer}
                style={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal de detalle del jugador */}
            <Modal visible={selectedPlayer !== null} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedPlayer && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={[styles.modalBadge, { backgroundColor: getPositionColor(selectedPlayer.position) }]}>
                                        <Text style={styles.modalOverall}>{selectedPlayer.overall || '?'}</Text>
                                        <Text style={styles.modalRole}>{selectedPlayer.role}</Text>
                                    </View>
                                    <View style={styles.modalInfo}>
                                        <Text style={styles.modalName}>{selectedPlayer.name}</Text>
                                        <Text style={styles.modalMeta}>
                                            {selectedPlayer.age} años • {POSITIONS[selectedPlayer.position]}
                                            {selectedPlayer.isYouth && ' • 🌟'}
                                        </Text>
                                        <View style={styles.staminaBarLarge}>
                                            <Text style={styles.staminaLabel}>Forma: {selectedPlayer.stamina || 100}%</Text>
                                            <View style={[styles.staminaFillLarge, {
                                                width: `${selectedPlayer.stamina || 100}%`,
                                                backgroundColor: getStaminaColor(selectedPlayer.stamina || 100)
                                            }]} />
                                        </View>
                                    </View>
                                </View>

                                {/* Stats */}
                                <View style={styles.statsSection}>
                                    <Text style={styles.sectionTitle}>
                                        {selectedPlayer.position === 'GK' ? 'STATS DE ARQUERO' : 'STATS'}
                                    </Text>

                                    {selectedPlayer.position === 'GK' && selectedPlayer.gkStats ? (
                                        Object.entries(GK_STAT_NAMES).map(([key, name]) =>
                                            renderStatBar(name, selectedPlayer.gkStats[key] || 50)
                                        )
                                    ) : selectedPlayer.stats ? (
                                        Object.entries(STAT_NAMES).map(([key, name]) =>
                                            renderStatBar(name, selectedPlayer.stats[key] || 50)
                                        )
                                    ) : (
                                        <Text style={styles.noStats}>Sin stats detalladas</Text>
                                    )}
                                </View>

                                {/* Potencial (si es joven) */}
                                {selectedPlayer.potential && (
                                    <View style={styles.potentialSection}>
                                        <Text style={styles.sectionTitle}>POTENCIAL</Text>
                                        <View style={styles.potentialRow}>
                                            <Text style={styles.potentialText}>
                                                OVR Actual: {selectedPlayer.overall}
                                            </Text>
                                            <Text style={styles.potentialArrow}>→</Text>
                                            <Text style={[styles.potentialText, styles.potentialMax]}>
                                                Máximo: {selectedPlayer.potential}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => {
                                        setSelectedPlayer(null);
                                        navigation.navigate('Tactics');
                                    }}
                                >
                                    <Text style={styles.actionText}>⚽ Ver en Táctica</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPlayer(null)}>
                            <Text style={styles.modalCloseText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D1117' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    back: { color: '#238636', fontSize: 16, marginRight: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', flex: 1 },
    count: { color: '#8B949E', fontSize: 14, backgroundColor: '#21262D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 8,
    },
    filterBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#21262D',
    },
    filterActive: { backgroundColor: '#238636' },
    filterText: { color: '#8B949E', fontSize: 12 },
    filterTextActive: { color: '#FFFFFF' },
    teamStats: {
        flexDirection: 'row',
        backgroundColor: '#161B22',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    statLabel: { color: '#8B949E', fontSize: 11 },
    list: { flex: 1, paddingHorizontal: 16 },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161B22',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    playerBadge: {
        width: 52,
        height: 62,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    playerOverall: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    playerRole: { color: '#FFFFFF90', fontSize: 10 },
    playerInfo: { flex: 1 },
    playerNameRow: { flexDirection: 'row', alignItems: 'center' },
    playerFlag: { fontSize: 16, marginRight: 6 },
    playerName: { color: '#FFFFFF', fontSize: 15 },
    playerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 6, flexWrap: 'wrap' },
    playerAge: { color: '#8B949E', fontSize: 12 },
    playerRoleName: { color: '#8B949E', fontSize: 12, marginLeft: 6 },
    youthBadge: { color: '#F0B429', fontSize: 11, marginLeft: 8 },
    potentialBadge: { color: '#84CC16', fontSize: 11, marginLeft: 8 },
    staminaBar: {

        height: 4,
        backgroundColor: '#30363D',
        borderRadius: 2,
        overflow: 'hidden',
    },
    staminaFill: {
        height: '100%',
        borderRadius: 2,
    },
    playerArrow: { color: '#484F58', fontSize: 22 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#161B22',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalBadge: {
        width: 75,
        height: 90,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    modalOverall: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
    modalRole: { color: '#FFFFFF90', fontSize: 12 },
    modalInfo: { flex: 1 },
    modalName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    modalMeta: { color: '#8B949E', fontSize: 13, marginTop: 4 },
    staminaBarLarge: {
        marginTop: 10,
        height: 16,
        backgroundColor: '#30363D',
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    staminaLabel: {
        position: 'absolute',
        zIndex: 1,
        left: 8,
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    staminaFillLarge: {
        height: '100%',
        borderRadius: 8,
    },
    statsSection: { marginBottom: 16 },
    sectionTitle: { color: '#8B949E', fontSize: 12, marginBottom: 10 },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statName: { color: '#8B949E', fontSize: 12, width: 70 },
    statBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#21262D',
        borderRadius: 4,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    statBar: { height: '100%', borderRadius: 4 },
    statNum: { fontSize: 13, fontWeight: 'bold', width: 28, textAlign: 'right' },
    noStats: { color: '#484F58', textAlign: 'center', padding: 20 },
    potentialSection: { marginBottom: 16 },
    potentialRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    potentialText: { color: '#FFFFFF', fontSize: 16 },
    potentialArrow: { color: '#84CC16', fontSize: 20, marginHorizontal: 16 },
    potentialMax: { color: '#84CC16', fontWeight: 'bold' },
    actionBtn: {
        backgroundColor: '#238636',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    actionText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
    modalClose: {
        padding: 14,
        backgroundColor: '#30363D',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCloseText: { color: '#FFFFFF', fontSize: 15 },
});
