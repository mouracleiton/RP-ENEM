// ITA RP Game Plugin System
// Extensible architecture for adding custom functionality

class ITAPluginSystem {
    constructor(config = {}) {
        this.config = {
            pluginsDir: config.pluginsDir || '/plugins',
            autoLoad: config.autoLoad !== false,
            enableHotReload: config.enableHotReload !== false,
            maxPlugins: config.maxPlugins || 50,
            allowedOrigins: config.allowedOrigins || ['localhost', 'ita-rp-game.com'],
            version: config.version || '1.0.0',
            apiVersion: config.apiVersion || '1.0',
            ...config
        };

        this.plugins = new Map();
        this.hooks = new Map();
        this.events = new Map();
        this.sandbox = new PluginSandbox();
        this.loader = new PluginLoader(this.config);
        this.registry = new PluginRegistry();

        this.loadedPlugins = new Set();
        this.activePlugins = new Set();
        this.dependencyGraph = new Map();

        this.init();
    }

    init() {
        this.setupCoreHooks();
        this.setupEventSystem();
        this.setupPluginAPI();
        this.loadCorePlugins();

        if (this.config.autoLoad) {
            this.autoLoadPlugins();
        }

        if (this.config.enableHotReload) {
            this.setupHotReload();
        }
    }

    // CORE HOOKS
    setupCoreHooks() {
        // Game lifecycle hooks
        this.registerHook('game:start', 'Called when the game starts');
        this.registerHook('game:pause', 'Called when the game is paused');
        this.registerHook('game:resume', 'Called when the game is resumed');
        this.registerHook('game:save', 'Called when the game is saved');
        this.registerHook('game:load', 'Called when the game is loaded');
        this.registerHook('game:stop', 'Called when the game stops');

        // Player hooks
        this.registerHook('player:login', 'Called when a player logs in');
        this.registerHook('player:logout', 'Called when a player logs out');
        this.registerHook('player:levelUp', 'Called when a player levels up');
        this.registerHook('player:death', 'Called when a player dies');
        this.registerHook('player:spawn', 'Called when a player spawns');

        // UI hooks
        this.registerHook('ui:menu:open', 'Called when a menu is opened');
        this.registerHook('ui:menu:close', 'Called when a menu is closed');
        this.registerHook('ui:dialog:show', 'Called when a dialog is shown');
        this.registerHook('ui:dialog:hide', 'Called when a dialog is hidden');

        // Item hooks
        this.registerHook('item:pickup', 'Called when an item is picked up');
        this.registerHook('item:use', 'Called when an item is used');
        this.registerHook('item:drop', 'Called when an item is dropped');
        this.registerHook('item:craft', 'Called when an item is crafted');

        // Quest hooks
        this.registerHook('quest:start', 'Called when a quest starts');
        this.registerHook('quest:complete', 'Called when a quest is completed');
        this.registerHook('quest:fail', 'Called when a quest fails');

        // Combat hooks
        this.registerHook('combat:start', 'Called when combat starts');
        this.registerHook('combat:end', 'Called when combat ends');
        this.registerHook('combat:damage', 'Called when damage is dealt');
        this.registerHook('combat:heal', 'Called when healing occurs');

        // Chat hooks
        this.registerHook('chat:message', 'Called when a chat message is sent');
        this.registerHook('chat:command', 'Called when a chat command is used');

        // System hooks
        this.registerHook('system:tick', 'Called every game tick');
        this.registerHook('system:render', 'Called during rendering');
        this.registerHook('system:update', 'Called during update loop');
        this.registerHook('system:error', 'Called when an error occurs');
    }

    // EVENT SYSTEM
    setupEventSystem() {
        this.addEventListener('plugin:loaded', (data) => {
            console.log(`Plugin loaded: ${data.plugin.name} v${data.plugin.version}`);
            this.notifyPluginLoaded(data.plugin);
        });

        this.addEventListener('plugin:unloaded', (data) => {
            console.log(`Plugin unloaded: ${data.plugin.name}`);
            this.notifyPluginUnloaded(data.plugin);
        });

        this.addEventListener('plugin:error', (data) => {
            console.error(`Plugin error: ${data.plugin.name}`, data.error);
            this.notifyPluginError(data.plugin, data.error);
        });

        this.addEventListener('hook:executed', (data) => {
            this.trackHookExecution(data);
        });
    }

