/**
 * ITA RP Game - Comprehensive Testing Suite
 *
 * Sistema completo de testes automatizados para garantir
 * a qualidade e confiabilidade de todos os componentes do jogo
 */

class ITATestSuite {
    constructor(config = {}) {
        this.config = {
            enableUnitTests: config.enableUnitTests !== false,
            enableIntegrationTests: config.enableIntegrationTests !== false,
            enableE2ETests: config.enableE2ETests || false,
            enablePerformanceTests: config.enablePerformanceTests || false,
            enableAccessibilityTests: config.enableAccessibilityTests !== false,
            testTimeout: config.testTimeout || 5000,
            retries: config.retries || 3,
            parallel: config.parallel !== false,
            reporter: config.reporter || 'console', // 'console', 'html', 'json'
            outputDir: config.outputDir || './test-results',
            coverage: config.coverage || false,
            debugMode: config.debugMode || false
        };

        this.tests = {
            unit: new Map(),
            integration: new Map(),
            e2e: new Map(),
            performance: new Map(),
            accessibility: new Map()
        };

        this.results = {
            unit: { passed: 0, failed: 0, skipped: 0, total: 0 },
            integration: { passed: 0, failed: 0, skipped: 0, total: 0 },
            e2e: { passed: 0, failed: 0, skipped: 0, total: 0 },
            performance: { passed: 0, failed: 0, skipped: 0, total: 0 },
            accessibility: { passed: 0, failed: 0, skipped: 0, total: 0 },
            overall: { passed: 0, failed: 0, skipped: 0, total: 0 }
        };

        this.currentTest = null;
        this.isRunning = false;
        this.startTime = null;
        this.endTime = null;

        this.assertions = {
            equal: this.assertEqual.bind(this),
            deepEqual: this.assertDeepEqual.bind(this),
            notEqual: this.assertNotEqual.bind(this),
            truthy: this.assertTruthy.bind(this),
            falsy: this.assertFalsy.bind(this),
            throws: this.assertThrows.bind(this),
            doesNotThrow: this.assertDoesNotThrow.bind(this),
            contains: this.assertContains.bind(this),
            match: this.assertMatch.bind(this),
            type: this.assertType.bind(this),
            instanceOf: this.assertInstanceOf.bind(this),
            length: this.assertLength.bind(this),
            greaterThan: this.assertGreaterThan.bind(this),
            lessThan: this.assertLessThan.bind(this),
            between: this.assertBetween.bind(this),
            async: this.assertAsync.bind(this),
            resolves: this.assertResolves.bind(this),
            rejects: this.assertRejects.bind(this)
        };

        this.coverage = {
            files: new Map(),
            functions: new Map(),
            branches: new Map(),
            lines: new Map()
        };

        this.mocks = new Map();
        this.spies = new Map();

        this.init();
    }

    // Inicialização
    init() {
        this.setupGlobalTestFunctions();
        this.setupDefaultTests();
        this.setupTestEnvironment();

        if (this.config.debugMode) {
            this.log('Test suite initialized');
        }
    }

    // Setup de funções globais de teste
    setupGlobalTestFunctions() {
        // Disponibilizar funções de teste globalmente
        window.describe = this.describe.bind(this);
        window.it = this.it.bind(this);
        window.test = this.it.bind(this);
        window.before = this.before.bind(this);
        window.after = this.after.bind(this);
        window.beforeEach = this.beforeEach.bind(this);
        window.afterEach = this.afterEach.bind(this);
        window.expect = this.expect.bind(this);
        window.assert = this.assertions;
        window.mock = this.mock.bind(this);
        window.spy = this.spy.bind(this);
        window.skip = this.skip.bind(this);
    }

    // Setup de ambiente de teste
    setupTestEnvironment() {
        // Adicionar classes de teste ao DOM para estilização
        if (!document.getElementById('ita-test-styles')) {
            const style = document.createElement('style');
            style.id = 'ita-test-styles';
            style.textContent = `
                .ita-test-results {
                    font-family: 'Courier New', monospace;
                    margin: 20px;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background: #f9f9f9;
                }
                .ita-test-pass { color: #28a745; }
                .ita-test-fail { color: #dc3545; }
                .ita-test-skip { color: #ffc107; }
                .ita-test-suite { margin: 10px 0; }
                .ita-test-case { margin: 5px 0; padding-left: 20px; }
                .ita-test-assertion { margin: 2px 0; padding-left: 20px; font-size: 0.9em; }
                .ita-test-timing { color: #666; font-size: 0.8em; }
            `;
            document.head.appendChild(style);
        }
    }

