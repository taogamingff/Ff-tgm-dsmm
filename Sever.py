"""
FF Wishlist Manager - Python Backend Server
Flask API for managing Free Fire wishlist data
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import hashlib
import secrets

app = Flask(__name__)
CORS(app)

# Configuration
DATA_DIR = 'data'
ACCOUNTS_FILE = os.path.join(DATA_DIR, 'accounts.json')
WISHLIST_FILE = os.path.join(DATA_DIR, 'wishlists.json')
ITEMS_FILE = os.path.join(DATA_DIR, 'items.json')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize data files if they don't exist
def init_data_file(filepath, default_data):
    if not os.path.exists(filepath):
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(default_data, f, indent=2)

init_data_file(ACCOUNTS_FILE, [])
init_data_file(WISHLIST_FILE, [])
init_data_file(ITEMS_FILE, {
    "weapons": [
        {"id": "cobra_rage", "name": "Cobra Rage AK-47", "type": "weapon", "rarity": "legendary"},
        {"id": "dragon_ak", "name": "Dragon AK-47", "type": "weapon", "rarity": "epic"},
        {"id": "flame_thrower", "name": "Flame Thrower", "type": "weapon", "rarity": "legendary"},
        {"id": "frost_blade", "name": "Frost Blade", "type": "weapon", "rarity": "epic"}
    ],
    "skins": [
        {"id": "angel_pants", "name": "Angel Pants", "type": "skin", "rarity": "rare"},
        {"id": "criminal_bundle", "name": "Criminal Bundle", "type": "skin", "rarity": "legendary"},
        {"id": "elite_pass", "name": "Elite Pass Skin", "type": "skin", "rarity": "epic"}
    ],
    "bundles": [
        {"id": "phoenix_bundle", "name": "Phoenix Bundle", "type": "bundle", "rarity": "legendary"},
        {"id": "cyber_warrior", "name": "Cyber Warrior Bundle", "type": "bundle", "rarity": "epic"}
    ]
})

# Helper Functions
def load_json(filepath):
    """Load JSON data from file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

def save_json(filepath, data):
    """Save JSON data to file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def generate_token(uid):
    """Generate authentication token"""
    return hashlib.sha256(f"{uid}{secrets.token_hex(16)}".encode()).hexdigest()

# API Routes

@app.route('/')
def index():
    """Serve main page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('.', path)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/account/import', methods=['POST'])
