import { useTranslations } from 'gt-tanstack-start'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface RawDocumentTabProps {
  value: string
  error: string | null
  onChange: (value: string) => void
  onApply: () => void
}

const RawDocumentTab = ({
  value,
  error,
  onChange,
  onApply
}: RawDocumentTabProps) => {
  const editorsT = useTranslations('Editors')

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {editorsT('rawDescription')}
      </p>
      <Label htmlFor="raw-json">{editorsT('rawLabel')}</Label>
      <Textarea
        name="json"
        id="raw-json"
        spellCheck={false}
        className="min-h-96 resize-y font-mono text-xs"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={onApply}>
          {editorsT('applyJson')}
        </Button>
      </div>
    </div>
  )
}

export default RawDocumentTab