    addEventListener(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    removeEventListener(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // PLUGIN API
    setupPluginAPI() {
        this.pluginAPI = {
            // Game API
            game: {
                getState: () => window.gameTheme?.gameState || {},
                getPlayer: () => window.gameTheme?.gameState?.player || {},
                getWorld: () => this.getWorldData(),
                getSettings: () => this.getGameSettings(),

                // Actions
                saveGame: () => window.itaSaveSystem?.save(),
                loadGame: (id) => window.itaSaveSystem?.load(id),
                showNotification: (message, type) => window.gameTheme?.showNotification(message, type),

                // Hooks
                addHook: (hookName, callback) => this.addHook(hookName, callback),
                removeHook: (hookName, callback) => this.removeHook(hookName, callback),
                executeHook: (hookName, data) => this.executeHook(hookName, data)
            },

            // UI API
            ui: {
                createModal: (options) => this.createModal(options),
                showDialog: (title, content, options) => window.gameTheme?.showDialog(title, content, options),
                closeDialog: () => window.gameTheme?.closeDialog(),
                createElement: (tag, attributes, content) => this.createElement(tag, attributes, content),

                // HUD
                updateHUD: () => window.gameTheme?.updateHUD(),
                showHUD: () => this.showHUD(),
                hideHUD: () => this.hideHUD(),

                // Menu
                addMenuItem: (item) => this.addMenuItem(item),
                removeMenuItem: (id) => this.removeMenuItem(id)
            },

            // Player API
            player: {
                getInventory: () => window.itaGameAPI?.getInventory(),
                addItem: (item) => this.addItem(item),
                removeItem: (itemId) => this.removeItem(itemId),
                hasItem: (itemId) => this.hasItem(itemId),
                getItemCount: (itemId) => this.getItemCount(itemId),

                // Stats
                getLevel: () => window.gameTheme?.gameState?.player?.level || 1,
                getExperience: () => window.gameTheme?.gameState?.player?.exp || 0,
                addExperience: (amount) => this.addExperience(amount),
                setHealth: (health) => this.setHealth(health),
                getHealth: () => window.gameTheme?.gameState?.player?.health || 100
            },

            // World API
            world: {
                getLocation: () => this.getCurrentLocation(),
                getNPCs: () => this.getNPCs(),
                getObjects: () => this.getWorldObjects(),
                spawnObject: (type, position) => this.spawnObject(type, position),
                removeEntity: (entityId) => this.removeEntity(entityId),

                // Time
                getTime: () => this.getGameTime(),
                setTime: (time) => this.setGameTime(time),
                isDaytime: () => this.isDaytime()
            },

            // Chat API
            chat: {
                sendMessage: (message, channel) => window.itaGameAPI?.sendChatMessage(channel, message),
                addCommand: (command, callback) => this.addChatCommand(command, callback),
                removeCommand: (command) => this.removeChatCommand(command)
            },

            // Analytics API
            analytics: {
                trackEvent: (event, properties) => window.itaGameAPI?.trackEvent(event, properties),
                trackMetric: (metric, value) => this.trackMetric(metric, value),
                setUserProperty: (property, value) => this.setUserProperty(property, value)
            },

            // Utility API
            utils: {
                formatNumber: (num, options) => window.formatNumber(num, options),
                formatDate: (date, options) => window.formatDate(date, options),
                formatCurrency: (amount, currency) => window.formatCurrency(amount, currency),
                generateId: () => this.generateId(),
                debounce: (func, delay) => this.debounce(func, delay),
                throttle: (func, limit) => this.throttle(func, limit),

                // Storage
                setStorage: (key, value) => this.setPluginStorage(key, value),
                getStorage: (key) => this.getPluginStorage(key),
                removeStorage: (key) => this.removePluginStorage(key)
            },

            // Localization
            i18n: {
                t: (key, params) => window.t(key, params),
                setLanguage: (lang) => window.itaLocalization?.setLanguage(lang),
                getLanguage: () => window.itaLocalization?.currentLanguage
            },

            // Plugin System API
            plugins: {
                list: () => this.getPluginList(),
                get: (id) => this.getPlugin(id),
                load: (id) => this.loadPlugin(id),
                unload: (id) => this.unloadPlugin(id),
                reload: (id) => this.reloadPlugin(id),
                enable: (id) => this.enablePlugin(id),
                disable: (id) => this.disablePlugin(id),
                isLoaded: (id) => this.isPluginLoaded(id),
                isEnabled: (id) => this.isPluginEnabled(id)
            }
        };
    }

    // PLUGIN MANAGEMENT
    async loadPlugin(pluginId) {
        if (this.plugins.has(pluginId)) {
            return this.plugins.get(pluginId);
        }

        try {
            // Load plugin metadata
            const pluginInfo = await this.loader.loadPluginInfo(pluginId);

            // Check dependencies
            await this.checkDependencies(pluginInfo);

            // Create plugin instance
            const plugin = await this.createPluginInstance(pluginInfo);

            // Register plugin
            this.registerPlugin(plugin);

            // Initialize plugin
            await this.initializePlugin(plugin);

            return plugin;
        } catch (error) {
            console.error(`Failed to load plugin ${pluginId}:`, error);
            this.emit('plugin:error', { pluginId, error });
            throw error;
        }
    }

    async createPluginInstance(pluginInfo) {
        const PluginClass = await this.loader.loadPluginClass(pluginInfo);

        return new PluginClass({
            id: pluginInfo.id,
            info: pluginInfo,
            api: this.pluginAPI,
            sandbox: this.sandbox
        });
    }

    registerPlugin(plugin) {
        this.plugins.set(plugin.id, plugin);
        this.loadedPlugins.add(plugin.id);

        // Validate plugin
        this.validatePlugin(plugin);

        // Register plugin commands
        this.registerPluginCommands(plugin);

        // Register plugin hooks
        this.registerPluginHooks(plugin);

        this.emit('plugin:loaded', { plugin });
    }

    async initializePlugin(plugin) {
        try {
            if (typeof plugin.initialize === 'function') {
                await plugin.initialize();
            }
        } catch (error) {
            console.error(`Plugin ${plugin.id} initialization failed:`, error);
            throw error;
        }
    }

    async unloadPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            return false;
        }

        try {
            // Disable plugin
            await this.disablePlugin(pluginId);

            // Cleanup plugin
            if (typeof plugin.cleanup === 'function') {
                await plugin.cleanup();
            }

            // Remove plugin references
            this.plugins.delete(pluginId);
            this.loadedPlugins.delete(pluginId);

            this.emit('plugin:unloaded', { plugin });
            return true;
        } catch (error) {
            console.error(`Failed to unload plugin ${pluginId}:`, error);
            throw error;
        }
    }

