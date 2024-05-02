import { useTranslation } from 'react-i18next'
import { useSpinDelay } from 'spin-delay'
import { useRef, useState } from 'react'

import bg_pack_of_data from '@/assets/images/landingpage/bg_pack_of_data.png'
import { useGetPackofdata } from '../api/getPackofdata'
import { Button } from '@/components/Button'
import { Switch } from '@/components/Switch'
import { Checkbox } from '@/components/ui/checkbox'
import { useDisclosure } from '@/utils/hooks'
import { ComparePackOfData } from './compare-packofdata'
import { Spinner } from '@/components/Spinner'

import {
  Carousel,
  CarouselContent,
  CarouselDot,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/Carousel'
import Autoplay from 'embla-carousel-autoplay'

import { CheckboxCircleLine } from '@/components/SVGIcons'

export function SectionPackageData() {
  const { t } = useTranslation()

  const [offerTypePostPaid, setOfferTypePostPaid] = useState(false)
  const [payTypeNB, setPayTypeNB] = useState(false)
  const [category, setCategory] = useState('Tất cả')
  let offerType = offerTypePostPaid ? 'NB' : '4G'
  let payType = payTypeNB ? 'POST_PAID' : 'PRE_PAID'

  const { close, open, isOpen } = useDisclosure()

  const { data: PackofData, isLoading: isLoadingPackofData } =
    useGetPackofdata()
  const showSpinner = useSpinDelay(isLoadingPackofData, {
    delay: 150,
    minDuration: 300,
  })

  const categories = [
    t('landingpage:pack_of_data_M2M.categories.categories_1'),
    t('landingpage:pack_of_data_M2M.categories.categories_2'),
    t('landingpage:pack_of_data_M2M.categories.categories_3'),
    t('landingpage:pack_of_data_M2M.categories.categories_5'),
    t('landingpage:pack_of_data_M2M.categories.categories_6'),
    t('landingpage:pack_of_data_M2M.categories.categories_7'),
    t('landingpage:pack_of_data_M2M.categories.categories_8'),
    t('landingpage:pack_of_data_M2M.categories.categories_9'),
  ]
  const PackofDataRef = useRef(
    Array.isArray(PackofData?.data)
      ? PackofData?.data.map(item => ({ ...item, state: 'false' }))
      : [],
  )

  const updateItemStateByName = (name: string, state: string) => {
    if (PackofDataRef.current !== undefined) {
      const itemToUpdate = PackofDataRef.current.find(
        item => item.name === name,
      )
      if (itemToUpdate) {
        itemToUpdate.state = state
      }
    }
  }

  return (
    <>
      <div
        className="h-full bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bg_pack_of_data})` }}
      >
        <div className="h-5"></div>
        <div>
          <p className="py-2 pb-8 text-center text-[28px] font-bold text-[#EA0033]">
            {t('landingpage:pack_of_data_M2M.title')}
          </p>
          <div className="flex justify-center">
            <h3 className="px-[50px] text-center font-semibold leading-[43px] xs2:w-[360px] xs2:text-[30px] xs:w-[400px] xs:px-0 xl:w-[588px] xl:text-[45px] ">
              {t('landingpage:pack_of_data_M2M.variety')}
            </h3>
          </div>
          {isLoadingPackofData ? (
            <div className="flex h-full items-center justify-center">
              <Spinner showSpinner={showSpinner} size="xl" />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-center pt-5 max-lg:flex-col max-lg:items-center max-md:items-center max-md:py-8 xs2:gap-6 xs2:py-4 xs:gap-6 sm:gap-6 md:gap-6 lg:gap-6">
                <div className="flex items-center px-10 max-lg:px-2 ">
                  <p className="text-lg font-medium">
                    {t('landingpage:pack_of_data_M2M.plan')}
                  </p>
                  <p className="text-lg font-medium">
                    {t('landingpage:pack_of_data_M2M.4G')}
                  </p>
                  <Switch
                    className="mx-3"
                    onCheckedChange={checked => setOfferTypePostPaid(checked)}
                    // defaultChecked
                  />
                  <p className="text-lg font-medium">
                    {t('landingpage:pack_of_data_M2M.NB_IoT')}
                  </p>
                </div>
                <div className="flex items-center px-10 max-lg:px-2 max-md:py-5 xs2:py-0">
                  <p className="text-lg font-medium">
                    {t('landingpage:pack_of_data_M2M.subscription')}
                  </p>
                  <p className="text-lg font-medium">
                    {t('landingpage:pack_of_data_M2M.prepaid')}
                  </p>
                  <Switch
                    className="mx-3"
                    onCheckedChange={checked => setPayTypeNB(checked)}
                    // defaultChecked
                  />
                  <p className="text-lg font-medium">
                    {t('landingpage:pack_of_data_M2M.postpaid')}
                  </p>
                </div>
                <div>
                  <Button
                    type="button"
                    className="rounded-r-lg rounded-tl-lg border border-primary-400 bg-white text-primary-400 hover:-translate-y-px hover:opacity-100 hover:shadow-xl max-md:mt-5 xs2:mt-0"
                    variant="primary"
                    onClick={open}
                  >
                    {t('landingpage:pack_of_data_M2M.compare')}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <div className="flex w-2/3 flex-wrap border-b border-solid">
                  {categories.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCategory(categories[idx])}
                      className={`flex cursor-pointer items-center justify-center px-2 py-1 text-base tracking-wider hover:text-primary-400 ${
                        category === categories[idx]
                          ? 'bg-white text-primary-400'
                          : ''
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex w-full justify-center">
                <div className="w-[1200px] pt-[50px] xs2:w-[280px] xs:w-[300px] sm:w-[320px] md:w-[600px] lg:w-[900px] xl:w-[1200px]">
                  <Carousel
                    opts={{
                      align: 'start',
                      loop: true,
                    }}
                    plugins={[
                      Autoplay({
                        delay: 5000,
                      }),
                    ]}
                  >
                    <CarouselContent>
                      {Array.isArray(PackofData?.data) &&
                        PackofData?.data
                          .filter(item =>
                            category !== 'Tất cả'
                              ? item.offerType === offerType &&
                                item.payType === payType &&
                                item.categoryName === category
                              : item.offerType === offerType &&
                                item.payType === payType,
                          )
                          .map(item => (
                            <CarouselItem className="basis-1/4 ">
                              <div className="w-60 rounded-lg shadow-md">
                                <div className="flex justify-center rounded-t-lg bg-primary-400 py-2 text-center text-xl font-medium text-white">
                                  <Checkbox
                                    defaultChecked={
                                      PackofDataRef.current?.find(
                                        item_ => item_.name === item.name,
                                      )?.state === 'true'
                                        ? true
                                        : false
                                    }
                                    key={item.name}
                                    onClick={event => {
                                      const ariaCheckedPrevValue =
                                        event.currentTarget.getAttribute(
                                          'aria-checked',
                                        )
                                      const ariaCheckedCurrentValue =
                                        ariaCheckedPrevValue === 'true'
                                          ? 'false'
                                          : 'true'
                                      if (ariaCheckedPrevValue != null) {
                                        updateItemStateByName(
                                          item.name,
                                          ariaCheckedCurrentValue,
                                        )
                                      }
                                    }}
                                    className={`mr-4 bg-white data-[state=checked]:bg-white data-[state=checked]:text-primary-400`}
                                  />
                                  {item.name}
                                </div>
                                <div className="rounded-b-lg bg-white">
                                  <div className="py-2 pb-4 text-center text-lg font-medium">
                                    {item.fee}
                                  </div>
                                  <div className="h-60 px-2">
                                    <div className="mb-[-8px]">
                                      <CheckboxCircleLine
                                        width={25}
                                        height={25}
                                        viewBox="0 0 25 25"
                                      ></CheckboxCircleLine>
                                      <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                                        {item.discountPromotionData}
                                      </p>
                                    </div>
                                    <div className="mb-[-8px]">
                                      <CheckboxCircleLine
                                        width={25}
                                        height={25}
                                        viewBox="0 0 25 25"
                                      ></CheckboxCircleLine>
                                      <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                                        {t(
                                          'landingpage:pack_of_data_M2M.monthlyFee',
                                        )}
                                      </p>
                                    </div>
                                    <div className="mb-[-8px]">
                                      <CheckboxCircleLine
                                        width={25}
                                        height={25}
                                        viewBox="0 0 25 25"
                                      ></CheckboxCircleLine>
                                      <p className="relative top-[-25px] pl-[30px] text-[16px] leading-[20.8px] text-black">
                                        {t(
                                          'landingpage:pack_of_data_M2M.offerCode',
                                        )}
                                        {item.offerCode}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                    <CarouselDot />
                  </Carousel>
                </div>
              </div>
            </div>
          )}
        </div>
        {isOpen ? (
          <ComparePackOfData
            listPackofData={PackofDataRef.current?.filter(
              item => item.state === 'true',
            )}
            close={close}
            isOpen={isOpen}
          />
        ) : null}
        <div className="h-5"></div>
      </div>
    </>
  )
}
