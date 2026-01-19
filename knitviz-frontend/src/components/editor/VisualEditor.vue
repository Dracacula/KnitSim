<template>
  <div class="editor-container">
    <div class="blockly-section">
      <div id="blocklyContainer" class="blockly-container">
        <div id="blocklyDiv" class="blockly-editor"></div>
      </div>
    </div>

    <div class="action-buttons">
      <Btn @click="handleGeneratePattern" :btn_width="'16rem'">Generate Pattern</Btn>
      <Btn @click="store.serializeBlocksToJson" :btn_width="'16rem'">Export as Preset JSON</Btn>
      <Btn @click="store.resetBlockly" :btn_width="'8rem'">Reset</Btn>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useVisualEditorStore } from "@/stores/visualEditor";
import Btn from "@/components/ui/Btn.vue";

const store = useVisualEditorStore();

const emit = defineEmits<{
  (emit: "codeGenerated", code: string): void;
}>();

onMounted(() => {
  store.initBlockly('blocklyDiv');
});

const handleGeneratePattern = () => {
  const code = store.generatePatternFromBlockly();
  if (code) {
    emit("codeGenerated", code);
  }
};
</script>

<style lang="scss" scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.blockly-container {
  width: 100%;
  background: #fafafa;
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 360px;
  height: clamp(360px, 60vh, 720px);
  overflow: hidden;
}

.blockly-editor {
    width: 100%;
    height: 100%;
  }

.blockly-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 0;
  border-top: 2px solid #ddd;
  border-bottom: 2px solid #ddd;
}

input[type="range"] {
  cursor: pointer;
}

@media (max-width: 960px) {
  .action-buttons {
    justify-content: flex-start;
  }

  .blockly-container {
    height: clamp(320px, 55vh, 640px);
  }
}
</style>