    // Definição de suíte de testes
    describe(name, callback, type = 'unit') {
        const suite = {
            name,
            type,
            tests: [],
            beforeAll: [],
            afterAll: [],
            beforeEach: [],
            afterEach: []
        };

        // Salvar contexto atual
        const currentSuite = this.currentTest?.suite;
        this.currentTest = { suite, type };

        // Executar callback para definir testes
        callback();

        // Restaurar contexto
        this.currentTest = currentSuite;

        // Adicionar suíte aos testes
        if (!this.tests[type].has(name)) {
            this.tests[type].set(name, suite);
        }

        return suite;
    }

    // Definição de teste individual
    it(name, callback, timeout = null) {
        if (!this.currentTest?.suite) {
            throw new Error('Test must be defined within a describe block');
        }

        const test = {
            name,
            callback,
            timeout: timeout || this.config.testTimeout,
            skipped: false,
            retries: this.config.retries
        };

        this.currentTest.suite.tests.push(test);
        return test;
    }

    // Setup antes de todos os testes
    before(callback) {
        if (!this.currentTest?.suite) {
            throw new Error('before must be called within a describe block');
        }
        this.currentTest.suite.beforeAll.push(callback);
    }

    // Setup depois de todos os testes
    after(callback) {
        if (!this.currentTest?.suite) {
            throw new Error('after must be called within a describe block');
        }
        this.currentTest.suite.afterAll.push(callback);
    }

    // Setup antes de cada teste
    beforeEach(callback) {
        if (!this.currentTest?.suite) {
            throw new Error('beforeEach must be called within a describe block');
        }
        this.currentTest.suite.beforeEach.push(callback);
    }

    // Setup depois de cada teste
    afterEach(callback) {
        if (!this.currentTest?.suite) {
            throw new Error('afterEach must be called within a describe block');
        }
        this.currentTest.suite.afterEach.push(callback);
    }

    // Pular teste
    skip(name, callback) {
        if (!this.currentTest?.suite) {
            throw new Error('skip must be called within a describe block');
        }

        const test = this.it(name, callback);
        test.skipped = true;
        return test;
    }

    // Função expect para chai-style assertions
    expect(actual) {
        return {
            to: {
                be: {
                    equal: (expected) => this.assertEqual(actual, expected),
                    deep: {
                        equal: (expected) => this.assertDeepEqual(actual, expected)
                    },
                    a: (expected) => this.assertType(actual, expected),
                    an: (expected) => this.assertType(actual, expected),
                    instanceOf: (expected) => this.assertInstanceOf(actual, expected)
                },
                not: {
                    be: {
                        equal: (expected) => this.assertNotEqual(actual, expected)
                    }
                },
                have: {
                    length: (expected) => this.assertLength(actual, expected)
                },
                contain: (expected) => this.assertContains(actual, expected),
                match: (expected) => this.assertMatch(actual, expected),
                be: {
                    greaterThan: (expected) => this.assertGreaterThan(actual, expected),
                    lessThan: (expected) => this.assertLessThan(actual, expected),
                    between: (min, max) => this.assertBetween(actual, min, max)
                },
                throw: (expectedError) => this.assertThrows(actual, expectedError)
            }
        };
    }

    // Sistema de mocks
    mock(object, method, implementation) {
        const original = object[method];
        const mockKey = `${object.constructor.name}_${method}`;

        this.mocks.set(mockKey, { original, object, method });
        object[method] = implementation;

        return {
            restore: () => {
                if (this.mocks.has(mockKey)) {
                    const mock = this.mocks.get(mockKey);
                    mock.object[mock.method] = mock.original;
                    this.mocks.delete(mockKey);
                }
            }
        };
    }

    // Sistema de spies
    spy(object, method) {
        const original = object[method];
        const spyKey = `${object.constructor.name}_${method}`;
        const calls = [];

        const spy = (...args) => {
            calls.push({ args, timestamp: Date.now() });
            return original.apply(object, args);
        };

        this.spies.set(spyKey, { original, object, method, calls });
        object[method] = spy;

        return {
            restore: () => {
                if (this.spies.has(spyKey)) {
                    const spyData = this.spies.get(spyKey);
                    spyData.object[spyData.method] = spyData.original;
                    this.spies.delete(spyKey);
                }
            },
            calls: () => calls,
            calledWith: (...args) => calls.some(call =>
                JSON.stringify(call.args) === JSON.stringify(args)
            ),
            callCount: () => calls.length
        };
    }

