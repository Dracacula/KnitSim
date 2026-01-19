import { defineStore } from "pinia";
import { ref } from "vue";

export const useEditorStateStore = defineStore("editorState", () => {
  const code = ref<string>("");
  
  const lastEditorUsed = ref<"code" | "visual" | "grid" | null>(null);

  const setCode = (newCode: string, editor: "code" | "visual" | "grid") => {
    code.value = newCode;
    lastEditorUsed.value = editor;
  };

  const getCode = () => 
    code.value;

  return {
    code,
    lastEditorUsed,
    setCode,
    getCode,
  };
});
