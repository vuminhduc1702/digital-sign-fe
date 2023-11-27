import React, { useEffect, useMemo, useState } from 'react'
import { useGauge } from 'use-gauge'
import { motion, MotionConfig, useAnimationFrame } from 'framer-motion'
import clsx from 'clsx'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '~/components/Spinner'

import { type LatestData } from '../../types'

const SCALE = 10

const useGaugeChart = (data: number) => {
  const [value, setValue] = useState(0)

  useAnimationFrame(t => {
    if (value >= 100 * SCALE) return
    setValue(data)
  })

  return {
    value: Math.min(value, 100 * SCALE),
  }
}

type GaugeProps = {
  value: number
  attrKey: string
}

const START_ANGLE = 90
const END_ANGLE = 270

function Gauge({ value, attrKey }: GaugeProps) {
  const gauge = useGauge({
    domain: [0, 100 * SCALE],
    startAngle: START_ANGLE,
    endAngle: END_ANGLE,
    numTicks: 21,
    diameter: 400,
  })

  const needle = gauge.getNeedleProps({
    value,
    baseRadius: 8,
    tipRadius: 2,
  })

  const arcStroke = useMemo(() => {
    let color = ''
    if (value <= 40 * SCALE) {
      color = `green`
    } else if (value <= 80 * SCALE) {
      color = 'yellow'
    } else {
      color = 'red'
    }

    return `url(#${color}Gradient)`
  }, [value])

  return (
    <div className="relative flex h-full">
      <svg
        className="h-full w-full overflow-visible p-20"
        {...gauge.getSVGProps()}
      >
        <defs>
          <linearGradient
            id="greenGradient"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#4ade80"></stop>
            <stop offset="100%" stopColor="#22c55e"></stop>
          </linearGradient>
          <linearGradient
            id="yellowGradient"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fde047"></stop>
            <stop offset="100%" stopColor="#facc15"></stop>
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171"></stop>
            <stop offset="100%" stopColor="#ef4444"></stop>
          </linearGradient>
        </defs>
        <g id="arcs">
          <path
            {...gauge.getArcProps({
              offset: -60,
              startAngle: START_ANGLE,
              endAngle: END_ANGLE,
            })}
            fill="none"
            strokeWidth={36}
            className="stroke-gray-200"
          />
          <path
            {...gauge.getArcProps({
              offset: -60,
              startAngle: START_ANGLE,
              endAngle: gauge.valueToAngle(value),
            })}
            strokeWidth={36}
            fill="transparent"
            stroke={arcStroke}
          />
        </g>
        <g id="ticks">
          {gauge.ticks.map(angle => {
            const asValue = gauge.angleToValue(angle)
            const showText = asValue % (20 * SCALE) === 0

            return (
              <React.Fragment key={`tick-group-${angle}`}>
                <line
                  className={clsx([
                    'stroke-gray-300',
                    {
                      'stroke-green-500': asValue <= 20 * SCALE,
                      'stroke-yellow-500':
                        asValue >= 60 * SCALE && asValue <= 80 * SCALE,
                      'stroke-red-400': asValue >= 80 * SCALE,
                    },
                  ])}
                  strokeWidth={2}
                  {...gauge.getTickProps({
                    angle,
                    length: 8,
                  })}
                />
                {showText && (
                  <text
                    className="fill-gray-400 font-medium"
                    {...gauge.getLabelProps({ angle, offset: 20 })}
                  >
                    {asValue}
                  </text>
                )}
              </React.Fragment>
            )
          })}
        </g>
        <g id="needle">
          <motion.circle
            className="fill-gray-200"
            animate={{
              cx: needle.base.cx,
              cy: needle.base.cy,
            }}
            r={12}
          />
          <motion.circle
            className="fill-orange-400"
            animate={{
              cx: needle.base.cx,
              cy: needle.base.cy,
            }}
            r={6}
          />
          <motion.line
            className="stroke-orange-400"
            strokeLinecap="round"
            strokeWidth={4}
            animate={{
              x1: needle.base.cx,
              x2: needle.tip.cx,
              y1: needle.base.cy,
              y2: needle.tip.cy,
            }}
          />
        </g>
      </svg>
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2">{attrKey}</p>
    </div>
  )
}

export function GaugeChart({ data }: { data: LatestData }) {
  // console.log(`new gauge: `, data)

  const [dataTransformedFeedToChart, setDataTransformedFeedToChart] = useState({
    key: '',
    value: 0,
  })

  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      const gaugeDataType = {
        key: Object.keys(data)[0],
        value: parseFloat(Object.values(data)?.[0]?.value),
      }
      setDataTransformedFeedToChart(gaugeDataType)
    }
  }, [data])

  const { value } = useGaugeChart(dataTransformedFeedToChart.value)

  const showSpinner = useSpinDelay(Object.keys(data).length === 0, {
    delay: 150,
    minDuration: 300,
  })

  return (
    <>
      {Object.keys(dataTransformedFeedToChart).length > 0 ? (
        <MotionConfig transition={{ type: 'tween', ease: 'linear' }}>
          <Gauge value={value} attrKey={dataTransformedFeedToChart.key} />
        </MotionConfig>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Spinner showSpinner={showSpinner} size="xl" />
        </div>
      )}
    </>
  )
}
