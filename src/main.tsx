import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'

// Inicialização das configurações (i18n, estilos globais)
import './config/i18n'
import './index.css'

// Import da árvore de rotas gerada automaticamente pelo TanStack Router
import { routeTree } from './routeTree.gen'

// Criação da instância do router
const router = createRouter({ routeTree })

// Declaração de tipagem do router para TypeScript (Module Augmentation)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Renderização da aplicação
const rootElement = document.getElementById('root')
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
