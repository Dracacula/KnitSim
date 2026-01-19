import { ref } from "vue";
import { defineStore } from "pinia";
import { EditorView } from "codemirror";

import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useEditorStateStore } from "./editorState";

export const useEditorStore = defineStore("editor", () => {
  const sharedState = useEditorStateStore();
  const code = ref("");
  const view = ref(null as EditorView | null);
  const div = ref(null as HTMLElement | null);

  const setupEditor = () => {
    if (div.value) {
      if (view.value) {
        view.value.destroy();
      }
      console.log("Setting up editor", div.value);
      view.value = new EditorView({
        state: EditorState.create({
          doc: code.value,
          extensions: [
            basicSetup,
            javascript(),
            EditorView.updateListener.of((v) => {
              const newCode = v.state.doc.toString();
              code.value = newCode;
              sharedState.setCode(newCode, "code");
            }),
          ],
        }),
        parent: div.value,
      });
    }
  };

  const setViewFromDiv = (d: HTMLElement) => {
    div.value = d;
    setupEditor();
  };

  const setCode = (new_val: string) => {
    code.value = new_val;
    setupEditor();
  };

  const updateFromSharedCode = (newCode: string) => {
    code.value = newCode;
    if (view.value) {
      view.value.dispatch({
        changes: {
          from: 0,
          to: view.value.state.doc.length,
          insert: newCode,
        },
      });
    }
  };

  return { view, setCode, setViewFromDiv, code, updateFromSharedCode };
});