    async enablePlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin || this.activePlugins.has(pluginId)) {
            return false;
        }

        try {
            // Enable plugin hooks
            this.enablePluginHooks(plugin);

            // Enable plugin commands
            this.enablePluginCommands(plugin);

            this.activePlugins.add(pluginId);
            plugin.enabled = true;

            if (typeof plugin.onEnable === 'function') {
                await plugin.onEnable();
            }

            return true;
        } catch (error) {
            console.error(`Failed to enable plugin ${pluginId}:`, error);
            throw error;
        }
    }

    async disablePlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin || !this.activePlugins.has(pluginId)) {
            return false;
        }

        try {
            // Disable plugin hooks
            this.disablePluginHooks(plugin);

            // Disable plugin commands
            this.disablePluginCommands(plugin);

            this.activePlugins.delete(pluginId);
            plugin.enabled = false;

            if (typeof plugin.onDisable === 'function') {
                await plugin.onDisable();
            }

            return true;
        } catch (error) {
            console.error(`Failed to disable plugin ${pluginId}:`, error);
            throw error;
        }
    }

    async reloadPlugin(pluginId) {
        const wasEnabled = this.isPluginEnabled(pluginId);

        // Unload if loaded
        if (this.isPluginLoaded(pluginId)) {
            await this.unloadPlugin(pluginId);
        }

        // Clear from loader cache
        this.loader.clearCache(pluginId);

        // Reload
        await this.loadPlugin(pluginId);

        // Re-enable if it was enabled
        if (wasEnabled) {
            await this.enablePlugin(pluginId);
        }
    }

    // DEPENDENCY MANAGEMENT
    async checkDependencies(pluginInfo) {
        if (!pluginInfo.dependencies || pluginInfo.dependencies.length === 0) {
            return;
        }

        for (const dependency of pluginInfo.dependencies) {
            // Check if dependency is already loaded
            if (!this.isPluginLoaded(dependency.id)) {
                // Load dependency
                await this.loadPlugin(dependency.id);
            }

            // Check version compatibility
            const dependencyPlugin = this.plugins.get(dependency.id);
            if (dependencyPlugin && !this.isVersionCompatible(dependencyPlugin.info.version, dependency.version)) {
                throw new Error(`Plugin ${pluginInfo.id} requires ${dependency.id} ${dependency.version} but ${dependencyPlugin.info.version} is installed`);
            }
        }
    }

    isVersionCompatible(installed, required) {
        return this.compareVersions(installed, required) >= 0;
    }

    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        const maxLength = Math.max(parts1.length, parts2.length);

        for (let i = 0; i < maxLength; i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;

            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }

        return 0;
    }

    // HOOK SYSTEM
    registerHook(hookName, description) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push({
            description,
            callbacks: []
        });
    }

    addHook(hookName, callback, pluginId = 'core') {
        if (!this.hooks.has(hookName)) {
            this.registerHook(hookName, `Custom hook: ${hookName}`);
        }

        const hook = this.hooks.get(hookName);
        hook.callbacks.push({
            callback,
            pluginId
        });
    }

    removeHook(hookName, callback) {
        const hook = this.hooks.get(hookName);
        if (hook) {
            hook.callbacks = hook.callbacks.filter(hook => hook.callback !== callback);
        }
    }

    async executeHook(hookName, data) {
        if (!this.hooks.has(hookName)) {
            return data;
        }

        const hook = this.hooks.get(hookName);
        let result = data;

        for (const hookCallback of hook.callbacks) {
            try {
                const hookResult = await hookCallback.callback(result);
                if (hookResult !== undefined) {
                    result = hookResult;
                }
            } catch (error) {
                console.error(`Error in hook ${hookName}:`, error);
                this.emit('hook:error', { hookName, error, callback: hookCallback });
            }
        }

        this.emit('hook:executed', { hookName, data, result });
        return result;
    }

    registerPluginHooks(plugin) {
        if (plugin.hooks) {
            Object.entries(plugin.hooks).forEach(([hookName, callback]) => {
                this.addHook(hookName, callback, plugin.id);
            });
        }
    }

    enablePluginHooks(plugin) {
        if (plugin.hooks) {
            Object.entries(plugin.hooks).forEach(([hookName, callback]) => {
                const hook = this.hooks.get(hookName);
                if (hook) {
                    const hookCallback = hook.callbacks.find(h => h.pluginId === plugin.id);
                    if (hookCallback) {
                        hookCallback.disabled = false;
                    }
                }
            });
        }
    }

    disablePluginHooks(plugin) {
        if (plugin.hooks) {
            Object.entries(plugin.hooks).forEach(([hookName]) => {
                const hook = this.hooks.get(hookName);
                if (hook) {
                    const hookCallback = hook.callbacks.find(h => h.pluginId === plugin.id);
                    if (hookCallback) {
                        hookCallback.disabled = true;
                    }
                }
            });
        }
    }

    // COMMAND SYSTEM
    registerPluginCommands(plugin) {
        if (plugin.commands) {
            Object.entries(plugin.commands).forEach(([commandName, command]) => {
                this.registerCommand(commandName, command, plugin.id);
            });
        }
    }

    registerCommand(commandName, command, pluginId) {
        this.gameCommands = this.gameCommands || {};
        this.gameCommands[`/${pluginId}/${commandName}`] = {
            ...command,
            pluginId,
            handler: command.handler
        };
    }

    enablePluginCommands(plugin) {
        if (plugin.commands) {
            Object.keys(plugin.commands).forEach(commandName => {
                const fullCommandName = `/${plugin.id}/${commandName}`;
                if (this.gameCommands[fullCommandName]) {
                    this.gameCommands[fullCommandName].disabled = false;
                }
            });
        }
    }

    disablePluginCommands(plugin) {
        if (plugin.commands) {
            Object.keys(plugin.commands).forEach(commandName => {
                const fullCommandName = `/${plugin.id}/${commandName}`;
                if (this.gameCommands[fullCommandName]) {
                    this.gameCommands[fullCommandName].disabled = true;
                }
            });
        }
    }

    // CHAT COMMANDS
    addChatCommand(command, callback) {
        window.gameTheme?.addChatCommand(command, callback);
    }

    removeChatCommand(command) {
        window.gameTheme?.removeChatCommand(command);
    }

    // GAME DATA HELPERS
    getWorldData() {
        return {
            time: this.getGameTime(),
            location: this.getCurrentLocation(),
            npcs: this.getNPCs(),
            objects: this.getWorldObjects(),
            players: this.getPlayers()
        };
    }

    getGameSettings() {
        return {
            language: window.itaLocalization?.currentLanguage,
            volume: localStorage.getItem('ita-game-volume'),
            fullscreen: localStorage.getItem('ita-game-fullscreen') === 'true',
            graphics: localStorage.getItem('ita-game-graphics')
        };
    }

    getCurrentLocation() {
        return 'ITA Campus'; // This would get actual game location
    }

    getNPCs() {
        return []; // This would get actual NPCs
    }

    getWorldObjects() {
        return []; // This would get actual world objects
    }

    getPlayers() {
        return []; // This would get actual players
    }

    getGameTime() {
        return Date.now(); // This would get actual game time
    }

    setGameTime(time) {
        // This would set game time
    }

    isDaytime() {
        return true; // This would check if it's daytime
    }

    // PLAYER HELPERS
    addItem(item) {
        // Add item to player inventory
        console.log('Adding item:', item);
    }

    removeItem(itemId) {
        // Remove item from player inventory
        console.log('Removing item:', itemId);
    }

    hasItem(itemId) {
        // Check if player has item
        return false;
    }

    getItemCount(itemId) {
        // Get item count
        return 0;
    }

    addExperience(amount) {
        // Add experience to player
        if (window.gameTheme?.gameState?.player) {
            window.gameTheme.gameState.player.exp += amount;
            window.gameTheme.updateHUD();
        }
    }

    setHealth(health) {
        // Set player health
        if (window.gameTheme?.gameState?.player) {
            window.gameTheme.gameState.player.health = health;
            window.gameTheme.updateHUD();
        }
    }

    // UI HELPERS
    createModal(options) {
        // Create modal dialog
        const modal = document.createElement('div');
        modal.className = 'plugin-modal';
        modal.innerHTML = `
            <div class="plugin-modal-content">
                <h3>${options.title || 'Modal'}</h3>
                <div class="plugin-modal-body">${options.content || ''}</div>
                <div class="plugin-modal-footer">
                    <button class="btn-close">${options.closeText || 'Close'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        return modal;
    }

    showHUD() {
        const hud = document.querySelector('.game-hud');
        if (hud) {
            hud.style.display = 'block';
        }
    }

    hideHUD() {
        const hud = document.querySelector('.game-hud');
        if (hud) {
            hud.style.display = 'none';
        }
    }

    addMenuItem(item) {
        // Add menu item to game menu
        console.log('Adding menu item:', item);
    }

    removeMenuItem(id) {
        // Remove menu item from game menu
        console.log('Removing menu item:', id);
    }

    // ENTITY HELPERS
    spawnObject(type, position) {
        // Spawn object in world
        console.log('Spawning object:', type, position);
    }

    removeEntity(entityId) {
        // Remove entity from world
        console.log('Removing entity:', entityId);
    }

    // ANALYTICS HELPERS
    trackMetric(metric, value) {
        if (window.itaGameAPI) {
            window.itaGameAPI.trackMetric(metric, value);
        }
    }

    setUserProperty(property, value) {
        // Set user property for analytics
        localStorage.setItem(`ita-user-${property}`, value);
    }

    // UTILITY HELPERS
    generateId() {
        return 'plugin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // PLUGIN STORAGE
    setPluginStorage(key, value) {
        const storageKey = `plugin_${this.getCurrentPluginId()}_${key}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
    }

    getPluginStorage(key) {
        const storageKey = `plugin_${this.getCurrentPluginId()}_${key}`;
        const value = localStorage.getItem(storageKey);
        return value ? JSON.parse(value) : null;
    }

    removePluginStorage(key) {
        const storageKey = `plugin_${this.getCurrentPluginId()}_${key}`;
        localStorage.removeItem(storageKey);
    }

    getCurrentPluginId() {
        // This would get the current executing plugin ID
        return 'unknown';
    }

    // PLUGIN VALIDATION
    validatePlugin(plugin) {
        // Check plugin structure
        if (!plugin.id || !plugin.name || !plugin.version) {
            throw new Error('Plugin missing required properties');
        }

        // Check API compatibility
        if (plugin.apiVersion && !this.isVersionCompatible(this.config.apiVersion, plugin.apiVersion)) {
            throw new Error(`Plugin API version ${plugin.apiVersion} is not compatible with system version ${this.config.apiVersion}`);
        }

        // Check plugin permissions
        this.validatePluginPermissions(plugin);
    }

    validatePluginPermissions(plugin) {
        const requiredPermissions = [
            'read.gameState',
            'write.gameState'
        ];

        if (plugin.permissions) {
            for (const permission of requiredPermissions) {
                if (!plugin.permissions.includes(permission)) {
                    console.warn(`Plugin ${plugin.id} missing permission: ${permission}`);
                }
            }
        }
    }

    // NOTIFICATIONS
    notifyPluginLoaded(plugin) {
        window.gameTheme?.showNotification(`Plugin ${plugin.name} loaded successfully`, 'success');
    }

    notifyPluginUnloaded(plugin) {
        window.gameTheme?.showNotification(`Plugin ${plugin.name} unloaded`, 'info');
    }

    notifyPluginError(plugin, error) {
        window.gameTheme?.showNotification(`Error in plugin ${plugin.name}: ${error.message}`, 'error');
    }

    // AUTO LOADING
    autoLoadPlugins() {
        // Auto-load plugins from storage
        const autoLoadPlugins = localStorage.getItem('ita-auto-load-plugins');
        if (autoLoadPlugins) {
            const pluginIds = JSON.parse(autoLoadPlugins);
            pluginIds.forEach(pluginId => {
                this.loadPlugin(pluginId).catch(error => {
                    console.error(`Failed to auto-load plugin ${pluginId}:`, error);
                });
            });
        }
    }

    loadCorePlugins() {
        // Load built-in plugins
        const corePlugins = [
            'ita-core-plugin',
            'ita-analytics-plugin',
            'ita-chat-commands-plugin'
        ];

        corePlugins.forEach(pluginId => {
            this.loadPlugin(pluginId).catch(error => {
                console.error(`Failed to load core plugin ${pluginId}:`, error);
            });
        });
    }

    // HOT RELOAD
    setupHotReload() {
        if (this.config.enableHotReload) {
            // Watch for plugin file changes
            this.setupFileWatcher();
        }
    }

    setupFileWatcher() {
        // This would implement file watching for hot reload
        console.log('Hot reload enabled');
    }

    // PLUGIN REGISTRY
    getPluginList() {
        return Array.from(this.plugins.values()).map(plugin => ({
            id: plugin.id,
            name: plugin.name,
            version: plugin.version,
            description: plugin.description,
            author: plugin.author,
            enabled: plugin.enabled,
            loaded: this.isPluginLoaded(plugin.id)
        }));
    }

    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }

    isPluginLoaded(pluginId) {
        return this.loadedPlugins.has(pluginId);
    }

    isPluginEnabled(pluginId) {
        return this.activePlugins.has(pluginId);
    }

    // CLEANUP
    destroy() {
        // Unload all plugins
        const pluginIds = Array.from(this.loadedPlugins);
        pluginIds.forEach(pluginId => {
            this.unloadPlugin(pluginId).catch(error => {
                console.error(`Failed to unload plugin ${pluginId} during cleanup:`, error);
            });
        });

        // Clear data
        this.plugins.clear();
        this.loadedPlugins.clear();
        this.activePlugins.clear();
        this.hooks.clear();
        this.events.clear();

        // Clear registry
        this.registry.destroy();
    }

    // METRICS
    getMetrics() {
        return {
            totalPlugins: this.plugins.size,
            loadedPlugins: this.loadedPlugins.size,
            activePlugins: this.activePlugins.size,
            hooksCount: this.hooks.size,
            eventsCount: this.events.size,
            uptime: Date.now() - (this.startTime || Date.now())
        };
    }

    trackHookExecution(data) {
        // Track hook execution for analytics
        if (window.itaGameAPI) {
            window.itaGameAPI.trackEvent('hook_executed', {
                hookName: data.hookName,
                executionTime: data.executionTime,
                pluginId: data.pluginId
            });
        }
    }
}

