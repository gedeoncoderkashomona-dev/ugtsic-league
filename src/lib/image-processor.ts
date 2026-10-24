/**
 * Processador de imagem Client-Side.
 * Suporta arquivos de fotos de até 100MB (câmera do celular em 4K/RAW),
 * redimensionando e convertendo para formato otimizado WebP/JPEG com recorte central.
 */
export async function processProfileAvatar(file: File, maxDimension = 400): Promise<string> {
  // Validação preventiva do tamanho (100MB)
  const maxBytes = 100 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('A imagem ultrapassa o limite máximo de 100MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erro ao ler arquivo da imagem.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido.'));
      img.onload = () => {
        try {
          // Criação do Canvas para corte e redimensionamento circular/quadrado
          const canvas = document.createElement('canvas');
          canvas.width = maxDimension;
          canvas.height = maxDimension;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Falha ao inicializar o contexto gráfico.'));
            return;
          }

          // Calcular proporções para manter o centro (aspect ratio cover)
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          // Desenhar imagem centralizada
          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            maxDimension,
            maxDimension
          );

          // Exportar em WebP com qualidade 85% (cerca de 50KB-120KB)
          const dataUrl = canvas.toDataURL('image/webp', 0.85);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Falha ao carregar conteúdo da imagem.'));
      }
    };

    reader.readAsDataURL(file);
  });
}

