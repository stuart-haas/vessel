<script setup lang="ts">
import Toast from 'primevue/toast';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Editor from './Editor.vue';
import axios from 'axios';
import { ref, onMounted } from 'vue';

const bibleVersions = ref([]);
const selectedBible = ref(null);
const settingsDialogVisible = ref(false);
const journalDialogVisible = ref(false);

onMounted(async () => {
  const { data } = await axios.get('/api/bibles');
  bibleVersions.value = data;
});
</script>

<template>
  <div :style="{ backgroundImage: 'url(background.jpg)' }" class="h-screen w-screen bg-cover bg-center">
    <div class="h-full w-full bg-black/50 p-8">
      <div class="flex flex-col items-center justify-center h-full space-y-4">  
        <h1 class="text-white text-4xl font-bold font-serif">Vessel</h1>
        <p class="text-white text-xl font-semibold">Encouraging children of God to spend time in His presence daily.</p>
        <div class="w-full lg:w-1/2">
          <hr class="border-white" />
        </div>
        <p class="text-white text-xl"><i>"Your Word is a lamp to my feet and a light to my path."</i><br><b>Psalm 119:105</b></p>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <button class="bg-white rounded-lg p-4 flex items-center justify-center gap-2">
            <i class="pi pi-book text-black"></i>
            <p class="text-black text-xl font-semibold text-center">Read</p>
          </button>
          <button class="bg-white rounded-lg p-4 flex items-center justify-center gap-2">
            <i class="pi pi-volume-up text-black"></i>
            <p class="text-black text-xl font-semibold text-center">Listen</p>
          </button>
          <button class="bg-white rounded-lg p-4 flex items-center justify-center gap-2" @click="journalDialogVisible = true">
            <i class="pi pi-pencil text-black"></i>
            <p class="text-black text-xl font-semibold text-center">Journal</p>
          </button>
          <button class="bg-white rounded-lg p-4 flex items-center justify-center gap-2" @click="settingsDialogVisible = true">
            <i class="pi pi-cog text-black"></i>
            <p class="text-black text-xl font-semibold text-center">Settings</p>
          </button>
        </div>
      </div>
    </div>
  </div>
  <Dialog v-model:visible="journalDialogVisible" header="Journal" :style="{ width: '50vw' }">
    <div class="flex flex-col gap-4">
      <Editor />
      <div class="flex justify-end">
        <Button label="Save" icon="pi pi-save" @click="journalDialogVisible = false" />
      </div>
    </div>
  </Dialog>
  <Dialog v-model:visible="settingsDialogVisible" header="Settings" :style="{ width: '50vw' }">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col">
        <label for="bibleVersion">Bible Version</label>
        <Select v-if="bibleVersions && bibleVersions.length" v-model="selectedBible" :options="bibleVersions" :optionLabel="(item) => item.name + ' (' + item.description + ')'" optionValue="id" class="w-full" filter />
      </div>
      <div class="flex justify-end">
        <Button label="Save" @click="settingsDialogVisible = false" />
      </div>
    </div>
  </Dialog>
  <Toast />
</template>
