import * as QRCode from 'qrcode';
import jsQR from 'jsqr';

export interface QrCodeRenderResult {
  dataUrl: string;
  displayText: string;
  isEmbeddedImage: boolean;
  payloadUrl?: string | null;
}

export const QR_CODE_TABLE_WIDTH = 512;
export const QR_CODE_PREVIEW_WIDTH = 1024;

export function normalizeQrCodeRaw(raw: unknown): string {
  return `${raw ?? ''}`.trim();
}

export function isEmbeddedQrImage(value: string): boolean {
  if (!value) {
    return false;
  }

  if (/^data:image\//i.test(value)) {
    return true;
  }

  if (/^iVBORw0KGgo/i.test(value) || /^\/9j\//i.test(value)) {
    return true;
  }

  return false;
}

export function toEmbeddedImageDataUrl(value: string): string | null {
  if (!value) {
    return null;
  }

  if (/^data:image\//i.test(value)) {
    return value;
  }

  if (/^iVBORw0KGgo/i.test(value)) {
    return `data:image/png;base64,${value}`;
  }

  if (/^\/9j\//i.test(value)) {
    return `data:image/jpeg;base64,${value}`;
  }

  return null;
}

/**
 * Extrait une URL ouvrable depuis le contenu d'un QR code SFEC.
 * Gère les URLs http(s) directes, ou une URL enfouie dans un texte plus long.
 */
export function extractQrCodeUrl(raw: unknown): string | null {
  const value = normalizeQrCodeRaw(raw);
  if (!value || isEmbeddedQrImage(value)) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const matched = value.match(/https?:\/\/[^\s"'<>]+/i);
  return matched ? matched[0] : null;
}

export async function renderQrCodeImage(
  value: string,
  width = QR_CODE_TABLE_WIDTH
): Promise<QrCodeRenderResult | null> {
  const normalized = normalizeQrCodeRaw(value);
  if (!normalized) {
    return null;
  }

  const embedded = toEmbeddedImageDataUrl(normalized);
  if (embedded) {
    const payloadUrl = await decodeQrPayloadUrlFromDataUrl(embedded);
    return {
      dataUrl: embedded,
      displayText: payloadUrl || 'QR code certifié SFEC',
      isEmbeddedImage: true,
      payloadUrl,
    };
  }

  const dataUrl = await QRCode.toDataURL(normalized, {
    errorCorrectionLevel: 'H',
    margin: 4,
    width,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return {
    dataUrl,
    displayText: normalized,
    isEmbeddedImage: false,
    payloadUrl: extractQrCodeUrl(normalized),
  };
}

export async function decodeQrPayloadUrlFromDataUrl(dataUrl: string): Promise<string | null> {
  try {
    const image = await loadImage(dataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (!decoded?.data) {
      return null;
    }

    return extractQrCodeUrl(decoded.data) || normalizeQrCodeRaw(decoded.data) || null;
  } catch (error) {
    console.log('Erreur de décodage du QR code:', error);
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Impossible de charger limage QR'));
    image.src = src;
  });
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function isOpenableHttpUrl(value: string | null | undefined): boolean {
  return !!value && /^https?:\/\//i.test(value.trim());
}