    // Assertions
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new AssertionError(
                `Expected ${this.stringify(expected)} but got ${this.stringify(actual)}`,
                message
            );
        }
    }

    assertDeepEqual(actual, expected, message = '') {
        if (!this.deepEqual(actual, expected)) {
            throw new AssertionError(
                `Expected ${this.stringify(expected)} but got ${this.stringify(actual)}`,
                message
            );
        }
    }

    assertNotEqual(actual, expected, message = '') {
        if (actual === expected) {
            throw new AssertionError(
                `Expected ${this.stringify(actual)} to not equal ${this.stringify(expected)}`,
                message
            );
        }
    }

    assertTruthy(value, message = '') {
        if (!value) {
            throw new AssertionError(
                `Expected ${this.stringify(value)} to be truthy`,
                message
            );
        }
    }

    assertFalsy(value, message = '') {
        if (value) {
            throw new AssertionError(
                `Expected ${this.stringify(value)} to be falsy`,
                message
            );
        }
    }

    assertThrows(fn, expectedError = null, message = '') {
        try {
            fn();
            throw new AssertionError('Expected function to throw an error', message);
        } catch (error) {
            if (error instanceof AssertionError) throw error;

            if (expectedError) {
                if (typeof expectedError === 'string') {
                    if (error.message !== expectedError) {
                        throw new AssertionError(
                            `Expected error message "${expectedError}" but got "${error.message}"`,
                            message
                        );
                    }
                } else if (expectedError instanceof RegExp) {
                    if (!expectedError.test(error.message)) {
                        throw new AssertionError(
                            `Expected error message to match ${expectedError} but got "${error.message}"`,
                            message
                        );
                    }
                } else if (!(error instanceof expectedError)) {
                    throw new AssertionError(
                        `Expected error to be instance of ${expectedError.name}`,
                        message
                    );
                }
            }
        }
    }

    assertDoesNotThrow(fn, message = '') {
        try {
            fn();
        } catch (error) {
            throw new AssertionError(
                `Expected function not to throw, but threw: ${error.message}`,
                message
            );
        }
    }

    assertContains(haystack, needle, message = '') {
        if (typeof haystack === 'string' || Array.isArray(haystack)) {
            if (!haystack.includes(needle)) {
                throw new AssertionError(
                    `Expected ${this.stringify(haystack)} to contain ${this.stringify(needle)}`,
                    message
                );
            }
        } else if (typeof haystack === 'object') {
            if (!(needle in haystack)) {
                throw new AssertionError(
                    `Expected ${this.stringify(haystack)} to contain key ${this.stringify(needle)}`,
                    message
                );
            }
        }
    }

    assertMatch(actual, pattern, message = '') {
        if (!pattern.test(actual)) {
            throw new AssertionError(
                `Expected ${this.stringify(actual)} to match ${pattern}`,
                message
            );
        }
    }

    assertType(value, expectedType, message = '') {
        const actualType = typeof value;
        if (actualType !== expectedType) {
            throw new AssertionError(
                `Expected type ${expectedType} but got ${actualType}`,
                message
            );
        }
    }

    assertInstanceOf(value, expectedClass, message = '') {
        if (!(value instanceof expectedClass)) {
            throw new AssertionError(
                `Expected ${this.stringify(value)} to be instance of ${expectedClass.name}`,
                message
            );
        }
    }

    assertLength(value, expectedLength, message = '') {
        const actualLength = value.length;
        if (actualLength !== expectedLength) {
            throw new AssertionError(
                `Expected length ${expectedLength} but got ${actualLength}`,
                message
            );
        }
    }

    assertGreaterThan(actual, expected, message = '') {
        if (actual <= expected) {
            throw new AssertionError(
                `Expected ${actual} to be greater than ${expected}`,
                message
            );
        }
    }

    assertLessThan(actual, expected, message = '') {
        if (actual >= expected) {
            throw new AssertionError(
                `Expected ${actual} to be less than ${expected}`,
                message
            );
        }
    }

    assertBetween(actual, min, max, message = '') {
        if (actual < min || actual > max) {
            throw new AssertionError(
                `Expected ${actual} to be between ${min} and ${max}`,
                message
            );
        }
    }

    assertAsync(fn, timeout = 5000, message = '') {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new AssertionError(`Async test timed out after ${timeout}ms`, message));
            }, timeout);

            Promise.resolve(fn())
                .then(resolve)
                .catch(reject)
                .finally(() => clearTimeout(timer));
        });
    }

    assertResolves(promise, message = '') {
        return promise.then(
            value => value,
            error => {
                throw new AssertionError(
                    `Expected promise to resolve but it rejected with: ${error.message}`,
                    message
                );
            }
        );
    }

    assertRejects(promise, expectedError = null, message = '') {
        return promise.then(
            value => {
                throw new AssertionError(
                    `Expected promise to reject but it resolved with: ${this.stringify(value)}`,
                    message
                );
            },
            error => {
                if (expectedError) {
                    if (typeof expectedError === 'string') {
                        if (error.message !== expectedError) {
                            throw new AssertionError(
                                `Expected rejection message "${expectedError}" but got "${error.message}"`,
                                message
                            );
                        }
                    }
                }
            }
        );
    }

    // Setup de testes padrão
    setupDefaultTests() {
        this.setupThemeTests();
        this.setupAPITests();
        this.setupLocalizationTests();
        this.setupSaveSystemTests();
        this.setupPluginSystemTests();
        this.setupAnalyticsTests();
    }

    // Testes do tema
    setupThemeTests() {
        this.describe('ITA Game Theme', () => {
            this.it('should initialize correctly', () => {
                const theme = new ITAGameTheme();
                this.assertTruthy(theme);
                this.assertType(theme.gameState, 'object');
                this.assertEqual(theme.gameState.player.level, 1);
            });

            this.it('should update HUD correctly', () => {
                const theme = new ITAGameTheme();
                theme.updateHUD({
                    health: 150,
                    maxHealth: 200,
                    level: 5
                });

                this.assertEqual(theme.gameState.player.health, 150);
                this.assertEqual(theme.gameState.player.level, 5);
            });

            this.it('should show notifications', () => {
                const theme = new ITAGameTheme();
                const spy = this.spy(theme, 'showNotification');

                theme.showNotification('Test message', 'success');

                this.assertEqual(spy.callCount(), 1);
            });
        }, 'unit');
    }

    // Testes da API
    setupAPITests() {
        this.describe('ITA Game API', () => {
            this.it('should initialize with correct config', () => {
                const api = new ITAGameAPI({
                    baseURL: 'https://test.com',
                    apiKey: 'test-key'
                });

                this.assertEqual(api.config.baseURL, 'https://test.com');
                this.assertEqual(api.config.apiKey, 'test-key');
            });

            this.it('should handle authentication correctly', async () => {
                const api = new ITAGameAPI();
                const mockFetch = this.mock(window, 'fetch', () =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ token: 'test-token' })
                    })
                );

                const result = await api.authenticate('user', 'pass');

                this.assertTruthy(result.token);
                mockFetch.restore();
            });

            this.it('should handle API errors correctly', async () => {
                const api = new ITAGameAPI();
                const mockFetch = this.mock(window, 'fetch', () =>
                    Promise.resolve({
                        ok: false,
                        status: 401,
                        json: () => Promise.resolve({ error: 'Unauthorized' })
                    })
                );

                await this.assertRejects(api.authenticate('user', 'wrong'));
                mockFetch.restore();
            });
        }, 'unit');
    }

    // Testes de localização
    setupLocalizationTests() {
        this.describe('ITA Localization', () => {
            this.it('should initialize with default language', () => {
                const localization = new ITALocalization();

                this.assertEqual(localization.currentLanguage, 'pt-BR');
                this.assertTruthy(localization.translations);
            });

            this.it('should translate texts correctly', () => {
                const localization = new ITALocalization();

                const translated = localization.translate('welcome');
                this.assertType(translated, 'string');
                this.assertGreaterThan(translated.length, 0);
            });

            this.it('should handle missing translations', () => {
                const localization = new ITALocalization();

                const result = localization.translate('nonexistent_key');
                this.assertEqual(result, 'nonexistent_key');
            });
        }, 'unit');
    }

    // Testes do sistema de save
    setupSaveSystemTests() {
        this.describe('ITA Save System', () => {
            this.it('should create save data correctly', async () => {
                const saveSystem = new ITASaveSystem();

                const saveData = await saveSystem.createSaveData();

                this.assertTruthy(saveData.meta);
                this.assertTruthy(saveData.gameState);
                this.assertTruthy(saveData.timestamp);
            });

            this.it('should compress and decompress data', async () => {
                const saveSystem = new ITASaveSystem();
                const testData = { test: 'data', number: 123 };

                const compressed = await saveSystem.compressData(testData);
                const decompressed = await saveSystem.decompressData(compressed);

                this.assertDeepEqual(testData, decompressed);
            });
        }, 'unit');
    }

    // Testes do sistema de plugins
    setupPluginSystemTests() {
        this.describe('ITA Plugin System', () => {
            this.it('should register plugins correctly', () => {
                const pluginSystem = new ITAPluginSystem();
                const testPlugin = {
                    name: 'Test Plugin',
                    version: '1.0.0',
                    description: 'Test plugin'
                };

                const result = pluginSystem.registerPlugin('test', testPlugin);

                this.assertTruthy(result);
                this.assertTruthy(pluginSystem.plugins.has('test'));
            });

            this.it('should trigger hooks correctly', async () => {
                const pluginSystem = new ITAPluginSystem();
                let hookCalled = false;

                pluginSystem.registerHook('test:hook', 'Test hook');
                pluginSystem.subscribeToHook('test:hook', () => {
                    hookCalled = true;
                });

                await pluginSystem.triggerHook('test:hook', {});

                this.assertTruthy(hookCalled);
            });
        }, 'unit');
    }

    // Testes do sistema de analytics
    setupAnalyticsTests() {
        this.describe('ITA Analytics System', () => {
            this.it('should initialize correctly', () => {
                const analytics = new ITAAnalyticsSystem({
                    enablePerformanceMonitoring: false,
                    debugMode: true
                });

                this.assertTruthy(analytics.session);
                this.assertTruthy(analytics.metrics);
            });

            this.it('should track events correctly', () => {
                const analytics = new ITAAnalyticsSystem({ debugMode: true });

                analytics.trackEvent('test', 'action', { data: 'test' });

                this.assertGreaterThan(analytics.session.events.length, 0);
                this.assertEqual(analytics.session.events[0].category, 'test');
            });

            it('should generate performance report', () => {
                const analytics = new ITAAnalyticsSystem({ debugMode: true });

                const report = analytics.generatePerformanceReport();

                this.assertTruthy(report.session);
                this.assertTruthy(report.score);
            });
        }, 'unit');
    }

    // Executar todos os testes
    async runAll() {
        if (this.isRunning) {
            throw new Error('Tests are already running');
        }

        this.isRunning = true;
        this.startTime = Date.now();
        this.resetResults();

        try {
            this.log('Starting test suite...');

            // Executar testes em paralelo se configurado
            if (this.config.parallel) {
                await Promise.all([
                    this.runTestType('unit'),
                    this.runTestType('integration'),
                    this.runTestType('performance'),
                    this.runTestType('accessibility')
                ]);

                if (this.config.enableE2ETests) {
                    await this.runTestType('e2e');
                }
            } else {
                // Executar sequencialmente
                await this.runTestType('unit');
                await this.runTestType('integration');

                if (this.config.enablePerformanceTests) {
                    await this.runTestType('performance');
                }

                if (this.config.enableAccessibilityTests) {
                    await this.runTestType('accessibility');
                }

                if (this.config.enableE2ETests) {
                    await this.runTestType('e2e');
                }
            }

            this.endTime = Date.now();
            this.generateReport();

        } finally {
            this.isRunning = false;
            this.cleanup();
        }
    }

    // Executar tipo específico de teste
    async runTestType(type) {
        const typeTests = this.tests[type];
        if (!typeTests || typeTests.size === 0) return;

        this.log(`Running ${type} tests...`);

        for (const [suiteName, suite] of typeTests) {
            await this.runSuite(suite, type);
        }
    }

    // Executar suíte de testes
    async runSuite(suite, type) {
        this.log(`Running suite: ${suite.name}`);

        try {
            // Executar beforeAll
            for (const beforeFn of suite.beforeAll) {
                await beforeFn();
            }

            // Executar testes
            for (const test of suite.tests) {
                await this.runTest(test, suite, type);
            }

            // Executar afterAll
            for (const afterFn of suite.afterAll) {
                await afterFn();
            }

        } catch (error) {
            this.logError(`Error in suite ${suite.name}:`, error);
        }
    }

    // Executar teste individual
    async runTest(test, suite, type) {
        if (test.skipped) {
            this.results[type].skipped++;
            this.results.overall.skipped++;
            this.results[type].total++;
            this.results.overall.total++;
            return;
        }

        let retries = 0;
        let passed = false;

        while (retries <= test.retries && !passed) {
            try {
                // Executar beforeEach
                for (const beforeEachFn of suite.beforeEach) {
                    await beforeEachFn();
                }

                // Executar teste
                const startTime = Date.now();
                await this.executeWithTimeout(test.callback, test.timeout);
                const endTime = Date.now();

                // Executar afterEach
                for (const afterEachFn of suite.afterEach) {
                    await afterEachFn();
                }

                passed = true;
                this.results[type].passed++;
                this.results.overall.passed++;

                this.logTestResult(suite.name, test.name, 'PASS', endTime - startTime);

            } catch (error) {
                retries++;

                if (retries > test.retries) {
                    this.results[type].failed++;
                    this.results.overall.failed++;

                    this.logTestResult(suite.name, test.name, 'FAIL', null, error);

                    if (this.config.debugMode) {
                        console.error(`Test failed: ${test.name}`, error);
                    }
                } else {
                    this.log(`Retrying test ${test.name} (attempt ${retries}/${test.retries})`);
                }
            } finally {
                this.results[type].total++;
                this.results.overall.total++;
            }
        }
    }

    // Executar função com timeout
    executeWithTimeout(fn, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Test timed out after ${timeout}ms`));
            }, timeout);

            Promise.resolve(fn())
                .then(resolve)
                .catch(reject)
                .finally(() => clearTimeout(timer));
        });
    }

    // Gerar relatório
    generateReport() {
        const duration = this.endTime - this.startTime;
        const report = {
            duration,
            timestamp: new Date().toISOString(),
            results: this.results,
            coverage: this.config.coverage ? this.calculateCoverage() : null,
            summary: {
                totalTests: this.results.overall.total,
                passed: this.results.overall.passed,
                failed: this.results.overall.failed,
                skipped: this.results.overall.skipped,
                passRate: ((this.results.overall.passed / this.results.overall.total) * 100).toFixed(2) + '%'
            }
        };

        this.displayReport(report);

        if (this.config.reporter === 'json') {
            this.saveJSONReport(report);
        } else if (this.config.reporter === 'html') {
            this.saveHTMLReport(report);
        }

        return report;
    }

    // Exibir relatório
    displayReport(report) {
        if (this.config.reporter === 'console') {
            console.log('\n=== ITA RP Game Test Results ===');
            console.log(`Duration: ${report.duration}ms`);
            console.log(`Total Tests: ${report.summary.totalTests}`);
            console.log(`Passed: ${report.summary.passed}`);
            console.log(`Failed: ${report.summary.failed}`);
            console.log(`Skipped: ${report.summary.skipped}`);
            console.log(`Pass Rate: ${report.summary.passRate}`);

            if (report.coverage) {
                console.log(`Coverage: ${report.coverage.percentage}%`);
            }

            console.log('================================\n');
        } else {
            this.createHTMLReport(report);
        }
    }

    // Criar relatório HTML
    createHTMLReport(report) {
        const container = document.createElement('div');
        container.className = 'ita-test-results';
        container.innerHTML = `
            <h2>ITA RP Game Test Results</h2>
            <p><strong>Duration:</strong> ${report.duration}ms</p>
            <p><strong>Total Tests:</strong> ${report.summary.totalTests}</p>
            <p><strong>Passed:</strong> <span class="ita-test-pass">${report.summary.passed}</span></p>
            <p><strong>Failed:</strong> <span class="ita-test-fail">${report.summary.failed}</span></p>
            <p><strong>Skipped:</strong> <span class="ita-test-skip">${report.summary.skipped}</span></p>
            <p><strong>Pass Rate:</strong> ${report.summary.passRate}</p>
            ${report.coverage ? `<p><strong>Coverage:</strong> ${report.coverage.percentage}%</p>` : ''}
        `;

        document.body.appendChild(container);
    }

    // Salvar relatório JSON
    saveJSONReport(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Salvar relatório HTML
    saveHTMLReport(report) {
        const html = this.generateHTMLReport(report);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Gerar HTML do relatório
    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>ITA RP Game Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .skip { color: #ffc107; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>ITA RP Game Test Results</h1>
    <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${report.duration}ms</p>

    <h2>Summary</h2>
    <table>
        <tr><th>Total Tests</th><td>${report.summary.totalTests}</td></tr>
        <tr><th>Passed</th><td class="pass">${report.summary.passed}</td></tr>
        <tr><th>Failed</th><td class="fail">${report.summary.failed}</td></tr>
        <tr><th>Skipped</th><td class="skip">${report.summary.skipped}</td></tr>
        <tr><th>Pass Rate</th><td>${report.summary.passRate}</td></tr>
    </table>

    ${report.coverage ? `<h2>Coverage</h2><p>${report.coverage.percentage}%</p>` : ''}
</body>
</html>`;
    }

    // Calcular coverage (básico)
    calculateCoverage() {
        // Implementação básica - poderia ser expandida
        const totalFiles = this.coverage.files.size;
        const coveredFiles = Array.from(this.coverage.files.values())
            .filter(file => file.covered > 0).length;

        return {
            percentage: totalFiles > 0 ? ((coveredFiles / totalFiles) * 100).toFixed(2) : 0,
            files: this.coverage.files
        };
    }

    // Resetar resultados
    resetResults() {
        for (const type of Object.keys(this.results)) {
            this.results[type] = { passed: 0, failed: 0, skipped: 0, total: 0 };
        }
    }

    // Limpar recursos
    cleanup() {
        // Restaurar mocks
        for (const [key, mock] of this.mocks) {
            mock.object[mock.method] = mock.original;
        }
        this.mocks.clear();

        // Restaurar spies
        for (const [key, spy] of this.spies) {
            spy.object[spy.method] = spy.original;
        }
        this.spies.clear();

        // Limpar variáveis
        this.currentTest = null;
    }

    // Utilitários
    stringify(value) {
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    deepEqual(a, b) {
        if (a === b) return true;

        if (a && b && typeof a === 'object' && typeof b === 'object') {
            if (Array.isArray(a) !== Array.isArray(b)) return false;

            const keysA = Object.keys(a);
            const keysB = Object.keys(b);

            if (keysA.length !== keysB.length) return false;

            for (const key of keysA) {
                if (!keysB.includes(key)) return false;
                if (!this.deepEqual(a[key], b[key])) return false;
            }

            return true;
        }

        return false;
    }

    log(message, data = null) {
        if (this.config.debugMode) {
            console.log(`[ITA Test Suite] ${message}`, data);
        }
    }

    logTestResult(suite, test, result, duration = null, error = null) {
        const durationText = duration ? ` (${duration}ms)` : '';
        const errorText = error ? ` - ${error.message}` : '';

        this.log(`${result}: ${suite} > ${test}${durationText}${errorText}`);
    }

    logError(message, error) {
        console.error(`[ITA Test Suite Error] ${message}`, error);
    }
}

