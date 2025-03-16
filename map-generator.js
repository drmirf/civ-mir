class MapGenerator {
    constructor(hexGrid, seed = null) {
        this.hexGrid = hexGrid;
        this.seed = seed || Math.floor(Math.random() * 1000000);
        this.random = this.createSeededRandom(this.seed);
    }
    
    // Função para criar um gerador de números aleatórios baseado em uma semente
    createSeededRandom(seed) {
        let currentSeed = seed;
        
        return function() {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / 233280;
        };
    }
    
    // Gera um mapa aleatório
    generate() {
        this.generateTerrain();
        this.createContinents();
        this.addDetailsAndResources();
        return this.hexGrid;
    }
    
    // Gera o terreno básico (principalmente oceano)
    generateTerrain() {
        for (let y = 0; y < this.hexGrid.height; y++) {
            for (let x = 0; x < this.hexGrid.width; x++) {
                this.hexGrid.setTerrain(x, y, 'ocean');
            }
        }
    }
    
    // Cria continentes usando um algoritmo de expansão de sementes
    createContinents() {
        const landPercentage = 0.30; // 30% do mapa será terra
        const totalTiles = this.hexGrid.width * this.hexGrid.height;
        const targetLandTiles = Math.floor(totalTiles * landPercentage);
        let currentLandTiles = 0;
        
        // Número de pontos de partida para continentes
        const continents = 3 + Math.floor(this.random() * 3); // 3-5 continentes
        const continentSeeds = [];
        
        // Crie pontos de sementes para continentes distantes uns dos outros
        for (let i = 0; i < continents; i++) {
            let x, y, isValid;
            
            do {
                isValid = true;
                x = Math.floor(this.random() * (this.hexGrid.width - 10)) + 5;
                y = Math.floor(this.random() * (this.hexGrid.height - 10)) + 5;
                
                // Verifique a distância de outras sementes
                for (const seed of continentSeeds) {
                    const distance = Math.sqrt(Math.pow(x - seed.x, 2) + Math.pow(y - seed.y, 2));
                    if (distance < Math.min(this.hexGrid.width, this.hexGrid.height) / 4) {
                        isValid = false;
                        break;
                    }
                }
            } while (!isValid);
            
            continentSeeds.push({ x, y });
            this.hexGrid.setTerrain(x, y, 'plains');
            currentLandTiles++;
        }
        
        // Expandir continentes até atingir a quantidade desejada de terreno
        while (currentLandTiles < targetLandTiles) {
            for (const seed of continentSeeds) {
                if (currentLandTiles >= targetLandTiles) break;
                
                // Encontrar todos os tiles de oceano adjacentes a terrenos
                const expandableTiles = [];
                
                for (let y = 0; y < this.hexGrid.height; y++) {
                    for (let x = 0; x < this.hexGrid.width; x++) {
                        const tile = this.hexGrid.getTile(x, y);
                        
                        if (tile.terrainType !== 'ocean') continue;
                        
                        const neighbors = this.hexGrid.getNeighbors(x, y);
                        const hasLandNeighbor = neighbors.some(n => n.terrainType !== 'ocean');
                        
                        if (hasLandNeighbor) {
                            expandableTiles.push({ x, y });
                        }
                    }
                }
                
                // Expandir aleatoriamente a partir dos tiles expansíveis
                if (expandableTiles.length > 0) {
                    const expansionChance = Math.min(0.7, (targetLandTiles - currentLandTiles) / expandableTiles.length);
                    
                    for (const tile of expandableTiles) {
                        if (this.random() < expansionChance) {
                            // Determinar o tipo de terreno com base na latitude (distância do centro vertical)
                            const latitude = Math.abs((tile.y - this.hexGrid.height / 2) / (this.hexGrid.height / 2));
                            let newTerrainType;
                            
                            if (latitude > 0.8) {
                                newTerrainType = this.random() < 0.7 ? 'snow' : 'tundra';
                            } else if (latitude > 0.6) {
                                newTerrainType = this.random() < 0.6 ? 'tundra' : 'plains';
                            } else if (latitude > 0.4) {
                                newTerrainType = this.random() < 0.6 ? 'plains' : 'grass';
                            } else if (latitude > 0.2) {
                                newTerrainType = this.random() < 0.7 ? 'grass' : 'plains';
                            } else {
                                const desertChance = this.random();
                                if (desertChance < 0.3) {
                                    newTerrainType = 'desert';
                                } else if (desertChance < 0.7) {
                                    newTerrainType = 'plains';
                                } else {
                                    newTerrainType = 'grass';
                                }
                            }
                            
                            this.hexGrid.setTerrain(tile.x, tile.y, newTerrainType);
                            currentLandTiles++;
                            
                            if (currentLandTiles >= targetLandTiles) break;
                        }
                    }
                }
            }
            
            // Se não conseguirmos expandir mais, sair do loop
            if (expandableTiles.length === 0) break;
        }
        
        // Adiciona costas ao redor de terras
        this.addCoastlines();
    }
    
    // Adiciona linhas costeiras ao redor de terras
    addCoastlines() {
        for (let y = 0; y < this.hexGrid.height; y++) {
            for (let x = 0; x < this.hexGrid.width; x++) {
                const tile = this.hexGrid.getTile(x, y);
                
                if (tile.terrainType === 'ocean') {
                    const neighbors = this.hexGrid.getNeighbors(x, y);
                    const hasLandNeighbor = neighbors.some(n => !isWaterTerrain(n.terrainType));
                    
                    if (hasLandNeighbor) {
                        this.hexGrid.setTerrain(x, y, 'coast');
                    }
                }
            }
        }
    }
    
    // Adiciona detalhes como florestas, montanhas e recursos
    addDetailsAndResources() {
        for (let y = 0; y < this.hexGrid.height; y++) {
            for (let x = 0; x < this.hexGrid.width; x++) {
                const tile = this.hexGrid.getTile(x, y);
                
                // Pula terrenos aquáticos
                if (isWaterTerrain(tile.terrainType)) continue;
                
                // Adiciona colinas com certa probabilidade
                if (this.random() < 0.12) {
                    this.hexGrid.setTerrain(x, y, 'hills');
                    continue;
                }
                
                // Adiciona montanhas com certa probabilidade
                if (this.random() < 0.08) {
                    this.hexGrid.setTerrain(x, y, 'mountains');
                    continue;
                }
                
                // Adiciona florestas em planícies e grama
                if ((tile.terrainType === 'grass' || tile.terrainType === 'plains') && this.random() < 0.25) {
                    this.hexGrid.setTerrain(x, y, 'forest');
                    continue;
                }
                
                // Adiciona selva em áreas próximas ao equador
                const latitude = Math.abs((y - this.hexGrid.height / 2) / (this.hexGrid.height / 2));
                if (latitude < 0.3 && tile.terrainType === 'grass' && this.random() < 0.3) {
                    this.hexGrid.setTerrain(x, y, 'jungle');
                }
                
                // Recursos serão implementados em uma etapa posterior
            }
        }
    }
    
    // Encontrar locais adequados para iniciar uma civilização
    findStartingLocations(numLocations) {
        const startingLocations = [];
        const minDistance = Math.floor(Math.min(this.hexGrid.width, this.hexGrid.height) / 3);
        
        // Tenta encontrar locais adequados
        let attempts = 0;
        while (startingLocations.length < numLocations && attempts < 1000) {
            attempts++;
            
            const x = Math.floor(this.random() * this.hexGrid.width);
            const y = Math.floor(this.random() * this.hexGrid.height);
            const tile = this.hexGrid.getTile(x, y);
            
            // Verifica se o local é adequado (terreno não aquático e não montanhoso)
            if (isWaterTerrain(tile.terrainType) || tile.terrainType === 'mountains' || 
                tile.terrainType === 'snow' || tile.terrainType === 'desert') {
                continue;
            }
            
            // Verifica se há outros pontos iniciais próximos
            let tooClose = false;
            for (const loc of startingLocations) {
                const distance = Math.sqrt(Math.pow(x - loc.x, 2) + Math.pow(y - loc.y, 2));
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                // Verifica se há recursos adequados por perto
                const neighbors = this.getExpandedNeighbors(x, y, 2);
                const landNeighbors = neighbors.filter(n => !isWaterTerrain(n.terrainType));
                
                // Um bom local de início tem pelo menos 5 tiles de terra ao redor
                if (landNeighbors.length >= 5) {
                    startingLocations.push({ x, y });
                }
            }
        }
        
        return startingLocations;
    }
    
    // Obtém vizinhos expandidos (até uma certa distância)
    getExpandedNeighbors(x, y, radius) {
        const neighbors = [];
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                // Pula o próprio tile
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                // Verifica se está dentro dos limites
                if (nx >= 0 && nx < this.hexGrid.width && ny >= 0 && ny < this.hexGrid.height) {
                    neighbors.push(this.hexGrid.getTile(nx, ny));
                }
            }
        }
        
        return neighbors;
    }
}
