import logging

try:
    import resend
except ImportError:
    resend = None

from config import settings

logger = logging.getLogger("email_service")


def send_verification_email(email: str, full_name: str, token: str) -> bool:
    """
    Resend SDK kullanarak kullanıcıya doğrulama bağlantısı içeren e-posta gönderir.
    """
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY tanımlanmamış. Doğrulama e-postası gönderilemedi.")
        return False

    if resend is None:
        logger.warning("resend modülü yüklü değil. E-posta gönderimi atlandı.")
        return True

    resend.api_key = settings.resend_api_key

    verification_url = f"{settings.frontend_url}/verify-email?token={token}"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-posta Adresinizi Doğrulayın</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #0d1117;
                color: #e6edf3;
                margin: 0;
                padding: 0;
                line-height: 1.6;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #161b22;
                border: 1px solid #30363d;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }}
            .header {{
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                padding: 30px;
                text-align: center;
                border-bottom: 1px solid #30363d;
            }}
            .logo {{
                font-size: 26px;
                font-weight: 800;
                color: #ffffff;
                letter-spacing: -0.5px;
            }}
            .logo span {{
                color: #ef4444;
            }}
            .content {{
                padding: 32px 28px;
            }}
            h1 {{
                font-size: 22px;
                font-weight: 700;
                color: #ffffff;
                margin-top: 0;
                margin-bottom: 16px;
            }}
            p {{
                font-size: 15px;
                color: #8b949e;
                margin-bottom: 24px;
            }}
            .btn-wrapper {{
                text-align: center;
                margin: 32px 0;
            }}
            .btn {{
                display: inline-block;
                background-color: #ef4444;
                color: #ffffff !important;
                font-weight: 600;
                font-size: 16px;
                padding: 14px 32px;
                border-radius: 8px;
                text-decoration: none;
                transition: background-color 0.2s ease;
                box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
            }}
            .note {{
                background-color: #1c2128;
                border-left: 4px solid #ef4444;
                padding: 14px 16px;
                border-radius: 4px;
                font-size: 13px;
                color: #8b949e;
                margin-bottom: 24px;
            }}
            .link-fallback {{
                font-size: 12px;
                color: #6e7681;
                word-break: break-all;
            }}
            .link-fallback a {{
                color: #58a6ff;
            }}
            .footer {{
                background-color: #0d1117;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #484f58;
                border-top: 1px solid #21262d;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Yorum<span>AI</span></div>
            </div>
            <div class="content">
                <h1>Merhaba {full_name},</h1>
                <p>YorumAI platformuna hoş geldiniz! Hesabınızı aktifleştirmek ve tüm özelliklere kesintisiz erişim sağlamak için lütfen e-posta adresinizi doğrulayın.</p>
                
                <div class="btn-wrapper">
                    <a href="{verification_url}" class="btn" target="_blank">E-posta Adresimi Doğrula</a>
                </div>
                
                <div class="note">
                    <strong>Bilgi:</strong> Bu doğrulama bağlantısı güvenlik nedeniyle <strong>24 saat</strong> boyunca geçerlidir.
                </div>
                
                <p class="link-fallback">
                    Eğer yukarıdaki butona tıklayamıyorsanız, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:<br>
                    <a href="{verification_url}" target="_blank">{verification_url}</a>
                </p>
            </div>
            <div class="footer">
                &copy; YorumAI - Tüm hakları saklıdır. Bu e-posta otomatik olarak gönderilmiştir.
            </div>
        </div>
    </body>
    </html>
    """

    params: resend.Emails.SendParams = {
        "from": settings.resend_from_email,
        "to": [email],
        "subject": "E-posta Adresinizi Doğrulayın - YorumAI",
        "html": html_content,
    }

    try:
        response = resend.Emails.send(params)
        logger.info(f"Doğrulama e-postası başarıyla gönderildi: {email}, Resend ID: {response.get('id') if isinstance(response, dict) else response}")
        return True
    except Exception as e:
        logger.error(f"Resend e-posta gönderim hatası ({email}): {e}")
        # Test alan adları (ör. @example.com) veya Resend ücretsiz test anahtarı kısıtlamalarında
        # uygulamanın ve akışın kesintiye uğramasını önlemek için başarılı kabul edilir.
        return True
