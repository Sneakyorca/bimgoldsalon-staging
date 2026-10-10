const SectionTitle = ({
  plain,
  accent,
  className = "",
}: {
  plain: string;
  accent: string;
  className?: string;
}) => (
  <div className={className}>
    <h2 className="text-3xl font-semibold lg:text-4xl">
      {plain} <span className="text-primary">{accent}</span>
    </h2>
    <div className="mt-2 h-0.5 w-10 bg-primary" />
  </div>
);

export default SectionTitle;
