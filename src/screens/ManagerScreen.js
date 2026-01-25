import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { getTeam } from '../data/teams';

export default function ManagerScreen({ navigation }) {
    const { state } = useGame();
    const { manager } = state;
    const team = getTeam(manager.clubId);

    // Calcular porcentaje de victorias
    const winRate = manager.matches > 0
        ? ((manager.wins / manager.matches) * 100).toFixed(1)
        : '0.0';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>PERFIL DE MANAGER</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Perfil Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{manager.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.name}>{manager.name}</Text>
                    <Text style={styles.club}>{team.name}</Text>
                    <Text style={styles.reputation}>Reputación: ⭐⭐⭐ (Novato)</Text>
                </View>

                {/* Estadísticas de Carrera */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Estadísticas de Carrera</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{manager.matches}</Text>
                            <Text style={styles.statLabel}>Partidos</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{manager.wins}</Text>
                            <Text style={styles.statLabel}>Victorias</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{manager.draws}</Text>
                            <Text style={styles.statLabel}>Empates</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{manager.losses}</Text>
                            <Text style={styles.statLabel}>Derrotas</Text>
                        </View>
                    </View>
                    <View style={styles.winRateContainer}>
                        <Text style={styles.winRateLabel}>Porcentaje de Victoria</Text>
                        <Text style={styles.winRateValue}>{winRate}%</Text>
                    </View>
                </View>

                {/* Objetivos de la Temporada */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🎯 Objetivos de la Temporada</Text>
                    <View style={styles.objectiveItem}>
                        <Text style={styles.objectiveText}>Evitar el descenso</Text>
                        <View style={[styles.badge, styles.badgePending]}>
                            <Text style={styles.badgeText}>EN CURSO</Text>
                        </View>
                    </View>
                    <View style={styles.objectiveItem}>
                        <Text style={styles.objectiveText}>Mejorar la plantilla</Text>
                        <View style={[styles.badge, styles.badgeSuccess]}>
                            <Text style={styles.badgeText}>CUMPLIDO</Text>
                        </View>
                    </View>
                </View>

                {/* Información Personal */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>ℹ️ Información</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nacionalidad:</Text>
                        <Text style={styles.infoValue}>🇦🇷 Argentina</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Experiencia:</Text>
                        <Text style={styles.infoValue}>1 Año</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Sueldo:</Text>
                        <Text style={styles.infoValue}>$50k / semana</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D1117' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#30363D',
    },
    back: { color: '#238636', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

    scroll: { padding: 16 },

    profileHeader: { alignItems: 'center', marginBottom: 24 },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#238636',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
        borderWidth: 2, borderColor: '#FFF'
    },
    avatarText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
    name: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    club: { color: '#8B949E', fontSize: 18, marginBottom: 8 },
    reputation: { color: '#F0B429', fontSize: 14 },

    card: { backgroundColor: '#161B22', borderRadius: 12, padding: 16, marginBottom: 16 },
    cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#30363D', paddingBottom: 8 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    statItem: { width: '48%', backgroundColor: '#0D1117', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
    statValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    statLabel: { color: '#8B949E', fontSize: 12 },

    winRateContainer: { marginTop: 8, alignItems: 'center', backgroundColor: '#0D1117', padding: 12, borderRadius: 8 },
    winRateLabel: { color: '#8B949E', fontSize: 12 },
    winRateValue: { color: '#238636', fontSize: 24, fontWeight: 'bold' },

    objectiveItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    objectiveText: { color: '#C9D1D9', fontSize: 14 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    badgePending: { backgroundColor: '#D29922' },
    badgeSuccess: { backgroundColor: '#238636' },
    badgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    infoLabel: { color: '#8B949E' },
    infoValue: { color: '#FFF' },
});
