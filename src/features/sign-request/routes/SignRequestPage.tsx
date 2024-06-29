import TitleBar from "@/components/Head/TitleBar";
import { ContentLayout } from "@/layout/ContentLayout";
import { useTranslation } from "react-i18next";
import { SignRequestTable } from "../components/SignRequestTable";

export function SignRequestPage() {
    const {t} = useTranslation()
    return (
        <div>
            <ContentLayout title={t('sidebar:sign_request')}>
                <div>
                    <TitleBar title={t('sign_request:title')}/>
                    <SignRequestTable />
                </div>
            </ContentLayout>
        </div>
    )
}