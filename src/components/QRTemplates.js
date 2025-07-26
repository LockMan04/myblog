import React from 'react';
import { Wifi, User, Mail, Phone, MapPin, Calendar, Heart, Star, Gift } from 'lucide-react';

const QRTemplates = ({ onUseTemplate, activeTab, setActiveTab }) => {
  const templates = {
    wifi: [
      {
        id: 'home-wifi',
        title: 'WiFi nhà',
        icon: Wifi,
        description: 'Chia sẻ mật khẩu WiFi nhà một cách nhanh chóng',
        data: {
          ssid: 'My_Home_WiFi',
          password: '',
          security: 'WPA',
          hidden: false
        }
      },
      {
        id: 'guest-wifi',
        title: 'WiFi khách',
        icon: Wifi,
        description: 'WiFi dành cho khách đến chơi',
        data: {
          ssid: 'Guest_WiFi',
          password: 'guest123',
          security: 'WPA',
          hidden: false
        }
      }
    ],
    contact: [
      {
        id: 'business-card',
        title: 'Danh thiếp kinh doanh',
        icon: User,
        description: 'Chia sẻ thông tin liên hệ công việc',
        data: {
          name: 'Nguyễn Văn A',
          phone: '+84 123 456 789',
          email: 'contact@example.com',
          organization: 'Công ty ABC',
          url: 'https://example.com'
        }
      },
      {
        id: 'personal-card',
        title: 'Thông tin cá nhân',
        icon: User,
        description: 'Chia sẻ thông tin liên hệ cá nhân',
        data: {
          name: 'Tên của bạn',
          phone: '+84 987 654 321',
          email: 'personal@example.com',
          organization: '',
          url: ''
        }
      }
    ],
    url: [
      {
        id: 'website',
        title: 'Website công ty',
        icon: Star,
        description: 'Liên kết đến trang web chính',
        data: 'https://example.com'
      },
      {
        id: 'social-media',
        title: 'Mạng xã hội',
        icon: Heart,
        description: 'Facebook, Instagram, LinkedIn',
        data: 'https://facebook.com/yourpage'
      },
      {
        id: 'youtube',
        title: 'Kênh YouTube',
        icon: Star,
        description: 'Chia sẻ video hoặc kênh YouTube',
        data: 'https://youtube.com/@yourchannel'
      }
    ],
    email: [
      {
        id: 'support-email',
        title: 'Email hỗ trợ',
        icon: Mail,
        description: 'Gửi email hỗ trợ nhanh chóng',
        data: {
          email: 'support@example.com',
          subject: 'Yêu cầu hỗ trợ',
          body: 'Xin chào, tôi cần hỗ trợ về...'
        }
      },
      {
        id: 'feedback-email',
        title: 'Email phản hồi',
        icon: Mail,
        description: 'Thu thập phản hồi từ khách hàng',
        data: {
          email: 'feedback@example.com',
          subject: 'Phản hồi về sản phẩm/dịch vụ',
          body: 'Cảm ơn bạn đã dành thời gian phản hồi!'
        }
      }
    ],
    sms: [
      {
        id: 'hotline',
        title: 'Hotline hỗ trợ',
        icon: Phone,
        description: 'Gửi tin nhắn đến số hỗ trợ',
        data: {
          phone: '1900 1234',
          message: 'Xin chào, tôi cần hỗ trợ'
        }
      },
      {
        id: 'booking-sms',
        title: 'Đặt lịch hẹn',
        icon: Calendar,
        description: 'Gửi tin nhắn đặt lịch nhanh',
        data: {
          phone: '+84 123 456 789',
          message: 'Tôi muốn đặt lịch hẹn vào...'
        }
      }
    ],
    text: [
      {
        id: 'promotion',
        title: 'Mã khuyến mãi',
        icon: Gift,
        description: 'Chia sẻ mã giảm giá hoặc khuyến mãi',
        data: 'SALE50OFF - Giảm 50% cho đơn hàng đầu tiên!'
      },
      {
        id: 'location',
        title: 'Địa chỉ địa điểm',
        icon: MapPin,
        description: 'Chia sẻ địa chỉ cụ thể',
        data: '123 Đường ABC, Quận 1, TP.HCM\nSố điện thoại: (028) 1234 5678'
      },
      {
        id: 'event-info',
        title: 'Thông tin sự kiện',
        icon: Calendar,
        description: 'Chi tiết về sự kiện sắp tới',
        data: 'Sự kiện: Hội thảo Công nghệ 2025\nThời gian: 15/02/2025 - 09:00\nĐịa điểm: Trung tâm Hội nghị ABC'
      }
    ]
  };

  const currentTemplates = templates[activeTab] || [];

  const handleUseTemplate = (template) => {
    onUseTemplate(template.data);
  };

  return (
    <div className="qr-templates">
      <div className="templates-header">
        <h3>Mẫu có sẵn</h3>
        <p>Chọn mẫu phù hợp để tạo QR code nhanh chóng</p>
      </div>

      {currentTemplates.length > 0 ? (
        <div className="templates-grid">
          {currentTemplates.map(template => {
            const Icon = template.icon;
            return (
              <div key={template.id} className="template-card">
                <div className="template-icon">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="template-content">
                  <h4>{template.title}</h4>
                  <p>{template.description}</p>
                </div>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="template-btn"
                >
                  Sử dụng
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-templates">
          <p>Không có mẫu nào cho loại QR code này</p>
        </div>
      )}
    </div>
  );
};

export default QRTemplates;
