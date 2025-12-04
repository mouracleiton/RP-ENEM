// ENEM RP Game Localization System
// Multi-language support with dynamic loading and RTL support

class ENEMLocalization {
    constructor(config = {}) {
        this.config = {
            defaultLanguage: config.defaultLanguage || 'pt-BR',
            fallbackLanguage: config.fallbackLanguage || 'en-US',
            supportedLanguages: config.supportedLanguages || [
                'pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'
            ],
            storageKey: config.storageKey || 'ita-game-language',
            autoDetect: config.autoDetect !== false,
            enableRTL: config.enableRTL !== false,
            ...config
        };

        this.currentLanguage = this.config.defaultLanguage;
        this.translations = new Map();
        this.loadedLanguages = new Set();
        this.subscribers = [];

        this.init();
    }

    async init() {
        await this.loadLanguage(this.currentLanguage);
        this.setupEventListeners();
        this.applyDirection();
        this.notifySubscribers();
    }

    // LANGUAGE DETECTION AND LOADING
    detectLanguage() {
        if (!this.config.autoDetect) return this.config.defaultLanguage;

        // Priority: stored language > browser language > default language
        const stored = localStorage.getItem(this.config.storageKey);
        if (stored && this.isSupported(stored)) {
            return stored;
        }

        const browserLang = navigator.language || navigator.languages?.[0];
        const matchedLang = this.findBestMatch(browserLang);

        return matchedLang || this.config.defaultLanguage;
    }

    findBestMatch(browserLanguage) {
        // Exact match
        if (this.isSupported(browserLanguage)) {
            return browserLanguage;
        }

        // Language code match (e.g., 'en' for 'en-US')
        const langCode = browserLanguage.split('-')[0];
        const supported = this.config.supportedLanguages.find(lang =>
            lang.startsWith(langCode + '-')
        );

        return supported || null;
    }

    isSupported(language) {
        return this.config.supportedLanguages.includes(language);
    }

    async loadLanguage(language) {
        if (this.loadedLanguages.has(language)) {
            this.currentLanguage = language;
            this.notifySubscribers();
            return;
        }

        try {
            const translations = await this.fetchTranslations(language);
            this.translations.set(language, translations);
            this.loadedLanguages.add(language);
            this.currentLanguage = language;

            // Save to localStorage
            localStorage.setItem(this.config.storageKey, language);

            this.notifySubscribers();
        } catch (error) {
            console.error(`Failed to load language ${language}:`, error);

            // Fallback to fallback language
            if (language !== this.config.fallbackLanguage && this.loadedLanguages.has(this.config.fallbackLanguage)) {
                this.currentLanguage = this.config.fallbackLanguage;
                this.notifySubscribers();
            }
        }
    }

