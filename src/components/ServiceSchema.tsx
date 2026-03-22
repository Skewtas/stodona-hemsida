import { Helmet } from 'react-helmet-async';

interface ServiceSchemaProps {
  serviceName: string;
  serviceType: string;
  description: string;
  url: string;
  image?: string;
  areaServed?: string;
}

export default function ServiceSchema({
  serviceName,
  serviceType,
  description,
  url,
  image = 'https://stodona.se/stodona-stad.jpg',
  areaServed = 'Stockholm',
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    serviceType: serviceType,
    description: description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Stodona',
      image: 'https://stodona.se/stodona-logo.png',
      telephone: '010-178 01 50',
      email: 'info@stodona.se',
      url: 'https://stodona.se',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Stockholm',
        addressRegion: 'Stockholm',
        addressCountry: 'SE',
      },
      priceRange: '$$',
    },
    areaServed: {
      '@type': 'City',
      name: areaServed,
    },
    url: `https://stodona.se${url}`,
    image: image,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Hem',
        item: 'https://stodona.se',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: serviceName,
        item: `https://stodona.se${url}`,
      },
    ],
  };

  return (
    <Helmet>
      <title>{serviceName} Stockholm | Stodona – RUT-avdrag 50%</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`https://stodona.se${url}`} />
      <meta property="og:title" content={`${serviceName} Stockholm | Stodona`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://stodona.se${url}`} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="sv_SE" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}
