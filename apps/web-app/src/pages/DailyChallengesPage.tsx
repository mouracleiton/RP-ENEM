/**
 * Daily Challenges Page
 * Full page view for daily missions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DailyChallenges } from '@ita-rp/ui-components';
import { dailyChallengeSystem, useGameStore, type DailyChallenge } from '@ita-rp/game-logic';

interface DailyChallengesPageProps {
  onNavigate: (page: string) => void;
  onXPEarned?: (amount: number) => void;
}

export const DailyChallengesPage: React.FC<DailyChallengesPageProps> = ({
  onNavigate,
  onXPEarned,
}) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [notification, setNotification] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  const addXP = useGameStore(state => state.addXP);

  useEffect(() => {
    // Load challenges
    const loadedChallenges = dailyChallengeSystem.getChallenges();
    setChallenges(loadedChallenges);
    setTimeRemaining(dailyChallengeSystem.getTimeRemaining());

    // Update time every second
    const interval = setInterval(() => {
      setTimeRemaining(dailyChallengeSystem.getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClaimReward = useCallback(
    (challengeId: string) => {
      const reward = dailyChallengeSystem.claimReward(challengeId);

      if (reward) {
        // Add XP to player
        addXP(reward.xp);
        onXPEarned?.(reward.xp);

        // Update challenges state
        setChallenges(dailyChallengeSystem.getChallenges());

        // Show notification
        let message = `+${reward.xp} XP recebido!`;
        if (reward.bonus) {
          if (reward.bonus.type === 'streak_protection') {
            message += ' + Proteção de Streak!';
          } else if (reward.bonus.type === 'xp_multiplier') {
            message += ` + ${reward.bonus.value}x XP Bônus!`;
          }
        }

        setNotification({ type: 'success', message });
        setTimeout(() => setNotification(null), 3000);
      }
    },
    [addXP, onXPEarned]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)',
        color: 'white',
        padding: '20px',
      }}
    >
      {/* Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background:
              notification.type === 'success'
                ? 'linear-gradient(135deg, #4caf50, #81c784)'
                : 'linear-gradient(135deg, #2196f3, #64b5f6)',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{notification.message}</div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back button */}
        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ← Voltar ao Dashboard
        </button>

        {/* Daily Challenges Component */}
        <DailyChallenges
          challenges={challenges}
          onClaimReward={handleClaimReward}
          timeRemaining={timeRemaining}
        />

        {/* Tips section */}
        <div
          style={{
            marginTop: '30px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💡 Dicas
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', opacity: 0.8, lineHeight: 1.8 }}>
            <li>Missões fáceis são ótimas para começar o dia</li>
            <li>Missões difíceis dão recompensas bônus como proteção de streak</li>
            <li>Complete todas as missões para maximizar seu XP diário</li>
            <li>As missões são renovadas todos os dias à meia-noite</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DailyChallengesPage;
