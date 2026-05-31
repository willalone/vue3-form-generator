import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import FormField from './FormField.vue'
import FormGenerator from './FormGenerator.vue'
import type { FormData, FormSchema } from '../../types/form-schema'

const fullSchema: FormSchema = {
  fields: [
    { type: 'text', label: 'Имя', model: 'name', required: true },
    { type: 'email', label: 'Email', model: 'email', required: true },
    {
      type: 'password',
      label: 'Пароль',
      model: 'password',
      required: true,
      minLength: 6,
      pattern: '^\\d+$',
    },
    {
      type: 'select',
      label: 'Роль',
      model: 'role',
      options: ['Админ', 'Пользователь'],
      required: true,
    },
    { type: 'checkbox', label: 'Согласие', model: 'terms', required: true },
  ],
}

const emptyData: FormData = {
  name: '',
  email: '',
  password: '',
  role: '',
  terms: false,
}

const validData: FormData = {
  name: 'Иван',
  email: 'ivan@test.ru',
  password: '123456',
  role: 'Админ',
  terms: true,
}

function mountForm(data: FormData = { ...emptyData }) {
  const formData = ref<FormData>(data)
  let wrapper!: ReturnType<typeof mount>

  wrapper = mount(FormGenerator, {
    props: {
      schema: fullSchema,
      modelValue: formData.value,
      'onUpdate:modelValue': (value: FormData) => {
        formData.value = value
        wrapper?.setProps({ modelValue: value })
      },
    },
  })

  return { wrapper, formData }
}

describe('FormGenerator — инициализация', () => {
  it('дополняет пустой modelValue ключами из схемы', async () => {
    const formData = ref<FormData>({})

    mount(FormGenerator, {
      props: {
        schema: fullSchema,
        modelValue: formData.value,
        'onUpdate:modelValue': (value: FormData) => {
          formData.value = value
        },
      },
    })

    await nextTick()

    expect(formData.value).toEqual({
      name: '',
      email: '',
      password: '',
      role: '',
      terms: false,
    })
  })

  it('checkbox unchecked при пустом modelValue', async () => {
    const formData = ref<FormData>({})

    const wrapper = mount(FormGenerator, {
      props: {
        schema: fullSchema,
        modelValue: formData.value,
        'onUpdate:modelValue': (value: FormData) => {
          formData.value = value
        },
      },
    })

    await nextTick()
    expect((wrapper.find('#field-terms-4').element as HTMLInputElement).checked).toBe(false)
  })
})

describe('FormGenerator — рендер', () => {
  it('все 5 типов полей', () => {
    const { wrapper } = mountForm()

    expect(wrapper.find('#field-name-0').attributes('type')).toBe('text')
    expect(wrapper.find('#field-email-1').attributes('type')).toBe('email')
    expect(wrapper.find('#field-password-2').attributes('type')).toBe('password')
    expect(wrapper.find('#field-role-3').element.tagName).toBe('SELECT')
    expect(wrapper.find('#field-terms-4').attributes('type')).toBe('checkbox')
  })
})

describe('FormGenerator — v-model', () => {
  it('text input', async () => {
    const { wrapper, formData } = mountForm()
    await wrapper.find('#field-name-0').setValue('Пётр')
    expect(formData.value.name).toBe('Пётр')
  })

  it('select', async () => {
    const { wrapper, formData } = mountForm()
    await wrapper.find('#field-role-3').setValue('Пользователь')
    expect(formData.value.role).toBe('Пользователь')
  })

  it('checkbox', async () => {
    const { wrapper, formData } = mountForm()
    await wrapper.find('#field-terms-4').setValue(true)
    expect(formData.value.terms).toBe(true)
  })

  it('эмитит update:modelValue при изменении поля', async () => {
    const wrapper = mount(FormGenerator, {
      props: {
        schema: fullSchema,
        modelValue: { ...emptyData },
      },
    })

    await wrapper.find('#field-name-0').setValue('Test')

    const updates = wrapper.emitted('update:modelValue')
    expect(updates?.length).toBeGreaterThan(0)
    expect(updates?.at(-1)?.[0]).toMatchObject({ name: 'Test' })
  })

  it('синхронизирует v-model с внешним ref', async () => {
    const externalData = ref<FormData>({})
    let wrapper!: ReturnType<typeof mount>

    wrapper = mount(FormGenerator, {
      props: {
        schema: fullSchema,
        modelValue: externalData.value,
        'onUpdate:modelValue': (value: FormData) => {
          externalData.value = value
          wrapper?.setProps({ modelValue: value })
        },
      },
    })

    await nextTick()
    await wrapper.find('#field-name-0').setValue('Анна')
    await nextTick()

    expect(externalData.value.name).toBe('Анна')
  })
})

describe('FormGenerator — валидация', () => {
  it('ошибки после submit', async () => {
    const { wrapper } = mountForm({
      ...emptyData,
      email: 'not-valid',
    })
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Обязательное поле')
    expect(wrapper.text()).toContain('Неверный email')
    expect(wrapper.text()).toContain('Необходимо подтвердить')
  })

  it('pattern на password', async () => {
    const { wrapper } = mountForm({
      ...emptyData,
      password: 'abcdef',
      email: 'a@b.ru',
      name: 'Test',
      role: 'Админ',
      terms: true,
    })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Неверный формат')
  })

  it('ошибка после blur на required поле', async () => {
    const { wrapper } = mountForm()
    await wrapper.find('#field-name-0').trigger('blur')
    expect(wrapper.text()).toContain('Обязательное поле')
  })

  it('ошибка исчезает после исправления значения', async () => {
    const { wrapper } = mountForm()
    const nameField = () => wrapper.find('#field-name-0').element.closest('.field')!

    await wrapper.find('#field-name-0').trigger('blur')
    expect(nameField().textContent).toContain('Обязательное поле')

    await wrapper.find('#field-name-0').setValue('Иван')
    await nextTick()
    expect(nameField().textContent).not.toContain('Обязательное поле')
  })

  it('required checkbox блокирует submit без согласия', async () => {
    const { wrapper } = mountForm({
      ...validData,
      terms: false,
    })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Необходимо подтвердить')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('submit с валидными данными', async () => {
    const { wrapper } = mountForm({ ...validData })
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual(validData)
  })

  it('submit не вызывается если форма невалидна', async () => {
    const { wrapper } = mountForm()
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})

describe('FormField', () => {
  it('select — options из схемы', () => {
    const wrapper = mount(FormField, {
      props: {
        field: fullSchema.fields[3],
        fieldIndex: 3,
        modelValue: '',
      },
    })

    const options = wrapper.findAll('option').map((o) => o.text())
    expect(options).toContain('Админ')
    expect(options).toContain('Пользователь')
  })

  it('показывает hint для minLength', () => {
    const wrapper = mount(FormField, {
      props: {
        field: fullSchema.fields[2],
        fieldIndex: 2,
        modelValue: '',
      },
    })

    expect(wrapper.text()).toContain('мин. 6 симв.')
  })
})
