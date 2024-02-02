import html2canvas from 'html2canvas'
import { type MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import * as XLSX from 'xlsx'
import { Button } from '~/components/Button'
import {
  Page,
  Document,
  StyleSheet,
  View,
  Text,
  PDFDownloadLink,
  Font,
} from '@react-pdf/renderer'

interface ButtonProps {
  refComponent: MutableRefObject<HTMLElement> | MutableRefObject<null>
  rowSelection: {}
  aoo: any
  pdfHeader: string[]
}

// Register Font
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
})

const styles = StyleSheet.create({
  table: {
    fontSize: 12,
    fontFamily: 'Roboto',
  },
  tableContainer: {
    margin: 20,
  },
  header: {
    fontSize: 16,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  cell: {
    textAlign: 'center',
    border: '1px solid black',
  },
})

export function ExportTable({
  refComponent,
  rowSelection = {},
  aoo,
  pdfHeader = [],
}: ButtonProps) {
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
    // refComponent.current &&
    //   html2canvas(refComponent.current).then(canvas => {
    //     const imgData = canvas.toDataURL('image/png')
    //     const pdf = new jsPDF()
    //     const pdfWidth = pdf.internal.pageSize.getWidth()
    //     const pdfHeight = pdf.internal.pageSize.getHeight()
    //     const imgWidth = canvas.width
    //     const imgHeight = canvas.height
    //     const radio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    //     const imgX = (pdfWidth - imgWidth * radio) / 2
    //     const imgY = 30
    //     pdf.addImage(
    //       imgData,
    //       'PNG',
    //       imgX,
    //       imgY,
    //       imgWidth * radio,
    //       imgHeight * radio,
    //     )
    //     pdf.save('InnowayTable.pdf')
    //   })
    // ;<Document>
    //   <Page size="A4" style={styles.page}>
    //     <View style={styles.tableContainer}>
    //       <View style={styles.row} key="zzzz">
    //         <Text style={styles.description}>123</Text>
    //         <Text style={styles.xyz}>huy ne</Text>
    //       </View>
    //     </View>
    //   </Page>
    // </Document>
  }

  const handlePrint = useReactToPrint({
    content: () => refComponent.current,
  })

  const PdfComponent = () => {
    return (
      <Document>
        <Page size="A4" style={styles.table}>
          <View style={styles.tableContainer}>
            <View style={[styles.header, styles.row]} key="h1">
              {pdfHeader.map(item => {
                return (
                  <Text
                    style={[styles.cell, { width: `100%/${pdfHeader.length}` }]}
                  >
                    {item}
                  </Text>
                )
              })}
            </View>
            {aoo.map((item: any, idx: any) => {
              return (
                <View style={styles.row} key={`r-${idx}`}>
                  {Object.values(item).map((ele: any) => {
                    return (
                      <Text
                        style={[
                          styles.cell,
                          { width: `100%/${pdfHeader.length}` },
                        ]}
                      >
                        {ele}
                      </Text>
                    )
                  })}
                </View>
              )
            })}
          </View>
        </Page>
      </Document>
    )
  }

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
      <PDFDownloadLink document={<PdfComponent />} fileName="InnowayTable.pdf">
        {({ blob, url, loading, error }) => (
          <Button
            className={`pointer-events-none rounded border-none opacity-50 ${
              Object.keys(rowSelection).length > 0 &&
              'pointer-events-auto opacity-100'
            }`}
            size="sm"
            // onClick={handlePdf}
            variant="secondaryLight"
          >
            {Object.keys(rowSelection).length > 0
              ? `${t('table:pdf')}: ${Object.keys(rowSelection).length}`
              : t('table:pdf')}
          </Button>
        )}
      </PDFDownloadLink>
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
