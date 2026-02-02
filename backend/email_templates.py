"""
Email templates for DeeMeet notifications
"""

def get_guest_confirmation_template(
    guest_name: str,
    host_name: str,
    meeting_title: str,
    date_str: str,
    time_str: str,
    duration: int,
    location: str,
    meeting_link: str = None,
    notes: str = "",
    host_email: str = "",
    reschedule_link: str = "",
    cancel_link: str = ""
):
    """Email template for guest/attendee confirmation"""
    
    meeting_link_html = ""
    if meeting_link:
        if "google.com" in meeting_link.lower() or "meet" in meeting_link.lower():
            meeting_link_html = f"""
            <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #166534; font-weight: 600; font-size: 16px;">📍 This is a Google Meet web conference</p>
                <p style="margin: 0 0 10px 0; color: #15803d; font-size: 14px;">
                    You can join this meeting from your computer or smartphone.<br/>
                    <a href="{meeting_link}" style="color: #15803d; text-decoration: underline;">join.new</a>
                </p>
                <div style="margin-top: 15px;">
                    <a href="{meeting_link}" style="display: inline-block; background: #22c55e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Join with Google Meet
                    </a>
                </div>
            </div>
            """
        else:
            meeting_link_html = f"""
            <div style="text-align: center; margin: 25px 0;">
                <a href="{meeting_link}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Join Meeting
                </a>
            </div>
            """
    
    notes_html = ""
    if notes:
        notes_html = f"""
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #92400e;"><strong>📝 Description:</strong></p>
            <p style="margin: 5px 0 0 0; color: #78350f;">{notes}</p>
        </div>
        """
    
    action_buttons = ""
    if reschedule_link or cancel_link:
        action_buttons = f"""
        <div style="text-align: center; margin: 30px 0;">
            {f'<a href="{reschedule_link}" style="display: inline-block; background: white; color: #7c3aed; padding: 12px 24px; border: 2px solid #7c3aed; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 10px;">Reschedule</a>' if reschedule_link else ''}
            {f'<a href="{cancel_link}" style="display: inline-block; background: white; color: #dc2626; padding: 12px 24px; border: 2px solid #dc2626; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 10px;">Cancel</a>' if cancel_link else ''}
        </div>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                line-height: 1.6; 
                color: #1e293b; 
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
            }}
            .email-wrapper {{ 
                max-width: 600px; 
                margin: 0 auto; 
                background: white;
            }}
            .header {{ 
                background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: left;
            }}
            .header h1 {{
                margin: 0 0 8px 0;
                font-size: 28px;
                font-weight: 700;
            }}
            .header p {{
                margin: 0;
                opacity: 0.95;
                font-size: 16px;
            }}
            .content {{ 
                padding: 40px 30px;
                background: white;
            }}
            .meeting-card {{ 
                background: #f8fafc; 
                border-radius: 12px; 
                padding: 28px; 
                margin: 25px 0; 
                border: 1px solid #e2e8f0;
            }}
            .meeting-card h2 {{
                margin: 0 0 20px 0;
                color: #7c3aed;
                font-size: 22px;
                font-weight: 600;
            }}
            .detail-row {{ 
                display: flex; 
                margin: 14px 0;
                align-items: flex-start;
            }}
            .detail-icon {{
                font-size: 20px;
                margin-right: 12px;
                min-width: 24px;
            }}
            .detail-content {{
                flex: 1;
            }}
            .detail-label {{ 
                color: #64748b; 
                font-size: 13px;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }}
            .detail-value {{ 
                color: #1e293b; 
                font-weight: 600;
                font-size: 16px;
            }}
            .divider {{
                height: 1px;
                background: #e2e8f0;
                margin: 20px 0;
            }}
            .footer {{ 
                text-align: center; 
                color: #94a3b8; 
                font-size: 13px; 
                padding: 30px;
                border-top: 1px solid #e2e8f0;
            }}
            .footer p {{
                margin: 5px 0;
            }}
            .footer a {{
                color: #7c3aed;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <h1>✓ You're scheduled!</h1>
                <p>A calendar invitation has been sent to your email address</p>
            </div>
            <div class="content">
                <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong>{guest_name}</strong>,</p>
                <p style="font-size: 16px; color: #64748b; margin-top: 0;">A new event has been scheduled.</p>
                
                <div class="meeting-card">
                    <h2>{meeting_title}</h2>
                    
                    <div class="detail-row">
                        <span class="detail-icon">👤</span>
                        <div class="detail-content">
                            <div class="detail-label">Invitee</div>
                            <div class="detail-value">{guest_name}</div>
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-icon">👔</span>
                        <div class="detail-content">
                            <div class="detail-label">Host</div>
                            <div class="detail-value">{host_name}</div>
                        </div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="detail-row">
                        <span class="detail-icon">📅</span>
                        <div class="detail-content">
                            <div class="detail-label">When</div>
                            <div class="detail-value">{time_str} - {date_str}</div>
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-icon">🌐</span>
                        <div class="detail-content">
                            <div class="detail-label">Where</div>
                            <div class="detail-value">{location}</div>
                        </div>
                    </div>
                    
                    {notes_html}
                </div>
                
                {meeting_link_html}
                
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 25px 0;">
                    <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                        💡 <strong>Need to make changes?</strong><br/>
                        Please use the reschedule or cancel options below, or reply to this email.
                    </p>
                </div>
                
                {action_buttons}
            </div>
            <div class="footer">
                <p>Powered by <a href="https://deemeet.in">DeeMeet</a></p>
                <p style="font-size: 12px; margin-top: 10px;">Smart scheduling made simple</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_content


def get_host_notification_template(
    host_name: str,
    guest_name: str,
    guest_email: str,
    guest_phone: str,
    meeting_title: str,
    date_str: str,
    time_str: str,
    duration: int,
    location: str,
    meeting_link: str = None,
    notes: str = "",
    manage_link: str = ""
):
    """Email template for host notification"""
    
    meeting_link_html = ""
    if meeting_link:
        if "google.com" in meeting_link.lower() or "meet" in meeting_link.lower():
            meeting_link_html = f"""
            <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #166534; font-weight: 600; font-size: 16px;">📍 Google Meet Conference</p>
                <p style="margin: 0 0 10px 0; color: #15803d; font-size: 14px;">
                    <a href="{meeting_link}" style="color: #15803d; text-decoration: underline; word-break: break-all;">{meeting_link}</a>
                </p>
                <div style="margin-top: 15px;">
                    <a href="{meeting_link}" style="display: inline-block; background: #22c55e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Join with Google Meet
                    </a>
                </div>
            </div>
            """
        else:
            meeting_link_html = f"""
            <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600;">Meeting Link:</p>
                <p style="margin: 0; word-break: break-all;">
                    <a href="{meeting_link}" style="color: #22c55e;">{meeting_link}</a>
                </p>
            </div>
            """
    
    phone_html = ""
    if guest_phone:
        phone_html = f"""
        <div class="detail-row">
            <span class="detail-icon">📱</span>
            <div class="detail-content">
                <div class="detail-label">Phone</div>
                <div class="detail-value">{guest_phone}</div>
            </div>
        </div>
        """
    
    notes_html = ""
    if notes:
        notes_html = f"""
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #92400e;"><strong>📝 Description:</strong></p>
            <p style="margin: 5px 0 0 0; color: #78350f;">{notes}</p>
        </div>
        """
    
    manage_button = ""
    if manage_link:
        manage_button = f"""
        <div style="text-align: center; margin: 30px 0;">
            <a href="{manage_link}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                View in Dashboard
            </a>
        </div>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                line-height: 1.6; 
                color: #1e293b; 
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
            }}
            .email-wrapper {{ 
                max-width: 600px; 
                margin: 0 auto; 
                background: white;
            }}
            .header {{ 
                background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: left;
            }}
            .header h1 {{
                margin: 0 0 8px 0;
                font-size: 28px;
                font-weight: 700;
            }}
            .header p {{
                margin: 0;
                opacity: 0.95;
                font-size: 16px;
            }}
            .content {{ 
                padding: 40px 30px;
                background: white;
            }}
            .meeting-card {{ 
                background: #f8fafc; 
                border-radius: 12px; 
                padding: 28px; 
                margin: 25px 0; 
                border: 1px solid #e2e8f0;
            }}
            .meeting-card h2 {{
                margin: 0 0 20px 0;
                color: #7c3aed;
                font-size: 22px;
                font-weight: 600;
            }}
            .detail-row {{ 
                display: flex; 
                margin: 14px 0;
                align-items: flex-start;
            }}
            .detail-icon {{
                font-size: 20px;
                margin-right: 12px;
                min-width: 24px;
            }}
            .detail-content {{
                flex: 1;
            }}
            .detail-label {{ 
                color: #64748b; 
                font-size: 13px;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }}
            .detail-value {{ 
                color: #1e293b; 
                font-weight: 600;
                font-size: 16px;
            }}
            .divider {{
                height: 1px;
                background: #e2e8f0;
                margin: 20px 0;
            }}
            .footer {{ 
                text-align: center; 
                color: #94a3b8; 
                font-size: 13px; 
                padding: 30px;
                border-top: 1px solid #e2e8f0;
            }}
            .footer p {{
                margin: 5px 0;
            }}
            .footer a {{
                color: #7c3aed;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <h1>📅 New Event Scheduled</h1>
                <p>Someone has scheduled a meeting with you</p>
            </div>
            <div class="content">
                <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong>{host_name}</strong>,</p>
                <p style="font-size: 16px; color: #64748b; margin-top: 0;">A new event has been scheduled.</p>
                
                <div class="meeting-card">
                    <h2>{meeting_title}</h2>
                    
                    <div class="detail-row">
                        <span class="detail-icon">👤</span>
                        <div class="detail-content">
                            <div class="detail-label">Invitee</div>
                            <div class="detail-value">{guest_name}</div>
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-icon">✉️</span>
                        <div class="detail-content">
                            <div class="detail-label">Email</div>
                            <div class="detail-value"><a href="mailto:{guest_email}" style="color: #7c3aed; text-decoration: none;">{guest_email}</a></div>
                        </div>
                    </div>
                    
                    {phone_html}
                    
                    <div class="divider"></div>
                    
                    <div class="detail-row">
                        <span class="detail-icon">📅</span>
                        <div class="detail-content">
                            <div class="detail-label">When</div>
                            <div class="detail-value">{time_str} - {date_str}</div>
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-icon">⏱️</span>
                        <div class="detail-content">
                            <div class="detail-label">Duration</div>
                            <div class="detail-value">{duration} min</div>
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-icon">🌐</span>
                        <div class="detail-content">
                            <div class="detail-label">Where</div>
                            <div class="detail-value">{location}</div>
                        </div>
                    </div>
                    
                    {notes_html}
                </div>
                
                {meeting_link_html}
                
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 25px 0;">
                    <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                        📌 <strong>Let's see how we can collaborate for success!</strong>
                    </p>
                </div>
                
                {manage_button}
            </div>
            <div class="footer">
                <p>Powered by <a href="https://deemeet.in">DeeMeet</a></p>
                <p style="font-size: 12px; margin-top: 10px;">Smart scheduling made simple</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_content
