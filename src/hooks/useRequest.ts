import { useState } from "react";
import axios from "axios";

interface UseRequestProps {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: any;
}

interface UseRequestReturn {
  sendRequest: (data?: any) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useRequest = ({
  url,
  method,
  body,
  headers,
}: UseRequestProps): UseRequestReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async (requestData?: any) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const config = {
        method,
        url,
        data: requestData || body,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await axios(config);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || "Request failed");
      throw err;
    }
  };

  return { sendRequest, loading, error };
};
