import { type MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
// import { useReactToPrint } from 'react-to-print'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import {
  Page,
  Document,
  StyleSheet,
  View,
  Text,
  PDFDownloadLink,
  Font,
} from '@react-pdf/renderer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { LuFileDown } from 'react-icons/lu'

interface ButtonProps {
  refComponent: MutableRefObject<HTMLElement> | MutableRefObject<null>
  rowSelection: { [key: string]: boolean }
  formatExcel?: Array<{ [key: string]: unknown }>
  pdfHeader?: string[]
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
  formatExcel = [],
  pdfHeader = [],
}: ButtonProps) {
  const { t } = useTranslation()

  const handleCSV = () => {
    if (formatExcel.length === 0) return
    const ws = XLSX.utils.json_to_sheet(formatExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, 'ExportedFile.csv')
  }

  const handleExcel = () => {
    if (formatExcel.length === 0) return
    /* create worksheet */
    const ws = XLSX.utils.json_to_sheet(formatExcel)
    /* create workbook and export */
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, 'ExportedFile.xlsx')
  }

  const PdfComponent = () => {
    if (formatExcel.length === 0) return null
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
            {formatExcel?.map((item, idx) => {
              return (
                <View style={styles.row} key={`r-${idx}`}>
                  {(Object.values(item) as string[]).map(ele => {
                    return (
                      <Text
                        style={[
                          styles.cell,
                          {
                            width: `100%/${pdfHeader.length}`,
                          },
                        ]}
                        key={`c-${idx}-${ele}`}
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
      <Popover>
        <PopoverTrigger className="hover:border-none">
          <Button
            size="sm"
            className="h-[36px] min-w-[60px] rounded-none bg-white text-black hover:opacity-80"
            startIcon={<LuFileDown />}
          >
            {t('table:export')}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[225px] rounded-none border-secondary-600 p-[8px]"
        >
          <div
            onClick={handleCSV}
            className="flex h-[38px] cursor-pointer items-center justify-start px-[8px] py-[16px] hover:bg-primary-100 hover:text-primary-400"
          >
            {Object.keys(rowSelection).length > 0
              ? `${t('table:export_csv')}: ${Object.keys(rowSelection).length}`
              : t('table:export_csv')}
          </div>
          <div
            onClick={handleExcel}
            className="flex h-[38px] cursor-pointer items-center justify-start px-[8px] py-[16px] hover:bg-primary-100 hover:text-primary-400"
          >
            {Object.keys(rowSelection).length > 0
              ? `${t('table:export_excel')}: ${Object.keys(rowSelection).length}`
              : t('table:export_excel')}
          </div>
          <div className="flex h-[38px] cursor-pointer items-center justify-start px-[8px] py-[16px] hover:bg-primary-100 hover:text-primary-400">
            {pdfHeader.length > 0 && (
              <PDFDownloadLink
                document={<PdfComponent />}
                fileName="InnowayTable.pdf"
              >
                {() => (
                  <div>
                    {Object.keys(rowSelection).length > 0
                      ? `${t('table:export_pdf')}: ${Object.keys(rowSelection).length}`
                      : t('table:export_pdf')}
                  </div>
                )}
              </PDFDownloadLink>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
