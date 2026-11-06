import { useEffect, useState } from 'react'
import './StatusBar.css'

interface StatusBarProps {
  /** 背景是否透明（锁屏/桌面是透明，应用内是磨砂黑） */
  translucent?: boolean
  /** 状态栏文字颜色 */
  dark?: boolean
  /** 场景：锁屏时左侧显示运营商而不是时间 */
  variant?: 'default' | 'lock'
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(t)
  }, [])
  return now
}

/**
 * 复刻 iOS 状态栏：左边 —— 时间或运营商；右边 —— 信号/Wi-Fi/电池。
 */
export function StatusBar({ translucent = false, dark = false, variant = 'default' }: StatusBarProps) {
  const now = useClock()
  // 12 小时制：0 点显示 12，13 点显示 01
  const h12 = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12
  const hh = h12.toString().padStart(2, '0')
  const mm = now.getMinutes().toString().padStart(2, '0')

  const cls = ['sb', dark ? 'sb-dark' : '', translucent ? 'sb-translucent' : '']
    .filter(Boolean)
    .join(' ')

  // 锁屏时左侧显示运营商
  const left =
    variant === 'lock' ? (
      <span className="sb-carrier">中国移动</span>
    ) : (
      <span className="sb-time">{hh}:{mm}</span>
    )

  return (
    <div className={cls}>
      {left}
      <div className="sb-right">
        {/* 信号：4 根递增的圆角竖条 */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-label="Signal">
          <rect x="0" y="8" width="3.5" height="4" rx="1.75" />
          <rect x="5" y="5.5" width="3.5" height="6.5" rx="1.75" />
          <rect x="10" y="3" width="3.5" height="9" rx="1.75" />
          <rect x="15" y="0.5" width="3.5" height="11.5" rx="1.75" />
        </svg>
        {/* Wi-Fi：从用户 SVG 提取的干净矢量路径 */}
        <svg width="15.5" height="11.5" viewBox="260 130 1015 765" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Wi-Fi">
          <path d="M 754.5 144 L 807.5 145 L 808.5 146 L 834.5 147 L 835.5 148 L 862.5 150 L 881.5 154 L 894.5 155 L 899.5 157 L 924.5 161 L 956.5 169 L 1010.5 186 Q 1071 208.5 1123.5 239 Q 1169.6 266.4 1210 299.5 Q 1209.3 301.8 1211.5 301 L 1229 315.5 Q 1244.9 333.1 1258 353.5 L 1263 371.5 L 1263 392.5 L 1258 407.5 L 1245 426 L 1232.5 436 L 1216.5 445 L 1210.5 447 L 1198.5 448 L 1182.5 444 L 1167.5 436 L 1107.5 390 L 1057.5 357 Q 1017.8 333.2 971.5 316 L 922.5 300 L 894.5 293 L 879.5 291 L 875.5 289 L 850.5 286 L 843.5 284 L 816.5 282 L 815.5 281 L 756.5 279 L 755.5 280 L 731.5 280 L 730.5 281 L 707.5 282 L 706.5 283 L 698.5 283 L 697.5 284 L 670.5 287 L 664.5 289 L 658.5 289 L 618.5 298 L 556.5 318 Q 508.7 336.7 467.5 362 L 424.5 391 L 362.5 438 L 344.5 446 Q 337.4 448.4 326.5 447 Q 302.5 440 288 423.5 Q 279.3 414.7 274 402.5 L 271 392.5 L 270 380.5 L 271 379.5 L 272 365.5 L 277 350.5 L 308.5 312 Q 354.5 272 408.5 240 L 467.5 209 L 520.5 187 L 580.5 168 L 639.5 155 L 664.5 152 L 671.5 150 L 697.5 148 L 698.5 147 L 725.5 146 L 726.5 145 L 753.5 145 L 754.5 144 Z" />
          <path d="M 751.5 405 L 802.5 406 L 803.5 407 L 813.5 407 L 814.5 408 L 822.5 408 L 823.5 409 L 844.5 411 L 890.5 421 L 922.5 431 L 925.5 433 L 928.5 433 Q 966.4 447.1 999.5 466 L 1042.5 494 Q 1056.8 503.7 1068 516.5 Q 1077.3 527.2 1083 541.5 L 1085 548.5 L 1086 565.5 L 1082 581.5 L 1077 591.5 Q 1067.5 607 1053.5 618 L 1034.5 630 L 1016.5 634 L 1015.5 633 L 1001.5 632 L 985.5 625 L 962.5 611 L 917.5 580 L 877.5 561 L 849.5 552 L 811.5 544 L 795.5 543 L 794.5 542 L 780.5 542 L 779.5 541 L 755.5 541 L 754.5 542 L 731.5 543 L 730.5 544 L 706.5 547 L 674.5 555 L 654.5 562 L 652.5 564 L 645.5 566 L 620.5 578 L 549.5 625 L 531.5 633 L 526.5 634 L 510.5 634 Q 480.6 624.9 464 602.5 Q 454 591.5 449 575.5 Q 450.3 570.8 448 569.5 L 448 552.5 Q 454.9 524.9 473.5 509 Q 531 460.5 608.5 432 L 643.5 421 L 678.5 413 L 709.5 409 L 710.5 408 L 731.5 407 L 732.5 406 L 750.5 406 L 751.5 405 Z" />
          <path d="M 746.5 667 L 781.5 667 L 782.5 668 L 796.5 669 L 813.5 674 L 817.5 674 Q 839.5 680.5 858.5 690 Q 875.5 699 888 712.5 L 901 732.5 L 904 741.5 L 904 754.5 Q 900.2 766.7 893 775.5 Q 865.5 808 834.5 837 L 831.5 839 Q 813.8 857.3 792.5 872 Q 782.3 879.3 765.5 880 L 751.5 877 L 732.5 866 Q 697.2 837.8 666 805.5 Q 650 790 638 770.5 L 632 753.5 L 632 741.5 Q 636.9 718.9 652.5 707 L 668.5 695 L 695.5 681 L 728.5 670 L 734.5 670 L 746.5 667 Z" />
        </svg>
        {/* 电池：实心圆角矩形 + 右侧极头 */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="currentColor" aria-label="Battery">
          <rect x="0" y="0.5" width="23" height="12" rx="3.2" />
          <rect x="24.5" y="4" width="2" height="5" rx="1" />
        </svg>
      </div>
    </div>
  )
}
