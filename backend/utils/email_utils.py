import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from flask import current_app
import os

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
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"Brevo Email Sent: {api_response}")
        return True
    except ApiException as e:
        error_msg = f"--- Brevo API Exception ({datetime.now()}) ---\n{e}\n"
        with open("backend_error.txt", "a") as f:
            f.write(error_msg)
        print(error_msg)
        return False
    except Exception as e:
        error_msg = f"--- General Email Exception ({datetime.now()}) ---\n{e}\n"
        with open("backend_error.txt", "a") as f:
            f.write(error_msg)
        print(error_msg)
        return False
