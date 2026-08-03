type SectionTitleProps = {
    title: string;
    subtitle?: string;
  };
  
  export default function SectionTitle({
    title,
    subtitle,
  }: SectionTitleProps) {
    return (
      <div className="text-center py-12">
        <h2 className="text-4xl font-bold">{title}</h2>
  
        {subtitle && (
          <p className="mt-3 text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    );
  }