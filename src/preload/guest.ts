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
