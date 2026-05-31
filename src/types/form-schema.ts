export type TextFieldType = 'text' | 'email' | 'password'

export interface BaseFieldSchema {
  label: string
  model: string
  required?: boolean
  minLength?: number
  pattern?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  autocomplete?: string
}

export interface TextFieldSchema extends BaseFieldSchema {
  type: TextFieldType
}

export interface SelectFieldSchema extends BaseFieldSchema {
  type: 'select'
  options: string[]
}

export interface CheckboxFieldSchema extends BaseFieldSchema {
  type: 'checkbox'
}

export type FieldSchema = TextFieldSchema | SelectFieldSchema | CheckboxFieldSchema

export interface FormSchema {
  fields: FieldSchema[]
}

export type FormData = Record<string, string | boolean>
