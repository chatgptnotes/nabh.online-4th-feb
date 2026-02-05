#!/usr/bin/env python3

import requests
from requests.auth import HTTPBasicAuth
import json

# Twilio credentials - REPLACE WITH YOUR VALUES
account_sid = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
auth_token = "your_twilio_auth_token_here"
from_number = "+1XXXXXXXXXX"  # Your Twilio number
to_number = "+91XXXXXXXXX"   # Target phone number

# TwiML for voice call
twiml_message = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello Dr. Murali, this is your AI assistant calling to remind you about important NABH preparations. The audit is in 10 days. Please check your WhatsApp for updates. Have a great evening!</Say>
    <Pause length="2"/>
    <Say voice="alice">This call was made through your OpenClaw AI assistant. Goodbye!</Say>
</Response>"""

def make_call():
    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls.json"
    
    data = {
        'From': from_number,
        'To': to_number,
        'Twiml': twiml_message
    }
    
    try:
        response = requests.post(
            url,
            data=data,
            auth=HTTPBasicAuth(account_sid, auth_token)
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Call initiated successfully!")
            print(f"Call SID: {result['sid']}")
            print(f"Status: {result['status']}")
            print(f"From: {result['from']}")
            print(f"To: {result['to']}")
            return result
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return None

if __name__ == "__main__":
    print("🔄 Initiating call via Twilio...")
    make_call()