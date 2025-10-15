export async function uploadToCloudinary(file, { preset, folder, cloudName = 'dkliyeyoq' }) {
  if (!file) throw new Error('Arquivo não encontrado para upload');
  if (!preset) throw new Error('Upload preset não informado');

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  if (folder) formData.append('folder', folder);

  const response = await fetch(endpoint, { method: 'POST', body: formData });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha no upload Cloudinary: ${response.status} ${text}`);
  }
  const json = await response.json();
  // secure_url é a URL pública HTTPS do asset
  return json.secure_url;
}
