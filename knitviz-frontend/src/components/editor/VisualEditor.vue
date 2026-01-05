<template>
  <div class="editor-container">
    <div class="blockly-section">
      <div class="blockly-container">
        <div id="blocklyDiv" class="blockly-editor"></div>
      </div>
    </div>

    <div class="action-buttons">
      <Btn @click="generatePatternFromBlockly" :btn_width="'16rem'">Generate Pattern</Btn>
      <Btn @click="resetBlockly" :btn_width="'8rem'">Reset</Btn>
    </div>

    <div v-if="generatedCode" class="code-output">
      <label>Generated Code</label>
      <pre>{{ generatedCode }}</pre>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { KnitGraph } from "@/knitgraph";
import Btn from "@/components/ui/Btn.vue";

// Import Blockly core.
import * as Blockly from 'blockly/core';
// Import the default blocks.
import * as libraryBlocks from 'blockly/blocks';
// Import a generator.
import { javascriptGenerator } from 'blockly/javascript';
import { colourBlend } from '@blockly/field-colour';
// Import custom knitting blocks (optional - add your custom blocks to knitBlocks.ts)
import { registerCustomBlocks } from './knitBlocks';

export interface ToolBoxContent {
  kind: string;
  name?: string;

  contents?: (ToolBoxContent | { kind: string; type: string; text?: string })[];
}

let blocklyWorkspace: Blockly.WorkspaceSvg | null = null;
const generatedCode = ref<string>("");
  
// Initialize Blockly with color picker support.
colourBlend.installBlock({
  javascript: javascriptGenerator
})

