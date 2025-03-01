import Link from 'next/link';
import styles from './Footer.module.scss';
import Image from 'next/image';

interface NavLink {
  name: string;
  slug: string;
}

export default function Footer({ navLinks }: { navLinks: NavLink[] }) {
  return (
    <div className={styles.container}>
      <div className={styles.content_container}>
        <div>
          <Image src="/index/Logo1.jpg" alt="logo" width={40} height={40} />
        </div>
        <div className={styles.navigation}>
          <div className={styles.navigation_links}>
            {navLinks.map((link) => {
              return (
                <Link key={link.slug} href={link.slug}>
                  {link.name}
                </Link>
              );
            })}
          </div>
          <p className={styles.copyright}>
            © 2024 DevinAI, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
