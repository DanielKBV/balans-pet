/** Landing block heading: accent kicker, big title, optional lead. */
export function SectionHeading({ id, kicker, title, text }: { id: string; kicker: string; title: string; text?: string }) {
  return (
    <div className="flex max-w-180 flex-col gap-4">
      <p className="font-medium text-primary-text">{kicker}</p>
      <h2 id={id} className="text-section">
        {title}
      </h2>
      {text && <p className="text-muted-foreground text-pretty">{text}</p>}
    </div>
  )
}
