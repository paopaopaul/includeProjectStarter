import '@globals/globals.scss';
import fonts from '@globals/fonts';
import metadata from '@globals/metadata.json';
import { twMerge } from 'tailwind-merge';

import navLinks from '@data/navLinks.json';
import Navbar from '@components/Navbar/Navbar';
import Footer from './_components/Footer/Footer';

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={twMerge('font-sans', fonts, 'antialiased bg-[#EAEEFE]')}>
        <Navbar navLinks={navLinks} />
        {children}
        <Footer navLinks={navLinks} />
      </body>
    </html>
  );
}
