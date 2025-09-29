"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  theme?: {
    primary: string;
    secondary?: string;
  };
  brideFirstName?: string;
  groomFirstName?: string;
}

export default function QRCodeGenerator({
  url,
  size = 256,
  theme,
  brideFirstName = "Bride",
  groomFirstName = "Groom",
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
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
          dark: "#000000", // Always use black for better scanning
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `wedding-qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      // Extract primary and secondary colors, with fallbacks
      const primaryColor = theme?.primary || "#8B5CF6";
      const secondaryColor = theme?.secondary || "#EC4899";

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
                width: 5in;
                min-height: 7in;
                margin: 20px auto;
                background: white;
                position: relative;
                overflow-y: auto;
              }
              
              .page-wrapper {
                width: 100%;
                min-height: 7in;
                padding: 0.4in;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                position: relative;
              }
              
              /* Decorative border */
              .border-frame {
                position: absolute;
                top: 0.3in;
                left: 0.3in;
                right: 0.3in;
                bottom: 0.3in;
                border: 1px solid ${primaryColor}20;
                border-radius: 8px;
                pointer-events: none;
              }
              
              /* Corner flourishes */
              .corner-decoration {
                position: absolute;
                width: 40px;
                height: 40px;
                border: 2px solid ${primaryColor}30;
              }
              
              .corner-decoration.top-left {
                top: 0.25in;
                left: 0.25in;
                border-right: none;
                border-bottom: none;
                border-top-left-radius: 8px;
              }
              
              .corner-decoration.top-right {
                top: 0.25in;
                right: 0.25in;
                border-left: none;
                border-bottom: none;
                border-top-right-radius: 8px;
              }
              
              .corner-decoration.bottom-left {
                bottom: 0.25in;
                left: 0.25in;
                border-right: none;
                border-top: none;
                border-bottom-left-radius: 8px;
              }
              
              .corner-decoration.bottom-right {
                bottom: 0.25in;
                right: 0.25in;
                border-left: none;
                border-top: none;
                border-bottom-right-radius: 8px;
              }
              
              /* Main content container */
              .content {
                text-align: center;
                max-width: 4in;
                z-index: 1;
              }
              
              /* Title styling */
              .title {
                font-family: 'Playfair Display', serif;
                font-size: 24px;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 8px;
                letter-spacing: 0.5px;
              }
              
              .subtitle {
                font-family: 'Cormorant Garamond', serif;
                font-size: 14px;
                font-weight: 300;
                color: ${primaryColor};
                margin-bottom: 16px;
                font-style: italic;
              }
              
              /* QR Code container */
              .qr-container {
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
                margin: 16px auto;
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
                margin-top: 20px;
                padding: 0 10px;
              }
              
              .message-text {
                font-family: 'Cormorant Garamond', serif;
                font-size: 13px;
                line-height: 1.6;
                color: #444;
                margin-bottom: 12px;
              }
              
              .message-text strong {
                font-weight: 400;
                color: ${primaryColor};
              }
              
              /* Instructions */
              .instructions {
                background: linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08);
                border-radius: 6px;
                padding: 12px;
                margin-top: 16px;
              }
              
              .instructions-title {
                font-family: 'Playfair Display', serif;
                font-size: 12px;
                color: ${primaryColor};
                margin-bottom: 8px;
                font-weight: 700;
              }
              
              .instructions-text {
                font-family: 'Cormorant Garamond', serif;
                font-size: 11px;
                line-height: 1.5;
                color: #666;
              }
              
              /* Decorative elements */
              .heart-divider {
                margin: 12px auto;
                font-size: 14px;
                color: ${secondaryColor};
                opacity: 0.5;
              }
              
              /* Website URL */
              .website-url {
                margin-top: 12px;
                font-family: 'Cormorant Garamond', serif;
                font-size: 10px;
                color: #999;
                font-style: italic;
              }
              
              /* Print-specific styles */
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  width: 5in;
                  height: 7in;
                }
                
                .page-wrapper {
                  page-break-inside: avoid;
                  height: 7in;
                }
                
                @page {
                  size: 5in 7in;
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
                <p class="subtitle">${brideFirstName} & ${groomFirstName}'s Memory Album</p>
                
                <div class="qr-container">
                  <img src="${qrCodeUrl}" alt="Memory Album QR Code" width="180" height="180" class="qr-code" />
                </div>
                
                <div class="message">
                  <p class="message-text">
                    Dear friends and family,
                  </p>
                  
                  <p class="message-text">
                    <strong>You are part of our love story.</strong> Like stars across the night sky, 
                    each of you carries unique memories. When your stars meet ours, 
                    they weave constellations that illuminate the tapestry of our lives.
                  </p>
                  
                  <div class="heart-divider">♥ ♥ ♥</div>
                </div>
                
                <div class="instructions">
                  <h3 class="instructions-title">How to Share Your Memories</h3>
                  <p class="instructions-text">
                    Point your phone's camera at the QR code above to visit our memory collection page. 
                    Upload photos, share stories, and leave messages. AI technology will help organize 
                    and compile your contributions into beautiful memory collections.
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
        <h4 className="font-semibold text-blue-900 mb-2">
          How to use this QR code:
        </h4>
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
