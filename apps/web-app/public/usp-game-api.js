// ENEM RP Game API Integration Layer
// Handles all backend communication and data synchronization

class ENEMGameAPI {
    constructor(config = {}) {
        this.config = {
            baseURL: config.baseURL || 'https://api.ita-rp-game.com',
            version: config.version || 'v1',
            timeout: config.timeout || 10000,
            retryAttempts: config.retryAttempts || 3,
            enableCache: config.enableCache !== false,
            ...config
        };

        this.cache = new Map();
        this.endpoints = this.setupEndpoints();
        this.interceptors = {
            request: [],
            response: []
        };

        this.setupEventListeners();
    }

    setupEndpoints() {
        return {
            // Authentication
            auth: {
                login: '/auth/login',
                register: '/auth/register',
                refresh: '/auth/refresh',
                logout: '/auth/logout',
                verify: '/auth/verify',
                forgot: '/auth/forgot-password',
                reset: '/auth/reset-password'
            },

            // User Management
            users: {
                profile: '/users/profile',
                settings: '/users/settings',
                stats: '/users/stats',
                inventory: '/users/inventory',
                quests: '/users/quests',
                friends: '/users/friends',
                achievements: '/users/achievements',
                save: '/users/save',
                load: '/users/load'
            },

            // Game Data
            game: {
                state: '/game/state',
                world: '/game/world',
                npcs: '/game/npcs',
                items: '/game/items',
                quests: '/game/quests',
                locations: '/game/locations',
                events: '/game/events',
                leaderboard: '/game/leaderboard'
            },

            // Social Features
            social: {
                chat: '/social/chat',
                guilds: '/social/guilds',
                marketplace: '/social/marketplace',
                forums: '/social/forums',
                events: '/social/events'
            },

            // Server Management
            server: {
                status: '/server/status',
                news: '/server/news',
                announcements: '/server/announcements',
                maintenance: '/server/maintenance'
            },

            // Analytics
            analytics: {
                events: '/analytics/events',
                metrics: '/analytics/metrics',
                performance: '/analytics/performance'
            }
        };
    }

