<script setup lang="ts">
import { ref } from 'vue'
import FormGenerator from './components/FormGenerator/FormGenerator.vue'
import { demoFormSchema } from './demoFormSchema'
import type { FormData } from './types/form-schema'

const formSchema = demoFormSchema
const formData = ref<FormData>({})
const submitted = ref<FormData | null>(null)

function onSubmit(data: FormData) {
  submitted.value = data
  console.log('submit:', data)
}
</script>

<template>
  <div class="page">
    <header class="page__head">
      <h1>Form Generator</h1>
      <p>Форма из JSON-схемы · данные в <code>v-model</code></p>
    </header>

    <div class="page__grid">
      <section class="card">
        <h2>Регистрация</h2>
        <FormGenerator v-model="formData" :schema="formSchema" @submit="onSubmit" />
        <p v-if="submitted" class="card__ok">
          Отправлено: {{ submitted.name }}, {{ submitted.email }}
        </p>
      </section>

      <section class="card card--code">
        <h2>formData</h2>
        <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
}

.page__head {
  margin-bottom: 1.75rem;
}

.page__head h1 {
  margin: 0 0 0.375rem;
  font-size: 1.625rem;
  font-weight: 700;
}

.page__head p {
  margin: 0;
  color: var(--text-muted);
}

.page__grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.25rem;
  align-items: start;
}

.card {
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.card h2 {
  margin: 0 0 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.card--code pre {
  margin: 0;
  padding: 1rem;
  min-height: 280px;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #e5e7eb;
  background: #1f2937;
  border-radius: var(--radius);
  overflow-x: auto;
}

.card__ok {
  margin: 1rem 0 0;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--success);
  background: var(--success-bg);
  border-radius: var(--radius);
}

@media (max-width: 768px) {
  .page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
