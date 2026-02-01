#!/usr/bin/env python3
"""
DeeMeet Admin CLI Tool
Usage: python3 admin_cli.py [command]

Commands:
  stats       - Show dashboard statistics
  users      - List all users
  demographics - Show user demographics
  growth      - Show user growth
  coupons     - List all coupons
  create-coupon CODE DISCOUNT - Create a new coupon
  
Example:
  python3 admin_cli.py stats
  python3 admin_cli.py create-coupon SAVE20 20
"""

import sys
import requests
import json

API_URL = "http://localhost:8000/api"
# Login first to get your token, then paste it here:
TOKEN = "YOUR_JWT_TOKEN_HERE"

def get_headers():
    return {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }

def show_stats():
    response = requests.get(f"{API_URL}/admin/stats", headers=get_headers())
    if response.status_code == 200:
        data = response.json()
        print("\n📊 DASHBOARD STATISTICS")
        print("=" * 50)
        print(f"Total Users: {data['total_users']}")
        print(f"Onboarded Users: {data['onboarded_users']}")
        print(f"Pending Onboarding: {data['pending_onboarding']}")
        print(f"\nPLANS:")
        print(f"  Free: {data['plans']['free']}")
        print(f"  Pro: {data['plans']['pro']}")
        print(f"  Premium: {data['plans']['premium']}")
        print(f"\nBOOKINGS:")
        print(f"  Total: {data['bookings']['total']}")
        print(f"  This Month: {data['bookings']['this_month']}")
        print(f"\nREVENUE:")
        print(f"  Estimated Monthly: ${data['revenue']['estimated_monthly']} {data['revenue']['currency']}")
        print(f"\nGROWTH:")
        print(f"  New Users This Week: {data['growth']['new_users_this_week']}")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def list_users(search=""):
    params = f"?search={search}" if search else ""
    response = requests.get(f"{API_URL}/admin/users{params}", headers=get_headers())
    if response.status_code == 200:
        data = response.json()
        print(f"\n👥 USERS (Total: {data['total']})")
        print("=" * 100)
        print(f"{'Name':<20} {'Email':<30} {'Plan':<10} {'Bookings':<10} {'Joined':<15}")
        print("-" * 100)
        for user in data['users']:
            name = user.get('name', 'N/A')[:19]
            email = user.get('email', 'N/A')[:29]
            plan = user.get('plan', 'free')
            bookings = user.get('booking_count', 0)
            joined = user.get('created_at', 'N/A')[:10]
            print(f"{name:<20} {email:<30} {plan:<10} {bookings:<10} {joined:<15}")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def show_demographics():
    response = requests.get(f"{API_URL}/admin/analytics/demographics", headers=get_headers())
    if response.status_code == 200:
        data = response.json()
        print("\n🌍 DEMOGRAPHICS")
        print("=" * 50)
        print("\nTOP COUNTRIES:")
        for item in data['countries']:
            print(f"  {item['country']}: {item['count']}")
        print("\nTOP TIMEZONES:")
        for item in data['timezones']:
            print(f"  {item['timezone']}: {item['count']}")
        print("\nLANGUAGES:")
        for item in data['languages']:
            print(f"  {item['language']}: {item['count']}")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def show_growth():
    response = requests.get(f"{API_URL}/admin/analytics/growth", headers=get_headers())
    if response.status_code == 200:
        data = response.json()
        print("\n📈 USER GROWTH (Last 30 Days)")
        print("=" * 50)
        for item in data['daily_signups']:
            bar = "█" * item['count']
            print(f"{item['date']}: {bar} ({item['count']})")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def list_coupons():
    response = requests.get(f"{API_URL}/admin/coupons", headers=get_headers())
    if response.status_code == 200:
        data = response.json()
        print("\n💰 COUPONS")
        print("=" * 80)
        print(f"{'Code':<15} {'Discount':<10} {'Uses':<15} {'Expires':<15} {'Created':<15}")
        print("-" * 80)
        for coupon in data['coupons']:
            code = coupon['code']
            discount = f"{coupon['discount_percent']}%"
            uses = f"{coupon['current_uses']}/{coupon.get('max_uses', '∞')}"
            expires = coupon.get('expires_at', 'Never')[:10] if coupon.get('expires_at') else 'Never'
            created = coupon['created_at'][:10]
            print(f"{code:<15} {discount:<10} {uses:<15} {expires:<15} {created:<15}")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def create_coupon(code, discount):
    response = requests.post(
        f"{API_URL}/admin/coupons?code={code}&discount_percent={discount}",
        headers=get_headers()
    )
    if response.status_code == 200:
        print(f"✅ Coupon '{code}' created successfully with {discount}% discount!")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    command = sys.argv[1]
    
    if TOKEN == "YOUR_JWT_TOKEN_HERE":
        print("⚠️  Please set your JWT token in the script first!")
        print("1. Login at http://localhost:3000/login")
        print("2. Open browser DevTools > Application > Local Storage")
        print("3. Copy the 'token' value")
        print("4. Paste it in admin_cli.py as TOKEN variable")
        return
    
    if command == "stats":
        show_stats()
    elif command == "users":
        search = sys.argv[2] if len(sys.argv) > 2 else ""
        list_users(search)
    elif command == "demographics":
        show_demographics()
    elif command == "growth":
        show_growth()
    elif command == "coupons":
        list_coupons()
    elif command == "create-coupon":
        if len(sys.argv) < 4:
            print("Usage: python3 admin_cli.py create-coupon CODE DISCOUNT")
            return
        create_coupon(sys.argv[2], sys.argv[3])
    else:
        print(f"Unknown command: {command}")
        print(__doc__)

if __name__ == "__main__":
    main()
