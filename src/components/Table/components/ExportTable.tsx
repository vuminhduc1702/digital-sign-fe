import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { type MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import * as XLSX from 'xlsx'

import { Button } from '~/components/Button'

interface ButtonProps {
  refComponent: MutableRefObject<HTMLElement> | MutableRefObject<null>
}

export function ExportTable({ refComponent }: ButtonProps) {
  const { t } = useTranslation()

  const handleExcel = () => {
    const data = document.getElementById('table-ref')
    if (data) {
      const excelFile = XLSX.utils.table_to_book(data, { sheet: 'sheet1' })
      XLSX.write(excelFile, { bookType: 'xlsx', bookSST: true, type: 'base64' })
      XLSX.writeFile(excelFile, 'ExportedFile' + '.xlsx')
    }
  }

  const handlePdf = () => {
    refComponent.current &&
      html2canvas(refComponent.current).then(canvas => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF()
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeigt = canvas.height
        const radio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeigt)
        const imgX = (pdfWidth - imgWidth * radio) / 2
        const imgY = 30
        pdf.addImage(
          imgData,
          'PNG',
          imgX,
          imgY,
          imgWidth * radio,
          imgHeigt * radio,
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
        className="rounded border-none"
        size="sm"
        onClick={handleExcel}
        variant="secondaryLight"
      >
        {t('table:excel')}
      </Button>
      <Button
        className="rounded border-none"
        size="sm"
        onClick={handlePdf}
        variant="secondaryLight"
      >
        {t('table:pdf')}
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
