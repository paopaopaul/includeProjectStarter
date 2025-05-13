'use client';
import Image from 'next/image';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import logo1 from '/Users/paul/Desktop/includeProjectStarter/public/index/Logo1.jpg';
import styles from './Navbar.module.scss';
import useToggle from '@hooks/useToggle';
import { useCallback } from 'react';

interface NavLink {
  name: string;
  slug: string;
}

export default function Navbar({ navLinks }: { navLinks: NavLink[] }) {
  const {
    state: active,
    toggleState: toggleActive,
    setOff: setInactive,
  } = useToggle(false);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      setInactive();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [setInactive]
  );

  return (
    <div className={styles.relative_wrapper}>
      <div className={styles.container}>
        <Image
          src={logo1}
          alt="Logo"
          height={40}
          width={40}
          className={styles.rounded}
          onClick={() => scrollToSection('./home')}
          style={{ cursor: 'pointer' }}
        />
        <div className={styles.nav_container}>
          <div className={`${styles.links} ${active ? styles.active : ''}`}>
            {navLinks.map((link) => {
              const sectionId = link.slug.replace('/', '');
              return (
                <a
                  key={link.slug}
                  onClick={() => scrollToSection(sectionId || 'home')}
                  style={{ cursor: 'pointer' }}
                >
                  {link.name}
                </a>
              );
            })}
          </div>
          <button className={styles.menu} onClick={toggleActive}>
            {active ? <RxCross2 /> : <RxHamburgerMenu />}
          </button>
        </div>
      </div>
    </div>
  );
}
