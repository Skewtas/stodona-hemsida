import { Link } from "react-router-dom";

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
      <p className="text-xl text-text-secondary mb-10 max-w-2xl">
        {description}
      </p>
      <Link to="/" className="btn-primary">
        Tillbaka till startsidan
      </Link>
    </div>
  );
}
