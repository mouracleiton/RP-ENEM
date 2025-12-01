/**
 * ITA RP Game - Complete System Integration
 *
 * Arquivo principal que integra todos os sistemas do jogo
 * e inicializa a aplicação completa
 */

class ITAGameIntegration {
    constructor(config = {}) {
        this.config = {
            theme: {
                enable: true,
                debugMode: false,
                ...config.theme
            },
            api: {
                enable: true,
                baseURL: 'https://api.ita-rp-game.com',
                ...config.api
            },
            localization: {
                enable: true,
                defaultLanguage: 'pt-BR',
                ...config.localization
            },
            saveSystem: {
                enable: true,
                autoSave: true,
                cloudStorage: true,
                ...config.saveSystem
            },
            adminPanel: {
                enable: true,
                debugMode: false,
                ...config.adminPanel
            },
            pluginSystem: {
                enable: true,
                debugMode: false,
                ...config.pluginSystem
            },
            analytics: {
                enable: true,
                debugMode: false,
                ...config.analytics
            },
            testSuite: {
                enable: false, // Desabilitado em produção
                debugMode: false,
                ...config.testSuite
            }
        };

        this.systems = {
            theme: null,
            api: null,
            localization: null,
            saveSystem: null,
            adminPanel: null,
            pluginSystem: null,
            analytics: null,
            testSuite: null
        };

        this.initialized = false;
        this.initializationOrder = [
            'pluginSystem',
            'localization',
            'api',
            'theme',
            'saveSystem',
            'adminPanel',
            'analytics',
            'testSuite'
        ];

        this.eventBus = new EventTarget();
        this.gameState = {
            initialized: false,
            currentScreen: 'loading',
            user: null,
            session: {
                startTime: Date.now(),
                id: this.generateUUID()
            }
        };

        this.performance = {
            initTime: null,
            systemsInitTime: {},
            totalInitTime: null
        };
    }

    // Inicialização completa do jogo
    async init() {
        if (this.initialized) {
            console.warn('ITA Game Integration already initialized');
            return;
        }

        this.performance.initTime = Date.now();
        console.log('🚀 Starting ITA RP Game initialization...');

        try {
            // Inicializar na ordem correta
            for (const systemName of this.initializationOrder) {
                if (this.config[systemName].enable) {
                    await this.initializeSystem(systemName);
                }
            }

            // Configurar integrações entre sistemas
            this.setupSystemIntegrations();

            // Carregar estado salvo se disponível
            await this.loadGameState();

            // Configurar listeners globais
            this.setupGlobalListeners();

            // Marcar como inicializado
            this.initialized = true;
            this.gameState.initialized = true;
            this.performance.totalInitTime = Date.now() - this.performance.initTime;

            // Exibir tela principal
            this.showMainScreen();

            // Disparar evento de inicialização completa
            this.dispatchEvent('game:initialized', {
                performance: this.performance,
                systems: Object.keys(this.systems).filter(key => this.systems[key] !== null)
            });

            console.log(`✅ ITA RP Game initialized successfully in ${this.performance.totalInitTime}ms`);

        } catch (error) {
            console.error('❌ Failed to initialize ITA RP Game:', error);
            this.handleInitializationError(error);
        }
    }

    // Inicializar sistema específico
    async initializeSystem(systemName) {
        const startTime = Date.now();
        console.log(`Initializing ${systemName}...`);

        try {
            switch (systemName) {
                case 'pluginSystem':
                    if (window.ITAPluginSystem) {
                        this.systems.pluginSystem = new window.ITAPluginSystem(this.config.pluginSystem);
                    }
                    break;

                case 'localization':
                    if (window.ITALocalization) {
                        this.systems.localization = new window.ITALocalization(this.config.localization);
                    }
                    break;

                case 'api':
                    if (window.ITAGameAPI) {
                        this.systems.api = new window.ITAGameAPI(this.config.api);
                    }
                    break;

                case 'theme':
                    if (window.ITAGameTheme) {
                        this.systems.theme = new window.ITAGameTheme(this.config.theme);
                    }
                    break;

                case 'saveSystem':
                    if (window.ITASaveSystem) {
                        this.systems.saveSystem = new window.ITASaveSystem(this.config.saveSystem);
                    }
                    break;

                case 'adminPanel':
                    if (window.ITAAdminPanel) {
                        this.systems.adminPanel = new window.ITAAdminPanel(this.config.adminPanel);
                    }
                    break;

                case 'analytics':
                    if (window.ITAAnalyticsSystem) {
                        this.systems.analytics = new window.ITAAnalyticsSystem(this.config.analytics);
                    }
                    break;

                case 'testSuite':
                    if (window.ITATestSuite && this.config.testSuite.enable) {
                        this.systems.testSuite = new window.ITATestSuite(this.config.testSuite);
                    }
                    break;

                default:
                    console.warn(`Unknown system: ${systemName}`);
            }

            this.performance.systemsInitTime[systemName] = Date.now() - startTime;
            console.log(`✅ ${systemName} initialized in ${this.performance.systemsInitTime[systemName]}ms`);

        } catch (error) {
            this.performance.systemsInitTime[systemName] = Date.now() - startTime;
            console.error(`❌ Failed to initialize ${systemName}:`, error);
            throw error;
        }
    }

