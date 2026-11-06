#!/usr/bin/env python3
"""
批量替换 src/ 下所有 .ts/.tsx/.css 文件中的图片扩展名。
把 .jpg / .jpeg / .png → .webp（排除 /icons/ 目录，排除 mp4）
"""

import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')

# 要扫描的文件
exts = ('.ts', '.tsx', '.css')
files = []
for root, dirs, fnames in os.walk(SRC):
    for f in fnames:
        if f.endswith(exts):
            files.append(os.path.join(root, f))

changed_count = 0

for fpath in sorted(files):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 匹配 '/xxx.yyy.zzz.jpg' 或 '/xxx.png' 等格式的字符串路径
    # 但排除 /icons/ 目录和 .mp4
    def replacer(m):
        full_match = m.group(0)
        # 跳过 icons 目录
        if '/icons/' in full_match:
            return full_match
        # 跳过 mp4
        if full_match.endswith('.mp4'):
            return full_match
        # 替换扩展名
        new = re.sub(r'\.(jpg|jpeg|png)$', '.webp', full_match, flags=re.IGNORECASE)
        return new

    # 匹配引号内的路径：'/xxx/yyy.jpg' 或 "/xxx/yyy.jpg"
    content = re.sub(
        r"""(?<=['"])(/[^'"]+?\.(jpg|jpeg|png|mp4))(?=['"])""",
        lambda m: replacer(m),
        content,
        flags=re.IGNORECASE
    )

    if content != original:
        rel = os.path.relpath(fpath, ROOT)
        changes = sum(1 for a, b in zip(original.split('\n'), content.split('\n')) if a != b)
        print(f"  ✓ {rel} ({changes} lines changed)")
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        changed_count += 1

print(f"\nDone. {changed_count} files updated.")
