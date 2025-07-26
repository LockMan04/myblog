import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import QRCode from 'react-qr-code';
import { Download, Copy, Trash2, History, Eye, EyeOff, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const QRHistory = forwardRef((props, ref) => {
  const [qrHistory, setQrHistory] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    // Load QR history from localStorage
    const savedHistory = localStorage.getItem('qr-generate-history');
    if (savedHistory) {
      setQrHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveHistoryItem = (value, type, size, color, bgColor) => {
    const historyItem = {
      id: Date.now(),
      value,
      type,
      size,
      color,
      bgColor,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [historyItem, ...qrHistory.slice(0, 19)]; // Giữ tối đa 20 item
    setQrHistory(newHistory);
    localStorage.setItem('qr-generate-history', JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (id) => {
    const newHistory = qrHistory.filter(item => item.id !== id);
    setQrHistory(newHistory);
    localStorage.setItem('qr-generate-history', JSON.stringify(newHistory));
    toast.success('Đã xóa QR code khỏi lịch sử!');
  };

  const clearAllHistory = () => {
    setQrHistory([]);
    localStorage.removeItem('qr-generate-history');
    toast.success('Đã xóa toàn bộ lịch sử!');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Đã sao chép nội dung!');
    }).catch(() => {
      toast.error('Không thể sao chép!');
    });
  };

  const copyQRImage = async (item) => {
    try {
      const svg = document.querySelector(`#qr-${item.id} svg`);
      if (!svg) {
        toast.error('Không tìm thấy mã QR để sao chép!');
        return;
      }

      // Tạo canvas và vẽ QR code lên đó
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = item.size;
      canvas.height = item.size;

      // Chuyển SVG thành data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        // Vẽ background
        ctx.fillStyle = item.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Vẽ QR code
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Chuyển canvas thành blob
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            toast.success('Đã sao chép ảnh QR vào clipboard!');
          } catch (error) {
            // Fallback: tải xuống thay vì sao chép
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qrcode-${item.type}-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.info('Không thể sao chép, đã tải xuống thay thế!');
          }
        }, 'image/png');
        
        URL.revokeObjectURL(svgUrl);
      };
      
      img.onerror = () => {
        toast.error('Không thể tạo ảnh QR!');
        URL.revokeObjectURL(svgUrl);
      };
      
      img.src = svgUrl;
    } catch (error) {
      console.error('Error copying QR image:', error);
      toast.error('Không thể sao chép ảnh QR!');
    }
  };

  const downloadQR = (item) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svg = document.querySelector(`#qr-${item.id} svg`);
    
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    canvas.width = item.size;
    canvas.height = item.size;

    img.onload = () => {
      ctx.fillStyle = item.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, item.size, item.size);
      
      const link = document.createElement('a');
      link.download = `qrcode-${item.type}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('QR Code đã được tải xuống!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const detectQRType = (value) => {
    if (value.startsWith('http')) return 'URL';
    if (value.startsWith('mailto:')) return 'Email';
    if (value.startsWith('tel:') || value.startsWith('sms:')) return 'Điện thoại';
    if (value.startsWith('WIFI:')) return 'WiFi';
    if (value.includes('BEGIN:VCARD')) return 'Danh bạ';
    return 'Văn bản';
  };

  const truncateValue = (value, length = 50) => {
    return value.length > length ? `${value.substring(0, length)}...` : value;
  };

  // Expose saveHistoryItem function to be used by QRGenerator
  useImperativeHandle(ref, () => ({
    saveHistoryItem
  }));

  return (
    <div className="qr-history">
      <div className="history-header">
        <div className="header-content">
          <History className="w-5 h-5" />
          <div>
            <h3>Lịch sử QR Code</h3>
            <p>Các QR code bạn đã tạo gần đây</p>
            <i>Lưu ý: Các mã QR được lưu trữ trên trình duyệt, sẽ mất nếu xóa dữ liệu trang web</i>
          </div>
        </div>
        {qrHistory.length > 0 && (
          <button onClick={clearAllHistory} className="clear-all-btn">
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {qrHistory.length === 0 ? (
        <div className="empty-history">
          <History className="w-12 h-12" />
          <p>Chưa có QR code nào được tạo</p>
          <span>Các QR code bạn tạo sẽ xuất hiện ở đây</span>
        </div>
      ) : (
        <div className="history-grid">
          {qrHistory.map(item => (
            <div key={item.id} className="history-card">
              <div className="card-header">
                <div className="qr-info">
                  <span className="qr-type">{detectQRType(item.value)}</span>
                  <span className="qr-date">
                    {new Date(item.timestamp).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="delete-btn"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="qr-history-preview" id={`qr-${item.id}`}>
                <QRCode
                  value={item.value}
                  size={120}
                  fgColor={item.color}
                  bgColor={item.bgColor}
                  level="M"
                />
              </div>

              <div className="qr-history-content">
                <div className="qr-value">
                  {expandedItems.has(item.id) ? item.value : truncateValue(item.value)}
                </div>
                
                {item.value.length > 50 && (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="expand-btn"
                  >
                    {expandedItems.has(item.id) ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Xem thêm
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="card-actions">
                <button
                  onClick={() => copyToClipboard(item.value)}
                  className="action-btn secondary"
                  title="Sao chép text"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => copyQRImage(item)}
                  className="action-btn secondary"
                  title="Sao chép ảnh QR"
                >
                  <QrCode className="w-3 h-3" />
                </button>
                <button
                  onClick={() => downloadQR(item)}
                  className="action-btn primary"
                  title="Tải xuống"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default QRHistory;
