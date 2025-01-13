import { useToast } from "@/hooks/use-toast"

export function useCopyToClipboard() {
  const { toast } = useToast()

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (clipboardError) {
      console.error('Clipboard API failed, falling back to selection method', clipboardError)
      
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      textarea.style.top = '0'
      textarea.style.left = '0'
      
      document.body.appendChild(textarea)
      
      try {
        textarea.focus()
        textarea.select()
        
        const success = document.execCommand('copy')
        if (!success) {
          throw new Error('execCommand copy failed')
        }
        return true
      } catch (execError) {
        console.error('Error using execCommand:', execError)
        return false
      } finally {
        document.body.removeChild(textarea)
      }
    }
  }

  return { copyToClipboard }
}