// Classe de erro para assertions
class AssertionError extends Error {
    constructor(message, customMessage = '') {
        super(customMessage ? `${customMessage}: ${message}` : message);
        this.name = 'AssertionError';
    }
}

// Instância global do sistema de testes
window.itaTestSuite = new ITATestSuite({
    enableUnitTests: true,
    enableIntegrationTests: true,
    enablePerformanceTests: true,
    enableAccessibilityTests: true,
    debugMode: true,
    reporter: 'console'
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITATestSuite;
}

/**
 * Como usar:
 *
 * // Definir testes
 * describe('Minha Funcionalidade', () => {
 *     it('deve funcionar corretamente', () => {
 *         const resultado = minhaFuncao();
 *         expect(resultado).to.be.equal('esperado');
 *     });
 *
 *     it('deve lançar erro com dados inválidos', () => {
 *         expect(() => minhaFuncao(null)).to.throw('Dados inválidos');
 *     });
 * });
 *
 * // Executar todos os testes
 * window.itaTestSuite.runAll().then(results => {
 *     console.log('Testes concluídos:', results);
 * });
 *
 * // Executar tipo específico de teste
 * await window.itaTestSuite.runTestType('unit');
 *
 * // Usar mocks
 * const mock = window.itaTestSuite.mock(objeto, 'metodo', () => 'mockado');
 * // ... usar o mock
 * mock.restore();
 *
 * // Usar spies
 * const spy = window.itaTestSuite.spy(objeto, 'metodo');
 * objeto.metodo('parametro');
 * console.log(spy.callCount()); // 1
 * console.log(spy.calls()); // [{ args: ['parametro'], timestamp: ... }]
 * spy.restore();
 */