import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { type MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import * as XLSX from 'xlsx'
import { Button } from '~/components/Button'

interface ButtonProps {
  refComponent: MutableRefObject<HTMLElement> | MutableRefObject<null>
  rowSelection: {}
  aoo: any
}

export function ExportTable({ refComponent, rowSelection, aoo }: ButtonProps) {
  const { t } = useTranslation()

  const handleExcel = () => {
    // const data = document.getElementById('table-ref')
    // if (data) {
    //   const excelFile = XLSX.utils.table_to_book(data, { sheet: 'sheet1' })
    //   XLSX.write(excelFile, { bookType: 'xlsx', bookSST: true, type: 'base64' })
    //   XLSX.writeFile(excelFile, 'ExportedFile' + '.xlsx')
    // }

    /* create worksheet */
    const ws = XLSX.utils.json_to_sheet(aoo)
    /* create workbook and export */
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, 'ExportedFile.xlsx')
  }

  const handlePdf = () => {
    refComponent.current &&
      html2canvas(refComponent.current).then(canvas => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF()
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const radio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * radio) / 2
        const imgY = 30
        pdf.addImage(
          imgData,
          'PNG',
          imgX,
          imgY,
          imgWidth * radio,
          imgHeight * radio,
        )
        pdf.save('InowayTable.pdf')
      })
  }

  const handlePrint = useReactToPrint({
    content: () => refComponent.current,
  })

  return (
    <div className="flex items-center gap-x-1">
      <Button
        className={`pointer-events-none rounded border-none opacity-50 ${
          Object.keys(rowSelection).length > 0 &&
          'pointer-events-auto opacity-100'
        }`}
        size="sm"
        onClick={handleExcel}
        variant="secondaryLight"
      >
        {Object.keys(rowSelection).length > 0
          ? `${t('table:excel')}: ${Object.keys(rowSelection).length}`
          : t('table:excel')}
      </Button>
      <Button
        className={`pointer-events-none rounded border-none opacity-50 ${
          Object.keys(rowSelection).length > 0 &&
          'pointer-events-auto opacity-100'
        }`}
        size="sm"
        onClick={handlePdf}
        variant="secondaryLight"
      >
        {Object.keys(rowSelection).length > 0
          ? `${t('table:pdf')}: ${Object.keys(rowSelection).length}`
          : t('table:pdf')}
      </Button>
      <Button
        className="rounded border-none"
        size="sm"
        onClick={handlePrint}
        variant="secondaryLight"
      >
        {t('table:print')}
      </Button>
    </div>
  )
}
