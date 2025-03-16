class HexGrid {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = [];
        
        // Constantes para cálculos hexagonais
        this.hexHeight = tileSize * 2;
        this.hexWidth = Math.sqrt(3) / 2 * this.hexHeight;
        this.verticalDistance = tileSize * 1.5;
        
        // Inicializa a grade vazia
        this.initializeGrid();
    }
    
    initializeGrid() {
        this.tiles = [];
        
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push({
                    x: x,
                    y: y,
                    terrainType: 'ocean', // Tipo padrão
                    resource: null,
                    improvement: null,
                    owner: null,
                    unit: null
                });
            }
            this.tiles.push(row);
        }
    }
    
    // Converte coordenadas da grade para coordenadas da tela
    hexToPixel(q, r) {
        // Deslocamento para linhas pares
        const offset = r % 2 === 0 ? 0 : this.hexWidth / 2;
        
        return {
            x: q * this.hexWidth + offset,
            y: r * this.verticalDistance
        };
    }
    
    // Converte coordenadas da tela para coordenadas da grade
    pixelToHex(x, y) {
        // Este é um algoritmo simplificado e pode precisar de ajustes
        let row = Math.floor(y / this.verticalDistance);
        const rowIsOdd = row % 2 !== 0;
        const offset = rowIsOdd ? this.hexWidth / 2 : 0;
        let col = Math.floor((x - offset) / this.hexWidth);
        
        // Certifique-se de que as coordenadas estão dentro dos limites
        col = Math.max(0, Math.min(col, this.width - 1));
        row = Math.max(0, Math.min(row, this.height - 1));
        
        return { q: col, r: row };
    }
    
    // Obtém um tile específico a partir das coordenadas
    getTile(q, r) {
        if (q >= 0 && q < this.width && r >= 0 && r < this.height) {
            return this.tiles[r][q];
        }
        return null;
    }
    
    // Define o tipo de terreno para um tile específico
    setTerrain(q, r, terrainType) {
        const tile = this.getTile(q, r);
        if (tile) {
            tile.terrainType = terrainType;
        }
    }
    
    // Obtém os vizinhos de um tile específico
    getNeighbors(q, r) {
        const neighbors = [];
        const odd = r % 2 !== 0;
        
        // Direções para vizinhos de um hexágono
        // Para linhas ímpares e pares, as direções são diferentes
        const directions = odd ? 
            [[-1, 0], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1]] : 
            [[-1, 0], [-1, -1], [0, -1], [1, 0], [0, 1], [-1, 1]];
        
        for (const [dx, dy] of directions) {
            const nx = q + dx;
            const ny = r + dy;
            const neighbor = this.getTile(nx, ny);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }
        
        return neighbors;
    }
    
    // Desenha um hexágono nas coordenadas especificadas
    drawHex(ctx, x, y, color = '#3333AA') {
        ctx.beginPath();
        
        for (let i = 0; i < 6; i++) {
            const angle = 2 * Math.PI / 6 * i - Math.PI / 6;
            const hx = x + this.tileSize * Math.cos(angle);
            const hy = y + this.tileSize * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(hx, hy);
            } else {
                ctx.lineTo(hx, hy);
            }
        }
        
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Borda do hexágono
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Calcula a distância entre dois tiles
    distance(tile1, tile2) {
        const dx = Math.abs(tile1.x - tile2.x);
        const dy = Math.abs(tile1.y - tile2.y);
        return (dx + dy + Math.abs(dx - dy)) / 2;
    }
}
