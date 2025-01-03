import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

/*
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const fonts = [inter, montserrat];
*/

const fonts = [dmSans];

const font_variables = fonts.map((font) => font.variable);
const font_string = font_variables.join(' ');
export default font_string;