// Plugin Sandbox for security
class PluginSandbox {
    constructor() {
        this.allowedAPIs = [
            'game',
            'ui',
            'player',
            'world',
            'chat',
            'analytics',
            'utils',
            'i18n',
            'plugins'
        ];

        this.startTime = Date.now();
    }

    createSandbox(pluginAPI) {
        const sandbox = {};

        this.allowedAPIs.forEach(apiName => {
            if (pluginAPI[apiName]) {
                sandbox[apiName] = this.createSafeAPI(pluginAPI[apiName]);
            }
        });

        // Add security restrictions
        sandbox.console = this.createSafeConsole();
        sandbox.setTimeout = setTimeout.bind(window);
        sandbox.clearTimeout = clearTimeout.bind(window);
        sandbox.setInterval = setInterval.bind(window);
        sandbox.clearInterval = clearInterval.bind(window);

        return sandbox;
    }

    createSafeAPI(api) {
        const safeAPI = {};

        if (typeof api === 'object') {
            Object.keys(api).forEach(key => {
                if (typeof api[key] === 'function') {
                    safeAPI[key] = this.wrapFunction(api[key]);
                } else {
                    safeAPI[key] = api[key];
                }
            });
        }

        return safeAPI;
    }

    wrapFunction(func) {
        return (...args) => {
            try {
                return func.apply(null, args);
            } catch (error) {
                console.error('Plugin error:', error);
                throw error;
            }
        };
    }

