import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useFormGenerator } from './useFormGenerator'
import type { FormData, FormSchema } from '../../types/form-schema'

const schema: FormSchema = {
  fields: [
    { type: 'text', label: 'Имя', model: 'name', required: true },
    { type: 'checkbox', label: 'Согласие', model: 'terms', required: true },
  ],
}

describe('useFormGenerator', () => {
  it('инициализирует пустой model через setModel', () => {
    const model = ref<Record<string, string | boolean>>({})
    const setModel = (value: typeof model.value) => {
      model.value = value
    }

    useFormGenerator(ref(schema), () => model.value, setModel, () => {})

    expect(model.value).toEqual({ name: '', terms: false })
  })

  it('updateField идёт через setModel, не мутирует объект in-place', () => {
    const model = ref<FormData>({ name: '', terms: false })
    const snapshots: unknown[] = []

    const { updateField } = useFormGenerator(
      ref(schema),
      () => model.value,
      (value) => {
        snapshots.push(model.value)
        model.value = value
      },
      () => {},
    )

    updateField('name', 'Kate')

    expect(model.value.name).toBe('Kate')
    expect(snapshots[0]).toEqual({ name: '', terms: false })
  })

  it('fieldError после markTouched', () => {
    const model = ref<FormData>({ name: '', terms: false })
    const { markTouched, fieldError } = useFormGenerator(
      ref(schema),
      () => model.value,
      (v) => {
        model.value = v
      },
      () => {},
    )

    markTouched('name')
    expect(fieldError('name')).toBe('Обязательное поле')
  })

  it('дополняет ключи при асинхронном обновлении model снаружи', async () => {
    const model = ref<Record<string, string | boolean>>({})

    useFormGenerator(
      ref(schema),
      () => model.value,
      (v) => {
        model.value = v
      },
      () => {},
    )

    model.value = { name: 'Из API' }
    await nextTick()

    expect(model.value).toEqual({ name: 'Из API', terms: false })
  })
})
