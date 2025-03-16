class City {
    constructor(id, owner, x, y) {
        this.id = id;
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.name = this.generateName();
        
        this.population = 1;
        this.health = 100;
        this.food = 0;
        this.foodThreshold = 10; // Comida necessária para crescer
        
        this.buildings = new Set();
        this.currentProduction = null;
        this.productionProgress = 0;
        
        // Define a área de trabalho da cidade (tiles que a cidade pode usar)
        this.workableTiles = [];
        this.workedTiles = new Set();
    }
    
    // Gera um nome aleatório para a cidade (simplificado)
    generateName() {
        const cityNames = [
            'Nova Roma', 'Alexandria', 'Atenas', 'Esparta', 'Cartago', 
            'Bizâncio', 'Babilônia', 'Ur', 'Tebas', 'Memphis',
            'Nineveh', 'Persépolis', 'Tiro', 'Sidon', 'Troia',
            'Micenas', 'Knossos', 'Corinto', 'Siracusa', 'Ravena'
        ];
        
        // Verifica se a civilização já tem cidades e adiciona um número
        const existingCities = this.owner.cities.length;
        const baseName = cityNames[Math.floor(Math.random() * cityNames.length)];
        
        return existingCities > 0 ? `${baseName} ${existingCities + 1}` : baseName;
    }
    
    // Calcula a produção da cidade com base em população e edifícios
    getProduction() {
        let baseProduction = this.population;
        
        // Bônus de edifícios
        if (this.buildings.has('workshop')) baseProduction += 2;
        if (this.buildings.has('factory')) baseProduction += 4;
        
        return baseProduction;
    }
    
    // Calcula a saída de ciência
    getScienceOutput() {
        let baseScience = Math.floor(this.population / 2);
        
        // Bônus de edifícios
        if (this.buildings.has('library')) baseScience += 2;
        if (this.buildings.has('university')) baseScience += 4;
        
        return baseScience;
    }
    
    // Calcula a renda de ouro
    getGoldIncome() {
        let baseGold = Math.floor(this.population / 3);
        
        // Bônus de edifícios
        if (this.buildings.has('market')) baseGold += 2;
        if (this.buildings.has('bank')) baseGold += 4;
        
        return baseGold;
    }
    
    // Calcula a saída de cultura
    getCultureOutput() {
        let baseCulture = 1; // Valor base para qualquer cidade
        
        // Bônus de edifícios
        if (this.buildings.has('monument')) baseCulture += 1;
        if (this.buildings.has('temple')) baseCulture += 2;
        
        return baseCulture;
    }
    
    // Processa o turno da cidade (crescimento, produção, etc.)
    processTurn() {
        // Processa o crescimento da cidade
        this.processGrowth();
        
        // Processa a produção da cidade
        this.processProduction();
        
        // Atualiza a saúde da cidade
        this.updateHealth();
    }
    
    // Processa o crescimento da população da cidade
    processGrowth() {
        // Calcula a comida produzida neste turno
        const foodProduction = this.getFoodProduction();
        this.food += foodProduction;
        
        // Verifica se atingimos o limiar para crescimento
        if (this.food >= this.foodThreshold) {
            this.population += 1;
            this.food -= this.foodThreshold;
            
            // Aumenta o limiar para o próximo crescimento
            this.foodThreshold = 10 + (this.population * 5);
            
            console.log(`${this.name} cresceu para população ${this.population}!`);
        }
    }
    
    // Calcula a produção de comida
    getFoodProduction() {
        let baseFood = this.population; // Produção base de comida
        
        // Bônus de edifícios
        if (this.buildings.has('granary')) baseFood += 2;
        if (this.buildings.has('aqueduct')) baseFood += 2;
        
        return baseFood;
    }
    
    // Processa a produção da cidade
    processProduction() {
        if (!this.currentProduction) return;
        
        const productionOutput = this.getProduction();
        this.productionProgress += productionOutput;
        
        // Verifica se a produção foi concluída
        if (this.productionProgress >= this.currentProduction.cost) {
            this.completeProduction();
        }
    }
    
    // Completa o item atual em produção
    completeProduction() {
        if (!this.currentProduction) return;
        
        switch (this.currentProduction.type) {
            case 'building':
                this.buildings.add(this.currentProduction.id);
                console.log(`${this.name} construiu ${this.currentProduction.name}!`);
                break;
                
            case 'unit':
                // Cria uma nova unidade
                const unit = new Unit(this.currentProduction.id, this.owner, this.x, this.y);
                this.owner.addUnit(unit);
                console.log(`${this.name} produziu uma unidade ${this.currentProduction.name}!`);
                break;
                
            case 'wonder':
                // Implementar maravilhas depois
                console.log(`${this.name} construiu a maravilha ${this.currentProduction.name}!`);
                break;
        }
        
        // Reseta o progresso de produção
        this.productionProgress = 0;
        this.currentProduction = null;
    }
    
    // Define o que a cidade vai produzir
    setProduction(productionItem) {
        this.currentProduction = productionItem;
        this.productionProgress = 0;
    }
    
    // Atualiza a saúde da cidade
    updateHealth() {
        // Por enquanto, a saúde se mantém estável
        // Implementar fatores que afetem a saúde da cidade no futuro
    }
    
    // Adiciona um edifício à cidade
    addBuilding(buildingId) {
        this.buildings.add(buildingId);
    }
    
    // Verifica se a cidade possui um determinado edifício
    hasBuilding(buildingId) {
        return this.buildings.has(buildingId);
    }
    
    // Inicializa os tiles trabalháveis da cidade
    initializeWorkableTiles(hexGrid) {
        this.workableTiles = [];
        
        // Adiciona tiles em um raio de 2 hexágonos
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                // Verifica se o deslocamento está dentro do raio da cidade
                if (Math.abs(dx) + Math.abs(dy) <= 2) {
                    const nx = this.x + dx;
                    const ny = this.y + dy;
                    
                    // Verifica se o tile está dentro dos limites do mapa
                    if (nx >= 0 && nx < hexGrid.width && ny >= 0 && ny < hexGrid.height) {
                        this.workableTiles.push({ x: nx, y: ny });
                    }
                }
            }
        }
    }
    
    // Atribui cidadãos para trabalhar em tiles
    assignCitizenToTile(x, y) {
        // Verifica se o tile está no raio da cidade
        const isTileWorkable = this.workableTiles.some(t => t.x === x && t.y === y);
        
        if (!isTileWorkable) {
            console.error(`Tile (${x}, ${y}) está fora do raio de trabalho de ${this.name}`);
            return false;
        }
        
        // Adiciona o tile à lista de tiles trabalhados
        this.workedTiles.add(`${x},${y}`);
        return true;
    }
    
    // Remove um cidadão de um tile
    removeCitizenFromTile(x, y) {
        return this.workedTiles.delete(`${x},${y}`);
    }
    
    // Verifica se um tile está sendo trabalhado
    isTileWorked(x, y) {
        return this.workedTiles.has(`${x},${y}`);
    }
}
