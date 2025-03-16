class Renderer {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        this.hexGrid = game.hexGrid;
        
        // Inicializa o canvas com o tamanho correto
        this.resize();
        
        // Carrega recursos para o jogo
        this.loadAssets();
    }
    
    // Redimensiona o canvas para preencher a janela
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    // Carrega recursos (imagens, sprites, etc.)
    loadAssets() {
        // Implementar carregamento de recursos quando necessário
        console.log('Carregando recursos do jogo...');
    }
    
    // Desenha todo o jogo
    render() {
        // Limpa o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenha o mapa
        this.renderMap();
        
        // Desenha as unidades
        this.renderUnits();
        
        // Desenha as cidades
        this.renderCities();
        
        // Desenha a UI do jogo
        this.renderUI();
    }
    
    // Desenha o mapa (grade hexagonal)
    renderMap() {
        const camera = this.game.camera;
        const hexGrid = this.hexGrid;
        
        // Calcula quais tiles estão visíveis na viewport
        const tilesInView = this.getTilesInView();
        
        // Desenha cada tile visível
        for (const tile of tilesInView) {
            const pixelCoords = hexGrid.hexToPixel(tile.x, tile.y);
            
            // Ajusta as coordenadas com base na posição da câmera
            const screenX = pixelCoords.x - camera.x;
            const screenY = pixelCoords.y - camera.y;
            
            // Obtém a cor do terreno
            const color = getTerrainColor(tile.terrainType);
            
            // Desenha o hexágono
            hexGrid.drawHex(this.ctx, screenX, screenY, color);
            
            // Desenha a borda para o tile selecionado
            if (this.game.selectedTile && this.game.selectedTile.x === tile.x && this.game.selectedTile.y === tile.y) {
                this.drawSelectedTileBorder(screenX, screenY);
            }
        }
    }
    
    // Obtém os tiles visíveis na viewport atual
    getTilesInView() {
        const camera = this.game.camera;
        const hexGrid = this.hexGrid;
        const visibleTiles = [];
        
        // Calcula o range de tiles que podem estar visíveis
        // Este é um cálculo aproximado e pode incluir alguns tiles fora da viewport
        const startX = Math.floor(camera.x / hexGrid.hexWidth);
        const startY = Math.floor(camera.y / hexGrid.verticalDistance);
        
        const tilesWide = Math.ceil(this.canvas.width / hexGrid.hexWidth) + 2;
        const tilesHigh = Math.ceil(this.canvas.height / hexGrid.verticalDistance) + 2;
        
        const endX = startX + tilesWide;
        const endY = startY + tilesHigh;
        
        // Coleta os tiles visíveis
        for (let y = Math.max(0, startY); y < Math.min(hexGrid.height, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(hexGrid.width, endX); x++) {
                const tile = hexGrid.getTile(x, y);
                if (tile) {
                    visibleTiles.push(tile);
                }
            }
        }
        
        return visibleTiles;
    }
    
    // Desenha a borda para o tile selecionado
    drawSelectedTileBorder(x, y) {
        const hexGrid = this.hexGrid;
        const ctx = this.ctx;
        
        ctx.beginPath();
        
        for (let i = 0; i < 6; i++) {
            const angle = 2 * Math.PI / 6 * i - Math.PI / 6;
            const hx = x + hexGrid.tileSize * Math.cos(angle);
            const hy = y + hexGrid.tileSize * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(hx, hy);
            } else {
                ctx.lineTo(hx, hy);
            }
        }
        
        ctx.closePath();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Desenha as unidades no mapa
    renderUnits() {
        const camera = this.game.camera;
        const hexGrid = this.hexGrid;
        const ctx = this.ctx;
        
        // Desenha cada unidade visível
        for (const civ of this.game.civilizations) {
            for (const unit of civ.units) {
                const pixelCoords = hexGrid.hexToPixel(unit.x, unit.y);
                
                // Ajusta as coordenadas com base na posição da câmera
                const screenX = pixelCoords.x - camera.x;
                const screenY = pixelCoords.y - camera.y;
                
                // Verifica se a unidade está na viewport
                if (screenX < -50 || screenX > this.canvas.width + 50 || 
                    screenY < -50 || screenY > this.canvas.height + 50) {
                    continue; // Pula unidades fora da viewport
                }
                
                // Desenha a unidade (círculo com a cor da civilização)
                ctx.beginPath();
                ctx.arc(screenX, screenY, hexGrid.tileSize * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = civ.color;
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Adiciona um símbolo para o tipo de unidade
                this.drawUnitSymbol(unit, screenX, screenY);
                
                // Adiciona uma borda para unidade selecionada
                if (this.game.selectedUnit === unit) {
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, hexGrid.tileSize * 0.5, 0, Math.PI * 2);
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Desenha um símbolo que representa o tipo de unidade
    drawUnitSymbol(unit, x, y) {
        const ctx = this.ctx;
        const size = this.hexGrid.tileSize * 0.2;
        
        ctx.fillStyle = '#FFFFFF';
        
        switch (unit.type) {
            case 'settler':
                // Desenha uma casa para colonizadores
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x - size, y);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'worker':
                // Desenha uma ferramenta para trabalhadores
                ctx.beginPath();
                ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'warrior':
            case 'swordsman':
                // Desenha uma espada para guerreiros
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                ctx.lineTo(x, y + size);
                ctx.moveTo(x - size / 2, y - size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
                
            case 'archer':
                // Desenha um arco para arqueiros
                ctx.beginPath();
                ctx.arc(x, y, size, Math.PI / 4, Math.PI * 7 / 4);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
                
            case 'horseman':
                // Desenha um cavalo para cavaleiros
                ctx.beginPath();
                ctx.ellipse(x, y, size * 1.2, size * 0.8, 0, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;
                
            case 'galley':
            case 'trireme':
                // Desenha um barco para unidades navais
                ctx.beginPath();
                ctx.moveTo(x - size, y);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x, y - size);
                ctx.closePath();
                ctx.fill();
                break;
                
            default:
                // Círculo padrão para outros tipos
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
    
    // Desenha as cidades no mapa
    renderCities() {
        const camera = this.game.camera;
        const hexGrid = this.hexGrid;
        const ctx = this.ctx;
        
        // Desenha cada cidade
        for (const civ of this.game.civilizations) {
            for (const city of civ.cities) {
                const pixelCoords = hexGrid.hexToPixel(city.x, city.y);
                
                // Ajusta as coordenadas com base na posição da câmera
                const screenX = pixelCoords.x - camera.x;
                const screenY = pixelCoords.y - camera.y;
                
                // Verifica se a cidade está na viewport
                if (screenX < -50 || screenX > this.canvas.width + 50 || 
                    screenY < -50 || screenY > this.canvas.height + 50) {
                    continue; // Pula cidades fora da viewport
                }
                
                // Desenha a cidade (estrela com a cor da civilização)
                this.drawCityStar(screenX, screenY, hexGrid.tileSize * 0.6, civ.color);
                
                // Desenha o nome da cidade
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(city.name, screenX, screenY + hexGrid.tileSize * 0.9);
                
                // Desenha a população
                ctx.fillStyle = '#FFFF00';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(city.population.toString(), screenX, screenY + 5);
            }
        }
    }
    
    // Desenha uma estrela para representar uma cidade
    drawCityStar(x, y, radius, color) {
        const ctx = this.ctx;
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(x, y - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            const x1 = x + Math.cos(rot) * outerRadius;
            const y1 = y + Math.sin(rot) * outerRadius;
            ctx.lineTo(x1, y1);
            rot += step;
            
            const x2 = x + Math.cos(rot) * innerRadius;
            const y2 = y + Math.sin(rot) * innerRadius;
            ctx.lineTo(x2, y2);
            rot += step;
        }
        
        ctx.lineTo(x, y - outerRadius);
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Desenha elementos da interface
    renderUI() {
        // A UI principal é gerenciada pelo HTML/CSS
        // Aqui podemos adicionar elementos dinâmicos específicos
    }
}