import { NewSelectDropdown } from '@/components/Form/NewSelectDropdown'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export function SelectCertificate() {
  const { t } = useTranslation()
  const form = useForm()
  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="certificate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        className="focus:border-none focus:outline-none"
                        variant="outline"
                      >
                        CHỨNG THƯ SỐ 1
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <NewSelectDropdown />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
