import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import robotoLight from '~/assets/fonts/Roboto-Light.ttf';
import robotoLightItalic from '~/assets/fonts/Roboto-LightItalic.ttf';
import LogoViettel from '~/assets/images/landingpage/Logo_Viettel.png';

import { t } from 'i18next';
import robotoBold from '~/assets/fonts/Roboto-Bold.ttf';
import { getVNDateFormat } from '~/utils/misc';
import { type Billing } from '../../types';

export function BillingPDF({ dataPdf }: { dataPdf?: Billing }) {
  // Register Font
  Font.register({
    family: "Roboto",
    src: robotoLight,
  });
  Font.register({
    family: "RobotoItalic",
    src: robotoLightItalic
  });
  Font.register({
    family: "RobotoBold",
    src: robotoBold
  });

  const styles = StyleSheet.create({
    page: {
      backgroundColor: 'white',
      padding: '16px',
      fontFamily: 'RobotoBold'
    },
    divider: {
      height: 1,
      backgroundColor: '#000',
      width: '100%'
    },
    title: {
      textAlign: 'center',
      fontSize: 20,
    },
    textNormal: {
      fontSize: 10,
    },
    content: {
      flexGrow: 1,
      paddingTop: 10
    },
    contentBox: {
      paddingBottom: 10
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      color: 'rgb(248 113 113)'
    },
    list: {
      paddingBottom: 20,
      fontFamily: 'Roboto',
      fontSize: 10,
      position: 'relative'
    },
    lineBottom: {
      height: 1,
      backgroundColor: '#e5e7eb',
      width: '100%'
    },
    headerTable: {
      flexDirection: 'row',
      backgroundColor: '#727272',
      color: 'white',
      padding: 8
    },
    status: {
      border: '1px',
      borderStyle: 'solid',
      borderColor: 'red',
      color: 'rgb(239 68 68)',
      position: 'absolute',
      transform: 'rotate(-30deg)',
      fontSize: 20,
      fontFamily: 'RobotoBold',
      top: 20,
      left: '30%',
      padding: '8px 16px'
    },
    flexRow: {
      flexDirection: 'row',
      paddingBottom: 10
    }
  });

  const valueStatus = () => {
    let result = ''
    if (dataPdf?.status) {
      switch (dataPdf?.status) {
        case 'Wait':
          result = 'Đang chờ thanh toán'
          break
        case 'Paid':
          result = 'Đã thanh toán'
          break
        case 'Expired':
          result = 'Hết hạn thanh toán'
          break
        case 'Init':
          result = 'Khởi tạo'
          break
        default:
          break
      }
    }
    return result
  }

  return (
    <Document title={`Hóa đơn dịch vụ ${dataPdf?.s_service_type}.pdf`}>
      <Page size="A3" style={styles.page}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 }}>
          <View style={{ width: '33%', alignItems: 'flex-start', display: 'flex', justifyContent: 'center' }}>
            <Image style={{ width: '70%' }} src={LogoViettel} />
          </View>
          <View style={{ width: '33%', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
            <Text>{t('billing:manage_bill.service_bill')}</Text>
          </View>
          <View style={{ width: '33%', alignItems: 'flex-end', display: 'flex', justifyContent: 'center' }}>
            <View style={{ width: '70%', textAlign: 'left', border: 1, fontSize: 12, padding: 8, gap: 4 }}>
              <Text>{t('billing:manage_bill.view_PDF.sign')}</Text>
              <Text>{t('billing:manage_bill.view_PDF.number')}: {dataPdf?.id}</Text>
              <Text>{t('billing:manage_bill.view_PDF.founding_date')}: {dataPdf?.date_begin ? getVNDateFormat({ date: dataPdf?.date_begin * 1000 }) : ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.content}>
          <View style={styles.contentBox}>
            <View style={styles.flexRow}>
              <Text style={[styles.textNormal, { flex: 1 }]}>
                {dataPdf?.v_name}
              </Text>
            </View>
            <View style={styles.flexRow}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.address')}</Text>
                <Text style={styles.textNormal}>{dataPdf?.v_address}</Text>
              </View>
            </View>
            <View style={styles.flexRow}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.tax_code')}</Text>
                <Text style={styles.textNormal}>{dataPdf?.v_tax_code}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.contentBox, { marginTop: 40 }]}>
            <View style={styles.flexRow}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.customer_name')}</Text>
                <Text style={styles.textNormal}>{dataPdf?.c_name}</Text>
              </View>
            </View>
            <View style={styles.flexRow}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.buying_name')}</Text>
                <Text style={styles.textNormal}>{' '}</Text>
              </View>
            </View>
            <View style={styles.flexRow}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.tax_code')}</Text>
                <Text style={styles.textNormal}>{''}</Text>
              </View>
            </View>
            <View style={styles.flexRow}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.address')}</Text>
                <Text style={styles.textNormal}>{dataPdf?.c_address}</Text>
              </View>
            </View>
            <View style={styles.flexRow}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.payment_form')}</Text>
              </View>
            </View>
          </View>
          <View style={styles.list}>
            <View style={styles.headerTable}>
              <View style={{ width: '10%' }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.order')}</Text>
              </View>
              <View style={{ width: '18%' }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.s_service_type')}</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.quantity')}</Text>
              </View>
              <View style={{ width: '18%' }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.pre_tax_cost')}</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.p_tax')}</Text>
              </View>
              <View style={{ width: '18%' }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.tax_cost')}</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.cost')}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', padding: 8, marginTop: 1 }}>
              <View style={{ width: '10%' }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.one')}</Text>
              </View>
              <View style={{ width: '18%' }}>
                <Text style={[styles.textNormal]}>{dataPdf?.s_service_type}</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={[styles.textNormal]}>{dataPdf?.quantity}</Text>
              </View>
              <View style={{ width: '18%' }}>
                <Text style={[styles.textNormal]}>{dataPdf?.pre_tax_cost}</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={[styles.textNormal]}>{dataPdf?.p_tax}%</Text>
              </View>
              <View style={{ width: '18%' }}>
                <Text style={[styles.textNormal]}>{dataPdf?.tax_cost}</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={[styles.textNormal]}>{dataPdf?.cost}</Text>
              </View>
            </View>
            <View style={styles.lineBottom} />
            <View style={{ flexDirection: 'row', padding: 8 }}>
              <View style={{ width: '88%', textAlign: 'right', paddingRight: 16 }}>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.total_payment')}</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={[styles.textNormal]}>{dataPdf?.cost}</Text>
              </View>
            </View>
            <View style={styles.lineBottom} />
            <View style={{ flexDirection: 'row', padding: 8 }}>
              <View>
                <Text style={[styles.textNormal]}>{t('billing:manage_bill.view_PDF.money_to_text')}</Text>
              </View>
              <View style={{ width: '12%' }}>
                <Text style={[styles.textNormal]}>{""}</Text>
              </View>
            </View>
            <View style={styles.lineBottom} />
            <View style={styles.status}>
              <Text>{valueStatus()}</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <View style={{ minWidth: 230 }}>
              <View style={styles.flexRow}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.sign_by')}</Text>
                  <Text style={styles.textNormal}>{dataPdf?.v_name}</Text>
                </View>
              </View>
              <View style={styles.flexRow}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.textNormal}>{t('billing:manage_bill.view_PDF.sign_date')}</Text>
                  <Text style={styles.textNormal}>{''}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
