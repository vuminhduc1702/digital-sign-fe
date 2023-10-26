import { useTranslation } from 'react-i18next'
import bg_pack_of_data from '~/assets/images/landingpage/bg_pack_of_data.png'
export function SectionPackageData() {
  const { t } = useTranslation()
  return (
    <>
      <div
        className="bg-no-repeat"
        style={{ backgroundImage: `url(${bg_pack_of_data})` }}
      >
        <div className="h-20"></div>
        <div>
          <p className="py-2 pb-8 text-center text-[28px] font-bold text-[#EA0033]">
            {t('landingpage:pack_of_data_M2M.title')}
          </p>
          <div className="flex justify-center">
            <h3 className="w-[588px] px-[50px] text-center text-[35px] leading-[43px]">
              {t('landingpage:pack_of_data_M2M.variety')}
            </h3>
          </div>
        </div>
        <div></div>
      </div>
    </>
  )
}
