// ITA RP Game Theme - Interactive Elements and Animations

class ITAGameTheme {
    constructor() {
        this.gameState = {
            player: {
                name: 'Jogador',
                level: 1,
                class: 'Engenheiro',
                health: 100,
                maxHealth: 100,
                energy: 100,
                maxEnergy: 100,
                exp: 0,
                maxExp: 100
            },
            inventory: [],
            quests: [],
            notifications: []
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeUI();
        this.startAnimations();
        this.loadGameState();
    }

    setupEventListeners() {
        // Menu Navigation
        document.querySelectorAll('#nice-menu-1 li a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const menuId = e.target.id;
                this.handleMenuClick(menuId);
            });
        });

        // Game Menu Buttons
        document.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonId = e.target.id;
                this.handleMenuButtonClick(buttonId);
            });
        });

        // Dialog System
        document.querySelector('.dialog-close')?.addEventListener('click', () => {
            this.closeDialog();
        });

        document.querySelectorAll('.dialog-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectDialogOption(e.target.textContent);
            });
        });

        // Inventory Slots
        document.querySelectorAll('.inv-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.useInventoryItem(index);
            });

            slot.addEventListener('mouseenter', () => {
                this.showItemTooltip(slot, index);
            });

            slot.addEventListener('mouseleave', () => {
                this.hideItemTooltip();
            });
        });

        // Quest Items
        document.querySelectorAll('.quest-item').forEach((quest, index) => {
            quest.addEventListener('click', () => {
                this.viewQuestDetails(index);
            });
        });

        // Chat System
        const chatInput = document.querySelector('.chat-input input');
        const chatButton = document.querySelector('.chat-input button');

        chatButton?.addEventListener('click', () => {
            this.sendMessage();
        });

        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Search
        const searchInput = document.querySelector('#search-block-form input.form-text');
        const searchButton = document.querySelector('#search-block-form input.form-submit');

        searchButton?.addEventListener('click', () => {
            this.performSearch(searchInput.value);
        });

        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });

        // Keyboard Controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Window Resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Game Canvas Events
        const gameCanvas = document.getElementById('game-canvas');
        if (gameCanvas) {
            gameCanvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });

            gameCanvas.addEventListener('click', (e) => {
                this.handleCanvasClick(e);
            });
        }
    }

    initializeUI() {
        this.updateHUD();
        this.setupMinimap();
        this.initializeNotifications();
        this.updateInventoryDisplay();
        this.updateQuestsDisplay();
        this.addParticleEffects();
    }

    // Menu Handling
    handleMenuClick(menuId) {
        console.log(`Menu clicked: ${menuId}`);
        this.showNotification(`Navegando para ${this.getMenuName(menuId)}`, 'info');

        // Simulate navigation
        this.animatePageTransition();
    }

    getMenuName(menuId) {
        const names = {
            'menu-game': 'Jogo',
            'menu-personagens': 'Personagens',
            'menu-inventario': 'Inventário',
            'menu-missoes': 'Missões',
            'menu-opcoes': 'Opções'
        };
        return names[menuId] || menuId;
    }

    handleMenuButtonClick(buttonId) {
        console.log(`Button clicked: ${buttonId}`);

        switch (buttonId) {
            case 'btn-new-game':
                this.startNewGame();
                break;
            case 'btn-continue':
                this.continueGame();
                break;
            case 'btn-load-game':
                this.showLoadGameDialog();
                break;
            case 'btn-settings':
                this.showSettingsDialog();
                break;
            case 'btn-about':
                this.showAboutDialog();
                break;
            case 'btn-exit':
                this.exitGame();
                break;
        }
    }

    startNewGame() {
        this.showNotification('Iniciando novo jogo...', 'success');
        setTimeout(() => {
            this.hideMainMenu();
            this.startGameLoading();
        }, 1000);
    }

    continueGame() {
        this.showNotification('Continuando jogo salvo...', 'success');
        setTimeout(() => {
            this.hideMainMenu();
            this.resumeGame();
        }, 1000);
    }

    // HUD Management
    updateHUD() {
        this.updateHealthBar();
        this.updateEnergyBar();
        this.updateExpBar();
        this.updateCharacterInfo();
    }

    updateHealthBar() {
        const healthPercent = (this.gameState.player.health / this.gameState.player.maxHealth) * 100;
        const healthFill = document.querySelector('.vida-fill');
        const healthValue = document.querySelector('.vida-bar .bar-value');

        if (healthFill) {
            healthFill.style.width = `${healthPercent}%`;
        }

        if (healthValue) {
            healthValue.textContent = `${this.gameState.player.health}/${this.gameState.player.maxHealth}`;
        }

        // Change color based on health percentage
        if (healthPercent < 25) {
            healthFill?.style.setProperty('background', 'linear-gradient(90deg, #d32f2f, #f44336)');
        }
    }

    updateEnergyBar() {
        const energyPercent = (this.gameState.player.energy / this.gameState.player.maxEnergy) * 100;
        const energyFill = document.querySelector('.energia-fill');
        const energyValue = document.querySelector('.energia-bar .bar-value');

        if (energyFill) {
            energyFill.style.width = `${energyPercent}%`;
        }

        if (energyValue) {
            energyValue.textContent = `${this.gameState.player.energy}/${this.gameState.player.maxEnergy}`;
        }
    }

    updateExpBar() {
        const expPercent = (this.gameState.player.exp / this.gameState.player.maxExp) * 100;
        const expFill = document.querySelector('.exp-fill');
        const expValue = document.querySelector('.exp-bar .bar-value');

        if (expFill) {
            expFill.style.width = `${expPercent}%`;
        }

        if (expValue) {
            expValue.textContent = `${this.gameState.player.exp}/${this.gameState.player.maxExp}`;
        }
    }

    updateCharacterInfo() {
        const charName = document.querySelector('.char-name');
        const charLevel = document.querySelector('#char-level');
        const charClass = document.querySelector('.char-class');

        if (charName) charName.textContent = this.gameState.player.name;
        if (charLevel) charLevel.textContent = this.gameState.player.level;
        if (charClass) charClass.textContent = this.gameState.player.class;
    }

    // Dialog System
    showDialog(title, text, options = []) {
        const dialogBox = document.getElementById('dialog-box');
        const dialogTitle = document.querySelector('.dialog-title');
        const dialogText = document.querySelector('.dialog-text');
        const dialogOptions = document.querySelector('.dialog-options');

        if (!dialogBox) return;

        dialogBox.classList.remove('hidden');
        dialogTitle.textContent = title;
        dialogText.textContent = text;

        dialogOptions.innerHTML = '';
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'dialog-option';
            button.textContent = option;
            button.onclick = () => this.selectDialogOption(option);
            dialogOptions.appendChild(button);
        });

        this.animateDialog();
    }

    closeDialog() {
        const dialogBox = document.getElementById('dialog-box');
        if (dialogBox) {
            dialogBox.classList.add('hidden');
        }
    }

    selectDialogOption(option) {
        console.log(`Selected option: ${option}`);
        this.showNotification(`Opção selecionada: ${option}`, 'info');
        this.closeDialog();
    }

    animateDialog() {
        const dialogBox = document.getElementById('dialog-box');
        if (dialogBox) {
            dialogBox.style.animation = 'slideInFromTop 0.3s ease';
        }
    }

    // Notification System
    showNotification(text, type = 'info', duration = 4000) {
        const notificationSystem = document.getElementById('notification-system');
        if (!notificationSystem) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;

        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-text">${text}</div>
        `;

        notificationSystem.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    initializeNotifications() {
        this.showNotification('Bem-vindo ao ITA RP Game!', 'success');
        this.showNotification('Use WASD para se mover', 'info');
    }

    // Inventory System
    useInventoryItem(index) {
        console.log(`Using inventory item at index ${index}`);
        this.showNotification(`Item do inventário utilizado`, 'success');
    }

    showItemTooltip(slot, index) {
        // Create and show tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'item-tooltip';
        tooltip.textContent = `Item ${index + 1}`;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
        `;

        document.body.appendChild(tooltip);

        const rect = slot.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    }

    hideItemTooltip() {
        const tooltip = document.querySelector('.item-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    updateInventoryDisplay() {
        // Update inventory based on game state
        const slots = document.querySelectorAll('.inv-slot');
        // Implementation would update slots based on actual inventory data
    }

    // Quest System
    viewQuestDetails(index) {
        console.log(`Viewing quest details for quest ${index}`);
        this.showNotification('Detalhes da missão abertos', 'info');
    }

    updateQuestsDisplay() {
        // Update quest display based on game state
        // Implementation would update quests based on actual quest data
    }

    // Chat System
    sendMessage() {
        const input = document.querySelector('.chat-input input');
        const message = input?.value.trim();

        if (!message) return;

        this.addChatMessage('Você', message, 'player');
        input.value = '';

        // Simulate response
        setTimeout(() => {
            this.addChatMessage('Sistema', 'Mensagem recebida!', 'system');
        }, 1000);
    }

    addChatMessage(sender, text, type = 'user') {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message fade-in';

        const senderElement = document.createElement('span');
        senderElement.className = 'chat-sender';
        senderElement.textContent = `${sender}:`;

        const textElement = document.createElement('span');
        textElement.className = 'chat-text';
        textElement.textContent = text;

        messageElement.appendChild(senderElement);
        messageElement.appendChild(textElement);

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Minimap
    setupMinimap() {
        const minimapCanvas = document.getElementById('minimap-canvas');
        if (!minimapCanvas) return;

        const ctx = minimapCanvas.getContext('2d');
        minimapCanvas.width = 150;
        minimapCanvas.height = 128; // 150 - 22px for title

        this.drawMinimap(ctx);
    }

    drawMinimap(ctx) {
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw grid
        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 1;

        for (let i = 0; i <= ctx.canvas.width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, ctx.canvas.height);
            ctx.stroke();
        }

        for (let i = 0; i <= ctx.canvas.height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(ctx.canvas.width, i);
            ctx.stroke();
        }

        // Draw player position
        ctx.fillStyle = '#932D2D';
        ctx.beginPath();
        ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw some sample points of interest
        const points = [
            { x: 20, y: 20, color: '#4CAF50' },
            { x: 130, y: 40, color: '#2196F3' },
            { x: 80, y: 100, color: '#FFC107' }
        ];

        points.forEach(point => {
            ctx.fillStyle = point.color;
            ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
        });
    }

    // Animations
    startAnimations() {
        this.animateLoadingScreen();
        this.startHUDBlinking();
        this.addFloatingAnimations();
    }

    animateLoadingScreen() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        this.hideLoadingScreen();
                    }, 1000);
                }
                progressFill.style.width = `${progress}%`;
            }, 500);
        }
    }

    startHUDBlinking() {
        // Add subtle blinking to low health/energy
        setInterval(() => {
            const healthPercent = (this.gameState.player.health / this.gameState.player.maxHealth) * 100;
            if (healthPercent < 25) {
                const healthBar = document.querySelector('.vida-bar');
                if (healthBar) {
                    healthBar.classList.toggle('pulse');
                }
            }
        }, 2000);
    }

    addFloatingAnimations() {
        // Add floating animation to certain elements
        const floatingElements = document.querySelectorAll('.notification, .quest-item');
        floatingElements.forEach((element, index) => {
            element.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
        });
    }

    animatePageTransition() {
        const mainContent = document.querySelector('#conteudo_bg');
        if (mainContent) {
            mainContent.style.opacity = '0';
            mainContent.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                mainContent.style.transition = 'all 0.5s ease';
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'translateX(0)';
            }, 100);
        }
    }

    // Particle Effects
    addParticleEffects() {
        this.createFloatingParticles();
    }

    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        document.body.appendChild(particleContainer);

        // Create particles
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: rgba(147, 45, 45, 0.6);
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: floatParticle ${10 + Math.random() * 10}s linear infinite;
                `;
                particleContainer.appendChild(particle);
            }, i * 100);
        }
    }

    // Keyboard Controls
    handleKeyPress(e) {
        switch (e.key.toLowerCase()) {
            case 'i':
                this.toggleInventory();
                break;
            case 'escape':
                this.toggleGameMenu();
                break;
            case 'm':
                this.toggleMinimap();
                break;
            case 'h':
                this.showHelpDialog();
                break;
        }
    }

    toggleInventory() {
        const inventorySection = document.querySelector('#menu-inventario');
        this.showNotification('Inventário alternado', 'info');
    }

    toggleGameMenu() {
        const gameMenu = document.querySelector('.game-menu');
        if (gameMenu) {
            gameMenu.style.display = gameMenu.style.display === 'none' ? 'flex' : 'none';
        }
    }

    toggleMinimap() {
        const minimap = document.querySelector('.minimap');
        if (minimap) {
            minimap.style.display = minimap.style.display === 'none' ? 'block' : 'none';
        }
    }

    showHelpDialog() {
        this.showDialog(
            'Ajuda - Controles',
            'W/A/S/D - Mover\nE - Interagir\nI - Inventário\nM - Minimapa\nESC - Menu\nH - Ajuda',
            ['Entendido']
        );
    }

    // Canvas Handling
    handleCanvasClick(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        console.log(`Canvas clicked at: ${x}, ${y}`);
        this.showNotification(`Posição clicada: (${Math.round(x)}, ${Math.round(y)})`, 'info');
    }

    // Search
    performSearch(query) {
        if (!query.trim()) return;

        this.showNotification(`Buscando por: ${query}`, 'info');
        // Simulate search
        setTimeout(() => {
            this.showNotification(`Resultados encontrados para "${query}"`, 'success');
        }, 1000);
    }

    // Game State Management
    loadGameState() {
        // Load saved game state from localStorage
        const savedState = localStorage.getItem('ita-game-state');
        if (savedState) {
            try {
                this.gameState = { ...this.gameState, ...JSON.parse(savedState) };
                this.updateHUD();
                this.showNotification('Jogo carregado com sucesso!', 'success');
            } catch (error) {
                console.error('Error loading game state:', error);
            }
        }
    }

    saveGameState() {
        localStorage.setItem('ita-game-state', JSON.stringify(this.gameState));
        this.showNotification('Jogo salvo!', 'success');
    }

    // Screen Management
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameMenu = document.querySelector('.game-menu');

        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                if (gameMenu) {
                    gameMenu.style.display = 'flex';
                }
            }, 500);
        }
    }

    hideMainMenu() {
        const gameMenu = document.querySelector('.game-menu');
        if (gameMenu) {
            gameMenu.style.display = 'none';
        }
    }

    startGameLoading() {
        this.showLoadingScreen('Carregando mundo do jogo...');
        setTimeout(() => {
            this.hideLoadingScreen();
            this.startGameplay();
        }, 3000);
    }

    showLoadingScreen(text = 'Carregando...') {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = document.querySelector('.loading-text');

        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            if (loadingText) {
                loadingText.textContent = text;
            }
        }
    }

    startGameplay() {
        this.showNotification('Bem-vindo ao ITA RP Game!', 'success');
        this.showNotification('Use H para ver os controles', 'info');
        this.startGameLoop();
    }

    resumeGame() {
        this.showNotification('Jogo retomado!', 'success');
        this.startGameLoop();
    }

    startGameLoop() {
        // Main game loop would go here
        this.gameLoop();
    }

    gameLoop() {
        // Update game state
        this.updateGameTime();
        this.updateNPCs();
        this.checkQuestProgress();

        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    updateGameTime() {
        // Update in-game time
    }

    updateNPCs() {
        // Update NPC positions and states
    }

    checkQuestProgress() {
        // Check and update quest progress
    }

    // Utility Functions
    handleResize() {
        this.setupMinimap();
    }

    exitGame() {
        if (confirm('Tem certeza que deseja sair do jogo?')) {
            this.saveGameState();
            this.showNotification('Saindo do jogo...', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    showLoadGameDialog() {
        this.showDialog('Carregar Jogo', 'Selecione um arquivo para carregar:', ['Slot 1', 'Slot 2', 'Slot 3', 'Cancelar']);
    }

    showSettingsDialog() {
        this.showDialog('Configurações', 'Ajuste as configurações do jogo:', ['Gráficos', 'Áudio', 'Controles', 'Voltar']);
    }

    showAboutDialog() {
        this.showDialog(
            'Sobre o ITA RP Game',
            'Versão 1.0.0\n\nDesenvolvido com ❤️ no Instituto Tecnológico de Aeronáutica\n\nUm jogo de RPG inspirado na vida acadêmica do ITA',
            ['Voltar']
        );
    }
}

// Add CSS for floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }

    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    @keyframes fadeOut {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }

    .item-tooltip {
        animation: fadeIn 0.2s ease;
    }
`;
document.head.appendChild(style);

// Initialize the game theme when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameTheme = new ITAGameTheme();
});

// Export for external use
window.ITAGameTheme = ITAGameTheme;