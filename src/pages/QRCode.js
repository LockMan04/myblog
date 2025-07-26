import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QRGenerator from '../components/QRGenerator';
import QRScanner from '../components/QRScanner';
import QRBatch from '../components/QRBatch';
import { QrCode, ScanLine, Package } from 'lucide-react';
import '../styles/QRCode.css';

const QRCode = () => {
  const [activeMode, setActiveMode] = useState('generate');

  return (
    <>
      <Header />
      <main className="main-content qr-page">
        <div className="qr-mode-switcher">
          <button
            className={`mode-btn ${activeMode === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveMode('generate')}
          >
            <QrCode className="w-5 h-5" />
            Tạo QR Code
          </button>
          <button
            className={`mode-btn ${activeMode === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveMode('scan')}
          >
            <ScanLine className="w-5 h-5" />
            Quét QR Code
          </button>
          <button
            className={`mode-btn ${activeMode === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveMode('batch')}
          >
            <Package className="w-5 h-5" />
            Tạo hàng loạt
          </button>
        </div>

        {activeMode === 'generate' && <QRGenerator />}
        {activeMode === 'scan' && <QRScanner />}
        {activeMode === 'batch' && <QRBatch />}
      </main>
      <Footer />
    </>
  );
};

export default QRCode;
