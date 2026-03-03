import plugin from "tailwindcss/plugin";

export default plugin(({ matchUtilities, theme }) => {
	const toRem = (rem) => `${rem}rem`; // Converte px in rem per min e max
	const dynamicClamp = (value, type) => {
		if (!value) return value;
		const min = parseFloat(value) * 0.8 + value.split(parseFloat(value).toString())[1]; // Min in rem
		const max = value; // Max in rem
		const preferred = type === "width" ? `${parseFloat(value) * 1.6}vw` : `${parseFloat(value) * 1.6}vh`; // Preferenza vw/hv

		return `clamp(${min}, ${preferred}, ${max})`;
	};

	// Sostituisce le classi di default di Tailwind con la versione "clamp"
	matchUtilities(
		{
			"w-clamp": (value) => ({
				width: dynamicClamp(value, "width"),
			}),
			"h-clamp": (value) => ({
				height: dynamicClamp(value, "height"),
			}),
			"size-clamp": (value) => ({
				width: dynamicClamp(value, "width"),
				height: dynamicClamp(value, "height"),
			}),
		},
		{ values: theme("spacing"), type: "any" }
	);
});
