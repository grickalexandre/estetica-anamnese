export async function uploadToCloudinary(file, { preset, folder, cloudName = 'dkliyeyoq' }) {
  console.log('📤 Iniciando upload para Cloudinary:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    preset,
    folder,
    cloudName
  });

  if (!file) throw new Error('Arquivo não encontrado para upload');

  // Validar tipo de arquivo
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.');
  }

  // Validar tamanho (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 10MB.');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  // Estratégia 1: Tentar com preset se fornecido
  if (preset) {
    try {
      console.log('📤 Tentativa 1: Upload com preset', preset);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      if (folder) formData.append('folder', folder);

      const response = await fetch(endpoint, { method: 'POST', body: formData });
      
      if (response.ok) {
        const json = await response.json();
        console.log('✅ Upload com preset bem-sucedido:', json.secure_url);
        return json.secure_url;
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Upload com preset falhou:', errorText);
        throw new Error(`Preset upload failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Erro no upload com preset:', error.message);
      // Continuar para estratégia 2
    }
  }

  // Estratégia 2: Upload sem preset (unsigned)
  try {
    console.log('📤 Tentativa 2: Upload sem preset (unsigned)');
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const response = await fetch(endpoint, { method: 'POST', body: formData });
    
    if (response.ok) {
      const json = await response.json();
      console.log('✅ Upload sem preset bem-sucedido:', json.secure_url);
      return json.secure_url;
    } else {
      const errorText = await response.text();
      console.error('❌ Upload sem preset falhou:', errorText);
      throw new Error(`Unsigned upload failed: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Erro no upload sem preset:', error);
    throw new Error(`Erro ao fazer upload da foto: ${error.message}`);
  }
}
