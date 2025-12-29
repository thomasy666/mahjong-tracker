import json
import os

COLORS = [
    '#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', 
    '#911EB4', '#46F0F0', '#F032E6', '#BCF60C', '#FABEBE', 
    '#008080', '#E6BEFF', '#9A6324', '#FFFAC8', '#800000', 
    '#AAFFC3', '#808000', '#FFD8B1', '#000075', '#808080'
]

class MahjongTracker:
    def __init__(self, default_start_points=0, data_file='mahjong_data.json'):
        self.players = {}  # {name: current_score}
        self.player_colors = {} # {name: hex_color}
        self.player_avatars = {} # {name: filename}
        self.ledger = []   # List of round dicts
        self.default_start_points = default_start_points
        self.next_round_id = 1
        self.data_file = data_file
        self.admin_code = '8888'
        
        # Load data if exists
        self.load_data()

    def load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.players = data.get('players', {})
                    self.player_colors = data.get('player_colors', {})
                    self.player_avatars = data.get('player_avatars', {})
                    self.ledger = data.get('ledger', [])
                    self.next_round_id = data.get('next_round_id', 1)
                    self.admin_code = data.get('admin_code', '8888')
                    
                    # Backfill colors for existing players if missing
                    for i, name in enumerate(self.players):
                        if name not in self.player_colors:
                            self.player_colors[name] = COLORS[i % len(COLORS)]
            except Exception as e:
                print(f"Error loading data: {e}")

    def save_data(self):
        data = {
            'players': self.players,
            'player_colors': self.player_colors,
            'player_avatars': self.player_avatars,
            'ledger': self.ledger,
            'next_round_id': self.next_round_id,
            'admin_code': self.admin_code
        }
        try:
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"Error saving data: {e}")

    def verify_admin_code(self, code):
        return code == self.admin_code

    def set_admin_code(self, old_code, new_code):
        if not self.verify_admin_code(old_code):
            raise ValueError('flash_invalid_admin', {})
        self.admin_code = new_code
        self.save_data()

    def add_player(self, name, start_points=None):
        if name in self.players:
            raise ValueError('err_player_exists', {'name': name})
        
        points = start_points if start_points is not None else self.default_start_points
        self.players[name] = points
        
        # Assign color
        color_index = len(self.players) - 1
        self.player_colors[name] = COLORS[color_index % len(COLORS)]
        
        self.save_data()

    def set_player_color(self, name, color):
        if name not in self.players:
            raise ValueError('err_player_not_found', {'name': name})
        
        self.player_colors[name] = color
        self.save_data()

    def set_player_avatar(self, name, filename):
        if name not in self.players:
            raise ValueError('err_player_not_found', {'name': name})
        self.player_avatars[name] = filename
        self.save_data()

    def remove_player(self, name):
        if name in self.players:
            del self.players[name]
            if name in self.player_colors:
                del self.player_colors[name]
            if name in self.player_avatars:
                del self.player_avatars[name]
            self.save_data()
        # Note: We do not remove them from historical ledger entries to preserve history integrity.

    def is_player_locked(self, name):
        """A player is locked if they have any recorded scores or have recorded a round."""
        for round_data in self.ledger:
            if name in round_data['deltas'] or round_data.get('recorder') == name:
                return True
        return False

    def rename_player(self, old_name, new_name):
        if old_name not in self.players:
            raise ValueError('err_player_not_found', {'name': old_name})
        if new_name in self.players:
            raise ValueError('err_player_exists', {'name': new_name})
        
        # Update players dict
        self.players[new_name] = self.players.pop(old_name)
        
        # Update colors
        if old_name in self.player_colors:
            self.player_colors[new_name] = self.player_colors.pop(old_name)

        # Update avatars
        if old_name in self.player_avatars:
            self.player_avatars[new_name] = self.player_avatars.pop(old_name)
        
        # Update ledger history
        for round_data in self.ledger:
            if old_name in round_data['deltas']:
                round_data['deltas'][new_name] = round_data['deltas'].pop(old_name)
            if round_data.get('recorder') == old_name:
                round_data['recorder'] = new_name
        
        self.save_data()

    def add_round(self, deltas, recorder_name='Unknown', ip_address=None):
        """
        deltas: Dictionary mapping player names to score changes.
        e.g., {'Alice': 3000, 'Bob': -1000, 'Charlie': -2000}
        """
        # 1. Validate Zero-Sum
        total_delta = sum(deltas.values())
        if total_delta != 0:
            raise ValueError('err_sum_zero', {'total_delta': total_delta})

        # 2. Validate Players exist
        for player in deltas:
            if player not in self.players:
                raise ValueError('err_player_not_in_game', {'name': player})

        # 3. Record Transaction
        round_data = {
            "id": self.next_round_id,
            "deltas": deltas.copy(),
            "recorder": recorder_name,
            "ip": ip_address
        }
        self.ledger.append(round_data)
        self.next_round_id += 1

        # 4. Update Cached Scores
        for player, change in deltas.items():
            self.players[player] += change
        
        self.save_data()

    def undo_last_round(self):
        if not self.ledger:
            return False
        
        last_round = self.ledger.pop()
        deltas = last_round['deltas']
        
        # Reverse the score changes
        for player, change in deltas.items():
            if player in self.players:
                self.players[player] -= change
            # If player was removed since the round, we can't refund them, 
            # but that's an edge case we accept for now.
            
        self.next_round_id -= 1
        self.save_data()
        return True

    def get_standings(self):
        # Sort by score descending
        # Returns: [(name, score, color), ...]
        sorted_items = sorted(self.players.items(), key=lambda item: item[1], reverse=True)
        return [(name, score, self.player_colors.get(name, '#FFFFFF')) for name, score in sorted_items]

    def get_ledger(self):
        return sorted(self.ledger, key=lambda x: x['id'], reverse=True)

    def reset_game(self):
        """Resets scores to default but keeps players"""
        self.ledger = []
        self.next_round_id = 1
        for name in self.players:
            self.players[name] = self.default_start_points
        self.save_data()

    def get_statistics(self):
        stats = {}
        # Initialize for all known players
        all_players = set(self.players.keys())
        for round_data in self.ledger:
            all_players.update(round_data['deltas'].keys())
            
        for name in all_players:
            stats[name] = {
                'rounds': 0,
                'wins': 0,
                'total_delta': 0,
                'best': -float('inf'),
                'worst': float('inf')
            }
            
        for round_data in self.ledger:
            for name, delta in round_data['deltas'].items():
                if name not in stats: continue
                
                s = stats[name]
                s['rounds'] += 1
                s['total_delta'] += delta
                if delta > 0:
                    s['wins'] += 1
                if delta > s['best']:
                    s['best'] = delta
                if delta < s['worst']:
                    s['worst'] = delta
                    
        # Calculate derived stats
        final_stats = []
        for name, s in stats.items():
            if s['rounds'] == 0:
                continue
            
            win_rate = (s['wins'] / s['rounds']) * 100
            avg = s['total_delta'] / s['rounds']
            
            final_stats.append({
                'name': name,
                'rounds': s['rounds'],
                'win_rate': round(win_rate, 1),
                'avg': round(avg, 1),
                'best': s['best'],
                'worst': s['worst'],
                'color': self.player_colors.get(name, '#FFFFFF')
            })
            
        # Sort by Win Rate descending
        final_stats.sort(key=lambda x: x['win_rate'], reverse=True)
        return final_stats