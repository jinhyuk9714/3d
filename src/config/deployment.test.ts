import { describe, expect, it } from 'vitest'
import viteConfig from '../../vite.config'

describe('public deployment configuration', () => {
  it('uses the GitHub Pages project base path', () => {
    expect(viteConfig.base).toBe('/3d/')
  })
})
