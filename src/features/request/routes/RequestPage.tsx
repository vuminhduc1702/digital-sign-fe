import TitleBar from "@/components/Head/TitleBar"
import { ContentLayout } from "@/layout/ContentLayout"
import { useTranslation } from "react-i18next"
import { RequestTable } from "../components/RequestTable"

export function RequestPage() {
    const {t} = useTranslation()
    return (
        <div>
            <ContentLayout title={t('sidebar:request')}>
                <div>
                    <TitleBar title={t('request:title')}/>
                    <RequestTable />
                </div>
            </ContentLayout>
        </div>
    )
}