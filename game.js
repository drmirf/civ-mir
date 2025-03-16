class Game {
    constructor(config) {
        this.config = config;
        this.isRunning = false;
        this.selectedTile = null;
        this.selectedUnit = null;
        this.currentCivilization = null;
        
        // Inicializa os componentes do jogo
        this.hexGrid = new HexGrid(config.mapSize.width, config.mapSize.height, config.tileSize);
        this.mapGenerator = new MapGenerator(this.hexGrid, config.seed);
        this.civilizations = [];
        this.turnManager = new TurnManager(this);
        
        // Inicializa o canvas e o renderer
        this.canvas = document.getElementById('map-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.renderer = new Renderer(this);
        
        // Inicializa o manipulador de entrada
        this.inputHandler = new InputHandler(this);
        
        // Guarda o estado do mapa
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
    }
    
    // Inicia o jogo
    start() {
        console.log(`Iniciando novo jogo com seed: ${this.config.seed}`);
        
        // Gera o mapa
        this.hexGrid = this.mapGenerator.generate();
        
        // Encontra locais de início para civilizações
        const startLocations = this.mapGenerator.findStartingLocations(this.config.startingCivilizations + 1);
        
        // Cria civilizações
        this.createCivilizations(startLocations);
        
        // Define a civilização atual como a do jogador (índice 0)
        this.currentCivilization = this.civilizations[0];
        
        // Centraliza a câmera na unidade inicial do jogador
        if (this.currentCivilization.units.length > 0) {
            const firstUnit = this.currentCivilization.units[0];
            this.centerCameraOn(firstUnit.x, firstUnit.y);
        }
        
        // Ativa elementos da interface
        document.getElementById('ui-overlay').style.pointerEvents = 'auto';
        document.getElementById('side-panel').classList.remove('hidden');
        
        // Inicia o loop do jogo
        this.isRunning = true;
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Loop do jogo
    gameLoop() {
        if (!this.isRunning) return;
        
        // Limpa o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderiza o jogo
        this.renderer.render();
        
        // Continua o loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Cria civilizações a partir dos locais de início
    createCivilizations(startLocations) {
        const CIVILIZATIONS_DATA = [
            { id: 'player', name: 'Roma', color: '#E71919', isPlayer: true },
            { id: 'ai1', name: 'Egipto', color: '#EBCB00', isPlayer: false },
            { id: 'ai2', name: 'Grécia', color: '#00AEBB', isPlayer: false },
            { id: 'ai3', name: 'China', color: '#FCBB00', isPlayer: false }
        ];
        
        this.civilizations = [];
        
        for (let i = 0; i < Math.min(startLocations.length, this.config.startingCivilizations + 1); i++) {
            const location = startLocations[i];
            const civData = CIVILIZATIONS_DATA[i % CIVILIZATIONS_DATA.length];
            
            // Cria a civilização
            const civ = new Civilization(
                civData.id,
                civData.name,
                civData.color,
                civData.isPlayer
            );
            
            // Adiciona a unidade inicial (colonizador)
            const settler = new Unit('settler', civ, location.x, location.y);
            civ.addUnit(settler);
            
            // Coloca a unidade no mapa
            const tile = this.hexGrid.getTile(location.x, location.y);
            if (tile) {
                tile.unit = settler;
            }
            
            this.civilizations.push(civ);
        }
    }
    
    // Centraliza a câmera em coordenadas específicas
    centerCameraOn(x, y) {
        const pixelCoords = this.hexGrid.hexToPixel(x, y);
        
        this.camera.x = pixelCoords.x - this.canvas.width / 2;
        this.camera.y = pixelCoords.y - this.canvas.height / 2;
        
        // Garante que a câmera não saia dos limites do mapa
        this.clampCamera();
    }
    
    // Restringe a câmera aos limites do mapa
    clampCamera() {
        const maxX = this.hexGrid.width * this.hexGrid.hexWidth - this.canvas.width;
        const maxY = this.hexGrid.height * this.hexGrid.verticalDistance - this.canvas.height;
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
    }
    
    // Seleciona um tile
    selectTile(x, y) {
        const tile = this.hexGrid.getTile(x, y);
        
        if (tile) {
            this.selectedTile = tile;
            this.updateSidePanel();
            
            // Se houver uma unidade no tile, selecione-a
            if (tile.unit && tile.unit.owner === this.currentCivilization) {
                this.selectedUnit = tile.unit;
            } else {
                this.selectedUnit = null;
            }
        }
    }
    
    // Move uma unidade para uma nova posição
    moveUnit(unit, targetX, targetY) {
        if (!unit) return false;
        
        const targetTile = this.hexGrid.getTile(targetX, targetY);
        if (!targetTile) return false;
        
        // Verifica se o tile de destino está livre
        if (targetTile.unit) return false;
        
        // Verifica se o terreno é navegável para a unidade
        if (!isNavigableTerrain(targetTile.terrainType, unit)) return false;
        
        // Remove a unidade do tile atual
        const currentTile = this.hexGrid.getTile(unit.x, unit.y);
        if (currentTile) {
            currentTile.unit = null;
        }
        
        // Atualiza as coordenadas da unidade
        unit.x = targetX;
        unit.y = targetY;
        
        // Coloca a unidade no novo tile
        targetTile.unit = unit;
        
        // Marca a unidade como tendo se movido neste turno
        unit.hasMoved = true;
        
        return true;
    }
    
    // Atualiza o painel lateral com informações do tile selecionado
    updateSidePanel() {
        const sidePanel = document.getElementById('side-panel');
        const tileInfo = document.getElementById('tile-info');
        const tileDetails = document.getElementById('tile-details');
        const unitInfo = document.getElementById('unit-info');
        const unitDetails = document.getElementById('unit-details');
        const cityInfo = document.getElementById('city-info');
        
        if (!this.selectedTile) {
            sidePanel.classList.add('hidden');
            return;
        }
        
        sidePanel.classList.remove('hidden');
        
        // Exibe informações do terreno
        const terrain = getTerrainInfo(this.selectedTile.terrainType);
        tileDetails.innerHTML = `
            <p><strong>Tipo:</strong> ${terrain.name}</p>
            <p><strong>Defesa:</strong> ${terrain.defense}</p>
            <p><strong>Comida:</strong> ${terrain.food}</p>
            <p><strong>Produção:</strong> ${terrain.production}</p>
            <p><strong>Comércio:</strong> ${terrain.commerce}</p>
        `;
        
        // Exibe informações da unidade
        if (this.selectedTile.unit) {
            unitInfo.classList.remove('hidden');
            const unit = this.selectedTile.unit;
            unitDetails.innerHTML = `
                <p><strong>Tipo:</strong> ${unit.type}</p>
                <p><strong>Civilização:</strong> ${unit.owner.name}</p>
                <p><strong>Movimentos:</strong> ${unit.movesLeft}/${unit.maxMoves}</p>
            `;
            
            // Se a unidade pertencer ao jogador, mostre as ações possíveis
            const unitActions = document.getElementById('unit-actions');
            if (unit.owner === this.currentCivilization) {
                unitActions.innerHTML = '';
                
                // Adiciona botão de fundar cidade se for um colonizador
                if (unit.type === 'settler' && !unit.hasMoved) {
                    const foundButton = document.createElement('button');
                    foundButton.textContent = 'Fundar Cidade';
                    foundButton.onclick = () => this.foundCity(unit);
                    unitActions.appendChild(foundButton);
                }
                
                // Outras ações específicas de unidades podem ser adicionadas aqui
            } else {
                unitActions.innerHTML = '';
            }
        } else {
            unitInfo.classList.add('hidden');
        }
        
        // Exibe informações da cidade (se houver)
        if (this.selectedTile.city) {
            cityInfo.classList.remove('hidden');
            // Detalhes da cidade serão implementados posteriormente
        } else {
            cityInfo.classList.add('hidden');
        }
    }
    
    // Funda uma cidade usando um colonizador
    foundCity(settler) {
        if (settler.type !== 'settler') return;
        
        const x = settler.x;
        const y = settler.y;
        const tile = this.hexGrid.getTile(x, y);
        
        // Cria a cidade
        const city = new City(`city_${Date.now()}`, settler.owner, x, y);
        settler.owner.addCity(city);
        
        // Define a cidade no tile
        tile.city = city;
        
        // Remove o colonizador
        settler.owner.removeUnit(settler);
        tile.unit = null;
        
        // Atualiza a interface
        this.updateSidePanel();
        
        // Mensagem para o jogador
        if (settler.owner.isPlayer) {
            alert(`Cidade fundada em (${x}, ${y})!`);
        }
    }
    
    // Finaliza o jogo
    endGame() {
        this.isRunning = false;
        alert('Jogo finalizado!');
    }
}
