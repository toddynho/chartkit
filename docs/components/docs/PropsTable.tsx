interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

interface PropsTableProps {
  props: PropDefinition[];
}

export function PropsTable({ props }: PropsTableProps) {
  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium">Prop</th>
            <th className="text-left py-3 px-4 font-medium">Type</th>
            <th className="text-left py-3 px-4 font-medium">Default</th>
            <th className="text-left py-3 px-4 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-border">
              <td className="py-3 px-4">
                <code className="text-sm font-mono text-accent">
                  {prop.name}
                  {prop.required && <span className="text-red-500">*</span>}
                </code>
              </td>
              <td className="py-3 px-4">
                <code className="text-sm font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {prop.type}
                </code>
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {prop.default ? (
                  <code className="text-sm font-mono">{prop.default}</code>
                ) : (
                  '-'
                )}
              </td>
              <td className="py-3 px-4 text-muted-foreground">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