    createSafeConsole() {
        return {
            log: (...args) => console.log(`[Plugin]`, ...args),
            warn: (...args) => console.warn(`[Plugin]`, ...args),
            error: (...args) => console.error(`[Plugin]`, ...args),
            info: (...args) => console.info(`[Plugin]`, ...args),
            debug: (...args) => console.debug(`[Plugin]`, ...args)
        };
    }
}

// Plugin Loader
class PluginLoader {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.validators = new Map();
    }

    async loadPluginInfo(pluginId) {
        // Try to load plugin metadata from cache first
        if (this.cache.has(pluginId)) {
            return this.cache.get(pluginId);
        }

        // Load from plugin manifest
        const manifestUrl = `${this.config.pluginsDir}/${pluginId}/plugin.json`;

        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) {
                throw new Error(`Plugin manifest not found: ${manifestUrl}`);
            }

            const pluginInfo = await response.json();

            // Validate plugin info
            this.validatePluginInfo(pluginInfo);

            // Cache plugin info
            this.cache.set(pluginId, pluginInfo);

            return pluginInfo;
        } catch (error) {
            console.error(`Failed to load plugin info for ${pluginId}:`, error);
            throw error;
        }
    }

    async loadPluginClass(pluginInfo) {
        if (pluginInfo.main) {
            const scriptUrl = `${this.config.pluginsDir}/${pluginInfo.id}/${pluginInfo.main}`;

            try {
                const response = await fetch(scriptUrl);
                if (!response.ok) {
                    throw new Error(`Plugin script not found: ${scriptUrl}`);
                }

                const scriptContent = await response.text();

                // Create plugin class from script
                const PluginClass = this.createPluginClass(scriptContent, pluginInfo);

                return PluginClass;
            } catch (error) {
                console.error(`Failed to load plugin class for ${pluginInfo.id}:`, error);
                throw error;
            }
        }

        return class DefaultPlugin {
            constructor(api) {
                this.api = api;
            }
        };
    }

    createPluginClass(scriptContent, pluginInfo) {
        // Create a safe plugin class
        const wrapper = `
            class Plugin {
                constructor(api) {
                    this.id = '${pluginInfo.id}';
                    this.api = api;
                    this.name = '${pluginInfo.name}';
                    this.version = '${pluginInfo.version}';
                    this.author = '${pluginInfo.author || 'Unknown'}';
                    this.description = '${pluginInfo.description || ''}';
                    this.permissions = ${JSON.stringify(pluginInfo.permissions || [])};
                    this.enabled = false;

                    ${scriptContent}
                }
            }
        `;

        // Execute script in safe context
        const pluginClass = new Function('return ' + wrapper + ';')();

        return pluginClass;
    }

    validatePluginInfo(pluginInfo) {
        const requiredFields = ['id', 'name', 'version'];

        for (const field of requiredFields) {
            if (!pluginInfo[field]) {
                throw new Error(`Plugin missing required field: ${field}`);
            }
        }

        // Validate plugin structure
        if (!this.isValidPluginId(pluginInfo.id)) {
            throw new Error(`Invalid plugin ID: ${pluginInfo.id}`);
        }

        // Validate dependencies
        if (pluginInfo.dependencies) {
            this.validateDependencies(pluginInfo.dependencies);
        }
    }

    isValidPluginId(id) {
        return /^[a-zA-Z0-9_-]+$/.test(id);
    }

    validateDependencies(dependencies) {
        for (const dep of dependencies) {
            if (!dep.id || !dep.version) {
                throw new Error(`Invalid dependency format: ${JSON.stringify(dep)}`);
            }
        }
    }

    clearCache(pluginId) {
        if (pluginId) {
            this.cache.delete(pluginId);
        } else {
            this.cache.clear();
        }
    }
}

