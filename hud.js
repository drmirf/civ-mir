class HUD {
    constructor(game) {
        this.game = game;
        this.topPanel = document.getElementById('top-panel');
        this.resourcesContainer = document.getElementById('resources');
        this.sidePanel = document.getElementById('side-panel');
        
        // Inicializa os elementos da interface
        this.initializeElements();
    }
    
    // Inicializa os elementos da interface
    initializeElements() {
        // Cria elementos de recursos
        this.createResourceElements();
        
        // Atualiza a UI com os valores iniciais
        this.update();
    }
    
    // Cria elementos para exibir recursos
    createResourceElements() {
        // Define os recursos para exibir
        const resources = [
            { id: 'gold', icon: '💰', name: 'Ouro' },
            { id: 'science', icon: '🔬', name: 'Ciência' },
            { id: 'culture', icon: '🏛️', name: 'Cultura' }
        ];
        
        // Adiciona contadores de recursos ao painel superior
        for (const resource of resources) {
            const resourceElement = document.createElement('span');
            resourceElement.className = 'resource';
            resourceElement.innerHTML = `${resource.icon} <span id="${resource.id}-counter">0</span>`;
            resourceElement.title = resource.name;
            this.resourcesContainer.appendChild(resourceElement);
        }
    }
    
    // Atualiza todos os elementos da interface
    update() {
        this.updateResourceCounters();
        this.updateSelectedInfo();
    }
    
    // Atualiza os contadores de recursos
    updateResourceCounters() {
        if (!this.game.currentCivilization) return;
        
        const civ = this.game.currentCivilization;
        
        // Atualiza os contadores
        document.getElementById('gold-counter').textContent = civ.gold;
        document.getElementById('science-counter').textContent = civ.science;
        document.getElementById('culture-counter').textContent = civ.culture;
        
        // Atualiza o contador de turnos
        document.getElementById('turn-counter').textContent = this.game.turnManager.currentTurn;
    }
    
    // Atualiza as informações do tile/unidade/cidade selecionada
    updateSelectedInfo() {
        // Limpa os painéis de informação
        this.clearInfoPanels();
        
        // Se não houver nada selecionado, esconde o painel lateral
        if (!this.game.selectedTile) {
            this.sidePanel.classList.add('hidden');
            return;
        }
        
        // Mostra o painel lateral
        this.sidePanel.classList.remove('hidden');
        
        // Atualiza informações do terreno
        this.updateTerrainInfo();
        
        // Atualiza informações da unidade (se houver)
        if (this.game.selectedTile.unit) {
            this.updateUnitInfo(this.game.selectedTile.unit);
        } else {
            document.getElementById('unit-info').classList.add('hidden');
        }
        
        // Atualiza informações da cidade (se houver)
        if (this.game.selectedTile.city) {
            this.updateCityInfo(this.game.selectedTile.city);
        } else {
            document.getElementById('city-info').classList.add('hidden');
        }
    }
    
    // Limpa os painéis de informação
    clearInfoPanels() {
        document.getElementById('tile-details').innerHTML = '';
        document.getElementById('unit-details').innerHTML = '';
        document.getElementById('unit-actions').innerHTML = '';
        document.getElementById('city-details').innerHTML = '';
        document.getElementById('city-actions').innerHTML = '';
    }
    
    // Atualiza as informações do terreno
    updateTerrainInfo() {
        const tile = this.game.selectedTile;
        const terrain = getTerrainInfo(tile.terrainType);
        const tileDetails = document.getElementById('tile-details');
        
        tileDetails.innerHTML = `
            <p><strong>Tipo:</strong> ${terrain.name}</p>
            <p><strong>Defesa:</strong> +${terrain.defense}</p>
            <p><strong>Comida:</strong> ${terrain.food}</p>
            <p><strong>Produção:</strong> ${terrain.production}</p>
            <p><strong>Comércio:</strong> ${terrain.commerce}</p>
            <p><strong>Coordenadas:</strong> (${tile.x}, ${tile.y})</p>
        `;
        
        // Adiciona informação sobre recursos (se houver)
        if (tile.resource) {
            tileDetails.innerHTML += `<p><strong>Recurso:</strong> ${tile.resource}</p>`;
        }
    }
    
    // Atualiza as informações da unidade
    updateUnitInfo(unit) {
        const unitInfo = document.getElementById('unit-info');
        const unitDetails = document.getElementById('unit-details');
        const unitActions = document.getElementById('unit-actions');
        
        unitInfo.classList.remove('hidden');
        
        // Informações básicas da unidade
        unitDetails.innerHTML = `
            <p><strong>Tipo:</strong> ${unit.name}</p>
            <p><strong>Civilização:</strong> ${unit.owner.name}</p>
            <p><strong>Saúde:</strong> ${unit.health}%</p>
            <p><strong>Força:</strong> ${unit.strength}</p>
            <p><strong>Movimentos:</strong> ${unit.movesLeft}/${unit.maxMoves}</p>
        `;
        
        // Se a unidade pertence ao jogador atual, mostra as ações possíveis
        if (unit.owner === this.game.currentCivilization) {
            // Limpa ações anteriores
            unitActions.innerHTML = '';
            
            // Botão para pular turno
            if (!unit.hasMoved) {
                const skipButton = document.createElement('button');
                skipButton.textContent = 'Pular';
                skipButton.onclick = () => {
                    unit.hasMoved = true;
                    unit.movesLeft = 0;
                    this.update();
                };
                unitActions.appendChild(skipButton);
            }
            
            // Ações específicas por tipo de unidade
            if (unit.type === 'settler' && !unit.hasMoved) {
                const foundCityButton = document.createElement('button');
                foundCityButton.textContent = 'Fundar Cidade';
                foundCityButton.onclick = () => {
                    this.game.foundCity(unit);
                    this.update();
                };
                unitActions.appendChild(foundCityButton);
            }
            
            if (unit.type === 'worker' && !unit.hasMoved) {
                // Ações para trabalhadores (serão implementadas depois)
                const buildRoadButton = document.createElement('button');
                buildRoadButton.textContent = 'Construir Estrada';
                buildRoadButton.onclick = () => {
                    alert('Construção de estradas não implementada ainda.');
                };
                unitActions.appendChild(buildRoadButton);
            }
        } else {
            unitActions.innerHTML = '<p>Unidade pertence a outro jogador</p>';
        }
    }
    
    // Atualiza as informações da cidade
    updateCityInfo(city) {
        const cityInfo = document.getElementById('city-info');
        const cityDetails = document.getElementById('city-details');
        const cityActions = document.getElementById('city-actions');
        
        cityInfo.classList.remove('hidden');
        
        // Informações básicas da cidade
        cityDetails.innerHTML = `
            <p><strong>Nome:</strong> ${city.name}</p>
            <p><strong>Civilização:</strong> ${city.owner.name}</p>
            <p><strong>População:</strong> ${city.population}</p>
            <p><strong>Saúde:</strong> ${city.health}%</p>
            <p><strong>Comida:</strong> ${city.food}/${city.foodThreshold}</p>
            <p><strong>Produção:</strong> ${city.getProduction()} por turno</p>
        `;
        
        // Se a cidade pertence ao jogador atual, mostra as ações possíveis
        if (city.owner === this.game.currentCivilization) {
            cityActions.innerHTML = '<button id="city-manage-btn">Gerenciar Cidade</button>';
            
            // Configura o botão para gerenciar a cidade
            document.getElementById('city-manage-btn').onclick = () => {
                alert('Gerenciamento de cidades não implementado ainda.');
            };
        } else {
            cityActions.innerHTML = '<p>Cidade pertence a outro jogador</p>';
        }
    }
    
    // Mostra uma notificação ao jogador
    showNotification(message, type = 'info') {
        // Implementar um sistema de notificações pop-up
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }
}
