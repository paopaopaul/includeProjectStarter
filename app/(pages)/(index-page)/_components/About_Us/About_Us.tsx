'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import photo from '../../../../../public/index/Logo1.jpg';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import { MdOutlineArrowDropDown } from 'react-icons/md';
import styles from './About_Us.module.scss';
import { accordionData } from '../../../_types/index'; // Assuming you have this data in a separate file

interface AboutUsProps {
  // Add any props you might need
}

const AboutUs = React.forwardRef<HTMLDivElement, AboutUsProps>((props, ref) => {
  // Define expanded state at the component level
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({
    0: true, // Preexpand the first item
  });

  const updateExpandedItems = (itemIndex: number, isExpanded: boolean) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemIndex]: isExpanded,
    }));
  };

  return (
    <section className={styles.wrapper} id="about">
      <div className={styles.container}>
        {/* left side */}
        <div className={styles.left}>
          <div className={styles.imageContainer}>
            <Image
              src={photo}
              alt="About Us"
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className={styles.right} ref={ref}>
          <span className={styles.tag}>Information</span>
          <h2 className={styles.title}>Who We Are</h2>
          <p className={styles.description}>
            We are always ready to help by providing the best service for you!
          </p>

          <Accordion
            className={styles.accordion}
            allowMultipleExpanded={true}
            allowZeroExpanded={false}
            preExpanded={[0]}
          >
            {accordionData.map((item, i) => (
              <AccordionItem
                className={`${styles.accordionItem} ${
                  expandedItems[i] ? styles.expanded : styles.collapsed
                }`}
                key={i}
                uuid={i}
              >
                <AccordionItemHeading>
                  <AccordionItemButton className={styles.accordionButton}>
                    <AccordionItemState>
                      {({ expanded }: { expanded: boolean }) => {
                        // Update the expanded state when it changes
                        if (expanded !== expandedItems[i]) {
                          updateExpandedItems(i, expanded);
                        }
                        // Return null since we don't need to render anything here
                        return null;
                      }}
                    </AccordionItemState>

                    <div className={styles.icon}>{item.icon}</div>
                    <span className={styles.itemHeading}>{item.heading}</span>
                    <div className={styles.dropdownIcon}>
                      <MdOutlineArrowDropDown size={20} />
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>

                <AccordionItemPanel>
                  <p className={styles.itemDetail}>{item.detail}</p>
                </AccordionItemPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
});

AboutUs.displayName = 'AboutUs'; // Required for forwardRef components in Next.js

export default AboutUs;
