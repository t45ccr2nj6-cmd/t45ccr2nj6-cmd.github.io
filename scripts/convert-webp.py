#!/usr/bin/env python3
"""
批量生成 WebP 图片资源。
- 原始图片保留不动。
- Photos 目录生成两套：photos-thumbs (540px) + photos-hd (1600px)
- 其他目录在同目录生成 .webp 版本

质量参数：
- 照片/内容图：quality=85
- 音乐封面：quality=88
- 图标/头像：quality=90（更锐利）
"""

import os
import sys
import io
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')

# -------- 工具函数 --------

def convert_to_webp(src_path, dst_path, max_width, quality=85):
    """打开图片，按 max_width 等比缩放，存为 WebP。跳过小于 max_width 的图。"""
    with Image.open(src_path) as img:
        # 自动处理 EXIF 方向
        try:
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        w, h = img.size
        if w > max_width:
            ratio = max_width / w
            new_h = round(h * ratio)
            img = img.resize((max_width, new_h), Image.LANCZOS)

        os.makedirs(os.path.dirname(dst_path), exist_ok=True)

        # WebP 保存
        if img.mode in ('RGBA', 'LA', 'P'):
            # 保留 alpha
            if img.mode == 'P':
                img = img.convert('RGBA')
            img.save(dst_path, 'WEBP', quality=quality, method=6)
        else:
            img = img.convert('RGB')
            img.save(dst_path, 'WEBP', quality=quality, method=6)

    orig_kb = os.path.getsize(src_path) / 1024
    new_kb = os.path.getsize(dst_path) / 1024
    saved = orig_kb - new_kb
    pct = (saved / orig_kb * 100) if orig_kb > 0 else 0
    return orig_kb, new_kb, pct


def process_dir(src_dir, dst_dir, max_width, quality=85, recursive=True):
    """扫描目录中所有 jpg/jpeg/png，生成 webp。"""
    results = []
    if not os.path.isdir(src_dir):
        return results

    iterator = os.walk(src_dir) if recursive else [(src_dir, [], os.listdir(src_dir))]

    for root, dirs, files in iterator:
        for f in sorted(files):
            ext = os.path.splitext(f)[1].lower()
            if ext not in ('.jpg', '.jpeg', '.png'):
                continue
            src_path = os.path.join(root, f)
            # 计算目标路径：保持相对目录结构
            rel = os.path.relpath(src_path, src_dir)
            webp_rel = os.path.splitext(rel)[0] + '.webp'
            dst_path = os.path.join(dst_dir, webp_rel)

            # 跳过已存在的
            if os.path.exists(dst_path) and os.path.getmtime(dst_path) > os.path.getmtime(src_path):
                continue

            try:
                orig, new, pct = convert_to_webp(src_path, dst_path, max_width, quality)
                results.append((rel, orig, new, pct))
            except Exception as e:
                print(f"  ✗ FAIL  {rel}: {e}")

    return results


# -------- 主流程 --------

