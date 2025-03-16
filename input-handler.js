class InputHandler {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.hexGrid = game.hexGrid;
        
        // Estado do mouse
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Configura os listeners de eventos
        this.setupEventListeners();
    }
    
    // Configura os listeners para interações do usuário
    setupEventListeners() {
        // Mouse
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleMouseWheel.bind(this));
        
        // Teclado
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Botões da interface
        document.getElementById('end-turn-btn').addEventListener('click', () => {
            this.game.turnManager.endTurn();
        });
    }
    
    // Manipula o evento de pressionar o botão do mouse
    handleMouseDown(event) {
        event.preventDefault();
        
        // Captura a posição inicial do mouse
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        
        // Verifica qual botão do mouse foi pressionado
        if (event.button === 0) { // Botão esquerdo
            // Converte as coordenadas da tela para coordenadas do mapa
            const mapX = event.clientX + this.game.camera.x;
            const mapY = event.clientY + this.game.camera.y;
            
            // Converte para coordenadas da grade
            const hexCoords = this.hexGrid.pixelToHex(mapX, mapY);
            
            // Tenta selecionar um tile
            this.selectTileAt(hexCoords.q, hexCoords.r);
        } else if (event.button === 2) { // Botão direito
            // Inicia o modo de arrastar o mapa
            this.isDragging = true;
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    // Manipula o evento de mover o mouse
    handleMouseMove(event) {
        event.preventDefault();
        
        // Se estamos arrastando o mapa
        if (this.isDragging) {
            // Calcula a diferença de posição
            const deltaX = event.clientX - this.lastMouseX;
            const deltaY = event.clientY - this.lastMouseY;
            
            // Atualiza a posição da câmera
            this.game.camera.x -= deltaX;
            this.game.camera.y -= deltaY;
            
            // Garante que a câmera não saia dos limites do mapa
            this.game.clampCamera();
            
            // Atualiza a última posição conhecida do mouse
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }
    
    // Manipula o evento de soltar o botão do mouse
    handleMouseUp(event) {
        event.preventDefault();
        
        // Finaliza o arrasto
        if (this.isDragging) {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        }
    }
    
    // Manipula o evento da roda do mouse (zoom)
    handleMouseWheel(event) {
        event.preventDefault();
        
        // Implementação básica de zoom (será refinada posteriormente)
        // const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        // this.game.camera.zoom *= zoomFactor;
        
        // Limita o zoom
        // this.game.camera.zoom = Math.max(0.5, Math.min(2, this.game.camera.zoom));
    }
    
    // Manipula eventos de teclado
    handleKeyDown(event) {
        // Movimentação com teclas WASD ou setas
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                this.game.camera.y -= 30;
                break;
            case 's':
            case 'ArrowDown':
                this.game.camera.y += 30;
                break;
            case 'a':
            case 'ArrowLeft':
                this.game.camera.x -= 30;
                break;
            case 'd':
            case 'ArrowRight':
                this.game.camera.x += 30;
                break;
            case 'n':
                // Próximo turno
                this.game.turnManager.endTurn();
                break;
            case ' ':
                // Pular turno da unidade selecionada
                if (this.game.selectedUnit) {
                    this.game.selectedUnit.hasMoved = true;
                    this.game.selectedUnit.movesLeft = 0;
                }
                break;
        }
        
        // Garante que a câmera não saia dos limites do mapa
        this.game.clampCamera();
    }
    
    // Seleciona um tile nas coordenadas especificadas
    selectTileAt(q, r) {
        const tile = this.hexGrid.getTile(q, r);
        
        if (!tile) return;
        
        this.game.selectTile(q, r);
        
        // Se a unidade atual estiver selecionada e o jogador clicar em outro tile
        if (this.game.selectedUnit && (this.game.selectedUnit.x !== q || this.game.selectedUnit.y !== r)) {
            // Tenta mover a unidade para o novo tile
            this.attemptUnitMove(this.game.selectedUnit, q, r);
        }
    }
    
    // Tenta mover uma unidade para um novo tile
    attemptUnitMove(unit, targetX, targetY) {
        // Verifica se a unidade pertence ao jogador atual
        if (unit.owner !== this.game.currentCivilization) {
            console.log('Esta unidade não pertence ao jogador atual');
            return;
        }
        
        // Verifica se a unidade já se moveu neste turno
        if (unit.hasMoved) {
            console.log('Esta unidade já se moveu neste turno');
            return;
        }
        
        // Obtém o tile de destino
        const targetTile = this.hexGrid.getTile(targetX, targetY);
        
        if (!targetTile) {
            console.log('Tile de destino inválido');
            return;
        }
        
        // Verifica se há uma unidade inimiga no tile de destino
        if (targetTile.unit && targetTile.unit.owner !== unit.owner) {
            // Tenta atacar a unidade inimiga
            if (unit.attack(targetTile.unit)) {
                console.log(`${unit.name} atacou ${targetTile.unit.name}!`);
            } else {
                console.log('Não é possível atacar esta unidade');
            }
            return;
        }
        
        // Tenta mover a unidade
        if (this.game.moveUnit(unit, targetX, targetY)) {
            console.log(`Unidade movida para (${targetX}, ${targetY})`);
            
            // Atualiza a seleção
            this.game.selectTile(targetX, targetY);
        } else {
            console.log('Movimento inválido');
        }
    }
    
    // Desativa os event listeners
    destroy() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('wheel', this.handleMouseWheel);
        window.removeEventListener('keydown', this.handleKeyDown);
    }
}