def import_account():
    """Import guest account from .dat file"""
    try:
        data = request.json
        
        if not data or 'guest_account_info' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        guest_info = data['guest_account_info']
        uid = guest_info.get('com.garena.msdk.guest_uid')
        password = guest_info.get('com.garena.msdk.guest_password')
        
        if not uid or not password:
            return jsonify({'error': 'Missing UID or password'}), 400
        
        # Generate account data
        account = {
            'uid': uid,
            'password': password,
            'nickname': f"Player_{uid[-4:]}",
            'token': generate_token(uid),
            'created_at': datetime.now().isoformat(),
            'source': 'guest'
        }
        
        # Save account
        accounts = load_json(ACCOUNTS_FILE)
        accounts = [acc for acc in accounts if acc['uid'] != uid]  # Remove duplicate
        accounts.append(account)
        save_json(ACCOUNTS_FILE, accounts)
        
        return jsonify({
            'success': True,
            'account': account,
            'message': 'Account imported successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/account/manual', methods=['POST'])
def manual_account():
    """Create manual account"""
    try:
        data = request.json
        
        uid = data.get('uid')
        password = data.get('password')
        nickname = data.get('nickname', f"Player_{uid[-4:] if uid else '0000'}")
        server = data.get('server', 'vn')
        
        if not uid or not password:
            return jsonify({'error': 'Missing UID or password'}), 400
        
        account = {
            'uid': uid,
            'password': password,
            'nickname': nickname,
            'server': server,
            'token': generate_token(uid),
            'created_at': datetime.now().isoformat(),
            'source': 'manual'
        }
        
        # Save account
        accounts = load_json(ACCOUNTS_FILE)
        accounts = [acc for acc in accounts if acc['uid'] != uid]
        accounts.append(account)
        save_json(ACCOUNTS_FILE, accounts)
        
        return jsonify({
            'success': True,
            'account': account,
            'message': 'Account created successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/wishlist', methods=['GET'])
def get_wishlist():
    """Get wishlist for a specific account"""
    uid = request.args.get('uid')
    
    if not uid:
        return jsonify({'error': 'UID is required'}), 400
    
    wishlists = load_json(WISHLIST_FILE)
    user_wishlist = [w for w in wishlists if w.get('uid') == uid]
    
    return jsonify({
        'success': True,
        'wishlist': user_wishlist,
        'count': len(user_wishlist)
    })

@app.route('/api/wishlist/add', methods=['POST'])
def add_to_wishlist():
    """Add item to wishlist"""
    try:
        data = request.json
        
        uid = data.get('uid')
        item_id = data.get('item_id')
        item_name = data.get('item_name', f'Item {item_id}')
        item_type = data.get('item_type', 'unknown')
        item_rarity = data.get('item_rarity', 'common')
        
        if not uid or not item_id:
            return jsonify({'error': 'UID and item_id are required'}), 400
        
        # Load items database
        items_db = load_json(ITEMS_FILE)
        
        # Find item in database
        item_data = None
        for category in items_db.values():
            for item in category:
                if item['id'] == item_id:
                    item_data = item
                    break
        
        wishlist_item = {
            'id': secrets.token_hex(8),
            'uid': uid,
            'item_id': item_id,
            'item_name': item_data['name'] if item_data else item_name,
            'item_type': item_data['type'] if item_data else item_type,
            'item_rarity': item_data['rarity'] if item_data else item_rarity,
            'added_at': datetime.now().isoformat()
        }
        
        # Save to wishlist
        wishlists = load_json(WISHLIST_FILE)
        
        # Check if already exists
        existing = [w for w in wishlists if w['uid'] == uid and w['item_id'] == item_id]
        if existing:
            return jsonify({'error': 'Item already in wishlist'}), 409
        
        wishlists.append(wishlist_item)
        save_json(WISHLIST_FILE, wishlists)
        
        return jsonify({
            'success': True,
            'item': wishlist_item,
            'message': 'Item added to wishlist'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/wishlist/remove', methods=['DELETE'])
def remove_from_wishlist():
    """Remove item from wishlist"""
    try:
        data = request.json
        
        uid = data.get('uid')
        item_id = data.get('item_id')
        
        if not uid:
            return jsonify({'error': 'UID is required'}), 400
        
        wishlists = load_json(WISHLIST_FILE)
        
        if item_id:
            # Remove specific item
            wishlists = [w for w in wishlists if not (w['uid'] == uid and w['item_id'] == item_id)]
        else:
            # Remove all items for user
            wishlists = [w for w in wishlists if w['uid'] != uid]
        
        save_json(WISHLIST_FILE, wishlists)
        
        return jsonify({
            'success': True,
            'message': 'Item(s) removed successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items', methods=['GET'])
def get_items():
    """Get all items database"""
    items_db = load_json(ITEMS_FILE)
    
    # Flatten items
    all_items = []
    for category, items in items_db.items():
        for item in items:
            item['category'] = category
            all_items.append(item)
    
    return jsonify({
        'success': True,
        'items': all_items,
        'count': len(all_items)
    })

@app.route('/api/items/<item_id>', methods=['GET'])
def get_item(item_id):
    """Get specific item details"""
    items_db = load_json(ITEMS_FILE)
    
    for category, items in items_db.items():
        for item in items:
            if item['id'] == item_id:
                item['category'] = category
                return jsonify({
                    'success': True,
                    'item': item
                })
    
    return jsonify({'error': 'Item not found'}), 404

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get activity history"""
    uid = request.args.get('uid')
    
    # Load history from accounts and wishlists
    accounts = load_json(ACCOUNTS_FILE)
    wishlists = load_json(WISHLIST_FILE)
    
    history = []
    
    # Add account activities
    for acc in accounts:
        if uid and acc['uid'] != uid:
            continue
        history.append({
            'type': 'account',
            'action': f"Account {acc['source']} login: {acc['nickname']}",
            'timestamp': acc['created_at'],
            'uid': acc['uid']
        })
    
    # Add wishlist activities
    for item in wishlists:
        if uid and item['uid'] != uid:
            continue
        history.append({
            'type': 'wishlist',
            'action': f"Added {item['item_name']} to wishlist",
            'timestamp': item['added_at'],
            'uid': item['uid']
        })
    
    # Sort by timestamp
    history.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return jsonify({
        'success': True,
        'history': history[:50]  # Limit to 50 items
    })

@app.route('/api/sync', methods=['POST'])
def sync_data():
    """Sync data between client and server"""
    try:
        data = request.json
        
        uid = data.get('uid')
        client_data = data.get('data', {})
        
        if not uid:
            return jsonify({'error': 'UID is required'}), 400
        
        # Save client data
        if 'wishlist' in client_data:
            wishlists = load_json(WISHLIST_FILE)
            # Remove old data for this user
            wishlists = [w for w in wishlists if w['uid'] != uid]
            # Add new data
            for item in client_data['wishlist']:
                wishlists.append({
                    'uid': uid,
                    **item
                })
            save_json(WISHLIST_FILE, wishlists)
        
        return jsonify({
            'success': True,
            'message': 'Data synced successfully',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error Handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