def main():
    total_orig = 0
    total_new = 0

    # 1) Photos: 两套并行目录
    print("=" * 60)
    print("[1] Photos → 两套并行资源")
    print("=" * 60)
    photos_src = os.path.join(PUBLIC, 'photos')
    thumbs_dst = os.path.join(PUBLIC, 'photos-thumbs')
    hd_dst = os.path.join(PUBLIC, 'photos-hd')

    # 缩略图 540px
    print("\n→ photos-thumbs (540px, q=85)")
    r = process_dir(photos_src, thumbs_dst, 540, quality=85)
    for rel, orig, new, pct in r[:5]:
        print(f"  ✓ {rel[:55]:55s} {orig:6.0f}KB → {new:6.0f}KB  ({pct:.0f}%)")
    if len(r) > 5:
        print(f"  ... 共 {len(r)} 张")
    for _, orig, new, _ in r:
        total_orig += orig
        total_new += new

    # 高清 1600px
    print("\n→ photos-hd (1600px, q=85)")
    r = process_dir(photos_src, hd_dst, 1600, quality=85)
    for rel, orig, new, pct in r[:5]:
        print(f"  ✓ {rel[:55]:55s} {orig:6.0f}KB → {new:6.0f}KB  ({pct:.0f}%)")
    if len(r) > 5:
        print(f"  ... 共 {len(r)} 张")
    for _, orig, new, _ in r:
        total_orig += orig
        total_new += new

    # 2) Red feed (760px, q=85) 和 Red me (532px, q=85)
    print("\n" + "=" * 60)
    print("[2] Red (小红书)")
    print("=" * 60)
    for folder, mw, q in [('red-feed', 760, 85), ('red-me', 532, 85)]:
        src = os.path.join(PUBLIC, folder)
        if os.path.isdir(src):
            print(f"\n→ {folder} ({mw}px, q={q})")
            r = process_dir(src, src, mw, quality=q, recursive=False)
            for rel, orig, new, pct in r:
                print(f"  ✓ {rel:20s} {orig:7.0f}KB → {new:6.0f}KB  ({pct:.0f}%)")
            for _, orig, new, _ in r:
                total_orig += orig
                total_new += new

    # 3) WeChat（头像160px, 贴纸600px, 图片690px）
    print("\n" + "=" * 60)
    print("[3] WeChat")
    print("=" * 60)
    wx_dir = os.path.join(PUBLIC, 'wechat')
    if os.path.isdir(wx_dir):
        for f in sorted(os.listdir(wx_dir)):
            ext = os.path.splitext(f)[1].lower()
            if ext not in ('.jpg', '.jpeg', '.png'):
                continue
            name = f.lower()
            src_path = os.path.join(wx_dir, f)
            dst_name = os.path.splitext(f)[0] + '.webp'
            dst_path = os.path.join(wx_dir, dst_name)

            # 根据文件名判断类型
            if 'avatar' in name or name.startswith('m-') or name == 'me.jpg':
                mw, q = 160, 90
            elif 'sticker' in name:
                mw, q = 600, 85
            elif 'photo' in name:
                mw, q = 690, 85
            elif 'file' in name:
                mw, q = 690, 85  # file-1.png
            else:
                mw, q = 690, 85

            if os.path.exists(dst_path) and os.path.getmtime(dst_path) > os.path.getmtime(src_path):
                continue

            try:
                orig, new, pct = convert_to_webp(src_path, dst_path, mw, quality=q)
                print(f"  ✓ {f:30s} {mw:4d}px q={q}  {orig:6.0f}KB → {new:5.0f}KB  ({pct:.0f}%)")
                total_orig += orig
                total_new += new
            except Exception as e:
                print(f"  ✗ FAIL  {f}: {e}")

    # 4) Music covers (600px, q=88)
    print("\n" + "=" * 60)
    print("[4] Music covers")
    print("=" * 60)
    music_dir = os.path.join(PUBLIC, 'music', 'covers')
    if os.path.isdir(music_dir):
        print(f"\n→ music/covers (600px, q=88)")
        r = process_dir(music_dir, music_dir, 600, quality=88, recursive=False)
        for rel, orig, new, pct in r:
            print(f"  ✓ {rel:20s} {orig:7.0f}KB → {new:6.0f}KB  ({pct:.0f}%)")
        for _, orig, new, _ in r:
            total_orig += orig
            total_new += new

    # 5) Wallpapers + 其他独立图片
    print("\n" + "=" * 60)
    print("[5] Wallpapers & misc")
    print("=" * 60)

    misc_files = [
        ('wallpapers/lock.jpg', None, 85, 'wallpaper'),
        ('red-bg.jpg', None, 85, 'red-bg'),
        ('red-splash.jpg', None, 85, 'red-splash'),
        ('red-empty.png', None, 85, 'red-empty'),
        ('red-avatar.png', 256, 90, 'red-avatar'),
    ]

    for rel_path, mw, q, tag in misc_files:
        src_path = os.path.join(PUBLIC, rel_path)
        if not os.path.exists(src_path):
            print(f"  - SKIP  {rel_path} (not found)")
            continue
        dst_path = os.path.splitext(src_path)[0] + '.webp'

        if os.path.exists(dst_path) and os.path.getmtime(dst_path) > os.path.getmtime(src_path):
            continue

        try:
            orig, new, pct = convert_to_webp(
                src_path, dst_path,
                mw if mw else 9999,  # no resize for wallpaper/bg
                quality=q
            )
            mw_str = f"{mw}px" if mw else "orig"
            print(f"  ✓ {rel_path:30s} {mw_str:>6s} q={q}  {orig:6.0f}KB → {new:5.0f}KB  ({pct:.0f}%)")
            total_orig += orig
            total_new += new
        except Exception as e:
            print(f"  ✗ FAIL  {rel_path}: {e}")

    # -------- 汇总 --------
    print("\n" + "=" * 60)
    print("汇 总")
    print("=" * 60)
    print(f"  原始图片总量: {total_orig/1024:.1f} MB")
    print(f"  WebP 总量:   {total_new/1024:.1f} MB")
    if total_orig > 0:
        print(f"  节省:         {(total_orig - total_new)/1024:.1f} MB ({(1-total_new/total_orig)*100:.1f}%)")

    # 统计 photos-thumbs / photos-hd 目录大小
    for dname in ['photos-thumbs', 'photos-hd']:
        dpath = os.path.join(PUBLIC, dname)
        if os.path.isdir(dpath):
            size = sum(os.path.getsize(os.path.join(dp, f))
                       for dp, dn, fns in os.walk(dpath) for f in fns)
            count = sum(len(fns) for dp, dn, fns in os.walk(dpath))
            print(f"  {dname}/: {count} 张, {size/1024/1024:.1f} MB")


if __name__ == '__main__':
    main()
