from pathlib import Path

ROOT = Path('/home/ubuntu/creator-fan-platform')
OLD = ('Kaden independently conceived the product, direction, and requirements. To support Kaden, '
       'artificial intelligence provided Kaden research and code to support their project; it did not '
       'independently originate the project or make the product decisions.')
NEW = ('Kaden independently came up with the project, its direction, and its requirements. To support Kaden, '
       'artificial intelligence provided Kaden research and code to support their project; it did not '
       'independently originate the project or make the product decisions.')

for path in sorted([*ROOT.glob('README.md'), ROOT / 'todo.md', * (ROOT / 'docs').rglob('*.md')]):
    text = path.read_text()
    if OLD in text:
        path.write_text(text.replace(OLD, NEW))
