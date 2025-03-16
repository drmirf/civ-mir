// Inicializa o jogo quando a janela carrega
window.addEventListener('load', () => {
    // Configurações iniciais
    const gameConfig = {
        mapSize: {
            width: 50,
            height: 40
        },
        tileSize: 32,
        startingCivilizations: 1,
        seed: Math.floor(Math.random() * 1000000)
    };

    // Inicializa o motor do jogo
    const game = new Game(gameConfig);

    // Captura de eventos do menu principal
    document.getElementById('new-game-btn').addEventListener('click', () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('loading-screen').classList.remove('hidden');
        
        // Simula um tempo de carregamento para geração do mapa
        let progress = 0;
        const progressBar = document.querySelector('.progress');
        
        const loadingInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                document.getElementById('loading-screen').classList.add('hidden');
                game.start();
            }
        }, 100);
    });

    document.getElementById('options-btn').addEventListener('click', () => {
        alert('Opções não implementadas ainda.');
    });

    document.getElementById('about-btn').addEventListener('click', () => {
        alert('CivJS - Um jogo inspirado em Civilization III criado com JavaScript puro.');
    });

    // Captura eventos do jogo
    document.getElementById('end-turn-btn').addEventListener('click', () => {
        game.turnManager.endTurn();
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
        // Implementar menu do jogo
        if (confirm('Retornar ao menu principal? Progresso será perdido!')) {
            window.location.reload();
        }
    });

    // Configuração de redimensionamento da janela
    window.addEventListener('resize', () => {
        game.renderer.resize();
    });
});
