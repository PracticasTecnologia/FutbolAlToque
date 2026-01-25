// Pantalla de Tácticas - Formación y alineación
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { formations, pressureOptions, mentalityOptions, getFormation } from '../data/formations';

export default function TacticsScreen({ navigation }) {
    const { state, dispatch, getMyPlayers, getPlayer, getLineupWithPlayers, getSubstitutesWithPlayers } = useGame();
    const { tactics } = state;

    const [selectedPosition, setSelectedPosition] = useState(null);
    const [showFormationModal, setShowFormationModal] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [swapMode, setSwapMode] = useState(null); // Índice del jugador seleccionado para intercambio

    const formation = getFormation(tactics?.formation || '4-4-2');
    const lineup = getLineupWithPlayers();
    const substitutes = getSubstitutesWithPlayers();
    const myPlayers = getMyPlayers();

    // Tap normal: abrir modal de selección de jugador
    const handlePositionPress = (index) => {
        if (swapMode !== null) {
            // Si ya hay un jugador seleccionado para intercambio, intercambiarlos
            if (swapMode !== index) {
                handleSwapPlayers(swapMode, index);
            }
            setSwapMode(null);
        } else {
            setSelectedPosition(index);
            setShowPlayerModal(true);
        }
    };

    // Long press: activar modo de intercambio
    const handlePositionLongPress = (index) => {
        setSwapMode(index);
    };

    // Intercambiar dos jugadores en el lineup
    const handleSwapPlayers = (fromIndex, toIndex) => {
        const currentLineup = [...tactics.lineup];
        const temp = currentLineup[fromIndex];
        currentLineup[fromIndex] = currentLineup[toIndex];
        currentLineup[toIndex] = temp;
        dispatch({ type: 'SET_LINEUP', lineup: currentLineup, substitutes: tactics.substitutes });
    };

    const handleSelectPlayer = (playerId) => {
        if (selectedPosition === null) return;

        const currentLineup = [...tactics.lineup];
        const currentSubs = [...tactics.substitutes];

        // Si el jugador ya está en el lineup, intercambiar
        const existingIndex = currentLineup.indexOf(playerId);
        if (existingIndex !== -1) {
            // Intercambiar posiciones
            const temp = currentLineup[selectedPosition];
            currentLineup[selectedPosition] = playerId;
            currentLineup[existingIndex] = temp;
        } else {
            // Mover de suplentes a titular
            const oldPlayer = currentLineup[selectedPosition];
            currentLineup[selectedPosition] = playerId;

            // Quitar de suplentes y agregar el que sale
            const newSubs = currentSubs.filter(id => id !== playerId);
            if (oldPlayer) newSubs.unshift(oldPlayer);

            dispatch({ type: 'SET_LINEUP', lineup: currentLineup, substitutes: newSubs });
            setShowPlayerModal(false);
            setSelectedPosition(null);
            return;
        }

        dispatch({ type: 'SET_LINEUP', lineup: currentLineup, substitutes: currentSubs });
        setShowPlayerModal(false);
        setSelectedPosition(null);
    };

    const handleFormationChange = (formationName) => {
        dispatch({ type: 'SET_FORMATION', formation: formationName });
        setShowFormationModal(false);
    };

    const handlePressureChange = (pressure) => {
        dispatch({ type: 'UPDATE_TACTICS', tactics: { pressure } });
    };

    const handleMentalityChange = (mentality) => {
        dispatch({ type: 'UPDATE_TACTICS', tactics: { mentality } });
    };

    const getPositionColor = (role) => {
        if (role === 'GK') return '#FFD700';
        if (['CB', 'LB', 'RB'].includes(role)) return '#3498DB';
        if (['CDM', 'CM', 'CAM', 'LW', 'RW'].includes(role)) return '#2ECC71';
        return '#E74C3C';
    };

    if (!tactics) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.error}>No hay táctica configurada</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>FORMACIÓN TÁCTICA</Text>
            </View>

            {/* Configuración rápida */}
            <View style={styles.configBar}>
                <TouchableOpacity style={styles.configBtn} onPress={() => setShowFormationModal(true)}>
                    <Text style={styles.configLabel}>Táctica</Text>
                    <Text style={styles.configValue}>{tactics.formation}</Text>
                </TouchableOpacity>

                <View style={styles.configBtn}>
                    <Text style={styles.configLabel}>Presión</Text>
                    <View style={styles.pressureRow}>
                        {pressureOptions.map(opt => (
                            <TouchableOpacity
                                key={opt.id}
                                style={[styles.pressureBtn, tactics.pressure === opt.id && styles.pressureActive]}
                                onPress={() => handlePressureChange(opt.id)}
                            >
                                <Text style={styles.pressureIcon}>{opt.icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Banner de modo intercambio */}
            {swapMode !== null && (
                <View style={styles.swapBanner}>
                    <Text style={styles.swapBannerText}>
                        🔄 Toca otro jugador para intercambiar
                    </Text>
                    <TouchableOpacity onPress={() => setSwapMode(null)}>
                        <Text style={styles.swapBannerCancel}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Campo de fútbol */}
            <View style={styles.pitchContainer}>
                <View style={styles.pitch}>
                    {/* Líneas del campo */}
                    <View style={styles.pitchCenterLine} />
                    <View style={styles.pitchCenterCircle} />
                    <View style={styles.pitchGoalAreaTop} />
                    <View style={styles.pitchGoalAreaBottom} />
                    <View style={styles.pitchPenaltyAreaTop} />
                    <View style={styles.pitchPenaltyAreaBottom} />

                    {/* Jugadores */}
                    {formation.positions.map((pos, index) => {
                        const player = lineup[index];
                        const isSwapSource = swapMode === index;
                        const isSwapTarget = swapMode !== null && swapMode !== index;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.playerMarker,
                                    {
                                        left: `${pos.x - 8}%`,
                                        top: `${100 - pos.y - 6}%`,
                                        backgroundColor: getPositionColor(pos.role),
                                    },
                                    isSwapSource && styles.playerMarkerSelected,
                                    isSwapTarget && styles.playerMarkerSwapTarget,
                                ]}
                                onPress={() => handlePositionPress(index)}
                                onLongPress={() => handlePositionLongPress(index)}
                                delayLongPress={300}
                            >
                                <Text style={styles.playerOverall}>{player?.overall || '?'}</Text>
                                <Text style={styles.playerName} numberOfLines={1}>
                                    {player?.name?.split(' ').pop() || 'Vacío'}
                                </Text>
                                {isSwapSource && <Text style={styles.swapIcon}>🔄</Text>}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Suplentes */}
            <View style={styles.subsSection}>
                <Text style={styles.subsTitle}>SUPLENTES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subsList}>
                    {substitutes.map((player, index) => (
                        <View key={player.id} style={styles.subCard}>
                            <View style={[styles.subBadge, { backgroundColor: getPositionColor(player.role) }]}>
                                <Text style={styles.subOverall}>{player.overall}</Text>
                            </View>
                            <Text style={styles.subName} numberOfLines={1}>{player.name.split(' ').pop()}</Text>
                            <Text style={styles.subRole}>{player.role}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Modal de formaciones */}
            <Modal visible={showFormationModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccionar Formación</Text>
                        {Object.values(formations).map(f => (
                            <TouchableOpacity
                                key={f.name}
                                style={[styles.formationOption, tactics.formation === f.name && styles.formationActive]}
                                onPress={() => handleFormationChange(f.name)}
                            >
                                <Text style={styles.formationName}>{f.name}</Text>
                                <Text style={styles.formationDesc}>{f.description}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowFormationModal(false)}>
                            <Text style={styles.modalCloseText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de selección de jugador */}
            <Modal visible={showPlayerModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Seleccionar Jugador para {formation.positions[selectedPosition]?.label || 'Posición'}
                        </Text>
                        <FlatList
                            data={myPlayers.sort((a, b) => b.overall - a.overall)}
                            keyExtractor={item => item.id}
                            style={styles.playerList}
                            renderItem={({ item }) => {
                                const inLineup = tactics.lineup.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        style={[styles.playerOption, inLineup && styles.playerInLineup]}
                                        onPress={() => handleSelectPlayer(item.id)}
                                    >
                                        <View style={[styles.playerOptionBadge, { backgroundColor: getPositionColor(item.role) }]}>
                                            <Text style={styles.playerOptionOverall}>{item.overall}</Text>
                                        </View>
                                        <View style={styles.playerOptionInfo}>
                                            <Text style={styles.playerOptionName}>{item.name}</Text>
                                            <Text style={styles.playerOptionRole}>{item.role} • {item.age} años</Text>
                                        </View>
                                        {inLineup && <Text style={styles.playerOptionStatus}>👕</Text>}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowPlayerModal(false)}>
                            <Text style={styles.modalCloseText}>Cancelar</Text>
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
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    configBar: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#161B22',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    configBtn: {
        flex: 1,
        alignItems: 'center',
    },
    configLabel: { color: '#8B949E', fontSize: 12, marginBottom: 4 },
    configValue: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    pressureRow: { flexDirection: 'row', gap: 8 },
    pressureBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#21262D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressureActive: { backgroundColor: '#238636' },
    pressureIcon: { fontSize: 16 },
    swapBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD70020',
        borderWidth: 1,
        borderColor: '#FFD700',
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 10,
        borderRadius: 8,
    },
    swapBannerText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    swapBannerCancel: {
        color: '#F85149',
        fontSize: 14,
        fontWeight: 'bold',
        paddingHorizontal: 12,
    },
    pitchContainer: {

        flex: 1,
        padding: 12,
    },
    pitch: {
        flex: 1,
        backgroundColor: '#1B5E20',
        borderRadius: 12,
        borderWidth: 3,
        borderColor: '#FFFFFF40',
        position: 'relative',
        overflow: 'hidden',
    },
    pitchCenterLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        height: 2,
        backgroundColor: '#FFFFFF30',
    },
    pitchCenterCircle: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 80,
        height: 80,
        marginLeft: -40,
        marginTop: -40,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#FFFFFF30',
    },
    pitchGoalAreaTop: {
        position: 'absolute',
        left: '30%',
        top: 0,
        width: '40%',
        height: '8%',
        borderWidth: 2,
        borderTopWidth: 0,
        borderColor: '#FFFFFF30',
    },
    pitchGoalAreaBottom: {
        position: 'absolute',
        left: '30%',
        bottom: 0,
        width: '40%',
        height: '8%',
        borderWidth: 2,
        borderBottomWidth: 0,
        borderColor: '#FFFFFF30',
    },
    pitchPenaltyAreaTop: {
        position: 'absolute',
        left: '20%',
        top: 0,
        width: '60%',
        height: '18%',
        borderWidth: 2,
        borderTopWidth: 0,
        borderColor: '#FFFFFF30',
    },
    pitchPenaltyAreaBottom: {
        position: 'absolute',
        left: '20%',
        bottom: 0,
        width: '60%',
        height: '18%',
        borderWidth: 2,
        borderBottomWidth: 0,
        borderColor: '#FFFFFF30',
    },
    playerMarker: {
        position: 'absolute',
        width: '16%',
        aspectRatio: 0.8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    playerOverall: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    playerName: {
        color: '#FFFFFF',
        fontSize: 9,
        textAlign: 'center',
    },
    playerMarkerSelected: {
        borderWidth: 3,
        borderColor: '#FFD700',
        transform: [{ scale: 1.1 }],
        zIndex: 10,
    },
    playerMarkerSwapTarget: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        borderStyle: 'dashed',
    },
    swapIcon: {
        position: 'absolute',
        top: -8,
        right: -8,
        fontSize: 14,
    },
    subsSection: {

        padding: 12,
        backgroundColor: '#161B22',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    subsTitle: { color: '#8B949E', fontSize: 12, marginBottom: 10 },
    subsList: { flexGrow: 0 },
    subCard: {
        alignItems: 'center',
        marginRight: 16,
        width: 60,
    },
    subBadge: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    subOverall: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    subName: { color: '#FFFFFF', fontSize: 10, textAlign: 'center' },
    subRole: { color: '#8B949E', fontSize: 9 },

    // Modales
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#161B22',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    formationOption: {
        padding: 16,
        backgroundColor: '#21262D',
        borderRadius: 10,
        marginBottom: 10,
    },
    formationActive: {
        backgroundColor: '#238636',
    },
    formationName: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    formationDesc: { color: '#8B949E', fontSize: 13 },
    modalClose: {
        padding: 16,
        backgroundColor: '#30363D',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    modalCloseText: { color: '#FFFFFF', fontSize: 16 },

    playerList: { maxHeight: 400 },
    playerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#21262D',
        borderRadius: 10,
        marginBottom: 8,
    },
    playerInLineup: {
        backgroundColor: '#1F3D2A',
    },
    playerOptionBadge: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    playerOptionOverall: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    playerOptionInfo: { flex: 1 },
    playerOptionName: { color: '#FFFFFF', fontSize: 15 },
    playerOptionRole: { color: '#8B949E', fontSize: 12 },
    playerOptionStatus: { fontSize: 20 },
    error: { color: '#F85149', textAlign: 'center', marginTop: 40 },
});
