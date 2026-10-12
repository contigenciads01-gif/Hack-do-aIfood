import { supabase } from '@/integrations/supabase/client';

export async function compressImage(
  file: File,
  maxDimension = 1024,
  quality = 0.85,
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas indisponível'));
          return;
        }

        // Draw with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Preserve PNG transparency if source is PNG, otherwise jpeg/webp
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro na compressão'));
              return;
            }
            resolve({ blob, width, height });
          },
          mimeType,
          quality,
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts dominant colors from an image using simple RGB clustering on canvas.
 */
export async function extractDominantColors(
  imageSource: string,
  count = 5,
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(['#EA1D2C', '#1E1E1E', '#FFFFFF', '#FFA500', '#F5F5F5']);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        const bucketMap: Record<string, { r: number; g: number; b: number; weight: number }> = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          const a = data[i + 3] ?? 0;

          // Skip transparent or near-black/near-white extremes if possible
          if (a < 128) continue;

          // Quantize into 32-step buckets
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;

          const existing = bucketMap[key];
          if (!existing) {
            bucketMap[key] = { r, g, b, weight: 1 };
          } else {
            existing.r += r;
            existing.g += g;
            existing.b += b;
            existing.weight += 1;
          }
        }

        const sorted = Object.values(bucketMap).sort((a, b) => b.weight - a.weight);

        const hexColors: string[] = [];
        for (const bucket of sorted) {
          const r = Math.round(bucket.r / bucket.weight);
          const g = Math.round(bucket.g / bucket.weight);
          const b = Math.round(bucket.b / bucket.weight);

          const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
          if (!hexColors.includes(hex)) {
            hexColors.push(hex);
          }
          if (hexColors.length >= count) break;
        }

        if (hexColors.length === 0) {
          resolve(['#EA1D2C', '#1E1E1E', '#FFFFFF', '#FFA500', '#F5F5F5']);
        } else {
          while (hexColors.length < count) {
            hexColors.push('#FFFFFF');
          }
          resolve(hexColors);
        }
      } catch {
        resolve(['#EA1D2C', '#1E1E1E', '#FFFFFF', '#FFA500', '#F5F5F5']);
      }
    };
    img.onerror = () => {
      resolve(['#EA1D2C', '#1E1E1E', '#FFFFFF', '#FFA500', '#F5F5F5']);
    };
    img.src = imageSource;
  });
}

export async function uploadCompanyLogo(
  file: File,
  userId: string,
): Promise<{ path: string; url: string }> {
  const { blob } = await compressImage(file, 1024);
  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const path = `${userId}/logo-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('company-assets')
    .upload(path, blob, {
      contentType: file.type || 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.warn('Storage upload warning:', uploadError.message);
    // If storage bucket upload fails (e.g. offline/restricted), return a data URI for browser preview
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ path, url: reader.result as string });
      reader.readAsDataURL(blob);
    });
  }

  // Get signed URL
  const { data: signData } = await supabase.storage
    .from('company-assets')
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

  return {
    path,
    url: signData?.signedUrl || URL.createObjectURL(blob),
  };
}

export async function getSignedAssetUrl(path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  try {
    const { data } = await supabase.storage
      .from('company-assets')
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    return data?.signedUrl || '';
  } catch {
    return '';
  }
}
