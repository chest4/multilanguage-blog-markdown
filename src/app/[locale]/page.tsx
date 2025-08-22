'use client';

import { useTranslations } from 'next-intl';
import PageLayout from '../../components/PageLayout';

export default function IndexPage() {
	const t = useTranslations('IndexPage');
	const keys = ['yearsOfService', 'happyClients', 'partners'] as const;

	return (
		<PageLayout title={t('title')}>

			<p>
				{t('dog')}
			</p>

			{keys.map((key) => (
				<li key={key}>
					<h2>{t(`${key}.title`)}</h2>
					<p>{t(`${key}.value`)}</p>
				</li>
			))}

		</PageLayout>

	);
}
