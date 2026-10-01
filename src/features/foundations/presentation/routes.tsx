import type { RouteObject } from 'react-router'
import { FoundationPage } from './FoundationPage'

/** 基本デザインのルート。アプリ側のレイアウト配下にそのまま差し込む */
export const foundationRoutes: RouteObject[] = [{ path: 'foundations/:slug', element: <FoundationPage /> }]
