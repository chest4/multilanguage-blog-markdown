// src/types/wp.ts

export interface WPCategory {
	id: number;
	name: string;
	slug: string;
}

export interface WPFeaturedMedia {
	source_url: string;
}

export interface YoastHeadJson {
	title?: string;
	description?: string;
	og_image?: { url: string }[];
}


export interface WPPost {
	id: number;
	slug: string;
	date: string;
	title: {
		rendered: string;
	};
	excerpt: {
		rendered: string;
	};
	content: {
		rendered: string;
	};
	categories: number[]; // массив ID категорий
	featured_media: number; // ID изображения
	yoast_head_json?: YoastHeadJson; // 👈 добавили
}

// src/types/wp.ts

