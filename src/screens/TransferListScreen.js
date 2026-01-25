// Pantalla de Lista de Transferibles
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../data/teams';

export default function TransferListScreen({ navigation }) {
    const { state, dispatch, getMyPlayers, getPlayer } = useGame();
    const myPlayers = getMyPlayers();
    const transferList = state.transfers?.transferList || [];

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [askingPrice, setAskingPrice] = useState('');

    const playersOnList = useMemo(() => {
        return transferList.map(t => ({
            ...getPlayer(t.playerId),
            askingPrice: t.askingPrice,
        })).filter(Boolean);
    }, [transferList]);

    const availablePlayers = useMemo(() => {
        const onListIds = new Set(transferList.map(t => t.playerId));
        return myPlayers.filter(p => !onListIds.has(p.id));
    }, [myPlayers, transferList]);

    const getPositionColor = (role) => {
        if (role === 'GK') return '#EAB308';
        if (['CB', 'LB', 'RB'].includes(role)) return '#3B82F6';
        if (['CDM', 'CM', 'CAM'].includes(role)) return '#10B981';
        if (['LW', 'RW'].includes(role)) return '#8B5CF6';
        return '#EF4444';
    };

    const handleAddToList = () => {
        if (!selectedPlayer || !askingPrice) return;
        dispatch({
            type: 'ADD_TO_TRANSFER_LIST',
            playerId: selectedPlayer.id,
            askingPrice: parseInt(askingPrice),
        });
        setShowAddModal(false);
        setSelectedPlayer(null);
        setAskingPrice('');
    };

    const handleRemoveFromList = (playerId) => {
        Alert.alert(
            'Quitar de la lista',
            '¿Estás seguro de quitar este jugador de la lista de transferibles?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Quitar',
                    style: 'destructive',
                    onPress: () => dispatch({ type: 'REMOVE_FROM_TRANSFER_LIST', playerId }),
                },
            ]
        );
    };

    const openAddModal = (player) => {
        setSelectedPlayer(player);
        setAskingPrice(String(Math.round(player.marketValue * 1.1)));
        setShowAddModal(true);
    };

    const renderListedPlayer = ({ item }) => (
        <View style={styles.playerCard}>
            <View style={[styles.playerBadge, { backgroundColor: getPositionColor(item.role) }]}>
                <Text style={styles.playerOverall}>{item.overall}</Text>
                <Text style={styles.playerRole}>{item.role}</Text>
            </View>
            <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerMeta}>{item.age} años • Valor: {formatMoney(item.marketValue)}</Text>
            </View>
            <View style={styles.priceSection}>
                <Text style={styles.askingLabel}>Pedido</Text>
                <Text style={styles.askingPrice}>{formatMoney(item.askingPrice)}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveFromList(item.id)}>
                    <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderAvailablePlayer = ({ item }) => (
        <TouchableOpacity style={styles.availableCard} onPress={() => openAddModal(item)}>
            <View style={[styles.smallBadge, { backgroundColor: getPositionColor(item.role) }]}>
                <Text style={styles.smallOverall}>{item.overall}</Text>
            </View>
            <View style={styles.availableInfo}>
                <Text style={styles.availableName}>{item.name}</Text>
                <Text style={styles.availableMeta}>{item.role} • {formatMoney(item.marketValue)}</Text>
            </View>
            <Text style={styles.addBtn}>+ Añadir</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1E3A5F', '#0D1117']} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>🏷️ LISTA DE TRANSFERIBLES</Text>
                </View>

                {/* Listed Players */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>En Venta ({playersOnList.length})</Text>
                    {playersOnList.length > 0 ? (
                        <FlatList
                            data={playersOnList}
                            keyExtractor={item => item.id}
                            renderItem={renderListedPlayer}
                            style={styles.list}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🏷️</Text>
                            <Text style={styles.emptyText}>No tienes jugadores en venta</Text>
                            <Text style={styles.emptySubtext}>Añade jugadores para recibir ofertas</Text>
                        </View>
                    )}
                </View>

                {/* Available Players to Add */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Añadir a la Lista</Text>
                    <FlatList
                        data={availablePlayers.slice(0, 10)}
                        keyExtractor={item => item.id}
                        renderItem={renderAvailablePlayer}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    />
                </View>

                {/* Add to List Modal */}
                <Modal visible={showAddModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {selectedPlayer && (
                                <>
                                    <Text style={styles.modalTitle}>Poner en Venta</Text>

                                    <View style={styles.modalPlayerInfo}>
                                        <View style={[styles.modalBadge, { backgroundColor: getPositionColor(selectedPlayer.role) }]}>
                                            <Text style={styles.modalOverall}>{selectedPlayer.overall}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.modalPlayerName}>{selectedPlayer.name}</Text>
                                            <Text style={styles.modalPlayerMeta}>
                                                {selectedPlayer.role} • {selectedPlayer.age} años
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalField}>
                                        <Text style={styles.fieldLabel}>Valor de mercado</Text>
                                        <Text style={styles.marketValue}>{formatMoney(selectedPlayer.marketValue)}</Text>
                                    </View>

                                    <View style={styles.modalField}>
                                        <Text style={styles.fieldLabel}>Precio pedido</Text>
                                        <TextInput
                                            style={styles.priceInput}
                                            value={askingPrice}
                                            onChangeText={setAskingPrice}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#6B7280"
                                        />
                                        <Text style={styles.priceFormatted}>{formatMoney(parseInt(askingPrice) || 0)}</Text>
                                    </View>

                                    <View style={styles.modalActions}>
                                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.confirmBtn} onPress={handleAddToList}>
                                            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.confirmBtnGradient}>
                                                <Text style={styles.confirmBtnText}>Poner en Venta</Text>
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
        padding: 16,
        gap: 16,
    },
    backText: { color: '#10B981', fontSize: 16, fontWeight: '600' },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

    section: { flex: 1, paddingHorizontal: 16 },
    sectionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 1 },
    list: { flex: 1 },

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
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    playerOverall: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    playerRole: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
    playerInfo: { flex: 1 },
    playerName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    playerMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    priceSection: { alignItems: 'flex-end' },
    askingLabel: { color: '#6B7280', fontSize: 10 },
    askingPrice: { color: '#F59E0B', fontSize: 16, fontWeight: 'bold' },
    removeBtn: { marginTop: 6, padding: 6 },
    removeBtnText: { color: '#EF4444', fontSize: 14 },

    horizontalList: { paddingVertical: 8 },
    availableCard: {
        width: 140,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 12,
        marginRight: 10,
        alignItems: 'center',
    },
    smallBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    smallOverall: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    availableInfo: { alignItems: 'center', marginBottom: 8 },
    availableName: { color: '#FFFFFF', fontSize: 13, fontWeight: '500', textAlign: 'center' },
    availableMeta: { color: '#6B7280', fontSize: 10, marginTop: 2 },
    addBtn: { color: '#10B981', fontSize: 12, fontWeight: '600' },

    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    emptySubtext: { color: '#6B7280', fontSize: 13, marginTop: 4 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1F2937', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
    modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    modalPlayerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    modalBadge: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    modalOverall: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    modalPlayerName: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    modalPlayerMeta: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
    modalField: { marginBottom: 16 },
    fieldLabel: { color: '#9CA3AF', fontSize: 13, marginBottom: 8 },
    marketValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    priceInput: {
        backgroundColor: '#374151',
        borderRadius: 12,
        padding: 14,
        color: '#FFFFFF',
        fontSize: 18,
        textAlign: 'center',
    },
    priceFormatted: { color: '#F59E0B', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
    cancelBtn: { flex: 1, backgroundColor: '#374151', padding: 16, borderRadius: 14, alignItems: 'center' },
    cancelBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    confirmBtn: { flex: 1.5, borderRadius: 14, overflow: 'hidden' },
    confirmBtnGradient: { padding: 16, alignItems: 'center' },
    confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