// Plugin Registry
class PluginRegistry {
    constructor() {
        this.plugins = new Map();
        this.categories = new Map();
        this.tags = new Map();
    }

    register(plugin) {
        this.plugins.set(plugin.id, plugin);

        // Register by category
        if (plugin.category) {
            if (!this.categories.has(plugin.category)) {
                this.categories.set(plugin.category, new Set());
            }
            this.categories.get(plugin.category).add(plugin.id);
        }

        // Register by tags
        if (plugin.tags) {
            plugin.tags.forEach(tag => {
                if (!this.tags.has(tag)) {
                    this.tags.set(tag, new Set());
                }
                this.tags.get(tag).add(plugin.id);
            });
        }
    }

    unregister(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;

        this.plugins.delete(pluginId);

        // Remove from categories
        if (plugin.category) {
            this.categories.get(plugin.category)?.delete(pluginId);
        }

        // Remove from tags
        if (plugin.tags) {
            plugin.tags.forEach(tag => {
                this.tags.get(tag)?.delete(pluginId);
            });
        }
    }

    search(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        this.plugins.forEach(plugin => {
            if (
                plugin.name.toLowerCase().includes(lowerQuery) ||
                plugin.description.toLowerCase().includes(lowerQuery) ||
                plugin.author.toLowerCase().includes(lowerQuery) ||
                plugin.id.toLowerCase().includes(lowerQuery)
            ) {
                results.push(plugin);
            }
        });

        return results;
    }

