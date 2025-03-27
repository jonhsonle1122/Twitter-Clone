import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchAuthUser = async () => {
  const res = await fetch("/api/auth/me");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

const useAuth = () => {
  const queryClient = useQueryClient();

  const {
    data: authUser,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchAuthUser,
    retry: false, // Không thử lại nếu lỗi
    staleTime: 1000 * 60 * 5, // Cache dữ liệu trong 5 phút
  });

  // Bắt buộc fetch lại từ API
  const refreshAuth = () => {
    queryClient.invalidateQueries(["authUser"]);
  };

  // Xóa cache ngay lập tức
  const logout = () => {
    queryClient.setQueryData(["authUser"], null);
  };

  return { authUser, isLoading, error, refetch, logout, refreshAuth };
};

export default useAuth;
