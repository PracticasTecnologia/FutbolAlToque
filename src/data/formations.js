// Formaciones tácticas disponibles
// Coordenadas en porcentaje del campo (0-100 para x e y)
// y=0 es el arco propio, y=100 es el arco rival

export const formations = {
    '4-4-2': {
        name: '4-4-2',
        description: 'Clásica y equilibrada',
        positions: [
            { x: 50, y: 5, role: 'GK', label: 'POR' },
            { x: 20, y: 25, role: 'LB', label: 'LI' },
            { x: 40, y: 20, role: 'CB', label: 'DFC' },
            { x: 60, y: 20, role: 'CB', label: 'DFC' },
            { x: 80, y: 25, role: 'RB', label: 'LD' },
            { x: 20, y: 50, role: 'LW', label: 'MI' },
            { x: 40, y: 45, role: 'CM', label: 'MC' },
            { x: 60, y: 45, role: 'CM', label: 'MC' },
            { x: 80, y: 50, role: 'RW', label: 'MD' },
            { x: 35, y: 75, role: 'ST', label: 'DC' },
            { x: 65, y: 75, role: 'ST', label: 'DC' },
        ]
    },
    '4-3-3': {
        name: '4-3-3',
        description: 'Ofensiva con alas',
        positions: [
            { x: 50, y: 5, role: 'GK', label: 'POR' },
            { x: 20, y: 25, role: 'LB', label: 'LI' },
            { x: 40, y: 20, role: 'CB', label: 'DFC' },
            { x: 60, y: 20, role: 'CB', label: 'DFC' },
            { x: 80, y: 25, role: 'RB', label: 'LD' },
            { x: 30, y: 45, role: 'CM', label: 'MC' },
            { x: 50, y: 40, role: 'CDM', label: 'MCD' },
            { x: 70, y: 45, role: 'CM', label: 'MC' },
            { x: 20, y: 70, role: 'LW', label: 'EI' },
            { x: 50, y: 75, role: 'ST', label: 'DC' },
            { x: 80, y: 70, role: 'RW', label: 'ED' },
        ]
    },
    '3-5-2': {
        name: '3-5-2',
        description: 'Control del medio',
        positions: [
            { x: 50, y: 5, role: 'GK', label: 'POR' },
            { x: 30, y: 20, role: 'CB', label: 'DFC' },
            { x: 50, y: 18, role: 'CB', label: 'DFC' },
            { x: 70, y: 20, role: 'CB', label: 'DFC' },
            { x: 15, y: 45, role: 'LB', label: 'CAI' },
            { x: 35, y: 42, role: 'CM', label: 'MC' },
            { x: 50, y: 38, role: 'CDM', label: 'MCD' },
            { x: 65, y: 42, role: 'CM', label: 'MC' },
            { x: 85, y: 45, role: 'RB', label: 'CAD' },
            { x: 35, y: 72, role: 'ST', label: 'DC' },
            { x: 65, y: 72, role: 'ST', label: 'DC' },
        ]
    },
    '4-2-3-1': {
        name: '4-2-3-1',
        description: 'Moderno con enganche',
        positions: [
            { x: 50, y: 5, role: 'GK', label: 'POR' },
            { x: 20, y: 25, role: 'LB', label: 'LI' },
            { x: 40, y: 20, role: 'CB', label: 'DFC' },
            { x: 60, y: 20, role: 'CB', label: 'DFC' },
            { x: 80, y: 25, role: 'RB', label: 'LD' },
            { x: 35, y: 40, role: 'CDM', label: 'MCD' },
            { x: 65, y: 40, role: 'CDM', label: 'MCD' },
            { x: 20, y: 58, role: 'LW', label: 'MI' },
            { x: 50, y: 55, role: 'CAM', label: 'MCO' },
            { x: 80, y: 58, role: 'RW', label: 'MD' },
            { x: 50, y: 78, role: 'ST', label: 'DC' },
        ]
    },
    '5-3-2': {
        name: '5-3-2',
        description: 'Defensiva sólida',
        positions: [
            { x: 50, y: 5, role: 'GK', label: 'POR' },
            { x: 10, y: 30, role: 'LB', label: 'CAI' },
            { x: 30, y: 22, role: 'CB', label: 'DFC' },
            { x: 50, y: 20, role: 'CB', label: 'DFC' },
            { x: 70, y: 22, role: 'CB', label: 'DFC' },
            { x: 90, y: 30, role: 'RB', label: 'CAD' },
            { x: 30, y: 48, role: 'CM', label: 'MC' },
            { x: 50, y: 45, role: 'CM', label: 'MC' },
            { x: 70, y: 48, role: 'CM', label: 'MC' },
            { x: 35, y: 72, role: 'ST', label: 'DC' },
            { x: 65, y: 72, role: 'ST', label: 'DC' },
        ]
    },
    '4-1-4-1': {
        name: '4-1-4-1',
        description: 'Equilibrio y amplitud',
        positions: [
            { x: 50, y: 5, role: 'GK', label: 'POR' },
            { x: 20, y: 25, role: 'LB', label: 'LI' },
            { x: 40, y: 20, role: 'CB', label: 'DFC' },
            { x: 60, y: 20, role: 'CB', label: 'DFC' },
            { x: 80, y: 25, role: 'RB', label: 'LD' },
            { x: 50, y: 35, role: 'CDM', label: 'MCD' },
            { x: 15, y: 55, role: 'LW', label: 'MI' },
            { x: 38, y: 52, role: 'CM', label: 'MC' },
            { x: 62, y: 52, role: 'CM', label: 'MC' },
            { x: 85, y: 55, role: 'RW', label: 'MD' },
            { x: 50, y: 78, role: 'ST', label: 'DC' },
        ]
    }
};

