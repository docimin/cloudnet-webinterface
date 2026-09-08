import { TableCell, TableRow } from '@/components/ui/table'

export default function TableEmpty({
  colSpan,
  title,
  description
}: {
  colSpan: number
  title: string
  description: string
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-10 text-center">
        <div className="text-sm font-medium">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </TableCell>
    </TableRow>
  )
}
