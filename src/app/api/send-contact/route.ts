import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { name, phone } = await req.json();

		if (!name || !phone) {
			return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
		}

		// Настройка SMTP
		const transporter = nodemailer.createTransport({
			host: "smtp.yandex.ru",
			port: 465,
			secure: true,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		await transporter.sendMail({
			from: '"Сайт Контакты" <chest4.web@yandex.ru>',
			to: "chest4.web@yandex.ru",
			subject: "Новая заявка с сайта",
			text: `Имя: ${name}\nТелефон: ${phone}`,
			html: `<p><strong>Имя:</strong> ${name}</p><p><strong>Телефон:</strong> ${phone}</p>`,
		});

		return NextResponse.json({ message: "Сообщение отправлено" });
	} catch (err: any) {
		console.error(err);
		return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 });
	}
}
