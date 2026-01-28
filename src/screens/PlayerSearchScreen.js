// Pantalla de Búsqueda de Jugadores - Sistema de Fichajes
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { teams, formatMoney, getLeagues } from '../data/teams';

const POSITIONS = ['Todas', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

export default function PlayerSearchScreen({ navigation }) {
    const { state, dispatch, getTeam, getPlayer, addMessage } = useGame();
    const myTeam = getTeam(state.manager?.clubId);
    const budget = state.manager?.budget || 0;

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('Todas');
    const [minOverall, setMinOverall] = useState(60);
    const [maxAge, setMaxAge] = useState(35);
    const [selectedLeague, setSelectedLeague] = useState('Todas');
    const [showFilters, setShowFilters] = useState(false);

    // Offer modal
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [offerAmount, setOfferAmount] = useState('');
    const [showOfferModal, setShowOfferModal] = useState(false);

    // Get all players from all teams (except own team)
    const allPlayers = useMemo(() => {
        const players = [];
        Object.entries(state.allPlayers).forEach(([teamId, teamPlayers]) => {
            if (teamId !== state.manager?.clubId) {
                teamPlayers.forEach(player => {
                    const team = getTeam(teamId);
                    players.push({ ...player, teamId, teamName: team?.name, teamShortName: team?.shortName, leagueId: team?.leagueId });
                });
            }
        });
        return players;
    }, [state.allPlayers, state.manager?.clubId]);

    // Filter players
    const filteredPlayers = useMemo(() => {
        return allPlayers
            .filter(p => {
                if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (selectedPosition !== 'Todas' && p.role !== selectedPosition) return false;
                if (p.overall < minOverall) return false;
                if (p.age > maxAge) return false;
                if (selectedLeague !== 'Todas' && p.leagueId !== selectedLeague) return false;
                return true;
            })
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 50); // Limit results
    }, [allPlayers, searchQuery, selectedPosition, minOverall, maxAge, selectedLeague]);

    const leagues = getLeagues();

    const handlePlayerPress = (player) => {
        setSelectedPlayer(player);
        setOfferAmount(String(Math.round(player.marketValue * 0.9)));
        setShowOfferModal(true);
    };

    const calculateAcceptanceChance = (player, offer) => {
        if (!player || !offer) return 0;
        const offerNum = parseInt(offer) || 0;
        const marketValue = player.marketValue || 1000000;
        const ratio = offerNum / marketValue;

        if (ratio >= 1.5) return 95;
        if (ratio >= 1.2) return 80;
        if (ratio >= 1.0) return 60;
        if (ratio >= 0.8) return 30;
        if (ratio >= 0.6) return 10;
        return 5;
    };

    const submitOffer = () => {
        if (!selectedPlayer || !offerAmount) return;

        const offerNum = parseInt(offerAmount);
        if (offerNum > budget) {
            alert('No tienes suficiente presupuesto');
            return;
        }

        const chance = calculateAcceptanceChance(selectedPlayer, offerAmount);
        const accepted = Math.random() * 100 < chance;

        if (accepted) {
            // Transfer successful
            dispatch({
                type: 'TRANSFER_PLAYER',
                fromTeam: selectedPlayer.teamId,
                toTeam: state.manager.clubId,
                playerId: selectedPlayer.id,
                price: offerNum,
            });
            addMessage(
                selectedPlayer.teamShortName,
                `Fichaje completado: ${selectedPlayer.name}`,
                `¡Felicidades! ${selectedPlayer.name} es nuevo jugador de ${myTeam?.name}. El acuerdo se cerró por ${formatMoney(offerNum)}.`,
                'success'
            );
            alert(`¡Fichaje completado! ${selectedPlayer.name} es tuyo por ${formatMoney(offerNum)}`);
        } else {
            // Offer rejected
            const counterOffer = Math.round(selectedPlayer.marketValue * (1.1 + Math.random() * 0.3));
            addMessage(
                selectedPlayer.teamShortName,
                `Oferta rechazada: ${selectedPlayer.name}`,
                `Hemos considerado su oferta de ${formatMoney(offerNum)} por ${selectedPlayer.name}, pero no alcanza nuestras expectativas. Estaríamos dispuestos a negociar por ${formatMoney(counterOffer)}.`,
                'warning'
            );
            alert(`Oferta rechazada. ${selectedPlayer.teamShortName} pide ${formatMoney(counterOffer)}.`);
        }

        setShowOfferModal(false);
        setSelectedPlayer(null);
    };

    const getPositionColor = (role) => {
        if (role === 'GK') return '#EAB308';
        if (['CB', 'LB', 'RB'].includes(role)) return '#3B82F6';
        if (['CDM', 'CM', 'CAM'].includes(role)) return '#10B981';
        if (['LW', 'RW'].includes(role)) return '#8B5CF6';
        return '#EF4444';
    };

    const renderPlayer = ({ item }) => (
        <TouchableOpacity style={styles.playerCard} onPress={() => handlePlayerPress(item)}>
            <View style={[styles.playerBadge, { backgroundColor: getPositionColor(item.role) }]}>
                <Text style={styles.playerOverall}>{item.overall}</Text>
                <Text style={styles.playerRole}>{item.role}</Text>
            </View>
            <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.name}</Text>
                <View style={styles.playerMeta}>
                    <Text style={styles.playerTeam}>{item.teamShortName}</Text>
                    <Text style={styles.playerDot}>•</Text>
                    <Text style={styles.playerAge}>{item.age} años</Text>
                </View>
            </View>
            <View style={styles.playerValue}>
                <Text style={styles.playerValueText}>{formatMoney(item.marketValue)}</Text>
                <Text style={styles.makeOfferText}>Hacer oferta →</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1E3A5F', '#0D1117']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backText}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>🔍 BUSCAR JUGADORES</Text>
                    <Text style={styles.budget}>{formatMoney(budget)}</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por nombre..."
                            placeholderTextColor="#6B7280"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
                        <Text style={styles.filterToggleText}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* Collapsible Filters */}
                {showFilters && (
                    <View style={styles.filtersContainer}>
                        <View style={styles.filterRow}>
                            <Text style={styles.filterLabel}>Posición:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                                {POSITIONS.map(pos => (
                                    <TouchableOpacity
                                        key={pos}
                                        style={[styles.filterChip, selectedPosition === pos && styles.filterChipActive]}
                                        onPress={() => setSelectedPosition(pos)}
                                    >
                                        <Text style={[styles.filterChipText, selectedPosition === pos && styles.filterChipTextActive]}>
                                            {pos}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.filterRow}>
                            <Text style={styles.filterLabel}>Liga:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                                <TouchableOpacity
                                    style={[styles.filterChip, selectedLeague === 'Todas' && styles.filterChipActive]}
                                    onPress={() => setSelectedLeague('Todas')}
                                >
                                    <Text style={[styles.filterChipText, selectedLeague === 'Todas' && styles.filterChipTextActive]}>Todas</Text>
                                </TouchableOpacity>
                                {leagues.map(league => (
                                    <TouchableOpacity
                                        key={league.id}
                                        style={[styles.filterChip, selectedLeague === league.id && styles.filterChipActive]}
                                        onPress={() => setSelectedLeague(league.id)}
                                    >
                                        <Text style={[styles.filterChipText, selectedLeague === league.id && styles.filterChipTextActive]}>
                                            {league.id}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.filterRowSliders}>
                            <View style={styles.sliderGroup}>
                                <Text style={styles.filterLabel}>Overall mín: {minOverall}</Text>
                                <View style={styles.sliderBtns}>
                                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setMinOverall(Math.max(40, minOverall - 5))}>
                                        <Text style={styles.sliderBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setMinOverall(Math.min(95, minOverall + 5))}>
                                        <Text style={styles.sliderBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.sliderGroup}>
                                <Text style={styles.filterLabel}>Edad máx: {maxAge}</Text>
                                <View style={styles.sliderBtns}>
                                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setMaxAge(Math.max(18, maxAge - 2))}>
                                        <Text style={styles.sliderBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.sliderBtn} onPress={() => setMaxAge(Math.min(45, maxAge + 2))}>
                                        <Text style={styles.sliderBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Results Count */}
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>{filteredPlayers.length} jugadores encontrados</Text>
                </View>

                {/* Player List */}
                <FlatList
                    data={filteredPlayers}
                    keyExtractor={item => item.id}
                    renderItem={renderPlayer}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🔍</Text>
                            <Text style={styles.emptyText}>No se encontraron jugadores</Text>
                            <Text style={styles.emptySubtext}>Intenta ajustar los filtros</Text>
                        </View>
                    }
                />

                {/* Offer Modal */}
                <Modal visible={showOfferModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {selectedPlayer && (
                                <>
                                    <View style={styles.modalHeader}>
                                        <View style={[styles.modalPlayerBadge, { backgroundColor: getPositionColor(selectedPlayer.role) }]}>
                                            <Text style={styles.modalPlayerOverall}>{selectedPlayer.overall}</Text>
                                        </View>
                                        <View style={styles.modalPlayerInfo}>
                                            <Text style={styles.modalPlayerName}>{selectedPlayer.name}</Text>
                                            <Text style={styles.modalPlayerMeta}>
                                                {selectedPlayer.role} • {selectedPlayer.age} años • {selectedPlayer.teamShortName}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalStats}>
                                        <View style={styles.modalStatRow}>
                                            <Text style={styles.modalStatLabel}>Valor de mercado:</Text>
                                            <Text style={styles.modalStatValue}>{formatMoney(selectedPlayer.marketValue)}</Text>
                                        </View>
                                        <View style={styles.modalStatRow}>
                                            <Text style={styles.modalStatLabel}>Tu presupuesto:</Text>
                                            <Text style={[styles.modalStatValue, { color: '#10B981' }]}>{formatMoney(budget)}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.offerSection}>
                                        <Text style={styles.offerLabel}>Tu oferta:</Text>
                                        <TextInput
                                            style={styles.offerInput}
                                            keyboardType="numeric"
                                            value={offerAmount}
                                            onChangeText={setOfferAmount}
                                            placeholder="0"
                                            placeholderTextColor="#6B7280"
                                        />
                                        <Text style={styles.offerFormatted}>{formatMoney(parseInt(offerAmount) || 0)}</Text>
                                    </View>

                                    <View style={styles.chanceSection}>
                                        <Text style={styles.chanceLabel}>Probabilidad de éxito:</Text>
                                        <View style={styles.chanceBarBg}>
                                            <View style={[
                                                styles.chanceBarFill,
                                                {
                                                    width: `${calculateAcceptanceChance(selectedPlayer, offerAmount)}%`,
                                                    backgroundColor: calculateAcceptanceChance(selectedPlayer, offerAmount) >= 50 ? '#10B981' :
                                                        calculateAcceptanceChance(selectedPlayer, offerAmount) >= 25 ? '#F59E0B' : '#EF4444'
                                                }
                                            ]} />
                                        </View>
                                        <Text style={styles.chancePercent}>{calculateAcceptanceChance(selectedPlayer, offerAmount)}%</Text>
                                    </View>

                                    <View style={styles.modalActions}>
                                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowOfferModal(false)}>
                                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.submitBtn, parseInt(offerAmount) > budget && styles.submitBtnDisabled]}
                                            onPress={submitOffer}
                                            disabled={parseInt(offerAmount) > budget}
                                        >
                                            <LinearGradient colors={['#10B981', '#059669']} style={styles.submitBtnGradient}>
                                                <Text style={styles.submitBtnText}>💰 Enviar Oferta</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
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

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { padding: 8 },
    backText: { color: '#10B981', fontSize: 16, fontWeight: '600' },
    title: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    budget: { color: '#10B981', fontSize: 14, fontWeight: 'bold' },

    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    searchIcon: { fontSize: 18, marginRight: 10 },
    searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15, paddingVertical: 12 },
    filterToggle: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterToggleText: { fontSize: 20 },

    filtersContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },
    filterRow: { marginBottom: 12 },
    filterLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
    filterScroll: { flexGrow: 0 },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#374151',
        borderRadius: 20,
        marginRight: 8,
    },
    filterChipActive: { backgroundColor: '#10B981' },
    filterChipText: { color: '#9CA3AF', fontSize: 13 },
    filterChipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
    filterRowSliders: { flexDirection: 'row', gap: 20 },
    sliderGroup: { flex: 1 },
    sliderBtns: { flexDirection: 'row', gap: 10 },
    sliderBtn: {
        flex: 1,
        backgroundColor: '#374151',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    sliderBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

    resultsHeader: { paddingHorizontal: 16, marginBottom: 8 },
    resultsCount: { color: '#6B7280', fontSize: 13 },

    listContent: { paddingHorizontal: 16, paddingBottom: 20 },

    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    playerBadge: {
        width: 54,
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    playerOverall: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    playerRole: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
    playerInfo: { flex: 1 },
    playerName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    playerMeta: { flexDirection: 'row', alignItems: 'center' },
    playerTeam: { color: '#9CA3AF', fontSize: 13 },
    playerDot: { color: '#4B5563', marginHorizontal: 6 },
    playerAge: { color: '#9CA3AF', fontSize: 13 },
    playerValue: { alignItems: 'flex-end' },
    playerValueText: { color: '#10B981', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    makeOfferText: { color: '#6B7280', fontSize: 11 },

    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 8 },
    emptySubtext: { color: '#6B7280', fontSize: 14 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1F2937', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    modalPlayerBadge: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    modalPlayerOverall: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
    modalPlayerInfo: { flex: 1 },
    modalPlayerName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    modalPlayerMeta: { color: '#9CA3AF', fontSize: 14 },

    modalStats: { backgroundColor: '#374151', borderRadius: 14, padding: 14, marginBottom: 20 },
    modalStatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    modalStatLabel: { color: '#9CA3AF', fontSize: 14 },
    modalStatValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

    offerSection: { marginBottom: 20 },
    offerLabel: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
    offerInput: {
        backgroundColor: '#374151',
        borderRadius: 12,
        padding: 14,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    offerFormatted: { color: '#10B981', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },

    chanceSection: { marginBottom: 24 },
    chanceLabel: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
    chanceBarBg: { height: 12, backgroundColor: '#374151', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
    chanceBarFill: { height: '100%', borderRadius: 6 },
    chancePercent: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },

    modalActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, backgroundColor: '#374151', padding: 16, borderRadius: 14, alignItems: 'center' },
    cancelBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    submitBtn: { flex: 1.5, borderRadius: 14, overflow: 'hidden' },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnGradient: { padding: 16, alignItems: 'center' },
    submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
