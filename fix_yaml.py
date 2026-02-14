import os
import re

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    if not lines or not lines[0].startswith('---'):
        return

    new_lines = []
    seen_keys = set()
    in_frontmatter = False
    frontmatter_count = 0
    
    for line in lines:
        if line.strip() == '---':
            frontmatter_count += 1
            in_frontmatter = (frontmatter_count == 1)
            new_lines.append(line)
            continue
            
        if in_frontmatter:
            match = re.match(r'^([a-zA-Z0-9_-]+):', line)
            if match:
                key = match.group(1)
                if key in seen_keys:
                    continue # 跳过重复键
                seen_keys.add(key)
        new_lines.append(line)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

# 遍历所有内容文件
for root, dirs, files in os.walk('src/content'):
    for file in files:
        if file.endswith('.md'):
            fix_file(os.path.join(root, file))
