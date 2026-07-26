import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import '@/index.css'
import App from '@/App'
import { queryClient } from '@/lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* P3-4：react-query 数据层骨架 Provider，供未来各页按需消费 useXxx 钩子 */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)