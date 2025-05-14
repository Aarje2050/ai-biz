"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepperProps {
  steps: {
    id: string
    title: string
    description: string
    isComplete: boolean
  }[]
  currentStep: string
  onStepClick: (stepId: string) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-[15px] h-0.5 w-full bg-gray-200">
        <div
          className="absolute h-full bg-purple-600 transition-all duration-500"
          style={{
            width: `${(steps.filter(step => step.isComplete).length / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = step.isComplete

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={cn(
                "flex flex-col items-center",
                (isCompleted || isActive) ? "cursor-pointer" : "cursor-not-allowed"
              )}
              disabled={!isCompleted && !isActive}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-200",
                  isActive
                    ? "border-purple-600 bg-white text-purple-600"
                    : isCompleted
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-300 bg-white text-gray-300"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <div className="mt-2 flex flex-col items-center">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive
                      ? "text-purple-600"
                      : isCompleted
                      ? "text-gray-900"
                      : "text-gray-300"
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    isActive
                      ? "text-purple-600"
                      : isCompleted
                      ? "text-gray-600"
                      : "text-gray-300"
                  )}
                >
                  {step.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}