import { computed, reactive, ref, watch, type Ref } from 'vue'
import {
  assertValidSchema,
  getFieldValue,
  syncFormData,
  validateForm,
} from '../../composables/useFormValidation'
import type { FormData, FormSchema } from '../../types/form-schema'

type ModelWriter = (value: FormData) => void

export function useFormGenerator(
  schema: Ref<FormSchema>,
  getModel: () => FormData,
  setModel: ModelWriter,
  emitSubmit: (data: FormData) => void,
) {
  const touched = reactive<Record<string, boolean>>({})
  const submitAttempted = ref(false)

  function ensureModelKeys() {
    assertValidSchema(schema.value)
    const next = syncFormData(schema.value.fields, getModel())

    if (JSON.stringify(next) !== JSON.stringify(getModel())) {
      setModel(next)
    }
  }

  watch(schema, ensureModelKeys, { immediate: true, deep: true })

  // если родитель асинхронно подставил данные — дополняем ключи из схемы
  watch(() => getModel(), ensureModelKeys, { deep: true })

  const errors = computed(() => validateForm(schema.value.fields, getModel()))
  const isValid = computed(() => Object.keys(errors.value).length === 0)

  function updateField(key: string, value: string | boolean) {
    setModel({ ...getModel(), [key]: value })
  }

  function markTouched(key: string) {
    touched[key] = true
  }

  function fieldError(key: string) {
    if (!touched[key] && !submitAttempted.value) return undefined
    return errors.value[key]
  }

  function handleSubmit() {
    submitAttempted.value = true
    schema.value.fields.forEach((f) => {
      touched[f.model] = true
    })

    if (isValid.value) {
      emitSubmit({ ...getModel() })
    }
  }

  return {
    touched,
    submitAttempted,
    getFieldValue,
    updateField,
    markTouched,
    fieldError,
    handleSubmit,
    isValid,
    errors,
  }
}
