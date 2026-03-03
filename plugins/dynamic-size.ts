import plugin from 'tailwindcss/plugin';

export default plugin(({ matchUtilities, theme }) => {
	const toRem = rem => `${rem}rem`; // Converts px to rem for min and max values
	const dynamicClamp = (value, type) => {
		if (!value) return value;
		const min = parseFloat(value) * 0.8 + value.split(parseFloat(value).toString())[1]; // Minimum value in rem
		const max = value; // Maximum value in rem
		const preferred = type === 'width' ? `${parseFloat(value) * 1.6}vw` : `${parseFloat(value) * 1.6}vh`; // Preferred viewport-based value

		return `clamp(${min}, ${preferred}, ${max})`;
	};

	// Replaces default Tailwind sizing utilities with clamp-based variants
	matchUtilities(
		{
			'w-clamp': value => ({
				width: dynamicClamp(value, 'width'),
			}),
			'h-clamp': value => ({
				height: dynamicClamp(value, 'height'),
			}),
			'size-clamp': value => ({
				width: dynamicClamp(value, 'width'),
				height: dynamicClamp(value, 'height'),
			}),
		},
		{ values: theme('spacing'), type: 'any' },
	);
});
