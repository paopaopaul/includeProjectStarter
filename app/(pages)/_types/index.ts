import React from 'react';
import { HiShieldCheck } from 'react-icons/hi';
import { MdCancel, MdAnalytics } from 'react-icons/md';

export interface AccordionData {
  icon: React.ReactNode;
  heading: string;
  detail: string;
}

export const accordionData: AccordionData[] = [
  {
    icon: React.createElement(HiShieldCheck),
    heading: 'About Us',
    detail:
      'Beijing Jinhuahengyuan house it is a leading manufacturer for container house industry and focusing on providing one-stop solutions for container house design and customization, sales leasing, R&D and production, transportation and installation, and after-sales service.',
  },
  {
    icon: React.createElement(MdCancel),
    heading: 'Our Strength',
    detail:
      "Participated in the design and construction of venues for the 2022 Beijing Winter Olympics, which was evaluated by China Central Television as 'the most beautiful temporary construction on the top of Genting'",
  },
  {
    icon: React.createElement(MdAnalytics),
    heading: 'International Businesses',
    detail:
      'The products are sold all over the countries and exported to North America, South America, Europe and Asian countries all year round, mainly including the United States, Canada, Britain, Brazil, Peru, Argentina, Outer Mongolia, Saudi Arabia, Congo, Russia and other countries, covering temporary construction of major construction sites at home and abroad and non-engineering fields such as industry, commerce, agriculture, tourism, education, medical care, military affairs, and camps.',
  },
];
