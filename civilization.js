class Civilization {
    constructor(id, name, color, isPlayer = false) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.isPlayer = isPlayer;
        
        this.units = [];
        this.cities = [];
        
        this.gold = 0;
        this.science = 0;
        this.culture = 0;
        
        this.technologies = new Set();
        this.discoveredTiles = new Set();
    }
    
    // Adiciona uma unidade à civilização
    addUnit(unit) {
        this.units.push(unit);
        unit.owner = this;
    }
    
    // Remove uma unidade da civilização
    removeUnit(unit) {
        const index = this.units.indexOf(unit);
        if (index !== -1) {
            this.units.splice(index, 1);
        }
    }
    
    // Adiciona uma cidade à civilização
    addCity(city) {
        this.cities.push(city);
        city.owner = this;
    }
    
    // Remove uma cidade da civilização
    removeCity(city) {
        const index = this.cities.indexOf(city);
        if (index !== -1) {
            this.cities.splice(index, 1);
        }
    }
    
    // Calcula a população total da civilização
    getTotalPopulation() {
        return this.cities.reduce((total, city) => total + city.population, 0);
    }
    
    // Calcula a produção total da civilização
    getTotalProduction() {
        return this.cities.reduce((total, city) => total + city.getProduction(), 0);
    }
    
    // Verifica se a civilização possui uma determinada tecnologia
    hasTechnology(techId) {
        return this.technologies.has(techId);
    }
    
    // Adiciona uma nova tecnologia à civilização
    addTechnology(techId) {
        this.technologies.add(techId);
        
        // Acionadores específicos por tecnologia seriam implementados aqui
        console.log(`${this.name} descobriu a tecnologia: ${techId}`);
    }
    
    // Descobre um tile (adiciona à memória da civilização)
    discoverTile(x, y) {
        this.discoveredTiles.add(`${x},${y}`);
    }
    
    // Verifica se um tile foi descoberto pela civilização
    hasDiscoveredTile(x, y) {
        return this.discoveredTiles.has(`${x},${y}`);
    }
    
    // Atualiza a economia da civilização (chamado a cada turno)
    updateEconomy() {
        let goldIncome = 0;
        let scienceIncome = 0;
        let cultureIncome = 0;
        
        // Calcula a renda de ouro, ciência e cultura das cidades
        for (const city of this.cities) {
            goldIncome += city.getGoldIncome();
            scienceIncome += city.getScienceOutput();
            cultureIncome += city.getCultureOutput();
        }
        
        // Aplica os novos valores
        this.gold += goldIncome;
        this.science += scienceIncome;
        this.culture += cultureIncome;
        
        return {
            goldIncome,
            scienceIncome,
            cultureIncome
        };
    }
    
    // Gasta ouro (retorna true se tiver sucesso)
    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
}