    setupEventListeners() {
        // Connection status monitoring
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });

        // Visibility change for pause/resume
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseBackgroundTasks();
            } else {
                this.resumeBackgroundTasks();
            }
        });
    }

    // HTTP Client with interceptors
    async request(endpoint, options = {}) {
        const url = `${this.config.baseURL}/api${this.config.version}${endpoint}`;

        // Apply request interceptors
        let requestConfig = { ...options };
        for (const interceptor of this.interceptors.request) {
            requestConfig = interceptor(requestConfig);
        }

        // Cache check
        if (this.config.enableCache && requestConfig.method === 'GET') {
            const cached = this.cache.get(url);
            if (cached && !this.isCacheExpired(cached)) {
                return cached.data;
            }
        }

        try {
            const response = await this.fetchWithRetry(url, requestConfig);

            // Apply response interceptors
            let processedResponse = response;
            for (const interceptor of this.interceptors.response) {
                processedResponse = interceptor(processedResponse);
            }

            // Cache successful GET requests
            if (this.config.enableCache && requestConfig.method === 'GET') {
                this.cache.set(url, {
                    data: processedResponse,
                    timestamp: Date.now(),
                    ttl: this.getCacheTTL(endpoint)
                });
            }

            return processedResponse;
        } catch (error) {
            console.error(`API Error for ${endpoint}:`, error);
            throw error;
        }
    }

    async fetchWithRetry(url, options, attempt = 1) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.getAuthHeader(),
                    'X-Client-Version': this.config.version,
                    ...options.headers
                },
                signal: AbortSignal.timeout(this.config.timeout),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                status: response.status,
                data,
                headers: response.headers,
                url: response.url
            };
        } catch (error) {
            if (attempt < this.config.retryAttempts && this.shouldRetry(error)) {
                console.warn(`Retry attempt ${attempt + 1} for ${url}`);
                await this.delay(1000 * attempt); // Exponential backoff
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            throw error;
        }
    }

    // Authentication Methods
    async login(credentials) {
        const response = await this.request(this.endpoints.auth.login, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.data.token) {
            this.setAuthToken(response.data.token);
            this.setRefreshToken(response.data.refreshToken);
        }

        return response.data;
    }

    async register(userData) {
        const response = await this.request(this.endpoints.auth.register, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        return response.data;
    }

    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await this.request(this.endpoints.auth.refresh, {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });

        if (response.data.token) {
            this.setAuthToken(response.data.token);
        }

        return response.data;
    }

    async logout() {
        try {
            await this.request(this.endpoints.auth.logout, { method: 'POST' });
        } finally {
            this.clearAuthTokens();
        }
    }

    // User Profile Methods
    async getProfile() {
        const response = await this.request(this.endpoints.users.profile);
        return response.data;
    }

    async updateProfile(profileData) {
        const response = await this.request(this.endpoints.users.profile, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        return response.data;
    }

    async getInventory() {
        const response = await this.request(this.endpoints.users.inventory);
        return response.data;
    }

    async updateInventory(inventoryData) {
        const response = await this.request(this.endpoints.users.inventory, {
            method: 'PUT',
            body: JSON.stringify(inventoryData)
        });
        return response.data;
    }

    async getQuests() {
        const response = await this.request(this.endpoints.users.quests);
        return response.data;
    }

    async updateQuestProgress(questId, progress) {
        const response = await this.request(`${this.endpoints.users.quests}/${questId}`, {
            method: 'PUT',
            body: JSON.stringify({ progress })
        });
        return response.data;
    }

    // Game State Methods
    async saveGameState(gameState) {
        const response = await this.request(this.endpoints.users.save, {
            method: 'POST',
            body: JSON.stringify({ state: gameState, timestamp: Date.now() })
        });
        return response.data;
    }

    async loadGameState(saveId) {
        const endpoint = saveId ?
            `${this.endpoints.users.load}/${saveId}` :
            this.endpoints.users.load;

        const response = await this.request(endpoint);
        return response.data;
    }

    async getGameWorld() {
        const response = await this.request(this.endpoints.game.world);
        return response.data;
    }

    async getNPCs() {
        const response = await this.request(this.endpoints.game.npcs);
        return response.data;
    }

    async getItems() {
        const response = await this.request(this.endpoints.game.items);
        return response.data;
    }

    // Social Features
    async getChatMessages(channel = 'global', limit = 50) {
        const response = await this.request(`${this.endpoints.social.chat}/${channel}?limit=${limit}`);
        return response.data;
    }

    async sendChatMessage(channel, message) {
        const response = await this.request(this.endpoints.social.chat, {
            method: 'POST',
            body: JSON.stringify({ channel, message })
        });
        return response.data;
    }

    async getFriends() {
        const response = await this.request(this.endpoints.users.friends);
        return response.data;
    }

    async addFriend(userId) {
        const response = await this.request(this.endpoints.users.friends, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
        return response.data;
    }

    // WebSocket Integration for Real-time Features
    connectWebSocket(token) {
        if (!token) {
            token = this.getAuthToken();
        }

        const wsUrl = this.config.baseURL.replace('http', 'ws') + `/ws?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.startHeartbeat();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.stopHeartbeat();
            this.attemptReconnection();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'chat_message':
                window.gameTheme?.addChatMessage(data.sender, data.message, 'friend');
                break;
            case 'friend_online':
                window.gameTheme?.showNotification(`${data.friend} está online!`, 'success');
                break;
            case 'friend_offline':
                window.gameTheme?.showNotification(`${data.friend} ficou offline`, 'info');
                break;
            case 'quest_update':
                window.gameTheme?.updateQuestsDisplay();
                break;
            case 'server_announcement':
                window.gameTheme?.showNotification(data.message, 'warning', 10000);
                break;
            case 'game_event':
                this.handleGameEvent(data);
                break;
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 30000);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    attemptReconnection() {
        let attempts = 0;
        const maxAttempts = 5;

        const reconnect = () => {
            if (attempts < maxAttempts) {
                attempts++;
                console.log(`Attempting reconnection ${attempts}/${maxAttempts}`);
                setTimeout(() => {
                    this.connectWebSocket();
                }, Math.pow(2, attempts) * 1000); // Exponential backoff
            }
        };

        reconnect();
    }

    // Analytics and Event Tracking
    async trackEvent(eventName, properties = {}) {
        const response = await this.request(this.endpoints.analytics.events, {
            method: 'POST',
            body: JSON.stringify({
                eventName,
                properties,
                timestamp: Date.now(),
                sessionId: this.getSessionId(),
                userId: this.getUserId()
            })
        });
        return response.data;
    }

    async trackPerformance(metrics) {
        const response = await this.request(this.endpoints.analytics.performance, {
            method: 'POST',
            body: JSON.stringify({
                metrics,
                timestamp: Date.now(),
                sessionId: this.getSessionId()
            })
        });
        return response.data;
    }

    // Utility Methods
    getAuthHeader() {
        const token = this.getAuthToken();
        return token ? `Bearer ${token}` : '';
    }

    getAuthToken() {
        return localStorage.getItem('ita-game-auth-token');
    }

    setAuthToken(token) {
        localStorage.setItem('ita-game-auth-token', token);
    }

    getRefreshToken() {
        return localStorage.getItem('ita-game-refresh-token');
    }

    setRefreshToken(token) {
        localStorage.setItem('ita-game-refresh-token', token);
    }

    clearAuthTokens() {
        localStorage.removeItem('ita-game-auth-token');
        localStorage.removeItem('ita-game-refresh-token');
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('ita-game-session-id');
        if (!sessionId) {
            sessionId = this.generateUUID();
            sessionStorage.setItem('ita-game-session-id', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        const token = this.getAuthToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.userId;
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    shouldRetry(error) {
        return error.name === 'TypeError' ||
               error.message.includes('network') ||
               error.message.includes('timeout');
    }

    isCacheExpired(cachedItem) {
        return Date.now() - cachedItem.timestamp > cachedItem.ttl;
    }

    getCacheTTL(endpoint) {
        // Different TTLs for different endpoints
        if (endpoint.includes('/game/world')) return 300000; // 5 minutes
        if (endpoint.includes('/users/profile')) return 60000; // 1 minute
        if (endpoint.includes('/social/chat')) return 5000; // 5 seconds
        return 30000; // 30 seconds default
    }

    handleConnectionChange(isOnline) {
        if (isOnline) {
            window.gameTheme?.showNotification('Conexão restaurada!', 'success');
            this.connectWebSocket();
            this.syncPendingData();
        } else {
            window.gameTheme?.showNotification('Conexão perdida. Modo offline ativado.', 'warning');
        }
    }

    syncPendingData() {
        // Sync any pending data when connection is restored
        const pendingData = localStorage.getItem('ita-game-pending-sync');
        if (pendingData) {
            try {
                const data = JSON.parse(pendingData);
                data.forEach(async (item) => {
                    try {
                        await this.request(item.endpoint, item.options);
                    } catch (error) {
                        console.error('Failed to sync pending data:', error);
                    }
                });
                localStorage.removeItem('ita-game-pending-sync');
            } catch (error) {
                console.error('Failed to parse pending sync data:', error);
            }
        }
    }

    pauseBackgroundTasks() {
        // Pause non-essential background tasks when tab is hidden
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }

    resumeBackgroundTasks() {
        // Resume background tasks when tab becomes visible
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.startHeartbeat();
        }
    }

    handleGameEvent(eventData) {
        // Handle game-specific events from server
        switch (eventData.eventType) {
            case 'world_event':
                window.gameTheme?.showNotification(`Evento mundial: ${eventData.name}`, 'info');
                break;
            case 'special_quest':
                window.gameTheme?.showNotification(`Missão especial disponível: ${eventData.title}`, 'success');
                break;
            case 'server_restart':
                window.gameTheme?.showNotification('Servidor será reiniciado em 5 minutos', 'warning', 300000);
                break;
        }
    }

    // Cache management
    clearCache() {
        this.cache.clear();
    }

    clearExpiredCache() {
        for (const [key, value] of this.cache.entries()) {
            if (this.isCacheExpired(value)) {
                this.cache.delete(key);
            }
        }
    }

    // Request/Response interceptors
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }

    // Default interceptors
    setupDefaultInterceptors() {
        // Request interceptor to add timestamp
        this.addRequestInterceptor((config) => {
            config.headers = {
                ...config.headers,
                'X-Request-Time': Date.now()
            };
            return config;
        });

        // Response interceptor for error handling
        this.addResponseInterceptor((response) => {
            if (response.status === 401) {
                // Handle unauthorized - try to refresh token
                this.refreshToken().catch(() => {
                    window.gameTheme?.showNotification('Sessão expirada. Faça login novamente.', 'error');
                    this.clearAuthTokens();
                    window.location.reload();
                });
            }
            return response;
        });
    }
}

// Auto-setup default interceptors
const api = new ENEMGameAPI();
api.setupDefaultInterceptors();

// Export for global use
window.ENEMGameAPI = ENEMGameAPI;
window.itaGameAPI = api;