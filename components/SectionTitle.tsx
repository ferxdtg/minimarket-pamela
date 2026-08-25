type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export default function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    // 🔥 INYECCIÓN: relative z-20 y drop-shadow para que el fondo no lo tape
    <div className="text-center py-12 relative z-20">
      <h2 className="text-4xl font-black text-slate-900 drop-shadow-md tracking-tight">{title}</h2>

      {subtitle && (
        <p className="mt-3 text-gray-700 font-bold drop-shadow-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}