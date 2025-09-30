import Link from 'next/link';

type FeatureLink = {
  href: string;
  label: string;
};

type FeatureCardProps = {
  title: string;
  description: string;
  links: FeatureLink[];
  icon?: string;
};

export function FeatureCard({ title, description, links, icon }: FeatureCardProps) {
  const [primaryLink, ...additionalLinks] = links;
  const hasMultipleLinks = additionalLinks.length > 0;
  const linkItems = primaryLink ? [primaryLink, ...additionalLinks] : additionalLinks;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-3">
        {icon ? <span className="mr-1" aria-hidden="true">{icon}</span> : null}
        {title}
      </h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {hasMultipleLinks ? (
        <div className="space-y-2">
          {linkItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-blue-600 hover:text-blue-800 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : primaryLink ? (
        <Link
          href={primaryLink.href}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {primaryLink.label}
        </Link>
      ) : null}
    </div>
  );
}
