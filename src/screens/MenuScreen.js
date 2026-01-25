// Pantalla de Menú Principal - Diseño Premium
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';

const { width } = Dimensions.get('window');

export default function MenuScreen({ navigation }) {
    const { state } = useGame();
    const hasSave = state.manager !== null;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const ballBounce = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Ball bounce animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(ballBounce, { toValue: -15, duration: 600, useNativeDriver: true }),
                Animated.timing(ballBounce, { toValue: 0, duration: 600, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0D1117', '#1A2332', '#0D1117']}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                {/* Logo Section */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Animated.Text style={[styles.ball, { transform: [{ translateY: ballBounce }] }]}>⚽</Animated.Text>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>FÚTBOL</Text>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.titleGradient}
                        >
                            <Text style={styles.titleGreen}>AL TOQUE</Text>
                        </LinearGradient>
                    </View>
                    <Text style={styles.subtitle}>Manager de Fútbol Argentino</Text>

                    {/* Decorative line */}
                    <View style={styles.decorativeLine}>
                        <View style={styles.lineLeft} />
                        <Text style={styles.lineStar}>★</Text>
                        <View style={styles.lineRight} />
                    </View>
                </Animated.View>

                {/* Buttons Section */}
                <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.btnPrimaryContainer}
                        onPress={() => navigation.navigate('TeamSelect')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.btnPrimary}
                        >
                            <Text style={styles.btnIcon}>⚽</Text>
                            <View style={styles.btnTextContainer}>
                                <Text style={styles.btnPrimaryText}>NUEVA PARTIDA</Text>
                                <Text style={styles.btnSubtext}>Comienza tu carrera</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btnSecondary, !hasSave && styles.btnDisabled]}
                        onPress={() => hasSave && navigation.navigate('Dashboard')}
                        disabled={!hasSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btnSecondaryIcon}>📂</Text>
                        <View style={styles.btnTextContainer}>
                            <Text style={[styles.btnSecondaryText, !hasSave && styles.textDisabled]}>
                                CONTINUAR
                            </Text>
                            {hasSave && state.manager && (
                                <Text style={styles.btnSubtextSecondary}>
                                    {state.manager.clubId?.toUpperCase()} • Jornada {state.manager.week}
                                </Text>
                            )}
                            {!hasSave && (
                                <Text style={styles.btnSubtextDisabled}>Sin partida guardada</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>7</Text>
                            <Text style={styles.statLabel}>Ligas</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>80+</Text>
                            <Text style={styles.statLabel}>Equipos</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>2000+</Text>
                            <Text style={styles.statLabel}>Jugadores</Text>
                        </View>
                    </View>
                    <Text style={styles.version}>v2.0.0 • React Native</Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1117',
    },
    safeArea: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -50,
        left: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(59, 130, 246, 0.03)',
    },

    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    ball: {
        fontSize: 64,
        marginBottom: 20,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    titleGradient: {
        marginTop: -4,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 8,
    },
    titleGreen: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 20,
        letterSpacing: 2,
    },
    decorativeLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    lineLeft: {
        width: 60,
        height: 1,
        backgroundColor: '#374151',
    },
    lineStar: {
        color: '#F59E0B',
        fontSize: 16,
        marginHorizontal: 12,
    },
    lineRight: {
        width: 60,
        height: 1,
        backgroundColor: '#374151',
    },

    buttons: {
        marginBottom: 32,
    },
    btnPrimaryContainer: {
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    btnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 22,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    btnIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    btnTextContainer: {
        flex: 1,
    },
    btnPrimaryText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    btnSubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginTop: 4,
    },

    btnSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    btnSecondaryIcon: {
        fontSize: 28,
        marginRight: 16,
    },
    btnSecondaryText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 1,
    },
    btnSubtextSecondary: {
        color: '#10B981',
        fontSize: 12,
        marginTop: 4,
    },
    btnSubtextDisabled: {
        color: '#4B5563',
        fontSize: 12,
        marginTop: 4,
    },
    btnDisabled: {
        opacity: 0.5,
    },
    textDisabled: {
        color: '#6B7280',
    },

    footer: {
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    statValue: {
        color: '#10B981',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#6B7280',
        fontSize: 11,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#374151',
    },
    version: {
        color: '#4B5563',
        fontSize: 12,
    },
});
