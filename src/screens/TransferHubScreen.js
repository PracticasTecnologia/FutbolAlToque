// Pantalla Principal de Fichajes
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../data/teams';

export default function TransferHubScreen({ navigation }) {
    const { state, getTeam } = useGame();
    const myTeam = getTeam(state.manager.clubId);
    const budget = state.manager.budget || myTeam.budget;

    const sections = [
        {
            title: '🔍 Buscar Jugadores',
            desc: 'Explora el mercado global',
            icon: '🌍',
            action: () => navigation.navigate('PlayerSearch'),
            color: '#3498DB'
        },
        {
            title: '📥 Ofertas Recibidas',
            desc: 'Clubes interesados en tus jugadores',
            icon: '📩',
            count: 0, // TODO: Implementar conteo real
            action: () => navigation.navigate('Inbox', { filter: 'offers' }),
            color: '#F0B429'
        },
        {
            title: '📤 Mis Negociaciones',
            desc: 'Estado de tus ofertas enviadas',
            icon: '🤝',
            count: 0,
            action: () => navigation.navigate('Inbox', { filter: 'negotiations' }),
            color: '#2ECC71'
        },
        {
            title: '🏷️ Lista de Transferibles',
            desc: 'Gestionar ventas del club',
            icon: '📋',
            action: () => navigation.navigate('TransferList'),
            color: '#E74C3C'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>MERCADO DE FICHAJES</Text>
            </View>

            {/* Presupuesto */}
            <View style={styles.budgetCard}>
                <Text style={styles.budgetLabel}>Presupuesto de Fichajes</Text>
                <Text style={styles.budgetValue}>{formatMoney(budget)}</Text>
                <View style={styles.budgetRow}>
                    <Text style={styles.budgetSub}>💰 Disponible: {formatMoney(budget)}</Text>
                    <Text style={styles.budgetSub}>💸 Salarios: {formatMoney(0)}/sem</Text>
                </View>
            </View>

            {/* Secciones */}
            <ScrollView style={styles.menu}>
                {sections.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={item.action}
                    >
                        <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                            <Text style={styles.icon}>{item.icon}</Text>
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc}>{item.desc}</Text>
                        </View>
                        {item.count !== undefined && item.count > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.count}</Text>
                            </View>
                        )}
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                ))}

                {/* Noticias de fichajes (Placeholder) */}
                <View style={styles.newsSection}>
                    <Text style={styles.newsTitle}>📰 RUMORES DE MERCADO</Text>
                    <View style={styles.newsItem}>
                        <Text style={styles.newsText}>
                            <Text style={styles.highlight}>Real Madrid</Text> está preparando una oferta millonaria por
                            <Text style={styles.highlight}> Enzo Fernández</Text>.
                        </Text>
                    </View>
                    <View style={styles.newsItem}>
                        <Text style={styles.newsText}>
                            <Text style={styles.highlight}>Boca Juniors</Text> busca reforzar su defensa.
                        </Text>
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
        paddingBottom: 8,
    },
    back: { color: '#238636', fontSize: 16, marginRight: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    budgetCard: {
        backgroundColor: '#161B22',
        marginHorizontal: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#238636',
    },
    budgetLabel: { color: '#8B949E', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    budgetValue: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
    budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
    budgetSub: { color: '#8B949E', fontSize: 12 },
    menu: { flex: 1, padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161B22',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: { fontSize: 24 },
    cardInfo: { flex: 1 },
    cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { color: '#8B949E', fontSize: 12 },
    badge: {
        backgroundColor: '#F85149',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 8,
    },
    badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    arrow: { color: '#484F58', fontSize: 24 },
    newsSection: { marginTop: 20, marginBottom: 40 },
    newsTitle: { color: '#8B949E', fontSize: 12, fontWeight: 'bold', marginBottom: 12 },
    newsItem: {
        backgroundColor: '#161B22',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#238636',
    },
    newsText: { color: '#FFFFFF', fontSize: 13, lineHeight: 20 },
    highlight: { color: '#F0B429', fontWeight: 'bold' },
});