    // Configurar integrações entre sistemas
    setupSystemIntegrations() {
        console.log('Setting up system integrations...');

        // Integrar Plugin System com outros sistemas
        if (this.systems.pluginSystem) {
            this.integratePluginSystem();
        }

        // Integrar Analytics com eventos
        if (this.systems.analytics) {
            this.integrateAnalytics();
        }

        // Integrar Localization com UI
        if (this.systems.localization && this.systems.theme) {
            this.integrateLocalization();
        }

        // Integrar Save System com estado do jogo
        if (this.systems.saveSystem) {
            this.integrateSaveSystem();
        }

        console.log('✅ System integrations configured');
    }

    // Integrar Plugin System
    integratePluginSystem() {
        const pluginSystem = this.systems.pluginSystem;

        // Registrar hooks principais
        pluginSystem.registerHook('game:start', 'Called when the game starts');
        pluginSystem.registerHook('game:pause', 'Called when the game is paused');
        pluginSystem.registerHook('game:resume', 'Called when the game is resumed');
        pluginSystem.registerHook('player:login', 'Called when a player logs in');
        pluginSystem.registerHook('player:logout', 'Called when a player logs out');
        pluginSystem.registerHook('save:created', 'Called when a save is created');
        pluginSystem.registerHook('save:loaded', 'Called when a save is loaded');

        // Plugin de integração com o tema
        pluginSystem.registerPlugin('theme-integration', {
            name: 'Theme Integration',
            version: '1.0.0',
            description: 'Integrates plugin system with game theme',
            hooks: {
                'game:start': () => {
                    if (this.systems.theme) {
                        this.systems.theme.updateHUD(this.gameState.player || {});
                    }
                }
            }
        });

        // Plugin de integração com analytics
        pluginSystem.registerPlugin('analytics-integration', {
            name: 'Analytics Integration',
            version: '1.0.0',
            description: 'Integrates plugin system with analytics',
            hooks: {
                'player:login': (data) => {
                    if (this.systems.analytics) {
                        this.systems.analytics.trackEvent('player', 'login', data);
                    }
                },
                'game:error': (data) => {
                    if (this.systems.analytics) {
                        this.systems.analytics.trackError('game', data);
                    }
                }
            }
        });
    }

    // Integrar Analytics
    integrateAnalytics() {
        const analytics = this.systems.analytics;

        // Rastrear eventos do game integration
        this.addEventListener('game:initialized', (event) => {
            analytics.trackEvent('game', 'initialized', event.detail);
        });

        this.addEventListener('screen:changed', (event) => {
            analytics.trackEvent('ui', 'screen_changed', { screen: event.detail.screen });
        });

        this.addEventListener('user:login', (event) => {
            analytics.trackEvent('player', 'login', event.detail);
        });

        // Rastrear performance
        analytics.trackPerformanceMetric('initialization_time', this.performance.totalInitTime, {
            systems: Object.keys(this.performance.systemsInitTime)
        });
    }

    // Integrar Localization
    integrateLocalization() {
        const localization = this.systems.localization;
        const theme = this.systems.theme;

        // Atualizar textos da UI quando idioma mudar
        this.addEventListener('localization:language_changed', (event) => {
            if (theme && theme.updateUITexts) {
                theme.updateUITexts(event.detail.language);
            }
        });
    }