    async fetchTranslations(language) {
        // Try to load from external file first
        try {
            const response = await fetch(`/locales/${language}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn(`Could not load external translations for ${language}`);
        }

        // Fallback to embedded translations
        return this.getEmbeddedTranslations(language);
    }

    getEmbeddedTranslations(language) {
        const translations = {
            'pt-BR': {
                // Game UI
                'game.title': 'ENEM RP Game',
                'game.subtitle': 'Instituto Tecnológico de Aeronáutica',
                'game.loading': 'Carregando recursos...',
                'game.loading.tips': {
                    'movement': 'Use WASD para se mover',
                    'interact': 'Pressione E para interagir',
                    'inventory': 'Abra o inventário com a tecla I'
                },

                // Menu
                'menu.main': 'Menu Principal',
                'menu.new_game': 'Novo Jogo',
                'menu.continue': 'Continuar',
                'menu.load_game': 'Carregar Jogo',
                'menu.settings': 'Configurações',
                'menu.about': 'Sobre',
                'menu.exit': 'Sair',

                'menu.game': 'Jogo',
                'menu.characters': 'Personagens',
                'menu.inventory': 'Inventário',
                'menu.quests': 'Missões',
                'menu.options': 'Opções',

                // HUD
                'hud.health': 'Vida',
                'hud.energy': 'Energia',
                'hud.experience': 'EXP',
                'hud.level': 'Nível',
                'hud.minimap': 'Minimapa',

                // Character Creator
                'character.title': 'Criar Personagem',
                'character.name': 'Nome do Personagem',
                'character.gender': 'Gênero',
                'character.course': 'Curso Principal',
                'character.male': 'Masculino',
                'character.female': 'Feminino',
                'character.other': 'Outro',

                'attributes.intelligence': 'Inteligência',
                'attributes.creativity': 'Criatividade',
                'attributes.leadership': 'Liderança',
                'attributes.technical': 'Habilidade Técnica',
                'attributes.social': 'Sociabilidade',
                'attributes.resilience': 'Resiliência',

                'attributes.intelligence.desc': 'Capacidade de resolver problemas complexos e aprender rápido',
                'attributes.creativity.desc': 'Habilidade de pensar fora da caixa e encontrar soluções inovadoras',
                'attributes.leadership.desc': 'Capacidade de motivar e guiar equipes',
                'attributes.technical.desc': 'Domínio de ferramentas e técnicas técnicas',
                'attributes.social.desc': 'Habilidade de interagir e construir relacionamentos',
                'attributes.resilience.desc': 'Capacidade de superar desafios e pressão',

                'attributes.points_available': 'Pontos disponíveis',
                'attributes.points_total': 'Pontos totais',

                // Courses
                'course.eng_aero': 'Engenharia Aeronáutica',
                'course.eng_eletronica': 'Engenharia Eletrônica',
                'course.eng_mecanica': 'Engenharia Mecânica',
                'course.eng_comp': 'Engenharia de Computação',
                'course.eng_civil': 'Engenharia Civil',

                // Skill Tree
                'skill.title': 'Árvore de Habilidades',
                'skill.points': 'Pontos de Habilidade',
                'skill.credits': 'Créditos',
                'skill.upgrade': 'Melhorar',
                'skill.requirements': 'Requisitos',
                'skill.max_level': 'Nível Máximo',

                'skill.category.engineering': 'Engenharia',
                'skill.category.programming': 'Programação',
                'skill.category.management': 'Gestão',
                'skill.category.research': 'Pesquisa',

                // Equipment
                'equipment.head': 'Cabeça',
                'equipment.body': 'Corpo',
                'equipment.hands': 'Mãos',
                'equipment.legs': 'Pernas',
                'equipment.feet': 'Pés',
                'equipment.tool': 'Ferramenta',

                'equipment.stats.defense': 'Defesa',
                'equipment.stats.intelligence': 'Inteligência',
                'equipment.stats.speed': 'Velocidade',
                'equipment.stats.happiness': 'Felicidade',

                // Quests
                'quest.active': 'Missões Ativas',
                'quest.progress': 'Progresso',
                'quest.completed': 'Concluída',
                'quest.failed': 'Falhou',
                'quest.new': 'Nova missão disponível!',

                // Chat
                'chat.send': 'Enviar',
                'chat.typing': 'Digitando...',
                'chat.system': 'Sistema',
                'chat.global': 'Global',
                'chat.team': 'Equipe',
                'chat.private': 'Privado',

                // Notifications
                'notification.welcome': 'Bem-vindo ao ENEM RP Game!',
                'notification.save_success': 'Jogo salvo com sucesso!',
                'notification.load_success': 'Jogo carregado com sucesso!',
                'notification.error': 'Erro',
                'notification.warning': 'Alerta',
                'notification.success': 'Sucesso',
                'notification.info': 'Informação',

                // Achievements
                'achievement.title': 'Conquistas',
                'achievement.unlocked': 'Desbloqueado',
                'achievement.locked': 'Bloqueado',
                'achievement.progress': 'Progresso',
                'achievement.first_day': 'Primeiro Dia',
                'achievement.perfect_attendance': 'Presença Perfeita',
                'achievement.lab_master': 'Mestre do Laboratório',

                // Settings
                'settings.title': 'Configurações',
                'settings.language': 'Idioma',
                'settings.graphics': 'Gráficos',
                'settings.audio': 'Áudio',
                'settings.controls': 'Controles',
                'settings.accessibility': 'Acessibilidade',

                'settings.volume': 'Volume',
                'settings.resolution': 'Resolução',
                'settings.quality': 'Qualidade',
                'settings.fullscreen': 'Tela Cheia',
                'settings.vsync': 'VSync',

                // Dialogs
                'dialog.title': 'Diálogo',
                'dialog.close': 'Fechar',
                'dialog.ok': 'OK',
                'dialog.cancel': 'Cancelar',
                'dialog.confirm': 'Confirmar',
                'dialog.yes': 'Sim',
                'dialog.no': 'Não',

                // Social
                'friends.online': 'Amigos Online',
                'friends.offline': 'Amigos Offline',
                'friends.add': 'Adicionar Amigo',
                'friends.remove': 'Remover Amigo',
                'friends.status.online': 'Online',
                'friends.status.offline': 'Offline',
                'friends.status.away': 'Ausente',
                'friends.status.busy': 'Ocupado',

                // Inventory
                'inventory.title': 'Inventário',
                'inventory.empty': 'Vazio',
                'inventory.full': 'Inventário Cheio',
                'inventory.use': 'Usar',
                'inventory.drop': 'Descartar',
                'inventory.equip': 'Equipar',
                'inventory.unequip': 'Desequipar',

                // Time
                'time.morning': 'Manhã',
                'time.afternoon': 'Tarde',
                'time.evening': 'Noite',
                'time.night': 'Madrugada',

                // Common
                'common.loading': 'Carregando...',
                'common.error': 'Erro',
                'common.success': 'Sucesso',
                'common.cancel': 'Cancelar',
                'common.confirm': 'Confirmar',
                'common.save': 'Salvar',
                'common.load': 'Carregar',
                'common.delete': 'Excluir',
                'common.edit': 'Editar',
                'common.close': 'Fechar',
                'common.back': 'Voltar',
                'common.next': 'Próximo',
                'common.previous': 'Anterior',
                'common.search': 'Buscar',
                'common.filter': 'Filtrar',
                'common.sort': 'Ordenar',
                'common.refresh': 'Atualizar',

                // Institution
                'ita.name': 'Instituto Tecnológico de Aeronáutica',
                'ita.address': 'São José dos Campos - SP',
                'ita.motto': 'Ciência e Tecnologia a Serviço do Brasil'
            },

            'en-US': {
                // Game UI
                'game.title': 'ENEM RP Game',
                'game.subtitle': 'Aeronautics Institute of Technology',
                'game.loading': 'Loading resources...',
                'game.loading.tips': {
                    'movement': 'Use WASD to move',
                    'interact': 'Press E to interact',
                    'inventory': 'Open inventory with I key'
                },

                // Menu
                'menu.main': 'Main Menu',
                'menu.new_game': 'New Game',
                'menu.continue': 'Continue',
                'menu.load_game': 'Load Game',
                'menu.settings': 'Settings',
                'menu.about': 'About',
                'menu.exit': 'Exit',

                'menu.game': 'Game',
                'menu.characters': 'Characters',
                'menu.inventory': 'Inventory',
                'menu.quests': 'Quests',
                'menu.options': 'Options',

                // HUD
                'hud.health': 'Health',
                'hud.energy': 'Energy',
                'hud.experience': 'EXP',
                'hud.level': 'Level',
                'hud.minimap': 'Minimap',

                // Character Creator
                'character.title': 'Create Character',
                'character.name': 'Character Name',
                'character.gender': 'Gender',
                'character.course': 'Main Course',
                'character.male': 'Male',
                'character.female': 'Female',
                'character.other': 'Other',

                'attributes.intelligence': 'Intelligence',
                'attributes.creativity': 'Creativity',
                'attributes.leadership': 'Leadership',
                'attributes.technical': 'Technical Skill',
                'attributes.social': 'Social',
                'attributes.resilience': 'Resilience',

                'attributes.intelligence.desc': 'Ability to solve complex problems and learn quickly',
                'attributes.creativity.desc': 'Ability to think outside the box and find innovative solutions',
                'attributes.leadership.desc': 'Ability to motivate and guide teams',
                'attributes.technical.desc': 'Mastery of tools and technical skills',
                'attributes.social.desc': 'Ability to interact and build relationships',
                'attributes.resilience.desc': 'Ability to overcome challenges and pressure',

                'attributes.points_available': 'Available Points',
                'attributes.points_total': 'Total Points',

                // Courses
                'course.eng_aero': 'Aeronautical Engineering',
                'course.eng_eletronica': 'Electronic Engineering',
                'course.eng_mecanica': 'Mechanical Engineering',
                'course.eng_comp': 'Computer Engineering',
                'course.eng_civil': 'Civil Engineering',

                // Skill Tree
                'skill.title': 'Skill Tree',
                'skill.points': 'Skill Points',
                'skill.credits': 'Credits',
                'skill.upgrade': 'Upgrade',
                'skill.requirements': 'Requirements',
                'skill.max_level': 'Max Level',

                'skill.category.engineering': 'Engineering',
                'skill.category.programming': 'Programming',
                'skill.category.management': 'Management',
                'skill.category.research': 'Research',

                // Equipment
                'equipment.head': 'Head',
                'equipment.body': 'Body',
                'equipment.hands': 'Hands',
                'equipment.legs': 'Legs',
                'equipment.feet': 'Feet',
                'equipment.tool': 'Tool',

                'equipment.stats.defense': 'Defense',
                'equipment.stats.intelligence': 'Intelligence',
                'equipment.stats.speed': 'Speed',
                'equipment.stats.happiness': 'Happiness',

                // Quests
                'quest.active': 'Active Quests',
                'quest.progress': 'Progress',
                'quest.completed': 'Completed',
                'quest.failed': 'Failed',
                'quest.new': 'New quest available!',

                // Chat
                'chat.send': 'Send',
                'chat.typing': 'Typing...',
                'chat.system': 'System',
                'chat.global': 'Global',
                'chat.team': 'Team',
                'chat.private': 'Private',

                // Notifications
                'notification.welcome': 'Welcome to ENEM RP Game!',
                'notification.save_success': 'Game saved successfully!',
                'notification.load_success': 'Game loaded successfully!',
                'notification.error': 'Error',
                'notification.warning': 'Warning',
                'notification.success': 'Success',
                'notification.info': 'Information',

                // Achievements
                'achievement.title': 'Achievements',
                'achievement.unlocked': 'Unlocked',
                'achievement.locked': 'Locked',
                'achievement.progress': 'Progress',
                'achievement.first_day': 'First Day',
                'achievement.perfect_attendance': 'Perfect Attendance',
                'achievement.lab_master': 'Lab Master',

                // Settings
                'settings.title': 'Settings',
                'settings.language': 'Language',
                'settings.graphics': 'Graphics',
                'settings.audio': 'Audio',
                'settings.controls': 'Controls',
                'settings.accessibility': 'Accessibility',

                'settings.volume': 'Volume',
                'settings.resolution': 'Resolution',
                'settings.quality': 'Quality',
                'settings.fullscreen': 'Fullscreen',
                'settings.vsync': 'VSync',

                // Dialogs
                'dialog.title': 'Dialog',
                'dialog.close': 'Close',
                'dialog.ok': 'OK',
                'dialog.cancel': 'Cancel',
                'dialog.confirm': 'Confirm',
                'dialog.yes': 'Yes',
                'dialog.no': 'No',

                // Social
                'friends.online': 'Online Friends',
                'friends.offline': 'Offline Friends',
                'friends.add': 'Add Friend',
                'friends.remove': 'Remove Friend',
                'friends.status.online': 'Online',
                'friends.status.offline': 'Offline',
                'friends.status.away': 'Away',
                'friends.status.busy': 'Busy',

                // Inventory
                'inventory.title': 'Inventory',
                'inventory.empty': 'Empty',
                'inventory.full': 'Inventory Full',
                'inventory.use': 'Use',
                'inventory.drop': 'Drop',
                'inventory.equip': 'Equip',
                'inventory.unequip': 'Unequip',

                // Time
                'time.morning': 'Morning',
                'time.afternoon': 'Afternoon',
                'time.evening': 'Evening',
                'time.night': 'Night',

                // Common
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.cancel': 'Cancel',
                'common.confirm': 'Confirm',
                'common.save': 'Save',
                'common.load': 'Load',
                'common.delete': 'Delete',
                'common.edit': 'Edit',
                'common.close': 'Close',
                'common.back': 'Back',
                'common.next': 'Next',
                'common.previous': 'Previous',
                'common.search': 'Search',
                'common.filter': 'Filter',
                'common.sort': 'Sort',
                'common.refresh': 'Refresh',

                // Institution
                'ita.name': 'Aeronautics Institute of Technology',
                'ita.address': 'São José dos Campos - SP',
                'ita.motto': 'Science and Technology Serving Brazil'
            },

            'es-ES': {
                // Spanish translations (key translations only for brevity)
                'game.title': 'ENEM RP Game',
                'game.loading': 'Cargando recursos...',
                'menu.new_game': 'Nuevo Juego',
                'menu.settings': 'Configuración',
                'hud.health': 'Salud',
                'hud.energy': 'Energía',
                'character.title': 'Crear Personaje',
                'skill.title': 'Árbol de Habilidades',
                'notification.welcome': '¡Bienvenido al ENEM RP Game!',
                'common.loading': 'Cargando...',
                'common.error': 'Error'
            },

            'fr-FR': {
                // French translations (key translations only for brevity)
                'game.title': 'ENEM RP Game',
                'game.loading': 'Chargement des ressources...',
                'menu.new_game': 'Nouvelle Partie',
                'menu.settings': 'Paramètres',
                'hud.health': 'Santé',
                'hud.energy': 'Énergie',
                'character.title': 'Créer un Personnage',
                'skill.title': 'Arbre de Compétences',
                'notification.welcome': 'Bienvenue dans ENEM RP Game!',
                'common.loading': 'Chargement...',
                'common.error': 'Erreur'
            },

            'ja-JP': {
                // Japanese translations (key translations only for brevity)
                'game.title': 'ENEM RPゲーム',
                'game.loading': 'リソースを読み込み中...',
                'menu.new_game': '新しいゲーム',
                'menu.settings': '設定',
                'hud.health': 'ヘルス',
                'hud.energy': 'エネルギー',
                'character.title': 'キャラクター作成',
                'skill.title': 'スキルツリー',
                'notification.welcome': 'ENEM RPゲームへようこそ！',
                'common.loading': '読み込み中...',
                'common.error': 'エラー'
            },

            'zh-CN': {
                // Chinese translations (key translations only for brevity)
                'game.title': 'ENEM RP游戏',
                'game.loading': '加载资源中...',
                'menu.new_game': '新游戏',
                'menu.settings': '设置',
                'hud.health': '生命值',
                'hud.energy': '能量',
                'character.title': '创建角色',
                'skill.title': '技能树',
                'notification.welcome': '欢迎来到ENEM RP游戏！',
                'common.loading': '加载中...',
                'common.error': '错误'
            }
        };

        return translations[language] || translations[this.config.fallbackLanguage] || {};
    }

    // TRANSLATION METHODS
    t(key, params = {}) {
        const translation = this.getTranslation(key);
        return this.interpolate(translation, params);
    }

    getTranslation(key) {
        const translations = this.translations.get(this.currentLanguage);

        // Try exact match
        if (translations && translations[key]) {
            return translations[key];
        }

        // Try nested key (dot notation)
        const nestedTranslation = this.getNestedTranslation(translations, key);
        if (nestedTranslation) {
            return nestedTranslation;
        }

        // Fallback to fallback language
        const fallbackTranslations = this.translations.get(this.config.fallbackLanguage);
        if (fallbackTranslations) {
            const fallbackNested = this.getNestedTranslation(fallbackTranslations, key);
            if (fallbackNested) {
                return fallbackNested;
            }
        }

        // Return key as last resort
        return key;
    }

    getNestedTranslation(obj, key) {
        const keys = key.split('.');
        let current = obj;

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return null;
            }
        }

        return current;
    }

    interpolate(text, params) {
        if (typeof text !== 'string' || !params) return text;

        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // DIRECTIONALITY AND RTL SUPPORT
    isRTL(language = this.currentLanguage) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.some(lang => language.startsWith(lang));
    }

    applyDirection() {
        if (!this.config.enableRTL) return;

        const html = document.documentElement;
        const isRTL = this.isRTL();

        html.dir = isRTL ? 'rtl' : 'ltr';
        html.lang = this.currentLanguage;

        // Update CSS classes for RTL
        document.body.classList.toggle('rtl', isRTL);
        document.body.classList.toggle('ltr', !isRTL);
    }

    // NUMBER, DATE, AND CURRENCY FORMATTING
    formatNumber(number, options = {}) {
        try {
            return new Intl.NumberFormat(this.currentLanguage, options).format(number);
        } catch (error) {
            return number.toString();
        }
    }

    formatCurrency(amount, currency = 'BRL') {
        try {
            return new Intl.NumberFormat(this.currentLanguage, {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            return `${currency} ${amount}`;
        }
    }

    formatDate(date, options = {}) {
        try {
            return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
        } catch (error) {
            return date.toString();
        }
    }

    formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };

        try {
            return new Intl.DateTimeFormat(this.currentLanguage, defaultOptions).format(date);
        } catch (error) {
            return date.toString();
        }
    }

    formatDateTime(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };

        try {
            return new Intl.DateTimeFormat(this.currentLanguage, defaultOptions).format(date);
        } catch (error) {
            return date.toString();
        }
    }

    // PLURALIZATION
    pluralize(count, key, params = {}) {
        const translationKey = `${key}.${this.getPluralForm(count)}`;
        const translation = this.getTranslation(translationKey) || key;

        return this.interpolate(translation, { count, ...params });
    }

    getPluralForm(count) {
        // This is a simplified pluralization logic
        // Real implementation would use ICU Message Format or similar
        const language = this.currentLanguage;

        if (language.startsWith('en')) {
            return count === 1 ? 'one' : 'other';
        } else if (language.startsWith('pt')) {
            return count === 1 ? 'one' : 'other';
        } else if (language.startsWith('fr')) {
            return count === 0 || count === 1 ? 'one' : 'other';
        } else if (language.startsWith('ja') || language.startsWith('zh')) {
            return 'other'; // These languages don't typically use plural forms
        }

        return count === 1 ? 'one' : 'other';
    }

    // EVENT MANAGEMENT
    setupEventListeners() {
        // Listen for language changes
        window.addEventListener('languagechange', () => {
            const detectedLanguage = this.detectLanguage();
            if (detectedLanguage !== this.currentLanguage) {
                this.setLanguage(detectedLanguage);
            }
        });

        // Listen for storage changes (other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === this.config.storageKey) {
                this.setLanguage(e.newValue);
            }
        });
    }

    // SUBSCRIPTION SYSTEM
    subscribe(callback) {
        this.subscribers.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback({
                    language: this.currentLanguage,
                    isRTL: this.isRTL(),
                    t: this.t.bind(this)
                });
            } catch (error) {
                console.error('Error in localization subscriber:', error);
            }
        });
    }

    // LANGUAGE MANAGEMENT
    async setLanguage(language) {
        if (!this.isSupported(language)) {
            console.warn(`Language ${language} is not supported`);
            return false;
        }

        await this.loadLanguage(language);
        this.applyDirection();
        return true;
    }

    async addLanguage(language, translations) {
        this.translations.set(language, translations);
        this.loadedLanguages.add(language);

        // Add to supported languages if not already there
        if (!this.config.supportedLanguages.includes(language)) {
            this.config.supportedLanguages.push(language);
        }
    }

    // HTML TRANSLATION HELPERS
    translateElement(element) {
        const key = element.dataset.translate;
        if (!key) return;

        const translation = this.t(key);

        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
            element.placeholder = translation;
        } else if (element.tagName === 'INPUT' && element.type === 'submit') {
            element.value = translation;
        } else if (element.tagName === 'TITLE') {
            element.textContent = translation;
        } else {
            element.textContent = translation;
        }
    }

    translateDocument() {
        // Translate all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            this.translateElement(element);
        });

        // Update html lang attribute
        document.documentElement.lang = this.currentLanguage;

        // Update direction
        this.applyDirection();
    }

    // TRANSLATION GENERATION HELPERS
    extractTranslations() {
        const translations = {};

        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;

            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                translations[key] = element.placeholder;
            } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                translations[key] = element.value;
            } else {
                translations[key] = element.textContent;
            }
        });

        return translations;
    }

    generateTranslationTemplate() {
        const extracted = this.extractTranslations();

        const template = {
            language: this.currentLanguage,
            translations: extracted,
            metadata: {
                generatedAt: new Date().toISOString(),
                version: '1.0.0'
            }
        };

        return JSON.stringify(template, null, 2);
    }

    // DEBUG AND UTILITIES
    getLoadedLanguages() {
        return Array.from(this.loadedLanguages);
    }

    getMissingKeys() {
        const keys = new Set();
        const referenceTranslations = this.translations.get('en-US') || {};

        const collectKeys = (obj, prefix = '') => {
            Object.keys(obj).forEach(key => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                keys.add(fullKey);

                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    collectKeys(obj[key], fullKey);
                }
            });
        };

        collectKeys(referenceTranslations);

        const missingKeys = [];
        keys.forEach(key => {
            if (!this.getTranslation(key)) {
                missingKeys.push(key);
            }
        });

        return missingKeys;
    }

    // Cleanup
    destroy() {
        this.subscribers = [];
        this.translations.clear();
        this.loadedLanguages.clear();
    }
}

// Translation Helper Function
const t = (key, params) => {
    if (window.itaLocalization) {
        return window.itaLocalization.t(key, params);
    }
    return key;
};

// Auto-translate document elements
const translatePage = () => {
    if (window.itaLocalization) {
        window.itaLocalization.translateDocument();
    }
};

// Format helpers
const formatNumber = (number, options) => {
    if (window.itaLocalization) {
        return window.itaLocalization.formatNumber(number, options);
    }
    return number.toString();
};

const formatCurrency = (amount, currency) => {
    if (window.itaLocalization) {
        return window.itaLocalization.formatCurrency(amount, currency);
    }
    return `${currency} ${amount}`;
};

const formatDate = (date, options) => {
    if (window.itaLocalization) {
        return window.itaLocalization.formatDate(date, options);
    }
    return date.toString();
};

// Initialize localization system
document.addEventListener('DOMContentLoaded', () => {
    window.itaLocalization = new ENEMLocalization();

    // Make helper functions globally available
    window.t = t;
    window.translatePage = translatePage;
    window.formatNumber = formatNumber;
    window.formatCurrency = formatCurrency;
    window.formatDate = formatDate;

    // Auto-translate the page
    translatePage();
});

// Export for external use
window.ENEMLocalization = ENEMLocalization;