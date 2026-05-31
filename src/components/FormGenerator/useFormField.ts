import { computed } from 'vue'
import type { FieldSchema } from '../../types/form-schema'

export function useFormField(props: {
  field: FieldSchema
  fieldIndex: number
  touched?: boolean
  error?: string
}) {
  const id = computed(() => `field-${props.field.model}-${props.fieldIndex}`)
  const errorId = computed(() => `${id.value}-error`)
  const showError = computed(() => props.touched && props.error)

  const hint = computed(() => {
    const { field } = props
    if (field.type === 'checkbox' || field.type === 'select') return null

    const parts: string[] = []
    if (field.minLength) parts.push(`мин. ${field.minLength} симв.`)
    if (field.pattern) parts.push('сложный формат')
    return parts.length ? parts.join(', ') : null
  })

  return { id, errorId, showError, hint }
}

export function readInputValue(e: Event): string {
  return (e.target as HTMLInputElement | HTMLSelectElement).value
}

export function readCheckboxValue(e: Event): boolean {
  return (e.target as HTMLInputElement).checked
}
