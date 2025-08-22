import { Metadata } from "next";
import { createTranslator } from "next-intl";
import PageLayout from "@/components/PageLayout";
import Form from "@/components/Form";

type Params = { params: { locale: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = params;
	const messages = (await import(`../../../../messages/${locale}.json`)).default;
	const t = createTranslator({ locale, messages });

	return {
		title: t("AboutPage.title"),
		description: t("AboutPage.description"),
	};
}

export default function AboutPage() {
	return (
		<PageLayout >
			<p>Контент страницы «О нас»...</p>
			<Form />
		</PageLayout>
	);
}
