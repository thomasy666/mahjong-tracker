import json
import sys
sys.path.insert(0, '.')
from app.database import SessionLocal, engine, Base
from app import models

def migrate():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    with open('../mahjong_data.json', 'r') as f:
        data = json.load(f)

    # Create players
    player_map = {}
    for i, (name, score) in enumerate(data.get('players', {}).items()):
        color = data.get('player_colors', {}).get(name, '#808080')
        avatar = data.get('player_avatars', {}).get(name)
        player = models.Player(name=name, color=color, avatar_path=avatar)
        db.add(player)
        db.flush()
        player_map[name] = player.id

    # Create rounds
    for round_data in data.get('ledger', []):
        recorder_name = round_data.get('recorder')
        recorder_id = player_map.get(recorder_name) if recorder_name else None
        round_obj = models.Round(recorder_id=recorder_id, recorder_ip=round_data.get('ip'))
        db.add(round_obj)
        db.flush()
        for player_name, delta in round_data.get('deltas', {}).items():
            if player_name in player_map:
                score = models.RoundScore(round_id=round_obj.id, player_id=player_map[player_name], delta=delta)
                db.add(score)

    # Save admin code
    admin_code = data.get('admin_code', '8888')
    db.add(models.Setting(key='admin_code', value=admin_code))

    db.commit()
    print(f"Migrated {len(player_map)} players and {len(data.get('ledger', []))} rounds")
    db.close()

if __name__ == '__main__':
    migrate()
