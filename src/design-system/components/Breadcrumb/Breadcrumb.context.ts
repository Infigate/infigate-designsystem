import { createContext } from 'react'

/** Breadcrumb が各項目に「今いるページか」を伝える */
export const BreadcrumbItemContext = createContext<{ current: boolean }>({ current: false })
