/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import React, { useRef, useLayoutEffect, useState } from "react"
import { FunnelChartProps, FunnelStep, FunnelStepContents, FunnelStepOuterContents, FunnelStepWrapper, ChartWrapper, AxisContainer, AxisLabel, LeftAxis, Chart, RightAxis } from "./types"
import { Chunk } from "../types"
import { getChartText } from "./utils"
import styled from "styled-components"

export interface TooltipProps {
  x: number
  y: number
  content: string
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ 
  data,
  config,
  element,
  openDrillMenu,
 }) => {
  const [ tooltip, setTooltip ] = useState<TooltipProps | undefined>(undefined)
  let stepHeight = 1 / data.length * element.getBoundingClientRect().height
  return (
    <ChartWrapper>
      <LeftAxis>{data.length > 0 && data.map((d: Chunk, i: number) => {
        let stepWidthPct = d.percent_number || 0
        let stepText = getChartText(d.percent)
        let textWidth = stepText.width
        let stepWidth = element.getBoundingClientRect().width * stepWidthPct
        let stepHeight = 1 / data.length * element.getBoundingClientRect().height
        let outerStepTextY = (stepHeight + ((1 / data.length / 2) * element.getBoundingClientRect().height) - (stepText.height / 4))
        let textWithin = textWidth < stepWidth ? true : false
        return (
          <AxisContainer height={stepHeight}><AxisLabel>{d.label}</AxisLabel></AxisContainer>
        )
      })}</LeftAxis>
      <Chart>{data.length > 0 && data.map((d: Chunk, i: number) => {
        let stepWidthPct = d.percent_number || 0
        let stepText = getChartText(d.percent, config.bar_scale)
        let textWidth = stepText.width
        let stepWidth = element.getBoundingClientRect().width * stepWidthPct
        // begin of step Y + half of step Y - quarter of text height
        let outerStepTextY = (stepHeight * i + (stepHeight / 2) - (stepText.height / 4))
        let textWithin = textWidth < stepWidth ? true : false
        return (
        <FunnelStepWrapper height={stepHeight}>
          <FunnelStep 
            color={config.bar_colors && config.bar_colors[i]}
            width={stepWidthPct - 0.02}
            height={stepHeight}
            onMouseMove={(e)=>{setTooltip({x: e.clientX + 10, y: e.clientY, content: d.label +": "+d.rendered+" ("+d.percent+")"})}}
            onMouseLeave={(e)=>{setTooltip(undefined)}}
            onClick={(e: any)=>{
              // @ts-ignore
              openDrillMenu({
                links: d.links || [],
                event: e,
              });
            }}
          >
            {textWithin && <FunnelStepContents font_size={config.bar_scale} color={"#FFF"}>{stepText.element}</FunnelStepContents>}
          </FunnelStep>
          {!textWithin && <FunnelStepOuterContents font_size={config.font_size} color={config.bar_colors && config.bar_colors[i]} padding={stepWidthPct/2} bottom={outerStepTextY}>{stepText.element}</FunnelStepOuterContents>}
        </FunnelStepWrapper>
        )
      })}</Chart>
      <RightAxis>{data.map((d: Chunk, i: number) => {
        return (
          <AxisContainer height={stepHeight}><AxisLabel>{d.rendered}</AxisLabel></AxisContainer>
        )
      })}</RightAxis>
      {tooltip && <div style={{position: "absolute", fontSize: "0.9em", left: tooltip.x, color: "white",top: tooltip.y, opacity: .9, backgroundColor: "#282828", borderRadius: 5, padding: "10px"}}>
        {tooltip.content}
      </div>}
    </ChartWrapper>
  )
}
