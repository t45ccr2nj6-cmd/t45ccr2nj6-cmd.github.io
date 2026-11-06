type DisplacementOptions = {
  height: number;
  width: number;
  radius: number;
  depth: number;
  strength?: number;
  chromaticAberration?: number;
};

type TextDisplacementOptions = {
  text: string;
  font: string;
  width: number;
  height: number;
  x: number;
  y: number;
  depth: number;
};

/**
 * 路线 B：按字形轮廓生成「内斜面」位移图 + 斜面光影贴图（真·玻璃字）
 *
 * 逐像素计算字形的距离场（模糊 alpha）与梯度（外法线），一次遍历输出两张贴图：
 *  1. disp  —— 位移图：笔画边缘位移最大、向字心渐弱为 0，方向沿外法线
 *              （凸面玻璃斜边把字外壁纸"吸"进笔画边缘的折射效果）
 *  2. bevel —— 斜面光影：朝光源（左上）的笔画边缘提亮、背光（右下）边缘压暗，
 *              最外缘叠一条锐利镜面高光 → 玻璃体积感的核心来源
 * 均返回 data URL，可作为 feImage / <image> 使用
 */
export const getTextGlassMaps = ({
  text,
  font,
  width,
  height,
  x,
  y,
  depth,
}: TextDisplacementOptions): { disp: string; bevel: string } => {
  const empty = { disp: "", bevel: "" };
  if (typeof document === "undefined") return empty;

  // ① 离屏 canvas 画字形 alpha mask（白字黑底）
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const mctx = mask.getContext("2d");
  if (!mctx) return empty;
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, width, height);
  mctx.font = font;
  mctx.textAlign = "center";
  mctx.textBaseline = "middle";
  mctx.fillStyle = "#fff";
  mctx.fillText(text, x, y);

  // ② 高斯模糊 → 近似距离场：边缘 alpha≈0.5，内部→1，外部→0
  const field = document.createElement("canvas");
  field.width = width;
  field.height = height;
  const fctx = field.getContext("2d");
  if (!fctx) return empty;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fctx as any).filter = `blur(${Math.max(2, depth)}px)`;
  } catch {
    /* Safari < 18 不支持 ctx.filter，退化为硬边缘 */
  }
  fctx.drawImage(mask, 0, 0);
  const src = fctx.getImageData(0, 0, width, height).data;

  const dispImg = fctx.createImageData(width, height);
  const dd = dispImg.data;
  const bevelCanvas = document.createElement("canvas");
  bevelCanvas.width = width;
  bevelCanvas.height = height;
  const bctx = bevelCanvas.getContext("2d");
  if (!bctx) return empty;
  const bevelImg = bctx.createImageData(width, height);
  const bd = bevelImg.data;

  // 光源方向：从左上方打来（与 iOS 系统光照一致）
  const Lx = -0.45;
  const Ly = -0.89;

  // ③ 逐像素：距离场梯度 → 外法线；靠近边缘的程度 → 位移幅值 / 光照强度
  for (let py = 0; py < height; py++) {
    const row = py * width;
    const rowUp = Math.max(0, py - 1) * width;
    const rowDown = Math.min(height - 1, py + 1) * width;
    for (let px = 0; px < width; px++) {
      const i = (row + px) * 4;
      const a = src[i] / 255;
      // 幅值：边缘(a≈0.5) → 1，内部(a→1) → 0
      const t = Math.min(1, Math.max(0, (1 - a) / 0.5));
      let dx = 0;
      let dy = 0;
      if (t > 0) {
        const gx =
          (src[(row + Math.min(width - 1, px + 1)) * 4] -
            src[(row + Math.max(0, px - 1)) * 4]) / 255;
        const gy = (src[(rowDown + px) * 4] - src[(rowUp + px) * 4]) / 255;
        const len = Math.hypot(gx, gy);
        if (len > 1e-4) {
          // 梯度指向内部（alpha 增大方向），取反 = 外法线
          dx = -gx / len;
          dy = -gy / len;
        }
      }
      // —— 位移图：侧壁剖面 ——
      // pow4 把位移压进最外缘窄带：正面平坦无位移（纯磨砂），
      // 侧壁窄带强位移（光穿过玻璃"侧面"看到的偏移背景）→ 数字有厚度
      const w = t * t * t * t;
      dd[i] = 128 + dx * w * 127;
      dd[i + 1] = 128 + dy * w * 127;
      dd[i + 2] = 128;
      dd[i + 3] = 255;
      // —— 侧壁光影 ——
      // ① 侧壁带（t 0.45→0.85）：方向性明暗 = 玻璃侧面的厚度感
      // ② 内角（t≈0.4）：两侧都轻微压暗 = 侧面与正面交界的切角
      // ③ 最外缘（t>0.85）：镜面高光 = 玻璃外角反光
      if (t > 0.02) {
        const dot = dx * Lx + dy * Ly; // 外法线 · 光方向
        const wall = Math.min(1, Math.max(0, (t - 0.45) / 0.4)); // 侧壁带渐入
        let v = 0;
        let alpha = 0;
        if (dot >= 0) {
          v = 255;
          alpha = dot * wall * 0.55; // 受光侧面提亮
        } else {
          v = 0;
          alpha = -dot * wall * 0.35; // 背光侧面压暗
        }
        // 内角环境光遮蔽（侧壁与正面交界，窄窄一条暗线）
        const ao = Math.exp(-((t - 0.4) ** 2) / (2 * 0.06 ** 2)) * 0.2;
        if (ao > alpha) {
          v = 0;
          alpha = ao;
        }
        // 最外缘镜面高光（受光侧更亮）
        if (t > 0.85) {
          const s = (t - 0.85) / 0.15;
          const spec = s * (dot > 0 ? 0.85 : 0.35);
          if (spec > alpha) {
            v = 255;
            alpha = spec;
          }
        }
        bd[i] = v;
        bd[i + 1] = v;
        bd[i + 2] = v;
        bd[i + 3] = Math.min(255, Math.round(alpha * 255));
      }
      // 其余像素 bd 保持 0（全透明）
    }
  }
  fctx.putImageData(dispImg, 0, 0);
  bctx.putImageData(bevelImg, 0, 0);

  return { disp: field.toDataURL("image/png"), bevel: bevelCanvas.toDataURL("image/png") };
};

