interface FactItem {
  title: string;
  country: string;
  value: string;
}

export function DidYouKnow({ facts }: { facts: FactItem[] }) {
  return (
    <section className="did-you-know" aria-label="Did you know facts">
      <h2>Did You Know?</h2>
      <div className="dyk-grid">
        {facts.map((fact) => (
          <article key={fact.title} className="dyk-card">
            <p className="dyk-title">{fact.title}</p>
            <p className="dyk-country">{fact.country}</p>
            <p className="dyk-value">{fact.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
