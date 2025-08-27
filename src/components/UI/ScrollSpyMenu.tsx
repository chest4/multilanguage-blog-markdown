"use client";

import { useEffect, useState, useRef } from "react";

interface Section {
	id: string;
	title: string;
	content: React.ReactNode;
}

interface ScrollSpyMenuProps {
	sections: Section[];
}

export default function ScrollSpyMenu({ sections }: ScrollSpyMenuProps) {
	const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

	useEffect(() => {
		const handleScroll = () => {
			const scrollPos = window.scrollY + 100; // отступ для заголовка/паддинга
			let current = sections[0]?.id;

			for (const section of sections) {
				const el = sectionRefs.current[section.id];
				if (el && el.offsetTop <= scrollPos) {
					current = section.id;
				}
			}

			setActiveId(current!);
		};

		window.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleScroll);

		// вызываем сразу, чтобы подсветка была верной
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, [sections]);

	const scrollTo = (id: string) => {
		const el = sectionRefs.current[id];
		if (el) {
			window.scrollTo({
				top: el.offsetTop,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="flex">
			{/* Меню слева */}
			<nav className="fixed top-20 left-4 w-40 flex flex-col gap-4">
				{sections.map((section) => (
					<button
						key={section.id}
						onClick={() => scrollTo(section.id)}
						className={`text-left px-4 py-2 rounded hover:bg-gray-200 transition ${activeId === section.id ? "bg-blue-600 text-white" : "bg-gray-100"
							}`}
					>
						{section.title}
					</button>
				))}
			</nav>

			{/* Контент справа */}
			<div className="ml-52 flex-1 flex flex-col gap-20 py-12">
				{sections.map((section) => (
					<div
						key={section.id}
						id={section.id}
						ref={(el) => (sectionRefs.current[section.id] = el)}
						className="p-8 border rounded-lg bg-gray-50"
					>
						{section.content}
					</div>
				))}
			</div>
		</div>
	);
}
