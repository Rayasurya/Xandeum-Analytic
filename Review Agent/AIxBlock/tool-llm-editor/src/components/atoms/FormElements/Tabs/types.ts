import { ReactNode } from "react"

// types.ts
export type TabItemProps = {
  label: string
  index: number
  isActive?: boolean
  onClick: (index: number) => void
  onRemove: () => void
  isPreview?: boolean
}

export type TabsProps = {
  children?: TabItemProps[]
}

export type TabPanelProps = {
  id: string
  children: ReactNode
  isPreview?: boolean
}
