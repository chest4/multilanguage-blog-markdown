"use client"; // указываем, что компонент выполняется на клиенте (Next.js 13+)

// Импортируем хуки и утилиты из React и Next.js
import { useState, useEffect } from "react";
import { useLocale } from "next-intl"; // для мультиязычности (берём текущий язык из контекста)
import Link from "next/link"; // для ссылок внутри Next.js
import Image from "next/image"; // оптимизированная работа с картинками
import { WPPost, WPCategory } from "@/types/wp"; // типы постов и категорий
import SkeletonPost from "@/components/SkeletonPost"; // скелетон (заглушка при загрузке)

// Функция для загрузки постов с WordPress API
async function fetchPosts(page: number, perPage: number, category?: number): Promise<WPPost[]> {
	const url = new URL("https://chest4.tmweb.ru/wp-json/wp/v2/posts"); // URL API
	url.searchParams.set("_embed", ""); // добавляем медиаданные (картинки)
	url.searchParams.set("per_page", String(perPage)); // сколько постов за один запрос
	url.searchParams.set("page", String(page)); // номер страницы пагинации
	if (category) url.searchParams.set("categories", String(category)); // если выбрана категория → фильтруем по ней

	const res = await fetch(url.toString(), { cache: "no-store" }); // делаем запрос без кеша
	if (!res.ok) return []; // если ошибка → возвращаем пустой массив
	return res.json(); // возвращаем JSON-ответ (массив постов)
}

// Утилита для расчета времени чтения статьи
function getReadingTime(html: string): number {
	const text = html.replace(/<[^>]+>/g, ""); // убираем HTML-теги, оставляем только текст
	const words = text.trim().split(/\s+/).length; // считаем количество слов
	const minutes = Math.ceil(words / 200); // делим на среднюю скорость чтения (200 слов/мин)
	return minutes; // возвращаем количество минут
}

// Тип пропсов для компонента
type Props = {
	initialPosts: WPPost[]; // список постов, полученных на сервере
	categories: WPCategory[]; // список категорий (тоже с сервера)
};

export default function BlogClient({ initialPosts, categories }: Props) {
	const locale = useLocale(); // получаем текущий язык (например: ru, en)
	const perPage = 4; // количество постов на страницу

	// Состояния компонента
	const [posts, setPosts] = useState<WPPost[]>(initialPosts); // список текущих постов
	const [selectedCategory, setSelectedCategory] = useState<number | "all">("all"); // выбранная категория
	const [loading, setLoading] = useState(false); // загрузка постов
	const [loadingMore, setLoadingMore] = useState(false); // загрузка при "Показать ещё"
	const [page, setPage] = useState(1); // текущая страница пагинации
	const [hasMore, setHasMore] = useState(initialPosts.length === perPage); // есть ли ещё посты для подгрузки

	// Кеш для постов по категориям (чтобы не грузить повторно)
	const [cache, setCache] = useState<Record<string, WPPost[]>>({ all: initialPosts });

	// Функция загрузки постов по категории
	const loadPosts = async (category: number | "all") => {
		const key = category === "all" ? "all" : category.toString(); // ключ для кеша

		// если уже есть в кеше → показываем мгновенно
		if (cache[key]) {
			setPosts(cache[key]); // устанавливаем посты из кеша
			setHasMore(cache[key].length === perPage); // проверяем, есть ли ещё посты
			setPage(1); // сбрасываем страницу на первую
			setSelectedCategory(category); // устанавливаем выбранную категорию
			return;
		}

		setLoading(true); // включаем "загрузка"
		setPage(1); // сбрасываем страницу
		const newPosts = await fetchPosts(1, perPage, category === "all" ? undefined : category); // фетчим посты
		setCache((prev) => ({ ...prev, [key]: newPosts })); // сохраняем в кеш
		setPosts(newPosts); // обновляем список постов
		setHasMore(newPosts.length === perPage); // проверяем, есть ли ещё
		setSelectedCategory(category); // сохраняем выбранную категорию
		setLoading(false); // выключаем "загрузка"
	};

	// Подгрузка следующей страницы
	const loadMore = async () => {
		if (loadingMore) return; // если уже грузим → выходим
		setLoadingMore(true); // включаем "загрузка"
		const nextPage = page + 1; // номер следующей страницы
		const key = selectedCategory === "all" ? "all" : selectedCategory.toString(); // ключ для кеша
		const newPosts = await fetchPosts(nextPage, perPage, selectedCategory === "all" ? undefined : selectedCategory); // грузим новые посты
		setPosts((prev) => [...prev, ...newPosts]); // добавляем к текущим
		setCache((prev) => ({ ...prev, [key]: [...(prev[key] || []), ...newPosts] })); // обновляем кеш
		setPage(nextPage); // увеличиваем номер страницы
		if (newPosts.length < perPage) setHasMore(false); // если постов меньше, чем perPage → больше нет
		setLoadingMore(false); // выключаем "загрузка"
	};

	// Prefetch категорий (подгружаем посты для всех категорий сразу после рендера)
	useEffect(() => {
		categories.forEach((cat) => {
			const key = cat.id.toString(); // ключ для кеша
			if (!cache[key]) {
				fetchPosts(1, perPage, cat.id).then((data) => {
					setCache((prev) => ({ ...prev, [key]: data })); // сохраняем в кеш
				});
			}
		});
	}, [categories]);

	return (
		<main className="w-full max-w-4xl mx-auto py-12 px-4">
			<h1 className="text-4xl font-bold mb-8">Блог WordPress</h1>

			{/* Кнопки категорий */}
			<div className="flex flex-wrap gap-2 mb-8">
				<button
					onClick={() => loadPosts("all")} // показываем все посты
					className={`px-4 py-2 rounded-full ${selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
				>
					Все
				</button>
				{categories.map((cat) => (
					<button
						key={cat.id} // уникальный ключ
						onClick={() => loadPosts(cat.id)} // загрузка постов категории
						className={`px-4 py-2 rounded-full ${selectedCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-200"}`}
					>
						{cat.name}
					</button>
				))}
			</div>

			{/* Посты */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{loading
					? Array.from({ length: perPage }).map((_, i) => <SkeletonPost key={i} />) // показываем скелетоны при загрузке
					: posts.map((post) => {
						const image = (post as any)._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/default.jpg"; // картинка поста
						const readingTime = getReadingTime(post.content.rendered); // вычисляем время чтения

						return (
							<article key={post.id} className="border-b pb-6">
								{/* Картинка */}
								<div className="w-full h-64 relative mb-4">
									<Image
										src={image}
										alt={post.title.rendered}
										fill
										sizes="(max-width: 768px) 100vw, 50vw"
										className="object-cover rounded-lg"
									/>
								</div>
								{/* Заголовок */}
								<h2 className="text-2xl font-semibold mb-2">
									<Link href={`/${locale}/news/${post.slug}`} prefetch={true} className="text-blue-600 hover:underline">
										{post.title.rendered}
									</Link>
								</h2>
								{/* Время чтения */}
								<p className="text-sm text-gray-500 mb-2">⏱ {readingTime} мин на чтение</p>
								{/* Краткое описание (excerpt) */}
								<div className="prose" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
							</article>
						);
					})}
			</div>

			{/* Кнопка "Показать ещё" */}
			{!loading && hasMore && (
				<div className="flex justify-center mt-8">
					<button
						onClick={loadMore} // подгрузить новые посты
						disabled={loadingMore} // отключаем кнопку во время загрузки
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
					>
						{loadingMore ? "Загрузка..." : "Показать ещё"}
					</button>
				</div>
			)}
		</main>
	);
}
