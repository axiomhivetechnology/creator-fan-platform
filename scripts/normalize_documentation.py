from pathlib import Path

ROOT = Path('/home/ubuntu/creator-fan-platform/docs')
DISCLOSURE = (
    '> **Creator and support disclosure:** The creator of this project is **Kaden McCullen**. '
    'Kaden independently conceived the product, direction, and requirements. To support Kaden, '
    'artificial intelligence provided Kaden research and code to support their project; it did not '
    'independently originate the project or make the product decisions.\n\n'
)

for path in sorted(ROOT.rglob('*.md')):
    text = path.read_text()
    text = text.replace('**Author:** Manus AI  \n', '**Project creator:** Kaden McCullen  \n')
    text = text.replace('**Prepared by:** Manus AI  \n', '**Project creator:** Kaden McCullen  \n')
    if '**Creator and support disclosure:**' not in text:
        lines = text.splitlines(keepends=True)
        insert_at = 1 if lines and lines[0].startswith('# ') else 0
        if insert_at == 1:
            while insert_at < len(lines) and lines[insert_at].strip() == '':
                insert_at += 1
        lines.insert(insert_at, '\n' + DISCLOSURE)
        text = ''.join(lines)
    path.write_text(text)
