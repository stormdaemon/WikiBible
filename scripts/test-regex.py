import re
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Lignes du PDF
test_lines = [
    'Genèse 3, 17 A l\'homme, il dit: "Parce que tu as écouté la voix de ta femme et que tu as mangé de',
    'Genèse 3, 18 Il produira pour toi épines et chardons et tu mangeras l\'herbe des champs.',
    'Lévitique 5, 19 C\'est un sacrifice de réparation, cet homme était certainement responsable envers',
    'Jean 3, 16 Car Dieu a tant aimé le monde qu\'il a donné son Fils, l\'unique',
]

# Pattern corrigé - plus simple: capture tout jusqu'au premier chiffre
pattern = r'^([\w\s\'\-]+?)\s+(\d+),\s+(\d+)\s+(.+)$'

for line in test_lines:
    match = re.match(pattern, line)
    if match:
        print(f"OK MATCH: {line[:60]}")
        print(f"  Livre: {match.group(1)}")
        print(f"  Chapitre: {match.group(2)}")
        print(f"  Verset: {match.group(3)}")
        print(f"  Texte: {match.group(4)[:50]}...")
    else:
        print(f"NO MATCH: {line[:60]}")
