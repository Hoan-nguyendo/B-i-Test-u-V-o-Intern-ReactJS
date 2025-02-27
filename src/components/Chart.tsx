"use client";
import React, { useEffect, useRef } from "react";
import { createChart, UTCTimestamp } from "lightweight-charts";
import axios from "axios";
import "../app/chart.css";

interface ChartProps {
  interval: string;
  theme: "light" | "dark";
}

const Chart: React.FC<ChartProps> = ({ interval, theme }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const volumeChartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !volumeContainerRef.current) return;

    const isMobile = window.innerWidth < 768;
    const totalHeight = isMobile ? 400 : 600; // Tổng chiều cao chart
    const chartHeight = totalHeight * 0.7; // 70% cho biểu đồ nến
    const volumeHeight = totalHeight * 0.3; // 30% cho biểu đồ volume

    // Biểu đồ chính (Candlestick)
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { color: theme === "dark" ? "#1e1e1e" : "#ffffff" },
        textColor: theme === "dark" ? "white" : "black",
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Biểu đồ khối lượng (Volume)
    const volumeChart = createChart(volumeContainerRef.current, {
      width: volumeContainerRef.current.clientWidth,
      height: volumeHeight,
      layout: {
        background: { color: theme === "dark" ? "#1e1e1e" : "#ffffff" },
        textColor: theme === "dark" ? "white" : "black",
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;
    volumeChartRef.current = volumeChart;

    const candleSeries = chart.addCandlestickSeries();
    const volumeSeries = volumeChart.addHistogramSeries({
      color: "#26a69a",
    });

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Liên kết trục thời gian của hai biểu đồ
    chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
    //  volumeChart.timeScale().setVisibleRange(range);
    });

    // Giữ volume chart luôn nằm trong phạm vi hiển thị
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.1, bottom: 0 },
    });

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=500`
        );

        const data = res.data.map((d: any) => ({
          time: d[0] / 1000 as UTCTimestamp,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));

        const volumeData = res.data.map((d: any) => ({
          time: d[0] / 1000 as UTCTimestamp,
          value: parseFloat(d[5]),
          color: parseFloat(d[4]) >= parseFloat(d[1]) ? "#26a69a" : "#ef5350", // Màu xanh khi tăng, đỏ khi giảm
        }));

        candleSeries.setData(data);
        volumeSeries.setData(volumeData);

        chart.timeScale().fitContent();
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();

    // Lắng nghe dữ liệu real-time từ Binance WebSocket
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const kline = message.k;
      const newCandle = {
        time: kline.t / 1000 as UTCTimestamp,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
      };

      const newVolume = {
        time: kline.t / 1000 as UTCTimestamp,
        value: parseFloat(kline.v),
        color: parseFloat(kline.c) >= parseFloat(kline.o) ? "#26a69a" : "#ef5350",
      };

      candleSeries.update(newCandle);
      volumeSeries.update(newVolume);
    };

    // Cập nhật kích thước khi thay đổi window
    const handleResize = () => {
      if (chartContainerRef.current && volumeContainerRef.current) {
        const isMobile = window.innerWidth < 768;
        const totalHeight = isMobile ? 400 : 600;
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: totalHeight * 0.7,
        });
        volumeChart.applyOptions({
          width: volumeContainerRef.current.clientWidth,
          height: totalHeight * 0.3,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ws.close();
      chart.remove();
      volumeChart.remove();
    };
  }, [interval, theme]);

  return (
    <div className="w-full h-full flex flex-col">
      <div ref={chartContainerRef} className="w-full border border-gray-300 rounded-lg shadow-lg" />
      <div ref={volumeContainerRef} className="w-full border border-gray-300 rounded-lg shadow-lg" />
    </div>
  );
};

export default Chart;
