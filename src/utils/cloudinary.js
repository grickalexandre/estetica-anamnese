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
  if (!preset) throw new Error('Upload preset não informado');

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  if (folder) formData.append('folder', folder);

  console.log('📤 Enviando requisição para:', endpoint);
  console.log('📤 FormData contents:', {
    file: file.name,
    upload_preset: preset,
    folder: folder || 'não especificado'
  });

  try {
    const response = await fetch(endpoint, { method: 'POST', body: formData });
    console.log('📤 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Erro na resposta:', text);
      throw new Error(`Falha no upload Cloudinary: ${response.status} ${text}`);
    }
    
    const json = await response.json();
    console.log('✅ Upload bem-sucedido:', {
      public_id: json.public_id,
      secure_url: json.secure_url,
      format: json.format,
      width: json.width,
      height: json.height
    });
    
    // secure_url é a URL pública HTTPS do asset
    return json.secure_url;
  } catch (error) {
    console.error('❌ Erro no upload Cloudinary:', error);
    throw error;
  }
}
