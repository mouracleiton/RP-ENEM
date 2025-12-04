// ENEM RP Game Admin Panel
// Comprehensive admin interface for game configuration and management

class ENEMAdminPanel {
    constructor(config = {}) {
        this.config = {
            requiredRole: config.requiredRole || 'admin',
            enableDebugMode: config.enableDebugMode !== false,
            enableAnalytics: config.enableAnalytics !== false,
            apiEndpoint: config.apiEndpoint || '/api/admin',
            ...config
        };

        this.isAuthenticated = false;
        this.currentSection = 'dashboard';
        this.widgets = new Map();
        this.dataCache = new Map();

        this.init();
    }

    init() {
        this.createAdminPanel();
        this.setupAuthentication();
        this.loadWidgets();
        this.setupEventListeners();
        this.startDataRefresh();
    }

    createAdminPanel() {
        const panelHTML = `
            <div id="ita-admin-panel" class="admin-panel hidden">
                <div class="admin-overlay" onclick="itaAdminPanel.closePanel()"></div>
                <div class="admin-container">
                    <!-- Header -->
                    <div class="admin-header">
                        <div class="admin-logo">
                            <span class="logo-icon">⚙️</span>
                            <span class="logo-text">ENEM RP Admin</span>
                        </div>
                        <div class="admin-user">
                            <span class="user-name" id="admin-username">Admin</span>
                            <button class="logout-btn" onclick="itaAdminPanel.logout()">Sair</button>
                        </div>
                    </div>

                    <div class="admin-content">
                        <!-- Sidebar -->
                        <div class="admin-sidebar">
                            <nav class="admin-nav">
                                <button class="nav-item active" data-section="dashboard">
                                    <span class="nav-icon">📊</span>
                                    <span class="nav-text">Dashboard</span>
                                </button>
                                <button class="nav-item" data-section="players">
                                    <span class="nav-icon">👥</span>
                                    <span class="nav-text">Jogadores</span>
                                </button>
                                <button class="nav-item" data-section="game-world">
                                    <span class="nav-icon">🌍</span>
                                    <span class="nav-text">Mundo do Jogo</span>
                                </button>
                                <button class="nav-item" data-section="quests">
                                    <span class="nav-icon">📋</span>
                                    <span class="nav-text">Missões</span>
                                </button>
                                <button class="nav-item" data-section="items">
                                    <span class="nav-icon">🎒</span>
                                    <span class="nav-text">Itens</span>
                                </button>
                                <button class="nav-item" data-section="economy">
                                    <span class="nav-icon">💰</span>
                                    <span class="nav-text">Economia</span>
                                </button>
                                <button class="nav-item" data-section="events">
                                    <span class="nav-icon">🎉</span>
                                    <span class="nav-text">Eventos</span>
                                </button>
                                <button class="nav-item" data-section="analytics">
                                    <span class="nav-icon">📈</span>
                                    <span class="nav-text">Análises</span>
                                </button>
                                <button class="nav-item" data-section="settings">
                                    <span class="nav-icon">⚙️</span>
                                    <span class="nav-text">Configurações</span>
                                </button>
                                <button class="nav-item" data-section="logs">
                                    <span class="nav-icon">📝</span>
                                    <span class="nav-text">Logs</span>
                                </button>
                            </nav>

                            <div class="admin-tools">
                                <button class="tool-btn" onclick="itaAdminPanel.quickAction('backup')">
                                    <span>💾</span>
                                    <span>Backup</span>
                                </button>
                                <button class="tool-btn" onclick="itaAdminPanel.quickAction('cache')">
                                    <span>🗑️</span>
                                    <span>Limpar Cache</span>
                                </button>
                                <button class="tool-btn" onclick="itaAdminPanel.quickAction('restart')">
                                    <span>🔄</span>
                                    <span>Reiniciar</span>
                                </button>
                            </div>
                        </div>

                        <!-- Main Content -->
                        <div class="admin-main">
                            <div class="admin-section" id="section-dashboard">
                                <div class="section-header">
                                    <h2>Dashboard</h2>
                                    <div class="header-actions">
                                        <button class="btn-refresh" onclick="itaAdminPanel.refreshData()">Atualizar</button>
                                        <span class="last-update" id="last-update">Atualizado agora</span>
                                    </div>
                                </div>

                                <div class="dashboard-grid">
                                    <!-- Server Status Widget -->
                                    <div class="widget server-status">
                                        <div class="widget-header">
                                            <h3>Status do Servidor</h3>
                                            <div class="status-indicator online"></div>
                                        </div>
                                        <div class="widget-content">
                                            <div class="status-metrics">
                                                <div class="metric">
                                                    <span class="metric-label">Online</span>
                                                    <span class="metric-value" id="server-status">Online</span>
                                                </div>
                                                <div class="metric">
                                                    <span class="metric-label">Uptime</span>
                                                    <span class="metric-value" id="server-uptime">99.9%</span>
                                                </div>
                                                <div class="metric">
                                                    <span class="metric-label">Latência</span>
                                                    <span class="metric-value" id="server-latency">12ms</span>
                                                </div>
                                                <div class="metric">
                                                    <span class="metric-label">CPU</span>
                                                    <span class="metric-value" id="server-cpu">45%</span>
                                                </div>
                                                <div class="metric">
                                                    <span class="metric-label">Memória</span>
                                                    <span class="metric-value" id="server-memory">2.1GB</span>
                                                </div>
                                                <div class="metric">
                                                    <span class="metric-label">Players Online</span>
                                                    <span class="metric-value" id="players-online">1,247</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Recent Activity Widget -->
                                    <div class="widget recent-activity">
                                        <div class="widget-header">
                                            <h3>Atividade Recente</h3>
                                        </div>
                                        <div class="widget-content">
                                            <div class="activity-list" id="activity-list">
                                                <div class="activity-item">
                                                    <span class="activity-icon">👤</span>
                                                    <span class="activity-text">Novo jogador registado: Player123</span>
                                                    <span class="activity-time">há 2 min</span>
                                                </div>
                                                <div class="activity-item">
                                                    <span class="activity-icon">🏆</span>
                                                    <span class="activity-text">Player456 completou missão "Primeiro Dia"</span>
                                                    <span class="activity-time">há 5 min</span>
                                                </div>
                                                <div class="activity-item">
                                                    <span class="activity-icon">💰</span>
                                                    <span class="activity-text">Transação no marketplace: Item raro vendido</span>
                                                    <span class="activity-time">há 12 min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Quick Stats Widget -->
                                    <div class="widget quick-stats">
                                        <div class="widget-header">
                                            <h3>Estatísticas Rápidas</h3>
                                        </div>
                                        <div class="widget-content">
                                            <div class="stat-row">
                                                <div class="stat-item">
                                                    <span class="stat-number">15,234</span>
                                                    <span class="stat-label">Total de Jogadores</span>
                                                </div>
                                                <div class="stat-item">
                                                    <span class="stat-number">3,456</span>
                                                    <span class="stat-label">Jogadores Ativos Hoje</span>
                                                </div>
                                            </div>
                                            <div class="stat-row">
                                                <div class="stat-item">
                                                    <span class="stat-number">892</span>
                                                    <span class="stat-label">Missões Completadas Hoje</span>
                                                </div>
                                                <div class="stat-item">
                                                    <span class="stat-number">R$ 45,678</span>
                                                    <span class="stat-label">Volume de Transações</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- System Alerts Widget -->
                                    <div class="widget system-alerts">
                                        <div class="widget-header">
                                            <h3>Alertas do Sistema</h3>
                                        </div>
                                        <div class="widget-content">
                                            <div class="alerts-list">
                                                <div class="alert-item success">
                                                    <span class="alert-icon">✅</span>
                                                    <span class="alert-text">Backup automático concluído com sucesso</span>
                                                </div>
                                                <div class="alert-item warning">
                                                    <span class="alert-icon">⚠️</span>
                                                    <span class="alert-text">Alta taxa de erros na API de inventário</span>
                                                </div>
                                                <div class="alert-item info">
                                                    <span class="alert-icon">ℹ️</span>
                                                    <span class="alert-text">Novo evento "Semana de Provas" iniciado</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="admin-section hidden" id="section-players">
                                <div class="section-header">
                                    <h2>Gerenciamento de Jogadores</h2>
                                    <div class="header-actions">
                                        <button class="btn-primary" onclick="itaAdminPanel.showPlayerModal()">Novo Jogador</button>
                                        <button class="btn-secondary" onclick="itaAdminPanel.exportPlayers()">Exportar</button>
                                    </div>
                                </div>

                                <div class="players-management">
                                    <!-- Search and Filters -->
                                    <div class="search-filters">
                                        <div class="search-box">
                                            <input type="text" id="player-search" placeholder="Buscar jogador..." />
                                            <button class="btn-search" onclick="itaAdminPanel.searchPlayers()">🔍</button>
                                        </div>
                                        <div class="filters">
                                            <select id="player-status-filter">
                                                <option value="">Todos os Status</option>
                                                <option value="online">Online</option>
                                                <option value="offline">Offline</option>
                                                <option value="banned">Banido</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <select id="player-level-filter">
                                                <option value="">Todos os Níveis</option>
                                                <option value="1-10">Nível 1-10</option>
                                                <option value="11-25">Nível 11-25</option>
                                                <option value="26-50">Nível 26-50</option>
                                                <option value="50+">Nível 50+</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Players Table -->
                                    <div class="players-table-container">
                                        <table class="players-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Nome</th>
                                                    <th>Nível</th>
                                                    <th>Status</th>
                                                    <th>Curso</th>
                                                    <th>Créditos</th>
                                                    <th>Último Login</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody id="players-table-body">
                                                <tr>
                                                    <td>#1234</td>
                                                    <td>PlayerOne</td>
                                                    <td>25</td>
                                                    <td><span class="status online">Online</span></td>
                                                    <td>Engenharia</td>
                                                    <td>R$ 15,000</td>
                                                    <td>2 min atrás</td>
                                                    <td>
                                                        <button class="action-btn" onclick="itaAdminPanel.editPlayer('1234')">Editar</button>
                                                        <button class="action-btn danger" onclick="itaAdminPanel.banPlayer('1234')">Banir</button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>#1235</td>
                                                    <td>PlayerTwo</td>
                                                    <td>18</td>
                                                    <td><span class="status offline">Offline</span></td>
                                                    <td>Computação</td>
                                                    <td>R$ 8,500</td>
                                                    <td>1 hora atrás</td>
                                                    <td>
                                                        <button class="action-btn" onclick="itaAdminPanel.editPlayer('1235')">Editar</button>
                                                        <button class="action-btn danger" onclick="itaAdminPanel.banPlayer('1235')">Banir</button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <!-- Pagination -->
                                    <div class="pagination">
                                        <button class="page-btn" onclick="itaAdminPanel.previousPage()">Anterior</button>
                                        <span class="page-info">Página 1 de 50</span>
                                        <button class="page-btn" onclick="itaAdminPanel.nextPage()">Próximo</button>
                                    </div>
                                </div>
                            </div>

                            <div class="admin-section hidden" id="section-settings">
                                <div class="section-header">
                                    <h2>Configurações do Sistema</h2>
                                    <div class="header-actions">
                                        <button class="btn-primary" onclick="itaAdminPanel.saveSettings()">Salvar Alterações</button>
                                    <button class="btn-secondary" onclick="itaAdminPanel.resetSettings()">Redefinir</button>
                                    </div>
                                </div>

                                <div class="settings-container">
                                    <div class="settings-tabs">
                                        <button class="settings-tab active" data-tab="general">Geral</button>
                                        <button class="settings-tab" data-tab="game">Jogo</button>
                                        <button class="settings-tab" data-tab="security">Segurança</button>
                                        <button class="settings-tab" data-tab="performance">Performance</button>
                                        <button class="settings-tab" data-tab="notifications">Notificações</button>
                                    </div>

                                    <div class="settings-content">
                                        <!-- General Settings -->
                                        <div class="settings-panel active" id="settings-general">
                                            <div class="setting-group">
                                                <h3>Configurações Gerais</h3>
                                                <div class="setting-item">
                                                    <label>Nome do Servidor</label>
                                                    <input type="text" id="server-name" value="ENEM RP Game Server" />
                                                </div>
                                                <div class="setting-item">
                                                    <label>Descrição</label>
                                                    <textarea id="server-description">Servidor oficial do ENEM Role Playing Game</textarea>
                                                </div>
                                                <div class="setting-item">
                                                    <label>Limite de Jogadores</label>
                                                    <input type="number" id="max-players" value="2000" min="10" max="10000" />
                                                </div>
                                                <div class="setting-item">
                                                    <label>Modo de Manutenção</label>
                                                    <label class="switch">
                                                        <input type="checkbox" id="maintenance-mode" />
                                                        <span class="slider"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Game Settings -->
                                        <div class="settings-panel hidden" id="settings-game">
                                            <div class="setting-group">
                                                <h3>Configurações do Jogo</h3>
                                                <div class="setting-item">
                                                    <label>Taxa de Experiência</label>
                                                    <input type="range" id="exp-rate" min="0.5" max="3" step="0.1" value="1" />
                                                    <span class="range-value">1.0x</span>
                                                </div>
                                                <div class="setting-item">
                                                    <label>Dia/Noite Ciclo</label>
                                                    <select id="day-night-cycle">
                                                        <option value="disabled">Desabilitado</option>
                                                        <option value="10min">10 minutos</option>
                                                        <option value="20min">20 minutos</option>
                                                        <option value="30min">30 minutos</option>
                                                        <option value="1hour">1 hora</option>
                                                    </select>
                                                </div>
                                                <div class="setting-item">
                                                    <label>Weather System</label>
                                                    <label class="switch">
                                                        <input type="checkbox" id="weather-system" checked />
                                                        <span class="slider"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Security Settings -->
                                        <div class="settings-panel hidden" id="settings-security">
                                            <div class="setting-group">
                                                <h3>Configurações de Segurança</h3>
                                                <div class="setting-item">
                                                    <label>Autenticação de Dois Fatores</label>
                                                    <label class="switch">
                                                        <input type="checkbox" id="2fa-enabled" />
                                                        <span class="slider"></span>
                                                    </label>
                                                </div>
                                                <div class="setting-item">
                                                    <label>Tentativas de Login Máximas</label>
                                                    <input type="number" id="max-login-attempts" value="5" min="3" max="10" />
                                                </div>
                                                <div class="setting-item">
                                                    <label>Tempo de Ban Automático</label>
                                                    <select id="auto-ban-time">
                                                        <option value="1hour">1 hora</option>
                                                        <option value="24hours">24 horas</option>
                                                        <option value="7days">7 dias</option>
                                                        <option value="30days">30 dias</option>
                                                        <option value="permanent">Permanente</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Performance Settings -->
                                        <div class="settings-panel hidden" id="settings-performance">
                                            <div class="setting-group">
                                                <h3>Configurações de Performance</h3>
                                                <div class="setting-item">
                                                    <label>Auto-save Interval</label>
                                                    <select id="auto-save-interval">
                                                        <option value="5min">5 minutos</option>
                                                        <option value="10min">10 minutos</option>
                                                        <option value="15min">15 minutos</option>
                                                        <option value="30min">30 minutos</option>
                                                    </select>
                                                </div>
                                                <div class="setting-item">
                                                    <label>Log Level</label>
                                                    <select id="log-level">
                                                        <option value="error">Error</option>
                                                        <option value="warn">Warning</option>
                                                        <option value="info">Info</option>
                                                        <option value="debug">Debug</option>
                                                    </select>
                                                </div>
                                                <div class="setting-item">
                                                    <label>Cache TTL</label>
                                                    <input type="number" id="cache-ttl" value="300" min="60" max="3600" />
                                                    <small>segundos</small>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Notification Settings -->
                                        <div class="settings-panel hidden" id="settings-notifications">
                                            <div class="setting-group">
                                                <h3>Configurações de Notificações</h3>
                                                <div class="setting-item">
                                                    <label>Email Notifications</label>
                                                    <label class="switch">
                                                        <input type="checkbox" id="email-notifications" checked />
                                                        <span class="slider"></span>
                                                    </label>
                                                </div>
                                                <div class="setting-item">
                                                    <label>Admin Alert Threshold</label>
                                                    <select id="alert-threshold">
                                                        <option value="critical">Critical</option>
                                                        <option value="warning">Warning</option>
                                                        <option value="info">Info</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
        this.setupSectionNavigation();
        this.setupSettingsTabs();
    }

    // AUTHENTICATION
    setupAuthentication() {
        // Check if user is already authenticated
        const token = localStorage.getItem('ita-admin-token');
        if (token) {
            this.validateToken(token);
        } else {
            this.showLoginDialog();
        }
    }

    showLoginDialog() {
        const loginHTML = `
            <div id="admin-login" class="login-overlay">
                <div class="login-container">
                    <div class="login-header">
                        <h2>🔐 Login Administrador</h2>
                        <p>ENEM RP Game - Painel de Controle</p>
                    </div>
                    <form id="login-form" onsubmit="itaAdminPanel.login(event)">
                        <div class="form-group">
                            <label>Usuário</label>
                            <input type="text" id="login-username" required placeholder="admin" />
                        </div>
                        <div class="form-group">
                            <label>Senha</label>
                            <input type="password" id="login-password" required placeholder="••••••••" />
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="remember-me" />
                                <span class="checkmark"></span>
                                Lembrar de mim
                            </label>
                        </div>
                        <button type="submit" class="login-btn">Entrar</button>
                    </form>
                    <div class="login-footer">
                        <p>Use credenciais de administrador para acessar</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', loginHTML);
    }

