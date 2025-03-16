// Definições dos tipos de terreno
const TERRAIN_TYPES = {
    ocean: {
        name: 'Oceano',
        color: '#0055AA',
        movementCost: 999, // Intransitável para unidades terrestres
        defense: 0,
        food: 1,
        production: 0,
        commerce: 2,
        isWater: true
    },
    coast: {
        name: 'Costa',
        color: '#0099FF',
        movementCost: 999, // Intransitável para unidades terrestres
        defense: 0,
        food: 2,
        production: 0,
        commerce: 1,
        isWater: true
    },
    grass: {
        name: 'Planície',
        color: '#33AA33',
        movementCost: 1,
        defense: 1,
        food: 2,
        production: 0,
        commerce: 0,
        isWater: false
    },
    plains: {
        name: 'Campos',
        color: '#BBBB33',
        movementCost: 1,
        defense: 1,
        food: 1,
        production: 1,
        commerce: 0,
        isWater: false
    },
    desert: {
        name: 'Deserto',
        color: '#DDCC55',
        movementCost: 1,
        defense: 1,
        food: 0,
        production: 1,
        commerce: 0,
        isWater: false
    },
    tundra: {
        name: 'Tundra',
        color: '#AABBAA',
        movementCost: 1,
        defense: 1,
        food: 1,
        production: 0,
        commerce: 0,
        isWater: false
    },
    snow: {
        name: 'Neve',
        color: '#EEEEFF',
        movementCost: 1,
        defense: 1,
        food: 0,
        production: 0,
        commerce: 0,
        isWater: false
    },
    hills: {
        name: 'Colinas',
        color: '#669944',
        movementCost: 2,
        defense: 3,
        food: 1,
        production: 1,
        commerce: 0,
        isWater: false
    },
    mountains: {
        name: 'Montanhas',
        color: '#777777',
        movementCost: 999, // Intransitável
        defense: 6,
        food: 0,
        production: 1,
        commerce: 0,
        isWater: false
    },
    forest: {
        name: 'Floresta',
        color: '#005500',
        movementCost: 2,
        defense: 3,
        food: 1,
        production: 2,
        commerce: 0,
        isWater: false,
        isForest: true
    },
    jungle: {
        name: 'Selva',
        color: '#007700',
        movementCost: 2,
        defense: 3,
        food: 1,
        production: 0,
        commerce: 0,
        isWater: false,
        isForest: true
    }
};

// Função para obter informações de um tipo de terreno
function getTerrainInfo(type) {
    return TERRAIN_TYPES[type] || TERRAIN_TYPES.grass; // Retorna grama como padrão se o tipo não existir
}

// Função para obter a cor de um tipo de terreno
function getTerrainColor(type) {
    return getTerrainInfo(type).color;
}

// Função para obter o custo de movimento de um tipo de terreno
function getTerrainMovementCost(type) {
    return getTerrainInfo(type).movementCost;
}

// Função para verificar se um terreno é água
function isWaterTerrain(type) {
    return getTerrainInfo(type).isWater;
}

// Função para verificar se um terreno é navegável
function isNavigableTerrain(type, unit) {
    const terrain = getTerrainInfo(type);
    
    // Unidades navais podem mover-se apenas em água
    if (unit.isNaval) {
        return terrain.isWater;
    }
    
    // Unidades terrestres não podem mover-se na água
    if (!unit.isNaval && terrain.isWater) {
        return false;
    }
    
    // Terrenos com custo de movimento infinito são intransitáveis
    return terrain.movementCost < 999;
}
