/**
 * Skill Tree Page
 * Visual skill progression display for each discipline
 */

import React, { useState, useMemo } from 'react';
import { SkillTree } from '@ita-rp/ui-components';
import { useCurriculum } from '@ita-rp/curriculum';

interface SkillTreePageProps {
  completedSkillIds: string[];
  onStartSkill: (skillId: string, disciplineId: string) => void;
  onNavigate: (page: string) => void;
}

// Map disciplines to icons
const disciplineIcons: Record<string, string> = {
  calculo1: '📐',
  calculo2: '📈',
  calculo3: '📊',
  fisica1: '⚛️',
  fisica2: '🌊',
  fisica3: '💡',
  quimica: '🧪',
  algebra_linear: '🔢',
  programacao: '💻',
  desenho_tecnico: '✏️',
  portugues: '📝',
  ingles: '🌍',
};

// Map skill types to icons
const skillTypeIcons: Record<string, string> = {
  teoria: '📖',
  pratica: '🔧',
  exercicio: '✍️',
  projeto: '🎯',
  prova: '📋',
  default: '📚',
};

export const SkillTreePage: React.FC<SkillTreePageProps> = ({
  completedSkillIds,
  onStartSkill,
  onNavigate,
}) => {
  const { disciplines, getFormattedSkills } = useCurriculum();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);

  // Generate skill tree nodes for selected discipline
  const skillTreeNodes = useMemo(() => {
    if (!selectedDiscipline) return [];

    const skills = getFormattedSkills(selectedDiscipline);

    // Group skills by module/unit to create tiers
    const tiers: Record<number, typeof skills> = {};
    skills.forEach((skill, index) => {
      // Assign tier based on index (every 4 skills = new tier)
      const tier = Math.floor(index / 4);
      if (!tiers[tier]) {
        tiers[tier] = [];
      }
      tiers[tier].push(skill);
    });

    // Convert to skill tree nodes
    const nodes = skills.map((skill, index) => {
      const tier = Math.floor(index / 4);
      const isCompleted = completedSkillIds.includes(skill.id);

      // Determine prerequisites (previous skill in same tier or last skill of previous tier)
      const prerequisites: string[] = [];
      if (index > 0) {
        // If first in tier, depend on all skills from previous tier
        const positionInTier = index % 4;
        if (positionInTier === 0 && tier > 0) {
          const prevTierSkills = tiers[tier - 1];
          if (prevTierSkills && prevTierSkills.length > 0) {
            // Depend on center skill of previous tier
            const centerIndex = Math.floor(prevTierSkills.length / 2);
            prerequisites.push(prevTierSkills[centerIndex].id);
          }
        } else if (positionInTier > 0) {
          // Depend on previous skill in same tier
          prerequisites.push(skills[index - 1].id);
        }
      }

      // Check if skill is available (prerequisites completed)
      const prerequisitesMet =
        prerequisites.length === 0 ||
        prerequisites.every(prereqId => completedSkillIds.includes(prereqId));

      let status: 'locked' | 'available' | 'in_progress' | 'completed' = 'locked';
      if (isCompleted) {
        status = 'completed';
      } else if (prerequisitesMet) {
        status = 'available';
      }

      // Get appropriate icon
      const skillType = skill.name.toLowerCase();
      let icon = skillTypeIcons.default;
      if (skillType.includes('teoria') || skillType.includes('conceito')) {
        icon = skillTypeIcons.teoria;
      } else if (skillType.includes('prática') || skillType.includes('aplicação')) {
        icon = skillTypeIcons.pratica;
      } else if (skillType.includes('exercício') || skillType.includes('problema')) {
        icon = skillTypeIcons.exercicio;
      }

      return {
        id: skill.id,
        name: skill.name.length > 25 ? skill.name.substring(0, 22) + '...' : skill.name,
        description: skill.description,
        icon,
        xp: skill.difficulty === 'advanced' ? 100 : skill.difficulty === 'intermediate' ? 50 : 25,
        status,
        prerequisites,
        tier,
      };
    });

    return nodes;
  }, [selectedDiscipline, getFormattedSkills, completedSkillIds]);

  const handleSkillClick = (skillId: string) => {
    if (selectedDiscipline) {
      const skill = skillTreeNodes.find(s => s.id === skillId);
      if (skill && skill.status === 'available') {
        onStartSkill(skillId, selectedDiscipline);
      }
    }
  };

  // Calculate stats for selected discipline
  const stats = useMemo(() => {
    if (!selectedDiscipline) return null;

    const total = skillTreeNodes.length;
    const completed = skillTreeNodes.filter(s => s.status === 'completed').length;
    const available = skillTreeNodes.filter(s => s.status === 'available').length;
    const locked = skillTreeNodes.filter(s => s.status === 'locked').length;
    const totalXP = skillTreeNodes.reduce((sum, s) => sum + s.xp, 0);
    const earnedXP = skillTreeNodes
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.xp, 0);

    return { total, completed, available, locked, totalXP, earnedXP };
  }, [skillTreeNodes, selectedDiscipline]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)',
        color: 'white',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <button
            onClick={() => (selectedDiscipline ? setSelectedDiscipline(null) : onNavigate('disciplines'))}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ← {selectedDiscipline ? 'Voltar' : 'Disciplinas'}
          </button>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🌳</span>
              Árvore de Habilidades
            </h1>
            <p style={{ margin: '4px 0 0 0', opacity: 0.7 }}>
              {selectedDiscipline
                ? `Visualize seu progresso em ${disciplines.find((d: { id: string; name: string }) => d.id === selectedDiscipline)?.name || selectedDiscipline}`
                : 'Selecione uma disciplina para ver sua árvore de habilidades'}
            </p>
          </div>
        </div>

        {/* Discipline selection */}
        {!selectedDiscipline ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {disciplines.map((discipline: { id: string; name: string }) => {
              const skills = getFormattedSkills(discipline.id);
              const completed = skills.filter(s => completedSkillIds.includes(s.id)).length;
              const total = skills.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;

              return (
                <div
                  key={discipline.id}
                  onClick={() => setSelectedDiscipline(discipline.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#4caf50';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(76, 175, 80, 0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                      }}
                    >
                      {disciplineIcons[discipline.id] || '📚'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{discipline.name}</div>
                      <div style={{ fontSize: '13px', opacity: 0.7 }}>
                        {total} habilidades
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #4caf50, #81c784)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#81c784' }}>
                      {completed} completas
                    </span>
                    <span style={{ opacity: 0.7 }}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {/* Stats bar */}
            {stats && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    background: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#81c784' }}>
                    {stats.completed}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Completas</div>
                </div>
                <div
                  style={{
                    background: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#64b5f6' }}>
                    {stats.available}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Disponíveis</div>
                </div>
                <div
                  style={{
                    background: 'rgba(128, 128, 128, 0.1)',
                    border: '1px solid rgba(128, 128, 128, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#888' }}>
                    {stats.locked}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Bloqueadas</div>
                </div>
                <div
                  style={{
                    background: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffca28' }}>
                    {stats.earnedXP}/{stats.totalXP}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>XP Ganho</div>
                </div>
              </div>
            )}

            {/* Skill Tree */}
            <SkillTree
              skills={skillTreeNodes}
              onSkillClick={handleSkillClick}
              title={disciplines.find((d: { id: string; name: string }) => d.id === selectedDiscipline)?.name}
            />

            {/* Instructions */}
            <div
              style={{
                marginTop: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💡 Como usar
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', opacity: 0.8, lineHeight: 1.8 }}>
                <li>Clique em habilidades <span style={{ color: '#64b5f6' }}>disponíveis</span> (azuis) para começar a estudar</li>
                <li>Complete habilidades anteriores para desbloquear as próximas</li>
                <li>Habilidades <span style={{ color: '#81c784' }}>verdes</span> estão completas</li>
                <li>Habilidades <span style={{ color: '#888' }}>cinzas</span> estão bloqueadas</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SkillTreePage;
