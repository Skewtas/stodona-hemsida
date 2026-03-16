import { useEffect } from "react";

export default function Boka() {
  useEffect(() => {
    window.location.replace("https://boka.stodona.se");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Skickar dig till bokningen...</p>
    </div>
  );
}