    async login(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            // Simulate authentication (in real app, this would be an API call)
            const response = await this.authenticateUser(username, password);

            if (response.success) {
                this.isAuthenticated = true;
                localStorage.setItem('ita-admin-token', response.token);

                if (rememberMe) {
                    localStorage.setItem('ita-admin-remember', 'true');
                }

                document.getElementById('admin-login').remove();
                document.getElementById('ita-admin-panel').classList.remove('hidden');

                window.gameTheme?.showNotification('Login administrador bem-sucedido!', 'success');
            } else {
                throw new Error(response.message || 'Credenciais inválidas');
            }
        } catch (error) {
            alert('Erro no login: ' + error.message);
        }
    }

    async authenticateUser(username, password) {
        // Mock authentication - in real app, this would be a server API call
        if (username === 'admin' && password === 'ita2024') {
            return {
                success: true,
                token: btoa(`${username}:${Date.now()}`),
                user: {
                    id: 1,
                    username: username,
                    role: 'admin',
                    permissions: ['all']
                }
            };
        }

        return { success: false, message: 'Credenciais inválidas' };
    }

    validateToken(token) {
        try {
            const decoded = atob(token);
            const [username, timestamp] = decoded.split(':');

            // Check if token is not too old (24 hours)
            const age = Date.now() - parseInt(timestamp);
            if (age > 24 * 60 * 60 * 1000) {
                this.showLoginDialog();
                return;
            }

            this.isAuthenticated = true;
            document.getElementById('ita-admin-panel').classList.remove('hidden');
        } catch (error) {
            this.showLoginDialog();
        }
    }

    logout() {
        localStorage.removeItem('ita-admin-token');
        localStorage.removeItem('ita-admin-remember');
        this.isAuthenticated = false;
        document.getElementById('ita-admin-panel').classList.add('hidden');

        if (localStorage.getItem('ita-admin-remember')) {
            this.showLoginDialog();
        }

        window.gameTheme?.showNotification('Logout administrador realizado!', 'info');
    }

    // NAVIGATION
    setupSectionNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(sectionId) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });

        // Update sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.toggle('hidden', section.id !== `section-${sectionId}`);
        });

        this.currentSection = sectionId;

        // Load section data
        this.loadSectionData(sectionId);
    }

    setupSettingsTabs() {
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchSettingsTab(tabName);
            });
        });
    }

    switchSettingsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `settings-${tabName}`);
        });
    }

    // DATA LOADING
    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'players':
                this.loadPlayersData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
            default:
                console.log(`Loading data for section: ${sectionId}`);
        }
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        this.updateServerStatus();
        this.loadRecentActivity();
        this.loadQuickStats();
        this.loadSystemAlerts();
    }

    updateServerStatus() {
        // Simulate server metrics
        const metrics = {
            status: 'Online',
            uptime: '99.9%',
            latency: Math.floor(Math.random() * 50) + 10,
            cpu: Math.floor(Math.random() * 60) + 20,
            memory: (Math.random() * 4 + 1).toFixed(1) + 'GB',
            playersOnline: Math.floor(Math.random() * 500) + 1000
        };

        Object.entries(metrics).forEach(([key, value]) => {
            const element = document.getElementById(`server-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            if (element) {
                element.textContent = value;
            }
        });
    }

    loadRecentActivity() {
        const activities = [
            { icon: '👤', text: 'Novo jogador registado: Player789', time: 'há 1 min' },
            { icon: '🏆', text: 'Player456 completou missão "Desafio Final"', time: 'há 3 min' },
            { icon: '💰', text: 'Venda recorde: Espada Lendária por R$ 50.000', time: 'há 5 min' },
            { icon: '🎉', text: 'Evento "Festival de Verão" iniciado', time: 'há 10 min' },
            { icon: '🔧', text: 'Sistema de trade atualizado', time: 'há 15 min' }
        ];

        const activityList = document.getElementById('activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <span class="activity-icon">${activity.icon}</span>
                    <span class="activity-text">${activity.text}</span>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `).join('');
        }
    }

    loadQuickStats() {
        const stats = {
            totalPlayers: 15234,
            activeToday: 3456,
            questsCompleted: 892,
            transactionVolume: 45678
        };

        // Update stats in the DOM
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = stats.totalPlayers.toLocaleString();
            statNumbers[1].textContent = stats.activeToday.toLocaleString();
            statNumbers[2].textContent = stats.questsCompleted.toLocaleString();
            statNumbers[3].textContent = `R$ ${stats.transactionVolume.toLocaleString()}`;
        }
    }

    loadSystemAlerts() {
        const alerts = [
            { type: 'success', icon: '✅', text: 'Backup automático concluído com sucesso' },
            { type: 'warning', icon: '⚠️', text: 'Alta taxa de erros na API de inventário' },
            { type: 'info', icon: 'ℹ️', text: 'Novo evento "Semana de Provas" iniciado' },
            { type: 'error', icon: '❌', text: 'Conexão com banco de dados instável' }
        ];

        const alertsList = document.querySelector('.alerts-list');
        if (alertsList) {
            alertsList.innerHTML = alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                    <span class="alert-icon">${alert.icon}</span>
                    <span class="alert-text">${alert.text}</span>
                </div>
            `).join('');
        }
    }

    loadPlayersData() {
        // Simulate loading players data
        // In real app, this would fetch from API
        console.log('Loading players data...');
    }

    loadAnalyticsData() {
        // Simulate loading analytics data
        console.log('Loading analytics data...');
    }

    loadSettingsData() {
        // Load current settings from storage or API
        console.log('Loading settings data...');
    }

    // DATA REFRESH
    startDataRefresh() {
        setInterval(() => {
            if (this.isAuthenticated) {
                this.refreshData();
            }
        }, 30000); // Refresh every 30 seconds
    }

    refreshData() {
        this.loadSectionData(this.currentSection);

        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) {
            lastUpdate.textContent = `Atualizado ${new Date().toLocaleTimeString()}`;
        }
    }

    // WIDGETS
    loadWidgets() {
        // Initialize admin widgets
        this.widgets.set('server-status', new ServerStatusWidget());
        this.widgets.set('player-analytics', new PlayerAnalyticsWidget());
        this.widgets.set('economy-monitor', new EconomyMonitorWidget());
    }

    // QUICK ACTIONS
    async quickAction(action) {
        switch (action) {
            case 'backup':
                await this.performBackup();
                break;
            case 'cache':
                await this.clearCache();
                break;
            case 'restart':
                await this.restartServer();
                break;
            default:
                console.log(`Quick action: ${action}`);
        }
    }

    async performBackup() {
        try {
            window.gameTheme?.showNotification('Iniciando backup do servidor...', 'info');

            // Simulate backup process
            await new Promise(resolve => setTimeout(resolve, 2000));

            window.gameTheme?.showNotification('Backup concluído com sucesso!', 'success');
        } catch (error) {
            window.gameTheme?.showNotification('Erro no backup!', 'error');
        }
    }

    async clearCache() {
        try {
            window.gameTheme?.showNotification('Limpando cache do servidor...', 'info');

            // Clear localStorage cache
            this.dataCache.clear();

            window.gameTheme?.showNotification('Cache limpo com sucesso!', 'success');
        } catch (error) {
            window.gameTheme?.showNotification('Erro ao limpar cache!', 'error');
        }
    }

    async restartServer() {
        if (confirm('Tem certeza que deseja reiniciar o servidor? Isso irá desconectar todos os jogadores.')) {
            try {
                window.gameTheme?.showNotification('Reiniciando servidor...', 'warning');

                // Simulate server restart
                await new Promise(resolve => setTimeout(resolve, 3000));

                window.gameTheme?.showNotification('Servidor reiniciado com sucesso!', 'success');
            } catch (error) {
                window.gameTheme?.showNotification('Erro ao reiniciar servidor!', 'error');
            }
        }
    }

    // PLAYER MANAGEMENT
    showPlayerModal() {
        window.gameComponents?.openCharacterCreator();
    }

    editPlayer(playerId) {
        window.gameTheme?.showNotification(`Editando jogador ${playerId}`, 'info');
    }

    async banPlayer(playerId) {
        if (confirm('Tem certeza que deseja banir este jogador?')) {
            try {
                window.gameTheme?.showNotification(`Jogador ${playerId} banido!`, 'warning');
            } catch (error) {
                window.gameTheme?.showNotification('Erro ao banir jogador!', 'error');
            }
        }
    }

    searchPlayers() {
        const searchTerm = document.getElementById('player-search')?.value;
        console.log('Searching players:', searchTerm);
    }

    exportPlayers() {
        window.gameTheme?.showNotification('Exportando lista de jogadores...', 'info');
    }

    // SETTINGS MANAGEMENT
    async saveSettings() {
        try {
            window.gameTheme?.showNotification('Salvando configurações...', 'info');

            // Collect all settings from forms
            const settings = this.collectAllSettings();

            // Save to server
            console.log('Saving settings:', settings);

            window.gameTheme?.showNotification('Configurações salvas com sucesso!', 'success');
        } catch (error) {
            window.gameTheme?.showNotification('Erro ao salvar configurações!', 'error');
        }
    }

    resetSettings() {
        if (confirm('Tem certeza que deseja redefinir todas as configurações?')) {
            window.gameTheme?.showNotification('Configurações redefinidas!', 'info');
            this.loadSettingsData();
        }
    }

    collectAllSettings() {
        const settings = {};

        // General settings
        settings.serverName = document.getElementById('server-name')?.value;
        settings.serverDescription = document.getElementById('server-description')?.value;
        settings.maxPlayers = document.getElementById('max-players')?.value;
        settings.maintenanceMode = document.getElementById('maintenance-mode')?.checked;

        // Game settings
        settings.expRate = document.getElementById('exp-rate')?.value;
        settings.dayNightCycle = document.getElementById('day-night-cycle')?.value;
        settings.weatherSystem = document.getElementById('weather-system')?.checked;

        // Security settings
        settings.twoFactorAuth = document.getElementById('2fa-enabled')?.checked;
        settings.maxLoginAttempts = document.getElementById('max-login-attempts')?.value;
        settings.autoBanTime = document.getElementById('auto-ban-time')?.value;

        // Performance settings
        settings.autoSaveInterval = document.getElementById('auto-save-interval')?.value;
        settings.logLevel = document.getElementById('log-level')?.value;
        settings.cacheTTL = document.getElementById('cache-ttl')?.value;

        // Notification settings
        settings.emailNotifications = document.getElementById('email-notifications')?.checked;
        settings.alertThreshold = document.getElementById('alert-threshold')?.value;

        return settings;
    }

    // UI MANAGEMENT
    openPanel() {
        if (this.isAuthenticated) {
            document.getElementById('ita-admin-panel').classList.remove('hidden');
        } else {
            this.showLoginDialog();
        }
    }

    closePanel() {
        document.getElementById('ita-admin-panel').classList.add('hidden');
    }

    // EVENT LISTENERS
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'a':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.openPanel();
                        }
                        break;
                    case 'r':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.refreshData();
                        }
                        break;
                }
            }
        });

        // Auto-refresh settings when changed
        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('change', () => {
                this.markSettingsDirty();
            });
        });

        // Range slider value display
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay && valueDisplay.classList.contains('range-value')) {
                    valueDisplay.textContent = e.target.value + 'x';
                }
            });
        });
    }

    markSettingsDirty() {
        const saveButton = document.querySelector('.btn-primary');
        if (saveButton && saveButton.textContent === 'Salvar Alterações') {
            saveButton.classList.add('dirty');
        }
    }

    // EXPORT/IMPORT
    exportData() {
        const data = {
            timestamp: Date.now(),
            version: '1.0.0',
            settings: this.collectAllSettings(),
            players: [],
            world: {},
            exports: []
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ita-admin-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.gameTheme?.showNotification('Dados exportados com sucesso!', 'success');
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            window.gameTheme?.showNotification('Dados importados com sucesso!', 'success');
            return data;
        } catch (error) {
            window.gameTheme?.showNotification('Erro ao importar dados!', 'error');
            throw error;
        }
    }

    // CLEANUP
    destroy() {
        this.widgets.clear();
        this.dataCache.clear();
    }
}

// Widget Base Class
class AdminWidget {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.element = null;
    }

    render() {
        throw new Error('render() must be implemented');
    }

    update(data) {
        throw new Error('update() must be implemented');
    }

    destroy() {
        if (this.element) {
            this.element.remove();
        }
    }
}

// Server Status Widget
class ServerStatusWidget extends AdminWidget {
    constructor() {
        super('server-status', 'Status do Servidor');
        this.metrics = {};
    }

    render() {
        return `
            <div class="widget server-status">
                <h3>Status do Servidor</h3>
                <div class="status-metrics">
                    <div class="metric">
                        <span>Status</span>
                        <span class="status-indicator online"></span>
                    </div>
                    <div class="metric">
                        <span>Players Online</span>
                        <span>${this.metrics.playersOnline || 0}</span>
                    </div>
                    <div class="metric">
                        <span>Uptime</span>
                        <span>${this.metrics.uptime || '99.9%'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    update(metrics) {
        this.metrics = { ...this.metrics, ...metrics };
        // Update DOM
    }
}

// Player Analytics Widget
class PlayerAnalyticsWidget extends AdminWidget {
    constructor() {
        super('player-analytics', 'Análise de Jogadores');
    }

    render() {
        return `
            <div class="widget player-analytics">
                <h3>Análise de Jogadores</h3>
                <canvas id="player-chart"></canvas>
            </div>
        `;
    }

    update(data) {
        // Update chart
    }
}

// Economy Monitor Widget
class EconomyMonitorWidget extends AdminWidget {
    constructor() {
        super('economy-monitor', 'Monitor Econômico');
    }

    render() {
        return `
            <div class="widget economy-monitor">
                <h3>Monitor Econômico</h3>
                <div class="economy-stats">
                    <div class="stat">
                        <span>Total em Circulação</span>
                        <span>R$ ${this.formatNumber(1000000)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    }

    update(data) {
        // Update economy stats
    }
}

// CSS for admin panel
const adminPanelCSS = `
.admin-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.admin-panel.hidden {
    display: none;
}

.admin-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
}

.admin-container {
    position: relative;
    width: 95%;
    height: 95%;
    max-width: 1400px;
    background: var(--ita-branco);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.admin-header {
    background: linear-gradient(135deg, var(--ita-vermelho), var(--ita-vermelho-escuro));
    color: var(--ita-branco);
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
}

.admin-logo {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-icon {
    font-size: 24px;
}

.logo-text {
    font: bold 20px var(--fonte-titulo);
}

.admin-user {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-name {
    font: normal 14px var(--fonte-corpo);
}

.logout-btn {
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    color: var(--ita-branco);
    padding: 8px 16px;
    border-radius: 6px;
    font: normal 12px var(--fonte-corpo);
    cursor: pointer;
    transition: all 0.3s ease;
}

.logout-btn:hover {
    background: rgba(255,255,255,0.3);
}

.admin-content {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.admin-sidebar {
    width: 250px;
    background: var(--ita-cinza-claro);
    border-right: 1px solid #ddd;
    display: flex;
    flex-direction: column;
}

.admin-nav {
    flex: 1;
    padding: 20px 0;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 20px;
    background: none;
    border: none;
    text-align: left;
    font: normal 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-item:hover {
    background: rgba(19,57,121,0.1);
}

.nav-item.active {
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
}

.nav-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
}

.admin-tools {
    padding: 20px;
    border-top: 1px solid #ddd;
}

.tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    background: var(--ita-branco);
    border: 1px solid #ddd;
    border-radius: 6px;
    font: normal 12px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    cursor: pointer;
    transition: all 0.3s ease;
}

.tool-btn:hover {
    background: var(--ita-vermelho);
    color: var(--ita-branco);
}

.tool-btn span:first-child {
    font-size: 18px;
}

.admin-main {
    flex: 1;
    overflow-y: auto;
    background: #f8f9fa;
}

.admin-section {
    padding: 30px;
    min-height: 100%;
}

.admin-section.hidden {
    display: none;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.section-header h2 {
    font: bold 28px var(--fonte-titulo);
    color: var(--ita-cinza-escuro);
    margin: 0;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.btn-primary, .btn-secondary, .btn-refresh {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font: normal 14px var(--fonte-corpo);
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

.btn-refresh {
    background: var(--game-exp);
    color: var(--ita-branca);
}

.btn-refresh:hover {
    background: #f57c00;
}

.last-update {
    font: normal 12px var(--fonte-corpo);
    color: #666;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.widget {
    background: var(--ita-branco);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
}

.widget-header {
    background: linear-gradient(135deg, var(--ita-azul-escuro), var(--ita-cabecalho));
    color: var(--ita-branco);
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.widget-header h3 {
    font: bold 16px var(--fonte-titulo);
    margin: 0;
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.status-indicator.online {
    background: #4CAF50;
}

.status-indicator.offline {
    background: #f44336;
}

.status-indicator.warning {
    background: #ff9800;
}

.widget-content {
    padding: 20px;
}

.status-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.metric-label {
    font: normal 12px var(--fonte-corpo);
    color: #666;
}

.metric-value {
    font: bold 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
}

.activity-list {
    max-height: 200px;
    overflow-y: auto;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-icon {
    font-size: 16px;
    flex-shrink: 0;
}

.activity-text {
    flex: 1;
    font: normal 13px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
}

.activity-time {
    font: normal 11px var(--fonte-corpo);
    color: #999;
    flex-shrink: 0;
}

.quick-stats .stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font: bold 24px var(--fonte-titulo);
    color: var(--ita-azul-escuro);
}

.stat-label {
    font: normal 12px var(--fonte-corpo);
    color: #666;
}

.alerts-list {
    max-height: 200px;
    overflow-y: auto;
}

.alert-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 8px;
}

.alert-item.success {
    background: rgba(76, 175, 80, 0.1);
    border-left: 4px solid #4CAF50;
}

.alert-item.warning {
    background: rgba(255, 152, 0, 0.1);
    border-left: 4px solid #ff9800;
}

.alert-item.info {
    background: rgba(33, 150, 243, 0.1);
    border-left: 4px solid #2196F3;
}

.alert-item.error {
    background: rgba(244, 67, 54, 0.1);
    border-left: 4px solid #f44336;
}

.alert-icon {
    font-size: 16px;
}

.alert-text {
    font: normal 13px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
}

/* Login Dialog */
.login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
}

.login-container {
    background: var(--ita-branco);
    border-radius: 12px;
    padding: 40px;
    width: 400px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h2 {
    font: bold 24px var(--fonte-titulo);
    color: var(--ita-azul-escuro);
    margin-bottom: 5px;
}

.login-header p {
    font: normal 14px var(--fonte-corpo);
    color: #666;
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

.form-group input {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font: normal 14px var(--fonte-corpo);
    transition: border-color 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--ita-vermelho);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font: normal 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
    display: none;
}

.checkmark {
    width: 16px;
    height: 16px;
    border: 2px solid #ddd;
    border-radius: 3px;
    position: relative;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
    background: var(--ita-vermelho);
    border-color: var(--ita-vermelho);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark:after {
    content: '✓';
    position: absolute;
    top: -2px;
    left: 2px;
    color: var(--ita-branco);
    font-size: 12px;
}

.login-btn {
    width: 100%;
    padding: 12px;
    background: var(--ita-vermelho);
    color: var(--ita-branco);
    border: none;
    border-radius: 6px;
    font: bold 16px var(--fonte-corpo);
    cursor: pointer;
    transition: background 0.3s ease;
}

.login-btn:hover {
    background: var(--ita-vermelho-escuro);
}

.login-footer {
    text-align: center;
    margin-top: 20px;
}

.login-footer p {
    font: normal 12px var(--fonte-corpo);
    color: #666;
}

/* Players Table */
.search-filters {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    padding: 20px;
    background: var(--ita-branco);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-box {
    display: flex;
    flex: 1;
}

.search-box input {
    flex: 1;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 6px 0 0 6px;
    border-right: none;
}

.btn-search {
    padding: 10px 15px;
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
    border: 2px solid var(--ita-azul-escuro);
    border-radius: 0 6px 6px 0;
    cursor: pointer;
}

.filters select {
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font: normal 14px var(--fonte-corpo);
}

.players-table-container {
    background: var(--ita-branco);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
}

.players-table {
    width: 100%;
    border-collapse: collapse;
}

.players-table th {
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
    padding: 12px;
    text-align: left;
    font: bold 14px var(--fonte-corpo);
}

.players-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    font: normal 14px var(--fonte-corpo);
}

.status {
    padding: 4px 8px;
    border-radius: 12px;
    font: normal 12px var(--fonte-corpo);
    font-weight: bold;
}

.status.online {
    background: #e8f5e8;
    color: #2e7d32;
}

.status.offline {
    background: #ffebee;
    color: #c62828;
}

.status.banned {
    background: #fff3e0;
    color: #ef6c00;
}

.status.admin {
    background: #e3f2fd;
    color: #1976d2;
}

.action-btn {
    padding: 6px 12px;
    margin: 0 2px;
    border: none;
    border-radius: 4px;
    font: normal 12px var(--fonte-corpo);
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-btn:not(.danger) {
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
}

.action-btn:not(.danger):hover {
    background: var(--ita-vermelho);
}

.action-btn.danger {
    background: #dc3545;
    color: var(--ita-branca);
}

.action-btn.danger:hover {
    background: #c82333;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: var(--ita-branco);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.page-btn {
    padding: 8px 16px;
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
    border: none;
    border-radius: 6px;
    font: normal 14px var(--fonte-corpo);
    cursor: pointer;
    transition: all 0.3s ease;
}

.page-btn:hover {
    background: var(--ita-vermelho);
}

.page-info {
    font: normal 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
}

/* Settings */
.settings-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 20px;
    border-bottom: 2px solid #ddd;
}

.settings-tab {
    padding: 12px 20px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font: bold 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    cursor: pointer;
    transition: all 0.3s ease;
}

.settings-tab.active {
    color: var(--ita-vermelho);
    border-bottom-color: var(--ita-vermelho);
}

.settings-content {
    background: var(--ita-branco);
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.settings-panel {
    display: none;
}

.settings-panel.active {
    display: block;
}

.setting-group {
    margin-bottom: 30px;
}

.setting-group h3 {
    font: bold 18px var(--fonte-titulo);
    color: var(--ita-azul-escuro);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #eee;
}

.setting-item {
    margin-bottom: 20px;
}

.setting-item label {
    display: block;
    font: bold 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    margin-bottom: 8px;
}

.setting-item input[type="text"],
.setting-item input[type="number"],
.setting-item input[type="range"],
.setting-item textarea,
.setting-item select {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font: normal 14px var(--fonte-corpo);
    transition: border-color 0.3s ease;
}

.setting-item input:focus,
.setting-item textarea:focus,
.setting-item select:focus {
    outline: none;
    border-color: var(--ita-vermelho);
}

.setting-item textarea {
    resize: vertical;
    min-height: 80px;
}

.range-value {
    margin-left: 10px;
    font: bold 14px var(--fonte-corpo);
    color: var(--ita-azul-escuro);
}

/* Toggle Switch */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: var(--ita-vermelho);
}

input:checked + .slider:before {
    transform: translateX(26px);
}

/* Animations */
@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
}

.btn-primary.dirty {
    background: var(--game-exp);
    animation: pulse 1s infinite;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .admin-container {
        width: 98%;
        height: 98%;
    }

    .admin-sidebar {
        width: 200px;
    }

    .dashboard-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .status-metrics {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .admin-content {
        flex-direction: column;
    }

    .admin-sidebar {
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #ddd;
    }

    .admin-nav {
        display: flex;
        flex-wrap: wrap;
        padding: 10px;
    }

    .nav-item {
        flex: 1;
        min-width: 120px;
    }

    .admin-tools {
        flex-direction: row;
        justify-content: center;
        padding: 10px;
    }

    .tool-btn {
        flex: 1;
        flex-direction: column;
        margin: 0 5px;
    }

    .section-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }

    .dashboard-grid {
        grid-template-columns: 1fr;
    }

    .search-filters {
        flex-direction: column;
    }

    .players-table {
        font-size: 12px;
    }

    .players-table th,
    .players-table td {
        padding: 8px 4px;
    }

    .action-btn {
        padding: 4px 6px;
        font-size: 10px;
        margin: 0 1px;
    }
}
`;

// Add CSS to document
const adminStyleElement = document.createElement('style');
adminStyleElement.textContent = adminPanelCSS;
document.head.appendChild(adminStyleElement);

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    window.itaAdminPanel = new ENEMAdminPanel();
});

// Export for external use
window.ENEMAdminPanel = ENEMAdminPanel;