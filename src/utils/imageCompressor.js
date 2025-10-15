import Compressor from 'compressorjs';

/**
 * Comprime uma imagem usando CompressorJS
 * @param {File} file - Arquivo de imagem original
 * @param {Object} options - Opções de compressão
 * @returns {Promise<File>} - Arquivo comprimido
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: options.quality || 0.8, // Qualidade da compressão (0-1)
      maxWidth: options.maxWidth || 1920, // Largura máxima
      maxHeight: options.maxHeight || 1920, // Altura máxima
      mimeType: options.mimeType || 'image/webp', // Formato de saída
      convertSize: 500000, // Converte para WebP se > 500KB
      success(result) {
        // Criar um novo File a partir do Blob
        const compressedFile = new File(
          [result],
          file.name.replace(/\.[^/.]+$/, '.webp'),
          {
            type: result.type,
            lastModified: Date.now(),
          }
        );
        resolve(compressedFile);
      },
      error(err) {
        reject(err);
      },
    });
  });
};

/**
 * Comprime uma imagem de perfil (menor resolução)
 * @param {File} file - Arquivo de imagem original
 * @returns {Promise<File>} - Arquivo comprimido
 */
export const compressProfileImage = (file) => {
  return compressImage(file, {
    quality: 0.8,
    maxWidth: 500,
    maxHeight: 500,
    mimeType: 'image/webp',
  });
};

/**
 * Comprime uma imagem de anamnese (média resolução)
 * @param {File} file - Arquivo de imagem original
 * @returns {Promise<File>} - Arquivo comprimido
 */
export const compressAnamneseImage = (file) => {
  return compressImage(file, {
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1920,
    mimeType: 'image/webp',
  });
};

/**
 * Valida se o arquivo é uma imagem válida
 * @param {File} file - Arquivo para validar
 * @returns {boolean} - true se for imagem válida
 */
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Formato de imagem inválido. Use JPG, PNG ou WebP.');
  }

  if (file.size > maxSize) {
    throw new Error('Imagem muito grande. Tamanho máximo: 10MB.');
  }

  return true;
};

