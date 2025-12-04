import React, { useState } from 'react';

interface ReportData {
  title: string;
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalStudyTime: number;
    sessionsCount: number;
    skillsStudied: number;
    totalXPEarned: number;
    averagePerformance: number;
    streakDays: number;
  };
  charts: Array<{
    type: 'line' | 'bar' | 'pie';
    title: string;
    data: any;
  }>;
  insights: string[];
}

interface ReportExportProps {
  data: ReportData;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      success: string;
      warning: string;
      error: string;
      border: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
  };
}

export const ReportExport: React.FC<ReportExportProps> = ({ data, theme }) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json' | 'csv'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const generatePDF = (): string => {
    // This is a simplified HTML-to-PDF simulation
    // In a real app, you'd use a library like jsPDF or Puppeteer
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <style>
    body {
      font-family: ${theme.fonts.secondary};
      background: ${theme.colors.background};
      color: ${theme.colors.text};
      margin: 0;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid ${theme.colors.primary};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-family: ${theme.fonts.primary};
      font-size: 24px;
      color: ${theme.colors.primary};
      margin: 0;
    }
    .subtitle {
      color: ${theme.colors.textSecondary};
      margin: 5px 0;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: ${theme.colors.surface};
      border: 1px solid ${theme.colors.border};
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: ${theme.colors.primary};
    }
    .summary-label {
      font-size: 12px;
      color: ${theme.colors.textSecondary};
      margin-top: 5px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-family: ${theme.fonts.primary};
      font-size: 18px;
      color: ${theme.colors.text};
      border-bottom: 1px solid ${theme.colors.border};
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .insight-list {
      list-style: none;
      padding: 0;
    }
    .insight-list li {
      background: ${theme.colors.surface};
      border-left: 4px solid ${theme.colors.primary};
      padding: 10px 15px;
      margin-bottom: 10px;
    }
    .footer {
      text-align: center;
      color: ${theme.colors.textSecondary};
      font-size: 12px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid ${theme.colors.border};
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${data.title}</h1>
    <div class="subtitle">
      Período: ${new Date(data.dateRange.start).toLocaleDateString('pt-BR')} - ${new Date(data.dateRange.end).toLocaleDateString('pt-BR')}<br>
      Gerado em: ${new Date(data.generatedAt).toLocaleString('pt-BR')}
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${formatTime(data.summary.totalStudyTime)}</div>
      <div class="summary-label">Tempo de Estudo</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.sessionsCount}</div>
      <div class="summary-label">Sessões</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.skillsStudied}</div>
      <div class="summary-label">Habilidades Estudadas</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.totalXPEarned.toLocaleString()}</div>
      <div class="summary-label">XP Ganhos</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.averagePerformance.toFixed(1)}%</div>
      <div class="summary-label">Performance Média</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.streakDays}</div>
      <div class="summary-label">Dias de Streak</div>
    </div>
  </div>

  ${data.insights.length > 0 ? `
  <div class="section">
    <h2 class="section-title">🎯 Insights de Aprendizado</h2>
    <ul class="insight-list">
      ${data.insights.map(insight => `<li>${insight}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    Relatório gerado pelo ITA Role Play - Sistema de Aprendizagem
  </div>
</body>
</html>
    `;
  };

  const generateCSV = (): string => {
    const csvData = [
      ['Métrica', 'Valor'],
      ['Tempo Total de Estudo (minutos)', data.summary.totalStudyTime.toString()],
      ['Número de Sessões', data.summary.sessionsCount.toString()],
      ['Habilidades Estudadas', data.summary.skillsStudied.toString()],
      ['XP Total Ganhos', data.summary.totalXPEarned.toString()],
      ['Performance Média (%)', data.summary.averagePerformance.toFixed(1)],
      ['Dias de Streak', data.summary.streakDays.toString()],
      ['Data de Geração', new Date(data.generatedAt).toLocaleString('pt-BR')],
    ];

    return csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const generateJSON = (): string => {
    return JSON.stringify(data, null, 2);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let content: string;
      let fileName: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'pdf':
          content = generatePDF();
          fileName = `relatorio-${new Date().toISOString().split('T')[0]}.html`;
          mimeType = 'text/html';
          break;
        case 'csv':
          content = generateCSV();
          fileName = `relatorio-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = generateJSON();
          fileName = `relatorio-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        default:
          throw new Error('Formato não suportado');
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Ocorreu um erro ao exportar o relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontFamily: theme.fonts.primary,
          fontSize: '1rem',
          color: theme.colors.text,
          margin: 0,
          marginBottom: '20px',
        }}
      >
        📄 Exportar Relatório
      </h3>

      {/* Format Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: theme.fonts.secondary,
            fontSize: '0.875rem',
            color: theme.colors.text,
            marginBottom: '8px',
          }}
        >
          Formato de Exportação:
        </label>
        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >
          {[
            { value: 'pdf', label: 'PDF (Visual)', description: 'Relatório visual formatado' },
            { value: 'csv', label: 'CSV', description: 'Dados para planilhas' },
            { value: 'json', label: 'JSON', description: 'Dados estruturados' },
          ].map((format) => (
            <label
              key={format.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: exportFormat === format.value ? theme.colors.primary : theme.colors.background,
                color: exportFormat === format.value ? theme.colors.background : theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: 1,
              }}
            >
              <input
                type="radio"
                value={format.value}
                checked={exportFormat === format.value}
                onChange={(e) => setExportFormat(e.target.value as any)}
                style={{ margin: 0 }}
              />
              <div>
                <div style={{ fontWeight: '500' }}>{format.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {format.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          backgroundColor: theme.colors.background,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.secondary,
            fontSize: '0.875rem',
            color: theme.colors.textSecondary,
            marginBottom: '8px',
          }}
        >
          Resumo do Relatório:
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ color: theme.colors.text, fontWeight: '600' }}>
              {formatTime(data.summary.totalStudyTime)}
            </div>
            <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>
              Tempo de estudo
            </div>
          </div>
          <div>
            <div style={{ color: theme.colors.text, fontWeight: '600' }}>
              {data.summary.sessionsCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>
              Sessões
            </div>
          </div>
          <div>
            <div style={{ color: theme.colors.text, fontWeight: '600' }}>
              {data.summary.skillsStudied}
            </div>
            <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>
              Habilidades
            </div>
          </div>
          <div>
            <div style={{ color: theme.colors.text, fontWeight: '600' }}>
              {data.summary.totalXPEarned.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>
              XP Total
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        style={{
          width: '100%',
          padding: '14px 20px',
          backgroundColor: isExporting ? theme.colors.border : theme.colors.primary,
          color: isExporting ? theme.colors.textSecondary : theme.colors.background,
          border: 'none',
          borderRadius: '8px',
          fontFamily: theme.fonts.primary,
          fontSize: '1rem',
          fontWeight: '600',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {isExporting ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${theme.colors.textSecondary}`,
                borderTop: `2px solid transparent`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Exportando...
          </>
        ) : (
          <>
            📥 Exportar Relatório
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportExport;