import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import JSZip from 'jszip';
import { Download, Upload, FileText, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const QRBatch = () => {
  const [batchData, setBatchData] = useState([]);
  const [newEntry, setNewEntry] = useState({ label: '', value: '', type: 'text' });
  const [qrSettings, setQrSettings] = useState({
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef();

  const qrTypes = [
    { value: 'text', label: 'Văn bản' },
    { value: 'url', label: 'Website' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Điện thoại' }
  ];

  const addEntry = () => {
    if (!newEntry.label.trim() || !newEntry.value.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const entry = {
      id: Date.now(),
      label: newEntry.label.trim(),
      value: newEntry.value.trim(),
      type: newEntry.type,
      status: 'pending'
    };

    setBatchData([...batchData, entry]);
    setNewEntry({ label: '', value: '', type: 'text' });
    toast.success('Đã thêm QR code vào danh sách!');
  };

  const removeEntry = (id) => {
    setBatchData(batchData.filter(entry => entry.id !== id));
    toast.success('Đã xóa khỏi danh sách!');
  };

  const clearAll = () => {
    setBatchData([]);
    toast.success('Đã xóa tất cả!');
  };

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const entries = [];

        lines.forEach((line, index) => {
          const [label, value, type = 'text'] = line.split(',').map(cell => cell.trim());
          if (label && value) {
            entries.push({
              id: Date.now() + index,
              label,
              value,
              type: qrTypes.find(t => t.value === type) ? type : 'text',
              status: 'pending'
            });
          }
        });

        if (entries.length > 0) {
          setBatchData([...batchData, ...entries]);
          toast.success(`Đã import ${entries.length} QR code!`);
        } else {
          toast.error('Không tìm thấy dữ liệu hợp lệ trong file!');
        }
      } catch (error) {
        toast.error('Lỗi khi đọc file CSV!');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = 'Tên,Nội dung,Loại\nWebsite công ty,https://example.com,url\nEmail hỗ trợ,support@example.com,email\nHotline,+84123456789,phone\nThông tin liên hệ,Công ty ABC - 123 Đường XYZ,text';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'qr-batch-template.csv';
    link.click();
    toast.success('Đã tải xuống file mẫu!');
  };

  const generateAllQR = async () => {
    if (batchData.length === 0) {
      toast.error('Chưa có QR code nào để tạo!');
      return;
    }

    setIsGenerating(true);
    const zip = new JSZip();

    try {
      for (let i = 0; i < batchData.length; i++) {
        const entry = batchData[i];
        
        // Update status
        setBatchData(prev => prev.map(item => 
          item.id === entry.id ? { ...item, status: 'generating' } : item
        ));

        // Create QR code
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = qrSettings.size;
        canvas.height = qrSettings.size;

        // Create QR code element
        const qrElement = document.createElement('div');
        qrElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${qrSettings.size}" height="${qrSettings.size}"></svg>`;
        
        // Generate QR using react-qr-code logic (simplified)
        const QRCodeLib = await import('qrcode');
        const qrDataURL = await QRCodeLib.toDataURL(entry.value, {
          width: qrSettings.size,
          color: {
            dark: qrSettings.fgColor,
            light: qrSettings.bgColor
          }
        });

        // Convert to blob
        const response = await fetch(qrDataURL);
        const blob = await response.blob();
        
        // Add to zip
        const fileName = `${entry.label.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        zip.file(fileName, blob);

        // Update status
        setBatchData(prev => prev.map(item => 
          item.id === entry.id ? { ...item, status: 'completed' } : item
        ));

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `qr-codes-batch-${Date.now()}.zip`;
      link.click();

      toast.success('Đã tạo và tải xuống tất cả QR code!');
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast.error('Có lỗi xảy ra khi tạo QR code!');
    }

    setIsGenerating(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'generating':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="qr-batch">
      <div className="batch-header">
        <h2>Tạo QR Code hàng loạt</h2>
        <p>Tạo nhiều QR code cùng lúc và tải xuống dưới dạng file ZIP</p>
      </div>

      <div className="batch-content">
        <div className="batch-controls">
          <div className="add-entry-form">
            <h3>Thêm QR Code mới</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Tên/Nhãn QR code"
                value={newEntry.label}
                onChange={(e) => setNewEntry({ ...newEntry, label: e.target.value })}
                className="form-input"
              />
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                className="form-select"
              >
                {qrTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Nội dung QR code (URL, text, email, số điện thoại...)"
              value={newEntry.value}
              onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
              className="form-textarea"
              rows={3}
            />
            <button onClick={addEntry} className="add-btn">
              <Plus className="w-4 h-4" />
              Thêm vào danh sách
            </button>
          </div>

          <div className="import-section">
            <h3>Import từ file CSV</h3>
            <div className="import-controls">
              <button onClick={downloadTemplate} className="template-btn">
                <FileText className="w-4 h-4" />
                Tải file mẫu
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="import-btn"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={importFromCSV}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="qr-settings-section">
            <h3>Cài đặt QR Code</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Kích thước: {qrSettings.size}px</label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  value={qrSettings.size}
                  onChange={(e) => setQrSettings({ ...qrSettings, size: Number(e.target.value) })}
                />
              </div>
              <div className="setting-item">
                <label>Màu QR:</label>
                <input
                  type="color"
                  value={qrSettings.fgColor}
                  onChange={(e) => setQrSettings({ ...qrSettings, fgColor: e.target.value })}
                />
              </div>
              <div className="setting-item">
                <label>Màu nền:</label>
                <input
                  type="color"
                  value={qrSettings.bgColor}
                  onChange={(e) => setQrSettings({ ...qrSettings, bgColor: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="batch-list">
          <div className="list-header">
            <h3>Danh sách QR Code ({batchData.length})</h3>
            <div className="list-actions">
              {batchData.length > 0 && (
                <>
                  <button onClick={clearAll} className="clear-btn" disabled={isGenerating}>
                    <Trash2 className="w-4 h-4" />
                    Xóa tất cả
                  </button>
                  <button onClick={generateAllQR} className="generate-btn" disabled={isGenerating}>
                    <Download className="w-4 h-4" />
                    {isGenerating ? 'Đang tạo...' : 'Tạo & Tải xuống'}
                  </button>
                </>
              )}
            </div>
          </div>

          {batchData.length === 0 ? (
            <div className="empty-list">
              <FileText className="w-12 h-12" />
              <p>Chưa có QR code nào</p>
              <span>Thêm QR code vào danh sách để bắt đầu</span>
            </div>
          ) : (
            <div className="entries-list">
              {batchData.map(entry => (
                <div key={entry.id} className="entry-item">
                  <div className="entry-info">
                    <div className="entry-header">
                      <span className="entry-label">{entry.label}</span>
                      <span className="entry-type">{qrTypes.find(t => t.value === entry.type)?.label}</span>
                    </div>
                    <div className="entry-value">{entry.value}</div>
                  </div>
                  <div className="entry-actions">
                    {getStatusIcon(entry.status)}
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="remove-btn"
                      disabled={isGenerating}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRBatch;
