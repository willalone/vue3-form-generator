<script setup lang="ts">
import { computed, toRef } from 'vue'
import FormField from './FormField.vue'
import { useFormGenerator } from './useFormGenerator'
import type { FormData, FormSchema } from '../../types/form-schema'

const props = defineProps<{
  schema: FormSchema
  modelValue: FormData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormData]
  submit: [data: FormData]
}>()

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const {
  touched,
  submitAttempted,
  getFieldValue,
  updateField,
  markTouched,
  fieldError,
  handleSubmit,
  isValid,
  errors,
} = useFormGenerator(
  toRef(props, 'schema'),
  () => formData.value,
  (value) => {
    formData.value = value
  },
  (data) => emit('submit', data),
)

defineExpose({ isValid, errors, submit: handleSubmit })
</script>

<template>
  <form class="form" novalidate @submit.prevent="handleSubmit">
    <FormField
      v-for="(field, index) in schema.fields"
      :key="`${field.model}-${index}`"
      :field="field"
      :field-index="index"
      :model-value="getFieldValue(formData, field)"
      :error="fieldError(field.model)"
      :touched="Boolean(touched[field.model] || submitAttempted)"
      @update:model-value="updateField(field.model, $event)"
      @blur="markTouched(field.model)"
    />

    <button type="submit" class="form__submit">Отправить</button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form__submit {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fff;
  background: var(--primary);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
}

.form__submit:hover {
  background: var(--primary-hover);
}

.form__submit:active {
  transform: translateY(1px);
}
</style>
