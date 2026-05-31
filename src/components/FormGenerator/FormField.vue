<script setup lang="ts">
import type { FieldSchema } from '../../types/form-schema'
import { readCheckboxValue, readInputValue, useFormField } from './useFormField'

const props = defineProps<{
  field: FieldSchema
  fieldIndex: number
  modelValue: string | boolean
  error?: string
  touched?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | boolean]
  blur: []
}>()

const { id, errorId, showError, hint } = useFormField(props)
</script>

<template>
  <div
    class="field"
    :class="{
      'field--invalid': showError,
      'field--checkbox': field.type === 'checkbox',
    }"
  >
    <template v-if="field.type === 'checkbox'">
      <label class="field__check" :for="id">
        <input
          :id="id"
          type="checkbox"
          :checked="Boolean(modelValue)"
          :disabled="field.disabled"
          :aria-invalid="showError ? true : undefined"
          :aria-describedby="showError ? errorId : undefined"
          @change="emit('update:modelValue', readCheckboxValue($event))"
          @blur="emit('blur')"
        />
        <span class="field__check-text">
          {{ field.label }}
          <span v-if="field.required" class="field__req">*</span>
        </span>
      </label>
    </template>

    <template v-else>
      <label class="field__label" :for="id">
        {{ field.label }}
        <span v-if="field.required" class="field__req">*</span>
      </label>

      <select
        v-if="field.type === 'select'"
        :id="id"
        class="field__input field__input--select"
        :value="String(modelValue ?? '')"
        :disabled="field.disabled"
        :aria-invalid="showError ? true : undefined"
        :aria-describedby="showError ? errorId : undefined"
        @change="emit('update:modelValue', readInputValue($event))"
        @blur="emit('blur')"
      >
        <option value="" disabled>Выберите значение</option>
        <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <input
        v-else
        :id="id"
        class="field__input"
        :type="field.type"
        :value="String(modelValue ?? '')"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :readonly="field.readonly"
        :autocomplete="field.autocomplete"
        :aria-invalid="showError ? true : undefined"
        :aria-describedby="showError ? errorId : undefined"
        @input="emit('update:modelValue', readInputValue($event))"
        @blur="emit('blur')"
      />

      <span v-if="hint && !showError" class="field__hint">{{ hint }}</span>
    </template>

    <span v-if="showError" :id="errorId" class="field__error" role="alert">{{ error }}</span>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field--checkbox {
  padding: 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.field__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text);
}

.field__req {
  color: var(--danger);
  margin-left: 2px;
}

.field__input {
  width: 100%;
  height: 2.75rem;
  padding: 0 0.875rem;
  font-size: 0.9375rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--surface-2);
}

.field__input--select {
  appearance: none;
  padding-right: 2rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.875rem center;
  cursor: pointer;
}

.field__input:hover:not(:disabled) {
  border-color: #9ca3af;
}

.field__input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.field--invalid .field__input,
.field--invalid.field--checkbox {
  border-color: var(--danger);
}

.field--invalid.field--checkbox {
  background: var(--danger-bg);
}

.field__check {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
}

.field__check input {
  width: 1.125rem;
  height: 1.125rem;
  margin-top: 0.125rem;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}

.field__check-text {
  font-size: 0.9375rem;
  line-height: 1.45;
}

.field__hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.field__error {
  font-size: 0.8125rem;
  color: var(--danger);
}
</style>
