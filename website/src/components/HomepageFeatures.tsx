import type { ReactNode } from 'react';
import React from 'react';
import styles from './HomepageFeatures.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: ReactNode;
};

const featureList: FeatureItem[] = [
  {
    title: 'Sensible Defaults',
    image: '/img/screenshot.png',
    description: 'Build complex queries with robust out-of-the-box features.',
  },
  {
    title: 'Extensible',
    image: '/img/date-picker.png',
    description: 'Provide custom components for maximum flexibility.',
  },
  {
    title: 'Native TypeScript',
    image: '/img/typescript.png',
    description: 'First-class TypeScript support.',
  },
];

const Feature = ({ title, image, description }: FeatureItem) => (
  <div className="col col--4">
    <div className="text--center" style={{ minHeight: 236 }}>
      <img alt={title} src={image} />
    </div>
    <div className="text--center padding-horiz--md">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {featureList.map(props => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
