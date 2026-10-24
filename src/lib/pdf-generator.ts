import jsPDF from 'jspdf';
import { Match, PlayerProfile } from '@/types';

/**
 * Gera a Súmula Oficial da Partida em PDF (Formato A4 Elegante)
 */
export function generateMatchPDF(match: Match, allPlayers: PlayerProfile[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Verde Futebol & Azul UGTSIC
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setFillColor(22, 163, 74); // Verde Futebol
  doc.rect(0, 42, 105, 3, 'F');
  doc.setFillColor(2, 132, 199); // Azul UGTSIC
  doc.rect(105, 42, 105, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('UGTSIC LEAGUE — SÚMULA OFICIAL', 105, 17, { align: 'center' });

  doc.setTextColor(186, 230, 253);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Futebol Society Corporativo • SESAP / G Trigueiro (Natal/RN)', 105, 25, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`${match.title} | ${match.matchDate} | ${match.location}`, 105, 33, { align: 'center' });

  // Placar do Jogo
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 52, 180, 30, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, 52, 180, 30, 3, 3, 'D');

  doc.setTextColor(29, 78, 216);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(match.teamAName, 55, 63, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(String(match.scoreTeamA), 55, 75, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(100, 116, 139);
  doc.text('X', 105, 71, { align: 'center' });

  doc.setTextColor(220, 38, 38);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(match.teamBName, 155, 63, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(String(match.scoreTeamB), 155, 75, { align: 'center' });

  // Escalações
  const azulPlayers = match.presences.filter((p) => p.team === 'azul');
  const vermelhoPlayers = match.presences.filter((p) => p.team === 'vermelho');

  let currentY = 90;
  doc.setFillColor(219, 234, 254);
  doc.rect(15, currentY, 86, 8, 'F');
  doc.setTextColor(29, 78, 216);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ESCALAÇÃO TIME AZUL', 18, currentY + 5.5);

  currentY += 13;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (azulPlayers.length === 0) {
    doc.text('Aguardando sorteio oficial.', 18, currentY);
    currentY += 6;
  } else {
    azulPlayers.forEach((p) => {
      const role =
        p.positionPreference === 'goleiro' || p.player.favoritePosition === 'goleiro'
          ? '[GOLEIRO]'
          : p.isReserve
          ? '[RESERVA]'
          : '[LINHA]';
      doc.text(`• #${p.player.shirtNumber} ${p.player.fullName} ${role}`, 18, currentY);
      currentY += 6;
    });
  }

  let currentYVermelho = 90;
  doc.setFillColor(254, 226, 226);
  doc.rect(109, currentYVermelho, 86, 8, 'F');
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ESCALAÇÃO TIME VERMELHO', 112, currentYVermelho + 5.5);

  currentYVermelho += 13;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (vermelhoPlayers.length === 0) {
    doc.text('Aguardando sorteio oficial.', 112, currentYVermelho);
    currentYVermelho += 6;
  } else {
    vermelhoPlayers.forEach((p) => {
      const role =
        p.positionPreference === 'goleiro' || p.player.favoritePosition === 'goleiro'
          ? '[GOLEIRO]'
          : p.isReserve
          ? '[RESERVA]'
          : '[LINHA]';
      doc.text(`• #${p.player.shirtNumber} ${p.player.fullName} ${role}`, 112, currentYVermelho);
      currentYVermelho += 6;
    });
  }

  // Gols e Assistências
  let nextY = Math.max(currentY, currentYVermelho) + 8;
  doc.setFillColor(220, 252, 231);
  doc.rect(15, nextY, 180, 8, 'F');
  doc.setTextColor(21, 128, 61);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('GOLS E ASSISTÊNCIAS DA PARTIDA', 18, nextY + 5.5);

  nextY += 13;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (match.events.length === 0) {
    doc.text('Nenhum gol registrado na súmula até o momento.', 18, nextY);
    nextY += 7;
  } else {
    match.events.forEach((ev) => {
      const teamLabel = ev.team === 'azul' ? 'Time Azul' : 'Time Vermelho';
      const assist = ev.assistPlayerName ? ` | Assistência: ${ev.assistPlayerName}` : '';
      doc.text(`• ${ev.minute}' - GOL: ${ev.playerName} (${teamLabel})${assist}`, 18, nextY);
      nextY += 6;
    });
  }

  // Destaques por Posição (Ranking de Estrelas)
  nextY += 6;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, nextY, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTAQUES POR POSIÇÃO (RANKING 5 ESTRELAS)', 18, nextY + 5.5);

  nextY += 13;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  const sortedByStars = [...allPlayers].sort((a, b) => b.starsRating - a.starsRating);
  const bestGk = sortedByStars.find((p) => p.favoritePosition === 'goleiro');
  const bestDef = sortedByStars.find((p) => p.favoritePosition === 'zagueiro');
  const bestMid = sortedByStars.find((p) => p.favoritePosition === 'meio-campo');
  const bestAtt = sortedByStars.find((p) => p.favoritePosition === 'atacante');

  doc.text(`• Craque Geral (MVP): ${sortedByStars[0]?.fullName || '-'} (${sortedByStars[0]?.starsRating.toFixed(1)} Estrelas)`, 18, nextY);
  nextY += 6;
  doc.text(`• Melhor Goleiro: ${bestGk?.fullName || '-'} (${bestGk?.starsRating.toFixed(1)} Estrelas)`, 18, nextY);
  nextY += 6;
  doc.text(`• Melhor Zagueiro: ${bestDef?.fullName || '-'} (${bestDef?.starsRating.toFixed(1)} Estrelas)`, 18, nextY);
  nextY += 6;
  doc.text(`• Melhor Meio-Campo: ${bestMid?.fullName || '-'} (${bestMid?.starsRating.toFixed(1)} Estrelas)`, 18, nextY);
  nextY += 6;
  doc.text(`• Melhor Atacante: ${bestAtt?.fullName || '-'} (${bestAtt?.starsRating.toFixed(1)} Estrelas)`, 18, nextY);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `UGTSIC League • Gerado em ${new Date().toLocaleDateString('pt-BR')} • SESAP / G Trigueiro`,
    105,
    285,
    { align: 'center' }
  );

  doc.save(`Sumula-UGTSIC-League-${match.id}.pdf`);
}

/**
 * Gera Planilha / Tabela Completa de Ranqueamento dos Jogadores em PDF
 */
export function generateRankingPDF(allPlayers: PlayerProfile[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(21, 128, 61); // Verde Futebol
  doc.rect(0, 0, 210, 36, 'F');
  doc.setFillColor(2, 132, 199); // Azul UGTSIC
  doc.rect(0, 36, 210, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PLANILHA OFICIAL DE RANQUEAMENTO — UGTSIC LEAGUE', 105, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Desempenho Geral, Estrelas (1 a 5), Artilharia e Assistências • SESAP / G Trigueiro', 105, 25, { align: 'center' });

  const sorted = [...allPlayers].sort(
    (a, b) => b.starsRating - a.starsRating || b.overallRating - a.overallRating
  );

  // Cabeçalho da Tabela
  let y = 48;
  doc.setFillColor(15, 23, 42);
  doc.rect(12, y, 186, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');

  doc.text('#', 15, y + 6);
  doc.text('JOGADOR', 24, y + 6);
  doc.text('POSIÇÃO', 88, y + 6);
  doc.text('ESTRELAS', 118, y + 6);
  doc.text('OVR', 142, y + 6);
  doc.text('GOLS', 156, y + 6);
  doc.text('ASSIST.', 170, y + 6);
  doc.text('VIT.', 186, y + 6);

  y += 9;
  doc.setFont('helvetica', 'normal');

  sorted.forEach((p, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(241, 245, 249);
      doc.rect(12, y, 186, 8, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', idx < 3 ? 'bold' : 'normal');
    doc.text(`${idx + 1}º`, 15, y + 5.5);
    doc.text(`${p.fullName} (#${p.shirtNumber})`, 24, y + 5.5);
    doc.text(p.favoritePosition.toUpperCase(), 88, y + 5.5);
    doc.text(`${p.starsRating.toFixed(1)} / 5.0`, 118, y + 5.5);
    doc.text(String(p.overallRating), 142, y + 5.5);
    doc.text(String(p.goals), 158, y + 5.5);
    doc.text(String(p.assists), 174, y + 5.5);
    doc.text(String(p.victories), 188, y + 5.5);

    y += 8;
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Documento gerado automaticamente pelo sistema UGTSIC League em ${new Date().toLocaleDateString('pt-BR')}`,
    105,
    285,
    { align: 'center' }
  );

  doc.save('Planilha-Ranqueamento-UGTSIC-League.pdf');
}

/**
 * Gera o texto formatado para WhatsApp com Escalação, Placar e Destaques
 * Visual limpo, sem poluição de ícones repetidos e 100% compatível com UTF-8 no WhatsApp Web/Mobile
 */
export function generateWhatsAppSummary(match: Match, allPlayers?: PlayerProfile[]): string {
  const azul = match.presences.filter((p) => p.team === 'azul');
  const vermelho = match.presences.filter((p) => p.team === 'vermelho');

  const cleanPlayerName = (name: string) => name.replace(/\s*\(.*?\)\s*/g, '').trim();

  let text = `★ *UGTSIC LEAGUE — SESAP / G TRIGUEIRO* ★\n`;
  text += `_${match.matchDate}  •  ${match.location}_\n`;
  text += `──────────────────────\n\n`;

  text += `▸ *PLACAR DA PARTIDA*\n`;
  text += `*${match.teamAName}* ${match.scoreTeamA} x ${match.scoreTeamB} *${match.teamBName}*\n\n`;

  if (azul.length > 0 && vermelho.length > 0) {
    text += `▸ *ESCALAÇÕES DA RODADA*\n\n`;
    text += `*${match.teamAName}*\n`;
    azul.forEach((p) => {
      const tag = p.isReserve
        ? ' _(Reserva)_'
        : p.positionPreference === 'goleiro'
        ? ' _(Goleiro)_'
        : '';
      text += `• #${p.player.shirtNumber} ${cleanPlayerName(p.player.fullName)}${tag}\n`;
    });

    text += `\n*${match.teamBName}*\n`;
    vermelho.forEach((p) => {
      const tag = p.isReserve
        ? ' _(Reserva)_'
        : p.positionPreference === 'goleiro'
        ? ' _(Goleiro)_'
        : '';
      text += `• #${p.player.shirtNumber} ${cleanPlayerName(p.player.fullName)}${tag}\n`;
    });
    text += `\n`;
  }

  if (match.events.length > 0) {
    text += `▸ *GOLS DA SÚMULA*\n`;
    match.events.forEach((ev) => {
      const scorer = cleanPlayerName(ev.playerName);
      const assist = ev.assistPlayerName ? ` _(passe de ${cleanPlayerName(ev.assistPlayerName)})_` : '';
      text += `• ${ev.minute}' *${scorer}* [${ev.team === 'azul' ? 'Azul' : 'Vermelho'}]${assist}\n`;
    });
    text += `\n`;
  }

  text += `──────────────────────\n`;
  if (allPlayers && allPlayers.length > 0) {
    const top = [...allPlayers].sort((a, b) => b.starsRating - a.starsRating)[0];
    if (top) {
      text += `★ *Líder do Ranking:* ${cleanPlayerName(top.fullName)} (${top.starsRating.toFixed(1)} ★)\n`;
    }
  }

  text += `_Acesse o app UGTSIC League para votar (1 a 5 estrelas)!_`;
  return text;
}

/**
 * Abre o compartilhamento direto no WhatsApp (usando api.whatsapp.com/send para preservar UTF-8 sem '')
 * e também copia para a área de transferência
 */
export function shareViaWhatsApp(match: Match, allPlayers?: PlayerProfile[]) {
  const text = generateWhatsAppSummary(match, allPlayers);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  if (typeof window !== 'undefined') {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return text;
}
