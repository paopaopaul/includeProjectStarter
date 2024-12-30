import { useState } from "react";
import { getErrorMessage } from "../../utils";
import { FaFortAwesome } from "react-icons/fa";
import "./LotDrawer.css";

type Lot = {
  number: number;
  title: string;
  verse: string;
  meaning: string;
};

function LotDrawer() {
  const [lot, setLot] = useState<Lot | null>(null);
  const [error, setError] = useState<String | null>(null);

  const drawLot = async () => {
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/draw-lot`);
      if (!response.ok) {
        throw new Error("Failed to fetch fortune. Please try again.");
      }
      const data = await response.json();
      console.log("Fetched lot data:", data);
      setLot(data.lot);
    } catch (error: unknown) {
      return {
        error: getErrorMessage(error),
      };
    }
  };
  return (
    <div className="lot-drawer-container">
      <h2>
        <FaFortAwesome />
        Draw a Lot
      </h2>
      <button className="lot-button" onClick={drawLot}>
        Draw Your Fortune
      </button>
      {lot && (
        <div className="lot-details">
          <h3>
            <FaFortAwesome />
            Lot Number: {lot.number}
          </h3>
          <h4>{lot.title}</h4>
          <p>
            <strong>Verse:</strong> {lot.verse}
          </p>
          <p>
            <strong>Meaning:</strong> {lot.meaning}
          </p>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default LotDrawer;
