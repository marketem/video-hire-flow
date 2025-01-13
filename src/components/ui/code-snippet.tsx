import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "./button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

interface CodeSnippetProps {
  code: string
  language?: string
}

export function CodeSnippet({ code, language = "sql" }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)
  const { copyToClipboard } = useCopyToClipboard()

  const onCopy = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative">
      <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-4 top-4 hover:bg-muted-foreground/10"
        onClick={onCopy}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}