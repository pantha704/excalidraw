import { useState, useEffect } from "react";
import { WS_URL } from "../../app/config";

export const useSocket = () => {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(
      WS_URL +
        "?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOGViODk2NC0xNDg0LTRhNmMtOWQ5Yi0wOTRmYzFhYjNiNWMiLCJpYXQiOjE3NTE3OTQ0NTEsImV4cCI6MTc1MTc5ODA1MX0.y-Ern3SEExY1UgTb55mQFlcoHDjIwdA16qMBqw6Rb9U"
    );
    ws.onopen = () => {
      setLoading(false), setSocket(ws);
    };
  }, []);

  return {
    socket,
    loading,
  };
};
