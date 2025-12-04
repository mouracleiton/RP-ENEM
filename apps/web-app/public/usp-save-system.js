// ENEM RP Game Save/Load System with Cloud Storage
// Comprehensive game state management with automatic and manual saves

class ENEMSaveSystem {
    constructor(config = {}) {
        this.config = {
            autoSaveInterval: config.autoSaveInterval || 300000, // 5 minutes
            maxAutoSaves: config.maxAutoSaves || 5,
            maxManualSaves: config.maxManualSaves || 10,
            maxCloudSaves: config.maxCloudSaves || 20,
            compressionEnabled: config.compressionEnabled !== false,
            encryptionEnabled: config.encryptionEnabled !== false,
            cloudProvider: config.cloudProvider || 'google-drive', // 'google-drive', 'dropbox', 'onedrive'
            localStorageKey: config.localStorageKey || 'ita-game-saves',
            cloudStorageKey: config.cloudStorageKey || 'ita-game-cloud-saves',
            version: config.version || '1.0.0',
            ...config
        };

        this.saves = new Map();
        this.currentSaveId = null;
        this.lastAutoSave = null;
        this.isDirty = false;
        this.autoSaveTimer = null;
        this.cloudProviders = new Map();

        this.init();
    }

    async init() {
        await this.loadLocalSaves();
        this.setupCloudProviders();
        this.startAutoSave();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    // SAVE DATA STRUCTURE
    createSaveData() {
        const timestamp = Date.now();
        const saveData = {
            meta: {
                id: this.generateSaveId(),
                version: this.config.version,
                timestamp,
                date: new Date(timestamp).toISOString(),
                playTime: this.calculatePlayTime(),
                screenshot: await this.captureScreenshot(),
                character: {
                    name: window.gameTheme?.gameState?.player?.name || 'Unknown',
                    level: window.gameTheme?.gameState?.player?.level || 1,
                    class: window.gameTheme?.gameState?.player?.class || 'None'
                },
                location: this.getCurrentLocation(),
                progress: this.calculateProgress()
            },
            game: {
                player: window.gameTheme?.gameState?.player || {},
                inventory: await window.itaGameAPI?.getInventory() || [],
                quests: await window.itaGameAPI?.getQuests() || [],
                achievements: this.getAchievements(),
                settings: this.getGameSettings(),
                worldState: this.getWorldState()
            },
            ui: {
                camera: this.getCameraState(),
                hud: this.getHUDState(),
                minimap: this.getMinimapState()
            },
            system: {
                sessionData: this.getSessionData(),
                analytics: this.getAnalyticsData(),
                debug: this.getDebugData()
            }
        };

        return saveData;
    }

    // CORE SAVE/LOAD METHODS
    async save(slot = 'auto', name = null) {
        try {
            const saveData = await this.createSaveData();

            // Add save metadata
            saveData.meta.slot = slot;
            saveData.meta.name = name || this.generateSaveName(slot);
            saveData.meta.type = slot === 'auto' ? 'auto' : 'manual';

            // Process save data
            const processedData = await this.processSaveData(saveData);

            // Save to local storage
            await this.saveToLocal(processedData);

            // Update current save
            this.currentSaveId = processedData.meta.id;
            this.isDirty = false;

            // Update UI
            this.updateSaveUI();

            // Track analytics
            this.trackSaveEvent(processedData);

            window.gameTheme?.showNotification(`Jogo salvo: ${processedData.meta.name}`, 'success');

            return processedData.meta.id;
        } catch (error) {
            console.error('Save failed:', error);
            window.gameTheme?.showNotification('Falha ao salvar jogo!', 'error');
            throw error;
        }
    }

    async load(saveId) {
        try {
            const saveData = await this.loadFromLocal(saveId);

            if (!saveData) {
                throw new Error(`Save ${saveId} not found`);
            }

            // Validate save version
            if (!this.validateSaveVersion(saveData)) {
                const migrated = await this.migrateSave(saveData);
                saveData.game = migrated.game;
                saveData.meta.version = this.config.version;
            }

            // Load game state
            await this.loadGameState(saveData);

            // Update current save
            this.currentSaveId = saveId;
            this.isDirty = false;

            // Update UI
            this.updateSaveUI();

            // Track analytics
            this.trackLoadEvent(saveData);

            window.gameTheme?.showNotification(`Jogo carregado: ${saveData.meta.name}`, 'success');

            return saveData;
        } catch (error) {
            console.error('Load failed:', error);
            window.gameTheme?.showNotification('Falha ao carregar jogo!', 'error');
            throw error;
        }
    }

    async delete(saveId) {
        try {
            const success = await this.deleteFromLocal(saveId);

            if (success) {
                // Clear current save if it was deleted
                if (this.currentSaveId === saveId) {
                    this.currentSaveId = null;
                }

                this.updateSaveUI();
                window.gameTheme?.showNotification('Jogo excluído com sucesso!', 'success');
            }

            return success;
        } catch (error) {
            console.error('Delete failed:', error);
            window.gameTheme?.showNotification('Falha ao excluir jogo!', 'error');
            throw error;
        }
    }

    // LOCAL STORAGE OPERATIONS
    async saveToLocal(saveData) {
        const key = `${this.config.localStorageKey}_${saveData.meta.id}`;

        // Process save data (compression, encryption)
        const processedData = await this.processSaveData(saveData);

        // Store in localStorage
        localStorage.setItem(key, processedData.compressed);

        // Update saves index
        await this.updateSavesIndex(saveData);

        // Cleanup old saves
        await this.cleanupOldSaves();
    }

    async loadFromLocal(saveId) {
        const key = `${this.config.localStorageKey}_${saveId}`;
        const compressed = localStorage.getItem(key);

        if (!compressed) {
            return null;
        }

        // Decompress and decrypt
        const saveData = await this.decompressSaveData(compressed);

        return saveData;
    }

    async deleteFromLocal(saveId) {
        const key = `${this.config.localStorageKey}_${saveId}`;
        localStorage.removeItem(key);

        // Update saves index
        await this.removeFromSavesIndex(saveId);

        return true;
    }

    async loadLocalSaves() {
        try {
            const indexData = localStorage.getItem(this.config.localStorageKey + '_index');
            const savesIndex = indexData ? JSON.parse(indexData) : {};

            Object.entries(savesIndex).forEach(([saveId, saveInfo]) => {
                this.saves.set(saveId, saveInfo);
            });

            // Set most recent save as current
            const recentSave = this.getMostRecentSave();
            if (recentSave) {
                this.currentSaveId = recentSave.id;
            }
        } catch (error) {
            console.error('Failed to load local saves:', error);
        }
    }

    async updateSavesIndex(saveData) {
        try {
            const indexData = localStorage.getItem(this.config.localStorageKey + '_index');
            const savesIndex = indexData ? JSON.parse(indexData) : {};

            savesIndex[saveData.meta.id] = {
                id: saveData.meta.id,
                name: saveData.meta.name,
                date: saveData.meta.date,
                timestamp: saveData.meta.timestamp,
                slot: saveData.meta.slot,
                type: saveData.meta.type,
                character: saveData.meta.character,
                location: saveData.meta.location,
                progress: saveData.meta.progress,
                playTime: saveData.meta.playTime,
                version: saveData.meta.version
            };

            localStorage.setItem(this.config.localStorageKey + '_index', JSON.stringify(savesIndex));
            this.saves.set(saveData.meta.id, savesIndex[saveData.meta.id]);
        } catch (error) {
            console.error('Failed to update saves index:', error);
        }
    }

    async removeFromSavesIndex(saveId) {
        try {
            const indexData = localStorage.getItem(this.config.localStorageKey + '_index');
            const savesIndex = indexData ? JSON.parse(indexData) : {};

            delete savesIndex[saveId];
            this.saves.delete(saveId);

            localStorage.setItem(this.config.localStorageKey + '_index', JSON.stringify(savesIndex));
        } catch (error) {
            console.error('Failed to remove from saves index:', error);
        }
    }

    // DATA PROCESSING
    async processSaveData(saveData) {
        let processed = JSON.stringify(saveData);

        // Encryption
        if (this.config.encryptionEnabled) {
            processed = await this.encryptData(processed);
        }

        // Compression
        let compressed;
        if (this.config.compressionEnabled) {
            compressed = await this.compressData(processed);
        } else {
            compressed = processed;
        }

        return {
            ...saveData,
            compressed,
            size: compressed.length,
            compressed: true
        };
    }

    async decompressSaveData(compressed) {
        let decompressed;

        // Decompression
        if (this.config.compressionEnabled) {
            decompressed = await this.decompressData(compressed);
        } else {
            decompressed = compressed;
        }

        // Decryption
        if (this.config.encryptionEnabled) {
            decompressed = await this.decryptData(decompressed);
        }

        return JSON.parse(decompressed);
    }

    async compressData(data) {
        // Simple compression using LZ-String or similar
        try {
            if (window.LZString) {
                return window.LZString.compress(data);
            }

            // Fallback: simple base64 encoding
            return btoa(unescape(encodeURIComponent(data)));
        } catch (error) {
            console.error('Compression failed:', error);
            return data;
        }
    }

    async decompressData(compressed) {
        try {
            if (window.LZString) {
                return window.LZString.decompress(compressed);
            }

            // Fallback: simple base64 decoding
            return decodeURIComponent(escape(atob(compressed)));
        } catch (error) {
            console.error('Decompression failed:', error);
            return compressed;
        }
    }

    async encryptData(data) {
        // Simple XOR encryption for demo purposes
        // In production, use proper encryption like Web Crypto API
        const key = 'ita-game-encryption-key';
        let encrypted = '';

        for (let i = 0; i < data.length; i++) {
            encrypted += String.fromCharCode(
                data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }

        return btoa(encrypted);
    }

    async decryptData(encrypted) {
        const key = 'ita-game-encryption-key';
        const decoded = atob(encrypted);
        let decrypted = '';

        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(
                decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }

        return decrypted;
    }

    // CLOUD STORAGE
    setupCloudProviders() {
        this.cloudProviders.set('google-drive', new GoogleDriveProvider());
        this.cloudProviders.set('dropbox', new DropboxProvider());
        this.cloudProviders.set('onedrive', new OneDriveProvider());
    }

    async syncToCloud(saveId) {
        try {
            const saveData = await this.loadFromLocal(saveId);
            if (!saveData) {
                throw new Error('Save not found');
            }

            const provider = this.cloudProviders.get(this.config.cloudProvider);
            if (!provider) {
                throw new Error('Cloud provider not available');
            }

            const result = await provider.save(saveData);

            window.gameTheme?.showNotification('Jogo sincronizado com a nuvem!', 'success');
            return result;
        } catch (error) {
            console.error('Cloud sync failed:', error);
            window.gameTheme?.showNotification('Falha na sincronização com a nuvem!', 'error');
            throw error;
        }
    }

    async loadFromCloud(cloudSaveId) {
        try {
            const provider = this.cloudProviders.get(this.config.cloudProvider);
            if (!provider) {
                throw new Error('Cloud provider not available');
            }

            const saveData = await provider.load(cloudSaveId);

            // Save to local storage
            await this.saveToLocal(saveData);

            // Load game state
            await this.loadGameState(saveData);

            this.currentSaveId = saveData.meta.id;
            this.isDirty = false;

            window.gameTheme?.showNotification('Jogo carregado da nuvem!', 'success');
            return saveData;
        } catch (error) {
            console.error('Cloud load failed:', error);
            window.gameTheme?.showNotification('Falha ao carregar da nuvem!', 'error');
            throw error;
        }
    }

    async getCloudSaves() {
        try {
            const provider = this.cloudProviders.get(this.config.cloudProvider);
            if (!provider) {
                return [];
            }

            return await provider.listSaves();
        } catch (error) {
            console.error('Failed to get cloud saves:', error);
            return [];
        }
    }

    // AUTO-SAVE SYSTEM
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(async () => {
            if (this.isDirty) {
                try {
                    await this.save('auto');
                    this.lastAutoSave = Date.now();
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }
        }, this.config.autoSaveInterval);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    // GAME STATE MANAGEMENT
    async loadGameState(saveData) {
        // Load player state
        if (saveData.game.player && window.gameTheme) {
            window.gameTheme.gameState.player = saveData.game.player;
            window.gameTheme.updateHUD();
        }

        // Load inventory
        if (saveData.game.inventory && window.itaGameAPI) {
            await window.itaGameAPI.updateInventory(saveData.game.inventory);
        }

        // Load quests
        if (saveData.game.quests && window.itaGameAPI) {
            saveData.game.quests.forEach(async (quest) => {
                await window.itaGameAPI.updateQuestProgress(quest.id, quest.progress);
            });
        }

        // Load achievements
        if (saveData.game.achievements && window.gameComponents) {
            window.gameComponents.loadAchievements(saveData.game.achievements);
        }

        // Load settings
        if (saveData.game.settings) {
            this.applyGameSettings(saveData.game.settings);
        }

        // Load world state
        if (saveData.game.worldState) {
            this.applyWorldState(saveData.game.worldState);
        }

        // Load UI state
        if (saveData.ui.camera) {
            this.applyCameraState(saveData.ui.camera);
        }
    }

    // UTILITY METHODS
    generateSaveId() {
        return 'save_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSaveName(slot) {
        if (slot === 'auto') {
            return `Auto-Save ${new Date().toLocaleString()}`;
        }

        const characterName = window.gameTheme?.gameState?.player?.name || 'Player';
        const location = this.getCurrentLocation();
        return `${characterName} - ${location}`;
    }

    getCurrentLocation() {
        // This would get the current game location
        return 'ENEM Campus';
    }

    calculatePlayTime() {
        // Calculate total play time from session data
        return this.getSessionData().totalPlayTime || 0;
    }

    calculateProgress() {
        // Calculate overall game progress percentage
        const totalQuests = 100; // This would be dynamic
        const completedQuests = this.getCompletedQuestsCount();
        return Math.round((completedQuests / totalQuests) * 100);
    }

    async captureScreenshot() {
        try {
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                return canvas.toDataURL('image/jpeg', 0.8);
            }
        } catch (error) {
            console.error('Screenshot failed:', error);
        }
        return null;
    }

    getAchievements() {
        // Get unlocked achievements
        return window.gameComponents?.getAchievements() || [];
    }

    getGameSettings() {
        // Get current game settings
        return {
            language: localStorage.getItem('ita-game-language') || 'pt-BR',
            volume: localStorage.getItem('ita-game-volume') || 100,
            fullscreen: localStorage.getItem('ita-game-fullscreen') === 'true',
            graphics: localStorage.getItem('ita-game-graphics') || 'medium'
        };
    }

    getWorldState() {
        // Get world/level state
        return {
            currentLevel: 1,
            unlockedAreas: ['ita-campus'],
            gameTime: Date.now() / 1000
        };
    }

    getCameraState() {
        // Get camera position and settings
        return {
            x: 0,
            y: 0,
            zoom: 1
        };
    }

    getHUDState() {
        // Get HUD visibility and settings
        return {
            showMinimap: true,
            showHealth: true,
            showEnergy: true,
            showInventory: true
        };
    }

    getMinimapState() {
        // Get minimap settings
        return {
            size: 150,
            zoom: 1,
            position: 'top-right'
        };
    }

    getSessionData() {
        // Get current session data
        return {
            sessionId: window.itaGameAPI?.getSessionId() || 'unknown',
            startTime: Date.now(),
            totalPlayTime: 0,
            actions: 0
        };
    }

    getAnalyticsData() {
        // Get analytics data
        return {
            events: [],
            metrics: {
                fps: 60,
                memory: 0,
                loadTime: 0
            }
        };
    }

    getDebugData() {
        // Get debug information
        return {
            version: this.config.version,
            buildDate: '2024-12-01',
            platform: navigator.platform,
            userAgent: navigator.userAgent
        };
    }

    getCompletedQuestsCount() {
        // Count completed quests
        return 0; // This would be dynamic
    }

    async cleanupOldSaves() {
        try {
            const saves = Array.from(this.saves.values());

            // Cleanup old auto-saves
            const autoSaves = saves.filter(s => s.type === 'auto');
            if (autoSaves.length > this.config.maxAutoSaves) {
                autoSaves
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                    .slice(0, -this.config.maxAutoSaves)
                    .forEach(save => this.deleteFromLocal(save.id));
            }

            // Cleanup old manual saves
            const manualSaves = saves.filter(s => s.type === 'manual');
            if (manualSaves.length > this.config.maxManualSaves) {
                manualSaves
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                    .slice(0, -this.config.maxManualSaves)
                    .forEach(save => this.deleteFromLocal(save.id));
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    getMostRecentSave() {
        const saves = Array.from(this.saves.values());
        return saves.length > 0 ? saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] : null;
    }

    validateSaveVersion(saveData) {
        return saveData.meta.version === this.config.version;
    }

    async migrateSave(saveData) {
        // Handle save migration between versions
        window.gameTheme?.showNotification('Migrando save para nova versão...', 'info');

        // Migration logic would go here
        return saveData;
    }

    applyGameSettings(settings) {
        Object.entries(settings).forEach(([key, value]) => {
            localStorage.setItem(`ita-game-${key}`, value);
        });
    }

    applyWorldState(worldState) {
        // Apply world state to game
        console.log('Applying world state:', worldState);
    }

    applyCameraState(cameraState) {
        // Apply camera state
        console.log('Applying camera state:', cameraState);
    }

    // UI MANAGEMENT
    createSaveListUI() {
        const saves = Array.from(this.saves.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return saves.map(save => `
            <div class="save-item" data-save-id="${save.id}">
                <div class="save-screenshot">
                    ${save.screenshot ?
                        `<img src="${save.screenshot}" alt="Screenshot">` :
                        '<div class="no-screenshot">📷</div>'
                    }
                </div>
                <div class="save-info">
                    <div class="save-name">${save.name}</div>
                    <div class="save-meta">
                        <span class="save-date">${new Date(save.date).toLocaleString()}</span>
                        <span class="save-character">${save.character.name}</span>
                        <span class="save-level">Nível ${save.character.level}</span>
                    </div>
                    <div class="save-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${save.progress}%"></div>
                        </div>
                        <span class="progress-text">${save.progress}%</span>
                    </div>
                </div>
                <div class="save-actions">
                    <button class="btn-load" onclick="itaSaveSystem.load('${save.id}')">Carregar</button>
                    <button class="btn-delete" onclick="itaSaveSystem.confirmDelete('${save.id}')">Excluir</button>
                </div>
            </div>
        `).join('');
    }

    updateSaveUI() {
        const saveListElement = document.getElementById('save-list');
        if (saveListElement) {
            saveListElement.innerHTML = this.createSaveListUI();
        }

        // Update current save indicator
        const currentSaveElement = document.getElementById('current-save');
        if (currentSaveElement && this.currentSaveId) {
            const currentSave = this.saves.get(this.currentSaveId);
            if (currentSave) {
                currentSaveElement.textContent = `Save: ${currentSave.name}`;
            }
        }
    }

    // EVENT LISTENERS
    setupEventListeners() {
        // Listen for game state changes
        if (window.gameTheme) {
            window.gameTheme.subscribe((state) => {
                this.isDirty = true;
            });
        }

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Save when page becomes hidden
                if (this.isDirty) {
                    this.save('auto');
                }
            }
        });

        // Listen for page unload
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                e.returnValue = '';
                this.save('auto');
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        if (!e.shiftKey) {
                            e.preventDefault();
                            this.save('manual');
                        }
                        break;
                    case 'o':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.showLoadDialog();
                        }
                        break;
                }
            } else if (e.key === 'F5') {
                e.preventDefault();
                this.showSaveDialog();
            }
        });
    }

    // DIALOGS
    showSaveDialog() {
        const dialogHTML = `
            <div class="save-dialog">
                <div class="dialog-header">
                    <h3>Salvar Jogo</h3>
                    <button class="close-btn" onclick="itaSaveSystem.closeDialog()">&times;</button>
                </div>
                <div class="dialog-body">
                    <div class="form-group">
                        <label>Nome do Save:</label>
                        <input type="text" id="save-name" placeholder="Digite um nome..." maxlength="50">
                    </div>
                    <div class="form-group">
                        <label>Slot:</label>
                        <select id="save-slot">
                            <option value="manual1">Manual 1</option>
                            <option value="manual2">Manual 2</option>
                            <option value="manual3">Manual 3</option>
                        </select>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="btn-secondary" onclick="itaSaveSystem.closeDialog()">Cancelar</button>
                    <button class="btn-primary" onclick="itaSaveSystem.confirmSave()">Salvar</button>
                </div>
            </div>
        `;

        this.showDialog(dialogHTML);
    }

    showLoadDialog() {
        const savesHTML = this.createSaveListUI();

        const dialogHTML = `
            <div class="load-dialog">
                <div class="dialog-header">
                    <h3>Carregar Jogo</h3>
                    <button class="close-btn" onclick="itaSaveSystem.closeDialog()">&times;</button>
                </div>
                <div class="dialog-body">
                    <div class="save-list" id="load-save-list">
                        ${savesHTML}
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="btn-secondary" onclick="itaSaveSystem.closeDialog()">Cancelar</button>
                </div>
            </div>
        `;

        this.showDialog(dialogHTML);
    }

    showDialog(content) {
        // Create dialog overlay
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = content;

        document.body.appendChild(overlay);

        // Add fade-in animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
    }

    closeDialog() {
        const overlay = document.querySelector('.dialog-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    async confirmSave() {
        const name = document.getElementById('save-name')?.value;
        const slot = document.getElementById('save-slot')?.value;

        try {
            await this.save(slot, name);
            this.closeDialog();
        } catch (error) {
            console.error('Save confirmation failed:', error);
        }
    }

    confirmDelete(saveId) {
        const save = this.saves.get(saveId);
        if (!save) return;

        if (confirm(`Tem certeza que deseja excluir "${save.name}"?`)) {
            this.delete(saveId);
        }
    }

    // ANALYTICS
    trackSaveEvent(saveData) {
        if (window.itaGameAPI) {
            window.itaGameAPI.trackEvent('game_save', {
                saveId: saveData.meta.id,
                saveType: saveData.meta.type,
                playTime: saveData.meta.playTime,
                progress: saveData.meta.progress
            });
        }
    }

    trackLoadEvent(saveData) {
        if (window.itaGameAPI) {
            window.itaGameAPI.trackEvent('game_load', {
                saveId: saveData.meta.id,
                saveVersion: saveData.meta.version,
                timeSinceSave: Date.now() - saveData.meta.timestamp
            });
        }
    }

    // EXPORT/IMPORT
    async exportSave(saveId) {
        try {
            const saveData = await this.loadFromLocal(saveId);
            if (!saveData) {
                throw new Error('Save not found');
            }

            const exportData = {
                ...saveData,
                exportedAt: Date.now(),
                exportedBy: 'ENEM RP Game Save System'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${saveData.meta.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            window.gameTheme?.showNotification('Save exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            window.gameTheme?.showNotification('Falha ao exportar save!', 'error');
        }
    }

    async importSave(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            // Validate import data
            if (!importData.game || !importData.meta) {
                throw new Error('Invalid save file');
            }

            // Generate new ID and metadata
            importData.meta.id = this.generateSaveId();
            importData.meta.name = `${importData.meta.name} (Importado)`;
            importData.meta.importedAt = Date.now();

            // Save the imported data
            await this.saveToLocal(importData);

            window.gameTheme?.showNotification('Save importado com sucesso!', 'success');
            return importData.meta.id;
        } catch (error) {
            console.error('Import failed:', error);
            window.gameTheme?.showNotification('Falha ao importar save!', 'error');
            throw error;
        }
    }

    // MARK DIRTY
    markDirty() {
        this.isDirty = true;
    }

    // CLEANUP
    destroy() {
        this.stopAutoSave();
        this.saves.clear();
    }
}

// Cloud Provider Base Class
class CloudProvider {
    constructor() {
        this.isAuthenticated = false;
    }

    async authenticate() {
        throw new Error('authenticate() must be implemented');
    }

    async save(saveData) {
        throw new Error('save() must be implemented');
    }

    async load(saveId) {
        throw new Error('load() must be implemented');
    }

    async listSaves() {
        throw new Error('listSaves() must be implemented');
    }

    async delete(saveId) {
        throw new Error('delete() must be implemented');
    }
}

// Google Drive Provider (Mock Implementation)
class GoogleDriveProvider extends CloudProvider {
    constructor() {
        super();
        this.apiKey = null;
        this.clientId = null;
    }

    async authenticate() {
        // Mock Google Drive authentication
        // In real implementation, use Google Drive API
        this.isAuthenticated = true;
        return true;
    }

    async save(saveData) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        // Mock save to Google Drive
        console.log('Saving to Google Drive:', saveData.meta.id);
        return { id: saveData.meta.id, provider: 'google-drive' };
    }

    async load(saveId) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        // Mock load from Google Drive
        console.log('Loading from Google Drive:', saveId);
        return null;
    }

    async listSaves() {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        // Mock list from Google Drive
        return [];
    }

    async delete(saveId) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        // Mock delete from Google Drive
        console.log('Deleting from Google Drive:', saveId);
        return true;
    }
}

