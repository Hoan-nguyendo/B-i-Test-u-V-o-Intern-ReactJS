import React from "react";

interface ChartControlsProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  interval: string;
  setInterval: (interval: string) => void;
  fetchPrice: () => void;
}

const timeFrames = ["1m", "5m", "30m", "1h", "4h", "1d"];

const ChartControls: React.FC<ChartControlsProps> = ({ theme, setTheme, interval, setInterval, fetchPrice }) => {
  return (
    <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mb-4">
      {/* Nút Chế độ Sáng/Tối */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="px-4 py-2 rounded-lg border transition-all duration-300 ease-in-out
          bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 
          active:scale-95"
      >
        {theme === "dark" ? "🌙 Chế độ tối" : "☀️ Chế độ sáng"}
      </button>

      {/* Nút chọn khung thời gian */}
      {timeFrames.map((tf) => (
        <button
          key={tf}
          onClick={() => setInterval(tf)}
          className={`px-4 py-2 rounded-lg border transition-all duration-300 ease-in-out active:scale-95
            ${
              interval === tf
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
        >
          {tf}
        </button>
      ))}

      {/* Nút lấy giá Bitcoin */}
      <button
        onClick={fetchPrice}
        className="px-4 py-2 rounded-lg border transition-all duration-300 ease-in-out active:scale-95
          bg-green-600 text-white hover:bg-green-500 shadow-md"
      >
        💰 Lấy giá Bitcoin
      </button>
    </div>
  );
};

export default ChartControls;
