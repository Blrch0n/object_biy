type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="paper mb-6 px-5 py-6 sm:px-8 sm:py-8">
      <h1 className="section-title text-2xl sm:text-4xl tracking-tight">
        {title}
      </h1>
      <p className="muted-copy mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">{description}</p>
    </header>
  );
}