// Dropbox Provider (Mock Implementation)
class DropboxProvider extends CloudProvider {
    async authenticate() {
        // Mock Dropbox authentication
        this.isAuthenticated = true;
        return true;
    }

    async save(saveData) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        console.log('Saving to Dropbox:', saveData.meta.id);
        return { id: saveData.meta.id, provider: 'dropbox' };
    }

    async load(saveId) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        console.log('Loading from Dropbox:', saveId);
        return null;
    }

    async listSaves() {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        return [];
    }

    async delete(saveId) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        console.log('Deleting from Dropbox:', saveId);
        return true;
    }
}

// OneDrive Provider (Mock Implementation)
class OneDriveProvider extends CloudProvider {
    async authenticate() {
        // Mock OneDrive authentication
        this.isAuthenticated = true;
        return true;
    }

    async save(saveData) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        console.log('Saving to OneDrive:', saveData.meta.id);
        return { id: saveData.meta.id, provider: 'onedrive' };
    }

    async load(saveId) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        console.log('Loading from OneDrive:', saveId);
        return null;
    }

    async listSaves() {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        return [];
    }

    async delete(saveId) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        console.log('Deleting from OneDrive:', saveId);
        return true;
    }
}

// CSS for save system dialogs
const saveSystemCSS = `
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.dialog-overlay.show {
    opacity: 1;
}

.save-dialog, .load-dialog {
    background: var(--ita-branco);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    width: 90%;
}

.dialog-header {
    background: linear-gradient(135deg, var(--ita-vermelho), var(--ita-vermelho-escuro));
    color: var(--ita-branco);
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dialog-header h3 {
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 20px;
}

.close-btn {
    background: none;
    border: none;
    color: var(--ita-branco);
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
}

.close-btn:hover {
    background: rgba(255,255,255,0.2);
}

.dialog-body {
    padding: 30px;
    max-height: 60vh;
    overflow-y: auto;
}

.dialog-footer {
    background: var(--ita-cinza-claro);
    padding: 20px 30px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #ddd;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font: bold 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    margin-bottom: 8px;
}

.form-group input, .form-group select {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font: normal 14px var(--fonte-corpo);
    transition: border-color 0.3s ease;
}

.form-group input:focus, .form-group select:focus {
    outline: none;
    border-color: var(--ita-vermelho);
}

.save-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.save-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: var(--ita-branco);
    transition: all 0.3s ease;
}

.save-item:hover {
    border-color: var(--ita-vermelho);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.save-screenshot {
    width: 80px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--ita-cinza-claro);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.save-screenshot img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-screenshot {
    font-size: 24px;
    color: #999;
}

.save-info {
    flex: 1;
}

.save-name {
    font: bold 16px var(--fonte-corpo);
    color: var(--ita-azul-escuro);
    margin-bottom: 5px;
}

.save-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
    font: normal 12px var(--fonte-corpo);
    color: #666;
}

.save-progress {
    display: flex;
    align-items: center;
    gap: 10px;
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: #ddd;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--game-vida);
    transition: width 0.3s ease;
}

.progress-text {
    font: bold 12px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    min-width: 35px;
}

.save-actions {
    display: flex;
    gap: 10px;
}

.btn-load, .btn-delete {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font: bold 12px var(--fonte-corpo);
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-load {
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
}

.btn-load:hover {
    background: var(--ita-vermelho);
}

.btn-delete {
    background: #dc3545;
    color: var(--ita-branco);
}

.btn-delete:hover {
    background: #c82333;
}

.btn-primary, .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font: bold 14px var(--fonte-corpo);
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
}

.btn-primary:hover {
    background: var(--ita-vermelho);
}

.btn-secondary {
    background: var(--ita-cinza-medio);
    color: var(--ita-cinza-escuro);
}

.btn-secondary:hover {
    background: #ccc;
}
`;

// Add CSS to document
const styleElement = document.createElement('style');
styleElement.textContent = saveSystemCSS;
document.head.appendChild(styleElement);

// Initialize save system
document.addEventListener('DOMContentLoaded', () => {
    window.itaSaveSystem = new ENEMSaveSystem();
});

// Export for external use
window.ENEMSaveSystem = ENEMSaveSystem;