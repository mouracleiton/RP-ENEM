/**
 * Sync Settings Page
 * Manage decentralized storage, P2P connections, and data backup
 */

import React, { useState, useEffect } from 'react';
import { useGamePersistence } from '@ita-rp/game-logic';

interface BackupInfo {
  id: string;
  type: string;
  timestamp: number;
  data: unknown;
}

interface SyncSettingsPageProps {
  onNavigate?: (page: string) => void;
}

export const SyncSettingsPage: React.FC<SyncSettingsPageProps> = ({ onNavigate }) => {
  const {
    syncStatus,
    isInitialized,
    isLoading,
    error,
    saveToStorage,
    loadFromStorage,
    exportGameData,
    importGameData,
    createBackup,
    restoreBackup,
    listBackups,
    uploadToIPFS,
    peerId,
    connectedPeers,
    generateShareCode,
    connectWithCode,
    completeConnection,
    getStorageStats,
  } = useGamePersistence();

  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [stats, setStats] = useState<{
    indexedDB: { totalSize: string } | null;
    p2p: { connectedPeers: number };
  } | null>(null);
  const [shareCode, setShareCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [answerCode, setAnswerCode] = useState<string>('');
  const [pendingPeerId, setPendingPeerId] = useState<string>('');
  const [exportedData, setExportedData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [ipfsCid, setIpfsCid] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isInitialized) {
      loadBackups();
      loadStats();
    }
  }, [isInitialized]);

  const loadBackups = async () => {
    const backupList = await listBackups();
    setBackups(backupList as BackupInfo[]);
  };

  const loadStats = async () => {
    const storageStats = await getStorageStats();
    setStats(storageStats);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleManualSave = async () => {
    try {
      await saveToStorage();
      showNotification('success', 'Dados salvos com sucesso!');
    } catch (err) {
      showNotification('error', 'Erro ao salvar dados');
    }
  };

  const handleManualLoad = async () => {
    try {
      await loadFromStorage();
      showNotification('success', 'Dados carregados com sucesso!');
    } catch (err) {
      showNotification('error', 'Erro ao carregar dados');
    }
  };

  const handleExport = async (encrypted: boolean = false) => {
    try {
      const data = await exportGameData(encrypted, encrypted ? password : undefined);
      setExportedData(data);
      showNotification('success', 'Dados exportados!');
    } catch (err) {
      showNotification('error', 'Erro ao exportar dados');
    }
  };

  const handleImport = async () => {
    if (!importData) {
      showNotification('error', 'Cole os dados para importar');
      return;
    }
    try {
      const result = await importGameData(importData, password || undefined);
      if (result.success) {
        showNotification('success', `Importados ${result.recordsImported} registros!`);
        setImportData('');
      } else {
        showNotification('error', result.errors.join(', '));
      }
    } catch (err) {
      showNotification('error', 'Erro ao importar dados');
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup();
      await loadBackups();
      showNotification('success', 'Backup criado!');
    } catch (err) {
      showNotification('error', 'Erro ao criar backup');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      const success = await restoreBackup(backupId);
      if (success) {
        showNotification('success', 'Backup restaurado!');
      } else {
        showNotification('error', 'Falha ao restaurar backup');
      }
    } catch (err) {
      showNotification('error', 'Erro ao restaurar backup');
    }
  };

  const handleGenerateShareCode = async () => {
    try {
      const code = await generateShareCode();
      setShareCode(code);
      showNotification('success', 'Código de compartilhamento gerado!');
    } catch (err) {
      showNotification('error', 'Erro ao gerar código');
    }
  };

  const handleConnectWithCode = async () => {
    if (!inputCode) {
      showNotification('error', 'Cole o código de conexão');
      return;
    }
    try {
      const answer = await connectWithCode(inputCode);
      setAnswerCode(answer);
      showNotification('success', 'Conectado! Envie o código de resposta.');
    } catch (err) {
      showNotification('error', 'Erro ao conectar');
    }
  };

  const handleCompleteConnection = async () => {
    if (!answerCode || !pendingPeerId) {
      showNotification('error', 'Código de resposta necessário');
      return;
    }
    try {
      await completeConnection(answerCode, pendingPeerId);
      showNotification('success', 'Conexão P2P estabelecida!');
      setAnswerCode('');
      setPendingPeerId('');
    } catch (err) {
      showNotification('error', 'Erro ao completar conexão');
    }
  };

  const handleUploadIPFS = async () => {
    try {
      const result = await uploadToIPFS();
      if (result) {
        setIpfsCid(result.cid);
        showNotification('success', `Enviado ao IPFS! CID: ${result.cid.substring(0, 20)}...`);
      }
    } catch (err) {
      showNotification('error', 'Erro ao enviar para IPFS');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('success', 'Copiado para área de transferência!');
  };

  const downloadExport = () => {
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ita-rp-game-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f3460 100%)',
      color: 'white',
      padding: '20px',
    }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          padding: '15px 25px',
          borderRadius: '10px',
          background: notification.type === 'success' ? '#00c853' : '#ff1744',
          color: 'white',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {notification.message}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <button
            onClick={() => onNavigate?.('dashboard')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Voltar
          </button>
          <h1 style={{ margin: 0 }}>Sincronização e Backup</h1>
        </div>

        {/* Status Section */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ marginTop: 0 }}>Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ background: 'rgba(0,200,100,0.1)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Status</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {isLoading ? 'Carregando...' : isInitialized ? 'Inicializado' : 'Não inicializado'}
              </div>
            </div>
            <div style={{ background: 'rgba(0,100,200,0.1)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Última Sincronização</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {syncStatus.lastSyncTime ? syncStatus.lastSyncTime.toLocaleTimeString() : 'Nunca'}
              </div>
            </div>
            <div style={{ background: 'rgba(200,100,0,0.1)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Peers Conectados</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{connectedPeers.length}</div>
            </div>
            <div style={{ background: 'rgba(100,0,200,0.1)', padding: '15px', borderRadius: '10px' }}>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Tamanho Total</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats?.indexedDB?.totalSize || 'N/A'}</div>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: '15px', color: '#ff6b6b', padding: '10px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
              Erro: {error}
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleManualSave}
              disabled={syncStatus.isSyncing}
              style={{
                background: 'linear-gradient(45deg, #00c853, #64dd17)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {syncStatus.isSyncing ? 'Salvando...' : 'Salvar Agora'}
            </button>
            <button
              onClick={handleManualLoad}
              style={{
                background: 'linear-gradient(45deg, #2196f3, #03a9f4)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Carregar do Storage
            </button>
          </div>
        </div>

        {/* P2P Section */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ marginTop: 0 }}>Sincronização P2P</h2>
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>
            Conecte-se com outros dispositivos para sincronizar dados diretamente, sem servidor.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px' }}>Seu Peer ID</div>
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '10px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              wordBreak: 'break-all',
            }}>
              {peerId || 'Não inicializado'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Generate Share Code */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px' }}>
              <h3 style={{ marginTop: 0 }}>Compartilhar</h3>
              <button
                onClick={handleGenerateShareCode}
                style={{
                  background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                  border: 'none',
                  color: 'black',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%',
                  marginBottom: '10px',
                }}
              >
                Gerar Código
              </button>
              {shareCode && (
                <>
                  <textarea
                    value={shareCode}
                    readOnly
                    style={{
                      width: '100%',
                      height: '80px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      resize: 'none',
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(shareCode)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '5px',
                    }}
                  >
                    Copiar
                  </button>
                </>
              )}
            </div>

            {/* Connect with Code */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px' }}>
              <h3 style={{ marginTop: 0 }}>Conectar</h3>
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Cole o código de compartilhamento aqui..."
                style={{
                  width: '100%',
                  height: '80px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  resize: 'none',
                  marginBottom: '10px',
                }}
              />
              <button
                onClick={handleConnectWithCode}
                style={{
                  background: 'linear-gradient(45deg, #9c27b0, #673ab7)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%',
                }}
              >
                Conectar
              </button>
              {answerCode && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Código de resposta (envie para o outro peer):</div>
                  <textarea
                    value={answerCode}
                    readOnly
                    style={{
                      width: '100%',
                      height: '60px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      resize: 'none',
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(answerCode)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '5px',
                    }}
                  >
                    Copiar
                  </button>
                </div>
              )}
            </div>
          </div>

          {connectedPeers.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Peers Conectados</h3>
              {connectedPeers.map(peer => (
                <div key={peer} style={{
                  background: 'rgba(0,200,100,0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '5px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}>
                  {peer}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export/Import Section */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ marginTop: 0 }}>Exportar / Importar</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Export */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px' }}>
              <h3 style={{ marginTop: 0 }}>Exportar Dados</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button
                  onClick={() => handleExport(false)}
                  style={{
                    background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    flex: 1,
                  }}
                >
                  JSON
                </button>
                <button
                  onClick={() => handleExport(true)}
                  style={{
                    background: 'linear-gradient(45deg, #ff5722, #f44336)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    flex: 1,
                  }}
                >
                  Encriptado
                </button>
              </div>
              {exportedData && (
                <>
                  <textarea
                    value={exportedData}
                    readOnly
                    style={{
                      width: '100%',
                      height: '100px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '10px',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      resize: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => copyToClipboard(exportedData)} style={smallButtonStyle}>
                      Copiar
                    </button>
                    <button onClick={downloadExport} style={smallButtonStyle}>
                      Download
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Import */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px' }}>
              <h3 style={{ marginTop: 0 }}>Importar Dados</h3>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole os dados exportados aqui..."
                style={{
                  width: '100%',
                  height: '100px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  resize: 'none',
                  marginBottom: '10px',
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (se encriptado)"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px',
                  marginBottom: '10px',
                }}
              />
              <button
                onClick={handleImport}
                style={{
                  background: 'linear-gradient(45deg, #2196f3, #03a9f4)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%',
                }}
              >
                Importar
              </button>
            </div>
          </div>
        </div>

        {/* IPFS Section */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ marginTop: 0 }}>IPFS (Armazenamento Distribuído)</h2>
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>
            Faça upload dos seus dados para a rede IPFS para backup permanente e descentralizado.
          </p>

          <button
            onClick={handleUploadIPFS}
            style={{
              background: 'linear-gradient(45deg, #00bcd4, #009688)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '15px',
            }}
          >
            Upload para IPFS
          </button>

          {ipfsCid && (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '15px',
              borderRadius: '10px',
            }}>
              <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px' }}>CID (Content Identifier)</div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all',
                marginBottom: '10px',
              }}>
                {ipfsCid}
              </div>
              <button onClick={() => copyToClipboard(ipfsCid)} style={smallButtonStyle}>
                Copiar CID
              </button>
            </div>
          )}
        </div>

        {/* Backups Section */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '20px',
        }}>
          <h2 style={{ marginTop: 0 }}>Backups Locais</h2>

          <button
            onClick={handleCreateBackup}
            style={{
              background: 'linear-gradient(45deg, #673ab7, #9c27b0)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            Criar Backup
          </button>

          {backups.length === 0 ? (
            <p style={{ opacity: 0.5 }}>Nenhum backup encontrado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {backups.slice(0, 10).map((backup) => (
                <div
                  key={backup.id}
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '15px',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{backup.type || 'Backup'}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {new Date(backup.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestoreBackup(backup.id)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const smallButtonStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
};

export default SyncSettingsPage;
