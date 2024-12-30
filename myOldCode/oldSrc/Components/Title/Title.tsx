// Components/Title/Title.tsx
import React from "react";
import "./Title.css";

const Title: React.FC = () => {
  return (
    <div className="title-container">
      {/* Spline viewer as the background using iframe */}
      <iframe
        src="https://my.spline.design/particlenebula-0458bf35bfe23567bc769089a4083d94/"
        className="spline-background"
        width="100%"
        height="100%"
      ></iframe>

      {/* Title text */}
      <h1 className="title-text">Chinese Fortune-Telling</h1>
    </div>
  );
};

export default Title;
