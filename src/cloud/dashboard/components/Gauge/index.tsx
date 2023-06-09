import React, { useMemo, useState } from 'react'
import { useGauge } from 'use-gauge'
import { motion, MotionConfig, useAnimationFrame } from 'framer-motion'
import clsx from 'clsx'

const useGaugeChart = (data: number) => {
  const [value, setValue] = useState(0)

  useAnimationFrame(t => {
    if (value >= 1000) return
    setValue(data)
  })

  return {
    value: Math.min(value, 1000),
  }
}

type GaugeProps = {
  value: number
}

const START_ANGLE = 45
const END_ANGLE = 315

function Gauge({ value }: GaugeProps) {
  const gauge = useGauge({
    domain: [0, 1000],
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
  console.log('needle', needle.tip.cx, needle.tip.cy)

  const arcStroke = useMemo(() => {
    let color = ''
    if (value <= 250) {
      color = `green`
    } else if (value <= 500) {
      color = 'yellow'
    } else {
      color = 'red'
    }

    return `url(#${color}Gradient)`
  }, [value])

  return (
    <div>
      <svg className="w-full overflow-visible p-4" {...gauge.getSVGProps()}>
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
            const showText = asValue % 200 === 0

            return (
              <React.Fragment key={`tick-group-${angle}`}>
                <line
                  className={clsx([
                    'stroke-gray-300',
                    {
                      'stroke-green-300': asValue <= 200,
                      'stroke-yellow-300': asValue >= 600 && asValue <= 800,
                      'stroke-red-400': asValue >= 800,
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
    </div>
  )
}

export function GaugeChart({ data }: { data: number }) {
  const { value } = useGaugeChart(data)

  return (
    <MotionConfig transition={{ type: 'tween', ease: 'linear' }}>
      <Gauge value={value} />
    </MotionConfig>
  )
}
