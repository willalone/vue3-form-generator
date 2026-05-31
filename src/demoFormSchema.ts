import type { FormSchema } from './types/form-schema'

/** Схема из тестового задания */
export const demoFormSchema: FormSchema = {
  fields: [
    { type: 'text', label: 'Имя', model: 'name', required: true, placeholder: 'Введите имя' },
    { type: 'email', label: 'Email', model: 'email', required: true, placeholder: 'mail@example.com' },
    { type: 'password', label: 'Пароль', model: 'password', required: true, minLength: 6 },
    {
      type: 'select',
      label: 'Роль',
      model: 'role',
      options: ['Админ', 'Пользователь'],
      required: true,
    },
    { type: 'checkbox', label: 'Согласен с условиями', model: 'terms', required: true },
  ],
}
