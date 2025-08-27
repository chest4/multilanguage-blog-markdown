"use client";

import { useState } from "react";

export interface AccordionItem {
	id?: string | number; // для метки
	title: React.ReactNode;
	content: React.ReactNode;
}

interface AccordionProps {
	items: AccordionItem[];
	defaultOpenIndexes?: number[]; // индексы открытых элементов по умолчанию
	allowMultipleOpen?: boolean; // можно ли открыть несколько элементов одновременно
}

export default function Accordion({
	items,
	defaultOpenIndexes = [],
	allowMultipleOpen = false,
}: AccordionProps) {
	const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpenIndexes);

	const toggle = (index: number) => {
		if (openIndexes.includes(index)) {
			// закрываем элемент
			setOpenIndexes(openIndexes.filter((i) => i !== index));
		} else {
			// открываем элемент
			setOpenIndexes(allowMultipleOpen ? [...openIndexes, index] : [index]);
		}
	};

	return (
		<div className="w-full max-w-xl mx-auto border rounded-md overflow-hidden">
			{items.map((item, index) => {
				const isOpen = openIndexes.includes(index);
				return (
					<div key={item.id ?? index} className="border-b last:border-b-0">
						<button
							className="w-full text-left px-4 py-3 flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition"
							onClick={() => toggle(index)}
						>
							<span>{item.title}</span>
							<span>{isOpen ? "-" : "+"}</span>
						</button>
						<div
							className={`px-4 transition-max-height duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-96 py-3" : "max-h-0"
								}`}
						>
							{item.content}
						</div>
					</div>
				);
			})}
		</div>
	);
}
