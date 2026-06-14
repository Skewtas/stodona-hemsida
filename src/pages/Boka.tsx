import { Helmet } from "../seo";
import { useEffect } from "react";

export default function Boka() {
  useEffect(() => {
    window.location.replace("https://boka.stodona.se");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Helmet>
        <title>Boka städning | Stodona</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <p>Skickar dig till bokningen...</p>
    </div>
  );
}
