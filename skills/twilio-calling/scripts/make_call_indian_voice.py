#!/usr/bin/env python3

# Twilio credentials - REPLACE WITH YOUR VALUES
account_sid = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
auth_token = "your_twilio_auth_token_here"
from_number = "+1XXXXXXXXXX"  # Your Twilio number
to_number = "+91XXXXXXXXX"   # Target phone number

# TwiML for voice call with Indian voice
twiml_message = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="hi-IN">Namaste Dr. Murali sir! Yah aapka AI assistant bol raha hai. NABH audit ki preparation ke liye important reminder hai.</Say>
    <Pause length="1"/>
    <Say voice="Polly.Aditi" language="en-IN">Hello Dr. Murali, this is your AI assistant with an important NABH preparation reminder. The audit is in 10 days only. Please check your WhatsApp messages for today's updates.</Say>
    <Pause length="2"/>
    <Say voice="Polly.Aditi" language="en-IN">Tomorrow morning 9 AM huddle is very important sir. All department heads should be ready. Have a good evening!</Say>
    <Pause length="1"/>
    <Say voice="Polly.Aditi" language="hi-IN">Dhanyawad sir! AI assistant se call tha. Good night!</Say>
</Response>"""

# Alternative with just English but Indian accent
twiml_english_indian = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="en-IN">Hello Dr. Murali sir! This is your AI assistant calling with important NABH preparation reminder. The audit is in 10 days only.</Say>
    <Pause length="1"/>
    <Say voice="Polly.Aditi" language="en-IN">Please check your WhatsApp for today's updates. Tomorrow 9 AM morning huddle is very important. All department heads should be present.</Say>
    <Pause length="2"/>
    <Say voice="Polly.Aditi" language="en-IN">This call was made through your OpenClaw AI assistant. Thank you sir, have a good evening!</Say>
</Response>"""

import subprocess
import json

def make_call_with_indian_voice(use_hindi_mix=True):
    """Make call with Indian voice - Aditi from Amazon Polly"""
    
    message = twiml_message if use_hindi_mix else twiml_english_indian
    
    cmd = [
        'curl', '-X', 'POST', 
        f'https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls.json',
        '--data-urlencode', f'From={from_number}',
        '--data-urlencode', f'To={to_number}',
        '--data-urlencode', f'Twiml={message}',
        '-u', f'{account_sid}:{auth_token}'
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            print(f"✅ Indian voice call initiated successfully!")
            print(f"Voice: Polly.Aditi (Indian female voice)")
            print(f"Call SID: {response['sid']}")
            print(f"Status: {response['status']}")
            print(f"From: {response['from']}")
            print(f"To: {response['to']}")
            return response
        else:
            print(f"❌ Error: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return None

if __name__ == "__main__":
    print("🔄 Initiating call with Indian voice (Aditi - female from India)...")
    make_call_with_indian_voice(use_hindi_mix=True)