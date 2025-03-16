class TurnManager {
    constructor(game) {
        this.game = game;
        this.currentTurn = 1;
        this.currentCivIndex = 0;
    }
    
    // Inicia um novo turno
    startTurn() {
        const currentCiv = this.game.civilizations[this.currentCivIndex];
        this.game.currentCivilization = currentCiv;
        
        console.log(`Iniciando turno ${this.currentTurn} para ${currentCiv.name}`);
        
        // Atualiza o contador de turnos na interface
        document.getElementById('turn-counter').textContent = this.currentTurn;
        
        // Restaura os movimentos das unidades
        currentCiv.units.forEach(unit => {
            unit.hasMoved = false;
            unit.movesLeft = unit.maxMoves;
        });
        
        // Processa as cidades da civilização
        currentCiv.cities.forEach(city => this.processCity(city));
        
        // Se for a IA, execute suas ações
        if (!currentCiv.isPlayer) {
            this.processAITurn(currentCiv);
        }
    }
    
    // Processa o turno de uma civilização controlada pela IA
    processAITurn(civilization) {
        console.log(`Processando turno da IA: ${civilization.name}`);
        
        // IA muito simples por enquanto
        for (const unit of civilization.units) {
            // Tenta fundar cidades com colonizadores
            if (unit.type === 'settler' && this.shouldFoundCity(unit)) {
                this.game.foundCity(unit);
                continue; // O colonizador foi consumido
            }
            
            // Move unidades aleatoriamente
            this.moveUnitRandomly(unit);
        }
        
        // Finaliza o turno da IA automaticamente após um breve atraso
        setTimeout(() => {
            this.endTurn();
        }, 500);
    }
    
    // Decide se a IA deve fundar uma cidade com um colonizador
    shouldFoundCity(settler) {
        // Verifica se o terreno é adequado
        const tile = this.game.hexGrid.getTile(settler.x, settler.y);
        if (!tile) return false;
        
        const terrain = getTerrainInfo(tile.terrainType);
        
        // Não funda cidades em terrenos ruins
        if (terrain.isWater || tile.terrainType === 'desert' || 
            tile.terrainType === 'snow' || tile.terrainType === 'mountains') {
            return false;
        }
        
        // Verifica se já existem cidades por perto
        const nearbyTiles = this.getNearbyTiles(settler.x, settler.y, 3);
        const hasCityNearby = nearbyTiles.some(t => t.city);
        
        if (hasCityNearby) {
            return false;
        }
        
        // 50% de chance de fundar uma cidade em um local adequado
        return Math.random() > 0.5;
    }
    
    // Move uma unidade aleatoriamente
    moveUnitRandomly(unit) {
        if (unit.hasMoved) return;
        
        const neighbors = this.game.hexGrid.getNeighbors(unit.x, unit.y);
        const validMoves = neighbors.filter(tile => {
            return !tile.unit && isNavigableTerrain(tile.terrainType, unit);
        });
        
        if (validMoves.length > 0) {
            const targetTile = validMoves[Math.floor(Math.random() * validMoves.length)];
            this.game.moveUnit(unit, targetTile.x, targetTile.y);
        }
    }
    
    // Obtém tiles próximos dentro de uma determinada distância
    getNearbyTiles(x, y, radius) {
        const result = [];
        
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                if (Math.abs(dx) + Math.abs(dy) <= radius) {
                    const nx = x + dx;
                    const ny = y + dy;
                    const tile = this.game.hexGrid.getTile(nx, ny);
                    
                    if (tile) {
                        result.push(tile);
                    }
                }
            }
        }
        
        return result;
    }
    
    // Processa uma cidade (produção, crescimento, etc.)
    processCity(city) {
        // Por enquanto, apenas incrementa a população a cada 5 turnos
        if (this.currentTurn % 5 === 0) {
            city.population += 1;
        }
        
        // Mais lógica de cidade será implementada posteriormente
    }
    
    // Finaliza o turno atual e passa para o próximo jogador ou turno
    endTurn() {
        // Avança para a próxima civilização
        this.currentCivIndex = (this.currentCivIndex + 1) % this.game.civilizations.length;
        
        // Se voltamos ao primeiro jogador, avançamos para o próximo turno
        if (this.currentCivIndex === 0) {
            this.currentTurn++;
        }
        
        // Inicia o próximo turno
        this.startTurn();
    }
}