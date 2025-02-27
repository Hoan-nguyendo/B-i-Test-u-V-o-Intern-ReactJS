import React from "react";

interface PriceDisplayProps {
  current?: number;
  previous?: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ current, previous }) => {
  const priceUp = current && previous && current > previous;
  const priceDown = current && previous && current < previous;

  return (
    <div className="mt-4 text-lg font-semibold">
      {previous && (
        <p className={`text-${priceUp ? "green" : priceDown ? "red" : "gray"}-600`}>
          Giá hiện tại: {previous} USD {priceUp ? "📈" : priceDown ? "📉" : ""}
        </p>
      )}
      {previous && <p className="text-gray-500">Giá cách đây 1 phút: {previous} USD</p>}
    </div>
  );
};

export default PriceDisplay;
