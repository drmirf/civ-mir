class Unit {
    constructor(type, owner, x, y) {
        this.type = type;
        this.owner = owner;
        this.x = x;
        this.y = y;
        
        // Inicializa as propriedades com base no tipo de unidade
        const unitData = UNIT_TYPES[type] || UNIT_TYPES.warrior;
        
        this.name = unitData.name;
        this.maxMoves = unitData.moves;
        this.movesLeft = unitData.moves;
        this.strength = unitData.strength;
        this.range = unitData.range || 0;
        this.isNaval = unitData.isNaval || false;
        this.isRanged = unitData.range > 0;
        this.cost = unitData.cost;
        this.maintenance = unitData.maintenance || 0;
        
        // Estado da unidade
        this.health = 100;
        this.hasMoved = false;
        this.hasAttacked = false;
        this.isAwake = true; // Se a unidade está acordada (não em espera)
        this.path = []; // Caminho que a unidade está seguindo
    }
    
    // Verifica se a unidade pode se mover para um tile específico
    canMoveTo(tile, hexGrid) {
        // Verifica se o terreno é navegável para esta unidade
        if (!isNavigableTerrain(tile.terrainType, this)) {
            return false;
        }
        
        // Verifica se já há uma unidade no tile
        if (tile.unit) {
            return false;
        }
        
        // Verifica se a unidade tem movimento suficiente
        const movementCost = getTerrainMovementCost(tile.terrainType);
        return this.movesLeft >= movementCost;
    }
    
    // Move a unidade para um tile específico
    moveTo(tile, hexGrid) {
        if (!this.canMoveTo(tile, hexGrid)) {
            return false;
        }
        
        // Remove a unidade do tile atual
        const currentTile = hexGrid.getTile(this.x, this.y);
        if (currentTile) {
            currentTile.unit = null;
        }
        
        // Atualiza a posição da unidade
        this.x = tile.x;
        this.y = tile.y;
        
        // Coloca a unidade no novo tile
        tile.unit = this;
        
        // Desconta o custo de movimento
        const movementCost = getTerrainMovementCost(tile.terrainType);
        this.movesLeft -= movementCost;
        
        // Marca a unidade como tendo se movido
        this.hasMoved = true;
        
        return true;
    }
    
    // Ataca uma unidade inimiga
    attack(target) {
        if (this.hasAttacked) {
            return false;
        }
        
        // Verifica se a unidade tem alcance para o ataque
        const distance = calculateDistance(this.x, this.y, target.x, target.y);
        if (distance > this.range) {
            return false;
        }
        
        // Calcula o dano
        const damage = this.calculateDamage(target);
        
        // Aplica o dano
        target.takeDamage(damage);
        
        // Marca a unidade como tendo atacado
        this.hasAttacked = true;
        this.movesLeft = 0; // Não pode mais se mover após atacar
        
        return true;
    }
    
    // Calcula o dano que esta unidade causaria em um alvo
    calculateDamage(target) {
        // Fórmula simplificada para dano
        let damage = (this.strength * (this.health / 100)) * 10;
        
        // Modificadores de terreno
        const targetTile = target.hexGrid.getTile(target.x, target.y);
        if (targetTile) {
            const terrain = getTerrainInfo(targetTile.terrainType);
            damage = damage * (1 - (terrain.defense / 10));
        }
        
        // Arredonda o dano
        return Math.max(1, Math.round(damage));
    }
    
    // Recebe dano
    takeDamage(amount) {
        this.health -= amount;
        
        // Verifica se a unidade foi derrotada
        if (this.health <= 0) {
            this.die();
        }
    }
    
    // Unidade é destruída
    die() {
        // Remove a unidade do tile
        const tile = this.owner.game.hexGrid.getTile(this.x, this.y);
        if (tile) {
            tile.unit = null;
        }
        
        // Remove a unidade da civilização
        this.owner.removeUnit(this);
    }
    
    // Restaura movimento para o próximo turno
    resetForNewTurn() {
        this.movesLeft = this.maxMoves;
        this.hasMoved = false;
        this.hasAttacked = false;
    }
    
    // Inicia a ação de fundar uma cidade
    foundCity() {
        if (this.type !== 'settler') {
            return false;
        }
        
        // Verifica se o local é adequado
        const tile = this.owner.game.hexGrid.getTile(this.x, this.y);
        if (!tile || isWaterTerrain(tile.terrainType)) {
            return false;
        }
        
        // Cria a nova cidade
        const city = new City(generateUniqueId(), this.owner, this.x, this.y);
        this.owner.addCity(city);
        tile.city = city;
        
        // Remove o colonizador
        this.die();
        
        return true;
    }
    
    // Calcula a distância entre dois pontos
    static calculateDistance(x1, y1, x2, y2) {
        // Distância de Manhattan (simplificada para grade hexagonal)
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
}

// Gera um ID único para entidades
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Definições dos tipos de unidades
const UNIT_TYPES = {
    settler: {
        name: 'Colonizador',
        moves: 2,
        strength: 0, // Não pode atacar
        cost: 89,
        maintenance: 1
    },
    worker: {
        name: 'Trabalhador',
        moves: 2,
        strength: 0, // Não pode atacar
        cost: 70,
        maintenance: 1
    },
    warrior: {
        name: 'Guerreiro',
        moves: 2,
        strength: 4,
        cost: 40,
        maintenance: 1
    },
    archer: {
        name: 'Arqueiro',
        moves: 2,
        strength: 3,
        range: 2,
        cost: 40,
        maintenance: 1
    },
    spearman: {
        name: 'Lanceiro',
        moves: 2,
        strength: 5,
        cost: 50,
        maintenance: 1
    },
    horseman: {
        name: 'Cavaleiro',
        moves: 4,
        strength: 6,
        cost: 80,
        maintenance: 2
    },
    swordsman: {
        name: 'Espadachim',
        moves: 2,
        strength: 8,
        cost: 90,
        maintenance: 2
    },
    catapult: {
        name: 'Catapulta',
        moves: 1,
        strength: 4,
        range: 3,
        cost: 120,
        maintenance: 3
    },
    galley: {
        name: 'Galera',
        moves: 3,
        strength: 4,
        cost: 60,
        maintenance: 1,
        isNaval: true
    },
    trireme: {
        name: 'Trirreme',
        moves: 4,
        strength: 6,
        cost: 90,
        maintenance: 2,
        isNaval: true
    }
};

// Calcula a distância entre dois pontos
function calculateDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}