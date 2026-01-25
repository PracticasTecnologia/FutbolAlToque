// Pantalla de Selección de Equipo
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../data/teams';
import { playerDatabase } from '../data/players';

export default function TeamSelectScreen({ navigation }) {
    const { teams, dispatch } = useGame();
    const [name, setName] = useState('');
    const [selected, setSelected] = useState(null);
    const [selectedLeague, setSelectedLeague] = useState('ARG');

    // Datos de las ligas disponibles
    const LEAGUES = [
        { id: 'ARG', name: '🇦🇷 Argentina', color: '#75AADB' },
        { id: 'ESP', name: '🇪🇸 España', color: '#F0B429' },
        { id: 'ENG', name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', color: '#E4002B' },
        { id: 'ITL', name: '🇮🇹 Italia', color: '#009344' },
        { id: 'GER', name: '🇩🇪 Alemania', color: '#DD0000' },
        { id: 'FRA', name: '🇫🇷 Francia', color: '#0055A4' },
        { id: 'BRA', name: '🇧🇷 Brasil', color: '#FFDF00' },
    ];

    const filteredTeams = teams.filter(t => t.leagueId === selectedLeague);

    const handleStart = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Ingresa tu nombre de DT');
            return;
        }
        if (!selected) {
            Alert.alert('Error', 'Selecciona un equipo');
            return;
        }
        dispatch({ type: 'NEW_GAME', name: name.trim(), teamId: selected });
        navigation.replace('Dashboard');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>NUEVA CARRERA</Text>
            </View>

            <View style={styles.inputWrap}>
                <Text style={styles.label}>Tu nombre de DT:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ingresa tu nombre..."
                    placeholderTextColor="#484F58"
                    maxLength={20}
                />
            </View>

            {/* Selector de Liga */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.leagueSelector}
                >
                    {LEAGUES.map(league => (
                        <TouchableOpacity
                            key={league.id}
                            style={[
                                styles.leagueBtn,
                                selectedLeague === league.id && { backgroundColor: league.color + '20', borderColor: league.color }
                            ]}
                            onPress={() => setSelectedLeague(league.id)}
                        >
                            <Text style={[
                                styles.leagueBtnText,
                                selectedLeague === league.id && { color: league.color, fontWeight: 'bold' }
                            ]}>
                                {league.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Text style={styles.label}>Selecciona tu equipo:</Text>

            <FlatList
                data={filteredTeams}
                keyExtractor={item => item.id}
                style={styles.list}
                renderItem={({ item }) => {
                    const playerCount = playerDatabase[item.id]?.length || 0;
                    return (
                        <TouchableOpacity
                            style={[styles.teamCard, selected === item.id && styles.teamSelected]}
                            onPress={() => setSelected(item.id)}
                        >
                            <View style={[styles.teamColor, { backgroundColor: item.color }]} />
                            <View style={styles.teamInfo}>
                                <Text style={styles.teamName}>{item.name}</Text>
                                <Text style={styles.teamRep}>
                                    Rep: {item.rep} • {playerCount} jugadores
                                </Text>
                            </View>
                            <Text style={styles.teamBudget}>{formatMoney(item.budget)}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            <TouchableOpacity
                style={[styles.startBtn, (!name.trim() || !selected) && styles.startBtnDisabled]}
                onPress={handleStart}
                disabled={Boolean(!name.trim() || !selected)}
            >
                <Text style={styles.startBtnText}>🚀 COMENZAR CARRERA</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    back: {
        color: '#238636',
        fontSize: 16,
        marginRight: 16,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 22,
    },
    leagueSelector: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    leagueBtn: {
        minWidth: 100,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#30363D',
        alignItems: 'center',
        backgroundColor: '#161B22',
    },
    leagueBtnText: {
        color: '#8B949E',
        fontSize: 12,
    },
    inputWrap: {
        marginBottom: 16,
    },
    label: {
        color: '#8B949E',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#161B22',
        borderRadius: 8,
        padding: 14,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#30363D',
    },
    list: {
        flex: 1,
        marginVertical: 8,
    },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161B22',
        borderRadius: 8,
        padding: 14,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    teamSelected: {
        borderColor: '#238636',
        backgroundColor: '#21262D',
    },
    teamColor: {
        width: 6,
        height: 40,
        borderRadius: 3,
        marginRight: 14,
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    teamRep: {
        color: '#8B949E',
        fontSize: 12,
        marginTop: 2,
    },
    teamBudget: {
        color: '#F0B429',
        fontSize: 16,
    },
    startBtn: {
        backgroundColor: '#238636',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    startBtnDisabled: {
        opacity: 0.5,
    },
    startBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
});
