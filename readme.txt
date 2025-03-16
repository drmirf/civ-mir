# CivJS - Um jogo inspirado em Civilization III

CivJS é um jogo de estratégia por turnos baseado em hexágonos, inspirado na série Civilization, desenvolvido inteiramente com JavaScript vanilla e HTML/CSS.

## Demonstração

Este jogo foi projetado para funcionar no GitHub Pages. Após clonar o repositório, você pode acessar o jogo diretamente pelo seu navegador abrindo o arquivo `index.html`.

## Recursos Implementados

- Grade hexagonal para o mapa do jogo
- Geração procedural de mapas com diferentes tipos de terreno
- Sistema de turnos básico
- Gerenciamento de civilizações
- Unidades básicas com movimento
- Fundação de cidades
- Renderização com Canvas

## Controles

- **Clique com botão esquerdo**: Selecionar tile/unidade
- **Clique com botão direito + arrastar**: Mover a câmera
- **WASD ou setas**: Mover a câmera
- **N**: Finalizar turno
- **Espaço**: Pular turno da unidade selecionada

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/civjs.git
   ```

2. Navegue até a pasta do projeto:
   ```
   cd civjs
   ```

3. Abra o arquivo `index.html` em seu navegador favorito.

## Implantação no GitHub Pages

1. Crie um repositório no GitHub.
2. Suba os arquivos para o repositório:
   ```
   git init
   git add .
   git commit -m "Primeira versão do CivJS"
   git remote add origin https://github.com/seu-usuario/civjs.git
   git push -u origin main
   ```

3. Nas configurações do repositório no GitHub, navegue até a seção "GitHub Pages".
4. Selecione a branch `main` como fonte e clique em "Save".
5. Após alguns minutos, seu jogo estará disponível em `https://seu-usuario.github.io/civjs`.

## Estrutura do Projeto

```
/civilization-js/
├── index.html
├── styles/
│   └── main.css
├── js/
│   ├── main.js
│   ├── engine/
│   │   ├── game.js
│   │   └── turn-manager.js
│   ├── map/
│   │   ├── hex-grid.js
│   │   ├── map-generator.js
│   │   └── terrain-types.js
│   ├── entities/
│   │   ├── civilization.js
│   │   ├── city.js
│   │   └── unit.js
│   └── ui/
│       ├── renderer.js
│       ├── input-handler.js
│       └── hud.js
└── README.md
```

## Fases de Desenvolvimento

Este projeto está sendo desenvolvido em etapas:

1. ✅ Estrutura Básica e Renderização
   - Configuração do ambiente HTML/CSS/JS
   - Implementação da grade hexagonal
   - Sistema básico de câmera

2. ✅ Geração de Mapas
   - Algoritmo de geração procedural de mapas
   - Diferentes tipos de terreno

3. ✅ Sistema de Turnos e Entidades Básicas
   - Implementação do sistema de turnos
   - Criação de civilizações e unidades básicas

4. ✅ Movimento de Unidades
   - Sistema de movimento
   - Interface para controle de unidades

5. ✅ Cidades Básicas
   - Fundação de cidades
   - Interface para visualização de cidades

6. 🔄 Em Progresso: Recursos e Melhorias
   - Adição de recursos no mapa
   - Melhorias de terreno

7. 📝 Planejado: Tecnologias e Pesquisa
   - Árvore tecnológica
   - Sistema de pesquisa

8. 📝 Planejado: Combate e Diplomacia
   - Sistema de combate entre unidades
   - Sistema básico de diplomacia

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Agradecimentos

- Inspirado na série Civilization da Firaxis Games
- Desenvolvido como projeto educacional para prática de JavaScript
