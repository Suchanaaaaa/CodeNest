import Editor from "@monaco-editor/react";

export default function CodeEditor({
  language,
  code,
  setCode,
  theme = "dark",
}) {
  return (
    <div className="editor-container">
      <Editor
        height="100%"
        language={language}
        theme={theme === "dark" ? "vs-dark" : "light"}
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 15,
          minimap: { enabled: false },
          automaticLayout: true,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 4,
          padding: { top: 16 },
          cursorBlinking: "smooth",
          smoothScrolling: true,
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  );
}