onMounted(() => {
  // Standard knitting block definitions
  const definitions = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    type: 'knit_cast_on',
    message0: 'Cast on %1 stitches (%2)',
    args0: [
      {
        type: 'field_number',
        name: 'STITCHES',
        value: 24,
      },
      {
        type: 'field_dropdown',
        name: 'MODE',
        options: [
          ['Flat', 'FLAT'],
          ['Round', 'ROUND'],
        ],
      }
    ],
    nextStatement: null,
    colour: 230,
    tooltip: 'Start a project with stitch count and flat/round mode',
  },
  {
    type: 'knit_row',
    message0: 'Row',
    message1: 'do %1',
    message2: 'then end row',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: 'Make a row by grouping stitches together',
  },
  {
    type: 'knit_repeat',
    message0: 'Repeat %1 times',
    message1: 'do %1',
    args0: [{ type: 'field_number', name: 'TIMES', value: 3, min: 1 }],
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: 'Repeat the inner actions N times',
  },
  {
    type: 'knit_knit_color',
    message0: 'Knit %1 stitches in %2',
    args0: [
      { type: 'field_number', name: 'STITCHES', value: 4 },
      { type: 'field_colour', name: 'COLOR', colour: '#0011ff' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 190,
    tooltip: 'Knit N stitches using this color',
  },
  {
    type: 'knit_purl_color',
    message0: 'Purl %1 stitches in %2',
    args0: [
      { type: 'field_number', name: 'STITCHES', value: 4 },
      { type: 'field_colour', name: 'COLOR', colour: '#8888ff' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 190,
    tooltip: 'Purl N stitches using this color',
  },
  {
    type: 'knit_garter',
    message0: 'Garter stitch %1 stitches for %2 rows',
    args0: [
      { type: 'field_number', name: 'STITCHES', value: 20 },
      { type: 'field_number', name: 'ROWS', value: 4 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 120,
    tooltip: 'All-knit rows for classic garter texture (auto ends rows)',
  },
  {
    type: 'knit_stockinette',
    message0: 'Stockinette %1 stitches for %2 rows',
    args0: [
      { type: 'field_number', name: 'STITCHES', value: 20 },
      { type: 'field_number', name: 'ROWS', value: 4 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 100,
    tooltip: 'Alternates knit/purl rows for smooth stockinette (auto ends rows)',
  },
  {
    type: 'knit_rib',
    message0: 'Rib K%1 P%2 repeat %3 for %4 rows',
    args0: [
      { type: 'field_number', name: 'K', value: 1 },
      { type: 'field_number', name: 'P', value: 1 },
      { type: 'field_number', name: 'REPEAT', value: 10 },
      { type: 'field_number', name: 'ROWS', value: 4 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 80,
    tooltip: 'Builds K/P ribbing across the row for multiple rows (auto ends rows)',
  },
  {
    type: 'knit_color',
    message0: 'Set color %1 weight %2',
    args0: [
      {
        type: 'field_colour',
        name: 'COLOR',
        colour: '#0011ff',
      },
      {
        type: 'field_number',
        name: 'WEIGHT',
        value: 1.0,
        precision: 0.1,
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 185,
    tooltip: 'Change yarn color and weight before knitting more rows',
  },
  {
    type: 'knit_end_row',
    message0: 'End row',
    previousStatement: null,
    nextStatement: null,
    colour: 160,
    tooltip: 'Finish the current row; use after Knit row blocks',
  },
]);

  // Register custom pattern blocks from knitBlocks.ts (if any)
  const customBlocks = registerCustomBlocks();

  // Register the definitions.
  Blockly.common.defineBlocks(definitions);

  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Setup',
        contents: [
          { kind: 'label', text: 'Start your project here' },
          { kind: 'block', type: 'knit_cast_on' },
        ],
      },
      {
        kind: 'category',
        name: 'Manual Rows',
        contents: [
          { kind: 'label', text: 'Use these to build rows stitch-by-stitch' },
          { kind: 'block', type: 'knit_row' },
          { kind: 'block', type: 'knit_repeat' },
          { kind: 'block', type: 'knit_knit_color' },
          { kind: 'block', type: 'knit_purl_color' },
          { kind: 'block', type: 'knit_color' },
          { kind: 'block', type: 'knit_end_row' },
        ],
      },
      {
        kind: 'category',
        name: 'Patterns',
        contents: [
          { kind: 'label', text: 'Use these to create common stitch patterns' },
          { kind: 'block', type: 'knit_garter' },
          { kind: 'block', type: 'knit_stockinette' },
          { kind: 'block', type: 'knit_rib' },
        ],
      },
      ...customBlocks.map(block => ({
        kind: 'category',
        name: block.name || 'Custom',
        contents: block.contents
      })),
    ],
  };

  // Inject the workspace
  blocklyWorkspace = Blockly.inject('blocklyDiv', { 
    toolbox: toolbox,
    scrollbars: true,
    trashcan: true,
  }) as Blockly.WorkspaceSvg;

  // Define code generators for custom blocks
  javascriptGenerator.forBlock['knit_cast_on'] = function (block) {
    const stitches = block.getFieldValue('STITCHES');
    const mode = block.getFieldValue('MODE');
    const modeStr = mode === 'ROUND' ? 'round' : 'flat';
    return `state.cast_on(${stitches}, '${modeStr}');\n`;
  };

  javascriptGenerator.forBlock['knit_color'] = function (block) {
    const color = block.getFieldValue('COLOR');
    const weight = block.getFieldValue('WEIGHT');
    return `state.color('${color}', ${weight});\n`;
  };

  javascriptGenerator.forBlock['knit_knit_color'] = function (block) {
    const stitches = block.getFieldValue('STITCHES');
    const color = block.getFieldValue('COLOR');
    return `state.color('${color}', 1);\nstate.knit(${stitches}, 'KNIT');\n`;
  };

  javascriptGenerator.forBlock['knit_purl_color'] = function (block) {
    const stitches = block.getFieldValue('STITCHES');
    const color = block.getFieldValue('COLOR');
    return `state.color('${color}', 1);\nstate.knit(${stitches}, 'PURL');\n`;
  };

  javascriptGenerator.forBlock['knit_row'] = function (block) {
    const inner = javascriptGenerator.statementToCode(block, 'DO');
    return `${inner}state.end_row();\n`;
  };

  javascriptGenerator.forBlock['knit_repeat'] = function (block) {
    const times = block.getFieldValue('TIMES');
    const inner = javascriptGenerator.statementToCode(block, 'DO');
    return `for (let i = 0; i < ${times}; i++) {\n${inner}}\n`;
  };

  javascriptGenerator.forBlock['knit_garter'] = function (block) {
    const stitches = block.getFieldValue('STITCHES');
    const rows = block.getFieldValue('ROWS');
    return `for (let r = 0; r < ${rows}; r++) {\nstate.knit(${stitches}, 'KNIT');\nstate.end_row();}\n`;
  };

  javascriptGenerator.forBlock['knit_stockinette'] = function (block) {
    const stitches = block.getFieldValue('STITCHES');
    const rows = block.getFieldValue('ROWS');
    return `for (let r = 0; r < ${rows}; r++) {\nconst t = (r % 2 === 0) ? 'KNIT' : 'PURL';\nstate.knit(${stitches}, t);\nstate.end_row();}\n`;
  };

  javascriptGenerator.forBlock['knit_rib'] = function (block) {
    const k = block.getFieldValue('K');
    const p = block.getFieldValue('P');
    const repeat = block.getFieldValue('REPEAT');
    const rows = block.getFieldValue('ROWS');
    return `for (let r = 0; r < ${rows}; r++) {\nfor (let i = 0; i < ${repeat}; i++) { state.knit(${k}, 'KNIT'); state.knit(${p}, 'PURL'); }\nstate.end_row();}\n`;
  };

  javascriptGenerator.forBlock['knit_end_row'] = function () {
    return `state.end_row();\n`;
  };

  // Listen for changes (automatically generate code on change, maybe remove later when code gets too big)
  blocklyWorkspace.addChangeListener(() => {
    const code = javascriptGenerator.workspaceToCode(blocklyWorkspace!);
    console.log("Blockly code updated:", code);
    generateCodeFromBlockly();
  });

  console.log("Blockly workspace initialized.");
});

const emit = defineEmits<{
  (emit: "patternGenerated", graph: KnitGraph): void;
}>();

const generateCodeFromBlockly = () => {
  if (!blocklyWorkspace) return;
  
  var code = javascriptGenerator.workspaceToCode(blocklyWorkspace);

  // so that the generated code can be copied into the code editor directly
  code = code.replace(/state\./g, 'this.');

  generatedCode.value = code;
  console.log("Generated code from blocks:", code);
};

const generatePatternFromBlockly = () => {
  if (!blocklyWorkspace) return;
  
  const code = javascriptGenerator.workspaceToCode(blocklyWorkspace);
  
  const graph = new KnitGraph();
  const state = graph.state;
  
  try {
    const runner = new Function('state', code);
    runner(state);
    
    emit("patternGenerated", graph);
    console.log("Pattern generated successfully");
  } catch (error) {
    console.error("Error executing generated code:", error);
    alert("Error generating pattern. Check console for details.");
  }
};

const resetBlockly = () => {
  if (!blocklyWorkspace) return;
  blocklyWorkspace.clear();
  generatedCode.value = "";
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

.code-output {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;

  label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }

  pre {
    background-color: #fff;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    margin: 0;
  }
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
