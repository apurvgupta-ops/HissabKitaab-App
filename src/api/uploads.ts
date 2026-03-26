/**
 * HissabKitaab — Receipt upload API
 */
import { Platform } from 'react-native';
import client from './client';

export interface ReceiptLineItem {
  name: string;
  amount: number;
}

export interface ParsedReceipt {
  merchant: string;
  date: string | null;
  total: number;
  currency: string;
  items: ReceiptLineItem[];
  category: string | null;
}

export interface UploadMeta {
  key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ReceiptUploadResponse {
  upload: UploadMeta;
  receipt: ParsedReceipt;
}

/**
 * Upload a receipt image to the backend for OCR.
 * Constructs multipart/form-data from the image URI.
 */
export async function uploadReceipt(
  imageUri: string,
  fileName: string = 'receipt.jpg',
  mimeType: string = 'image/jpeg',
): Promise<ReceiptUploadResponse> {
  const formData = new FormData();

  formData.append('file', {
    uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
    type: mimeType,
    name: fileName,
  } as any);

  const { data } = await client.post<{
    success: boolean;
    data: ReceiptUploadResponse;
  }>('/uploads/receipt', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // receipts can take longer with OCR
  });

  return data.data;
}
