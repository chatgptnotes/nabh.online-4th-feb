#!/usr/bin/env python3

# Simple Twilio call without premium features (trial-account friendly)
# REPLACE WITH YOUR VALUES
account_sid = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
auth_token = "your_twilio_auth_token_here"
from_number = "+1XXXXXXXXXX"
to_number = "+91XXXXXXXXX"

# Simple TwiML with basic voices only
twiml_simple = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="woman">Hello Dr. Murali! This is your AI assistant with an urgent NABH reminder. The audit is in 10 days. Please check WhatsApp for updates. Tomorrow 9 AM huddle is critical. Thank you!</Say>
</Response>"""

import subprocess
import json

def make_simple_call():
    cmd = [
        'curl', '-X', 'POST', 
        f'https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls.json',
        '--data-urlencode', f'From={from_number}',
        '--data-urlencode', f'To={to_number}',
        '--data-urlencode', f'Twiml={twiml_simple}',
        '-u', f'{account_sid}:{auth_token}'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        response = json.loads(result.stdout)
        print(f"✅ Simple call initiated (trial-account friendly)")
        print(f"Call SID: {response['sid']}")
        print(f"Status: {response['status']}")
        return response
    else:
        print(f"❌ Error: {result.stderr}")
        return None

if __name__ == "__main__":
    print("🔄 Making simple call (no upgrade prompts)...")
    make_simple_call()