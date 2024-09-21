import os
import re
import json

def get_unique_colors(svg_file):
    # Load the SVG file using xmltodict
    with open(svg_file, 'r') as f:
        text = f.read()
    
    hex_color_regex = r'#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})'
    colors = set()
    for match in re.finditer(hex_color_regex, text):
        color_value = match.group(1)
        if len(color_value) == 3:
            # Convert shorthand hex code (e.g. #F00) to full hex code (e.g. #FF0000)
            color_value = ''.join([color_value[i:i+2] for i in range(0, 6, 2)])
        colors.add('#' + color_value)
    return list(colors)

def process_svg_folder(folder_path, output_file):
    svg_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith('.svg')]
    results = {}

    for file in svg_files:
        print(f"Processing {file}...")
        colors = get_unique_colors(file)
        results[os.path.basename(file)] = colors

    with open(output_file, 'w') as f:
        json.dump(results, f, indent=4)

# Example usage:
input_folder = 'data'
output_file = 'colors.json'
process_svg_folder(input_folder, output_file)
print(f"Color extraction complete. Results written to {output_file}")