/*
 * RapidSurf Browser
 * Copyright (C) 2026 Abel Ajish
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ipcRenderer } from 'electron'

window.addEventListener('scroll', () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0
  ipcRenderer.send('tabs:scroll-guest', { progress: scrolled })
})

document.addEventListener('mouseover', (e) => {
  const anchor = (e.target as HTMLElement).closest('a')
  if (anchor && anchor.href) {
    ipcRenderer.send('tabs:hover-link-guest', { url: anchor.href })
  } else {
    ipcRenderer.send('tabs:hover-link-guest', { url: null })
  }
})
