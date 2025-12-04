/**
 * ENEM RP Game - Performance Monitoring and Analytics System
 *
 * Sistema completo de monitoramento de desempenho e análise de dados
 * para otimização de performance e análise de comportamento do usuário
 */

class ENEMAnalyticsSystem {
    constructor(config = {}) {
        this.config = {
            enablePerformanceMonitoring: config.enablePerformanceMonitoring !== false,
            enableUserAnalytics: config.enableUserAnalytics !== false,
            enableErrorTracking: config.enableErrorTracking !== false,
            enableHeatmapTracking: config.enableHeatmapTracking || false,
            apiEndpoint: config.apiEndpoint || 'https://analytics.ita-rp-game.com/api/v1',
            apiKey: config.apiKey || '',
            batchSize: config.batchSize || 50,
            batchInterval: config.batchInterval || 30000, // 30 segundos
            sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 minutos
            debugMode: config.debugMode || false
        };

        this.metrics = {
            performance: new Map(),
            user: new Map(),
            business: new Map(),
            system: new Map()
        };

        this.session = {
            id: this.generateUUID(),
            startTime: Date.now(),
            lastActivity: Date.now(),
            duration: 0,
            events: [],
            pageViews: 0,
            interactions: 0,
            errors: 0
        };

        this.observers = {
            performance: null,
            visibility: null,
            beforeunload: null,
            error: null
        };

        this.batchQueue = {
            events: [],
            performance: [],
            errors: []
        };

        this.timers = {
            batchInterval: null,
            sessionTimeout: null
        };

        this.thresholds = {
            // Limiares de performance (ms)
            responseTime: {
                good: 200,
                moderate: 500,
                poor: 1000
            },
            renderTime: {
                good: 16, // 60fps
                moderate: 33, // 30fps
                poor: 100 // 10fps
            },
            memoryUsage: {
                warning: 100 * 1024 * 1024, // 100MB
                critical: 200 * 1024 * 1024 // 200MB
            },
            cpuUsage: {
                warning: 70,
                critical: 90
            }
        };

        this.initialized = false;

        this.init();
    }

    // Inicialização do sistema
    async init() {
        try {
            this.log('Initializing ENEM Analytics System...');

            // Setup observers
            this.setupPerformanceObserver();
            this.setupVisibilityObserver();
            this.setupErrorTracking();
            this.setupBeforeUnload();

            // Setup batch processing
            this.setupBatchProcessing();

            // Setup session tracking
            this.setupSessionTracking();

            // Track initial page load
            this.trackPageLoad();

            this.initialized = true;
            this.log('Analytics system initialized successfully');

            // Trigger event
            if (window.itaPluginSystem) {
                await window.itaPluginSystem.triggerHook('analytics:initialized', {
                    session: this.session,
                    config: this.config
                });
            }

        } catch (error) {
            this.logError('Failed to initialize analytics system', error);
        }
    }

