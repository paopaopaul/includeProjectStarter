import Link from "next/link";
import styles from "./Footer.module.scss";

interface NavLink {
  name: string;
  slug: string;
}

export default function Footer({ navLinks }: { navLinks: NavLink[] }) {
  return (
    <div className={styles.container}>
      <div className={styles.content_container}>
        <div className={styles.description}>
          <h2>DevinAI</h2>
          <p>放一个logo 公司的地址等信息</p>
        </div>
        <div className={styles.navigation}>
          <div className={styles.learn_more}>
            <h2>Learn more</h2>
            <div className={styles.learn_more_links}>
              {navLinks.map((link) => {
                return (
                  <Link key={link.slug} href={link.slug}>
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className={styles.projects}>
            <h2>Projects</h2>
            <div className={styles.project_link_columns}>
              <div>
                {/* Should be done with a loop */}
                <Link href="/project/1">算命方法</Link>
                <Link href="/project/2">算命方法</Link>
                <Link href="/project/3">算命方法</Link>
              </div>
              <div>
                <Link href="/project/4">算命方法</Link>
                <Link href="/project/5">算命方法</Link>
                <Link href="/project/6">算命方法</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
