import { useEffect } from "react";

export default function BokaStadning() {
  useEffect(() => {
    const params = window.location.search;
    window.location.replace(`https://boka.stodona.se${params}`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Skickar dig till bokningen...</p>
    </div>
  );
}