    // Setup do Performance Observer
    setupPerformanceObserver() {
        if (!this.config.enablePerformanceMonitoring) return;

        try {
            // Observer para métricas de navegação
            const navigationObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        this.trackNavigationMetrics(entry);
                    }
                });
            });

            navigationObserver.observe({
                entryTypes: ['navigation', 'paint', 'layout-shift', 'largest-contentful-paint']
            });

            // Observer para recursos
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.trackResourceMetrics(entry);
                });
            });

            resourceObserver.observe({
                entryTypes: ['resource', 'measure']
            });

            this.observers.performance = { navigationObserver, resourceObserver };

        } catch (error) {
            this.logError('Failed to setup performance observer', error);
        }
    }

    // Setup do Visibility Observer
    setupVisibilityObserver() {
        this.observers.visibility = () => {
            if (document.hidden) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        };

        document.addEventListener('visibilitychange', this.observers.visibility);
    }

    // Setup de rastreamento de erros
    setupErrorTracking() {
        if (!this.config.enableErrorTracking) return;

        // Captura erros JavaScript
        window.addEventListener('error', (event) => {
            this.trackError('javascript', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });

        // Captura rejeições não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError('promise', {
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack
            });
        });
    }

    // Setup do Before Unload
    setupBeforeUnload() {
        this.observers.beforeunload = () => {
            this.trackSessionEnd();
            this.flushAllBatches();
        };

        window.addEventListener('beforeunload', this.observers.beforeunload);
    }

    // Setup de processamento em batch
    setupBatchProcessing() {
        this.timers.batchInterval = setInterval(() => {
            this.flushBatches();
        }, this.config.batchInterval);
    }

    // Setup de rastreamento de sessão
    setupSessionTracking() {
        this.timers.sessionTimeout = setInterval(() => {
            const timeSinceLastActivity = Date.now() - this.session.lastActivity;
            if (timeSinceLastActivity > this.config.sessionTimeout) {
                this.endSession();
            }
        }, 60000); // Verifica a cada minuto
    }

    // Rastreamento de carregamento da página
    trackPageLoad() {
        if (!window.performance || !window.performance.timing) return;

        const timing = window.performance.timing;
        const navigationStart = timing.navigationStart;

        const pageLoadMetrics = {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            ssl: timing.secureConnectionStart > 0 ? timing.connectEnd - timing.secureConnectionStart : 0,
            ttfb: timing.responseStart - navigationStart,
            download: timing.responseEnd - timing.responseStart,
            domProcessing: timing.domComplete - timing.domLoading,
            domInteractive: timing.domInteractive - navigationStart,
            loadComplete: timing.loadEventEnd - navigationStart,
            totalLoadTime: timing.loadEventEnd - navigationStart
        };

        this.addMetric('performance', 'page_load', pageLoadMetrics);
        this.session.pageViews++;

        // Track Core Web Vitals
        this.trackCoreWebVitals();

        // Track device and browser info
        this.trackDeviceInfo();
    }

    // Rastreamento de Core Web Vitals
    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.addMetric('performance', 'lcp', {
                    value: lastEntry.renderTime || lastEntry.loadTime,
                    element: lastEntry.element?.tagName
                });
            });

            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            setTimeout(() => lcpObserver.disconnect(), 10000); // Timeout após 10s

        } catch (error) {
            this.logError('Failed to track LCP', error);
        }

        // First Input Delay (FID)
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-input') {
                        this.addMetric('performance', 'fid', {
                            value: entry.processingStart - entry.startTime,
                            inputType: entry.name
                        });
                    }
                });
            });

            fidObserver.observe({ entryTypes: ['first-input'] });

        } catch (error) {
            this.logError('Failed to track FID', error);
        }

        // Cumulative Layout Shift (CLS)
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });

                this.addMetric('performance', 'cls', { value: clsValue });
            });

            clsObserver.observe({ entryTypes: ['layout-shift'] });

            setTimeout(() => clsObserver.disconnect(), 30000); // Timeout após 30s

        } catch (error) {
            this.logError('Failed to track CLS', error);
        }
    }

    // Rastreamento de informações do dispositivo
    trackDeviceInfo() {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null,
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
        };

        this.addMetric('system', 'device_info', deviceInfo);
    }

    // Rastreamento de métricas de navegação
    trackNavigationMetrics(entry) {
        const metrics = {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            type: entry.type,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            domContentLoadedEventStart: entry.domContentLoadedEventStart,
            domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
            loadEventStart: entry.loadEventStart,
            loadEventEnd: entry.loadEventEnd
        };

        this.addMetric('performance', 'navigation', metrics);
    }

    // Rastreamento de métricas de recursos
    trackResourceMetrics(entry) {
        const metrics = {
            name: entry.name,
            type: this.getResourceType(entry.name),
            startTime: entry.startTime,
            duration: entry.duration,
            size: entry.transferSize || 0,
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
            responseStatus: 0
        };

        // Se for um recurso de rede
        if (entry.name.startsWith('http')) {
            this.addMetric('performance', 'resource', metrics);
        }
    }

    // Obter tipo de recurso
    getResourceType(url) {
        const extension = url.split('.').pop()?.toLowerCase();
        const resourceTypes = {
            'js': 'script',
            'css': 'stylesheet',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image',
            'svg': 'image',
            'webp': 'image',
            'woff': 'font',
            'woff2': 'font',
            'ttf': 'font',
            'eot': 'font'
        };

        return resourceTypes[extension] || 'other';
    }

    // Rastreamento de evento personalizado
    trackEvent(category, action, data = {}) {
        const event = {
            category,
            action,
            data,
            timestamp: Date.now(),
            sessionId: this.session.id
        };

        this.session.events.push(event);
        this.session.interactions++;
        this.session.lastActivity = Date.now();

        // Adicionar ao batch
        this.batchQueue.events.push(event);

        // Trigger hook
        if (window.itaPluginSystem) {
            window.itaPluginSystem.triggerHook('analytics:event_tracked', event);
        }

        this.logEvent('Event tracked', event);
    }

    // Rastreamento de erro
    trackError(type, error) {
        const errorEvent = {
            type,
            message: error.message,
            stack: error.stack,
            filename: error.filename,
            lineno: error.lineno,
            colno: error.colno,
            timestamp: Date.now(),
            sessionId: this.session.id,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.session.errors++;
        this.batchQueue.errors.push(errorEvent);

        this.logEvent('Error tracked', errorEvent);

        // Trigger hook
        if (window.itaPluginSystem) {
            window.itaPluginSystem.triggerHook('analytics:error_tracked', errorEvent);
        }
    }

    // Rastreamento de métricas de performance
    trackPerformanceMetric(name, value, context = {}) {
        const metric = {
            name,
            value,
            context,
            timestamp: Date.now(),
            sessionId: this.session.id
        };

        this.batchQueue.performance.push(metric);

        // Verificar thresholds
        this.checkPerformanceThresholds(name, value);

        this.logEvent('Performance metric tracked', metric);
    }

    // Verificar limiares de performance
    checkPerformanceThresholds(name, value) {
        let threshold = null;
        let status = 'good';

        // Verificar diferentes tipos de métricas
        switch (name) {
            case 'response_time':
                threshold = this.thresholds.responseTime;
                if (value > threshold.poor) status = 'poor';
                else if (value > threshold.moderate) status = 'moderate';
                break;

            case 'render_time':
                threshold = this.thresholds.renderTime;
                if (value > threshold.poor) status = 'poor';
                else if (value > threshold.moderate) status = 'moderate';
                break;

            case 'memory_usage':
                threshold = this.thresholds.memoryUsage;
                if (value > threshold.critical) status = 'critical';
                else if (value > threshold.warning) status = 'warning';
                break;
        }

        if (status !== 'good') {
            this.trackEvent('performance_warning', name, {
                value,
                status,
                threshold: threshold?.[status]
            });
        }
    }

    // Rastreamento de heatmap (se habilitado)
    trackHeatmap(x, y, element) {
        if (!this.config.enableHeatmapTracking) return;

        const heatmapData = {
            x,
            y,
            element: element?.tagName,
            elementId: element?.id,
            elementClass: element?.className,
            timestamp: Date.now(),
            sessionId: this.session.id,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        this.addMetric('user', 'heatmap_click', heatmapData);
    }

    // Adicionar métrica
    addMetric(category, name, data) {
        if (!this.metrics.has(category)) {
            this.metrics.set(category, new Map());
        }

        const categoryMetrics = this.metrics.get(category);
        categoryMetrics.set(name, {
            data,
            timestamp: Date.now()
        });
    }

    // Obter métricas
    getMetrics(category = null, name = null) {
        if (category && name) {
            return this.metrics.get(category)?.get(name);
        }

        if (category) {
            return Object.fromEntries(this.metrics.get(category) || []);
        }

        const result = {};
        for (const [cat, metrics] of this.metrics.entries()) {
            result[cat] = Object.fromEntries(metrics);
        }

        return result;
    }

    // Obter estatísticas da sessão
    getSessionStats() {
        const now = Date.now();
        this.session.duration = now - this.session.startTime;

        return {
            ...this.session,
            durationFormatted: this.formatDuration(this.session.duration),
            eventsPerMinute: (this.session.events.length / (this.session.duration / 60000)).toFixed(2),
            averageInteractionTime: this.session.interactions > 0 ?
                Math.round(this.session.duration / this.session.interactions) : 0
        };
    }

    // Gerar relatório de performance
    generatePerformanceReport() {
        const metrics = this.getMetrics('performance');
        const sessionStats = this.getSessionStats();

        const report = {
            timestamp: Date.now(),
            session: sessionStats,
            coreWebVitals: {
                lcp: metrics.lcp?.data.value,
                fid: metrics.fid?.data.value,
                cls: metrics.cls?.data.value
            },
            pageLoad: metrics.page_load?.data,
            resources: this.getResourceSummary(metrics),
            memory: metrics.device_info?.data.memory,
            connection: metrics.device_info?.data.connection,
            score: this.calculatePerformanceScore(metrics)
        };

        return report;
    }

    // Resumo de recursos
    getResourceSummary(performanceMetrics) {
        const resources = Object.values(performanceMetrics)
            .filter(metric => metric.data.type === 'resource')
            .map(metric => metric.data);

        if (resources.length === 0) return null;

        const summary = {
            total: resources.length,
            totalSize: resources.reduce((sum, r) => sum + r.size, 0),
            cached: resources.filter(r => r.cached).length,
            byType: {},
            slowResources: resources.filter(r => r.duration > 1000)
        };

        // Agrupar por tipo
        resources.forEach(resource => {
            if (!summary.byType[resource.type]) {
                summary.byType[resource.type] = { count: 0, size: 0 };
            }
            summary.byType[resource.type].count++;
            summary.byType[resource.type].size += resource.size;
        });

        return summary;
    }

    // Calcular score de performance
    calculatePerformanceScore(metrics) {
        const coreWebVitals = {
            lcp: metrics.lcp?.data.value || 0,
            fid: metrics.fid?.data.value || 0,
            cls: metrics.cls?.data.value || 0
        };

        const pageLoad = metrics.page_load?.data;

        let score = 100;

        // LCP (Largest Contentful Paint) - bom: <2.5s, necessita melhorar: 2.5s-4s, ruim: >4s
        if (coreWebVitals.lcp > 4000) score -= 30;
        else if (coreWebVitals.lcp > 2500) score -= 15;

        // FID (First Input Delay) - bom: <100ms, necessita melhorar: 100ms-300ms, ruim: >300ms
        if (coreWebVitals.fid > 300) score -= 30;
        else if (coreWebVitals.fid > 100) score -= 15;

        // CLS (Cumulative Layout Shift) - bom: <0.1, necessita melhorar: 0.1-0.25, ruim: >0.25
        if (coreWebVitals.cls > 0.25) score -= 30;
        else if (coreWebVitals.cls > 0.1) score -= 15;

        // Tempo total de carregamento
        if (pageLoad?.totalLoadTime > 5000) score -= 25;
        else if (pageLoad?.totalLoadTime > 3000) score -= 10;

        return Math.max(0, score);
    }

    // Pausar sessão
    pauseSession() {
        this.session.pausedAt = Date.now();
        this.trackEvent('session', 'paused');
    }

    // Retomar sessão
    resumeSession() {
        if (this.session.pausedAt) {
            const pausedDuration = Date.now() - this.session.pausedAt;
            this.session.pausedDuration = (this.session.pausedDuration || 0) + pausedDuration;
            delete this.session.pausedAt;
            this.trackEvent('session', 'resumed', { pausedDuration });
        }
        this.session.lastActivity = Date.now();
    }

    // Finalizar sessão
    endSession() {
        this.trackSessionEnd();
        this.flushAllBatches();

        if (this.timers.batchInterval) {
            clearInterval(this.timers.batchInterval);
        }

        if (this.timers.sessionTimeout) {
            clearInterval(this.timers.sessionTimeout);
        }

        this.log('Session ended', this.getSessionStats());
    }

    // Rastreamento de fim de sessão
    trackSessionEnd() {
        this.session.endedAt = Date.now();
        this.session.duration = this.session.endedAt - this.session.startTime;

        this.trackEvent('session', 'ended', this.getSessionStats());
    }

    // Processar batches
    flushBatches() {
        if (this.batchQueue.events.length > 0) {
            this.sendBatch('events', this.batchQueue.events.splice(0, this.config.batchSize));
        }

        if (this.batchQueue.performance.length > 0) {
            this.sendBatch('performance', this.batchQueue.performance.splice(0, this.config.batchSize));
        }

        if (this.batchQueue.errors.length > 0) {
            this.sendBatch('errors', this.batchQueue.errors.splice(0, this.config.batchSize));
        }
    }

    // Enviar todos os batches
    flushAllBatches() {
        // Processar todos os dados restantes
        this.sendBatch('events', this.batchQueue.events.splice(0));
        this.sendBatch('performance', this.batchQueue.performance.splice(0));
        this.sendBatch('errors', this.batchQueue.errors.splice(0));
    }

    // Enviar batch para API
    async sendBatch(type, data) {
        if (!data.length || !this.config.apiEndpoint || !this.config.apiKey) return;

        try {
            const response = await fetch(`${this.config.apiEndpoint}/analytics/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey
                },
                body: JSON.stringify({
                    data,
                    sessionId: this.session.id,
                    timestamp: Date.now()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.logEvent('Batch sent successfully', { type, count: data.length });

        } catch (error) {
            this.logError('Failed to send batch', error);

            // Recolocar dados no batch para retry
            this.batchQueue[type].unshift(...data);
        }
    }

    // Gerar relatório completo
    generateFullReport() {
        return {
            session: this.getSessionStats(),
            metrics: this.getMetrics(),
            performance: this.generatePerformanceReport(),
            generatedAt: Date.now()
        };
    }

    // Exportar dados
    exportData(format = 'json') {
        const data = this.generateFullReport();

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(data, null, 2);

            case 'csv':
                return this.convertToCSV(data);

            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    // Converter para CSV
    convertToCSV(data) {
        const headers = ['Category', 'Metric', 'Value', 'Timestamp'];
        const rows = [headers.join(',')];

        for (const [category, metrics] of Object.entries(data.metrics)) {
            for (const [metric, metricData] of Object.entries(metrics)) {
                rows.push([
                    category,
                    metric,
                    JSON.stringify(metricData.data),
                    metricData.timestamp
                ].join(','));
            }
        }

        return rows.join('\n');
    }

    // Limpar dados
    clearData(olderThan = null) {
        if (olderThan) {
            const cutoff = Date.now() - olderThan;

            for (const [category, metrics] of this.metrics.entries()) {
                for (const [name, metricData] of metrics.entries()) {
                    if (metricData.timestamp < cutoff) {
                        metrics.delete(name);
                    }
                }
            }
        } else {
            this.metrics.clear();
        }

        this.log('Analytics data cleared', { olderThan });
    }

    // Destruir sistema
    destroy() {
        this.endSession();

        // Remover event listeners
        if (this.observers.visibility) {
            document.removeEventListener('visibilitychange', this.observers.visibility);
        }

        if (this.observers.beforeunload) {
            window.removeEventListener('beforeunload', this.observers.beforeunload);
        }

        if (this.observers.performance) {
            try {
                this.observers.performance.navigationObserver?.disconnect();
                this.observers.performance.resourceObserver?.disconnect();
            } catch (error) {
                this.logError('Error disconnecting performance observers', error);
            }
        }

        // Limpar dados
        this.metrics.clear();

        this.initialized = false;
        this.log('Analytics system destroyed');
    }

    // Utilitários
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    log(message, data = null) {
        if (this.config.debugMode) {
            console.log(`[ENEM Analytics] ${message}`, data);
        }
    }

    logEvent(message, data = null) {
        if (this.config.debugMode) {
            console.log(`[ENEM Analytics Event] ${message}`, data);
        }
    }

    logError(message, error = null) {
        console.error(`[ENEM Analytics Error] ${message}`, error);
    }
}

// Instância global do sistema de analytics
window.itaAnalytics = new ENEMAnalyticsSystem({
    enablePerformanceMonitoring: true,
    enableUserAnalytics: true,
    enableErrorTracking: true,
    enableHeatmapTracking: false,
    apiEndpoint: 'https://api.ita-rp-game.com/analytics',
    apiKey: 'analytics-key-placeholder',
    debugMode: true
});

// Integrar com o sistema de plugins
if (window.itaPluginSystem) {
    window.itaPluginSystem.registerPlugin('analytics', {
        name: 'ENEM Analytics System',
        version: '1.0.0',
        description: 'Sistema de monitoramento de performance e análise de dados',
        hooks: {
            'game:start': () => {
                window.itaAnalytics.trackEvent('session', 'game_start');
            },
            'player:login': (data) => {
                window.itaAnalytics.trackEvent('player', 'login', data);
            },
            'player:logout': (data) => {
                window.itaAnalytics.trackEvent('player', 'logout', data);
            },
            'game:error': (data) => {
                window.itaAnalytics.trackError('game', data);
            }
        }
    });
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENEMAnalyticsSystem;
}

/**
 * Como usar:
 *
 * // Rastrear evento personalizado
 * window.itaAnalytics.trackEvent('game', 'level_completed', {
 *     level: 5,
 *     time: 120000,
 *     score: 1500
 * });
 *
 * // Rastrear métrica de performance
 * window.itaAnalytics.trackPerformanceMetric('skill_execution_time', 150, {
 *     skill: 'fireball',
 *     target: 'dragon'
 * });
 *
 * // Obter relatório de performance
 * const report = window.itaAnalytics.generatePerformanceReport();
 * console.log('Performance score:', report.score);
 *
 * // Exportar dados
 * const jsonData = window.itaAnalytics.exportData('json');
 * const csvData = window.itaAnalytics.exportData('csv');
 *
 * // Rastrear clique para heatmap
 * document.addEventListener('click', (e) => {
 *     window.itaAnalytics.trackHeatmap(e.clientX, e.clientY, e.target);
 * });
 */