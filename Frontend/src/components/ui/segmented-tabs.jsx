import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function SegmentedTabs({ sections = [], selectedId, defaultSelectedId, onSelectedIdChange, className }) {
  return (
    <Tabs
      value={selectedId}
      defaultValue={defaultSelectedId ?? sections[0]?.key}
      onValueChange={onSelectedIdChange}
      className={className}
    >
      <div className="mb-4 w-full overflow-x-auto pb-1">
        <TabsList className="min-w-max justify-start">
          {sections.map((section) => (
            <TabsTrigger key={section.key} value={section.key} disabled={section.disabled}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {sections.map((section) => (
        <TabsContent key={section.key} value={section.key}>
          {section.children}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export { SegmentedTabs }
