import * as QRCode from 'qrcode';

export interface QrCodeRenderResult {
  dataUrl: string;
  displayText: string;
  isEmbeddedImage: boolean;
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
    return {
      dataUrl: embedded,
      displayText: 'QR code certifié SFEC',
      isEmbeddedImage: true,
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
  };
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
