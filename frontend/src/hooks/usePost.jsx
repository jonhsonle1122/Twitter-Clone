import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
const usePost = () => {
  const queryClient = useQueryClient();
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async (postId) => {
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async (POST_ENDPOINT) => {
      try {
        const res = await fetch(POST_ENDPOINT);
        // console.log(POST_ENDPOINT);

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });
  return { deletePost, isDeleting, posts, isLoading, refetch, isRefetching };
};
export default usePost;
