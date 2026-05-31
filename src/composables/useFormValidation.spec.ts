import { describe, expect, it } from 'vitest'
import type { FieldSchema } from '../types/form-schema'
import {
  assertValidSchema,
  createInitialFormData,
  getFieldValue,
  validateField,
  validateForm,
} from './useFormValidation'

const textField: FieldSchema = {
  type: 'text',
  label: 'Имя',
  model: 'name',
  required: true,
  minLength: 2,
}

const emailField: FieldSchema = {
  type: 'email',
  label: 'Email',
  model: 'email',
  required: true,
}

const passwordField: FieldSchema = {
  type: 'password',
  label: 'Пароль',
  model: 'password',
  required: true,
  minLength: 6,
  pattern: '^(?=.*[A-Za-z])(?=.*\\d).+$',
}

const selectField: FieldSchema = {
  type: 'select',
  label: 'Роль',
  model: 'role',
  options: ['Админ', 'Пользователь'],
  required: true,
}

const checkboxField: FieldSchema = {
  type: 'checkbox',
  label: 'Согласие',
  model: 'terms',
  required: true,
}

const allFields = [textField, emailField, passwordField, selectField, checkboxField]

describe('getFieldValue', () => {
  it('text — пустая строка по умолчанию', () => {
    expect(getFieldValue({}, textField)).toBe('')
  })

  it('checkbox — false по умолчанию', () => {
    expect(getFieldValue({}, checkboxField)).toBe(false)
  })

  it('select — пустая строка по умолчанию', () => {
    expect(getFieldValue({}, selectField)).toBe('')
  })
})

describe('validateField — required', () => {
  it.each([
    ['text', textField, { name: '' }, 'Обязательное поле'],
    ['email', emailField, { email: '   ' }, 'Обязательное поле'],
    ['select', selectField, { role: '' }, 'Обязательное поле'],
    ['checkbox', checkboxField, { terms: false }, 'Необходимо подтвердить'],
  ] as const)(' %s', (_label, field, data, expected) => {
    expect(validateField(field, data)).toBe(expected)
  })

  it('checkbox — ключ отсутствует в объекте', () => {
    expect(validateField(checkboxField, {})).toBe('Необходимо подтвердить')
  })
})

describe('validateField — minLength', () => {
  it('text', () => {
    expect(validateField(textField, { name: 'A' })).toBe('Минимум 2 символов')
    expect(validateField(textField, { name: 'Alex' })).toBeNull()
  })

  it('password', () => {
    expect(validateField(passwordField, { password: '12345' })).toBe('Минимум 6 символов')
  })
})

describe('validateField — pattern', () => {
  it('не проходит без буквы и цифры', () => {
    expect(validateField(passwordField, { password: 'abcdef' })).toBe('Неверный формат')
    expect(validateField(passwordField, { password: '123456' })).toBe('Неверный формат')
  })

  it('проходит валидный пароль', () => {
    expect(validateField(passwordField, { password: 'abc123' })).toBeNull()
  })

  it('невалидный regex в схеме', () => {
    const field: FieldSchema = {
      type: 'text',
      label: 'Код',
      model: 'code',
      pattern: '[',
    }
    expect(validateField(field, { code: 'abc' })).toBe('Неверный формат')
  })

  it('pattern без required — проверяется только если есть значение', () => {
    const field: FieldSchema = {
      type: 'text',
      label: 'Код',
      model: 'code',
      pattern: '^\\d{3}$',
    }
    expect(validateField(field, { code: '' })).toBeNull()
    expect(validateField(field, { code: '12' })).toBe('Неверный формат')
    expect(validateField(field, { code: '123' })).toBeNull()
  })
})

describe('validateField — email', () => {
  it('некорректный формат', () => {
    expect(validateField(emailField, { email: 'not-email' })).toBe('Неверный email')
  })

  it('корректный формат', () => {
    expect(validateField(emailField, { email: 'user@example.com' })).toBeNull()
  })

  it('не required — пустое значение ок', () => {
    const optional: FieldSchema = { type: 'email', label: 'Email', model: 'email' }
    expect(validateField(optional, { email: '' })).toBeNull()
  })
})

describe('validateForm — все типы полей', () => {
  it('валидная форма', () => {
    expect(validateForm(allFields, {
      name: 'Alex',
      email: 'alex@mail.ru',
      password: 'abc123',
      role: 'Админ',
      terms: true,
    })).toEqual({})
  })

  it('ошибки по каждому полю', () => {
    expect(validateForm(allFields, {
      name: '',
      email: 'bad',
      password: '123',
      role: '',
      terms: false,
    })).toEqual({
      name: 'Обязательное поле',
      email: 'Неверный email',
      password: 'Минимум 6 символов',
      role: 'Обязательное поле',
      terms: 'Необходимо подтвердить',
    })
  })
})

describe('createInitialFormData', () => {
  it('дефолты для всех типов', () => {
    expect(createInitialFormData(allFields)).toEqual({
      name: '',
      email: '',
      password: '',
      role: '',
      terms: false,
    })
  })

  it('дополняет пустой объект', () => {
    expect(createInitialFormData(allFields, {})).toEqual({
      name: '',
      email: '',
      password: '',
      role: '',
      terms: false,
    })
  })

  it('не затирает уже заполненные значения', () => {
    expect(createInitialFormData(allFields, { name: 'Kate', terms: true })).toEqual({
      name: 'Kate',
      email: '',
      password: '',
      role: '',
      terms: true,
    })
  })
})

describe('assertValidSchema', () => {
  it('пропускает корректную схему', () => {
    expect(() => assertValidSchema({ fields: allFields })).not.toThrow()
  })

  it('select без options', () => {
    expect(() =>
      assertValidSchema({
        fields: [{ type: 'select', label: 'R', model: 'role', options: [] }],
      }),
    ).toThrow(/options/)
  })
})
