<template>
  <div class="form-section">
    <label>Cast on Stiches:</label>
    <div class="control-row">
      <input type="range" v-model.number="params.castOn" min="5" max="100" step="2" />
      <input type="number" v-model.number="params.castOn" min="10" max="100" class="number-input" />
    </div>
  </div>

  <div class="form-section">
    <label>Number of Rows: </label>
    <div class="control-row">
      <input type="range" v-model.number="params.rows" min="5" step="2" />
      <input type="number" v-model.number="params.rows" min="10" class="number-input" />
    </div>
  </div>

  <div class="form-section">
    <label>Knitting Mode: </label>
    <div class="button-group">
      <Btn :toggleable="true" v-model="params.isRound" :btn_width="'8rem'">
        {{ params.isRound ? "Round" : "Flat" }}
      </Btn>
    </div>
  </div>

  <div class="form-section">
    <div class="color-picker">
      <label>Yarn Color:</label>
      <input type="color" v-model="params.color" />
      <input type="text" v-model="params.color" class="color-input" />
    </div>
  </div>

  <div class="action-buttons">
    <Btn @click="generatePattern" :btn_width="'12rem'">Generate</Btn>
    <Btn @click="resetParams" :btn_width="'8rem'">Reset</Btn>
  </div>
</template>

<script setup lang="ts">
import { KnitGraph, KnitMode } from "@/knitgraph";
import Btn from "@/components/ui/Btn.vue";
import { reactive } from "vue";

// TODO: Sync states between code editor and visual editor

const emit = defineEmits<{
  (emit: "patternGenerated", graph: KnitGraph): void;
}>();

const params = reactive({
  castOn: 24,
  rows: 12,
  isRound: false,
  color: "#0011ff",
  weight: 1.0,
});

const resetParams = () => {
  params.castOn = 24;
  params.rows = 12;
  params.isRound = false;
  params.color = "0011ff";
  params.weight = 1.0;
};

const generatePattern = () => {
  const graph = new KnitGraph();
  const state = graph.state;

  state.cast_on(params.castOn, params.isRound ? KnitMode.ROUND : KnitMode.FLAT);

  generateFlatPattern(state);

  emit("patternGenerated", graph);
};

const generateFlatPattern = (state: any) => {
  for (let row = 0; row < params.rows; row++) {
    state.color(params.color, params.weight);

    if (params.isRound) {
      state.knit(params.castOn, "KNIT");
    } else {
      state.knit(params.castOn, row % 2 === 0 ? "KNIT" : "PURL");
    }

    state.end_row();
  }
};
</script>

<style lang="scss" scoped>
.form-selections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: #555;
    font-size: 0.95rem;
  }
}

.control-row {
  display: flex;
  gap: 1rem;
  align-items: center;

  input[type="range"] {
    flex: 1;
    min-width: 150px;
  }

  .number-input {
    width: 70px;
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
  }
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  label {
    min-width: 120px;
    font-weight: 500;
    color: #555;
  }

  input[type="color"] {
    width: 60px;
    height: 40px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }

  .color-input {
    width: 100px;
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.85rem;
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #ddd;
  flex-wrap: wrap;
}

input[type="range"] {
  cursor: pointer;
}
</style>
