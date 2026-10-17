import { CopyButton } from "./CopyButton";

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="code">
      <div className="code-bar">
        <span>{label}</span>
        <CopyButton text={code} label="Copy code" />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
