export default (invert = true) => {
	const dark = () => {
		localStorage.setItem('theme', 'dark');
		document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0a0a0a');
		document.querySelectorAll('[dark]').forEach(el => el.setAttribute('dark', '1'));
		document.documentElement.classList.add('dark');
		document.documentElement.style.colorScheme = 'dark';
	};
	const light = () => {
		localStorage.setItem('theme', 'light');
		document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff');
		document.querySelectorAll('[dark]').forEach(el => el.setAttribute('dark', '0'));
		document.documentElement.classList.remove('dark');
		document.documentElement.style.colorScheme = 'light';
	};

	switch (localStorage.theme) {
		case invert ? 'light' : 'dark': {
			dark();
			break;
		}
		case invert ? 'dark' : 'light': {
			light();
			break;
		}
		default:
			light();
	}

	return localStorage.theme;
};
