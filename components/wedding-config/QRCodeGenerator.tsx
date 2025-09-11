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
      // Extract primary and secondary colors, with fallbacks
      const primaryColor = theme?.primary || '#8B5CF6';
      const secondaryColor = theme?.secondary || '#EC4899';
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Wedding Memory Collection</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:wght@300;400&display=swap" rel="stylesheet">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                width: 8.5in;
                height: 11in;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                position: relative;
                overflow: hidden;
              }
              
              .page-wrapper {
                width: 100%;
                height: 100%;
                padding: 0.75in;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
              }
              
              /* Decorative border */
              .border-frame {
                position: absolute;
                top: 0.5in;
                left: 0.5in;
                right: 0.5in;
                bottom: 0.5in;
                border: 2px solid ${primaryColor}20;
                border-radius: 8px;
                pointer-events: none;
              }
              
              /* Corner flourishes */
              .corner-decoration {
                position: absolute;
                width: 60px;
                height: 60px;
                border: 2px solid ${primaryColor}40;
              }
              
              .corner-decoration.top-left {
                top: 0.4in;
                left: 0.4in;
                border-right: none;
                border-bottom: none;
                border-top-left-radius: 12px;
              }
              
              .corner-decoration.top-right {
                top: 0.4in;
                right: 0.4in;
                border-left: none;
                border-bottom: none;
                border-top-right-radius: 12px;
              }
              
              .corner-decoration.bottom-left {
                bottom: 0.4in;
                left: 0.4in;
                border-right: none;
                border-top: none;
                border-bottom-left-radius: 12px;
              }
              
              .corner-decoration.bottom-right {
                bottom: 0.4in;
                right: 0.4in;
                border-left: none;
                border-top: none;
                border-bottom-right-radius: 12px;
              }
              
              /* Main content container */
              .content {
                text-align: center;
                max-width: 6in;
                z-index: 1;
              }
              
              /* Title styling */
              .title {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 16px;
                letter-spacing: 0.5px;
              }
              
              .subtitle {
                font-family: 'Cormorant Garamond', serif;
                font-size: 20px;
                font-weight: 300;
                color: ${primaryColor};
                margin-bottom: 32px;
                font-style: italic;
              }
              
              /* QR Code container */
              .qr-container {
                background: white;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                margin: 32px auto;
                display: inline-block;
                position: relative;
              }
              
              .qr-container::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
                border-radius: 12px;
                z-index: -1;
                opacity: 0.15;
              }
              
              .qr-code {
                display: block;
                border-radius: 8px;
              }
              
              /* Message section */
              .message {
                margin-top: 36px;
                padding: 0 20px;
              }
              
              .message-text {
                font-family: 'Cormorant Garamond', serif;
                font-size: 18px;
                line-height: 1.8;
                color: #444;
                margin-bottom: 20px;
              }
              
              .message-text strong {
                font-weight: 400;
                color: ${primaryColor};
              }
              
              /* Instructions */
              .instructions {
                background: linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08);
                border-radius: 8px;
                padding: 20px;
                margin-top: 24px;
              }
              
              .instructions-title {
                font-family: 'Playfair Display', serif;
                font-size: 16px;
                color: ${primaryColor};
                margin-bottom: 12px;
                font-weight: 700;
              }
              
              .instructions-text {
                font-family: 'Cormorant Garamond', serif;
                font-size: 15px;
                line-height: 1.6;
                color: #666;
              }
              
              /* Decorative elements */
              .heart-divider {
                margin: 24px auto;
                font-size: 20px;
                color: ${secondaryColor};
                opacity: 0.5;
              }
              
              /* Website URL */
              .website-url {
                margin-top: 20px;
                font-family: 'Cormorant Garamond', serif;
                font-size: 14px;
                color: #999;
                font-style: italic;
              }
              
              /* Print-specific styles */
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                
                .page-wrapper {
                  page-break-inside: avoid;
                }
                
                @page {
                  size: letter;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="page-wrapper">
              <!-- Decorative corners -->
              <div class="corner-decoration top-left"></div>
              <div class="corner-decoration top-right"></div>
              <div class="corner-decoration bottom-left"></div>
              <div class="corner-decoration bottom-right"></div>
              
              <!-- Border frame -->
              <div class="border-frame"></div>
              
              <!-- Main content -->
              <div class="content">
                <h1 class="title">Join Our Love Story</h1>
                <p class="subtitle">A Digital Wedding Memory Album</p>
                
                <div class="qr-container">
                  <img src="${qrCodeUrl}" alt="Wedding Memory QR Code" width="${size}" height="${size}" class="qr-code" />
                </div>
                
                <div class="message">
                  <p class="message-text">
                    Dear friends and family, you are not just witnesses to our love story – 
                    <strong>you are part of it</strong>. Each moment you've shared with us, 
                    every laugh, every tear of joy, has woven the beautiful tapestry of our journey together.
                  </p>
                  
                  <div class="heart-divider">♥ ♥ ♥</div>
                  
                  <p class="message-text">
                    We invite you to contribute to our <strong>Digital Wedding Album</strong> – 
                    a living collection of memories where your photos, stories, and well-wishes 
                    will create a shared consciousness of love that we'll treasure forever.
                  </p>
                </div>
                
                <div class="instructions">
                  <h3 class="instructions-title">How to Share Your Memories</h3>
                  <p class="instructions-text">
                    Simply point your phone's camera at the QR code above. You'll be taken to our 
                    special memory collection page where you can upload photos, share stories, 
                    and leave heartfelt messages. Every contribution becomes part of our eternal celebration.
                  </p>
                </div>
                
                <p class="website-url">${url}</p>
              </div>
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