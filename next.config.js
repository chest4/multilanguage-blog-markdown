import nextMDX from "@next/mdx";

const withMDX = nextMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Configure `pageExtensions` to include MDX files
	pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
	images: {
		remotePatterns: [
			{
				protocol: "https", // ✅ без двоеточия
				hostname: "chest4.tmweb.ru",
				pathname: "/**"
			}
		]
	}
};

export default withMDX(nextConfig);