<script setup lang="ts">
import { ref } from 'vue';
import Editor from 'primevue/editor';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';

const value = ref('');
const date = ref(new Date());
const title = ref('');
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-2">
      <div class="flex flex-col items-start">
        <label class="text-sm font-medium">Title</label>
        <InputText v-model="title" placeholder="Title" />
      </div>
      <div class="flex flex-col items-start">
        <label class="text-sm font-medium">Date</label>
        <DatePicker v-model="date" />
      </div>
    </div>
    <Editor v-model="value" editorStyle="height: 33vh" />
  </div>
</template>