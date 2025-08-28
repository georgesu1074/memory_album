'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  theme?: {
    primary: string;
    secondary?: string;
  };
}

export default function QRCodeGenerator({ 
  url, 
  size = 256,
  theme 
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [url, size, theme]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: theme?.primary || '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `wedding-qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Wedding QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .container {
                text-align: center;
              }
              img {
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                background: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              h1 {
                margin-top: 20px;
                color: #111827;
                font-size: 24px;
              }
              p {
                color: #6b7280;
                font-size: 14px;
                margin-top: 8px;
              }
              .url {
                font-family: monospace;
                color: #8b5cf6;
                font-size: 16px;
                margin-top: 12px;
              }
              @media print {
                body {
                  min-height: auto;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${qrCodeUrl}" alt="QR Code" width="${size}" height="${size}" />
              <h1>Scan to Share a Memory</h1>
              <p class="url">${url}</p>
              <p>Point your phone camera at this code to visit our wedding memory page</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Generating QR code...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
        {qrCodeUrl && (
          <img
            src={qrCodeUrl}
            alt="Wedding QR Code"
            width={size}
            height={size}
            className="rounded-lg"
          />
        )}
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Scan to visit:</p>
          <p className="text-sm font-mono text-purple-600 break-all">{url}</p>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={downloadQRCode}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Download QR Code
        </button>
        <button
          onClick={printQRCode}
          className="flex-1 px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
        >
          Print QR Code
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">How to use this QR code:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Print and display at your wedding venue</li>
          <li>• Add to your wedding invitations</li>
          <li>• Share digitally with guests before the wedding</li>
          <li>• Include in table cards or programs</li>
        </ul>
      </div>
    </div>
  );
}