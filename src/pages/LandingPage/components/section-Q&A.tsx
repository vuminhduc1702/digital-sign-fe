import { useRef, useState, useEffect } from 'react'
import Q_A from '~/assets/images/landingpage/Frame_427319126.png'
import PlusIconGroup5412 from '~/assets/images/landingpage/Group_5412.png'
import MinusIconGroup5411 from '~/assets/images/landingpage/Group_5411.png'
import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/Accordion'

export function QandA() {
  const { t } = useTranslation()

  const accordionRef_1 = useRef<HTMLDivElement | null>(null)
  const accordionRef_2 = useRef<HTMLDivElement | null>(null)
  const [isAccordionChange, setIsAccordionChange] = useState(false)
  const [isReRender, setIsReRender] = useState(false)
  const items = [
    {
      value: 'item-1',
      triggerText:
      t('landingpage_text:q_a.item_1.trigger'),
    contentText:
      t('landingpage_text:q_a.item_1.content'),
    },
    {
      value: 'item-2',
      triggerText:
        t('landingpage_text:q_a.item_2.trigger'),
      contentText:
        t('landingpage_text:q_a.item_2.content'),
    },
    {
      value: 'item-3',
      triggerText:
      t('landingpage_text:q_a.item_3.trigger'),
    contentText:
      t('landingpage_text:q_a.item_3.content'),
    },
    {
      value: 'item-4',
      triggerText:
      t('landingpage_text:q_a.item_4.trigger'),
    contentText:
      t('landingpage_text:q_a.item_4.content'),
    },
  ]
  
  useEffect(() => {
    setIsReRender(!isReRender)
  }, [isAccordionChange])
  return (
    <>
      <div
        className="flex h-fit justify-center bg-[#f9f9f9] bg-no-repeat pb-20"
        style={{ backgroundImage: `url(${Q_A})` }}
      >
        <div className="w-[1040px]">
          <div className="pb-[40px] pt-[60px] text-center text-[36px] leading-[18.91px] text-primary-400 max-sm:text-[24px] max-xs:text-[24px]">
            {t('landingpage:Q_A.question')}
          </div>
          <div className="flex justify-center max-lg:flex-col max-lg:items-center">
            <div className="xs2:w-3/4">
              <Accordion type="single" collapsible ref={accordionRef_1}>
                {items.map((item, idx) => (
                  <AccordionItem value={item.value} key={idx}>
                    <AccordionTrigger
                      onClick={() => {
                        setIsAccordionChange(prevState => !prevState)
                      }}
                      className="flex justify-start"
                    >
                      {accordionRef_1.current?.childNodes.item(idx).dataset
                        .state === 'closed' ? (
                        <>
                          <img src={PlusIconGroup5412} alt="" />
                        </>
                      ) : (
                        <>
                          <img src={MinusIconGroup5411} alt="" />
                        </>
                      )}
                      <div className="px-[10px] pt-[10px] text-left text-body-sm font-medium">
                        {item.triggerText}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>{item.contentText}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