type RectGlassOptions = {
  width: number;
  height: number;
  radius: number;
  depth: number;
  /** 斜面光影强度缩放（大面积面板建议 0.3~0.5，避免"枕头"鼓包感） */
  bevelScale?: number;
};

/**
 * 标准 SDF 圆角矩形（Inigo Quilez 公式） —— 返回连续的有符号距离 d。
 * d>0 在矩形内部，d<0 在外部。公式本身保证在直边与圆角交界处连续。
 *
 *  p = 像素坐标（矩形左上角为原点）
 *  W, H = 矩形尺寸
 *  r = 圆角半径
 */
const sdRoundRect = (px: number, py: number, W: number, H: number, r: number): number => {
  const rr = Math.min(r, W / 2, H / 2);
  const bx = W / 2;
  const by = H / 2;
  // 转换到以矩形中心为原点的坐标
  const cx = px - bx;
  const cy = py - by;
  // 标准 SDF：d = min(max(dx,dy),0) + length(max(dx,dy,0)) - r
  const dx = Math.abs(cx) - (bx - rr);
  const dy = Math.abs(cy) - (by - rr);
  const inner = Math.max(dx, dy);
  return inner < 0 ? inner : Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) - rr;
};

/**
 * 计算 (px, py) 处的距离 + 外法线。
 * d 来自 sdRoundRect（连续），法线用中心差分算梯度（数值上也连续）。
 * 这种组合保证直边-圆角交界处法线方向不跳变 → 彻底消除折角。
 */
const sdRoundRectWithNormal = (px: number, py: number, W: number, H: number, r: number) => {
  const d = sdRoundRect(px, py, W, H, r);
  const eps = 1.2;
  const ddx = sdRoundRect(px + eps, py, W, H, r) - sdRoundRect(px - eps, py, W, H, r);
  const ddy = sdRoundRect(px, py + eps, W, H, r) - sdRoundRect(px, py - eps, W, H, r);
  const len = Math.hypot(ddx, ddy);
  // 梯度指向距离增长方向 → 外部。法线指向外部（距离增加的方向）
  if (len > 1e-4) {
    return { d, nx: ddx / len, ny: ddy / len };
  }
  // 矩形核心（dx<0 且 dy<0）：梯度为 0，用指向最近直边的方向
  const rr = Math.min(r, W / 2, H / 2);
  const bx = W / 2; const by = H / 2;
  const cx = px - bx; const cy = py - by;
  const dx2 = Math.abs(cx) - (bx - rr);
  const dy2 = Math.abs(cy) - (by - rr);
  if (dx2 > dy2) {
    return { d, nx: cx > 0 ? 1 : -1, ny: 0 };
  }
  return { d, nx: 0, ny: cy > 0 ? 1 : -1 };
};

/**
 * 圆角矩形版玻璃贴图 —— 用解析几何计算距离场 + 外法线，
 * 保证法线方向在直边和圆角之间完美连续，彻底消除模糊 mask 方案
 * 在圆角处产生的折角/跳变。
 *
 * 返回 disp（RGB 位移图，data URL）和 bevel（斜面光影图，data URL）
 * 画布即面板本身大小，配合 feImage 放置到面板坐标即可。
 */
