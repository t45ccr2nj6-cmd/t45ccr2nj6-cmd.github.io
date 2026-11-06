#!/usr/bin/env python3
"""
处理 photos.ts：把每个图片 src 扩展为 thumbSrc + fullSrc。
- isVideo 不变（仍指向原始 .mp4）
- 图片: /photos/xxx.jpg → /photos-thumbs/xxx.webp + /photos-hd/xxx.webp
"""

import re

filepath = 'src/data/photos.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修改 PhotoItem 接口：src → fullSrc + thumbSrc
old_interface = """export interface PhotoItem {
  id: string
  /** 拍摄日期 YYYY-MM-DD */
  date: string
  /** 显示在查看器信息栏的地点 */
  place: string
  /** 来源分组：saved 无地点 / fuzzy 仅城市 / full 完整地点 */
  group: PhotoGroup
  /** 静态资源路径（public/photos/...） */
  src: string
  /** 是否为视频 */
  isVideo: boolean
  /** 设为 true 后相册里不可点开 */
  locked?: boolean
}"""

new_interface = """export interface PhotoItem {
  id: string
  /** 拍摄日期 YYYY-MM-DD */
  date: string
  /** 显示在查看器信息栏的地点 */
  place: string
  /** 来源分组：saved 无地点 / fuzzy 仅城市 / full 完整地点 */
  group: PhotoGroup
  /** 全屏查看高清图路径（public/photos-hd/...webp） */
  fullSrc: string
  /** 网格缩略图路径（public/photos-thumbs/...webp） */
  thumbSrc: string
  /** 是否为视频 */
  isVideo: boolean
  /** 设为 true 后相册里不可点开 */
  locked?: boolean
}"""

content = content.replace(old_interface, new_interface)

# 2. 把每条 PHOTOS 数据的 src: '...' 转为 fullSrc + thumbSrc
# 匹配模式：src: '/photos/...'  (图片) 或 src: '/photos/....mp4' (视频)
def transform_src(match):
    full = match.group(1)
    # 视频不变
    if full.endswith('.mp4'):
        return f"fullSrc: '{full}', thumbSrc: '{full}'"
    # 图片：/photos/ → /photos-hd/ 和 /photos-thumbs/，扩展名 → .webp
    hd = full.replace('/photos/', '/photos-hd/')
    hd = re.sub(r'\.(jpg|jpeg|png)$', '.webp', hd, flags=re.IGNORECASE)
    th = full.replace('/photos/', '/photos-thumbs/')
    th = re.sub(r'\.(jpg|jpeg|png)$', '.webp', th, flags=re.IGNORECASE)
    return f"fullSrc: '{hd}', thumbSrc: '{th}'"

content = re.sub(
    r"src: '(/photos/[^']+)', isVideo:",
    lambda m: transform_src(m) + ", isVideo:",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. photos.ts updated.")

# 验证
with open(filepath, 'r', encoding='utf-8') as f:
    data = f.read()

import re
img_count = len(re.findall(r"thumbSrc: '", data))
video_count = len(re.findall(r"fullSrc: '/photos/", data)) - img_count  # 近似
print(f"  图片条目: {img_count}")
print(f"  示例 (前3):")
for line in data.split('\n'):
    if 'thumbSrc:' in line and "'" in line:
        print(f"    {line.strip()}")
        img_count -= 1
        if img_count < 152:  # 只看前3条已打印完
            break
