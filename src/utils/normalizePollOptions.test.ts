import { describe, expect, it } from 'vitest'
import {
  incrementPollOptionVotes,
  normalizePollOptions,
} from './normalizePollOptions'

describe('normalizePollOptions', () => {
  it('mantém opções armazenadas como array', () => {
    expect(normalizePollOptions([{ id: 'one', text: 'Opção 1', votes: 2 }])).toEqual([
      { id: 'one', text: 'Opção 1', votes: 2 },
    ])
  })

  it('converte opções armazenadas como objeto em array', () => {
    expect(
      normalizePollOptions({
        first: { text: 'Opção 1', votes: 2 },
        second: { id: 'two', text: 'Opção 2' },
      }),
    ).toEqual([
      { id: 'first', text: 'Opção 1', votes: 2 },
      { id: 'two', text: 'Opção 2', votes: 0 },
    ])
  })

  it('rejeita formatos inválidos em vez de entregá-los à interface', () => {
    expect(() => normalizePollOptions('opções')).toThrow(
      'Formato inválido de opções da enquete.',
    )
  })

  it('incrementa somente a opção selecionada sem alterar a lista original', () => {
    const options = [
      { id: 'one', text: 'Opção 1', votes: 2 },
      { id: 'two', text: 'Opção 2', votes: 4 },
    ]

    expect(incrementPollOptionVotes(options, 'two')).toEqual([
      { id: 'one', text: 'Opção 1', votes: 2 },
      { id: 'two', text: 'Opção 2', votes: 5 },
    ])
    expect(options[1].votes).toBe(4)
  })

  it('rejeita uma opção que não pertence à enquete', () => {
    expect(() =>
      incrementPollOptionVotes(
        [{ id: 'one', text: 'Opção 1', votes: 0 }],
        'missing',
      ),
    ).toThrow('Opção inválida selecionada.')
  })
})
