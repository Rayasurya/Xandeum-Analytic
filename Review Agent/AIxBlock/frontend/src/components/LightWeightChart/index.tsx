import { ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import "./Index.scss";

export const LightWeightChart = (props: {
  data: any;
  colors?:
    | {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
      }
    | undefined;
}) => {
  const {
    data,
    colors: {
      backgroundColor = "white",
      lineColor = "#2962FF",
      textColor = "black",
      areaTopColor = "#2962FF",
      areaBottomColor = "rgba(41, 98, 255, 0.28)",
    } = {},
  } = props;

  const chartContainerRef = useRef<any>();
  const tooltipRef = useRef<any>();

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 160,
    });
    chart.applyOptions({
      rightPriceScale: {
        visible: false,
      },
			timeScale: {
				visible: false,
				lockVisibleTimeRangeOnResize: true,
				fixLeftEdge: true,
				fixRightEdge: true,
			},
      crosshair: {
        // hide the horizontal crosshair line
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
      // hide the grid lines
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
    });

    chart.timeScale().fitContent();

    const newSeries = chart.addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });
    newSeries.setData(data);

    //Tooltip
    tooltipRef.current = document.createElement("div");
    tooltipRef.current.className = "floating-tooltip";
    chartContainerRef.current.appendChild(tooltipRef.current);

    const handleCrosshairMove = (param: any) => {
      if (param.time && [param.seriesData].length && tooltipRef.current) {
        const s = param.seriesData.get(newSeries);
        const toolTipDiv = `<div>
          <div><b>${s.time}</b></div>
          <div>$${s.value}</div>
        </div>`;
        tooltipRef.current.innerHTML = toolTipDiv;
        tooltipRef.current.style.left = `${param.point.x}px`;
        tooltipRef.current.style.top = `${param.point.y}px`;
        tooltipRef.current.style.display = "block";
      } else {
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [
    data,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
  ]);

  return <div className="chart-container" ref={chartContainerRef} />;
};