    getByCategory(category) {
        return Array.from(this.categories.get(category) || [])
            .map(id => this.plugins.get(id))
            .filter(Boolean);
    }

    getByTag(tag) {
        return Array.from(this.tags.get(tag) || [])
            .map(id => this.plugins.get(id))
            .filter(Boolean);
    }

    getPluginsByAuthor(author) {
        return Array.from(this.plugins.values())
            .filter(plugin => plugin.author === author);
    }

    getPopularPlugins(limit = 10) {
        return Array.from(this.plugins.values())
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
            .slice(0, limit);
    }

    getRecentPlugins(limit = 10) {
        return Array.from(this.plugins.values())
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, limit);
    }

    destroy() {
        this.plugins.clear();
        this.categories.clear();
        this.tags.clear();
    }
}

// Base Plugin Class
class BasePlugin {
    constructor(api) {
        this.api = api;
        this.id = null;
        this.name = '';
        this.version = '';
        this.author = '';
        this.description = '';
        this.permissions = [];
        this.enabled = false;
        this.hooks = {};
        this.commands = {};
        this.startTime = Date.now();
    }

    async initialize() {
        // Override in subclass
    }

    async cleanup() {
        // Override in subclass
    }

    onEnable() {
        // Override in subclass
    }

    onDisable() {
        // Override in subclass
    }

