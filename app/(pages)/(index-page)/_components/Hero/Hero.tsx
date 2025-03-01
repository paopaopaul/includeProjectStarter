import Image from 'next/image';
import { RiArrowRightLine } from 'rocketicons/ri';
import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.tag}>Version 1.0</div>
            <h1 className={styles.title}>Pathway to selfdiscovery</h1>
            <p className={styles.description}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos. dasjfd saflsd ads fa dsaf sa df saf ds fasd fasd dfasd f
              saflsd
            </p>
            <div className={styles.button}>
              <button className="button buttonPrimary">Get for Free</button>
              <button className="button buttonText">
                <span>Learn More</span>
                <RiArrowRightLine className={styles.icon} />
              </button>
            </div>
          </div>
          <div className={styles.image}>
            <Image
              src="/index/assets/cog.png"
              alt="cogImage"
              width={300}
              height={300}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
