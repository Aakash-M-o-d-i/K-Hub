import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from flask import current_app
from datetime import datetime


def send_otp_email(target_email, user_name, otp_code):
    """
    Sends a Transactional Email using Brevo (formerly Sendinblue)
    """
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = current_app.config['BREVO_API_KEY']

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
    
    sender_email = current_app.config['BREVO_SENDER_EMAIL']
    sender_name = current_app.config['BREVO_SENDER_NAME']
    
    subject = f"{otp_code} is your Knowledge Hub verification code"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded-lg: 12px;">
          <h2 style="color: #2563eb;">Welcome to Knowledge Hub!</h2>
          <p>Hi {user_name},</p>
          <p>Thank you for joining our community. To complete your registration, please use the verification code below:</p>
          <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0;">
            {otp_code}
          </div>
          <p>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Knowledge Hub - Your Academic Companion</p>
        </div>
      </body>
    </html>
    """
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": target_email, "name": user_name}],
        sender={"email": sender_email, "name": sender_name},
        subject=subject,
        html_content=html_content
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        current_app.logger.info(f"OTP email sent to {target_email}")
        return True
    except ApiException as e:
        current_app.logger.error(f"Brevo API Exception ({datetime.now()}): {e}")
        return False
    except Exception as e:
        current_app.logger.error(f"General Email Exception ({datetime.now()}): {e}")
        return False


def send_password_reset_email(target_email, user_name, otp_code):
    """
    Sends a Password Reset OTP Email using Brevo (formerly Sendinblue)
    """
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = current_app.config['BREVO_API_KEY']

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    sender_email = current_app.config['BREVO_SENDER_EMAIL']
    sender_name = current_app.config['BREVO_SENDER_NAME']

    subject = f"{otp_code} - Reset your Knowledge Hub password"

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hi {user_name},</p>
          <p>We received a request to reset your password. Use the code below to proceed:</p>
          <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0;">
            {otp_code}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #999;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Knowledge Hub - Your Academic Companion</p>
        </div>
      </body>
    </html>
    """

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": target_email, "name": user_name}],
        sender={"email": sender_email, "name": sender_name},
        subject=subject,
        html_content=html_content
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        current_app.logger.info(f"Password reset email sent to {target_email}")
        return True
    except ApiException as e:
        current_app.logger.error(f"Brevo API Exception (password reset): {e}")
        return False
    except Exception as e:
        current_app.logger.error(f"General Email Exception (password reset): {e}")
        return False
