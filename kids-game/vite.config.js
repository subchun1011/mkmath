import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 핵심: 저장소 이름을 앞뒤에 슬래시와 함께 넣어주세요.
  base: '/mkmath/', 
})