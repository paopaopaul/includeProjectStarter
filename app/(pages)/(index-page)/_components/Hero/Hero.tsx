import Image from "next/image";

import styles from "./Hero.module.scss";

export default function Hero() {
  return (
    <div className="container">
      <div>
        <div className={styles.tag}>Version 1.0</div>
        <h1 className={styles.title}>Pathway to self-discovery</h1>
        <p className={styles.description}>Description</p>
        <button className={styles.button}>Get Started for Free</button>
        <button className={styles.button}>Learn More</button>
      </div>
    </div>
  );
}
