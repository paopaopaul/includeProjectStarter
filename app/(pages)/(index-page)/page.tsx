import Hero from './_components/Hero/Hero';
import { Metadata } from 'next';
import AboutUs from './_components/About_Us/About_Us';

export const metadata: Metadata = {
  title: 'Pathway to Self-discovery',
};

export default function Home() {
  return (
    <main>
      <div id="home">
        <Hero />
      </div>
      <div id="about">
        <AboutUs />
      </div>
      <div id="examples">
        {/* Your examples component */}
        <h1>Examples</h1>
        <p>Examples section content will go here.</p>
      </div>
    </main>
  );
}