    // Plugin lifecycle hooks
    onGameStart(data) {
        // Override in subclass
    }

    onPlayerLogin(player) {
        // Override in subclass
    }

    onPlayerLogout(player) {
        // Override in subclass
    }

    onChatMessage(message) {
        // Override in subclass
    }

    // Helper methods
    log(message) {
        console.log(`[${this.name}] ${message}`);
    }

    warn(message) {
        console.warn(`[${this.name}] ${message}`);
    }

    error(message) {
        console.error(`[${this.name}] ${message}`);
    }

    // Plugin info
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            version: this.version,
            author: this.author,
            description: this.description,
            permissions: this.permissions,
            enabled: this.enabled,
            uptime: Date.now() - this.startTime,
            hooks: Object.keys(this.hooks),
            commands: Object.keys(this.commands)
        };
    }
}

// Initialize plugin system
document.addEventListener('DOMContentLoaded', () => {
    window.itaPluginSystem = new ITAPluginSystem();
    window.BasePlugin = BasePlugin;
});

// Export for external use
window.ITAPluginSystem = ITAPluginSystem;
window.BasePlugin = BasePlugin;

// Make plugin API available globally
if (window.gameTheme) {
    window.gameTheme.pluginAPI = window.itaPluginSystem?.pluginAPI;
}