    // Integrar Save System
    integrateSaveSystem() {
        const saveSystem = this.systems.saveSystem;

        // Auto-salvar quando estado mudar
        this.addEventListener('game:state_changed', async (event) => {
            if (this.config.saveSystem.autoSave) {
                try {
                    await saveSystem.save('auto');
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }
        });

        // Carregar saves disponíveis
        this.loadAvailableSaves();
    }

    // Carregar estado do jogo
    async loadGameState() {
        if (!this.systems.saveSystem) return;

        try {
            // Tentar carregar auto-save
            const autoSave = await this.systems.saveSystem.getSaveInfo('auto');
            if (autoSave) {
                const saveData = await this.systems.saveSystem.load('auto');
                if (saveData && saveData.gameState) {
                    this.gameState = { ...this.gameState, ...saveData.gameState };
                    console.log('Game state loaded from auto-save');
                }
            }
        } catch (error) {
            console.log('No previous save found, starting fresh');
        }
    }

    // Configurar listeners globais
    setupGlobalListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });

        // Online/Offline
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + S: Save game
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            if (this.systems.saveSystem) {
                this.systems.saveSystem.save('manual');
            }
        }

        // F11: Toggle fullscreen
        if (event.key === 'F11') {
            event.preventDefault();
            this.toggleFullscreen();
        }

        // Ctrl/Cmd + Shift + D: Toggle debug mode
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            this.toggleDebugMode();
        }

        // Esc: Close modals
        if (event.key === 'Escape') {
            if (this.systems.theme) {
                this.systems.theme.closeAllModals();
            }
        }
    }

    // Handle visibility change
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    }

    // Handle before unload
    handleBeforeUnload() {
        if (this.systems.saveSystem && this.config.saveSystem.autoSave) {
            // Tentar salvar rápido antes de sair
            this.systems.saveSystem.save('emergency');
        }
    }

    // Handle connection change
    handleConnectionChange(isOnline) {
        console.log(`Connection status: ${isOnline ? 'online' : 'offline'}`);

        if (this.systems.api) {
            this.systems.api.setOnlineStatus(isOnline);
        }

        if (this.systems.analytics) {
            this.systems.analytics.trackEvent('system', 'connection_change', { online: isOnline });
        }

        this.dispatchEvent('connection:changed', { online: isOnline });
    }

    // Mostrar tela principal
    showMainScreen() {
        this.gameState.currentScreen = 'main';
        this.dispatchEvent('screen:changed', { screen: 'main' });

        if (this.systems.theme) {
            this.systems.theme.showScreen('main');
        }
    }

    // Pausar jogo
    pauseGame() {
        this.gameState.paused = true;
        this.gameState.pausedAt = Date.now();

        this.dispatchEvent('game:paused', { timestamp: this.gameState.pausedAt });

        if (this.systems.analytics) {
            this.systems.analytics.pauseSession();
        }
    }

    // Resumir jogo
    resumeGame() {
        if (this.gameState.paused) {
            this.gameState.paused = false;
            const pausedDuration = Date.now() - this.gameState.pausedAt;

            this.dispatchEvent('game:resumed', {
                pausedDuration,
                timestamp: Date.now()
            });

            if (this.systems.analytics) {
                this.systems.analytics.resumeSession();
            }
        }
    }

    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Toggle debug mode
    toggleDebugMode() {
        const debugMode = !this.config.theme.debugMode;

        // Atualizar debug mode em todos os sistemas
        Object.keys(this.systems).forEach(systemName => {
            if (this.systems[systemName] && this.systems[systemName].config) {
                this.systems[systemName].config.debugMode = debugMode;
            }
        });

        this.dispatchEvent('debug:mode_changed', { enabled: debugMode });
        console.log(`Debug mode ${debugMode ? 'enabled' : 'disabled'}`);
    }

    // Login de usuário
    async login(credentials) {
        try {
            if (this.systems.api) {
                const authResult = await this.systems.api.authenticate(
                    credentials.username,
                    credentials.password
                );

                this.gameState.user = authResult.user;

                this.dispatchEvent('user:login', {
                    user: authResult.user,
                    timestamp: Date.now()
                });

                // Auto-salvar após login
                if (this.systems.saveSystem) {
                    await this.systems.saveSystem.save('auto');
                }

                return authResult;
            }
        } catch (error) {
            this.dispatchEvent('user:login_failed', { error: error.message });
            throw error;
        }
    }

    // Logout de usuário
    logout() {
        const user = this.gameState.user;
        this.gameState.user = null;

        // Limpar dados sensíveis
        if (this.systems.api) {
            this.systems.api.clearAuth();
        }

        this.dispatchEvent('user:logout', {
            previousUser: user,
            timestamp: Date.now()
        });

        // Voltar para tela de login
        this.gameState.currentScreen = 'login';
        this.showMainScreen();
    }

    // Carregar saves disponíveis
    async loadAvailableSaves() {
        if (!this.systems.saveSystem) return;

        try {
            const saves = await this.systems.saveSystem.listSaves();
            this.gameState.availableSaves = saves;
            return saves;
        } catch (error) {
            console.error('Failed to load available saves:', error);
            return [];
        }
    }

    // Obter informações do sistema
    getSystemInfo() {
        return {
            initialized: this.initialized,
            gameState: this.gameState,
            systems: Object.keys(this.systems).reduce((info, name) => {
                info[name] = {
                    initialized: this.systems[name] !== null,
                    version: this.systems[name]?.version || 'unknown'
                };
                return info;
            }, {}),
            performance: this.performance,
            config: this.config
        };
    }

    // Obter status de saúde dos sistemas
    getSystemHealth() {
        const health = {
            overall: 'healthy',
            systems: {},
            timestamp: Date.now()
        };

        Object.keys(this.systems).forEach(systemName => {
            const system = this.systems[systemName];
            if (system) {
                health.systems[systemName] = {
                    status: 'healthy',
                    initialized: true,
                    lastActivity: Date.now()
                };
            } else {
                health.systems[systemName] = {
                    status: this.config[systemName].enable ? 'error' : 'disabled',
                    initialized: false
                };
                health.overall = 'degraded';
            }
        });

        return health;
    }

    // Reiniciar sistema
    async restart() {
        console.log('Restarting ITA RP Game...');

        // Destruir sistemas
        this.destroy();

        // Esperar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Re-inicializar
        await this.init();
    }

    // Destruir sistema
    destroy() {
        console.log('Shutting down ITA RP Game...');

        // Destruir sistemas em ordem reversa
        const reversedOrder = [...this.initializationOrder].reverse();
        for (const systemName of reversedOrder) {
            if (this.systems[systemName]) {
                try {
                    if (typeof this.systems[systemName].destroy === 'function') {
                        this.systems[systemName].destroy();
                    }
                } catch (error) {
                    console.error(`Error destroying ${systemName}:`, error);
                }
                this.systems[systemName] = null;
            }
        }

        // Limpar listeners
        this.eventBus = null;

        // Resetar estado
        this.initialized = false;
        this.gameState.initialized = false;

        console.log('✅ ITA RP Game shutdown complete');
    }

    // Event system
    addEventListener(event, callback) {
        this.eventBus.addEventListener(event, callback);
    }

    removeEventListener(event, callback) {
        this.eventBus.removeEventListener(event, callback);
    }

    dispatchEvent(event, detail = {}) {
        this.eventBus.dispatchEvent(new CustomEvent(event, { detail }));
    }

    // Utilitários
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Instância global do jogo
window.itaGame = new ITAGameIntegration({
    theme: {
        enable: true,
        debugMode: false
    },
    api: {
        enable: true,
        baseURL: 'https://api.ita-rp-game.com'
    },
    localization: {
        enable: true,
        defaultLanguage: 'pt-BR'
    },
    saveSystem: {
        enable: true,
        autoSave: true,
        cloudStorage: true
    },
    adminPanel: {
        enable: true,
        debugMode: false
    },
    pluginSystem: {
        enable: true,
        debugMode: false
    },
    analytics: {
        enable: true,
        debugMode: false
    },
    testSuite: {
        enable: false, // Habilitar apenas para desenvolvimento
        debugMode: false
    }
});

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.itaGame.init();
    });
} else {
    window.itaGame.init();
}

