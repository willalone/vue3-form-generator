import type { FieldSchema, FormData, FormSchema } from '../types/form-schema'

export function getFieldValue(data: FormData, field: FieldSchema): string | boolean {
  if (!(field.model in data)) {
    return field.type === 'checkbox' ? false : ''
  }

  const value = data[field.model]

  if (field.type === 'checkbox') {
    return value === true
  }

  return typeof value === 'string' ? value : ''
}

export function validateField(field: FieldSchema, data: FormData): string | null {
  const value = getFieldValue(data, field)

  if (field.required) {
    if (field.type === 'checkbox') {
      if (value !== true) {
        return 'Необходимо подтвердить'
      }
    } else if (typeof value === 'string' && value.trim() === '') {
      return 'Обязательное поле'
    }
  }

  if (typeof value === 'string' && value.length > 0) {
    if (field.minLength !== undefined && field.minLength > 0 && value.length < field.minLength) {
      return `Минимум ${field.minLength} символов`
    }

    if (field.pattern) {
      try {
        if (!new RegExp(field.pattern).test(value)) {
          return 'Неверный формат'
        }
      } catch {
        return 'Неверный формат'
      }
    }

    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Неверный email'
    }
  }

  return null
}

export function validateForm(fields: FieldSchema[], data: FormData): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const error = validateField(field, data)
    if (error) {
      errors[field.model] = error
    }
  }

  return errors
}

export function createInitialFormData(fields: FieldSchema[], source: FormData = {}): FormData {
  const data: FormData = { ...source }

  for (const field of fields) {
    if (field.model in data) {
      continue
    }

    data[field.model] = field.type === 'checkbox' ? false : ''
  }

  return data
}

export function assertValidSchema(schema: FormSchema): void {
  const models = new Set<string>()

  if (!Array.isArray(schema.fields) || schema.fields.length === 0) {
    throw new Error('FormSchema: fields must be a non-empty array')
  }

  for (const field of schema.fields) {
    if (!field.type || !field.label || !field.model) {
      throw new Error('FormSchema: each field requires type, label and model')
    }

    if (models.has(field.model)) {
      throw new Error(`FormSchema: duplicate model "${field.model}"`)
    }
    models.add(field.model)

    if (field.type === 'select' && (!field.options || field.options.length === 0)) {
      throw new Error(`FormSchema: select "${field.model}" requires options`)
    }
  }
}

export function syncFormData(fields: FieldSchema[], current: FormData): FormData {
  return createInitialFormData(fields, current)
}
