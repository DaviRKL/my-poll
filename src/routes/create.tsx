import React, { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlusCircle, Trash2, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { createPoll } from '../services/pollService'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { AuthPrompt } from '../components/AuthPrompt'
import { toDateTimeLocalString } from '../utils/formatDate'
import type { Poll, PollStatus } from '../types'

export const Route = createFileRoute('/create')({
  component: CreatePollPage,
})

function CreatePollPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()

  // Estados locais controlados do formulário
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState<string[]>(['', '', '']) // Mínimo de 3 opções iniciais (RN5)

  // Datas padrão: Início agora e Término daqui a 7 dias
  const [startDate, setStartDate] = useState(() => toDateTimeLocalString(new Date()))
  const [endDate, setEndDate] = useState(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return toDateTimeLocalString(nextWeek)
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manipulação dinâmica de opções
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleAddOption = () => {
    setOptions((prev) => [...prev, ''])
  }

  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 3) {
      setError(
        t(
          'create.errorMinOptions',
          'A enquete deve ter no mínimo 3 opções de resposta preenchidas (RN5).',
        ),
      )
      return
    }
    setOptions((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    setError(null)
  }

  // Validação e Envio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      setError(
        t('create.errorAuthRequired', 'É necessário estar autenticado para criar uma enquete.'),
      )
      return
    }

    if (!title.trim()) {
      setError(t('create.errorTitleRequired', 'Por favor, informe o título da enquete.'))
      return
    }

    const filledOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0)
    if (filledOptions.length < 3) {
      setError(
        t(
          'create.errorMinOptions',
          'A enquete deve ter no mínimo 3 opções de resposta preenchidas (RN5).',
        ),
      )
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError(
        t('create.errorDatesInvalid', 'Por favor, selecione datas de início e término válidas.'),
      )
      return
    }

    if (end <= start) {
      setError(
        t(
          'create.errorEndDateBeforeStart',
          'A data de término deve ser posterior à data de início.',
        ),
      )
      return
    }

    setSubmitting(true)
    try {
      const now = new Date()
      let status: PollStatus = 'em andamento'
      if (start > now) {
        status = 'não iniciado'
      } else if (end < now) {
        status = 'finalizado'
      }

      const pollData: Omit<Poll, 'id'> = {
        title: title.trim(),
        startDate: start,
        endDate: end,
        status,
        options: filledOptions.map((text, idx) => ({
          id: `opt-${idx + 1}-${Date.now()}`,
          text,
          votes: 0,
        })),
        createdBy: user.uid,
        createdAt: now,
      }

      await createPoll(pollData)
      navigate({ to: '/' })
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : t(
              'create.errorGeneric',
              'Ocorreu um erro ao criar a enquete. Tente novamente.',
            ),
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Se o utilizador NÃO estiver autenticado, exibe o AuthPrompt centralizado
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t('create.title', 'Criar enquete')}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t(
              'create.subtitle',
              'Preencha os seguintes campos para criar a sua enquete',
            )}
          </p>
        </div>

        <AuthPrompt
          title={t('create.authPromptTitle', 'Inicie sessão para criar uma enquete')}
          description={t(
            'create.authPromptDesc',
            'Para publicar enquetes em tempo real na plataforma, é necessário autenticar-se previamente.',
          )}
        />
      </div>
    )
  }

  // Se o utilizador estiver autenticado, renderiza o formulário normalmente
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Título e Subtítulo Centralizados conforme Figma */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t('create.title', 'Criar enquete')}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t(
            'create.subtitle',
            'Preencha os seguintes campos para criar a sua enquete',
          )}
        </p>
      </div>

      {/* Formulário Principal */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3.5 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center gap-2.5 text-xs sm:text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={18} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo: Título */}
          <div className="space-y-1">
            <Input
              label={t('create.titleLabel', 'Titulo')}
              placeholder={t('create.titlePlaceholder', 'Digite aqui a sua pergunta')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Seção: Opções de Resposta */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {t('create.optionsLabel', 'Opções de resposta')}
            </label>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={t('create.optionPlaceholder', {
                      index: index + 1,
                      defaultValue: `Opção ${index + 1}`,
                    })}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required={index < 3}
                  />

                  {/* Botão para remover opção caso haja mais de 3 */}
                  {options.length > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      title={t('create.removeOptionAria', 'Remover opção')}
                      aria-label={t('create.removeOptionAria', 'Remover opção')}
                      className="p-2.5 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Botão Adicionar Opção */}
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                leftIcon={<PlusCircle size={16} />}
              >
                {t('create.addOption', 'Adicionar opção')}
              </Button>
            </div>
          </div>

          {/* Seção: Datas (Início e Término) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
            <Input
              label={t('create.startDateLabel', 'Data de início')}
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              rightIcon={<Calendar size={18} />}
              required
            />

            <Input
              label={t('create.endDateLabel', 'Data de término')}
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              rightIcon={<Calendar size={18} />}
              required
            />
          </div>

          {/* Botão de Envio Centralizado */}
          <div className="pt-4 flex justify-center">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
              leftIcon={submitting ? <Loader2 size={18} className="animate-spin" /> : undefined}
            >
              {submitting
                ? t('create.submittingButton', 'Criando enquete...')
                : t('create.submitButton', 'Criar enquete')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
