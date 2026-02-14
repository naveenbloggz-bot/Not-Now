from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from typing import Optional

class EmailDeliveryError(Exception):
    pass

def send_email(to: str, subject: str, content: str):
    """Send email via SendGrid"""
    sender_email = os.getenv('SENDER_EMAIL', 'noreply@yourdomain.com')
    api_key = os.getenv('SENDGRID_API_KEY')
    
    if not api_key or api_key == 'your_sendgrid_api_key_here':
        print(f"SendGrid not configured. Would send email to {to}: {subject}")
        return True
    
    message = Mail(
        from_email=sender_email,
        to_emails=to,
        subject=subject,
        html_content=content
    )
    
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Email error: {str(e)}")
        return False

def send_order_confirmation(email: str, order_id: str, total: float, items: list):
    """Send order confirmation email"""
    items_html = "".join([
        f"<li>{item['name']} x {item['quantity']} - ${item['price']:.2f}</li>"
        for item in items
    ])
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Order Confirmation</h2>
            <p>Thank you for your order!</p>
            <p><strong>Order ID:</strong> {order_id}</p>
            <h3>Order Items:</h3>
            <ul>{items_html}</ul>
            <p><strong>Total:</strong> ${total:.2f}</p>
            <p>We'll send you another email when your order ships.</p>
        </body>
    </html>
    """
    
    return send_email(email, f"Order Confirmation - {order_id}", html_content)

def send_review_notification(admin_email: str, customer_name: str, product_name: str):
    """Notify admin of new review submission"""
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Review Submitted</h2>
            <p>A new review has been submitted and is awaiting moderation.</p>
            <p><strong>Customer:</strong> {customer_name}</p>
            <p><strong>Product:</strong> {product_name}</p>
            <p>Please log in to the admin dashboard to review and approve.</p>
        </body>
    </html>
    """
    
    return send_email(admin_email, "New Review Awaiting Moderation", html_content)