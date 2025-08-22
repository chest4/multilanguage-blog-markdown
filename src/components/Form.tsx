"use client";

import { useState } from "react";


export default function Form() {
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [nameError, setNameError] = useState("");
	const [phoneError, setPhoneError] = useState("");

	// Функция форматирования телефона
	const formatPhone = (value: string) => {
		const digits = value.replace(/\D/g, "").slice(0, 11); // максимум 11 цифр
		let formatted = "+7 ";
		if (digits.length > 1) formatted += `(${digits.slice(1, 4)}) `;
		if (digits.length >= 4) formatted += `${digits.slice(4, 7)}-`;
		if (digits.length >= 7) formatted += `${digits.slice(7, 9)}-`;
		if (digits.length >= 9) formatted += `${digits.slice(9, 11)}`;
		return formatted;
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPhone(formatPhone(e.target.value));
	};

	// Валидация формы
	const validate = () => {
		let valid = true;

		if (!/^[a-zA-Zа-яА-Я\s]{2,}$/.test(name)) {
			setNameError("Введите корректное имя (только буквы, минимум 2 символа)");
			valid = false;
		} else {
			setNameError("");
		}

		const digits = phone.replace(/\D/g, "");
		if (digits.length !== 11) {
			setPhoneError("Введите корректный телефон (11 цифр)");
			valid = false;
		} else {
			setPhoneError("");
		}

		return valid;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (!validate()) return;

		setLoading(true);

		try {
			const res = await fetch("http://localhost:3000/api/send-contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, phone }),
			});

			if (!res.ok) throw new Error("Ошибка отправки");

			setSuccess(true);
			setName("");
			setPhone("");
		} catch (err: any) {
			setError(err.message || "Ошибка отправки");
		} finally {
			setLoading(false);
		}
	};

	return (

		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block mb-1 font-semibold">Имя</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full border px-3 py-2 rounded"
					required
				/>
				{nameError && <p className="text-red-600 mt-1">{nameError}</p>}
			</div>

			<div>
				<label className="block mb-1 font-semibold">Телефон</label>
				<input
					type="tel"
					value={phone}
					onChange={handlePhoneChange}
					placeholder="+7"
					className="w-full border px-3 py-2 rounded"
					required
				/>
				{phoneError && <p className="text-red-600 mt-1">{phoneError}</p>}
			</div>

			<button
				type="submit"
				disabled={loading}
				className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
			>
				{loading ? "Отправка..." : "Отправить"}
			</button>

			{success && <p className="text-green-600 mt-2">Сообщение отправлено!</p>}
			{error && <p className="text-red-600 mt-2">{error}</p>}
		</form>
	);
}
