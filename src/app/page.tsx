"use client";
import React, { useState, useEffect } from "react";
import Chart from "@/components/Chart";
import ChartControls from "@/components/ChartControls";
import PriceDisplay from "@/components/PriceDisplay";
import axios from "axios";

const Home: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [interval, setInterval] = useState("1m");
  const [price, setPrice] = useState<{ current?: number; previous?: number }>({});

  const fetchPrice = async () => {
    try {
      const res = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
      setPrice((prev) => ({ previous: prev.current, current: parseFloat(res.data.price) }));
    } catch (error) {
      console.error("Lỗi khi lấy giá Bitcoin:", error);
    }
  };

  useEffect(() => {
    fetchPrice();
    const intervalId = window.setInterval(fetchPrice, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-white dark:bg-gray-900 
  text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
  
  {/* Container chính có scroll-y */}
  <div className="w-full h-full flex flex-col gap-2 p-0 
    bg-white dark:bg-black rounded-none shadow-none overflow-y-auto">
    
    {/* Khu vực điều khiển */}
    <div className="w-full flex flex-col sm:flex-row justify-between items-center bg-gray-200 dark:bg-gray-700 
      p-3 sm:p-4 shadow-md sticky top-0 z-10">
      <PriceDisplay current={price.current} previous={price.previous} />
      <ChartControls theme={theme} setTheme={setTheme} interval={interval} setInterval={setInterval} fetchPrice={fetchPrice} />
    </div>

    {/* Biểu đồ */}
    <div className="w-full flex-grow bg-gray-300 dark:bg-gray-600 p-3 sm:p-4 shadow-md">
      <Chart interval={interval} theme={theme} />
    </div>
  </div>
</div>
  

  
  );
};

export default Home;
