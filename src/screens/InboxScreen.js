import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';

export default function InboxScreen({ navigation, route }) {
    const { state, markMessageAsRead, addMessage } = useGame();
    const { manager, messages } = state;
    const filter = route.params?.filter || 'all';

    const [selectedMessage, setSelectedMessage] = useState(null);

    // Filtrar mensajes (por ahora solo mostramos todos o filtramos ligeramente si es necesario)
    const filteredMessages = messages.filter(msg => {
        if (filter === 'offers') return msg.subject.includes('Oferta') || msg.subject.includes('Transferencia');
        if (filter === 'negotiations') return msg.subject.includes('Negociación');
        return true;
    });

    const handleOpenMessage = (msg) => {
        setSelectedMessage(msg);
        if (!msg.read) {
            markMessageAsRead(msg.id);
        }
    };

    const handleTestMessage = () => {
        addMessage(
            'Director Deportivo',
            'Oferta por jugador',
            'El Manchester City está interesado en tu delantero estrella. Ofrecen 80M. ¿Qué opinas?',
            'offer'
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.messageItem, !item.read && styles.unreadItem]}
            onPress={() => handleOpenMessage(item)}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.itemIcon}>{item.type === 'offer' ? '💰' : '📩'}</Text>
            </View>
            <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                    <Text style={[styles.sender, !item.read && styles.unreadText]}>{item.sender}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={[styles.subject, !item.read && styles.unreadText]} numberOfLines={1}>{item.subject}</Text>
                <Text style={styles.preview} numberOfLines={1}>{item.body}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>BUZÓN DE ENTRADA</Text>
                <TouchableOpacity onPress={handleTestMessage}>
                    <Text style={styles.testBtn}>+ Test</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredMessages}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No tienes mensajes nuevos.</Text>
                    </View>
                }
            />

            {/* Modal de Lectura */}
            <Modal
                visible={!!selectedMessage}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedMessage(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Mensaje</Text>
                            <TouchableOpacity onPress={() => setSelectedMessage(null)}>
                                <Text style={styles.closeBtn}>X</Text>
                            </TouchableOpacity>
                        </View>
                        {selectedMessage && (
                            <ScrollView style={styles.modalBody}>
                                <Text style={styles.msgSubject}>{selectedMessage.subject}</Text>
                                <View style={styles.msgMeta}>
                                    <Text style={styles.msgSender}>De: {selectedMessage.sender}</Text>
                                    <Text style={styles.msgDate}>{selectedMessage.date}</Text>
                                </View>
                                <View style={styles.divider} />
                                <Text style={styles.msgBody}>{selectedMessage.body}</Text>

                                {selectedMessage.type === 'offer' && (
                                    <View style={styles.actions}>
                                        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => setSelectedMessage(null)}>
                                            <Text style={styles.actionText}>Aceptar Oferta</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => setSelectedMessage(null)}>
                                            <Text style={styles.actionText}>Rechazar</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>
                        )}
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
        borderBottomWidth: 1,
        borderBottomColor: '#30363D',
        justifyContent: 'space-between'
    },
    back: { color: '#238636', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    testBtn: { color: '#58A6FF', fontSize: 12 },

    list: { padding: 16 },
    messageItem: {
        flexDirection: 'row',
        backgroundColor: '#161B22',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        alignItems: 'center'
    },
    unreadItem: {
        backgroundColor: '#21262d',
        borderLeftWidth: 3,
        borderLeftColor: '#238636'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#30363D',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    itemIcon: { fontSize: 20 },
    messageContent: { flex: 1 },
    messageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    sender: { color: '#8B949E', fontSize: 12, fontWeight: '600' },
    date: { color: '#484F58', fontSize: 10 },
    subject: { color: '#FFFFFF', fontSize: 14, marginBottom: 2 },
    preview: { color: '#8B949E', fontSize: 12 },
    unreadText: { color: '#FFFFFF', fontWeight: 'bold' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#238636', marginLeft: 8 },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#8B949E' },

    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#161B22', borderRadius: 16, maxHeight: '80%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#30363D' },
    modalTitle: { color: '#FFF', fontWeight: 'bold' },
    closeBtn: { color: '#8B949E', fontSize: 18, fontWeight: 'bold' },
    modalBody: { padding: 20 },
    msgSubject: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    msgMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    msgSender: { color: '#58A6FF' },
    msgDate: { color: '#8B949E' },
    divider: { height: 1, backgroundColor: '#30363D', marginBottom: 16 },
    msgBody: { color: '#C9D1D9', fontSize: 16, lineHeight: 24 },

    actions: { flexDirection: 'row', marginTop: 30, justifyContent: 'space-around' },
    actionBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
    acceptBtn: { backgroundColor: '#238636' },
    rejectBtn: { backgroundColor: '#DA3633' },
    actionText: { color: '#FFF', fontWeight: 'bold' }
});
