import { Helmet } from "../seo";
import { useEffect } from "react";
import { bookingUrl } from "../utils/bookingUrl";

export default function Boka() {
  useEffect(() => {
    window.location.replace(bookingUrl());
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
