// このファイルは scripts/generate-icons.ts が svg/ 内の SVG から生成している。直接編集しないこと。
// アイコンを追加・更新するときは、Figma から書き出した SVG を svg/ に置いて `npm run icons:generate` を実行する。
import type { IconDefinition } from './iconSource'

export const ICONS = {
  'arrow-right': {
    line: [
      ['path', { d: 'M5 12H19M13 18L19 12L13 6', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'arrow-up-down': {
    line: [
      ['path', { d: 'M8 8L12 4L16 8M8 16L12 20L16 16', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'calendar': {
    line: [
      ['path', { d: 'M16 3V7M8 3V7M3 11H21M5 5H19C20.1046 5 21 5.89543 21 7V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7C3 5.89543 3.89543 5 5 5Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'check': {
    line: [
      ['path', { d: 'M5 12L10 17L19 7', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'chevron-down': {
    line: [
      ['path', { d: 'M6 9L12 15L18 9', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'chevron-left': {
    line: [
      ['path', { d: 'M15 5L8 12L15 19', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'chevron-right': {
    line: [
      ['path', { d: 'M9 5L16 12L9 19', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'chevrons-left': {
    line: [
      ['path', { d: 'M11 5L5 12L11 19M18 5L12 12L18 19', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'chevrons-right': {
    line: [
      ['path', { d: 'M13 5L19 12L13 19M6 5L12 12L6 19', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'circle-check': {
    line: [
      ['path', { d: 'M21 12C21 7.03 16.97 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
      ['path', { d: 'M7.5 12.3L10.6 15.4L16.5 9.2', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
    filled: [
      ['path', { d: 'M12 2C17.5222 2 22 6.47778 22 12C22 17.5222 17.5222 22 12 22C6.47778 22 2 17.5222 2 12C2 6.47778 6.47778 2 12 2Z', fill: 'currentColor' }],
      ['path', { d: 'M7.5 12.3L10.6 15.4L16.5 9.2', 'data-knockout': 'stroke', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'circle-x': {
    line: [
      ['path', { d: 'M21 12C21 7.03 16.97 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
      ['path', { d: 'M8.8 8.8L15.2 15.2M15.2 8.8L8.8 15.2', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
    filled: [
      ['path', { d: 'M12 2C17.5222 2 22 6.47778 22 12C22 17.5222 17.5222 22 12 22C6.47778 22 2 17.5222 2 12C2 6.47778 6.47778 2 12 2Z', fill: 'currentColor' }],
      ['path', { d: 'M8.8 8.8L15.2 15.2M15.2 8.8L8.8 15.2', 'data-knockout': 'stroke', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'download': {
    line: [
      ['path', { d: 'M12 4V15M17 10L12 15L7 10M5 20H19', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'external-link': {
    line: [
      ['path', { d: 'M19 10V5H14M19 5L11 13M18 14V19H5V6H10', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'eye': {
    line: [
      ['path', { d: 'M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
      ['path', { d: 'M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'folder': {
    line: [
      ['path', { d: 'M2 6.5C2 5.4 2.9 4.5 4 4.5H8.5L10.5 6.5H20C21.1 6.5 22 7.4 22 8.5V17.5C22 18.6 21.1 19.5 20 19.5H4C2.9 19.5 2 18.6 2 17.5V6.5Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'grip-vertical': {
    line: [
      ['circle', { cx: '9.25', cy: '5', r: '1.25', fill: 'currentColor' }],
      ['circle', { cx: '9.25', cy: '11', r: '1.25', fill: 'currentColor' }],
      ['circle', { cx: '9.25', cy: '17', r: '1.25', fill: 'currentColor' }],
      ['circle', { cx: '14.25', cy: '5', r: '1.25', fill: 'currentColor' }],
      ['circle', { cx: '14.25', cy: '11', r: '1.25', fill: 'currentColor' }],
      ['circle', { cx: '14.25', cy: '17', r: '1.25', fill: 'currentColor' }],
    ],
  },
  'info': {
    line: [
      ['path', { d: 'M12 16V12M12 8V8.6M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
    filled: [
      ['path', { d: 'M12 2C17.5222 2 22 6.47778 22 12C22 17.5222 17.5222 22 12 22C6.47778 22 2 17.5222 2 12C2 6.47778 6.47778 2 12 2Z', fill: 'currentColor' }],
      ['path', { d: 'M12 11.2V16.6', 'data-knockout': 'stroke', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
      ['circle', { cx: '12', cy: '7.8', r: '1.2', 'data-knockout': 'fill' }],
    ],
  },
  'menu': {
    line: [
      ['path', { d: 'M3 6H21M3 12H21M3 18H21', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' }],
    ],
  },
  'more-horizontal': {
    line: [
      ['circle', { cx: '5', cy: '12', r: '2', fill: 'currentColor' }],
      ['circle', { cx: '12', cy: '12', r: '2', fill: 'currentColor' }],
      ['circle', { cx: '19', cy: '12', r: '2', fill: 'currentColor' }],
    ],
  },
  'more-vertical': {
    line: [
      ['circle', { cx: '12', cy: '5', r: '2', fill: 'currentColor' }],
      ['circle', { cx: '12', cy: '12', r: '2', fill: 'currentColor' }],
      ['circle', { cx: '12', cy: '19', r: '2', fill: 'currentColor' }],
    ],
  },
  'plus': {
    line: [
      ['path', { d: 'M12 5V19M5 12H19', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'search': {
    line: [
      ['path', { d: 'M21 21L16.7 16.7M18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'triangle-alert': {
    line: [
      ['path', { d: 'M13.6 3.3C12.9 2.1 11.1 2.1 10.4 3.3L1.9 18.2C1.2 19.4 2.1 20.9 3.5 20.9H20.5C21.9 20.9 22.8 19.4 22.1 18.2L13.6 3.3Z', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
      ['path', { d: 'M12 9.6V14.6', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
      ['circle', { cx: '12', cy: '17.8', r: '1.2', fill: 'currentColor' }],
    ],
    filled: [
      ['path', { d: 'M10.2442 2.83757C11.0124 1.52081 12.9877 1.52081 13.7558 2.83757L23.0836 19.1873C23.8518 20.5041 22.8641 22.15 21.3278 22.15H2.6722C1.13586 22.15 0.148207 20.5041 0.916378 19.1873L10.2442 2.83757Z', fill: 'currentColor' }],
      ['path', { d: 'M12 9.6V14.6', 'data-knockout': 'stroke', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
      ['circle', { cx: '12', cy: '17.8', r: '1.2', 'data-knockout': 'fill' }],
    ],
  },
  'upload': {
    line: [
      ['path', { d: 'M12 14V3M18 9L12 3L6 9M6 17H18', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
  'user': {
    line: [
      ['circle', { cx: '12', cy: '8', r: '3', stroke: 'currentColor', strokeWidth: '2' }],
      ['path', { d: 'M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
    filled: [
      ['circle', { cx: '12', cy: '7.5', r: '4.5', fill: 'currentColor' }],
      ['path', { d: 'M12 13C16.97 13 21 16.6 21 21H3C3 16.6 7.03 13 12 13Z', fill: 'currentColor' }],
    ],
  },
  'x': {
    line: [
      ['path', { d: 'M18 6L6 18M6 6L18 18', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }],
    ],
  },
} as const satisfies Record<string, IconDefinition>
