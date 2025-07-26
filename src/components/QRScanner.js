import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, CameraOff, Upload, RotateCcw, Zap, ZapOff, Save, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], 'clipboard-image.png', { type });
            
            try {
              const result = await codeReader.current.decodeFromImageElement(await createImageElement(file));
              const scannedText = result.getText();
              setScannedData(scannedText);
              toast.success('Đã đọc thành công QR code từ ảnh clipboard!');
              return;
            } catch (error) {
              console.error('Lỗi khi đọc ảnh từ clipboard:', error);
              toast.error('Không tìm thấy QR code trong ảnh clipboard');
              return;
            }
          }
        }
      }
      
      toast.error('Không tìm thấy ảnh trong clipboard');
    } catch (error) {
      console.error('Lỗi khi truy cập clipboard:', error);
      toast.error('Không thể truy cập clipboard. Hãy thử copy ảnh trước.');
    }
  };

  const createImageElement = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    // Khởi tạo code reader
    codeReader.current = new BrowserMultiFormatReader();
    
    // Load scan history from localStorage
    const savedHistory = localStorage.getItem('qr-scan-history');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }

    // Thêm event listener cho keyboard paste
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        handlePasteImage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      stopScanning();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Lấy danh sách camera devices
    const getDevices = async () => {
      try {
        const videoDevices = await codeReader.current.listVideoInputDevices();
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách camera:', error);
        toast.error('Không thể truy cập camera');
      }
    };

    if (codeReader.current) {
      getDevices();
    }
  }, []);

  const startScanning = async () => {
    try {
      // Kiểm tra quyền truy cập camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: selectedDevice ? { exact: selectedDevice } : undefined }
      });
      
      setHasPermission(true);
      setIsScanning(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Bắt đầu scan
      codeReader.current.decodeFromVideoDevice(
        selectedDevice,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            setScannedData(scannedText);
            toast.success('Đã quét thành công QR code!');
            
            // Dừng scanning sau khi quét thành công
            stopScanning();
          }
          
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanning error:', error);
          }
        }
      );
      
    } catch (error) {
      console.error('Lỗi khi bắt đầu quét:', error);
      setHasPermission(false);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Vui lòng cho phép truy cập camera để quét QR code');
      } else if (error.name === 'NotFoundError') {
        toast.error('Không tìm thấy camera');
      } else {
        toast.error('Không thể khởi động camera');
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (codeReader.current) {
      codeReader.current.reset();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleTorch = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities().torch) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !torchEnabled }]
          });
          setTorchEnabled(!torchEnabled);
        } catch (error) {
          console.error('Lỗi khi bật/tắt đèn flash:', error);
          toast.error('Không thể điều khiển đèn flash');
        }
      } else {
        toast.error('Camera không hỗ trợ đèn flash');
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await codeReader.current.decodeFromImageElement(await createImageElement(file));
      const scannedText = result.getText();
      setScannedData(scannedText);
      toast.success('Đã đọc thành công QR code từ hình ảnh!');
    } catch (error) {
      console.error('Lỗi khi đọc file:', error);
      toast.error('Không tìm thấy QR code trong hình ảnh');
    }
  };

  const addToHistory = (data) => {
    const historyItem = {
      id: Date.now(),
      data,
      timestamp: new Date().toISOString(),
      type: detectQRType(data)
    };
    
    const newHistory = [historyItem, ...scanHistory.slice(0, 9)]; // Giữ tối đa 10 item
    setScanHistory(newHistory);
    localStorage.setItem('qr-scan-history', JSON.stringify(newHistory));
  };

  const detectQRType = (data) => {
    if (data.startsWith('http')) return 'URL';
    if (data.startsWith('mailto:')) return 'Email';
    if (data.startsWith('tel:')) return 'Phone';
    if (data.startsWith('sms:')) return 'SMS';
    if (data.startsWith('WIFI:')) return 'WiFi';
    if (data.includes('BEGIN:VCARD')) return 'Contact';
    return 'Text';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Đã sao chép vào clipboard!');
    }).catch(() => {
      toast.error('Không thể sao chép!');
    });
  };

  const openLink = (data) => {
    if (data.startsWith('http')) {
      window.open(data, '_blank');
    } else if (data.startsWith('mailto:') || data.startsWith('tel:') || data.startsWith('sms:')) {
      window.location.href = data;
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('qr-scan-history');
    toast.success('Đã xóa lịch sử quét!');
  };

  const handleSaveToHistory = () => {
    if (!scannedData || !scannedData.trim()) {
      toast.error('Chưa có dữ liệu để lưu!');
      return;
    }
    addToHistory(scannedData);
    toast.success('Đã lưu vào lịch sử quét!');
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-header">
        <h2>Quét mã QR</h2>
        <p>Sử dụng camera hoặc tải lên hình ảnh để quét QR code</p>
      </div>

      <div className="scanner-content">
        <div className="scanner-section">
          <div className="camera-container">
            {isScanning ? (
              <div className="video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="scanner-video"
                />
                <div className="scanner-overlay">
                  <div className="scanner-frame"></div>
                </div>
              </div>
            ) : (
              <div className="scanner-placeholder">
                <Camera className="w-16 h-16" />
                <p>Nhấn "Bắt đầu quét" để sử dụng camera</p>
              </div>
            )}
          </div>

          <div className="scanner-controls">
            {devices.length > 1 && (
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                disabled={isScanning}
                className="device-select"
              >
                {devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            )}

            <div className="control-buttons">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  className="control-btn primary"
                  disabled={devices.length === 0}
                >
                  <Camera className="w-4 h-4" />
                  Bắt đầu quét
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="control-btn danger"
                >
                  <CameraOff className="w-4 h-4" />
                  Dừng quét
                </button>
              )}

              {isScanning && (
                <button
                  onClick={toggleTorch}
                  className="control-btn secondary"
                >
                  {torchEnabled ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  Flash
                </button>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="control-btn secondary"
              >
                <Upload className="w-4 h-4" />
                Tải ảnh
              </button>

              <button
                onClick={handlePasteImage}
                className="control-btn secondary"
                title="Dán ảnh từ clipboard (Ctrl+V)"
              >
                <Clipboard className="w-4 h-4" />
                Dán ảnh
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="result-section">
          {scannedData && (
            <div className="scan-result">
              <h3>Kết quả quét:</h3>
              <div className="result-content">
                <div className="result-type">
                  Loại: <span className="type-badge">{detectQRType(scannedData)}</span>
                </div>
                <div className="result-data">
                  {scannedData}
                </div>
                <div className="result-actions">
                  <button
                    onClick={() => copyToClipboard(scannedData)}
                    className="action-btn"
                  >
                    Sao chép
                  </button>
                  <button
                    onClick={handleSaveToHistory}
                    className="action-btn save"
                  >
                    <Save className="w-4 h-4" />
                    Lưu lịch sử
                  </button>
                  {(scannedData.startsWith('http') || scannedData.startsWith('mailto:') || 
                    scannedData.startsWith('tel:') || scannedData.startsWith('sms:')) && (
                    <button
                      onClick={() => openLink(scannedData)}
                      className="action-btn primary"
                    >
                      Mở
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {scanHistory.length > 0 && (
            <div className="scan-history">
              <div className="history-header">
                <h3>Lịch sử quét</h3>
                <button onClick={clearHistory} className="clear-btn">
                  <RotateCcw className="w-4 h-4" />
                  Xóa tất cả
                </button>
              </div>
              <div className="history-list">
                {scanHistory.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-content">
                      <div className="history-type">
                        <span className="type-badge">{item.type}</span>
                        <span className="history-time">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="history-data">
                        {item.data.length > 50 ? `${item.data.slice(0, 50)}...` : item.data}
                      </div>
                    </div>
                    <div className="history-actions">
                      <button
                        onClick={() => copyToClipboard(item.data)}
                        className="history-action-btn"
                      >
                        Sao chép
                      </button>
                      {(item.data.startsWith('http') || item.data.startsWith('mailto:') || 
                        item.data.startsWith('tel:') || item.data.startsWith('sms:')) && (
                        <button
                          onClick={() => openLink(item.data)}
                          className="history-action-btn primary"
                        >
                          Mở
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
