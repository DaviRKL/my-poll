import React, { useState } from 'react'
import { LogIn, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { cn } from '../utils/cn'

export interface AuthPromptProps {
  title?: string
  description?: string
  className?: string
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({
  title = 'Inicie sessão para continuar',
  description = 'É necessário identificar-se para poder criar enquetes e registrar votos em tempo real.',
  className,
}) => {
  const { loginWithGoogle, loginAnon } = useAuth()
  const [loadingMethod, setLoadingMethod] = useState<'google' | 'anon' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      setLoadingMethod('google')
      await loginWithGoogle()
    } catch (err) {
      console.error(err)
      setError('Falha ao autenticar com Google. Tente novamente.')
    } finally {
      setLoadingMethod(null)
    }
  }

  const handleAnonLogin = async () => {
    try {
      setError(null)
      setLoadingMethod('anon')
      await loginAnon()
    } catch (err) {
      console.error(err)
      setError('Falha ao entrar anonimamente. Tente novamente.')
    } finally {
      setLoadingMethod(null)
    }
  }

  return (
    <div className={cn('max-w-md w-full mx-auto my-8', className)}>
      <Card className="text-center p-8 space-y-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
        {/* Ícone de Autenticação */}
        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto shadow-xs">
          <LogIn size={26} />
        </div>

        {/* Título e Descrição */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feedback de Erro */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-400 flex items-center gap-2 text-left">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="primary"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loadingMethod !== null}
            leftIcon={
              loadingMethod === 'google' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : undefined
            }
          >
            {loadingMethod === 'google' ? 'A conectar...' : 'Entrar com Google'}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={handleAnonLogin}
            disabled={loadingMethod !== null}
            leftIcon={
              loadingMethod === 'anon' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : undefined
            }
          >
            {loadingMethod === 'anon' ? 'A entrar...' : 'Continuar anonimamente'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
