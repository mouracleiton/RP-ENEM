// ENEM RP Game Advanced Components
// Character Creator, Skill Tree, and Advanced Game Systems

class ENEMGameComponents {
    constructor() {
        this.characterData = {
            basic: {
                name: '',
                gender: '',
                appearance: {},
                backstory: ''
            },
            attributes: {
                intelligence: 10,
                creativity: 10,
                leadership: 10,
                technical: 10,
                social: 10,
                resilience: 10
            },
            courses: [],
            skills: {},
            equipment: {},
            stats: {
                level: 1,
                experience: 0,
                credits: 1000,
                reputation: 0
            }
        };

        this.skillTreeData = this.initializeSkillTree();
        this.activeModal = null;
        this.init();
    }

    init() {
        this.createCharacterCreator();
        this.createSkillTree();
        this.createEquipmentManager();
        this.createCourseSelector();
        this.createAchievementSystem();
    }

    // CHARACTER CREATOR COMPONENT
    createCharacterCreator() {
        const creatorHTML = `
            <div id="character-creator" class="game-modal hidden">
                <div class="modal-backdrop" onclick="gameComponents.closeModal('character-creator')"></div>
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>Criar Personagem</h2>
                        <button class="close-btn" onclick="gameComponents.closeModal('character-creator')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="creator-tabs">
                            <button class="tab-btn active" data-tab="basic">Informações Básicas</button>
                            <button class="tab-btn" data-tab="attributes">Atributos</button>
                            <button class="tab-btn" data-tab="appearance">Aparência</button>
                            <button class="tab-btn" data-tab="background">Histórico</button>
                        </div>

                        <!-- Basic Info Tab -->
                        <div class="tab-content active" id="tab-basic">
                            <div class="form-group">
                                <label>Nome do Personagem</label>
                                <input type="text" id="char-name" placeholder="Digite o nome..." maxlength="30">
                            </div>
                            <div class="form-group">
                                <label>Gênero</label>
                                <div class="gender-options">
                                    <button class="gender-btn" data-gender="male">Masculino</button>
                                    <button class="gender-btn" data-gender="female">Feminino</button>
                                    <button class="gender-btn" data-gender="other">Outro</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Curso Principal</label>
                                <select id="char-course">
                                    <option value="">Selecione um curso...</option>
                                    <option value="eng-aero">Engenharia Aeronáutica</option>
                                    <option value="eng-eletronica">Engenharia Eletrônica</option>
                                    <option value="eng-mecanica">Engenharia Mecânica</option>
                                    <option value="eng-comp">Engenharia de Computação</option>
                                    <option value="eng-civil">Engenharia Civil</option>
                                </select>
                            </div>
                        </div>

                        <!-- Attributes Tab -->
                        <div class="tab-content" id="tab-attributes">
                            <div class="attributes-container">
                                <div class="attribute-item">
                                    <div class="attr-header">
                                        <span class="attr-name">Inteligência</span>
                                        <span class="attr-value" id="attr-intelligence">10</span>
                                    </div>
                                    <div class="attr-controls">
                                        <button class="attr-btn minus" data-attr="intelligence" data-action="minus">-</button>
                                        <div class="attr-bar">
                                            <div class="attr-fill" id="fill-intelligence" style="width: 20%"></div>
                                        </div>
                                        <button class="attr-btn plus" data-attr="intelligence" data-action="plus">+</button>
                                    </div>
                                    <div class="attr-description">Capacidade de resolver problemas complexos e aprender rápido</div>
                                </div>

                                <div class="attribute-item">
                                    <div class="attr-header">
                                        <span class="attr-name">Criatividade</span>
                                        <span class="attr-value" id="attr-creativity">10</span>
                                    </div>
                                    <div class="attr-controls">
                                        <button class="attr-btn minus" data-attr="creativity" data-action="minus">-</button>
                                        <div class="attr-bar">
                                            <div class="attr-fill" id="fill-creativity" style="width: 20%"></div>
                                        </div>
                                        <button class="attr-btn plus" data-attr="creativity" data-action="plus">+</button>
                                    </div>
                                    <div class="attr-description">Habilidade de pensar fora da caixa e encontrar soluções inovadoras</div>
                                </div>

                                <div class="attribute-item">
                                    <div class="attr-header">
                                        <span class="attr-name">Liderança</span>
                                        <span class="attr-value" id="attr-leadership">10</span>
                                    </div>
                                    <div class="attr-controls">
                                        <button class="attr-btn minus" data-attr="leadership" data-action="minus">-</button>
                                        <div class="attr-bar">
                                            <div class="attr-fill" id="fill-leadership" style="width: 20%"></div>
                                        </div>
                                        <button class="attr-btn plus" data-attr="leadership" data-action="plus">+</button>
                                    </div>
                                    <div class="attr-description">Capacidade de motivar e guiar equipes</div>
                                </div>

                                <div class="attribute-item">
                                    <div class="attr-header">
                                        <span class="attr-name">Habilidade Técnica</span>
                                        <span class="attr-value" id="attr-technical">10</span>
                                    </div>
                                    <div class="attr-controls">
                                        <button class="attr-btn minus" data-attr="technical" data-action="minus">-</button>
                                        <div class="attr-bar">
                                            <div class="attr-fill" id="fill-technical" style="width: 20%"></div>
                                        </div>
                                        <button class="attr-btn plus" data-attr="technical" data-action="plus">+</button>
                                    </div>
                                    <div class="attr-description">Domínio de ferramentas e técnicas técnicas</div>
                                </div>

                                <div class="attribute-item">
                                    <div class="attr-header">
                                        <span class="attr-name">Sociabilidade</span>
                                        <span class="attr-value" id="attr-social">10</span>
                                    </div>
                                    <div class="attr-controls">
                                        <button class="attr-btn minus" data-attr="social" data-action="minus">-</button>
                                        <div class="attr-bar">
                                            <div class="attr-fill" id="fill-social" style="width: 20%"></div>
                                        </div>
                                        <button class="attr-btn plus" data-attr="social" data-action="plus">+</button>
                                    </div>
                                    <div class="attr-description">Habilidade de interagir e construir relacionamentos</div>
                                </div>

                                <div class="attribute-item">
                                    <div class="attr-header">
                                        <span class="attr-name">Resiliência</span>
                                        <span class="attr-value" id="attr-resilience">10</span>
                                    </div>
                                    <div class="attr-controls">
                                        <button class="attr-btn minus" data-attr="resilience" data-action="minus">-</button>
                                        <div class="attr-bar">
                                            <div class="attr-fill" id="fill-resilience" style="width: 20%"></div>
                                        </div>
                                        <button class="attr-btn plus" data-attr="resilience" data-action="plus">+</button>
                                    </div>
                                    <div class="attr-description">Capacidade de superar desafios e pressão</div>
                                </div>
                            </div>
                            <div class="points-summary">
                                <span>Pontos disponíveis: <strong id="available-points">20</strong></span>
                            </div>
                        </div>

                        <!-- Appearance Tab -->
                        <div class="tab-content" id="tab-appearance">
                            <div class="appearance-options">
                                <div class="option-group">
                                    <label>Estilo Cabelo</label>
                                    <div class="hair-styles">
                                        <button class="style-btn" data-style="short">Curto</button>
                                        <button class="style-btn" data-style="medium">Médio</button>
                                        <button class="style-btn" data-style="long">Longo</button>
                                    </div>
                                </div>
                                <div class="option-group">
                                    <label>Cor Cabelo</label>
                                    <div class="color-picker">
                                        <button class="color-btn" data-color="black"></button>
                                        <button class="color-btn" data-color="brown"></button>
                                        <button class="color-btn" data-color="blonde"></button>
                                        <button class="color-btn" data-color="red"></button>
                                    </div>
                                </div>
                                <div class="option-group">
                                    <label>Tipo de Roupa</label>
                                    <select id="clothing-style">
                                        <option value="casual">Casual</option>
                                        <option value="formal">Formal</option>
                                        <option value="lab">Jaleco de Laboratório</option>
                                        <option value="sports">Esportivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Background Tab -->
                        <div class="tab-content" id="tab-background">
                            <div class="form-group">
                                <label>Origem</label>
                                <select id="char-origin">
                                    <option value="">Selecione...</option>
                                    <option value="sao-paulo">São Paulo</option>
                                    <option value="rio-de-janeiro">Rio de Janeiro</option>
                                    <option value="minas-gerais">Minas Gerais</option>
                                    <option value="bahia">Bahia</option>
                                    <option value="other">Outra</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Biografia</label>
                                <textarea id="char-bio" placeholder="Descreva a história do seu personagem..." rows="4"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Personalidade</label>
                                <div class="personality-traits">
                                    <label class="trait-checkbox">
                                        <input type="checkbox" value="analytical"> Analítico
                                    </label>
                                    <label class="trait-checkbox">
                                        <input type="checkbox" value="creative"> Criativo
                                    </label>
                                    <label class="trait-checkbox">
                                        <input type="checkbox" value="leader"> Líder
                                    </label>
                                    <label class="trait-checkbox">
                                        <input type="checkbox" value="teamwork"> Trabalho em Equipe
                                    </label>
                                    <label class="trait-checkbox">
                                        <input type="checkbox" value="innovative"> Inovador
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="gameComponents.closeModal('character-creator')">Cancelar</button>
                        <button class="btn-primary" onclick="gameComponents.saveCharacter()">Criar Personagem</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', creatorHTML);
        this.setupCharacterCreatorEvents();
    }

    setupCharacterCreatorEvents() {
        // Tab switching
        document.querySelectorAll('.creator-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Gender selection
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.characterData.basic.gender = e.target.dataset.gender;
            });
        });

        // Attribute controls
        document.querySelectorAll('.attr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const attr = e.target.dataset.attr;
                const action = e.target.dataset.action;
                this.adjustAttribute(attr, action);
            });
        });

        // Appearance options
        document.querySelectorAll('.style-btn, .color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parent = e.target.parentElement;
                parent.querySelectorAll('.style-btn, .color-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.creator-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    }

    adjustAttribute(attr, action) {
        const current = this.characterData.attributes[attr];
        const max = 50;
        const min = 1;

        if (action === 'plus' && current < max) {
            if (this.getAvailablePoints() > 0) {
                this.characterData.attributes[attr]++;
                this.updateAttributeDisplay(attr);
            }
        } else if (action === 'minus' && current > min) {
            this.characterData.attributes[attr]--;
            this.updateAttributeDisplay(attr);
        }

        this.updateAvailablePoints();
    }

    updateAttributeDisplay(attr) {
        const value = this.characterData.attributes[attr];
        const valueElement = document.getElementById(`attr-${attr}`);
        const fillElement = document.getElementById(`fill-${attr}`);

        if (valueElement) valueElement.textContent = value;
        if (fillElement) fillElement.style.width = `${(value / 50) * 100}%`;
    }

    getAvailablePoints() {
        const total = Object.values(this.characterData.attributes).reduce((sum, val) => sum + val, 0);
        return 80 - total; // 80 total points (10 base + 20 bonus)
    }

    updateAvailablePoints() {
        const pointsElement = document.getElementById('available-points');
        if (pointsElement) {
            pointsElement.textContent = this.getAvailablePoints();
        }
    }

    saveCharacter() {
        // Validate character data
        const name = document.getElementById('char-name').value.trim();
        if (!name) {
            window.gameTheme?.showNotification('Por favor, digite um nome para o personagem!', 'error');
            return;
        }

        if (this.getAvailablePoints() > 0) {
            window.gameTheme?.showNotification('Você ainda tem pontos de atributo não distribuídos!', 'warning');
            return;
        }

        // Collect all character data
        this.characterData.basic.name = name;
        this.characterData.basic.course = document.getElementById('char-course').value;
        this.characterData.basic.appearance = {
            hairStyle: document.querySelector('.hair-styles .style-btn.selected')?.dataset.style,
            hairColor: document.querySelector('.color-picker .color-btn.selected')?.dataset.color,
            clothing: document.getElementById('clothing-style').value
        };
        this.characterData.basic.backstory = document.getElementById('char-bio').value;

        // Save to backend
        this.saveCharacterToBackend();

        this.closeModal('character-creator');
        window.gameTheme?.showNotification(`Personagem ${name} criado com sucesso!`, 'success');
    }

    async saveCharacterToBackend() {
        try {
            await window.itaGameAPI.updateProfile(this.characterData);
            if (window.gameTheme) {
                window.gameTheme.gameState.player = { ...window.gameTheme.gameState.player, ...this.characterData };
                window.gameTheme.updateHUD();
            }
        } catch (error) {
            console.error('Failed to save character:', error);
            window.gameTheme?.showNotification('Erro ao salvar personagem!', 'error');
        }
    }

    // SKILL TREE COMPONENT
    initializeSkillTree() {
        return {
            'engenharia': {
                name: 'Engenharia',
                icon: '⚙️',
                description: 'Habilidades técnicas e de engenharia',
                skills: {
                    'mecanica-basica': {
                        name: 'Mecânica Básica',
                        level: 0,
                        maxLevel: 5,
                        cost: 10,
                        requirements: [],
                        description: 'Fundamentos de mecânica e manutenção',
                        effects: ['+10% eficiência em reparos', 'Novas opções de diálogo técnicas']
                    },
                    'eletronica-avancada': {
                        name: 'Eletrônica Avançada',
                        level: 0,
                        maxLevel: 5,
                        cost: 15,
                        requirements: ['mecanica-basica:2'],
                        description: 'Circuitos e sistemas eletrônicos',
                        effects: ['+15% eficiência em hacks', 'Acesso a equipamentos eletrônicos']
                    },
                    'aeronautica': {
                        name: 'Aeronáutica',
                        level: 0,
                        maxLevel: 5,
                        cost: 20,
                        requirements: ['mecanica-basica:3', 'eletronica-avancada:2'],
                        description: 'Design e manutenção de aeronaves',
                        effects: ['+20% eficiência em testes de voo', 'Acesso ao hangar']
                    }
                }
            },
            'programacao': {
                name: 'Programação',
                icon: '💻',
                description: 'Desenvolvimento de software e algoritmos',
                skills: {
                    'algoritmos': {
                        name: 'Algoritmos e Estruturas',
                        level: 0,
                        maxLevel: 5,
                        cost: 10,
                        requirements: [],
                        description: 'Fundamentos de programação',
                        effects: ['+15%速度 em solving', 'Melhor performance em puzzles']
                    },
                    'desenvolvimento-web': {
                        name: 'Desenvolvimento Web',
                        level: 0,
                        maxLevel: 5,
                        cost: 12,
                        requirements: ['algoritmos:2'],
                        description: 'Frontend e backend development',
                        effects: ['+10% eficiência em projetos', 'Acesso ao lab de computação']
                    },
                    'inteligencia-artificial': {
                        name: 'Inteligência Artificial',
                        level: 0,
                        maxLevel: 5,
                        cost: 25,
                        requirements: ['algoritmos:4', 'desenvolvimento-web:3'],
                        description: 'Machine learning e IA',
                        effects: ['+25% eficiência em pesquisa', 'Criação de assistentes virtuais']
                    }
                }
            },
            'gestao': {
                name: 'Gestão',
                icon: '📊',
                description: 'Liderança e administração de projetos',
                skills: {
                    'lideranca-equipes': {
                        name: 'Liderança de Equipes',
                        level: 0,
                        maxLevel: 5,
                        cost: 10,
                        requirements: [],
                        description: 'Motivação e gerenciamento de pessoas',
                        effects: ['+20% moral da equipe', 'Melhor diálogo com NPCs']
                    },
                    'gestao-projetos': {
                        name: 'Gestão de Projetos',
                        level: 0,
                        maxLevel: 5,
                        cost: 15,
                        requirements: ['lideranca-equipes:2'],
                        description: 'Planejamento e execução de projetos',
                        effects: ['+15% eficiência em projetos', 'Melhor cronograma de tarefas']
                    },
                    'empreendedorismo': {
                        name: 'Empreendedorismo',
                        level: 0,
                        maxLevel: 5,
                        cost: 20,
                        requirements: ['gestao-projetos:3'],
                        description: 'Criação de negócios e inovação',
                        effects: ['+25% ganhos financeiros', 'Acesso a investidores']
                    }
                }
            },
            'pesquisa': {
                name: 'Pesquisa',
                icon: '🔬',
                description: 'Investigação científica e desenvolvimento',
                skills: {
                    'metodologia-cientifica': {
                        name: 'Metodologia Científica',
                        level: 0,
                        maxLevel: 5,
                        cost: 10,
                        requirements: [],
                        description: 'Métodos de pesquisa e análise',
                        effects: ['+20% eficiência em pesquisas', 'Melhor qualidade de resultados']
                    },
                    'redacao-academica': {
                        name: 'Redação Acadêmica',
                        level: 0,
                        maxLevel: 5,
                        cost: 12,
                        requirements: ['metodologia-cientifica:2'],
                        description: 'Escrita de artigos e papers',
                        effects: ['+15% reputação acadêmica', 'Publicações de maior impacto']
                    },
                    'inovacao-tecnologica': {
                        name: 'Inovação Tecnológica',
                        level: 0,
                        maxLevel: 5,
                        cost: 25,
                        requirements: ['metodologia-cientifica:4', 'redacao-academica:3'],
                        description: 'Desenvolvimento de tecnologias disruptivas',
                        effects: ['+30% eficiência em inovações', 'Patentes e descobertas']
                    }
                }
            }
        };
    }

    createSkillTree() {
        const skillTreeHTML = `
            <div id="skill-tree" class="game-modal hidden">
                <div class="modal-backdrop" onclick="gameComponents.closeModal('skill-tree')"></div>
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>Árvore de Habilidades</h2>
                        <button class="close-btn" onclick="gameComponents.closeModal('skill-tree')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="skill-tree-info">
                            <div class="skill-points">
                                <span>Pontos de Habilidade: <strong id="skill-points">5</strong></span>
                                <span>Créditos: <strong id="credits">1000</strong></span>
                            </div>
                        </div>

                        <div class="skill-categories">
                            ${Object.entries(this.skillTreeData).map(([categoryKey, category]) => `
                                <div class="skill-category" data-category="${categoryKey}">
                                    <div class="category-header">
                                        <span class="category-icon">${category.icon}</span>
                                        <h3>${category.name}</h3>
                                        <span class="category-desc">${category.description}</span>
                                    </div>
                                    <div class="category-skills">
                                        ${Object.entries(category.skills).map(([skillKey, skill]) => `
                                            <div class="skill-item" data-skill="${skillKey}">
                                                <div class="skill-header">
                                                    <h4>${skill.name}</h4>
                                                    <div class="skill-level">
                                                        <span class="level-text">${skill.level}/${skill.maxLevel}</span>
                                                        <div class="level-progress">
                                                            <div class="level-fill" style="width: ${(skill.level / skill.maxLevel) * 100}%"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p class="skill-description">${skill.description}</p>
                                                <div class="skill-effects">
                                                    ${skill.effects.map(effect => `<span class="effect-tag">${effect}</span>`).join('')}
                                                </div>
                                                <div class="skill-actions">
                                                    <button class="btn-upgrade" onclick="gameComponents.upgradeSkill('${categoryKey}', '${skillKey}')">
                                                        Melhorar (${skill.cost} créditos)
                                                    </button>
                                                </div>
                                                ${skill.requirements.length > 0 ? `
                                                    <div class="skill-requirements">
                                                        <small>Requisitos: ${skill.requirements.join(', ')}</small>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="gameComponents.closeModal('skill-tree')">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', skillTreeHTML);
        this.updateSkillTreeDisplay();
    }

    upgradeSkill(categoryKey, skillKey) {
        const skill = this.skillTreeData[categoryKey].skills[skillKey];

        // Check requirements
        if (skill.level >= skill.maxLevel) {
            window.gameTheme?.showNotification('Habilidade já está no nível máximo!', 'warning');
            return;
        }

        if (!this.canAffordSkill(skill.cost)) {
            window.gameTheme?.showNotification('Créditos insuficientes!', 'error');
            return;
        }

        if (!this.meetsRequirements(skill.requirements)) {
            window.gameTheme?.showNotification('Requisitos não atendidos!', 'error');
            return;
        }

        // Upgrade skill
        skill.level++;
        this.deductCredits(skill.cost);

        // Apply skill effects
        this.applySkillEffects(categoryKey, skillKey, skill.level);

        // Update display
        this.updateSkillTreeDisplay();

        window.gameTheme?.showNotification(`${skill.name} melhorada para nível ${skill.level}!`, 'success');
    }

    canAffordSkill(cost) {
        // This would check against player's actual credits
        return true; // Simplified for demo
    }

    meetsRequirements(requirements) {
        if (!requirements || requirements.length === 0) return true;

        return requirements.every(req => {
            const [category, skill] = req.split(':');
            const requiredLevel = parseInt(req.split(':')[1]);

            if (!category || !skill) return true;

            const skillData = this.skillTreeData[category]?.skills[skill];
            return skillData && skillData.level >= requiredLevel;
        });
    }

    deductCredits(amount) {
        // This would deduct from player's actual credits
        console.log(`Deducted ${amount} credits`);
    }

    applySkillEffects(categoryKey, skillKey, level) {
        // Apply skill effects to character
        console.log(`Applied effects for ${categoryKey}.${skillKey} level ${level}`);
    }

    updateSkillTreeDisplay() {
        // Update skill points and credits display
        document.getElementById('skill-points').textContent = '5'; // Would get from actual player data
        document.getElementById('credits').textContent = '1000';

        // Update skill levels and progress bars
        Object.entries(this.skillTreeData).forEach(([categoryKey, category]) => {
            Object.entries(category.skills).forEach(([skillKey, skill]) => {
                const skillElement = document.querySelector(`[data-skill="${skillKey}"]`);
                if (skillElement) {
                    const levelText = skillElement.querySelector('.level-text');
                    const levelFill = skillElement.querySelector('.level-fill');
                    const upgradeBtn = skillElement.querySelector('.btn-upgrade');

                    if (levelText) levelText.textContent = `${skill.level}/${skill.maxLevel}`;
                    if (levelFill) levelFill.style.width = `${(skill.level / skill.maxLevel) * 100}%`;

                    if (upgradeBtn) {
                        const canUpgrade = skill.level < skill.maxLevel &&
                                         this.meetsRequirements(skill.requirements);
                        upgradeBtn.disabled = !canUpgrade;
                        upgradeBtn.classList.toggle('disabled', !canUpgrade);
                    }
                }
            });
        });
    }

    // EQUIPMENT MANAGER COMPONENT
    createEquipmentManager() {
        const equipmentHTML = `
            <div id="equipment-manager" class="game-modal hidden">
                <div class="modal-backdrop" onclick="gameComponents.closeModal('equipment-manager')"></div>
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>Gerenciar Equipamentos</h2>
                        <button class="close-btn" onclick="gameComponents.closeModal('equipment-manager')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="equipment-slots">
                            <div class="equipment-slot" data-slot="head">
                                <div class="slot-icon">👒</div>
                                <div class="slot-name">Cabeça</div>
                                <div class="slot-item"></div>
                            </div>
                            <div class="equipment-slot" data-slot="body">
                                <div class="slot-icon">👔</div>
                                <div class="slot-name">Corpo</div>
                                <div class="slot-item"></div>
                            </div>
                            <div class="equipment-slot" data-slot="hands">
                                <div class="slot-icon">🧤</div>
                                <div class="slot-name">Mãos</div>
                                <div class="slot-item"></div>
                            </div>
                            <div class="equipment-slot" data-slot="legs">
                                <div class="slot-icon">👖</div>
                                <div class="slot-name">Pernas</div>
                                <div class="slot-item"></div>
                            </div>
                            <div class="equipment-slot" data-slot="feet">
                                <div class="slot-icon">👟</div>
                                <div class="slot-name">Pés</div>
                                <div class="slot-item"></div>
                            </div>
                            <div class="equipment-slot" data-slot="tool">
                                <div class="slot-icon">🔧</div>
                                <div class="slot-name">Ferramenta</div>
                                <div class="slot-item"></div>
                            </div>
                        </div>

                        <div class="equipment-stats">
                            <h3>Status do Equipamento</h3>
                            <div class="stat-item">
                                <span>Defesa</span>
                                <span id="stat-defense">0</span>
                            </div>
                            <div class="stat-item">
                                <span>Inteligência</span>
                                <span id="stat-intelligence">0</span>
                            </div>
                            <div class="stat-item">
                                <span>Velocidade</span>
                                <span id="stat-speed">0</span>
                            </div>
                            <div class="stat-item">
                                <span>Felicidade</span>
                                <span id="stat-happiness">0</span>
                            </div>
                        </div>

                        <div class="inventory-grid">
                            <h3>Inventário</h3>
                            <div class="inventory-slots" id="equipment-inventory">
                                ${Array.from({length: 24}, (_, i) => `
                                    <div class="inventory-slot" data-slot="${i}">
                                        <div class="slot-content"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="gameComponents.closeModal('equipment-manager')">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', equipmentHTML);
        this.setupEquipmentEvents();
    }

    setupEquipmentEvents() {
        // Equipment slots
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const slotType = e.currentTarget.dataset.slot;
                this.equipItem(slotType);
            });
        });

        // Inventory slots
        document.querySelectorAll('#equipment-inventory .inventory-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const slotIndex = e.currentTarget.dataset.slot;
                this.selectInventoryItem(slotIndex);
            });
        });
    }

    equipItem(slotType) {
        // Logic to equip item from inventory to slot
        window.gameTheme?.showNotification(`Equipando item no slot ${slotType}`, 'info');
    }

    selectInventoryItem(slotIndex) {
        // Logic to select item from inventory
        window.gameTheme?.showNotification(`Item selecionado: slot ${slotIndex}`, 'info');
    }

    // COURSE SELECTOR COMPONENT
    createCourseSelector() {
        const coursesHTML = `
            <div id="course-selector" class="game-modal hidden">
                <div class="modal-backdrop" onclick="gameComponents.closeModal('course-selector')"></div>
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>Selecionar Cursos</h2>
                        <button class="close-btn" onclick="gameComponents.closeModal('course-selector')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="courses-grid">
                            <div class="course-card" data-course="CTC-12">
                                <div class="course-icon">📊</div>
                                <h3>Projeto e Análise de Algoritmos</h3>
                                <p>Algoritmos, estruturas de dados e análise de complexidade</p>
                                <div class="course-requirements">Requisitos: Cálculo I, Lógica Matemática</div>
                                <div class="course-stats">
                                    <span class="difficulty">⭐⭐⭐</span>
                                    <span class="credits">6 créditos</span>
                                </div>
                            </div>

                            <div class="course-card" data-course="CTC-55">
                                <div class="course-icon">🧮</div>
                                <h3>Algoritmos Avançados</h3>
                                <p>Algoritmos para problemas computacionais difíceis</p>
                                <div class="course-requirements">Requisitos: Projeto e Análise de Algoritmos</div>
                                <div class="course-stats">
                                    <span class="difficulty">⭐⭐⭐⭐</span>
                                    <span class="credits">4 créditos</span>
                                </div>
                            </div>

                            <div class="course-card" data-course="CSI-22">
                                <div class="course-icon">💻</div>
                                <h3>Programação Orientada a Objetos</h3>
                                <p>Princípios de POO, design patterns e desenvolvimento orientado a objetos</p>
                                <div class="course-requirements">Requisitos: Introdução à Programação</div>
                                <div class="course-stats">
                                    <span class="difficulty">⭐⭐⭐</span>
                                    <span class="credits">4 créditos</span>
                                </div>
                            </div>

                            <div class="course-card" data-course="CMC-14">
                                <div class="course-icon">🧠</div>
                                <h3>Lógica Matemática</h3>
                                <p>Lógica proposicional, de predicados e teoria dos conjuntos</p>
                                <div class="course-requirements">Requisitos: Nenhum</div>
                                <div class="course-stats">
                                    <span class="difficulty">⭐⭐</span>
                                    <span class="credits">4 créditos</span>
                                </div>
                            </div>

                            <div class="course-card" data-course="MAT-13">
                                <div class="course-icon">📐</div>
                                <h3>Cálculo Diferencial e Integral I</h3>
                                <p>Limites, derivadas, integrais e aplicações</p>
                                <div class="course-requirements">Requisitos: Matemática Avançada</div>
                                <div class="course-stats">
                                    <span class="difficulty">⭐⭐⭐⭐</span>
                                    <span class="credits">6 créditos</span>
                                </div>
                            </div>

                            <div class="course-card" data-course="ELE-54">
                                <div class="course-icon">⚡</div>
                                <h3>Circuitos Elétricos</h3>
                                <p>Análise de circuitos CC e CA, teoremas fundamentais</p>
                                <div class="course-requirements">Requisitos: Física II</div>
                                <div class="course-stats">
                                    <span class="difficulty">⭐⭐⭐⭐</span>
                                    <span class="credits">6 créditos</span>
                                </div>
                            </div>
                        </div>

                        <div class="current-courses">
                            <h3>Cursos Atuais</h3>
                            <div id="enrolled-courses" class="enrolled-list">
                                <p class="no-courses">Você não está matriculado em nenhum curso ainda.</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="gameComponents.closeModal('course-selector')">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', coursesHTML);
        this.setupCourseEvents();
    }

    setupCourseEvents() {
        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const courseCode = e.currentTarget.dataset.course;
                this.enrollCourse(courseCode);
            });
        });
    }

    enrollCourse(courseCode) {
        window.gameTheme?.showNotification(`Matriculando-se no curso ${courseCode}`, 'success');
        // Update enrolled courses display
    }

    // ACHIEVEMENT SYSTEM COMPONENT
    createAchievementSystem() {
        const achievementsHTML = `
            <div id="achievement-system" class="game-modal hidden">
                <div class="modal-backdrop" onclick="gameComponents.closeModal('achievement-system')"></div>
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>Conquistas</h2>
                        <button class="close-btn" onclick="gameComponents.closeModal('achievement-system')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="achievement-categories">
                            <div class="category-tabs">
                                <button class="category-tab active" data-category="all">Todas</button>
                                <button class="category-tab" data-category="academic">Acadêmicas</button>
                                <button class="category-tab" data-category="social">Sociais</button>
                                <button class="category-tab" data-category="exploration">Exploração</button>
                                <button class="category-tab" data-category="special">Especiais</button>
                            </div>
                        </div>

                        <div class="achievements-grid">
                            <!-- Sample achievements -->
                            <div class="achievement-card unlocked" data-achievement="first-day">
                                <div class="achievement-icon">🎓</div>
                                <div class="achievement-info">
                                    <h4>Primeiro Dia</h4>
                                    <p>Complete seu primeiro dia no ENEM</p>
                                    <div class="achievement-date">Desbloqueado em 01/12/2024</div>
                                </div>
                            </div>

                            <div class="achievement-card" data-achievement="perfect-attendance">
                                <div class="achievement-icon">📅</div>
                                <div class="achievement-info">
                                    <h4>Presença Perfeita</h4>
                                    <p>Assista a todas as aulas por um semestre</p>
                                    <div class="achievement-progress">Progresso: 45/60 aulas</div>
                                </div>
                            </div>

                            <div class="achievement-card locked" data-achievement="lab-master">
                                <div class="achievement-icon">🔬</div>
                                <div class="achievement-info">
                                    <h4>Mestre do Laboratório</h4>
                                    <p>Complete todos os experimentos com nota máxima</p>
                                    <div class="achievement-locked">🔒 Não desbloqueado</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="gameComponents.closeModal('achievement-system')">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', achievementsHTML);
        this.setupAchievementEvents();
    }

    setupAchievementEvents() {
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterAchievements(category);
            });
        });
    }

    filterAchievements(category) {
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        document.querySelectorAll('.achievement-card').forEach(card => {
            if (category === 'all') {
                card.style.display = 'flex';
            } else {
                const achievementCategory = card.dataset.category || 'special';
                card.style.display = achievementCategory === category ? 'flex' : 'none';
            }
        });
    }

    // Utility Functions
    openCharacterCreator() {
        this.openModal('character-creator');
    }

    openSkillTree() {
        this.openModal('skill-tree');
    }

    openEquipmentManager() {
        this.openModal('equipment-manager');
    }

    openCourseSelector() {
        this.openModal('course-selector');
    }

    openAchievementSystem() {
        this.openModal('achievement-system');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            this.activeModal = modalId;
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            this.activeModal = null;
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.game-modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.activeModal = null;
        document.body.style.overflow = '';
    }

    // Add keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'c':
                        if (!this.activeModal) {
                            e.preventDefault();
                            this.openCharacterCreator();
                        }
                        break;
                    case 's':
                        if (!this.activeModal) {
                            e.preventDefault();
                            this.openSkillTree();
                        }
                        break;
                    case 'e':
                        if (!this.activeModal) {
                            e.preventDefault();
                            this.openEquipmentManager();
                        }
                        break;
                    case 'Escape':
                        if (this.activeModal) {
                            this.closeModal(this.activeModal);
                        }
                        break;
                }
            }
        });
    }
}

// Add CSS for the components
const componentsCSS = `
.game-modal {
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

.game-modal.hidden {
    display: none;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: relative;
    background: var(--ita-branco);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-height: 90vh;
    overflow: hidden;
    z-index: 10001;
}

.modal-content.small {
    width: 400px;
}

.modal-content.medium {
    width: 600px;
}

.modal-content.large {
    width: 900px;
    max-width: 95vw;
}

.modal-header {
    background: linear-gradient(135deg, var(--ita-vermelho), var(--ita-vermelho-escuro));
    color: var(--ita-branco);
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 24px;
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

.modal-body {
    padding: 30px;
    max-height: 60vh;
    overflow-y: auto;
}

.modal-footer {
    background: var(--ita-cinza-claro);
    padding: 20px 30px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #ddd;
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

.btn-upgrade {
    background: var(--game-exp);
    color: var(--ita-branco);
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font: bold 12px var(--fonte-corpo);
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-upgrade:hover:not(.disabled) {
    background: #f57c00;
    transform: translateY(-1px);
}

.btn-upgrade.disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
}

/* Character Creator Styles */
.creator-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 20px;
    border-bottom: 2px solid var(--ita-cinza-medio);
}

.tab-btn {
    background: none;
    border: none;
    padding: 12px 24px;
    font: bold 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
}

.tab-btn.active {
    color: var(--ita-vermelho);
    border-bottom-color: var(--ita-vermelho);
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
    animation: fadeIn 0.3s ease;
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

.form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font: normal 14px var(--fonte-corpo);
    transition: border-color 0.3s ease;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    outline: none;
    border-color: var(--ita-vermelho);
}

.gender-options, .hair-styles, .color-picker {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.gender-btn, .style-btn, .color-btn {
    padding: 10px 20px;
    border: 2px solid #ddd;
    background: var(--ita-branco);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.gender-btn.selected, .style-btn.selected, .color-btn.selected {
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
    border-color: var(--ita-azul-escuro);
}

.color-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
}

.color-btn[data-color="black"] { background: #000; }
.color-btn[data-color="brown"] { background: #8B4513; }
.color-btn[data-color="blonde"] { background: #FFD700; }
.color-btn[data-color="red"] { background: #DC143C; }

/* Attributes Styles */
.attributes-container {
    max-width: 600px;
}

.attribute-item {
    margin-bottom: 30px;
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: var(--ita-cinza-claro);
}

.attr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.attr-name {
    font: bold 16px var(--fonte-corpo);
    color: var(--ita-azul-escuro);
}

.attr-value {
    font: bold 18px var(--fonte-corpo);
    color: var(--ita-vermelho);
}

.attr-controls {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
}

.attr-btn {
    width: 36px;
    height: 36px;
    border: 2px solid var(--ita-vermelho);
    background: var(--ita-branco);
    color: var(--ita-vermelho);
    border-radius: 50%;
    font: bold 18px var(--fonte-corpo);
    cursor: pointer;
    transition: all 0.3s ease;
}

.attr-btn:hover:not(:disabled) {
    background: var(--ita-vermelho);
    color: var(--ita-branco);
}

.attr-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.attr-bar {
    flex: 1;
    height: 20px;
    background: #ddd;
    border-radius: 10px;
    overflow: hidden;
}

.attr-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--ita-vermelho), var(--ita-azul-escuro));
    transition: width 0.3s ease;
}

.attr-description {
    font: normal 12px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
    font-style: italic;
}

.points-summary {
    text-align: center;
    margin-top: 20px;
    padding: 15px;
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
    border-radius: 8px;
    font: bold 16px var(--fonte-corpo);
}

/* Skill Tree Styles */
.skill-tree-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: var(--ita-cinza-claro);
    border-radius: 8px;
    margin-bottom: 20px;
}

.skill-points {
    display: flex;
    gap: 30px;
    font: bold 16px var(--fonte-corpo);
}

.skill-categories {
    max-height: 500px;
    overflow-y: auto;
}

.skill-category {
    margin-bottom: 30px;
    border: 2px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

.category-header {
    background: linear-gradient(135deg, var(--ita-azul-escuro), var(--ita-cabecalho));
    color: var(--ita-branco);
    padding: 15px 20px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.category-icon {
    font-size: 24px;
}

.category-header h3 {
    margin: 0;
    font-family: var(--fonte-titulo);
}

.category-desc {
    font: normal 12px var(--fonte-corpo);
    opacity: 0.9;
    margin-left: auto;
}

.category-skills {
    padding: 20px;
    background: var(--ita-branco);
}

.skill-item {
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    margin-bottom: 15px;
    background: var(--ita-cinza-claro);
    transition: all 0.3s ease;
}

.skill-item:hover {
    border-color: var(--ita-vermelho);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.skill-header h4 {
    margin: 0;
    font: bold 16px var(--fonte-corpo);
    color: var(--ita-azul-escuro);
}

.level-progress {
    width: 100px;
    height: 8px;
    background: #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.level-fill {
    height: 100%;
    background: var(--game-exp);
    transition: width 0.3s ease;
}

.skill-description {
    margin: 10px 0;
    font: normal 14px var(--fonte-corpo);
    color: var(--ita-cinza-escuro);
}

.skill-effects {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0;
}

.effect-tag {
    background: var(--ita-azul-escuro);
    color: var(--ita-branco);
    padding: 4px 8px;
    border-radius: 12px;
    font: normal 11px var(--fonte-corpo);
}

.skill-requirements {
    margin-top: 10px;
    color: #666;
    font: normal 12px var(--fonte-corpo);
}

/* Equipment Manager Styles */
.equipment-slots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.equipment-slot {
    background: var(--ita-cinza-claro);
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.equipment-slot:hover {
    border-color: var(--ita-vermelho);
    transform: scale(1.05);
}

.slot-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.slot-name {
    font: bold 14px var(--fonte-corpo);
    color: var(--ita-azul-escuro);
    margin-bottom: 8px;
}

.slot-item {
    min-height: 40px;
    background: var(--ita-branco);
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.equipment-stats {
    background: var(--ita-cinza-claro);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
}

.equipment-stats h3 {
    margin-top: 0;
    color: var(--ita-azul-escuro);
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #ddd;
}

.stat-item:last-child {
    border-bottom: none;
}

.inventory-grid {
    background: var(--ita-cinza-claro);
    border-radius: 8px;
    padding: 20px;
}

.inventory-slots {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
}

.inventory-slot {
    aspect-ratio: 1;
    background: var(--ita-branco);
    border: 2px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.inventory-slot:hover {
    border-color: var(--ita-vermelho);
    transform: scale(1.05);
}

/* Course Selector Styles */
.courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.course-card {
    background: var(--ita-branco);
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.course-card:hover {
    border-color: var(--ita-vermelho);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.course-icon {
    font-size: 32px;
    text-align: center;
    margin-bottom: 15px;
}

.course-card h3 {
    margin: 10px 0;
    color: var(--ita-azul-escuro);
}

.course-card p {
    color: var(--ita-cinza-escuro);
    margin-bottom: 15px;
}

.course-requirements {
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
}

.course-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.difficulty {
    color: var(--game-exp);
}

/* Achievement System Styles */
.achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
}

.achievement-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: var(--ita-branco);
    transition: all 0.3s ease;
}

.achievement-card.unlocked {
    border-color: var(--game-vida);
    background: linear-gradient(135deg, var(--ita-branco), rgba(76, 175, 80, 0.1));
}

.achievement-card.locked {
    opacity: 0.7;
    border-color: #ccc;
}

.achievement-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.achievement-icon {
    font-size: 48px;
    flex-shrink: 0;
}

.achievement-info h4 {
    margin: 0 0 5px 0;
    color: var(--ita-azul-escuro);
}

.achievement-info p {
    margin: 0 0 10px 0;
    color: var(--ita-cinza-escuro);
}

.achievement-date, .achievement-progress, .achievement-locked {
    font: normal 12px var(--fonte-corpo);
    color: #666;
}

.enrolled-list {
    background: var(--ita-cinza-claro);
    border-radius: 8px;
    padding: 20px;
}

.no-courses {
    text-align: center;
    color: var(--ita-cinza-escuro);
    font-style: italic;
}
`;

// Add CSS to document
const styleElement = document.createElement('style');
styleElement.textContent = componentsCSS;
document.head.appendChild(styleElement);

// Initialize the game components
document.addEventListener('DOMContentLoaded', () => {
    window.gameComponents = new ENEMGameComponents();
    window.gameComponents.setupKeyboardShortcuts();
});

// Export for external use
window.ENEMGameComponents = ENEMGameComponents;