import type { ReactNode } from 'react'
import { useViewport } from '@/hooks/useViewport'
import { StatusBar } from './StatusBar'
import { HomeIndicator } from './HomeIndicator'
import './PhoneFrame.css'

interface PhoneFrameProps {
  children: ReactNode
  /** 当前场景：决定状态栏显示什么 */
  scene: 'lock' | 'home' | 'app'
  onHomePress?: () => void
  /** 悬浮在屏幕坐标系内的覆盖层（悬浮球等），不受状态栏内边距影响 */
  overlay?: ReactNode
  /** 当前 app 是否是浅色主题（如白底相册）。true 时状态栏用深色文字 */
  appLightTheme?: boolean
  /** 当前 app 是否处于深色底页面（如 rednote 个人主页），状态栏文字转白 */
  darkStatus?: boolean
}

/** 手机设计尺寸（iPhone 13 Pro Max 逻辑分辨率，内部坐标系固定） */
const PHONE_W = 428
const PHONE_H = 926

/** 手机端断点：需与 PhoneFrame.css / global.css 的 @media 保持一致 */
const MOBILE_MAX = 480

/**
 * 整个手机外壳组件：
 *  - 电脑端显示圆角黑色外壳 + 动态岛 + 阴影
 *  - 窗口比手机小时等比整体缩小（自适应），内部布局不变
 *  - 手机端直接全屏显示，外壳隐藏
 *  - 内部统一承载 StatusBar / 内容 / HomeIndicator
 */
export function PhoneFrame({ children, scene, onHomePress, overlay, appLightTheme = false, darkStatus = false }: PhoneFrameProps) {
  const isTranslucent = scene === 'lock' || scene === 'home' || appLightTheme
  const statusVariant = scene === 'lock' ? 'lock' : 'default'
  // 浅色 app（白底相册）状态栏用深色文字
  const statusDark = appLightTheme

  // 窗口自适应：手机端与电脑端统一用 transform: scale 等比缩放。
  // 模拟器内部永远是 428×926 坐标系，只在外层缩放，避免手机端图标/文字按 1:1 渲染显得过大偏右。
  // 视口尺寸由全局共享的 useViewport 提供（含软键盘高度锁定），避免每个组件各自监听
  const { width: vw, height: vh } = useViewport()
  const mobile = vw <= MOBILE_MAX
  // 手机端不留外壳边距，尽量铺满屏幕；电脑端四周留 20px 给阴影
  const margin = mobile ? 0 : 40
  // 上限 1.3 允许放大；取宽/高约束的较小值，保证完整显示不裁切
  const scale = Math.min(1.3, vw / (PHONE_W + margin), vh / (PHONE_H + margin))

  // 缩放后的占位尺寸：让 flex 布局按缩放后的实际大小居中，避免页面溢出
  const stageStyle = { width: PHONE_W * scale, height: PHONE_H * scale }

  return (
    <div className="pf-wrap">
      <div className="pf-stage" style={stageStyle}>
        <div className={`pf${darkStatus ? ' is-dark-status' : ''}`} style={{ transform: `scale(${scale})` }}>
          {/* 动态岛 */}
          <div className="pf-dynamic-island" />

          {/* 状态栏：锁屏/桌面壁纸都是图片，用白色文字；浅色 app 用深色文字 */}
          <StatusBar translucent={isTranslucent} dark={statusDark} variant={statusVariant} />

          {/* 主内容区 */}
          <div className="pf-body">{children}</div>

          {/* 屏幕坐标系覆盖层 */}
          {overlay}

          {/* Home Indicator：壁纸是图片，用白色横条；浅色 app 用深色横条 */}
          <HomeIndicator onPress={onHomePress} dark={appLightTheme} />
        </div>
      </div>
    </div>
  )
}
