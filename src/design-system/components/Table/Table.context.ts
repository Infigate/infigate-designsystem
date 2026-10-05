import { createContext, useContext } from 'react'

/** セルが見出し（thead）と本文（tbody）のどちらにあるか。TableSelectCell が th と td を切り替えるのに使う */
export const TableSectionContext = createContext<'head' | 'body'>('body')

export const useTableSection = () => useContext(TableSectionContext)