// Disponibilizar globalmente para debug
window.ITA = window.itaGame;

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITAGameIntegration;
}

/**
 * Como usar:
 *
 * // O jogo é inicializado automaticamente
 * // Acesso aos sistemas:
 *
 * // Sistema de tema
 * window.itaGame.systems.theme.showNotification('Mensagem', 'success');
 *
 * // Sistema de API
 * await window.itaGame.systems.api.authenticate('user', 'pass');
 *
 * // Sistema de localização
 * window.itaGame.systems.localization.setLanguage('en-US');
 *
 * // Sistema de saves
 * await window.itaGame.systems.saveSystem.save('manual');
 *
 * // Painel de admin
 * window.itaGame.systems.adminPanel.openPanel();
 *
 * // Analytics
 * window.itaGame.systems.analytics.trackEvent('game', 'action', { data: 'value' });
 *
 * // Plugin System
 * await window.itaGame.systems.pluginSystem.triggerHook('game:start', {});
 *
 * // Status do jogo
 * console.log(window.itaGame.getSystemInfo());
 * console.log(window.itaGame.getSystemHealth());
 *
 * // Eventos personalizados
 * window.itaGame.addEventListener('meu:evento', (e) => {
 *     console.log('Evento recebido:', e.detail);
 * });
 *
 * // Login/logout
 * await window.itaGame.login({ username: 'player', password: 'pass' });
 * window.itaGame.logout();
 */