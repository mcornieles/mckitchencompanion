import csv
import os

# Ruta del CSV y carpeta de salida
CSV_PATH = '../data/recipes.csv'
OUTPUT_DIR = '../recetas'

# Diccionario para convertir código de tamaño a texto
SIZE_MAP = {
    'A': '2 lb',
    'B': '1.5 lb',
    'C': '1 lb',
    'D': 'Standard'
}

# Asegúrate que el directorio de salida exista
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Leer el CSV y organizar los datos por RecipeID
recipes = {}

with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        recipe_id = row['RecipeID']
        if recipe_id not in recipes:
            recipes[recipe_id] = {
                'group': row['Group'],
                'name': row['Name'],
                'size': SIZE_MAP.get(row['SizeCode'], row['SizeCode']),
                'instructions': row.get('Instructions', '').strip(),
                'ingredients': []
            }
        recipes[recipe_id]['ingredients'].append({
            'ingredient': row['Ingredient'],
            'detail': row['Detail'],
            'amount': row['Amount'],
            'unit': row['Unit'],
            'grams': row['Grams']
        })

# Función para generar HTML
def generate_html(recipe_id, recipe):
    title = f"{recipe['name']} – {recipe['size']}"
    instructions = recipe['instructions'].replace('\n', '<br>') if recipe['instructions'] else ''

    instruction_block = f"""
    <button id="toggleInstructions">Show/Hide Instructions</button>
    <div id="instructionBox" style="display: none; margin-top: 1rem;">
        <p>{instructions}</p>
    </div>""" if instructions else ""

    rows = ""
    for ing in recipe['ingredients']:
        rows += f"""
        <tr>
            <td>{ing['ingredient']}</td>
            <td>{ing['detail']}</td>
            <td>{ing['amount']}</td>
            <td>{ing['unit']}</td>
            <td>{ing['grams']}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <div class="container">
        <h1>{title}</h1>
        <div class="card">
            <table>
                <thead>
                    <tr>
                        <th>Ingredient</th>
                        <th>Detail</th>
                        <th>Amount</th>
                        <th>Unit</th>
                        <th>Grams</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            {instruction_block}
        </div>
    </div>
    <script>
        const toggleBtn = document.getElementById('toggleInstructions');
        const instructionBox = document.getElementById('instructionBox');
        if (toggleBtn && instructionBox) {{
            toggleBtn.addEventListener('click', () => {{
                instructionBox.style.display = instructionBox.style.display === 'none' ? 'block' : 'none';
            }});
        }}
    </script>
</body>
</html>"""
    return html

# Crear archivos HTML individuales
for recipe_id, recipe in recipes.items():
    group_folder = os.path.join(OUTPUT_DIR, recipe['group'].replace(" ", ""))
    os.makedirs(group_folder, exist_ok=True)

    filename = f"{recipe_id}.html"
    filepath = os.path.join(group_folder, filename)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(generate_html(recipe_id, recipe))

print("✅ Recipe pages generated successfully.")
