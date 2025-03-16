import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'
import loader from '@monaco-editor/loader'


export default defineComponent({
  name: 'MonacoEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    theme: {
      type: String,
      default: 'vs-dark'
    }
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const editorRef = ref<HTMLDivElement>()
    let editor: monaco.editor.IStandaloneCodeEditor | null = null

    onMounted(async () => {
      if (!editorRef.value) return

      await loader.init()
      
      
      editor = monaco.editor.create(editorRef.value, {
        value: props.value,
        language: 'sol',
        theme: props.theme,
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 2,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        autoClosingBrackets: 'always',
        autoClosingOvertype: 'always',
        autoClosingQuotes: 'always',
        autoIndent: 'full',
        renderValidationDecorations: 'on',
        hover: {
          enabled: true,
          delay: 300
        }
      })

      editor.onDidChangeModelContent(() => {
        const value = editor?.getValue()
        if (value !== undefined) {
          emit('update:value', value)
        }
      })

      watch(() => props.value, (newValue) => {
        if (editor && newValue !== editor.getValue()) {
          editor.setValue(newValue)
        }
      })
    })

    onBeforeUnmount(() => {
      if (editor) {
        editor.dispose()
      }
    })

    return () => (
      <div ref={editorRef} class="w-full h-full" />
    )
  }
}) 