export const getRectGlassMaps = ({
  width,
  height,
  radius,
  depth,
  bevelScale = 1,
}: RectGlassOptions): { disp: string; bevel: string } => {
  const empty = { disp: "", bevel: "" };
  if (typeof document === "undefined") return empty;

  const dispCv = document.createElement("canvas");
  dispCv.width = width;
  dispCv.height = height;
  const dctx = dispCv.getContext("2d");
  if (!dctx) return empty;

  const bevelCv = document.createElement("canvas");
  bevelCv.width = width;
  bevelCv.height = height;
  const bctx = bevelCv.getContext("2d");
  if (!bctx) return empty;

  const dispImg = dctx.createImageData(width, height);
  const dd = dispImg.data;
  const bevelImg = bctx.createImageData(width, height);
  const bd = bevelImg.data;

  const maxDepth = Math.max(2, depth); // 侧壁可见的最大距离

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const i = (py * width + px) * 4;
      const { d, nx, ny } = sdRoundRectWithNormal(px, py, width, height, radius);

      // 距离边界的"边缘接近度"：0=远离边界，1=边界上
      const edge = 1 - Math.min(1, Math.max(0, d / maxDepth));

      // ① 位移图：侧壁剖面（pow4 压进外缘窄带）
      const w = Math.pow(edge, 4);
      dd[i] = 128 + nx * w * 127;
      dd[i + 1] = 128 + ny * w * 127;
      dd[i + 2] = 128;
      dd[i + 3] = 255;

      // ② 斜面光影：仅外缘一圈均匀高光（沿整个边缘一周）
      // 不做方向性 dot 光照 → 圆角和直边光影一致，无折角
      // edge ≈ 1（边界）→ 高光强；edge ≈ 0.6（内部）→ 无
      if (edge > 0.6) {
        const highlight = Math.min(1, (edge - 0.6) / 0.4); // edge 0.6→1 时 0→1
        const alpha = highlight * 0.55 * bevelScale;
        bd[i] = 255;
        bd[i + 1] = 255;
        bd[i + 2] = 255;
        bd[i + 3] = Math.min(255, Math.round(alpha * 255));
      }
      // 其余保持 0
    }
  }
  dctx.putImageData(dispImg, 0, 0);
  bctx.putImageData(bevelImg, 0, 0);

  return { disp: dispCv.toDataURL("image/png"), bevel: bevelCv.toDataURL("image/png") };
};

export const getDisplacementMap = ({
  height,
  width,
  radius,
  depth,
}: Omit<DisplacementOptions, "chromaticAberration" | "strength">) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
        .mix { mix-blend-mode: screen; }
    </style>
    <defs>
        <linearGradient 
          id="Y" 
          x1="0" 
          x2="0" 
          y1="${Math.ceil((radius / height) * 15)}%" 
          y2="${Math.floor(100 - (radius / height) * 15)}%">
            <stop offset="0%" stop-color="#0F0" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
        <linearGradient 
          id="X" 
          x1="${Math.ceil((radius / width) * 15)}%" 
          x2="${Math.floor(100 - (radius / width) * 15)}%"
          y1="0" 
          y2="0">
            <stop offset="0%" stop-color="#F00" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
    </defs>

    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect
          x="0"
          y="0"
          height="${height}"
          width="${width}"
          fill="url(#Y)"
          class="mix"
      />
      <rect
          x="0"
          y="0"
          height="${height}"
          width="${width}"
          fill="url(#X)"
          class="mix"
      />
      <rect
          x="${depth}"
          y="${depth}"
          height="${height - 2 * depth}"
          width="${width - 2 * depth}"
          fill="#808080"
          rx="${radius}"
          ry="${radius}"
          filter="blur(${depth}px)"
      />
    </g>
</svg>`);

export const getDisplacementFilter = ({
  height,
  width,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0,
}: DisplacementOptions) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="displace" color-interpolation-filters="sRGB">
            <feImage x="0" y="0" height="${height}" width="${width}" href="${getDisplacementMap(
              {
                height,
                width,
                radius,
                depth,
              },
            )}" result="displacementMap" />
            <feDisplacementMap
                transform-origin="center"
                in="SourceGraphic"
                in2="displacementMap"
                scale="${strength + chromaticAberration * 2}"
                xChannelSelector="R"
                yChannelSelector="G"
            />
            <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="displacedR"
                    />
            <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale="${strength + chromaticAberration}"
                xChannelSelector="R"
                yChannelSelector="G"
            />
            <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="displacedG"
                    />
            <feDisplacementMap
                    in="SourceGraphic"
                    in2="displacementMap"
                    scale="${strength}"
                    xChannelSelector="R"
                    yChannelSelector="G"
                />
                <feColorMatrix
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 1 0 0
                        0 0 0 1 0"
                result="displacedB"
                        />
              <feBlend in="displacedR" in2="displacedG" mode="screen"/>
              <feBlend in2="displacedB" mode="screen"/>
        </filter>
    </defs>
</svg>`) +
  "#displace";