// Opciones de presión
export const pressureOptions = [
    { id: 'low', name: 'Baja', description: 'Defender atrás, contraatacar', icon: '🐢' },
    { id: 'medium', name: 'Media', description: 'Equilibrio defensa/ataque', icon: '⚖️' },
    { id: 'high', name: 'Alta', description: 'Presión adelantada', icon: '🔥' }
];

// Mentalidades
export const mentalityOptions = [
    { id: 'defensive', name: 'Defensiva', icon: '🛡️' },
    { id: 'balanced', name: 'Equilibrada', icon: '⚖️' },
    { id: 'attacking', name: 'Ofensiva', icon: '⚔️' }
];

// Obtener formación por nombre
export function getFormation(name) {
    return formations[name] || formations['4-4-2'];
}

// Lista de formaciones disponibles
export function getFormationList() {
    return Object.values(formations).map(f => ({
        name: f.name,
        description: f.description
    }));
}

// Táctica por defecto
export const defaultTactics = {
    formation: '4-4-2',
    pressure: 'medium',
    mentality: 'balanced',
    captain: null, // ID del jugador capitán
    lineup: [], // Array de 11 IDs en orden de posición
    substitutes: [] // Array de IDs de suplentes
};

// Verificar si un jugador puede jugar en una posición
export function canPlayPosition(playerRole, positionRole) {
    // Mapeo de roles compatibles
    const compatibility = {
        'GK': ['GK'],
        'CB': ['CB'],
        'LB': ['LB', 'RB', 'LW'],
        'RB': ['RB', 'LB', 'RW'],
        'CDM': ['CDM', 'CM', 'CB'],
        'CM': ['CM', 'CDM', 'CAM'],
        'CAM': ['CAM', 'CM', 'LW', 'RW'],
        'LW': ['LW', 'RW', 'CAM', 'ST'],
        'RW': ['RW', 'LW', 'CAM', 'ST'],
        'ST': ['ST', 'LW', 'RW', 'CAM']
    };

    return compatibility[playerRole]?.includes(positionRole) || false;
}
