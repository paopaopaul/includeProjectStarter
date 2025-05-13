'use client';
import styles from './Footer.module.scss';
import Image from 'next/image';
import { useCallback } from 'react';

interface NavLink {
  name: string;
  slug: string;
}

export default function Footer({ navLinks }: { navLinks: NavLink[] }) {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.content_container}>
        <div>
          <Image
            src="/index/Logo1.jpg"
            alt="logo"
            width={40}
            height={40}
            onClick={() => scrollToSection('home')}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className={styles.navigation}>
          <div className={styles.navigation_links}>
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
          <p className={styles.copyright}>
            © 2025 DevinAI, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
