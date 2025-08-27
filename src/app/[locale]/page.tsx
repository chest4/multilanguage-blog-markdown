'use client';

import { useTranslations } from 'next-intl';
import PageLayout from '../../components/PageLayout';
import Accordion, { AccordionItem } from "@/components/UI/Accordion";
import ScrollSpyMenu from "@/components/UI/ScrollSpyMenu";

export default function IndexPage() {
	const t = useTranslations('IndexPage');
	const keys = ['yearsOfService', 'happyClients', 'partners'] as const;

	const items: AccordionItem[] = [
		{ id: 1, title: "Что такое Next.js?", content: <p>Next.js — это фреймворк для React.</p> },
		{ id: 2, title: "Как работает ISR?", content: <p>ISR позволяет обновлять страницы после сборки.</p> },
		{ id: 3, title: "Можно ли использовать Tailwind?", content: <p>Да, Tailwind отлично подходит для стилей.</p> },
	];

	const sections = [
		{ id: "section1", title: "Пункт 1", content: <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis quia suscipit veritatis, vero ipsa sunt, ipsum fugiat, animi iusto deserunt modi. Consequatur enim doloribus dicta eum natus, voluptatum harum facere dolorum quas adipisci repudiandae dolor, fugit atque numquam dignissimos, voluptatibus veniam quod quo incidunt. Laboriosam excepturi delectus consectetur explicabo sapiente.</p> },
		{ id: "section2", title: "Пункт 2", content: <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis quia suscipit veritatis, vero ipsa sunt, ipsum fugiat, animi iusto deserunt modi. Consequatur enim doloribus dicta eum natus, voluptatum harum facere dolorum quas adipisci repudiandae dolor, fugit atque numquam dignissimos, voluptatibus veniam quod quo incidunt. Laboriosam excepturi delectus consectetur explicabo sapiente.</p> },
		{ id: "section3", title: "Пункт 3", content: <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis quia suscipit veritatis, vero ipsa sunt, ipsum fugiat, animi iusto deserunt modi. Consequatur enim doloribus dicta eum natus, voluptatum harum facere dolorum quas adipisci repudiandae dolor, fugit atque numquam dignissimos, voluptatibus veniam quod quo incidunt. Laboriosam excepturi delectus consectetur explicabo sapiente.</p> },
		{ id: "section4", title: "Пункт 4", content: <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis quia suscipit veritatis, vero ipsa sunt, ipsum fugiat, animi iusto deserunt modi. Consequatur enim doloribus dicta eum natus, voluptatum harum facere dolorum quas adipisci repudiandae dolor, fugit atque numquam dignissimos, voluptatibus veniam quod quo incidunt. Laboriosam excepturi delectus consectetur explicabo sapiente.</p> },
	];

	return (
		<PageLayout title={t('title')}>

			<p>
				{t('dog')}
			</p>

			<Accordion
				items={items}
				defaultOpenIndexes={[2]} // открываем первый элемент по умолчанию
				allowMultipleOpen={true} // можно открыть несколько
			/>

			<ScrollSpyMenu sections={sections} />

			{keys.map((key) => (
				<li key={key}>
					<h2>{t(`${key}.title`)}</h2>
					<p>{t(`${key}.value`)}</p>
				</li>
			))}

		</PageLayout>

	);
}
