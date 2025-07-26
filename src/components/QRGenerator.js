import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import QRTemplates from './QRTemplates';
import QRHistory from './QRHistory';
import { Download, Copy, Wifi, User, Link, Mail, Phone, MessageSquare, QrCode, Sparkles, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const QRGenerator = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [qrValue, setQrValue] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const qrRef = useRef();
  const historyRef = useRef();

  // Form states for different QR types
  const [textData, setTextData] = useState('');
  const [urlData, setUrlData] = useState('');
  const [wifiData, setWifiData] = useState({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false
  });
  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });
  const [emailData, setEmailData] = useState({
    email: '',
    subject: '',
    body: ''
  });
  const [smsData, setSmsData] = useState({
    phone: '',
    message: ''
  });

  const tabs = [
    { id: 'text', label: 'Văn bản', icon: MessageSquare },
    { id: 'url', label: 'Website', icon: Link },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'contact', label: 'Danh bạ', icon: User },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS', icon: Phone }
  ];

  // Generate QR value based on active tab
  const generateQRValue = () => {
    switch (activeTab) {
      case 'text':
        return textData;
      case 'url':
        return urlData.startsWith('http') ? urlData : `https://${urlData}`;
      case 'wifi':
        return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden ? 'true' : 'false'};;`;
      case 'contact':
        return `BEGIN:VCARD
VERSION:3.0
FN:${contactData.name}
TEL:${contactData.phone}
EMAIL:${contactData.email}
ORG:${contactData.organization}
URL:${contactData.url}
END:VCARD`;
      case 'email':
        return `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
      case 'sms':
        return `sms:${smsData.phone}?body=${encodeURIComponent(smsData.message)}`;
      default:
        return '';
    }
  };

  React.useEffect(() => {
    const value = generateQRValue();
    setQrValue(value);
  }, [activeTab, textData, urlData, wifiData, contactData, emailData, smsData]);

  const saveToHistory = (value) => {
    if (historyRef.current && historyRef.current.saveHistoryItem) {
      historyRef.current.saveHistoryItem(value, activeTab, qrSize, qrColor, qrBgColor);
      toast.success('Đã lưu QR Code vào lịch sử!');
    }
  };

  const handleSaveToHistory = () => {
    if (!qrValue || !qrValue.trim()) {
      toast.error('Chưa có QR Code để lưu!');
      return;
    }
    saveToHistory(qrValue);
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = qrSize;
    canvas.height = qrSize;

    img.onload = () => {
      ctx.fillStyle = qrBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, qrSize, qrSize);
      
      const link = document.createElement('a');
      link.download = `qrcode-${activeTab}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('QR Code đã được tải xuống!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyQRImage = async () => {
    if (!qrRef.current) {
      toast.error('Không tìm thấy mã QR để sao chép!');
      return;
    }

    try {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) {
        toast.error('Không thể tạo ảnh QR!');
        return;
      }

      // Tạo canvas và vẽ QR code lên đó
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = qrSize;
      canvas.height = qrSize;

      // Chuyển SVG thành data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        // Vẽ background trắng
        ctx.fillStyle = qrBgColor;
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
            a.download = 'qr-code.png';
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

  const handleTemplateUse = (templateData) => {
    switch (activeTab) {
      case 'text':
        setTextData(templateData);
        break;
      case 'url':
        setUrlData(templateData);
        break;
      case 'wifi':
        setWifiData(templateData);
        break;
      case 'contact':
        setContactData(templateData);
        break;
      case 'email':
        setEmailData(templateData);
        break;
      case 'sms':
        setSmsData(templateData);
        break;
    }
    setShowTemplates(false);
    toast.success('Đã áp dụng mẫu!');
  };

  const clearAllInputs = () => {
    // Reset all input data based on current tab
    switch (activeTab) {
      case 'text':
        setTextData('');
        break;
      case 'url':
        setUrlData('');
        break;
      case 'wifi':
        setWifiData({
          ssid: '',
          password: '',
          security: 'WPA',
          hidden: false
        });
        break;
      case 'contact':
        setContactData({
          name: '',
          phone: '',
          email: '',
          organization: '',
          url: ''
        });
        break;
      case 'email':
        setEmailData({
          email: '',
          subject: '',
          body: ''
        });
        break;
      case 'sms':
        setSmsData({
          phone: '',
          message: ''
        });
        break;
    }
    toast.success('Đã xóa tất cả nội dung!');
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'text':
        return (
          <div className="qr-form">
            <label>Nội dung văn bản:</label>
            <textarea
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              placeholder="Nhập văn bản bạn muốn tạo QR code..."
              rows={4}
            />
          </div>
        );

      case 'url':
        return (
          <div className="qr-form">
            <label>URL Website:</label>
            <input
              type="url"
              value={urlData}
              onChange={(e) => setUrlData(e.target.value)}
              placeholder="Nhập địa chỉ website (vd: google.com)"
            />
          </div>
        );

      case 'wifi':
        return (
          <div className="qr-form">
            <label>Tên WiFi (SSID):</label>
            <input
              type="text"
              value={wifiData.ssid}
              onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})}
              placeholder="Tên mạng WiFi"
            />
            
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={wifiData.password}
              onChange={(e) => setWifiData({...wifiData, password: e.target.value})}
              placeholder="Mật khẩu WiFi"
            />
            
            <label>Loại bảo mật:</label>
            <select
              value={wifiData.security}
              onChange={(e) => setWifiData({...wifiData, security: e.target.value})}
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Không mật khẩu</option>
            </select>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={wifiData.hidden}
                onChange={(e) => setWifiData({...wifiData, hidden: e.target.checked})}
              />
              Mạng ẩn
            </label>
          </div>
        );

      case 'contact':
        return (
          <div className="qr-form">
            <label>Họ tên:</label>
            <input
              type="text"
              value={contactData.name}
              onChange={(e) => setContactData({...contactData, name: e.target.value})}
              placeholder="Họ và tên"
            />
            
            <label>Số điện thoại:</label>
            <input
              type="tel"
              value={contactData.phone}
              onChange={(e) => setContactData({...contactData, phone: e.target.value})}
              placeholder="Số điện thoại"
            />
            
            <label>Email:</label>
            <input
              type="email"
              value={contactData.email}
              onChange={(e) => setContactData({...contactData, email: e.target.value})}
              placeholder="Địa chỉ email"
            />
            
            <label>Công ty/Tổ chức:</label>
            <input
              type="text"
              value={contactData.organization}
              onChange={(e) => setContactData({...contactData, organization: e.target.value})}
              placeholder="Tên công ty hoặc tổ chức"
            />
            
            <label>Website:</label>
            <input
              type="url"
              value={contactData.url}
              onChange={(e) => setContactData({...contactData, url: e.target.value})}
              placeholder="Website cá nhân"
            />
          </div>
        );

      case 'email':
        return (
          <div className="qr-form">
            <label>Địa chỉ email:</label>
            <input
              type="email"
              value={emailData.email}
              onChange={(e) => setEmailData({...emailData, email: e.target.value})}
              placeholder="Địa chỉ email người nhận"
            />
            
            <label>Tiêu đề:</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              placeholder="Tiêu đề email"
            />
            
            <label>Nội dung:</label>
            <textarea
              value={emailData.body}
              onChange={(e) => setEmailData({...emailData, body: e.target.value})}
              placeholder="Nội dung email..."
              rows={4}
            />
          </div>
        );

      case 'sms':
        return (
          <div className="qr-form">
            <label>Số điện thoại:</label>
            <input
              type="tel"
              value={smsData.phone}
              onChange={(e) => setSmsData({...smsData, phone: e.target.value})}
              placeholder="Số điện thoại người nhận"
            />
            
            <label>Tin nhắn:</label>
            <textarea
              value={smsData.message}
              onChange={(e) => setSmsData({...smsData, message: e.target.value})}
              placeholder="Nội dung tin nhắn..."
              rows={4}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="qr-generator-container">
      <div className="qr-generator">
        <div className="qr-generator-header">
          <h1><QrCode className="w-6 h-6" /> Tạo mã QR</h1>
          <p>Tạo mã QR cho nhiều mục đích khác nhau một cách dễ dàng</p>
        </div>

        <div className="qr-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`qr-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="qr-content">
          <div className="qr-form-section">
            <div className="form-header">
              <button
                onClick={clearAllInputs}
                className="clear-inputs-btn"
                title="Xóa tất cả nội dung"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="templates-toggle"
              >
                <Sparkles className="w-4 h-4" />
                {showTemplates ? 'Ẩn mẫu' : 'Xem mẫu có sẵn'}
              </button>
            </div>
            
            {showTemplates && (
              <QRTemplates
                onUseTemplate={handleTemplateUse}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            )}
            
            {renderForm()}
          </div>

          <div className="qr-preview-section">
            <div className="qr-preview">
              {qrValue && (
                <div ref={qrRef} className="qr-code-container">
                  <QRCode
                    value={qrValue}
                    size={qrSize}
                    fgColor={qrColor}
                    bgColor={qrBgColor}
                    level="M"
                  />
                </div>
              )}
              {!qrValue && (
                <div className="qr-placeholder">
                  <QrCode className="w-16 h-16" />
                  <p>Điền thông tin để tạo QR code</p>
                </div>
              )}
            </div>

            {qrValue && (
              <div className="qr-actions">
                <button onClick={downloadQR} className="qr-action-btn primary">
                  <Download className="w-4 h-4" />
                  Tải xuống
                </button>
                <button onClick={copyQRImage} className="qr-action-btn secondary">
                  <Copy className="w-4 h-4" />
                  Sao chép ảnh
                </button>
                <button onClick={handleSaveToHistory} className="qr-action-btn save">
                  <Save className="w-4 h-4" />
                  Lưu vào lịch sử
                </button>
              </div>
            )}

            <div className="qr-settings">
              <button 
                className="settings-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                Cài đặt nâng cao {showAdvanced ? '↑' : '↓'}
              </button>
              
              {showAdvanced && (
                <div className="advanced-settings">
                  <div className="setting-group">
                    <label>Kích thước: {qrSize}px</label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="setting-group">
                    <label>Màu QR:</label>
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                    />
                  </div>
                  
                  <div className="setting-group">
                    <label>Màu nền:</label>
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <QRHistory ref={historyRef} />
    </div>
  );
};

export default QRGenerator;
